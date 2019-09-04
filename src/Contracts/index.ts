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

import { EventEmitter } from 'events'
export interface TracerContract extends EventEmitter {
  in (namespace: string, cached: boolean): void
  out (): void
}

/**
 * Ioc container interface
 */
export interface IocContract {
  tracer: TracerContract,
  autoloads: { [namespace: string]: string },
  autoloadedAliases: string[],
  useProxies (): this,
  bind (namespace: string, callback: BindCallback): void
  singleton (namespace: string, callback: BindCallback): void
  alias (namespace: string, alias: string): void
  autoload (directoryPath: string, namespace: string): void
  clearAutoloadCache (namespace?: string, clearRequireCache?: boolean): void
  fake (namespace: string, callback: BindCallback): void
  use<T extends any = any> (namespace: string | LookupNode): T
  useEsm<T extends any = any> (namespace: string | LookupNode): T
  make<T extends any = any> (namespace: string | LookupNode, args?: string[]): T
  useFake<T extends any = any> (namespace: string): T
  hasFake (namespace: string): boolean
  hasAlias (namespace: string): boolean
  hasBinding (namespace: string, checkAliases?: boolean): boolean
  getAliasNamespace (namespace: string): string | undefined
  isAutoloadNamespace (namespace: string): boolean
  getAutoloadBaseNamespace (namespace: string): string | undefined
  restore (namespace: string): void
  with (namespaces: string[], cb: (...args: any[]) => void): void
  call<T extends object, K extends keyof T = any> (target: T, method: K, args: any[]): any
  lookup (namespace: string, prefixNamespace?: string): LookupNode | null
}

/**
 * Shape of binding stored inside the IoC container
 */
export type Binding = {
  callback: BindCallback,
  singleton: boolean,
  cachedValue?: unknown,
}

/**
 * Shape of lookup node pulled using `ioc.lookup` method. This node
 * can be passed to `ioc.use`, or `ioc.make` or `ioc.useEsm` to
 * skip many checks and resolve the right thing
 */
export type LookupNode = {
  namespace: string,
  type: 'binding' | 'autoload',
}

/**
 * Shape of autoloaded cache entry
 */
export type AutoloadCacheItem = {
  diskPath: string,
  cachedValue: any,
}

export type BindCallback = (app: IocContract) => unknown
