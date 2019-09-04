/**
 * @module @adonisjs/fold
 */

/*
* @adonisjs/fold
*
* (c) Harminder Virk <virk@adonisjs.com>
*
* For the full copyright and license information, please view the LICENSE
* file that was distributed with this source code.
*/

import { Exception } from '@poppinss/utils'
import { normalize, resolve, dirname } from 'path'
import { esmResolver } from '@poppinss/utils/build/src/esmResolver'

import tracer from './Tracer'
import { IoCProxyObject, IocProxyClass } from './IoCProxy'
import { IocContract, BindCallback, Binding, AutoloadCacheItem, LookupNode } from '../Contracts'

const toString = Function.prototype.toString

/**
 * Ioc container to manage and compose dependencies of your application
 * with ease.
 *
 * The container follows and encourages the use of dependency injection
 * in your application and provides all the neccessary tools to make
 * DI simpler.
 */
export class Ioc implements IocContract {
  public tracer = tracer(this._emitEvents)

  /**
   * Autoloaded directories under a namespace
   */
  public autoloads: { [namespace: string]: string } = {}

  /**
   * An array of autoloaded aliases, stored along side with
   * `_autoloads` for a quick lookup on keys
   */
  public autoloadedAliases: string[] = []

  /**
   * Autoloaded cache to improve the `require` speed, which is
   * dog slow.
   */
  private _autoloadsCache: Map<string, AutoloadCacheItem> = new Map()

  /**
   * Copy of aliases
   */
  private _aliases: { [alias: string]: string } = {}

  /**
   * Copy of actual bindings
   */
  private _bindings: { [namespace: string]: Binding } = {}

  /**
   * Copy of fakes as a Map, since fakes are subjective to
   * mutations
   */
  private _fakes: Map<string, Binding> = new Map()

  /**
   * Using proxies or not? Fakes only works when below one
   * is set to true.
   */
  private _useProxies = false

  constructor (private _emitEvents = false) {
  }

  /**
   * Returns the binding return value. This method must be called when
   * [[hasBinding]] returns true.
   */
  private _resolveBinding (namespace: string, asEsm: boolean) {
    const binding = this._bindings[namespace]
    if (!binding) {
      throw new Error(`Cannot resolve ${namespace} binding from IoC container`)
    }

    this.tracer.in(namespace, !!binding.cachedValue)

    /**
     * Return the cached value for singletons or invoke callback
     */
    let value: any
    if (binding.singleton && binding.cachedValue !== undefined) {
      value = binding.cachedValue // use cachedValue
    } else if (binding.singleton) {
      value = binding.cachedValue = binding.callback(this)  // invoke callback and cache
    } else {
      value = binding.callback(this) // invoke callback
    }

    this.tracer.out()
    return asEsm ? this._toEsm(value) : value
  }

  /**
   * Raises error with a message when callback is not
   * a function.
   */
  private _ensureCallback (callback: Function, message: string) {
    if (typeof (callback) !== 'function') {
      throw new Exception(message, 500, 'E_RUNTIME_EXCEPTION')
    }
  }

  /**
   * Makes the require path from the autoloaded alias. This path then is given to
   * Node.js `require` function.
   */
  private _makeRequirePath (baseNamespace: string, namespace: string): string {
    const diskPath = namespace.replace(baseNamespace, this.autoloads[baseNamespace])
    return require.resolve(normalize(diskPath))
  }

  /**
   * Load a file from the disk using Node.js require method. The output of
   * require is further cached to improve peformance.
   *
   * Make sure to call this method when [[isAutoloadNamespace]] returns true.
   */
  private _autoload (namespace: string, normalizeEsm: boolean) {
    const cacheEntry = this._autoloadsCache.get(namespace)
    this.tracer.in(namespace, !!cacheEntry)

    /**
     * Require the module and cache it to improve performance
     */
    if (!cacheEntry) {
      const baseNamespace = this.getAutoloadBaseNamespace(namespace)!
      const absPath = this._makeRequirePath(baseNamespace, namespace)
      this._autoloadsCache.set(namespace, { diskPath: absPath, cachedValue: require(absPath) })
    }

    this.tracer.out()

    /**
     * Normalize esm on each return call, so that the cached value is
     * normalized and not impacted by `normalizeEsm` flag.
     */
    const importValue = this._autoloadsCache.get(namespace)!.cachedValue
    return normalizeEsm ? esmResolver(importValue) : importValue
  }

  /**
   * Returns a boolean telling if value is a primitive or object constructor.
   */
  private _isConstructorObject (value: any): boolean {
    return [String, Function, Object, Date, Number, Boolean].indexOf(value) > -1
  }

  /**
   * Returns exception for disallowing constructor injections.
   */
  private _getConstructorInjectionException (value: any, parentName: string, index: number) {
    const primitiveName = `{${value.name} Constructor}`
    return new Error(`Cannot inject ${primitiveName} to {${parentName}} at position ${index + 1}`)
  }

  /**
   * Returns an array of resolved dependencies, by giving preference
   * to inline arguments
   */
  private _makeDependencies (targetName: string, injections: any[], args: any[]) {
    /**
     * If the inline arguments length is great or same as the length
     * of injections, then we treat them as the source of truth
     * and return them back as it is.
     *
     * The inline arguments are preferred over injections, since we trust the caller
     * more than the user.
     */
    if (args.length >= injections.length) {
      return args
    }

    /**
     * Loop over all the injections and give preference to args for
     * a given index, otherwise fallback to `this.make`.
     */
    return injections.map((injection: any, index: number) => {
      if (args && args[index] !== undefined) {
        return args[index]
      }

      /**
       * Disallow object and primitive constructors
       */
      if (this._isConstructorObject(injection)) {
        throw this._getConstructorInjectionException(injections[index], targetName, index)
      }

      return this.make(injection)
    })
  }

  /**
   * Make instance of a class by auto-injecting it's defined dependencies.
   */
  private _makeInstanceOf (value: any, args?: any[]) {
    if (!this._isClass(value) || value.makePlain === true) {
      return value
    }

    const injections = value.hasOwnProperty('inject') ? (value.inject.instance || []) : []
    return new value(...this._makeDependencies(value.name, injections, args || []))
  }

  /**
   * Require the module using Node.js `require` function.
   */
  private _requireModule (modulePath: string) {
    if (modulePath.startsWith('./') || modulePath.startsWith('/')) {
      return require(resolve(dirname(module.parent!.filename), modulePath))
    }
    return require(modulePath)
  }

  /**
   * Converts the output value to a sythentic esm
   * module.
   */
  private _toEsm (value: any) {
    const esm = {
      default: value,
    }
    Object.defineProperty(esm, '__esModule', { value: true })
    return esm
  }

  /**
   * Resolve the value for a namespace by trying all possible
   * combinations of `bindings`, `aliases`, `autoloading`
   * and finally falling back to `nodejs require`.
   */
  private _resolve (node: string | LookupNode, asEsm: boolean) {
    /**
     * Lookup nodes are not part of waterfall lookup process. We front we
     * know about them and must resolve them
     */
    if (typeof (node) !== 'string') {
      switch (node.type) {
        case 'binding':
          return this._resolveBinding(node.namespace, asEsm)
        case 'autoload':
          return this._autoload(node.namespace, !asEsm)
      }
      return
    }

    /**
     * Require the npm module as a fallback when node is a string
     */
    return this._requireModule(node)
  }

  /**
   * Returns a boolean telling if value is a valid lookup
   * node or not
   */
  private _isLookUpNode (node: any): node is LookupNode {
    return node && node.type && node.namespace
  }

  /**
   * Resolve the value for a namespace by trying all possible
   * combinations of `bindings`, `aliases`, `autoloading`
   * and finally falling back to `nodejs require` and then
   * make an instance of it and it's dependencies.
   */
  private _resolveAndMake (node: string | LookupNode, args?: string[]) {
    if (this._isLookUpNode(node)) {
      switch (node.type) {
        case 'binding':
          return this._resolveBinding(node.namespace, false)
        case 'autoload':
          const value = this._autoload(node.namespace, true)
          return this._makeInstanceOf(value, args)
      }
      return
    }

    /**
     * Attempt to make non-string values
     */
    if (typeof (node) !== 'string') {
      return this._makeInstanceOf(node, args)
    }

    return this._requireModule(node)
  }

  /**
   * Clear the module entry from the require cache. The `modulePath`
   * must be an absolute path.
   */
  private _clearRequireCache (modulePath: string) {
    const cacheItem = require.cache[modulePath]
    /* istanbul ignore if */
    if (!cacheItem) {
      return
    }

    /**
     * Just remove the module, when there is no
     * parent
     */
    delete require.cache[modulePath]

    /* istanbul ignore if */
    if (!cacheItem.parent) {
      return
    }

    let i = cacheItem.parent.children.length

    /**
     * Remove reference from the parent
     */
    while (i--) {
      if (cacheItem.parent.children[i].id === modulePath) {
        cacheItem.parent.children.splice(i, 1)
      }
    }
  }

  /**
   * Removes an autoload namespace from the cache. If the value doesn't
   * exists in the cache, then this method will be a noop.
   */
  private _removeAutoloadFromCache (namespace: string, clearRequireCache: boolean) {
    const item = this._autoloadsCache.get(namespace)
    if (!item) {
      return
    }

    /**
     * Remove it from the object
     */
    this._autoloadsCache.delete(namespace)

    /**
     * Clear the require cache if instructed for same
     */
    /* istanbul ignore else */
    if (clearRequireCache) {
      this._clearRequireCache(item.diskPath)
    }
  }

  /**
   * Returns a boolean to differentiate between classes and plain
   * functions
   */
  private _isClass (fn: any) {
    return typeof (fn) === 'function' && /^class\s/.test(toString.call(fn))
  }

  /**
   * Returns a boolean to differentiate between null and objects
   * and arrays too
   */
  private _isObject (value: any): boolean {
    return value && typeof (value) === 'object' && !Array.isArray(value)
  }

  /**
   * Instruct IoC container to use proxies when returning
   * bindings from `use` and `make` methods.
   */
  public useProxies (): this {
    this._useProxies = true
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
  public bind (namespace: string, callback: BindCallback): void {
    this._ensureCallback(callback, 'ioc.bind expect 2nd argument to be a function')
    this.tracer.emit('bind', { namespace, singleton: false })
    this._bindings[namespace] = { callback, singleton: false }
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
  public singleton (namespace: string, callback: BindCallback): void {
    this._ensureCallback(callback, 'ioc.singleton expect 2nd argument to be a function')
    this.tracer.emit('bind', { namespace, singleton: true })
    this._bindings[namespace] = { callback, singleton: true }
  }

  /**
   * Define alias for an existing binding. IoC container doesn't handle uniqueness
   * conflicts for you and it's upto you to make sure that all aliases are
   * unique.
   *
   * Use method [[hasAlias]] to know, if an alias already exists.
   */
  public alias (namespace: string, alias: string): void {
    this.tracer.emit('alias', { alias, namespace })
    this._aliases[alias] = namespace
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
  public autoload (directoryPath: string, namespace: string): void {
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
  public clearAutoloadCache (namespace?: string, clearRequireCache = false): void {
    if (!namespace) {
      Array.from(this._autoloadsCache.keys()).forEach((key) => {
        this._removeAutoloadFromCache(key, clearRequireCache)
      })
      return
    }

    this._removeAutoloadFromCache(namespace, clearRequireCache)
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
  public fake (namespace: string, callback: BindCallback): void {
    this._ensureCallback(callback, 'ioc.fake expect 2nd argument to be a function')
    this.tracer.emit('fake', { namespace })
    this._fakes.set(namespace, { callback, singleton: true })
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
  public use<T extends any = any> (node: string | LookupNode): T {
    /**
     * Get lookup node when node itself isn't a lookup node
     */
    const lookedupNode = typeof (node) === 'string' ? this.lookup(node) : node

    /**
     * Attempt to resolve the module
     */
    const value = this._resolve(lookedupNode || node, false)

    /**
     * Return value as it is when we are not using proxies or lookup node wasn't
     * found
     */
    if (!this._useProxies || !lookedupNode) {
      return value as T
    }

    /**
     * Wrap objects inside proxy
     */
    if (this._isObject(value)) {
      return (new IoCProxyObject(lookedupNode.namespace, value, this) as unknown) as T
    }

    /**
     * Wrap class inside proxy
     */
    if (this._isClass(value)) {
      return (IocProxyClass(lookedupNode.namespace, value, this) as unknown) as T
    }

    /**
     * Return other values as it is
     */
    return value as T
  }

  /**
   * Wraps the return value of `use` to an ESM module. This is used
   * by the AdonisJs typescript transformer.
   */
  public useEsm<T extends any = any> (node: string | LookupNode): T {
    /**
     * Get lookup node when node itself isn't a lookup node
     */
    const lookedupNode = typeof (node) === 'string' ? this.lookup(node) : node

    /**
     * Attempt to resolve the module
     */
    const value = this._resolve(lookedupNode || node, true)

    /**
     * `useEsm` will attempt to wrap values as `esm` modules whenever possible. Otherwise
     * we must raise an exception.
     *
     * NOTE: `useEsm` must never be used with node modules
     */
    if (!value.__esModule) {
      throw new Error(`${node} must be an ES module`)
    }

    /**
     * Proxies are allowed only for ESM modules with default exports. Also we ignore
     * proxies when value is not a lookup node
     */
    if (!this._useProxies || !value.default || !lookedupNode) {
      return value
    }

    /**
     * Wrap objects inside proxy
     */
    if (this._isObject(value.default)) {
      return {
        default: new IoCProxyObject(lookedupNode.namespace, value.default, this),
      } as unknown as T
    }

    /**
     * Wrap class inside proxy
     */
    if (this._isClass(value.default)) {
      return {
        default: IocProxyClass(lookedupNode.namespace, value.default, this),
      } as unknown as T
    }

    /**
     * Return value as it is
     */
    return value as T
  }

  /**
   * Make an instance of class and auto inject it's dependencies. The instance
   * is only created if `namespace` is part of an autoload or is an class
   * constructor.
   *
   * The bindings added via `ioc.bind` or `ioc.singleton` controls their state
   * by themselves.
   */
  public make<T extends any = any> (node: any, args?: string[]): T {
    /**
     * Get lookup node when node itself isn't a lookup node
     */
    const lookedupNode = typeof (node) === 'string' ? this.lookup(node) : node

    /**
     * Attempt to make the lookedupNode.
     */
    const value = this._resolveAndMake(lookedupNode || node, args)

    /**
     * Return the value as it is when we are not using proxies or when `lookedupNode`
     * is not a `lookup node`. (
     *  WHAT?: Since in ternary operator we fallback to `node` for `lookedupNode`
     *  it's possible that `lookedupNode` exists but not a lookup node really.
     * )
     */
    if (!this._useProxies || !this._isLookUpNode(lookedupNode)) {
      return value as T
    }

    /**
     * Wrap object inside proxy
     */
    if (this._isObject(value)) {
      return (new IoCProxyObject(lookedupNode.namespace, value, this) as unknown) as T
    }

    /**
     * Wrap class inside proxy
     */
    if (this._isClass(value)) {
      return (IocProxyClass(lookedupNode.namespace, value, this) as unknown) as T
    }

    /**
     * Return the value as it is
     */
    return value as T
  }

  /**
   * Use the fake for a given namespace. You don't have to manually
   * read values from this method, unless you know what you are
   * doing.
   *
   * This method is internally used by ioc container proxy objects to
   * point to a fake when `useProxies` is called and fake exists.
   */
  public useFake<T extends any = any> (namespace: string): T {
    const fake = this._fakes.get(namespace)

    if (!fake) {
      throw new Error(`Cannot find fake for ${namespace}`)
    }

    if (!fake.cachedValue) {
      fake.cachedValue = fake.callback(this)
    }

    return fake.cachedValue as T
  }

  /**
   * A boolean telling if a fake exists for a binding or
   * not.
   */
  public hasFake (namespace: string): boolean {
    return this._fakes.has(namespace)
  }

  /**
   * Returns a boolean telling if an alias
   * exists
   */
  public hasAlias (namespace: string): boolean {
    return !!this._aliases[namespace]
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
  public hasBinding (namespace: string, checkAliases = false): boolean {
    const binding = this._bindings[namespace]
    if (!binding && checkAliases) {
      return !!this._bindings[this.getAliasNamespace(namespace)!]
    }

    return !!binding
  }

  /**
   * Returns the complete namespace for a given alias. To avoid
   * `undefined` values, it is recommended to use `hasAlias`
   * before using this method.
   */
  public getAliasNamespace (namespace: string): string | undefined {
    return this._aliases[namespace]
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
  public isAutoloadNamespace (namespace: string): boolean {
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
  public getAutoloadBaseNamespace (namespace: string): string | undefined {
    return this.autoloadedAliases.find((alias) => namespace.startsWith(`${alias}/`))
  }

  /**
   * Restore the fake
   */
  public restore (name: string): void {
    this._fakes.delete(name)
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
  public with (namespaces: string[], callback: (...args: any[]) => void): void {
    this._ensureCallback(callback, 'ioc.with expect 2nd argument to be a function')
    if (namespaces.every((namespace) => this.hasBinding(namespace, true))) {
      callback(...namespaces.map((namespace) => this.use(namespace)))
    }
  }

  /**
   * Call method on an object and inject dependencies to it automatically.
   */
  public call<T extends object, K extends keyof T = any> (target: T, method: K, args?: any[]): any {
    let injections = []
    if (target.constructor.hasOwnProperty('inject')) {
      injections = target.constructor['inject'][method] || []
    }

    const parentName = target.constructor.name
    if (typeof (target[method]) !== 'function') {
      throw new Error(`Missing method ${method} on ${parentName}`)
    }

    return target[method as string](
      ...this._makeDependencies(`${parentName}.${method}`, injections, args || []),
    )
  }

  /**
   * Lookup a namespace and return it's lookup node. The lookup node can speed
   * up resolving of namespaces via `use`, `useEsm` or `make` methods.
   */
  public lookup (
    namespace: string,
    prefixNamespace?: string,
  ): null | LookupNode {
    /**
    * Ensure namespace is defined
    */
    if (!namespace) {
      throw new Exception(
        'Empty string cannot be used as IoC container reference',
        500,
        'E_INVALID_IOC_NAMESPACE',
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
}
