/*
 * @adonisjs/fold
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Exception } from '@poppinss/utils'

export class MissingDefaultExportException extends Exception {
  static code = 'E_MISSING_DEFAULT_EXPORT'
  static status = 500
}
