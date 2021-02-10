/*
 * @adonisjs/fold
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { normalize } from 'path'
import { IocContract } from '../Contracts'
import { IocLookupException } from '../Exceptions/IocLookupException'

/**
 * Manages the import aliases
 */
export class ImportAliases {
  /**
   * Registered aliases
   */
  public list: { [alias: string]: string } = {}

  /**
   * In-memory require cache to speed up lookup calls. Yes, "require"
   * is slow. Check "perf/require.js"
   */
  private requireCache: Map<string, { diskPath: string; value: any }> = new Map()

  constructor(private container: IocContract) {}

  /**
   * Returns the matching alias for the given namespace
   */
  private getPathAlias(namespace: string): string | undefined {
    return Object.keys(this.list).find((alias) => {
      return namespace.startsWith(`${alias}/`)
    })
  }

  /**
   * Returns path for a given alias
   */
  private makeAliasPath(namespace: string, alias: string) {
    return normalize(namespace.replace(alias, this.list[alias]))
  }

  /**
   * Register an import alias
   */
  public register(absolutePath: string, alias: string): this {
    this.list[alias] = absolutePath
    return this
  }

  /**
   * Find if a namespace is part of the import aliases
   */
  public has(namespace: string): boolean {
    return !!this.getPathAlias(namespace)
  }

  /**
   * Import the namespace from the registered import aliases.
   */
  public resolve(namespace: string) {
    const alias = this.getPathAlias(namespace)
    if (!alias) {
      throw IocLookupException.lookupFailed(namespace)
    }

    const cacheItem = this.requireCache.get(namespace)
    if (cacheItem) {
      return cacheItem.value
    }

    /**
     * Absolute path to the module
     */
    const diskPath = this.makeAliasPath(namespace, alias)

    /**
     * Require the module
     */
    const value = require(diskPath)

    /**
     * Cache the output
     */
    this.requireCache.set(namespace, { diskPath, value })

    /**
     * Return the value
     */
    return value
  }

  /**
   * Same as [[resolve]] but uses ES modules
   */
  public async resolveAsync(namespace: string) {
    /**
     * Piggy back on resolve when using cjs module system
     */
    if (this.container.module === 'cjs') {
      return this.resolve(namespace)
    }

    const alias = this.getPathAlias(namespace)
    if (!alias) {
      throw IocLookupException.lookupFailed(namespace)
    }

    /**
     * Import the module. The following code will only compile to esm
     * when the output of this build is esm
     */
    return import(this.makeAliasPath(namespace, alias))
  }
}
