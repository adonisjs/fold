/*
 * @adonisjs/fold
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Exception } from '@poppinss/utils'

export class MethodNotFoundException extends Exception {
  static code = 'E_METHOD_NOT_FOUND'
  static status = 500
  static message = 'Missing method "{{ method }}" on "{{ object }}"'
}
