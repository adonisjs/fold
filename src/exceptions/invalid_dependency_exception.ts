/*
 * @adonisjs/fold
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Exception } from '@poppinss/utils'

export class InvalidDependencyException extends Exception {
  static code = 'E_INVALID_CONTAINER_DEPENDENCY'
  static status = 500
  static message = 'Cannot inject "{{ value }}". The value cannot be constructed'
}
