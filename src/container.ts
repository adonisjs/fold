/*
 * @adonisjs/fold
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { inspect } from 'node:util'
import { InvalidArgumentsException } from '@poppinss/utils/exception'
import type { AbstractConstructor, Constructor, ExtractFunctions } from '@poppinss/utils/types'

import type {
  Make,
  Hooks,
  Swaps,
  Bindings,
  BindingKey,
  ErrorCreator,
  HookCallback,
  BindingValues,
  BindingResolver,
  ContainerOptions,
  ContextualBindings,
} from './types.ts'

import debug from './debug.ts'
import { enqueue, isClass } from './utils.ts'
import { ContainerResolver } from './resolver.ts'
import { ContextBindingsBuilder } from './contextual_bindings_builder.ts'

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
   * A set of defined aliases for the bindings
   */
  #aliases: Map<Partial<keyof KnownBindings>, keyof KnownBindings | AbstractConstructor<any>> =
    new Map()

  /**
   * Contextual bindings are same as binding, but instead defined
   * for a parent class constructor.
   *
   * The contextual bindings can only be registered for class constructors, because
   * that is what gets injected to the class.
   */
  #contextualBindings: Map<Constructor<any>, ContextualBindings> = new Map()

  /**
   * A collection of bindings with registered swapped implementations. Swaps can only
   * be define for a class, because the goal is swap the dependency tree defined
   * using the Inject decorator and inject decorator does not take anything
   * other than a class.
   */
  #swaps: Swaps = new Map()

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

  /**
   * Initialize the container with optional configuration
   *
   * @param options - Optional container configuration including event emitter
   *
   * @example
   * ```ts
   * const container = new Container()
   * ```
   *
   * @example
   * ```ts
   * const container = new Container<{
   *   route: Route
   *   encryption: Encryption
   * }>({ emitter: eventEmitter })
   * ```
   */
  constructor(options?: ContainerOptions) {
    this.#options = options || {}
  }

  /**
   * Define an emitter instance to use for container events
   *
   * @param emitter - Event emitter instance that implements emit method
   *
   * @example
   * ```ts
   * const container = new Container()
   * container.useEmitter(eventEmitter)
   * ```
   */
  useEmitter(emitter: Exclude<ContainerOptions['emitter'], undefined>) {
    this.#options.emitter = emitter
    return this
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
   *
   * @returns A new container resolver instance
   */
  createResolver() {
    return new ContainerResolver<KnownBindings>(
      {
        bindings: this.#bindings,
        bindingValues: this.#bindingValues,
        swaps: this.#swaps,
        hooks: this.#hooks,
        aliases: this.#aliases,
        contextualBindings: this.#contextualBindings,
      },
      this.#options
    )
  }

  /**
   * Find if the container has a binding registered using the
   * "bind", the "singleton", or the "bindValue" methods.
   *
   * @param binding - The binding key to check for
   *
   * @example
   * ```ts
   * container.hasBinding('route')
   * container.hasBinding(Route)
   * ```
   */
  hasBinding<Binding extends keyof KnownBindings>(binding: Binding): boolean
  hasBinding(binding: BindingKey): boolean
  hasBinding(binding: BindingKey): boolean {
    return (
      this.#aliases.has(binding) || this.#bindingValues.has(binding) || this.#bindings.has(binding)
    )
  }

  /**
   * Find if the container has all the bindings registered using the
   * "bind", the "singleton", or the "bindValue" methods.
   *
   * @param bindings - Array of binding keys to check for
   *
   * @example
   * ```ts
   * container.hasAllBindings(['route', 'encryption'])
   * container.hasAllBindings([Route, Encryption])
   * ```
   */
  hasAllBindings<Binding extends keyof KnownBindings>(bindings: Binding[]): boolean
  hasAllBindings(binding: BindingKey[]): boolean
  hasAllBindings(bindings: BindingKey[]): boolean {
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
   * @param binding - The binding key or class constructor to resolve
   * @param runtimeValues - Optional array of runtime values for constructor dependencies
   * @param createError - Optional custom error creator function
   *
   * @example
   * ```ts
   * await container.make('route')
   * await container.make(Database)
   * await container.make(UsersController, [request, response])
   * ```
   */
  make<Binding extends keyof KnownBindings>(
    binding: Binding,
    runtimeValues?: any[],
    createError?: ErrorCreator
  ): Promise<Binding extends string | symbol ? KnownBindings[Binding] : Make<Binding>>
  make<Binding>(
    binding: Binding,
    runtimeValues?: any[],
    createError?: ErrorCreator
  ): Promise<Make<Binding>>
  make<Binding>(
    binding: Binding,
    runtimeValues?: any[],
    createError?: ErrorCreator
  ): Promise<Make<Binding>> {
    return this.createResolver().make<Binding>(binding, runtimeValues, createError)
  }

  /**
   * Call a method on an object by injecting its dependencies. The method
   * dependencies are resolved in the same manner as a class constructor
   * dependencies.
   *
   * @param value - The object instance containing the method
   * @param method - The method name to call
   * @param runtimeValues - Optional array of runtime values for method dependencies
   * @param createError - Optional custom error creator function
   *
   * @example
   * ```ts
   * const controller = await container.make(UsersController)
   * await container.call(controller, 'index')
   * ```
   */
  call<Value extends Record<any, any>, Method extends ExtractFunctions<Value>>(
    value: Value,
    method: Method,
    runtimeValues?: any[],
    createError?: ErrorCreator
  ): Promise<ReturnType<Value[Method]>> {
    return this.createResolver().call(value, method, runtimeValues, createError)
  }

  /**
   * Register an alias for a binding. The value can be a reference
   * to an existing binding or to a class constructor that will
   * instantiate to the same value as the alias.
   *
   * @param alias - The alias name (must be string or symbol)
   * @param value - The constructor or binding key this alias points to
   *
   * @example
   * ```ts
   * container.alias('db', Database)
   * await container.make('db') // returns Database instance
   * ```
   */
  alias<Alias extends keyof KnownBindings>(
    /**
     * An alias must always be defined as a string or a symbol. Classes cannot be
     * aliases
     */
    alias: Alias extends string | symbol ? Alias : never,

    /**
     * The value should either be the constructor point to the alias value
     * or reference to binding that has the same value as the alias
     */
    value:
      | AbstractConstructor<KnownBindings[Alias]>
      | Exclude<
          {
            [K in keyof KnownBindings]: KnownBindings[K] extends KnownBindings[Alias] ? K : never
          }[keyof KnownBindings],
          Alias
        >
  ): void {
    if (typeof alias !== 'string' && typeof alias !== 'symbol') {
      throw new InvalidArgumentsException(
        'The container alias key must be of type "string" or "symbol"'
      )
    }

    this.#aliases.set(alias, value)
  }

  /**
   * Register a binding inside the container. The method receives a
   * key-value pair.
   *
   * - Key can be a string, symbol or a constructor.
   * - The value is always a factory function to construct the dependency.
   *
   * @param binding - The binding key (string, symbol, or class constructor)
   * @param resolver - Factory function that resolves the binding value
   *
   * @example
   * ```ts
   * container.bind('route', () => new Route())
   * await container.make('route')
   * ```
   *
   * @example
   * ```ts
   * container.bind(Route, () => new Route())
   * await container.make(Route)
   * ```
   *
   * @example
   * ```ts
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
  bind<Binding extends AbstractConstructor<any>>(
    binding: Binding,
    resolver: BindingResolver<KnownBindings, InstanceType<Binding>>
  ): void
  bind<Binding>(
    binding: Binding,
    resolver: BindingResolver<
      KnownBindings,
      Binding extends AbstractConstructor<infer A>
        ? A
        : Binding extends keyof KnownBindings
          ? KnownBindings[Binding]
          : never
    >
  ): void {
    if (typeof binding !== 'string' && typeof binding !== 'symbol' && !isClass(binding)) {
      throw new InvalidArgumentsException(
        'The container binding key must be of type "string", "symbol", or a "class constructor"'
      )
    }

    debug('adding binding to container "%O"', binding)
    this.#bindings.set(binding, { resolver, isSingleton: false })
  }

  /**
   * Register a binding as a value. Unlike bind() and singleton(), this
   * method accepts the resolved value directly instead of a factory function.
   *
   * @param binding - The binding key (string, symbol, or class constructor)
   * @param value - The pre-resolved value to bind
   *
   * @example
   * ```ts
   * const route = new Route()
   * container.bindValue(Route, route)
   * ```
   *
   * @example
   * ```ts
   * container.bindValue('config', { debug: true })
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
      throw new InvalidArgumentsException(
        'The container binding key must be of type "string", "symbol", or a "class constructor"'
      )
    }

    debug('adding value to container %O', binding)
    this.#bindingValues.set(binding, value)
  }

  /**
   * Register a binding as a singleton. The singleton method is same
   * as the bind method, but the factory function is invoked
   * only once and the result is cached for subsequent resolutions.
   *
   * @param binding - The binding key (string, symbol, or class constructor)
   * @param resolver - Factory function that resolves the binding value
   *
   * @example
   * ```ts
   * container.singleton('route', () => new Route())
   * await container.make('route')
   * ```
   *
   * @example
   * ```ts
   * container.singleton(Route, () => new Route())
   * await container.make(Route)
   * ```
   *
   * @example
   * ```ts
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
  singleton<Binding extends AbstractConstructor<any>>(
    binding: Binding,
    resolver: BindingResolver<KnownBindings, InstanceType<Binding>>
  ): void
  singleton<Binding>(
    binding: Binding,
    resolver: BindingResolver<
      KnownBindings,
      Binding extends AbstractConstructor<infer A>
        ? A
        : Binding extends keyof KnownBindings
          ? KnownBindings[Binding]
          : never
    >
  ): void {
    if (typeof binding !== 'string' && typeof binding !== 'symbol' && !isClass(binding)) {
      throw new InvalidArgumentsException(
        'The container binding key must be of type "string", "symbol", or a "class constructor"'
      )
    }

    debug('adding singleton to container %O', binding)
    this.#bindings.set(binding, { resolver: enqueue(resolver), isSingleton: true })
  }

  /**
   * Define a fake implementation for a binding or a class constructor.
   * Swaps have the highest priority when resolving dependencies
   * from the container. Useful for testing.
   *
   * @param binding - The class constructor to swap
   * @param resolver - Factory function that returns the swapped implementation
   *
   * @example
   * ```ts
   * container.swap(Database, () => new MockDatabase())
   * const db = await container.make(Database) // returns MockDatabase
   * ```
   */
  swap<Binding extends AbstractConstructor<any>>(
    binding: Binding,
    resolver: BindingResolver<KnownBindings, InstanceType<Binding>>
  ): void {
    if (!isClass(binding)) {
      throw new InvalidArgumentsException(
        `Cannot call swap on value "${inspect(binding)}". Only classes can be swapped`
      )
    }

    debug('defining swap for %O', binding)
    this.#swaps.set(binding, resolver)
  }

  /**
   * Restore binding by removing its swap
   *
   * @param binding - The class constructor to restore
   *
   * @example
   * ```ts
   * container.restore(Database)
   * ```
   */
  restore(binding: AbstractConstructor<any>) {
    debug('removing swap for %s', binding)
    this.#swaps.delete(binding)
  }

  /**
   * Restore mentioned or all bindings by removing their swaps
   *
   * @param bindings - Optional array of class constructors to restore. If not provided, all swaps are removed
   *
   * @example
   * ```ts
   * container.restoreAll([Database, Cache])
   * ```
   *
   * @example
   * ```ts
   * container.restoreAll() // Restore all swaps
   * ```
   */
  restoreAll(bindings?: AbstractConstructor<any>[]) {
    if (!bindings) {
      debug('removing all swaps')
      this.#swaps.clear()
      return
    }

    for (let binding of bindings) {
      this.restore(binding)
    }
  }

  /**
   * Define hooks to be executed after a binding has been resolved
   * from the container.
   *
   * The hooks are executed for:
   * - Bindings
   * - Only once for singletons
   * - Class constructors
   *
   * Hooks are not executed for direct values registered with the container.
   *
   * @param binding - The binding key or class constructor
   * @param callback - Hook function to execute after resolution
   *
   * @example
   * ```ts
   * container.resolving('database', async (db, resolver) => {
   *   await db.connect()
   * })
   * ```
   *
   * @example
   * ```ts
   * container.resolving(Database, async (db, resolver) => {
   *   await db.connect()
   * })
   * ```
   */
  resolving<Binding extends keyof KnownBindings>(
    binding: Binding extends string | symbol ? Binding : never,
    callback: HookCallback<KnownBindings, KnownBindings[Binding]>
  ): void
  resolving<Binding extends AbstractConstructor<any>>(
    binding: Binding,
    callback: HookCallback<KnownBindings, InstanceType<Binding>>
  ): void
  resolving<Binding extends BindingKey>(
    binding: Binding,
    callback: Binding extends AbstractConstructor<infer A>
      ? HookCallback<KnownBindings, A>
      : Binding extends keyof KnownBindings
        ? HookCallback<KnownBindings, KnownBindings[Binding]>
        : never
  ): void {
    binding = (this.#aliases.get(binding) as Binding) || binding

    if (!this.#hooks.has(binding)) {
      this.#hooks.set(binding, new Set())
    }

    const callbacks = this.#hooks.get(binding)!
    callbacks.add(callback)
  }

  /**
   * Create a contextual builder to define contextual bindings.
   * Contextual bindings allow you to specify different implementations
   * for a dependency based on which class is asking for it.
   *
   * @param parent - The class constructor that will receive the contextual binding
   *
   * @example
   * ```ts
   * container
   *   .when(UsersController)
   *   .asksFor(Hash)
   *   .provide(() => new Argon2())
   * ```
   */
  when(parent: Constructor<any>): ContextBindingsBuilder<KnownBindings, AbstractConstructor<any>> {
    return new ContextBindingsBuilder(parent, this)
  }

  /**
   * Add a contextual binding for a given class constructor. A
   * contextual binding takes a parent, parent's dependency and a callback
   * to resolve the dependency.
   *
   * For example:
   * - When "UsersController"
   * - Asks for "Hash class"
   * - Provide "Argon2" implementation
   *
   * @param parent - The class constructor that will receive the contextual binding
   * @param binding - The dependency class that the parent asks for
   * @param resolver - Factory function to resolve the contextual binding
   *
   * @example
   * ```ts
   * container.contextualBinding(
   *   UsersController,
   *   Hash,
   *   () => new Argon2()
   * )
   * ```
   */
  contextualBinding<Binding extends AbstractConstructor<any>>(
    parent: Constructor<any>,
    binding: Binding,
    resolver: BindingResolver<KnownBindings, Make<Binding>>
  ): void {
    if (!isClass(binding)) {
      throw new InvalidArgumentsException(
        `The binding value for contextual binding should be class`
      )
    }
    if (!isClass(parent)) {
      throw new InvalidArgumentsException(`The parent value for contextual binding should be class`)
    }

    debug('adding contextual binding %O to %O', binding, parent)

    /**
     * Create map for the parent if doesn't already exists
     */
    if (!this.#contextualBindings.has(parent)) {
      this.#contextualBindings.set(parent, new Map())
    }

    const parentBindings = this.#contextualBindings.get(parent)!
    parentBindings.set(binding, { resolver })
  }
}
