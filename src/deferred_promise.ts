/*
 * @adonisjs/fold
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

/**
 * Exports the `resolve` and the reject methods as part of the
 * class public API.
 *
 * It allows resolving and rejecting promises outside of the
 * class constructor.
 */
export class Deferred<T> {
  /**
   * Function to resolve the promise with a value
   */
  resolve!: (value: T | PromiseLike<T>) => void

  /**
   * Function to reject the promise with a reason
   */
  reject!: (reason?: any) => void

  /**
   * The underlying promise instance
   */
  promise: Promise<T> = new Promise<T>((resolve, reject) => {
    this.reject = reject
    this.resolve = resolve
  })
}
