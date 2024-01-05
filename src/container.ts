/*
 * @adonisjs/fold
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { inspect } from 'node:util'
import { InvalidArgumentsException } from '@poppinss/utils'

import type {
  Make,
  Hooks,
  Swaps,
  Bindings,
  BindingKey,
  Constructor,
  ErrorCreator,
  HookCallback,
  BindingValues,
  BindingResolver,
  ExtractFunctions,
  ContainerOptions,
  AbstractConstructor,
  ContextualBindings,
} from './types.js'

import debug from './debug.js'
import { enqueue, isClass } from './helpers.js'
import { ContainerResolver } from './resolver.js'
import { ContextBindingsBuilder } from './contextual_bindings_builder.js'

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

  constructor(options?: ContainerOptions) {
    this.#options = options || {}
  }

  /**
   * Define an emitter instance to use
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
   * ```ts
   * await container.make('route')
   * await container.make(Database)
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
   * ```ts
   * await container.call(await container.make(UsersController), 'index')
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
      throw new InvalidArgumentsException(
        'The container binding key must be of type "string", "symbol", or a "class constructor"'
      )
    }

    debug('adding value to container %O', binding)
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
   * Fakes have the highest priority when resolving dependencies
   * from the container.
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
   */
  restore(binding: AbstractConstructor<any>) {
    debug('removing swap for %s', binding)
    this.#swaps.delete(binding)
  }

  /**
   * Restore mentioned or all bindings by removing
   * their swaps
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
   * Create a contextual builder to define contextual bindings
   */
  when(parent: Constructor<any>): ContextBindingsBuilder<KnownBindings, AbstractConstructor<any>> {
    return new ContextBindingsBuilder(parent, this)
  }

  /**
   * Add a contextual binding for a given class constructor. A
   * contextual takes a parent, parent's dependency and a callback
   * to self resolve the dependency.
   *
   * For example:
   * - When "UsersController"
   * - Asks for "Hash class"
   * - Provide "Argon2" implementation
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
