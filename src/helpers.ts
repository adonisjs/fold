/*
 * @adonisjs/fold
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Exception } from '@poppinss/utils'
const toString = Function.prototype.toString

/**
 * Returns a boolean telling if value is an esm module
 * with `export default`.
 */
export function isEsm(value: any): boolean {
  return value && value.__esModule
}

/**
 * Returns a boolean telling if value is a primitive or object constructor.
 */
export function isPrimtiveConstructor(value: any): boolean {
  return [String, Function, Object, Date, Number, Boolean].indexOf(value) > -1
}

/**
 * Returns a function telling if value is a class or not
 */
export function isClass(fn: any) {
  return typeof fn === 'function' && /^class\s/.test(toString.call(fn))
}

/**
 * Returns a boolean to differentiate between null and objects
 * and arrays too
 */
export function isObject(value: any): boolean {
  return value && typeof value === 'object' && !Array.isArray(value)
}

/**
 * Raises error with a message when callback is not
 * a function.
 */
export function ensureIsFunction(callback: Function, message: string) {
  if (typeof callback !== 'function') {
    throw new Exception(message, 500, 'E_RUNTIME_EXCEPTION')
  }
}

/**
 * Clears the require cache for a given module
 */
export function clearRequireCache(modulePath: string) {
  const cacheItem = require.cache[modulePath]
  if (!cacheItem) {
    return
  }

  /**
   * Just remove the module, when there is no
   * parent
   */
  delete require.cache[modulePath]
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
