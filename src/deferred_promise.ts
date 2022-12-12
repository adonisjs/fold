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
  resolve!: (value: T | PromiseLike<T>) => void
  reject!: (reason?: any) => void
  promise: Promise<T> = new Promise<T>((resolve, reject) => {
    this.reject = reject
    this.resolve = resolve
  })
}
