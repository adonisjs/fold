/*
 * @adonisjs/fold
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { EventEmitter } from 'events'

/**
 * Shape of class constructor
 */
type Constructor<T> = new (...args: any[]) => T

/**
 * Shape of class constructor with `makePlain` property
 */
type PlainConstructor = {
	new (...args: any[]): any
	makePlain: boolean
}

/**
 * The inferred type of the `make` function
 */
export type MakeInferedType<T extends any> = T extends string | LookupNode
	? any
	: T extends PlainConstructor
	? T
	: T extends Constructor<infer A>
	? A
	: T

/**
 * Custom traces must implement this interface
 */
export interface TracerContract extends EventEmitter {
	in(namespace: string, cached: boolean): void
	out(): void
}

/**
 * Shape of resolved lookup node, resolved using `getResolver().resolve()`
 * method.
 */
export type IocResolverLookupNode = {
	namespace: string
	type: 'binding' | 'autoload'
	method: string
}

/**
 * The resolve is used to resolve and cache IoC container bindings that
 * are meant to stay static through out the application and reduce
 * the cost of lookup on each iteration.
 */
export interface IocResolverContract {
	resolve(namespace: string, prefixNamespace?: string): IocResolverLookupNode
	call<T extends any>(
		namespace: string | IocResolverLookupNode,
		prefixNamespace?: string,
		args?: any[]
	): T
}

/**
 * Ioc container interface
 */
export interface IocContract<ContainerBindings extends any = any> {
	tracer: TracerContract
	autoloads: { [namespace: string]: string }
	autoloadedAliases: string[]

	/**
	 * Instruct IoC container to use proxies when returning
	 * bindings from `use` and `make` methods.
	 */
	useProxies(): this

	/**
	 * Add a new binding with a namespace. Keeping the namespace unique
	 * is the responsibility of the user. We do not restrict duplicate
	 * namespaces, since it's perfectly acceptable to provide new
	 * values for existing bindings.
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
		callback: BindCallback<ContainerBindings[Namespace], ContainerBindings>
	): void
	bind(namespace: string, callback: BindCallback<unknown, ContainerBindings>): void

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
		namespace: string,
		callback: BindCallback<ContainerBindings[Namespace], ContainerBindings>
	): void
	singleton(namespace: string, callback: BindCallback<unknown, ContainerBindings>): void

	/**
	 * Define alias for an existing binding. IoC container doesn't handle uniqueness
	 * conflicts for you and it's upto you to make sure that all aliases are
	 * unique.
	 *
	 * Use method [[hasAlias]] to know, if an alias already exists.
	 */
	alias<Namespace extends keyof ContainerBindings>(namespace: Namespace, alias: string): void
	alias(namespace: string, alias: string): void

	/**
	 * Register a fake for an existing binding. The fakes only work when
	 * [[this.useProxies]] is invoked. AdonisJs will set invoke it
	 * automatically when running tests.
	 *
	 * NOTE: The return value of fakes is always cached, since multiple
	 * calls to `use` after that should point to a same return value.
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
		callback: BindFakeCallback<ContainerBindings[Namespace], ContainerBindings>
	): void
	fake(namespace: string, callback: BindFakeCallback<unknown, ContainerBindings>): void

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
	 * ### Without autoload
	 * ```js
	 * require('../services/foo')
	 * require('../models/foo')
	 * ```
	 *
	 * ### With outoload
	 * ```
	 * ioc.autoload(join(__dirname, 'app'), 'App')
	 *
	 * ioc.use('App/services/foo')
	 * ioc.use('App/mdoels/foo')
	 * ```
	 */
	autoload(directoryPath: string, namespace: string): void

	/**
	 * Use the binding by resolving it from the container. The resolve method
	 * does some all the hard work to resolve the value for you.
	 *
	 * 1. The name will be searched for an existing binding.
	 * 2. Checked against aliases.
	 * 3. Checked against autoloaded directories.
	 * 4. Fallback to Node.js `require` call.
	 *
	 * @example
	 * ```js
	 * ioc.use('View')                // alias
	 * ioc.use('Adonis/Src/View')     // binding
	 * ioc.use('App/Services/User')   // Autoload
	 * ioc.use('lodash')              // Fallback to Node.js require
	 * ```
	 */
	use<Namespace extends keyof ContainerBindings>(namespace: Namespace): ContainerBindings[Namespace]
	use<T extends any = any>(namespace: string | LookupNode): T

	/**
	 * Make an instance of class and auto inject it's dependencies. The instance
	 * is only created if `namespace` is part of an autoload or is a class
	 * constructor.
	 *
	 * The bindings added via `ioc.bind` or `ioc.singleton` controls their return value
	 * themselves using the factory function.
	 */
	make<Namespace extends keyof ContainerBindings>(
		namespace: Namespace,
		args?: any[]
	): ContainerBindings[Namespace]
	make<T extends any>(namespace: T, args?: any[]): MakeInferedType<T>

	/**
	 * Use the fake for a given namespace. You don't have to manually
	 * read values from this method, unless you know what you are
	 * doing.
	 *
	 * This method is internally used by ioc container proxy objects to
	 * point to a fake when `useProxies` is called and fake exists.
	 */
	useFake<Namespace extends keyof ContainerBindings>(
		namespace: Namespace,
		value?: ContainerBindings[Namespace]
	): ContainerBindings[Namespace]
	useFake<T extends any = any>(namespace: string, value?: any): T

	/**
	 * A boolean telling if a fake exists for a binding or
	 * not.
	 */
	hasFake<Namespace extends keyof ContainerBindings>(namespace: Namespace): boolean
	hasFake(namespace: string): boolean

	/**
	 * Returns a boolean telling if an alias
	 * exists
	 */
	hasAlias<Namespace extends keyof ContainerBindings>(namespace: Namespace): boolean
	hasAlias(namespace: string): boolean

	/**
	 * Returns a boolean telling if binding for a given namespace
	 * exists or not. Also optionally check for aliases too.
	 *
	 * @example
	 * ```js
	 * ioc.hasBinding('Adonis/Src/View')    // namespace
	 * ioc.hasBinding('View', true)         // alias
	 * ```
	 */
	hasBinding<Namespace extends keyof ContainerBindings>(
		namespace: Namespace,
		checkAliases?: boolean
	): boolean
	hasBinding(namespace: string, checkAliases?: boolean): boolean

	/**
	 * Returns the complete namespace for a given alias. To avoid
	 * `undefined` values, it is recommended to use `hasAlias`
	 * before using this method.
	 */
	getAliasNamespace(namespace: string): string | undefined

	/**
	 * Returns a boolean telling if namespace is part of autoloads or not.
	 * This method results may vary from the [[use]] method, since
	 * the `use` method gives preference to the `bindings` first.
	 *
	 * ### NOTE:
	 * Check the following example carefully.
	 *
	 * @example
	 * ```js
	 * // Define autoload namespace
	 * ioc.autoload(join(__dirname, 'app'), 'App')
	 *
	 * ioc.bind('App/Services/Foo', () => {
	 * })
	 *
	 * // return true
	 * ioc.isAutoloadNamespace('App/Services/Foo')
	 *
	 * // Returns value from `bind` and not disk
	 * ioc.use('App/Services/Foo')
	 * ```
	 */
	isAutoloadNamespace(namespace: string): boolean

	/**
	 * Returns the base namespace for an autoloaded namespace.
	 *
	 * @example
	 * ```js
	 * ioc.autoload(join(__dirname, 'app'), 'App')
	 *
	 * ioc.getAutoloadBaseNamespace('App/Services/Foo') // returns App
	 * ```
	 */
	getAutoloadBaseNamespace(namespace: string): string | undefined

	/**
	 * Clear the autoload cache for all the cached files or for a
	 * single namespace.
	 *
	 * Optionally, you can remove it from `require` cache too.
	 */
	clearAutoloadCache(namespace?: string, clearRequireCache?: boolean): void

	/**
	 * Restore the fake
	 */
	restore<Namespace extends keyof ContainerBindings>(namespace: Namespace): void
	restore(namespace: string): void

	/**
	 * Following will work with typescript 4.0
	 */
	// with<Namespace extends (keyof ContainerBindings)[]>(
	// 	namespaces: readonly [...Namespace],
	// 	cb: (
	// 		...args: {
	// 			[M in keyof Namespace]: Namespace[M] extends keyof ContainerBindings
	// 				? ContainerBindings[Namespace[M]]
	// 				: never
	// 		}
	// 	) => void
	// ): void

	/**
	 * Execute a callback by resolving bindings from the container and only
	 * executed when all bindings exists in the container.
	 *
	 * This is a clean way to use bindings, when you are not that user application
	 * is using them or not.
	 *
	 * ```js
	 * boot () {
	 *  this.app.with(['Adonis/Src/Auth'], (Auth) => {
	 *    Auth.extend('mongo', 'serializer', function () {
	 *      return new MongoSerializer()
	 *    })
	 *  })
	 * }
	 * ```
	 */
	with(namespaces: string[], cb: (...args: any[]) => void): void

	/**
	 * Call method on an object and inject dependencies to it automatically.
	 */
	call<T extends object, K extends keyof T = any>(target: T, method: K, args: any[]): any

	/**
	 * Lookup a namespace and return it's lookup node. The lookup node can speed
	 * up resolving of namespaces via `use`, `useEsm` or `make` methods.
	 */
	lookup(namespace: string, prefixNamespace?: string): LookupNode | null

	/**
	 * Returns the resolver instance to resolve Ioc container bindings with
	 * little ease. Since, the IoCResolver uses an in-memory cache to
	 * improve the lookup speed, we suggest keeping a reference to
	 * the output of this method to leverage caching
	 */
	getResolver(
		fallbackMethod?: string,
		rcNamespaceKey?: string,
		fallbackNamespace?: string
	): IocResolverContract
}

/**
 * Shape of binding stored inside the IoC container
 */
export type Binding<ReturnValue extends any, ContainerBindings extends any> = {
	callback: BindCallback<ReturnValue, ContainerBindings>
	singleton: boolean
	cachedValue?: unknown
}

/**
 * Shape of fakes binding stored inside the IoC container
 */
export type FakeBinding<ReturnValue extends any, ContainerBindings extends any> = {
	callback: BindFakeCallback<ReturnValue, ContainerBindings>
	cachedValue?: unknown
}

/**
 * Shape of lookup node pulled using `ioc.lookup` method. This node
 * can be passed to `ioc.use`, or `ioc.make` or `ioc.useEsm` to
 * skip many checks and resolve the binding right away.
 */
export type LookupNode = {
	namespace: string
	type: 'binding' | 'autoload'
}

/**
 * Shape of autoloaded cache entry
 */
export type AutoloadCacheItem = {
	diskPath: string
	cachedValue: any
}

/**
 * Shape of the bind callback method
 */
export type BindCallback<ReturnValue extends any, ContainerBindings extends any> = (
	app: IocContract<ContainerBindings>
) => ReturnValue

/**
 * Shape of the fake callback method
 */
export type BindFakeCallback<ReturnValue extends any, ContainerBindings extends any> = (
	app: IocContract<ContainerBindings>,
	value?: any
) => ReturnValue
