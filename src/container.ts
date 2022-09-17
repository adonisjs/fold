import {
  BindingResolver,
  Bindings,
  BindingValues,
  Constructor,
  ExtractFunctions,
  Make,
} from './types.js'
import { ContainerResolver } from './resolver.js'

const toString = Function.prototype.toString
function isClass<T>(value: any): value is Constructor<T> {
  return typeof value === 'function' && /^class\s/.test(toString.call(value))
}

/**
 * The container class exposes the API to register bindings, values
 * and resolve them.
 *
 * Known bindings types can be defined at the time of the constructing
 * the container.
 *
 * ```ts
 * new Container<{ 'route': Route, encryption: Encryption }>()
 * ```
 */
export class Container<KnownBindings extends Record<any, any>> {
  /**
   * Registered bindings. Singleton and normal bindings, both are
   * registered inside the bindings map
   */
  #bindings: Bindings = new Map()

  /**
   * Registered bindings as values. The values are preferred over the bindings.
   */
  #bindingValues: BindingValues = new Map()

  /**
   * Create a container resolver to resolve bindings, or make classes.
   */
  createResolver() {
    return new ContainerResolver(this.#bindings, this.#bindingValues)
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
  make<Binding extends keyof KnownBindings>(
    binding: Binding,
    runtimeValues?: any[]
  ): Promise<Binding extends string | symbol ? KnownBindings[Binding] : Make<Binding>>
  make<Binding>(binding: Binding, runtimeValues?: any[]): Promise<Make<Binding>>
  make<Binding>(binding: Binding, runtimeValues?: any[]): Promise<Make<Binding>> {
    return this.createResolver().make<Binding>(binding, runtimeValues)
  }

  /**
   * Call a method on an object by injecting its dependencies
   */
  async call<Value extends Record<any, any>, Method extends ExtractFunctions<Value>>(
    value: Value,
    method: Method,
    runtimeValues?: any[]
  ): Promise<ReturnType<Value[Method]>> {
    return this.createResolver().call(value, method, runtimeValues)
  }

  /**
   * Register a binding with the resolver factory function.
   *
   * ```ts
   * container.bind(Route, () => new Route())
   * ```
   */
  bind<Binding extends keyof KnownBindings>(
    /**
     * Need to narrow down the "Binding" for the case where "KnownBindings" are <any, any>
     */
    binding: Binding extends string | symbol ? Binding : never,
    resolver: BindingResolver<KnownBindings, KnownBindings[Binding]>
  ): void
  bind<Binding extends Constructor<any>>(
    binding: Binding,
    resolver: BindingResolver<KnownBindings, InstanceType<Binding>>
  ): void
  bind<Binding>(
    binding: Binding,
    resolver: BindingResolver<
      KnownBindings,
      Binding extends Constructor<infer A>
        ? A
        : Binding extends keyof KnownBindings
        ? KnownBindings[Binding]
        : never
    >
  ): void {
    if (typeof binding !== 'string' && typeof binding !== 'symbol' && !isClass(binding)) {
      throw new Error(`A binding name either be a string, symbol or class constructor`)
    }

    this.#bindings.set(binding, { resolver, isSingleton: false })
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

  /**
   * Register a binding as a singleton with
   * the resolver factory function.
   *
   * ```ts
   * container.singleton(Route, () => new Route())
   * ```
   */
  singleton<Binding extends keyof KnownBindings>(
    /**
     * Need to narrow down the "Binding" for the case where "KnownBindings" are <any, any>
     */
    binding: Binding extends string | symbol ? Binding : never,
    resolver: BindingResolver<KnownBindings, KnownBindings[Binding]>
  ): void
  singleton<Binding extends Constructor<any>>(
    binding: Binding,
    resolver: BindingResolver<KnownBindings, InstanceType<Binding>>
  ): void
  singleton<Binding>(
    binding: Binding,
    resolver: BindingResolver<
      KnownBindings,
      Binding extends Constructor<infer A>
        ? A
        : Binding extends keyof KnownBindings
        ? KnownBindings[Binding]
        : never
    >
  ): void {
    if (typeof binding !== 'string' && typeof binding !== 'symbol' && !isClass(binding)) {
      throw new Error(`A binding name either be a string, symbol or class constructor`)
    }

    this.#bindings.set(binding, { resolver, isSingleton: true })
  }
}
