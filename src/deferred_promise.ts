/*
 * @adonisjs/fold
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

/**
 * A promise wrapper that exposes the `resolve` and `reject` methods as part of the
 * class public API.
 *
 * It allows resolving and rejecting promises outside of the
 * promise constructor callback.
 *
 * @template T - The type of value the promise will resolve to
 *
 * @example
 * ```ts
 * const deferred = new Deferred<string>()
 *
 * // Resolve from anywhere
 * deferred.resolve('Hello')
 *
 * // Or reject
 * deferred.reject(new Error('Failed'))
 *
 * // Wait for resolution
 * await deferred.promise
 * ```
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
