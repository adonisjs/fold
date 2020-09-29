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

import {
	Binding,
	LookupNode,
	IocContract,
	FakeBinding,
	BindCallback,
	InferMakeType,
	AliasCacheItem,
	BindFakeCallback,
	ExtractFunctions,
} from '../Contracts'

import { Injector } from './Injector'
import { IocResolver } from '../Resolver'
import { IocProxyObject, IocProxyClass } from './IoCProxy'
import { IocLookupException } from '../Exceptions/IocLookupException'
import { isEsm, isClass, isObject, ensureIsFunction, clearRequireCache } from '../helpers'

export class Ioc implements IocContract {
	/**
	 * Find if proxies are enabled or not
	 */
	private proxiesEnabled: boolean = false

	/**
	 * Injector is used for injecting dependencies to the class constructor
	 * and the methods
	 */
	private injector = new Injector(this)

	/**
	 * Options passed to the proxy handlers for resolving fakes
	 */
	private proxyOptions = {
		hasFake: ($namespace: string) => this.fakes.has($namespace),
		useFake: ($namespace: string, $value: any) => {
			const fake = this.fakes.get($namespace)!
			fake.cachedValue = fake.cachedValue || fake.callback(this, $value)
			return fake.cachedValue as any
		},
	}

	/**
	 * An object of registered bindings
	 */
	private bindings: { [namespace: string]: Binding<any, Ioc> } = {}

	/**
	 * A Map of registered fakes
	 */
	private fakes: Map<string, FakeBinding<any, Ioc>> = new Map()

	/**
	 * Aliases cache improves the `require` speed, which is dog slow otherwise.
	 */
	private aliasesImportCache: Map<string, AliasCacheItem> = new Map()

	/**
	 * Directories registered with an alias
	 */
	public directoryAliases: { [alias: string]: string } = {}

	/**
	 * Returns the binding return value. This method must be called when
	 * [[hasBinding]] returns true.
	 */
	private resolveBinding(namespace: string) {
		const binding = this.bindings[namespace]
		if (!binding) {
			throw IocLookupException.lookupFailed(namespace)
		}

		/**
		 * Return the cached value for singletons or invokes the callback
		 */
		let value: any
		if (binding.singleton && binding.cachedValue !== undefined) {
			value = binding.cachedValue // use cachedValue
		} else if (binding.singleton) {
			value = binding.cachedValue = binding.callback(this) // invoke callback and cache
		} else {
			value = binding.callback(this) // invoke callback
		}

		return value
	}

	/**
	 * Load a file from the disk using Node.js require method. The output of
	 * require is further cached to improve the peformance.
	 *
	 * Make sure to call this method when [[isAliasPath]] returns true.
	 */
	private resolveAlias(namespace: string) {
		const cacheEntry = this.aliasesImportCache.get(namespace)

		/**
		 * Require the module and cache it to improve performance
		 */
		if (cacheEntry) {
			return cacheEntry.cachedValue
		}

		/**
		 * Get alias for the given namespace
		 */
		const alias = this.getPathAlias(namespace)
		if (!alias) {
			throw IocLookupException.lookupFailed(namespace)
		}

		/**
		 * Build path from the namespace and the alias
		 */
		const diskPath = namespace.replace(alias, this.directoryAliases[alias])
		const absPath = require.resolve(normalize(diskPath))

		/**
		 * Require and cache value
		 */
		this.aliasesImportCache.set(namespace, { diskPath: absPath, cachedValue: require(absPath) })

		/**
		 * Return cached value
		 */
		return this.aliasesImportCache.get(namespace)!.cachedValue
	}

	/**
	 * Removes the cache for an alias path. Optionally you can remove
	 * the require cache as well
	 */
	private removeAliasImportCache(namespace: string, removeFromRequireCache: boolean) {
		const item = this.aliasesImportCache.get(namespace)
		if (!item) {
			return
		}

		this.aliasesImportCache.delete(namespace)
		if (removeFromRequireCache) {
			clearRequireCache(item.diskPath)
		}
	}

	/**
	 * Wraps object and class to a proxy for enabling the fakes
	 * API
	 */
	private wrapAsProxy(namespace: string, value: any) {
		/**
		 * Wrap objects inside proxy
		 */
		if (isObject(value)) {
			return new IocProxyObject(namespace, value, this.proxyOptions)
		}

		/**
		 * Wrap class inside proxy
		 */
		if (isClass(value)) {
			return IocProxyClass(namespace, value, this.proxyOptions)
		}

		return value
	}

	/**
	 * Returns a boolean telling if value is a lookup node or not
	 */
	private isLookupNode(value: any): value is LookupNode<string> {
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
	 * implementation for an existing binding.
	 *
	 * @example
	 * ```js
	 * ioc.bind('App/User', function () {
	 *  return new User()
	 * })
	 * ```
	 */
	public bind(namespace: string, callback: BindCallback<unknown, this>): this {
		ensureIsFunction(callback, '"ioc.bind" expect 2nd argument to be a function')
		this.bindings[namespace] = { callback, singleton: false }
		return this
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
	public singleton(namespace: string, callback: BindCallback<unknown, this>): this {
		ensureIsFunction(callback, '"ioc.singleton" expect 2nd argument to be a function')
		this.bindings[namespace] = { callback, singleton: true }
		return this
	}

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
	public fake(namespace: string, callback: BindFakeCallback<unknown, this>): this {
		ensureIsFunction(callback, 'ioc.fake expect 2nd argument to be a function')
		this.fakes.set(namespace, { callback })
		return this
	}

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
	 * ### With alias
	 * ```
	 * ioc.alias(join(__dirname, 'app'), 'App')
	 *
	 * ioc.use('App/services/foo')
	 * ioc.use('App/mdoels/foo')
	 * ```
	 */
	public alias(directoryPath: string, alias: string): this {
		this.directoryAliases[alias] = directoryPath
		return this
	}

	/**
	 * A boolean telling if a fake exists for a binding or
	 * not.
	 */
	public hasFake(namespace: string): boolean {
		return this.fakes.has(namespace)
	}

	/**
	 * Returns a boolean telling if binding for a given namespace
	 * exists or not.
	 *
	 * @example
	 * ```js
	 * ioc.hasBinding('Adonis/Src/View')
	 * ```
	 */
	public hasBinding(namespace: string): boolean {
		return !!this.bindings[namespace]
	}

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
	public isAliasPath(namespace: string): boolean {
		if (this.bindings[namespace]) {
			return false
		}

		return !!Object.keys(this.directoryAliases).find((alias) => {
			return namespace.startsWith(`${alias}/`)
		})
	}

	/**
	 * Returns the alias for a given namespace.
	 *
	 * @example
	 * ```js
	 * ioc.alias(join(__dirname, 'app'), 'App')
	 *
	 * ioc.getPathAlias('App/Services/Foo') // returns App
	 * ioc.getPathAlias('Foo/Services/Foo') // returns undefined
	 * ```
	 */
	public getPathAlias(namespace: string): string | undefined {
		return Object.keys(this.directoryAliases).find((alias) => {
			return namespace.startsWith(`${alias}/`)
		})
	}

	/**
	 * Clears the cache for directory aliasaes.
	 *
	 * - Cache for aliases if cleared when no alias is defined
	 * - Optionally, the require cache can be cleared as well
	 */
	public clearAliasesCache(alias?: string, removeFromRequireCache: boolean = false): void {
		if (!alias) {
			Array.from(this.aliasesImportCache.keys()).forEach((key) => {
				this.removeAliasImportCache(key, removeFromRequireCache)
			})
			return
		}

		this.removeAliasImportCache(alias, removeFromRequireCache)
	}

	/**
	 * Lookup a namespace and return it's lookup node. The lookup node can speed
	 * up resolving of namespaces via `use`, `useEsm` or `make` methods.
	 */
	public lookup(namespace: string, prefixNamespace?: string): null | any {
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
			namespace = namespace.substr(1) as any
		} else if (prefixNamespace) {
			namespace = `${prefixNamespace.replace(/\/$/, '')}/${namespace}` as any
		}

		/**
		 * Namespace is a binding
		 */
		if (this.hasBinding(namespace)) {
			return {
				type: 'binding',
				namespace: namespace,
			}
		}

		/**
		 * Namespace is part of pre-defined directory aliases. We do not check
		 * for the module existence
		 */
		if (this.isAliasPath(namespace)) {
			return {
				type: 'alias',
				namespace: namespace,
			}
		}

		return null
	}

	/**
	 * Use the binding by resolving it from the container. The resolve method
	 * does some all the hard work to resolve the value for you.
	 *
	 * 1. The name will be searched for an existing binding.
	 * 2. Checked against aliases directories.
	 * 3. Finally an exception is raised when unable to perform lookup
	 *
	 * @example
	 * ```js
	 * ioc.use('Adonis/Src/View')     // binding
	 * ioc.use('App/Services/User')   // Directory Alias
	 * ```
	 */
	public use(namespace: string | LookupNode<any>): any {
		/**
		 * Get lookup node when node itself isn't a lookup node
		 */
		const lookedupNode = typeof namespace === 'string' ? this.lookup(namespace) : namespace

		/**
		 * Do not proceed when unable to lookup Ioc container namespace
		 */
		if (!this.isLookupNode(lookedupNode)) {
			throw IocLookupException.lookupFailed(namespace as string)
		}

		const resolvedValue =
			lookedupNode.type === 'binding'
				? this.resolveBinding(lookedupNode.namespace)
				: this.resolveAlias(lookedupNode.namespace)

		/**
		 * When not using proxies, then we must return the value untouched
		 */
		if (!this.proxiesEnabled) {
			return resolvedValue
		}

		/**
		 * Wrap and return `esm` module default exports to proxy
		 */
		if (isEsm(resolvedValue)) {
			if (resolvedValue.default) {
				resolvedValue.default = this.wrapAsProxy(lookedupNode.namespace, resolvedValue.default)
			}
			return resolvedValue
		}

		return this.wrapAsProxy(lookedupNode.namespace, resolvedValue)
	}

	/**
	 * Make an instance of class and auto inject it's dependencies. The instance
	 * is only created if `namespace` is part of a directory alias or is a class
	 * constructor.
	 *
	 * The bindings added via `ioc.bind` or `ioc.singleton` controls their return value
	 * themselves using the factory function.
	 */
	public make<T extends any>(namespace: T | LookupNode<string>, args?: any[]): InferMakeType<T> {
		if (typeof namespace !== 'string' && !this.isLookupNode(namespace)) {
			return this.injector.injectConstructorDependencies(namespace, args || [])
		}

		/**
		 * Get lookup node when node itself isn't a lookup node
		 */
		const lookedupNode = typeof namespace === 'string' ? this.lookup(namespace) : namespace

		/**
		 * Do not proceed when unable to lookup Ioc container namespace
		 */
		if (!this.isLookupNode(lookedupNode)) {
			throw IocLookupException.lookupFailed(namespace as string)
		}

		let resolvedValue: any
		if (lookedupNode.type === 'binding') {
			resolvedValue = this.resolveBinding(lookedupNode.namespace)
		} else {
			const value = this.resolveAlias(lookedupNode.namespace)
			resolvedValue = isEsm(value) && value.default ? value.default : value
			resolvedValue = this.injector.injectConstructorDependencies(resolvedValue, args || [])
		}

		/**
		 * When not using proxies, then we must return the value untouched
		 */
		if (!this.proxiesEnabled || isEsm(resolvedValue)) {
			return resolvedValue
		}

		return this.wrapAsProxy(lookedupNode.namespace, resolvedValue)
	}

	/**
	 * Define a callback to be called when all of the container
	 * bindings are available.
	 */
	public with(namespaces: readonly any[], cb: (...args: any) => void): void {
		if (namespaces.every((namespace) => this.hasBinding(namespace))) {
			/**
			 * The callback accepts a tuple, whereas map returns an array. So we
			 * need to cast the value to any by hand
			 */
			cb(...namespaces.map((namespace) => this.use(namespace)))
		}
	}

	/**
	 * Call method on an object and inject dependencies to it automatically.
	 */
	public call<T extends object, K extends ExtractFunctions<T>>(
		target: T,
		method: K,
		args: any[]
	): any {
		if (typeof target[method] !== 'function') {
			throw new Exception(`Missing method "${method}" on "${target.constructor.name}"`)
		}

		return this.injector.injectMethodDependencies(target, method as string, args || [])
	}

	/**
	 * Restore a given fake
	 */
	public restore(namespace: string): void {
		this.fakes.delete(namespace)
	}

	/**
	 * Returns the resolver instance to resolve Ioc container bindings with
	 * little ease. Since, the IocResolver uses an in-memory cache to
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
