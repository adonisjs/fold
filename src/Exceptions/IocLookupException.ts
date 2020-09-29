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
}
