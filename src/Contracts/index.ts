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
 * Custom traces must implement this interface
 */
export interface TracerContract extends EventEmitter {
  in (namespace: string, cached: boolean): void
  out (): void
}

/**
 * Shape of resolved lookup node, resolved using `getResolver().resolve()`
 * method.
 */
export type IocResolverLookupNode = {
  namespace: string,
  type: 'binding' | 'autoload',
  method: string,
}

/**
 * The resolve is used to resolve and cache IoC container
 * bindings that are meant to stay static through out
 * the application and reduce the cost of lookup
 * on each iteration.
 */
export interface IocResolverContract {
  resolve (namespace: string, prefixNamespace?: string): IocResolverLookupNode
  call<T extends any> (namespace: string | IocResolverLookupNode, prefixNamespace?: string, args?: any[]): T
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
  fake (namespace: string, callback: BindFakeCallback): void
  autoload (directoryPath: string, namespace: string): void

  use<T extends any = any> (namespace: string | LookupNode): T
  make<T extends any = any> (namespace: string | LookupNode, args?: any[]): T
  useFake<T extends any = any> (namespace: string, value?: any): T

  hasFake (namespace: string): boolean
  hasAlias (namespace: string): boolean
  hasBinding (namespace: string, checkAliases?: boolean): boolean

  getAliasNamespace (namespace: string): string | undefined
  isAutoloadNamespace (namespace: string): boolean
  getAutoloadBaseNamespace (namespace: string): string | undefined

  clearAutoloadCache (namespace?: string, clearRequireCache?: boolean): void
  restore (namespace: string): void

  with (namespaces: string[], cb: (...args: any[]) => void): void
  call<T extends object, K extends keyof T = any> (target: T, method: K, args: any[]): any
  lookup (namespace: string, prefixNamespace?: string): LookupNode | null

  getResolver (
    fallbackMethod?: string,
    rcNamespaceKey?: string,
    fallbackNamespace?: string,
  ): IocResolverContract
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
 * Shape of fakes binding stored inside the IoC container
 */
export type FakeBinding = {
  callback: BindFakeCallback,
  cachedValue?: unknown,
}

/**
 * Shape of lookup node pulled using `ioc.lookup` method. This node
 * can be passed to `ioc.use`, or `ioc.make` or `ioc.useEsm` to
 * skip many checks and resolve the binding right away.
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
export type BindFakeCallback = (app: IocContract, value?: any) => unknown
