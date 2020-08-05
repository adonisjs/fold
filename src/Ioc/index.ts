/*
 * @adonisjs/fold
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { normalize } from 'path'
import { Exception } from '@poppinss/utils'

import tracer from './Tracer'
import { Injector } from './Injector'
import { IocResolver } from '../Resolver'
import { IoCProxyObject, IocProxyClass } from './IoCProxy'
import { IocLookupException } from '../Exceptions/IocLookupException'

import { isEsm, isClass, isObject, ensureIsFunction, clearRequireCache } from '../helpers'

import {
	Binding,
	LookupNode,
	FakeBinding,
	IocContract,
	BindCallback,
	MakeInferedType,
	BindFakeCallback,
	AutoloadCacheItem,
} from '../Contracts'

/**
 * Ioc container to manage and compose dependencies of your application
 * with ease.
 *
 * The container follows and encourages the use of dependency injection
 * in your application and provides all the neccessary tools to make
 * DI simpler.
 */
export class Ioc implements IocContract {
	/**
	 * For emitting emits
	 */
	public tracer = tracer(this.emitEvents)

	/**
	 * Autoloaded directories under a namespace
	 */
	public autoloads: { [namespace: string]: string } = {}

	/**
	 * An array of autoloaded aliases, stored along side with
	 * `autoloads` for a quick lookup on keys vs doing
	 * `Object.keys` everytime
	 */
	public autoloadedAliases: string[] = []

	/**
	 * Autoloaded cache to improve the `require` speed, which is dog slow.
	 */
	private autoloadsCache: Map<string, AutoloadCacheItem> = new Map()

	/**
	 * Copy of aliases
	 */
	private aliases: { [alias: string]: string } = {}

	/**
	 * Copy of actual bindings
	 */
	private bindings: { [namespace: string]: Binding } = {}

	/**
	 * Copy of fakes as a Map, since fakes are subjective to
	 * mutations
	 */
	private fakes: Map<string, FakeBinding> = new Map()

	/**
	 * Using proxies or not? Fakes only works when below one
	 * is set to true.
	 */
	private proxiesEnabled = false

	/**
	 * Injector is used for injecting dependencies to the class constructor
	 * and the methods
	 */
	private injector = new Injector(this)

	constructor(private emitEvents = false) {}

	/**
	 * Returns the binding return value. This method must be called when
	 * [[hasBinding]] returns true.
	 */
	private resolveBinding(namespace: string) {
		const binding = this.bindings[namespace]
		if (!binding) {
			throw IocLookupException.missingBinding(namespace)
		}

		this.tracer.in(namespace, !!binding.cachedValue)

		/**
		 * Return the cached value for singletons or invoke callback
		 */
		let value: any
		if (binding.singleton && binding.cachedValue !== undefined) {
			value = binding.cachedValue // use cachedValue
		} else if (binding.singleton) {
			value = binding.cachedValue = binding.callback(this) // invoke callback and cache
		} else {
			value = binding.callback(this) // invoke callback
		}

		this.tracer.out()
		return value
	}

	/**
	 * Load a file from the disk using Node.js require method. The output of
	 * require is further cached to improve peformance.
	 *
	 * Make sure to call this method when [[isAutoloadNamespace]] returns true.
	 */
	private resolveAutoload(namespace: string) {
		const cacheEntry = this.autoloadsCache.get(namespace)
		this.tracer.in(namespace, !!cacheEntry)

		/**
		 * Require the module and cache it to improve performance
		 */
		if (cacheEntry) {
			this.tracer.out()
			return cacheEntry.cachedValue
		}

		const baseNamespace = this.getAutoloadBaseNamespace(namespace)!
		const diskPath = namespace.replace(baseNamespace, this.autoloads[baseNamespace])
		const absPath = require.resolve(normalize(diskPath))
		this.autoloadsCache.set(namespace, { diskPath: absPath, cachedValue: require(absPath) })

		this.tracer.out()
		return this.autoloadsCache.get(namespace)!.cachedValue
	}

	/**
	 * Resolve the value for a namespace by trying all possible
	 * combinations of `bindings`, `aliases`, `autoloading`
	 * and finally falling back to `nodejs require`.
	 */
	private resolve(node: LookupNode) {
		switch (node.type) {
			case 'binding':
				return this.resolveBinding(node.namespace)
			case 'autoload':
				return this.resolveAutoload(node.namespace)
		}
	}

	/**
	 * Resolves a namespace and injects it's dependencies to it
	 */
	private resolveAndMake(node: LookupNode, args?: string[]) {
		switch (node.type) {
			case 'binding':
				return this.resolveBinding(node.namespace)
			case 'autoload':
				let value = this.resolveAutoload(node.namespace)

				/**
				 * We return an instance of default export for esm modules
				 */
				value = isEsm(value) && value.default ? value.default : value
				return this.injector.injectDependencies(value, args || [])
		}
	}

	/**
	 * Removes an autoload namespace from the cache. If the value doesn't
	 * exists in the cache, then this method will be a noop.
	 */
	private removeAutoloadFromCache(namespace: string, removeRequire: boolean) {
		const item = this.autoloadsCache.get(namespace)
		if (!item) {
			return
		}

		this.autoloadsCache.delete(namespace)
		if (removeRequire) {
			clearRequireCache(item.diskPath)
		}
	}

	/**
	 * Wraps object and class to a proxy for enabling the fakes
	 * API
	 */
	private wrapAsProxy<T extends any>(namespace: string, value: any): T {
		/**
		 * Wrap objects inside proxy
		 */
		if (isObject(value)) {
			return (new IoCProxyObject(namespace, value, this) as unknown) as T
		}

		/**
		 * Wrap class inside proxy
		 */
		if (isClass(value)) {
			return (IocProxyClass(namespace, value, this) as unknown) as T
		}

		return value
	}

	/**
	 * Returns a boolean telling if value is a lookup node or not
	 */
	private isLookupNode(value: any): value is LookupNode {
		return value && value.type && value.namespace
	}

	/**
	 * Instruct IoC container to use proxies when returning
	 * bindings from `use` and `make` methods.
	 */
	public useProxies(enable: boolean = true): this {
		this.proxiesEnabled = !!enable
		return this
	}

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
	public bind(namespace: string, callback: BindCallback): void {
		ensureIsFunction(callback, 'ioc.bind expect 2nd argument to be a function')
		this.tracer.emit('bind', { namespace, singleton: false })
		this.bindings[namespace] = { callback, singleton: false }
	}

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
	public singleton(namespace: string, callback: BindCallback): void {
		ensureIsFunction(callback, 'ioc.singleton expect 2nd argument to be a function')
		this.tracer.emit('bind', { namespace, singleton: true })
		this.bindings[namespace] = { callback, singleton: true }
	}

	/**
	 * Define alias for an existing binding. IoC container doesn't handle uniqueness
	 * conflicts for you and it's upto you to make sure that all aliases are
	 * unique.
	 *
	 * Use method [[hasAlias]] to know, if an alias already exists.
	 */
	public alias(namespace: string, alias: string): void {
		this.tracer.emit('alias', { alias, namespace })
		this.aliases[alias] = namespace
	}

	/**
	 * Define an alias for an existing directory and require
	 * files without fighting with relative paths.
	 *
	 * Giving the following directory structure
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
	 * use('App/services/foo')
	 * use('App/mdoels/foo')
	 * ```
	 */
	public autoload(directoryPath: string, namespace: string): void {
		this.tracer.emit('autoload', { directoryPath, namespace })

		/**
		 * Store namespaces in an array for faster lookup
		 * during resolve phase
		 */
		this.autoloadedAliases.push(namespace)
		this.autoloads[namespace] = directoryPath
	}

	/**
	 * Clear the autoload cache for all the cached files or for a
	 * single namespace.
	 *
	 * Optionally, you can remove it from `require` cache too.
	 */
	public clearAutoloadCache(namespace?: string, clearModulesCache = false): void {
		if (!namespace) {
			Array.from(this.autoloadsCache.keys()).forEach((key) => {
				this.removeAutoloadFromCache(key, clearModulesCache)
			})
			return
		}

		this.removeAutoloadFromCache(namespace, clearModulesCache)
	}

	/**
	 * Register a fake for an existing binding. The fakes only work when
	 * `ADONIS_IOC_PROXY` environment variable is set to `true`. AdonisJs
	 * will set it to true automatically during testing.
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
	public fake(namespace: string, callback: BindFakeCallback): void {
		ensureIsFunction(callback, 'ioc.fake expect 2nd argument to be a function')
		this.tracer.emit('fake', { namespace })
		this.fakes.set(namespace, { callback })
	}

	/**
	 * Use the binding by resolving it from the container. The resolve method
	 * does some great work to resolve the value for you.
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
	public use<T extends any = any>(node: string | LookupNode): T {
		/**
		 * Get lookup node when node itself isn't a lookup node
		 */
		const lookedupNode = typeof node === 'string' ? this.lookup(node) : node

		/**
		 * Do not proceed when unable to lookup Ioc container namespace
		 */
		if (!lookedupNode || !lookedupNode.type) {
			throw IocLookupException.lookupFailed(node as string)
		}

		/**
		 * Attempt to resolve the module
		 */
		let value = this.resolve(lookedupNode)

		/**
		 * When not using proxies, then we must return the value untouched
		 */
		if (!this.proxiesEnabled) {
			return value as T
		}

		/**
		 * Wrap and return `esm` module default exports to proxy
		 */
		if (isEsm(value)) {
			if (value.default) {
				value = Object.assign({}, value, {
					default: this.wrapAsProxy(lookedupNode.namespace, value.default),
				})
			}
			return value as T
		}

		return this.wrapAsProxy<T>(lookedupNode.namespace, value)
	}

	/**
	 * Make an instance of class and auto inject it's dependencies. The instance
	 * is only created if `namespace` is part of an autoload or is an class
	 * constructor.
	 *
	 * The bindings added via `ioc.bind` or `ioc.singleton` controls their state
	 * by themselves.
	 */
	public make<T extends any>(node: T, args?: any[]): MakeInferedType<T> {
		/**
		 * If value is not a namespace string and not a lookup node,
		 * then we make the value as it is.
		 *
		 * Also we do not support fakes for raw values and hence there is
		 * no point in wrapping it to a proxy
		 */
		if (typeof node !== 'string' && !this.isLookupNode(node)) {
			return this.injector.injectDependencies(node, args || [])
		}

		/**
		 * Get lookup node when node itself isn't a lookup node
		 */
		const lookedupNode = typeof node === 'string' ? this.lookup(node as any) : (node as LookupNode)

		/**
		 * Do not proceed when unable to lookup Ioc container namespace
		 */
		if (!lookedupNode || !lookedupNode.type) {
			throw IocLookupException.lookupFailed(node as string)
		}

		/**
		 * Attempt to make the lookedupNode.
		 */
		const value = this.resolveAndMake(lookedupNode || node, args)

		/**
		 * When not using proxies, then we must return the value untouched
		 */
		if (!this.proxiesEnabled || isEsm(value)) {
			return value
		}

		return this.wrapAsProxy(lookedupNode.namespace, value)
	}

	/**
	 * Use the fake for a given namespace. You don't have to manually
	 * read values from this method, unless you know what you are
	 * doing.
	 *
	 * This method is internally used by ioc container proxy objects to
	 * point to a fake when `useProxies` is called and fake exists.
	 */
	public useFake<T extends any = any>(namespace: string, value?: any): T {
		const fake = this.fakes.get(namespace)
		if (!fake) {
			throw new Error(`Cannot find fake for ${namespace}`)
		}

		fake.cachedValue = fake.cachedValue || fake.callback(this, value)
		return fake.cachedValue as T
	}

	/**
	 * A boolean telling if a fake exists for a binding or
	 * not.
	 */
	public hasFake(namespace: string): boolean {
		return this.fakes.has(namespace)
	}

	/**
	 * Returns a boolean telling if an alias
	 * exists
	 */
	public hasAlias(namespace: string): boolean {
		return !!this.aliases[namespace]
	}

	/**
	 * Returns a boolean telling if binding for a given namespace
	 * exists or not. Also optionally check for aliases too.
	 *
	 * @example
	 * ```js
	 * ioc.hasBinding('Adonis/Src/View')    // namespace
	 * ioc.hasBinding('View')               // alias
	 * ```
	 */
	public hasBinding(namespace: string, checkAliases = false): boolean {
		const binding = this.bindings[namespace]
		if (!binding && checkAliases) {
			return !!this.bindings[this.getAliasNamespace(namespace)!]
		}

		return !!binding
	}

	/**
	 * Returns the complete namespace for a given alias. To avoid
	 * `undefined` values, it is recommended to use `hasAlias`
	 * before using this method.
	 */
	public getAliasNamespace(namespace: string): string | undefined {
		return this.aliases[namespace]
	}

	/**
	 * Returns a boolean telling if namespace is part of autoloads or not.
	 * This method results may vary from the [[use]] method, since
	 * the `use` method gives prefrence to the `bindings` first.
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
	 * ioc.use('isAutoloadNamespace')
	 * ```
	 */
	public isAutoloadNamespace(namespace: string): boolean {
		return !!this.getAutoloadBaseNamespace(namespace)
	}

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
	public getAutoloadBaseNamespace(namespace: string): string | undefined {
		return this.autoloadedAliases.find((alias) => namespace.startsWith(`${alias}/`))
	}

	/**
	 * Restore the fake
	 */
	public restore(name: string): void {
		this.fakes.delete(name)
	}

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
	public with(namespaces: string[], callback: (...args: any[]) => void): void {
		ensureIsFunction(callback, 'ioc.with expect 2nd argument to be a function')
		if (namespaces.every((namespace) => this.hasBinding(namespace, true))) {
			callback(...namespaces.map((namespace) => this.use(namespace)))
		}
	}

	/**
	 * Call method on an object and inject dependencies to it automatically.
	 */
	public call<T extends object, K extends keyof T = any>(target: T, method: K, args?: any[]): any {
		if (typeof target[method] !== 'function') {
			throw new Error(`Missing method ${method} on ${target.constructor.name}`)
		}

		return this.injector.injectMethodDependencies(target, method as string, args || [])
	}

	/**
	 * Lookup a namespace and return it's lookup node. The lookup node can speed
	 * up resolving of namespaces via `use`, `useEsm` or `make` methods.
	 */
	public lookup(namespace: string, prefixNamespace?: string): null | LookupNode {
		/**
		 * Ensure namespace is defined
		 */
		if (!namespace) {
			throw new Exception(
				'Empty string cannot be used as IoC container reference',
				500,
				'E_INVALID_IOC_NAMESPACE'
			)
		}

		/**
		 * Build complete namespace
		 */
		if (namespace.startsWith('/')) {
			namespace = namespace.substr(1)
		} else if (prefixNamespace) {
			namespace = `${prefixNamespace.replace(/\/$/, '')}/${namespace}`
		}

		/**
		 * Namespace is a binding
		 */
		if (this.hasBinding(namespace)) {
			return {
				type: 'binding',
				namespace,
			}
		}

		/**
		 * Resolving aliases as binding
		 */
		if (this.hasAlias(namespace)) {
			return {
				type: 'binding',
				namespace: this.getAliasNamespace(namespace)!,
			}
		}

		/**
		 * Namespace is part of pre-defined autoloads. We do not check
		 * for the module existence
		 */
		if (this.isAutoloadNamespace(namespace)) {
			return {
				type: 'autoload',
				namespace: namespace,
			}
		}

		return null
	}

	/**
	 * Returns the resolver instance to resolve Ioc container bindings with
	 * little ease. Since, the IoCResolver uses an in-memory cache to
	 * improve the lookup speed, we suggest keeping a reference to
	 * the output of this method to leverage caching
	 */
	public getResolver(
		fallbackMethod?: string,
		rcNamespaceKey?: string,
		fallbackNamespace?: string
	): IocResolver {
		return new IocResolver(this, fallbackMethod, rcNamespaceKey, fallbackNamespace)
	}
}
