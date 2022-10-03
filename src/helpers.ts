/*
 * @adonisjs/fold
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import type { Constructor } from './types.js'

/**
 * Type guard and check if value is a class constructor. Plain old
 * functions are not considered as class constructor.
 */
export function isClass<T>(value: unknown): value is Constructor<T> {
  return typeof value === 'function' && value.toString().startsWith('class ')
}
