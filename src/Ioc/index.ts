/*
 * @adonisjs/fold
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Exception } from '@poppinss/utils'
import { types } from '@poppinss/utils/build/helpers'
import { IocContract, BindCallback, FakeCallback, LookupNode, InferMakeType } from '../Contracts'

import { Fakes } from './Fakes'
import { Bindings } from './Bindings'
import { Injector } from './Injector'
import { IocResolver } from '../Resolver'
import { ImportAliases } from './ImportAliases'
import { ensureIsFunction, isEsm } from '../helpers'
import { IocProxyClass, IocProxyObject } from './IocProxy'
import { IocLookupException } from '../Exceptions/IocLookupException'

export class Ioc implements IocContract {
  private fakes: Fakes = new Fakes(this)
  private bindings: Bindings = new Bindings(this)
  private injector: Injector = new Injector(this)
  private aliases: ImportAliases = new ImportAliases(this)

  /**
   * The current state of using proxies
   */
  private usingProxies: boolean = false

  /**
   * A custom method to trap `ioc.use` and `ioc.make` statements
   */
  private trapCallback: (namespace: string) => any

  /**
   * Define the module type for resolving auto import aliases. Defaults
   * to `cjs`
   */
  public module: 'cjs' | 'esm' = 'cjs'

  /**
   * Registered aliases. The key is the alias and value is the
   * absolute directory path
   */
  public get importAliases(): IocContract['importAliases'] {
    return this.aliases.list
  }

  /**
   * Detect if the module export value is an esm module
   */
  private isEsm(value: any) {
    return this.module === 'esm' ? true : isEsm(value)
  }

  /**
   * Wraps object and class to a proxy to enable the fakes
   * API
   */
  private wrapAsProxy(namespace: string, value: any) {
    /**
     * Wrap objects inside proxy
     */
    if (types.isObject(value)) {
      return new IocProxyObject(namespace, value, this.fakes)
    }

    /**
     * Wrap class inside proxy
     */
    if (types.isClass(value)) {
      return IocProxyClass(namespace, value, this.fakes)
    }

    return value
  }

  /**
   * Wrap value inside proxy by also inspecting for esm
   * default exports
   */
  private wrapEsmModuleAsProxy(namespace: string, value: any) {
    /**
     * Wrap the default export of esm modules inside in a proxy and
     * not the entire module
     */
    if (this.isEsm(value)) {
      if (value.default) {
        /**
         * We should never mutate the actual ESM module object and always clone it first
         * for abvious reasons that objects are shared by reference
         */
        const clonedModule = Object.getOwnPropertyNames(value).reduce<any>((result, key) => {
          result[key] = value[key]
          return result
        }, {})

        clonedModule.default = this.wrapAsProxy(namespace, clonedModule.default)
        return clonedModule
      }

      /**
       * We don't proxy named exports as we don't have a good story on what to proxy
       *
       * - Should we proxy the whole module?
       * - Or should be expose api to allow proxying a selected set of modules
       */
      return value
    }

    return this.wrapAsProxy(namespace, value)
  }

  /**
   * Makes an instance of a class by injecting dependencies
   */
  private makeRaw<T extends any>(value: T, args?: any[]): InferMakeType<T> {
    return this.injector.make(value, args || [])
  }

  /**
   * Makes an instance of a class asynchronously by injecting dependencies
   */
  private async makeRawAsync<T extends any>(value: T, args?: any[]): Promise<InferMakeType<T>> {
    return this.injector.makeAsync(value, args || [])
  }

  /**
   * Enable/disable proxies. Proxies are mainly required for fakes to
   * work
   */
  public useProxies(enable: boolean = true): this {
    this.usingProxies = !!enable
    return this
  }

  /**
   * Register a binding with a callback. The callback return value will be
   * used when binding is resolved
   */
  public bind(binding: string, callback: BindCallback<any, this>): this {
    ensureIsFunction(callback, '"ioc.bind" expect 2nd argument to be a function')
    this.bindings.register(binding, callback, false)
    return this
  }

  /**
   * Same as the [[bind]] method, but registers a singleton only. Singleton's callback
   * is invoked only for the first time and then the cached value is used
   */
  public singleton(binding: string, callback: BindCallback<any, this>): this {
    ensureIsFunction(callback, '"ioc.singleton" expect 2nd argument to be a function')
    this.bindings.register(binding, callback, true)
    return this
  }

  /**
   * Define an import alias
   */
  public alias(absolutePath: string, alias: string): this {
    this.aliases.register(absolutePath, alias)
    return this
  }

  /**
   * Register a fake for a namespace. Fakes works both for "bindings" and "import aliases".
   * Fakes only work when proxies are enabled using "useProxies".
   */
  public fake(namespace: string, callback: FakeCallback<any, this>): this {
    ensureIsFunction(callback, '"ioc.fake" expect 2nd argument to be a function')
    this.fakes.register(namespace, callback)
    return this
  }

  /**
   * Clear selected or all the fakes. Calling the method with no arguments
   * will clear all the fakes
   */
  public restore(namespace?: string): this {
    namespace ? this.fakes.delete(namespace) : this.fakes.clear()
    return this
  }

  /**
   * Find if a fake has been registered for a given namespace
   */
  public hasFake(namespace: string): boolean {
    return this.fakes.has(namespace)
  }

  /**
   * Find if a binding exists for a given namespace
   */
  public hasBinding(namespace: string): boolean {
    return this.bindings.has(namespace)
  }

  /**
   * Find if a namespace is part of the auto import aliases. Returns false, when namespace
   * is an alias path but has an explicit binding too
   */
  public isAliasPath(namespace: string): boolean {
    if (this.bindings.has(namespace)) {
      return false
    }

    return this.aliases.has(namespace)
  }

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
  public lookup(namespace: string | LookupNode<string>, prefixNamespace?: string): null | any {
    if (typeof namespace !== 'string' && namespace['namespace'] && namespace['type']) {
      return namespace
    }

    /**
     * Ensure namespace is defined as a string only
     */
    if (typeof namespace !== 'string') {
      throw IocLookupException.invalidNamespace()
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
        namespace: namespace,
      }
    }

    /**
     * Namespace is an alias
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
   * Same as [[lookup]]. But raises exception instead of returning null
   */
  public lookupOrFail(
    namespace: string | LookupNode<string>,
    prefixNamespace?: string
  ): LookupNode<string> {
    const lookupNode = this.lookup(namespace, prefixNamespace)
    if (!lookupNode) {
      throw IocLookupException.lookupFailed(namespace as string)
    }

    return lookupNode
  }

  /**
   * Resolve a binding by invoking the binding factory function. An exception
   * is raised, if the binding namespace is unregistered.
   */
  public resolveBinding(binding: string) {
    if (this.trapCallback) {
      return this.trapCallback(binding)
    }

    const value = this.bindings.resolve(binding)
    if (this.usingProxies) {
      return this.wrapAsProxy(binding, value)
    }

    return value
  }

  /**
   * Import namespace from the auto import aliases. This method assumes you are
   * using native ES modules
   */
  public async import(namespace: string) {
    if (this.trapCallback) {
      return this.trapCallback(namespace)
    }

    const value = await this.aliases.resolveAsync(namespace)
    if (this.usingProxies) {
      return this.wrapEsmModuleAsProxy(namespace, value)
    }

    return value
  }

  /**
   * Same as the "import" method, but uses CJS for requiring the module from its
   * path
   */
  public require(namespace: string) {
    if (this.trapCallback) {
      return this.trapCallback(namespace)
    }

    const value = this.aliases.resolve(namespace)
    if (this.usingProxies) {
      return this.wrapEsmModuleAsProxy(namespace, value)
    }

    return value
  }

  /**
   * The use method looks up a namespace inside both the bindings and the
   * auto import aliases
   */
  public use(namespace: string | LookupNode<string>) {
    if (this.trapCallback) {
      return this.trapCallback(typeof namespace === 'string' ? namespace : namespace['namespace'])
    }

    const lookupNode = this.lookupOrFail(namespace)
    if (lookupNode.type === 'alias') {
      return this.require(lookupNode.namespace)
    }

    return this.resolveBinding(lookupNode.namespace)
  }

  /**
   * Same as the [[use]] method, but instead uses ES modules for resolving
   * the auto import aliases
   */
  public async useAsync(namespace: string | LookupNode<string>) {
    if (this.trapCallback) {
      return this.trapCallback(typeof namespace === 'string' ? namespace : namespace['namespace'])
    }

    const lookupNode = this.lookupOrFail(namespace)
    if (lookupNode.type === 'alias') {
      return this.import(lookupNode.namespace)
    }

    return this.resolveBinding(lookupNode.namespace)
  }

  /**
   * Makes an instance of the class by first resolving it.
   */
  public make(namespace: LookupNode<string> | any, args?: any[]) {
    const isContainerNamespace =
      typeof namespace === 'string' || (namespace['namespace'] && namespace['type'])

    /**
     * Value is not a container namespace or a lookup
     * node
     */
    if (!isContainerNamespace) {
      return this.makeRaw(namespace, args)
    }

    /**
     * Invoke trap callback (if registered)
     */
    if (this.trapCallback) {
      return this.trapCallback(typeof namespace === 'string' ? namespace : namespace['namespace'])
    }

    const lookupNode = this.lookupOrFail(namespace)

    /**
     * We do not touch bindings at all. The factory function
     * return value is used as it is
     */
    if (lookupNode.type === 'binding') {
      return this.resolveBinding(lookupNode.namespace)
    }

    const value = this.require(lookupNode.namespace)

    /**
     * We attempt to make an instance of only the export
     * default of a ES module
     */
    if (this.isEsm(value) && value.default) {
      return this.makeRaw(value.default, args || [])
    }

    return this.makeRaw(value, args)
  }

  /**
   * Same as the [[make]] method, but instead uses ES modules for resolving
   * the auto import aliases
   */
  public async makeAsync(namespace: LookupNode<string> | any, args?: any[]) {
    const isContainerNamespace =
      typeof namespace === 'string' || (namespace['namespace'] && namespace['type'])

    /**
     * Value is not a container namespace or a lookup
     * node
     */
    if (!isContainerNamespace) {
      return this.makeRawAsync(namespace, args)
    }

    /**
     * Invoke trap callback (if registered)
     */
    if (this.trapCallback) {
      return this.trapCallback(typeof namespace === 'string' ? namespace : namespace['namespace'])
    }

    const lookupNode = this.lookupOrFail(namespace)

    /**
     * We do not touch bindings at all. The factory function
     * return value is used as it is
     */
    if (lookupNode.type === 'binding') {
      return this.resolveBinding(lookupNode.namespace)
    }

    const value = await this.import(lookupNode.namespace)

    /**
     * We attempt to make an instance of only the export
     * default of a ES module
     */
    if (this.isEsm(value) && value.default) {
      return this.makeRawAsync(value.default, args || [])
    }

    return this.makeRawAsync(value, args)
  }

  /**
   * Define a callback to be called when all of the container
   * bindings are available.
   *
   * Note: This method is exclusive for bindings and doesn't resolve
   * auto import aliases
   */
  public withBindings(namespaces: readonly any[], cb: (...args: any) => void): void {
    if (namespaces.every((namespace) => this.hasBinding(namespace))) {
      /**
       * The callback accepts a tuple, whereas map returns an array. So we
       * need to cast the value to any by hand
       */
      cb(...namespaces.map((namespace) => this.resolveBinding(namespace)))
    }
  }

  /**
   * @deprecated: Use "withBindings" instead
   */
  public with(namespaces: readonly any[], cb: (...args: any) => void): void {
    process.emitWarning(
      'DeprecationWarning',
      'container.with() is deprecated. Use container.withBindings() instead'
    )
    return this.withBindings(namespaces, cb)
  }

  /**
   * Call method on an object and automatically resolve its depdencies
   */
  public call(target: any, method: any, args?: any[]) {
    if (typeof target[method] !== 'function') {
      throw new Exception(`Missing method "${method}" on "${target.constructor.name}"`)
    }

    return this.injector.call(target, method as string, args || [])
  }

  /**
   * Same as [[call]], but uses ES modules for resolving the auto
   * import aliases
   */
  public async callAsync(target: any, method: any, args?: any[]) {
    if (typeof target[method] !== 'function') {
      throw new Exception(`Missing method "${method}" on "${target.constructor.name}"`)
    }

    return this.injector.callAsync(target, method as string, args || [])
  }

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
  public trap(callback: (namespace: string) => any): this {
    this.trapCallback = callback
    return this
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
