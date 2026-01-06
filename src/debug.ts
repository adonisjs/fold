/*
 * @adonisjs/fold
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { debuglog } from 'node:util'

/**
 * Debug logger instance for the Fold container module
 *
 * Enable debugging by setting the NODE_DEBUG environment variable:
 *
 * @example
 * ```ts
 * // Enable debug logs
 * process.env.NODE_DEBUG = 'adonisjs:fold'
 *
 * // Use the logger
 * debug('binding resolved: %s', 'route')
 * ```
 */
export default debuglog('adonisjs:fold')
