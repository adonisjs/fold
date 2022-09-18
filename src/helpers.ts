/*
 * @adonisjs/fold
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import type { Constructor } from './types.js'

const toString = Function.prototype.toString

/**
 * Type guard and check if value is a class constructor. Plain old
 * functions are not considered as class constructor.
 */
export function isClass<T>(value: any): value is Constructor<T> {
  return typeof value === 'function' && /^class\s/.test(toString.call(value))
}
