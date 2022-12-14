/*
 * @adonisjs/fold
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Exception } from '@poppinss/utils'

export class InvalidAliasKeyException extends Exception {
  static code = 'E_INVALID_ALIAS_KEY'
  static status = 500
  static message = 'The container alias key must be of type "string" or "symbol"'
}
