/*
 * @adonisjs/fold
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { inspect } from 'node:util'
import { RuntimeException } from '@poppinss/utils'

import type {
  Make,
  Hooks,
  Swaps,
  Bindings,
  Constructor,
  BindingValues,
  ExtractFunctions,
  ContainerOptions,
  InspectableConstructor,
  BindingResolver,
  AbstractConstructor,
  BindingKey,
} from './types.js'
import debug from './debug.js'
import { isClass } from './helpers.js'
import { containerProvider } from './provider.js'
import { InvalidBindingKeyException } from './exceptions/invalid_binding_key_exception.js'

/**
 * Container resolver exposes the APIs to resolve bindings. You can think
 * of resolver as an isolated container instance, with only the APIs
 * to resolve bindings.
 *
 * ```ts
 * const container = new Container()
 * const resolver = container.createResolver()
 *
 * await resolver.make(BINDING_NAME)
 * await resolver.make(CLASS_CONSTRUCTOR)
 * ```
 */
export class ContainerResolver<KnownBindings extends Record<any, any>> {
  /**
   * Pre-registered contextual bindings. They are shared between the container
   * and resolver.
   *
   * We do not mutate this property within the resolver
   */
  #containerContextualBindings: Map<Constructor<any>, Bindings>

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
   * Pre-registered swaps for bindings. They are shared between
   * the container and resolver.
   *
   * We do not mutate this property within the resolver
   */
  #containerSwaps: Swaps

  /**
   * Reference to the container hooks
   */
  #containerHooks: Hooks

  /**
   * Binding values local to the resolver
   */
  #bindingValues: BindingValues = new Map()

  /**
   * Container options
   */
  #options: ContainerOptions

  constructor(
    container: {
      bindings: Bindings
      bindingValues: BindingValues
      swaps: Swaps
      hooks: Hooks
      contextualBindings: Map<Constructor<any>, Bindings>
    },
    options: ContainerOptions
  ) {
    this.#containerBindings = container.bindings
    this.#containerBindingValues = container.bindingValues
    this.#containerSwaps = container.swaps
    this.#containerHooks = container.hooks
    this.#containerContextualBindings = container.contextualBindings
    this.#options = options
  }

  /**
   * Raises exception when uanble to construct a data type using
   * container.
   */
  #disallowUnsupportValues(parent: any, binding: any): never {
    if (parent) {
      throw new RuntimeException(
        `Cannot inject "${inspect(binding)}" in "[class: ${
          parent.name
        }]". The value cannot be constructed`
      )
    }

    throw new RuntimeException(`Cannot construct value "${inspect(binding)}" using container`)
  }

  /**
   * Returns the provider for the class constructor
   */
  #getBindingProvider(binding: InspectableConstructor) {
    return binding.containerProvider
  }

  /**
   * Returns the binding resolver for a parent and a binding. Returns
   * undefined when no contextual binding exists
   */
  #getBindingResolver(
    parent: Constructor<any>,
    binding: string | symbol | AbstractConstructor<any>
  ): BindingResolver<KnownBindings, any> | undefined {
    const parentBindings = this.#containerContextualBindings.get(parent)
    if (!parentBindings) {
      return
    }

    const bindingResolver = parentBindings.get(binding)
    if (!bindingResolver) {
      return
    }

    return bindingResolver.resolver
  }

  /**
   * Notify emitter
   */
  #emit(binding: BindingKey, value: any) {
    if (!this.#options.emitter) {
      return
    }
    this.#options.emitter.emit('container:resolve', { binding, value })
  }

  /**
   * Execute hooks for a given binding
   */
  async #execHooks(binding: BindingKey, value: any) {
    const callbacks = this.#containerHooks.get(binding)
    if (!callbacks || callbacks.size === 0) {
      return
    }

    for (let callback of callbacks) {
      await callback(value, this)
    }
  }

  /**
   * Find if the resolver has a binding registered using the
   * "bind", the "singleton", or the "bindValue" methods.
   */
  hasBinding<Binding extends keyof KnownBindings>(binding: Binding): boolean
  hasBinding(binding: BindingKey): boolean {
    return (
      this.#bindingValues.has(binding) ||
      this.#containerBindingValues.has(binding) ||
      this.#containerBindings.has(binding)
    )
  }

  /**
   * Find if the resolver has all the bindings registered using the
   * "bind", the "singleton", or the "bindValue" methods.
   */
  hasAllBindings<Binding extends keyof KnownBindings>(bindings: Binding[]): boolean
  hasAllBindings(bindings: BindingKey[]): boolean {
    return bindings.every((binding) => this.hasBinding(binding))
  }

  /**
   * Resolves binding in context of a parent. The method is same as
   * the "make" method, but instead takes a parent class
   * constructor.
   */
  async resolveFor<Binding>(
    parent: unknown,
    binding: Binding,
    runtimeValues?: any[]
  ): Promise<Make<Binding>> {
    const isAClass = isClass<Binding>(binding)

    /**
     * Raise exception when the binding is not a string, a class constructor
     * or a symbol.
     */
    if (typeof binding !== 'string' && typeof binding !== 'symbol' && !isAClass) {
      this.#disallowUnsupportValues(parent, binding)
    }

    /**
     * Entertain swaps with highest priority.
     */
    if (this.#containerSwaps.has(binding)) {
      const resolver = this.#containerSwaps.get(binding)!
      const value = await resolver(this, runtimeValues)

      if (debug.enabled) {
        debug('resolved swap for binding %O, resolved value :%O', binding, value)
      }

      await this.#execHooks(binding, value)
      this.#emit(binding, value)
      return value
    }

    /**
     * Resolving contextual binding. Contextual bindings have more
     * priority over bindings or binding values.
     */
    const contextualResolver = isClass(parent)
      ? this.#getBindingResolver(parent, binding)
      : undefined

    if (contextualResolver) {
      const value = await contextualResolver(this, runtimeValues)

      if (debug.enabled) {
        debug('resolved using contextual resolver binding %O, resolved value :%O', binding, value)
      }

      await this.#execHooks(binding, value)
      this.#emit(binding, value)

      return value
    }

    /**
     * First priority is given to the RESOLVER binding values
     */
    if (this.#bindingValues.has(binding)) {
      const value = this.#bindingValues.get(binding)

      if (debug.enabled) {
        debug('resolved from resolver values %O, resolved value :%O', binding, value)
      }

      this.#emit(binding, value)
      return value
    }

    /**
     * Next priority is given to the CONTAINER binding values
     */
    if (this.#containerBindingValues.has(binding)) {
      const value = this.#containerBindingValues.get(binding)

      if (debug.enabled) {
        debug('resolved from container values %O, resolved value :%O', binding, value)
      }

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

      if (debug.enabled) {
        debug(
          'resolved %s %O, resolved value :%O',
          isSingleton ? 'singleton' : 'binding',
          binding,
          value
        )
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
      let dependencies: any[] = []

      const bindingProvider = this.#getBindingProvider(binding)
      if (bindingProvider) {
        dependencies = await bindingProvider(
          binding,
          '_constructor',
          this,
          containerProvider,
          runtimeValues
        )
      } else {
        dependencies = await containerProvider(binding, '_constructor', this, runtimeValues)
      }

      const value = new binding(...dependencies) as Promise<Make<Binding>>

      if (debug.enabled) {
        debug('constructed class %O, resolved value :%O', binding, value)
      }

      await this.#execHooks(binding, value)
      this.#emit(binding, value)

      return value
    }

    throw new RuntimeException(`Cannot resolve binding "${String(binding)}" from the container`)
  }

  /**
   * Resolves the binding or constructor a class instance as follows.
   *
   * - Resolve the binding from the values (if registered)
   * - Resolve the binding from the bindings (if registered)
   * - If binding is a class, then create a instance of it. The constructor
   *   dependencies are further resolved as well.
   * - All other values are returned as it is.
   *
   * ```ts
   * await resolver.make('route')
   * await resolver.make(Database)
   * ```
   */
  make<Binding extends keyof KnownBindings>(
    binding: Binding,
    runtimeValues?: any[]
  ): Promise<Binding extends string | symbol ? KnownBindings[Binding] : Make<Binding>>
  make<Binding>(binding: Binding, runtimeValues?: any[]): Promise<Make<Binding>>
  async make<Binding>(binding: Binding, runtimeValues?: any[]): Promise<Make<Binding>> {
    return this.resolveFor(null, binding, runtimeValues)
  }

  /**
   * Call a method on an object by injecting its dependencies. The method
   * dependencies are resolved in the same manner as a class constructor
   * dependencies.
   *
   * ```ts
   * await resolver.call(await resolver.make(UsersController), 'index')
   * ```
   */
  async call<Value extends Record<any, any>, Method extends ExtractFunctions<Value>>(
    value: Value,
    method: Method,
    runtimeValues?: any[]
  ): Promise<ReturnType<Value[Method]>> {
    if (typeof value[method] !== 'function') {
      throw new RuntimeException(`Missing method "${String(method)}" on "${inspect(value)}"`)
    }

    if (debug.enabled) {
      debug('calling method %s, on value :%O', method, value)
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
  bindValue<Binding extends AbstractConstructor<any>>(
    binding: Binding,
    value: InstanceType<Binding>
  ): void
  bindValue<Binding>(
    binding: Binding,
    value: Binding extends AbstractConstructor<infer A>
      ? A
      : Binding extends keyof KnownBindings
      ? KnownBindings[Binding]
      : never
  ): void {
    if (typeof binding !== 'string' && typeof binding !== 'symbol' && !isClass(binding)) {
      throw new InvalidBindingKeyException()
    }

    debug('adding value to resolver "%O"', binding)
    this.#bindingValues.set(binding, value)
  }
}
