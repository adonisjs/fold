/*
 * @adonisjs/fold
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Exception } from '@poppinss/utils'

/**
 * Raised when unable to lookup a namespace
 */
export class IocLookupException extends Exception {
  public static lookupFailed(namespace: string) {
    return new this(
      `Cannot resolve "${namespace}" namespace from the IoC Container`,
      500,
      'E_IOC_LOOKUP_FAILED'
    )
  }

  /**
   * Invalid namespace type
   */
  public static invalidNamespace() {
    return new this(
      '"Ioc.lookup" accepts a namespace string or a lookup node',
      500,
      'E_INVALID_IOC_NAMESPACE'
    )
  }

  /**
   * Fake is missing and yet resolved
   */
  public static missingFake(namespace: string) {
    return new this(`Cannot resolve fake for "${namespace}" namespace`, 500, 'E_MISSING_IOC_FAKE')
  }
}
