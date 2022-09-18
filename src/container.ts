/*
 * @adonisjs/fold
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import type {
  Make,
  Hooks,
  Bindings,
  BindingKey,
  Constructor,
  HookCallback,
  BindingValues,
  BindingResolver,
  ExtractFunctions,
  ContainerOptions,
} from './types.js'
import { isClass } from './helpers.js'
import { ContainerResolver } from './resolver.js'

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
 *
 * You can resolve bindings and construct classes as follows
 *
 * ```ts
 * await container.make(BINDING_NAME)
 * await container.make(CLASS_CONSTRUCTOR)
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
   * Registered hooks.
   */
  #hooks: Hooks = new Map()

  /**
   * Container options
   */
  #options: ContainerOptions

  constructor(options?: ContainerOptions) {
    this.#options = options || {}
  }

  /**
   * Create a container resolver to resolve bindings, or make classes.
   *
   * ```ts
   * const resolver = container.createResolver()
   * await resolver.make(CLASS_CONSTRUCTOR)
   * ```
   *
   * Bind values with the resolver. Resolver values are isolated from the
   * container.
   *
   * ```ts
   * resolver.bindValue(HttpContext, new HttpContext())
   * await resolver.make(UsersController)
   * ```
   */
  createResolver() {
    return new ContainerResolver(this.#bindings, this.#bindingValues, this.#hooks, this.#options)
  }

  /**
   * Find if the container has a binding registered using the
   * "bind", the "singleton", or the "bindValue" methods.
   */
  hasBinding<Binding extends keyof KnownBindings>(binding: Binding): boolean
  hasBinding(binding: string | symbol | Constructor<any>): boolean {
    return this.#bindingValues.has(binding) || this.#bindings.has(binding)
  }

  /**
   * Find if the container has all the bindings registered using the
   * "bind", the "singleton", or the "bindValue" methods.
   */
  hasAllBindings<Binding extends keyof KnownBindings>(bindings: Binding[]): boolean
  hasAllBindings(bindings: (string | symbol | Constructor<any>)[]): boolean {
    return bindings.every((binding) => this.hasBinding(binding))
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
   * await container.make('route')
   * await container.make(Database)
   * ```
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
   * Call a method on an object by injecting its dependencies. The method
   * dependencies are resolved in the same manner as a class constructor
   * dependencies.
   *
   * ```ts
   * await container.call(await container.make(UsersController), 'index')
   * ```
   */
  call<Value extends Record<any, any>, Method extends ExtractFunctions<Value>>(
    value: Value,
    method: Method,
    runtimeValues?: any[]
  ): Promise<ReturnType<Value[Method]>> {
    return this.createResolver().call(value, method, runtimeValues)
  }

  /**
   * Register a binding inside the container. The method receives a
   * key-value pair.
   *
   * - Key can be a string, symbol or a constructor.
   * - The value is always a factory function to construct the dependency.
   *
   * ```ts
   * container.bind('route', () => new Route())
   * await container.make('route')
   *
   * container.bind(Route, () => new Route())
   * await container.make(Route)
   *
   * const routeSymbol = Symbol('route')
   * container.bind(routeSymbol, () => new Route())
   * await container.make(routeSymbol)
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
      throw new Error(
        `Invalid binding key type. Only "string", "symbol" and "class constructor" is accepted`
      )
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
      throw new Error(
        `Invalid binding key type. Only "string", "symbol" and "class constructor" is accepted`
      )
    }

    this.#bindingValues.set(binding, value)
  }

  /**
   * Register a binding as a single. The singleton method is same
   * as the bind method, but the factory function is invoked
   * only once.
   *
   * ```ts
   * container.singleton('route', () => new Route())
   * await container.make('route')
   *
   * container.singleton(Route, () => new Route())
   * await container.make(Route)
   *
   * const routeSymbol = Symbol('route')
   * container.singleton(routeSymbol, () => new Route())
   * await container.make(routeSymbol)
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
      throw new Error(
        `Invalid binding key type. Only "string", "symbol" and "class constructor" is accepted`
      )
    }

    this.#bindings.set(binding, { resolver, isSingleton: true })
  }

  /**
   * Define hooks to be executed after a binding has been resolved
   * from the container.
   *
   * The hooks are executed for
   *
   * - Bindings
   * - Only once for singletons
   * - And class constructor
   *
   * In other words, the hooks are not executed for direct values registered
   * with the container
   */
  resolving<Binding extends keyof KnownBindings>(
    binding: Binding extends string | symbol ? Binding : never,
    callback: HookCallback<KnownBindings, KnownBindings[Binding]>
  ): void
  resolving<Binding extends Constructor<any>>(
    binding: Binding,
    callback: HookCallback<KnownBindings, InstanceType<Binding>>
  ): void
  resolving<Binding extends BindingKey>(
    binding: Binding,
    callback: Binding extends Constructor<infer A>
      ? HookCallback<KnownBindings, A>
      : Binding extends keyof KnownBindings
      ? HookCallback<KnownBindings, KnownBindings[Binding]>
      : never
  ): void {
    if (!this.#hooks.has(binding)) {
      this.#hooks.set(binding, new Set())
    }

    const callbacks = this.#hooks.get(binding)!
    callbacks.add(callback)
  }
}
