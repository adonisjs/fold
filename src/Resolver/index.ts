/*
* @poppinss/utils
*
* (c) Harminder Virk <virk@adonisjs.com>
*
* For the full copyright and license information, please view the LICENSE
* file that was distributed with this source code.
*/

import { IocContract } from '../Contracts'
import { Exception } from '@poppinss/utils'

/**
 * Shape of IoC resolver lookup node
 */
export type IocResolverLookupNode = {
  namespace: string,
  type: 'binding' | 'autoload',
  method: string,
}

/**
 * Exposes the API to resolve and call bindings from the IoC container. The resolver
 * internally caches the IoC container lookup nodes to boost performance.
 */
export class IocResolver {
  private lookupCache: { [key: string]: IocResolverLookupNode } = {}

  /**
   * The namespace that will be used a prefix when resolving
   * bindings
   */
  private prefixNamespace = this.getPrefixNamespace()

  constructor (
    private container: IocContract,
    private fallbackMethod?: string,
    private rcNamespaceKey?: string,
    private fallbackNamespace?: string,
  ) {}

  /**
   * Returns the prefix namespace by giving preference to the
   * `.adonisrc.json` file
   */
  private getPrefixNamespace (): string | undefined {
    if (!this.rcNamespaceKey) {
      return this.fallbackNamespace
    }

    try {
      const application = this.container.use('Adonis/Core/Application')
      return application.namespacesMap.get(this.rcNamespaceKey) || this.fallbackNamespace
    } catch (error) {
      return this.fallbackNamespace
    }
  }

  /**
   * Resolves the namespace and returns it's lookup node
   */
  public resolve (
    namespace: string,
    prefixNamespace: string | undefined = this.prefixNamespace,
  ): IocResolverLookupNode {
    const cacheKey = prefixNamespace ? `${prefixNamespace}/${namespace}` : namespace

    /**
     * Return from cache, when the node exists
     */
    const cacheNode = this.lookupCache[cacheKey]
    if (cacheNode) {
      return cacheNode
    }

    let method = this.fallbackMethod || 'handle'

    /**
     * Split the namespace to lookup the method on it. If method isn't
     * defined, we will use the conventional `handle` method.
     */
    const tokens = namespace.split('.')
    if (tokens.length > 1) {
      method = tokens.pop()!
    }

    const lookupNode = this.container.lookup(tokens.join('.'), prefixNamespace)

    /**
     * Raise exception when unable to resolve the binding from the container.
     * NOTE: We are not making fetching the binding, we are just checking
     * for it's existence. In case of autoloads, it's quite possible
     * that the binding check passes and the actual file is missing
     * on the disk
     */
    if (!lookupNode) {
      throw new Exception(`Unable to resolve ${tokens.join('.')} namespace from IoC container`)
    }

    this.lookupCache[cacheKey] = { ...lookupNode, method }
    return this.lookupCache[cacheKey]
  }

  /**
   * Calls the namespace.method expression with any arguments that needs to
   * be passed. Also supports type-hinting dependencies.
   */
  public call<T extends any> (
    namespace: string | IocResolverLookupNode,
    prefixNamespace?: string,
    args?: any[],
  ): T {
    const lookupNode = typeof (namespace) === 'string'
      ? this.resolve(namespace, prefixNamespace)
      : namespace

    return this.container.call(this.container.make(lookupNode.namespace), lookupNode.method, args || [])
  }
}
