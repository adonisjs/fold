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
  bind (name: string, callback: BindCallback): void
  singleton (name: string, callback: BindCallback): void
  alias (namespace: string, alias: string): void
  autoload (directoryPath: string, namespace: string): void
  clearAutoloadCache (namespace?: string, clearRequireCache?: boolean): void
  fake (name: string, callback: BindCallback): void
  use<T extends any = any> (name: string): T
  useEsm<T extends any = any> (name: string): T
  make<T extends any = any> (name: string, args?: string[]): T
  useFake<T extends any = any> (name: string): T
  hasFake (name: string): boolean
  hasAlias (name: string): boolean
  hasBinding (namespace: string, checkAliases?: boolean): boolean
  getAliasNamespace (name: string): string | undefined
  isAutoloadNamespace (namespace: string): boolean
  getAutoloadBaseNamespace (namespace: string): string | undefined
  restore (name: string): void
  with (namespaces: string[], cb: (...args: any[]) => void): void
  call<T extends object, K extends keyof T = any> (target: T, method: K, args: any[]): any
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
 * Shape of autoloaded cache entry
 */
export type AutoloadCacheItem = {
  diskPath: string,
  cachedValue: any,
}

export type BindCallback = (app: IocContract) => unknown
