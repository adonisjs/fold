/*
 * @adonisjs/fold
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { IocContract, IocResolverLookupNode, IocResolverContract } from '../Contracts'

/**
 * Exposes the API to resolve and call bindings from the IoC container. The resolver
 * internally caches the IoC container lookup nodes to boost performance.
 */
export class IocResolver implements IocResolverContract<any> {
	private lookupCache: { [key: string]: IocResolverLookupNode<string> } = {}

	/**
	 * The namespace that will be used as a prefix when resolving
	 * bindings
	 */
	private prefixNamespace = this.getPrefixNamespace()

	constructor(
		private container: IocContract,
		private fallbackMethod?: string,
		private rcNamespaceKey?: string,
		private fallbackNamespace?: string
	) {}

	/**
	 * Returns the prefix namespace by giving preference to the
	 * `.adonisrc.json` file
	 */
	private getPrefixNamespace(): string | undefined {
		/**
		 * Use fallback namespace, when lookup inside rcFile is not required
		 */
		if (!this.rcNamespaceKey) {
			return this.fallbackNamespace
		}

		/**
		 * If container doesn't have `Application` binding, then there is no
		 * way for us to read rcFile namespaces and hence we use the fallback
		 * namespace
		 */
		if (!this.container.hasBinding('Adonis/Core/Application')) {
			return this.fallbackNamespace
		}

		/**
		 * Attempt to resolve the rcNamespace key from the rcFile
		 * For example: The rc file has following namespaces
		 * {
		 *   "controllers": "App/Controllers/Http"
		 * }
		 * We will use the value next to the `controllers` key
		 */
		const application = this.container.use('Adonis/Core/Application')
		return application.namespacesMap.get(this.rcNamespaceKey) || this.fallbackNamespace
	}

	/**
	 * Resolves the namespace and returns it's lookup node
	 */
	public resolve(
		namespace: string,
		prefixNamespace: string | undefined = this.prefixNamespace
	): IocResolverLookupNode<string> {
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
		 * NOTE: We are not fetching the binding, we are just checking for it's
		 * existence. In case of directory aliases, it's quite possible that
		 * the binding check passes and the actual file is missing on the
		 * disk
		 */
		if (!lookupNode) {
			this.container.onLookupFailed(tokens.join('.'))
		}

		this.lookupCache[cacheKey] = { ...lookupNode, method }
		return this.lookupCache[cacheKey]
	}

	/**
	 * Calls the namespace.method expression with any arguments that needs to
	 * be passed. Also supports type-hinting dependencies.
	 */
	public call(
		namespace: string | IocResolverLookupNode<string>,
		prefixNamespace?: string,
		args?: any[]
	): any {
		const lookupNode =
			typeof namespace === 'string' ? this.resolve(namespace, prefixNamespace) : namespace

		return this.container.call(
			this.container.make(lookupNode.namespace),
			lookupNode.method,
			args || []
		)
	}
}
