/*
 * @adonisjs/fold
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

type Function = (...args: any[]) => any

export type ExtractFunctions<T> = {
  [P in keyof T]: T[P] extends Function ? P : never
}[keyof T]

/**
 * Unwraps the promise
 */
type UnWrapPromise<T> = T extends Promise<infer U> ? U : T

/**
 * Shape of the bind callback method
 */
export type BindCallback<ReturnValue extends any, Container extends IocContract> = (
  container: Container
) => ReturnValue

/**
 * Shape of the fake callback method
 */
export type FakeCallback<ReturnValue extends any, Container extends IocContract> = (
  container: Container,
  originalValue: ReturnValue
) => ReturnValue

/**
 * Shape of resolved lookup node, resolved using `getResolver().resolve()`
 * method.
 */
export type IocResolverLookupNode<Namespace extends string> = {
  namespace: Namespace
  type: 'binding' | 'alias'
  method: string
}

/**
 * Shape of class constructor
 */
export type Constructor<T> = new (...args: any[]) => T

/**
 * Shape of class constructor with `makePlain` property
 */
export type PlainConstructor = {
  makePlain: true
}

/**
 * Type of the "withBindings" method
 */
export interface WithBindings<ContainerBindings extends any> {
  <Bindings extends (keyof ContainerBindings)[]>(
    namespaces: [...Bindings],
    cb: (
      ...args: {
        [M in keyof Bindings]: Bindings[M] extends keyof ContainerBindings
          ? ContainerBindings[Bindings[M]]
          : any
      }
    ) => void
  ): void
  <Namespace extends (keyof ContainerBindings | string)[]>(
    namespaces: readonly [...Namespace],
    cb: (
      ...args: {
        [M in keyof Namespace]: Namespace[M] extends keyof ContainerBindings
          ? ContainerBindings[Namespace[M]]
          : any
      }
    ) => void
  ): void
}

/**
 * Finding return type of the `ioc.make` method based upon the
 * input argument.
 *
 * - String and LookupNode = Returns any
 * - Class constructor with "makePlain" are returned as it is
 * - Otherwise an instance of the class constructor is returned
 * - All other values are returned as it is
 */
export type InferMakeType<T> = T extends string | LookupNode<string>
  ? any
  : T extends PlainConstructor
  ? T
  : T extends Constructor<infer A>
  ? A
  : T

/**
 * Shape of lookup node pulled using `ioc.lookup` method. This node
 * can be passed to `ioc.use`, or `ioc.make` to skip many checks
 * and resolve the binding right away.
 */
export type LookupNode<Namespace extends string> = {
  namespace: Namespace
  type: 'binding' | 'alias'
}

/**
 * Ioc container interface
 */
export interface IocContract<ContainerBindings extends any = any> {
  /**
   * Registered aliases. The key is the alias and value is the
   * absolute directory path
   */
  importAliases: { [alias: string]: string }

  /**
   * Enable/disable proxies. Proxies are mainly required for fakes to
   * work
   */
  useProxies(enable?: boolean): this

  /**
   * Define the module type for resolving auto import aliases. Defaults
   * to `cjs`
   */
  module: 'cjs' | 'esm'

  /**
   * Register a binding with a callback. The callback return value will be
   * used when binding is resolved
   */
  bind<Binding extends keyof ContainerBindings>(
    binding: Binding,
    callback: BindCallback<ContainerBindings[Binding], this>
  ): this
  bind<Binding extends string>(
    binding: Binding,
    callback: BindCallback<
      Binding extends keyof ContainerBindings ? ContainerBindings[Binding] : any,
      this
    >
  ): this

  /**
   * Same as the [[bind]] method, but registers a singleton only. Singleton's callback
   * is invoked only for the first time and then the cached value is used
   */
  singleton<Binding extends keyof ContainerBindings>(
    binding: Binding,
    callback: BindCallback<ContainerBindings[Binding], this>
  ): this
  singleton<Binding extends string>(
    binding: Binding,
    callback: BindCallback<
      Binding extends keyof ContainerBindings ? ContainerBindings[Binding] : any,
      this
    >
  ): this

  /**
   * Define an import alias
   */
  alias(absolutePath: string, alias: string): this

  /**
   * Register a fake for a namespace. Fakes works both for "bindings" and "import aliases".
   * Fakes only work when proxies are enabled using "useProxies".
   */
  fake<Namespace extends keyof ContainerBindings>(
    namespace: Namespace,
    callback: FakeCallback<ContainerBindings[Namespace], this>
  ): this
  fake<Namespace extends string>(
    namespace: Namespace,
    callback: FakeCallback<
      Namespace extends keyof ContainerBindings ? ContainerBindings[Namespace] : any,
      this
    >
  ): this

  /**
   * Clear selected or all the fakes. Calling the method with no arguments
   * will clear all the fakes
   */
  restore<Namespace extends keyof ContainerBindings>(namespace?: Namespace): this
  restore(namespace?: string): this

  /**
   * Find if a fake has been registered for a given namespace
   */
  hasFake<Namespace extends keyof ContainerBindings>(namespace: Namespace): boolean
  hasFake(namespace: string): boolean

  /**
   * Find if a binding exists for a given namespace
   */
  hasBinding<Binding extends keyof ContainerBindings>(namespace: Binding): boolean
  hasBinding(namespace: string): boolean

  /**
   * Find if a namespace is part of the auto import aliases. Returns false, when namespace
   * is an alias path but has an explicit binding too
   */
  isAliasPath(namespace: string): boolean

  /**
   * Lookup a namespace. The output contains the complete namespace,
   * along with its type. The type is an "alias" or a "binding".
   *
   * Null is returned when unable to lookup the namespace inside the container
   *
   * Note: This method just checks if a namespace is registered or binding
   *      or can be it resolved from auto import aliases or not. However,
   *      it doesn't check for the module existence on the disk.
   *
   * Optionally you can define a prefix namespace
   * to be used to build the complete namespace. For example:
   *
   * - namespace: UsersController
   * - prefixNamespace: App/Controllers/Http
   * - Output: App/Controllers/Http/UsersController
   *
   * Prefix namespace is ignored for absolute namespaces. For example:
   *
   * - namespace: /App/UsersController
   * - prefixNamespace: App/Controllers/Http
   * - Output: App/UsersController
   */
  lookup<Namespace extends Extract<keyof ContainerBindings, string>>(
    namespace: Namespace | LookupNode<Namespace>,
    prefixNamespace?: string
  ): LookupNode<Namespace>
  lookup<Namespace extends string>(
    namespace: Namespace | LookupNode<Namespace>,
    prefixNamespace?: string
  ): Namespace extends keyof ContainerBindings ? LookupNode<Namespace> : LookupNode<string> | null

  /**
   * Same as [[lookup]]. But raises exception instead of returning null
   */
  lookupOrFail<Namespace extends Extract<keyof ContainerBindings, string>>(
    namespace: Namespace | LookupNode<Namespace>,
    prefixNamespace?: string
  ): LookupNode<Namespace>
  lookupOrFail<Namespace extends string>(
    namespace: Namespace | LookupNode<Namespace>,
    prefixNamespace?: string
  ): Namespace extends keyof ContainerBindings ? LookupNode<Namespace> : LookupNode<string>

  /**
   * Resolve a binding by invoking the binding factory function. An exception
   * is raised, if the binding namespace is unregistered.
   */
  resolveBinding<Binding extends Extract<keyof ContainerBindings, string>>(
    binding: Binding
  ): ContainerBindings[Binding]
  resolveBinding<Binding extends string>(
    namespace: Binding
  ): Binding extends keyof ContainerBindings ? ContainerBindings[Binding] : any

  /**
   * Import namespace from the auto import aliases. This method assumes you are
   * using native ES modules
   */
  import(namespace: string): Promise<any>

  /**
   * Same as the "import" method, but uses CJS for requiring the module from its
   * path
   */
  require(namespace: string): any

  /**
   * The use method looks up a namespace inside both the bindings and the
   * auto import aliases
   */
  use<Binding extends Extract<keyof ContainerBindings, string>>(
    lookupNode: Binding | LookupNode<Binding>
  ): ContainerBindings[Binding]
  use<Binding extends string>(
    lookupNode: Binding | LookupNode<Binding>
  ): Binding extends keyof ContainerBindings ? ContainerBindings[Binding] : any

  /**
   * Same as the [[use]] method, but instead uses ES modules for resolving
   * the auto import aliases
   */
  useAsync<Binding extends Extract<keyof ContainerBindings, string>>(
    lookupNode: Binding | LookupNode<Binding>
  ): Promise<ContainerBindings[Binding]>
  useAsync<Binding extends string>(
    lookupNode: Binding | LookupNode<Binding>
  ): Promise<Binding extends keyof ContainerBindings ? ContainerBindings[Binding] : any>

  /**
   * Makes an instance of the class by first resolving it.
   */
  make<Binding extends Extract<keyof ContainerBindings, string>>(
    lookupNode: Binding | LookupNode<Binding>,
    args?: any[]
  ): ContainerBindings[Binding]
  make<T extends any>(
    value: T | LookupNode<string>,
    args?: any[]
  ): T extends keyof ContainerBindings ? ContainerBindings[T] : InferMakeType<T>

  /**
   * Same as the [[make]] method, but instead uses ES modules for resolving
   * the auto import aliases
   */
  makeAsync<Binding extends Extract<keyof ContainerBindings, string>>(
    lookupNode: Binding | LookupNode<Binding>,
    args?: any[]
  ): Promise<ContainerBindings[Binding]>
  makeAsync<T extends any>(
    value: T | LookupNode<string>,
    args?: any[]
  ): Promise<T extends keyof ContainerBindings ? ContainerBindings[T] : InferMakeType<T>>

  /**
   * The "withBindings" method invokes the defined callback when it is
   * able to resolve all the mentioned bindings.
   */
  withBindings: WithBindings<ContainerBindings>

  /**
   * @deprecated: Use "withBindings" instead
   */
  with: WithBindings<ContainerBindings>

  /**
   * Call a method on an object and automatically inject its depdencies
   */
  call<T extends any, Method extends ExtractFunctions<T>>(
    target: T,
    method: Method,
    args?: any[]
  ): T[Method] extends Function ? ReturnType<T[Method]> : any

  /**
   * Call a method on an object and automatically inject its depdencies
   */
  callAsync<T extends any, Method extends ExtractFunctions<T>>(
    target: T,
    method: Method,
    args?: any[]
  ): T[Method] extends Function ? Promise<UnWrapPromise<ReturnType<T[Method]>>> : Promise<any>

  /**
   * Trap container lookup calls. It includes
   *
   * - Ioc.use
   * - Ioc.useAsync
   * - Ioc.make
   * - Ioc.makeAsync
   * - Ioc.require
   * - Ioc.import
   * - Ioc.resolveBinding
   */
  trap(callback: (namespace: string) => any): this

  /**
   * Returns the resolver instance to resolve Ioc container bindings with
   * little ease. Since, the IocResolver uses an in-memory cache to
   * improve the lookup speed, we suggest keeping a reference to
   * the output of this method to leverage caching
   */
  getResolver(
    fallbackMethod?: string,
    rcNamespaceKey?: string,
    fallbackNamespace?: string
  ): IocResolverContract<ContainerBindings>
}

/**
 * IoC resolver allows resolving IoC container bindings by defining
 * prefix namespaces
 */
export interface IocResolverContract<ContainerBindings extends any> {
  /**
   * Resolve IoC container binding
   */
  resolve<Namespace extends Extract<keyof ContainerBindings, string>>(
    namespace: Namespace,
    prefixNamespace?: string
  ): IocResolverLookupNode<Namespace>
  resolve<Namespace extends string>(
    namespace: Namespace,
    prefixNamespace?: string
  ): Namespace extends keyof ContainerBindings
    ? IocResolverLookupNode<Namespace>
    : IocResolverLookupNode<string>

  /**
   * Call method on an IoC container binding
   */
  call<Namespace extends Extract<keyof ContainerBindings, string>>(
    namespace: Namespace | string,
    prefixNamespace?: string,
    args?: any[]
  ): Promise<any>
  call<Namespace extends Extract<keyof ContainerBindings, string>>(
    namespace: IocResolverLookupNode<Namespace | string>,
    prefixNamespace: undefined,
    args?: any[]
  ): Promise<any>
}
