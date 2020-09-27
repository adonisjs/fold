/*
 * @adonisjs/fold
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

/**
 * Extracts functions from a given object
 */
export type ExtractFunctions<T> = {
	[P in keyof T]: T[P] extends (...args: unknown[]) => unknown ? P : never
}[keyof T]

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
 * Shape of aliases cache entry
 */
export type AliasCacheItem = {
	diskPath: string
	cachedValue: any
}

/**
 * Shape of the bind callback method
 */
export type BindCallback<ReturnValue extends any, Container extends IocContract> = (
	container: Container
) => ReturnValue

/**
 * Shape of the fake callback method
 */
export type BindFakeCallback<ReturnValue extends any, Container extends IocContract> = (
	container: Container,
	value?: any
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
 * Shape of lookup node pulled using `ioc.lookup` method. This node
 * can be passed to `ioc.use`, or `ioc.make` to skip many checks
 * and resolve the binding right away.
 */
export type LookupNode<Namespace extends string> = {
	namespace: Namespace
	type: 'binding' | 'alias'
}

/**
 * Shape of binding stored inside the IoC container
 */
export type Binding<ReturnValue extends any, Container extends IocContract> = {
	callback: BindCallback<ReturnValue, Container>
	singleton: boolean
	cachedValue?: unknown
}

/**
 * Shape of fakes binding stored inside the IoC container
 */
export type FakeBinding<ReturnValue extends any, Container extends IocContract> = {
	callback: BindFakeCallback<ReturnValue, Container>
	cachedValue?: unknown
}

/**
 * Shape of the IoC container
 */
export interface IocContract<ContainerBindings extends any = any> {
	/**
	 * Directories registered with aliases
	 */
	directoryAliases: { [alias: string]: string }

	/**
	 * Instruct IoC container to use proxies when returning
	 * bindings from `use` and `make` methods.
	 */
	useProxies(enable?: boolean): this

	/**
	 * Add a new binding with a namespace. Keeping the namespace unique
	 * is the responsibility of the user. We do not restrict duplicate
	 * namespaces, since it's perfectly acceptable to provide new
	 * implementation for an existing binding.
	 *
	 * @example
	 * ```js
	 * ioc.bind('App/User', function () {
	 *  return new User()
	 * })
	 * ```
	 */
	bind<Namespace extends keyof ContainerBindings>(
		namespace: Namespace,
		callback: BindCallback<ContainerBindings[Namespace], this>
	): this
	bind<Namespace extends string>(
		namespace: Namespace,
		callback: Namespace extends keyof ContainerBindings
			? BindCallback<ContainerBindings[Namespace], this>
			: BindCallback<unknown, this>
	): this

	/**
	 * Add a new binding as a singleton. This method behaves similar to
	 * [[bind]], just the value is cached after the first use. The
	 * `callback` will be invoked only once.
	 *
	 * @example
	 * ```js
	 * ioc.singleton('App/User', function () {
	 *  return new User()
	 * })
	 * ```
	 */
	singleton<Namespace extends keyof ContainerBindings>(
		namespace: Namespace,
		callback: BindCallback<ContainerBindings[Namespace], this>
	): this
	singleton<Namespace extends string>(
		namespace: Namespace,
		callback: Namespace extends keyof ContainerBindings
			? BindCallback<ContainerBindings[Namespace], this>
			: BindCallback<unknown, this>
	): this

	/**
	 * Register a fake for an existing binding. The fakes only work when
	 * [[this.useProxies]] is invoked. AdonisJS will invoke it
	 * automatically when running tests.
	 *
	 * NOTE: The return value of fakes is always cached, since multiple
	 * calls to `use` after that should points to a same return value.
	 *
	 * @example
	 * ```js
	 * ioc.fake('App/User', function () {
	 *  return new FakeUser()
	 * })
	 * ```
	 */
	fake<Namespace extends keyof ContainerBindings>(
		namespace: Namespace,
		callback: BindFakeCallback<ContainerBindings[Namespace], this>
	): this
	fake<Namespace extends string>(
		namespace: Namespace,
		callback: Namespace extends keyof ContainerBindings
			? BindFakeCallback<ContainerBindings[Namespace], this>
			: BindFakeCallback<unknown, this>
	): this

	/**
	 * Define an alias for an existing directory and require
	 * files without fighting with relative paths.
	 *
	 * Given the following directory structure
	 *
	 * ```sh
	 * .app/
	 * ├── controllers
	 * │   └── foo.js
	 * ├── services
	 * │   └── foo.js
	 * ├── models
	 * │   └── foo.js
	 * ```
	 *
	 * You are in file `controllers/foo.js`
	 *
	 * ### Without alias
	 * ```js
	 * require('../services/foo')
	 * require('../models/foo')
	 * ```
	 *
	 * ### With outoload
	 * ```
	 * ioc.alias(join(__dirname, 'app'), 'App')
	 *
	 * ioc.use('App/services/foo')
	 * ioc.use('App/mdoels/foo')
	 * ```
	 */
	alias(directoryPath: string, alias: string): this

	/**
	 * Use the binding by resolving it from the container. The resolve method
	 * does some all the hard work to resolve the value for you.
	 *
	 * 1. The name will be searched for an existing binding.
	 * 2. Checked against directory aliases.
	 * 3. Finally an exception is raised when unable to perform lookup
	 *
	 * @example
	 * ```js
	 * ioc.use('Adonis/Src/View')     // binding
	 * ioc.use('App/Services/User')   // Directory alias
	 * ```
	 */
	use<Namespace extends Extract<keyof ContainerBindings, string>>(
		namespace: Namespace | LookupNode<Namespace>
	): ContainerBindings[Namespace]
	use<Namespace extends string>(
		namespace: Namespace | LookupNode<Namespace>
	): Namespace extends keyof ContainerBindings ? ContainerBindings[Namespace] : any

	/**
	 * Make an instance of class and auto inject it's dependencies. The instance
	 * is only created if `namespace` is part of a directory alias or is a class
	 * constructor.
	 *
	 * The bindings added via `ioc.bind` or `ioc.singleton` controls their return value
	 * themselves using the factory function.
	 */
	make<Namespace extends Extract<keyof ContainerBindings, string>>(
		namespace: Namespace | LookupNode<Namespace>,
		args?: any[]
	): ContainerBindings[Namespace]
	make<T extends any>(
		namespace: T | LookupNode<string>,
		args?: any[]
	): T extends keyof ContainerBindings ? ContainerBindings[T] : InferMakeType<T>

	/**
	 * Define a callback to be called when all of the container
	 * bindings are available.
	 */
	with<Namespace extends (keyof ContainerBindings | string)[]>(
		namespaces: readonly [...Namespace],
		cb: (
			...args: {
				[M in keyof Namespace]: Namespace[M] extends keyof ContainerBindings
					? ContainerBindings[Namespace[M]]
					: any
			}
		) => void
	): void

	/**
	 * Call method on an object and inject dependencies to it automatically.
	 */
	call<T extends object, K extends ExtractFunctions<T>>(target: T, method: K, args: any[]): any

	/**
	 * Lookup a namespace and return its lookup node. The lookup node can speed
	 * up resolving of namespaces via `use` or `make` methods.
	 */
	lookup<Namespace extends Extract<keyof ContainerBindings, string>>(
		namespace: Namespace,
		prefixNamespace?: string
	): LookupNode<Namespace>
	lookup<Namespace extends string>(
		namespace: Namespace,
		prefixNamespace?: string
	): Namespace extends keyof ContainerBindings ? LookupNode<Namespace> : LookupNode<string> | null

	/**
	 * A boolean telling if a fake exists for a binding or
	 * not.
	 */
	hasFake<Namespace extends keyof ContainerBindings>(namespace: Namespace): boolean
	hasFake(namespace: string): boolean

	/**
	 * Returns a boolean telling if binding for a given namespace
	 * exists or not.
	 *
	 * @example
	 * ```js
	 * ioc.hasBinding('Adonis/Src/View')
	 * ```
	 */
	hasBinding<Namespace extends keyof ContainerBindings>(namespace: Namespace): boolean
	hasBinding(namespace: string): boolean

	/**
	 * Returns a boolean telling if namespace is part of directory aliases or not.
	 *
	 * ### NOTE:
	 * Check the following example carefully.
	 *
	 * @example
	 * ```js
	 * ioc.alias(join(__dirname, 'app'), 'App')
	 * ioc.isAliasPath('App/Services/Foo')
	 * ```
	 */
	isAliasPath(namespace: string): boolean

	/**
	 * Returns the base namespace for directory alias path.
	 *
	 * @example
	 * ```js
	 * ioc.alias(join(__dirname, 'app'), 'App')
	 *
	 * ioc.getPathAlias('App/Services/Foo') // returns App
	 * ioc.getPathAlias('Foo/Services/Foo') // returns undefined
	 * ```
	 */
	getPathAlias(namespace: string): string | undefined

	/**
	 * Clears the cache for directory aliasaes.
	 *
	 * - Cache for aliases if cleared when no alias is defined
	 * - Optionally, the require cache can be cleared as well
	 */
	clearAliasesCache(alias?: string, clearRequireCache?: boolean): void

	/**
	 * Restore a given fake
	 */
	restore<Namespace extends keyof ContainerBindings>(namespace: Namespace): void
	restore(namespace: string): void

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
	): any
	call<Namespace extends Extract<keyof ContainerBindings, string>>(
		namespace: IocResolverLookupNode<Namespace | string>,
		prefixNamespace: undefined,
		args?: any[]
	): any
}
