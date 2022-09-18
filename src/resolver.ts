import { containerProvider } from './provider.js'
import type {
  Make,
  Hooks,
  Bindings,
  Constructor,
  BindingValues,
  ExtractFunctions,
  ContainerOptions,
} from './types.js'

const toString = Function.prototype.toString
function isClass<T>(value: any): value is Constructor<T> {
  return typeof value === 'function' && /^class\s/.test(toString.call(value))
}

/**
 * Container resolver exposes the APIs to resolve bindings.
 */
export class ContainerResolver<KnownBindings extends Record<any, any>> {
  /**
   * Pre-registered bindings. They are shared between the container
   * and resolver.
   *
   * We do not mutate this property within the resolver
   */
  #containerBindings: Bindings

  /**
   * Pre-registered bindings. They are shared between the container
   * and resolver.
   *
   * We mutate this property within the resolver to set singleton
   * cached values
   */
  #containerBindingValues: BindingValues

  /**
   * Reference to the container hooks
   */
  #containerHooks: Hooks = new Map()

  /**
   * Binding values local to the resolver
   */
  #bindingValues: BindingValues = new Map()

  /**
   * Container options
   */
  #options: ContainerOptions

  constructor(
    bindings: Bindings,
    bindingValues: BindingValues,
    hooks: Hooks,
    options: ContainerOptions
  ) {
    this.#containerBindings = bindings
    this.#containerBindingValues = bindingValues
    this.#containerHooks = hooks
    this.#options = options
  }

  /**
   * Notify emitter
   */
  #emit(binding: string | symbol | Constructor<any>, value: any) {
    if (!this.#options.emitter) {
      return
    }

    this.#options.emitter.emit('container:resolve', { binding, value })
  }

  /**
   * Execute hooks for a given binding
   */
  async #execHooks(binding: string | symbol | Constructor<any>, value: any) {
    const callbacks = this.#containerHooks.get(binding)
    if (!callbacks || callbacks.size === 0) {
      return
    }

    for (let callback of callbacks) {
      await callback(value, this)
    }
  }

  /**
   * Resolve the binding as follows.
   *
   * - Resolve the binding from the values (if registered)
   * - Resolve the binding from the bindings (if registered)
   * - If binding is a class, then create a instance of it. The constructor
   *   dependencies are further resolved as well.
   * - All other values are returned as it is.
   */
  make<Binding extends keyof string | symbol>(
    binding: Binding,
    runtimeValues?: any[]
  ): Promise<Binding extends keyof KnownBindings ? KnownBindings[Binding] : Binding>
  make<Binding>(binding: Binding, runtimeValues?: any[]): Promise<Make<Binding>>
  async make<Binding>(binding: Binding, runtimeValues?: any[]): Promise<Make<Binding>> {
    const isAClass = isClass<Binding>(binding)

    /**
     * Return binding as it is, when the binding type is not a string, symbol
     * or a class constructor.
     */
    if (typeof binding !== 'string' && typeof binding !== 'symbol' && !isAClass) {
      return binding as Promise<Make<Binding>>
    }

    /**
     * First priority is given to the RESOLVER binding values
     */
    if (this.#bindingValues.has(binding)) {
      const value = this.#bindingValues.get(binding)
      this.#emit(binding, value)
      return value
    }

    /**
     * Next priority is given to the CONTAINER binding values
     */
    if (this.#containerBindingValues.has(binding)) {
      const value = this.#containerBindingValues.get(binding)
      this.#emit(binding, value)
      return value
    }

    /**
     * Followed by the CONTAINER bindings
     */
    if (this.#containerBindings.has(binding)) {
      const { resolver, isSingleton } = this.#containerBindings.get(binding)!
      const value = await resolver(this, runtimeValues)

      /**
       * Caching singletons
       */
      if (isSingleton) {
        this.#containerBindingValues.set(binding, value)
      }

      await this.#execHooks(binding, value)
      this.#emit(binding, value)
      return value
    }

    /**
     * Create an instance of the class with its constructor
     * dependencies.
     */
    if (isAClass) {
      const dependencies = await containerProvider(binding, 'constructor', this, runtimeValues)
      const value = new binding(...dependencies) as Promise<Make<Binding>>

      await this.#execHooks(binding, value)
      this.#emit(binding, value)

      return value
    }

    return binding as unknown as Promise<Make<Binding>>
  }

  /**
   * Call a method on an object by injecting its dependencies
   */
  async call<Value extends Record<any, any>, Method extends ExtractFunctions<Value>>(
    value: Value,
    method: Method,
    runtimeValues?: any[]
  ): Promise<ReturnType<Value[Method]>> {
    if (typeof value[method] !== 'function') {
      throw new Error(`method "${String(method)}" does not exists on "${value.constructor.name}"`)
    }

    const dependencies = await containerProvider(value.constructor, method, this, runtimeValues)
    return value[method](...dependencies)
  }

  /**
   * Register a binding as a value
   *
   * ```ts
   * container.bindValue(Route, new Route())
   * ```
   */
  bindValue<Binding extends keyof KnownBindings>(
    /**
     * Need to narrow down the "Binding" for the case where "KnownBindings" are <any, any>
     */
    binding: Binding extends string | symbol ? Binding : never,
    value: KnownBindings[Binding]
  ): void
  bindValue<Binding extends Constructor<any>>(binding: Binding, value: InstanceType<Binding>): void
  bindValue<Binding>(
    binding: Binding,
    value: Binding extends Constructor<infer A>
      ? A
      : Binding extends keyof KnownBindings
      ? KnownBindings[Binding]
      : never
  ): void {
    if (typeof binding !== 'string' && typeof binding !== 'symbol' && !isClass(binding)) {
      throw new Error(`A binding name either be a string, symbol or class constructor`)
    }

    this.#bindingValues.set(binding, value)
  }
}
