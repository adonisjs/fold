/*
 * @adonisjs/fold
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { RuntimeException } from '@poppinss/utils'

import type { Constructor } from './types.js'
import { Deferred } from './deferred_promise.js'

/**
 * Type guard and check if value is a class constructor. Plain old
 * functions are not considered as class constructor.
 */
export function isClass<T>(value: unknown): value is Constructor<T> {
  return typeof value === 'function' && value.toString().startsWith('class ')
}

/**
 * Runs a function inside an async function. This ensure that syncrohonous
 * errors are handled in the same way rejected promise is handled
 */
async function runAsAsync(callback: Function, args: any[]) {
  return callback(...args)
}

/**
 * Converts a function to a self contained queue, where each call to
 * the function is queued until the first call resolves or rejects.
 *
 * After the first call, the value is cached and used forever.
 */
export function enqueue(callback: Function) {
  /**
   * A flag to know if we are in the middleware of computing the
   * value.
   */
  let isComputingValue = false

  /**
   * The computed after the callback resolves
   */
  let computedValue: { value?: any; completed: boolean } = { completed: false }

  /**
   * The computed error the callback resolves
   */
  let computedError: { error?: any; completed: boolean } = { completed: false }

  /**
   * The internal queue of deferred promises.
   */
  let queue: Deferred<any>[] = []

  /**
   * Resolve pending queue promises
   */
  function resolvePromises(value: any) {
    isComputingValue = false
    computedValue.completed = true
    computedValue.value = value
    queue.forEach((promise) => promise.resolve(value))
    queue = []
  }

  /**
   * Reject pending queue promises
   */
  function rejectPromises(error: any) {
    isComputingValue = false
    computedError.completed = true
    computedError.error = error
    queue.forEach((promise) => promise.reject(error))
    queue = []
  }

  return function (...args: any): Promise<{ value: any; cached: boolean }> {
    /**
     * Already has value
     */
    if (computedValue.completed) {
      return computedValue.value
    }

    /**
     * Already ended with error
     */
    if (computedError.completed) {
      throw computedError.error
    }

    /**
     * In process, returning a deferred promise
     */
    if (isComputingValue) {
      const promise = new Deferred<{ value: any; cached: true }>()
      queue.push(promise)
      return promise.promise
    }

    isComputingValue = true

    /**
     * We could have removed this promise in favor of async/await. But then
     * we will have to call "resolvePromises" before returning the value.
     * However, we want the following promise to resolve first and
     * then resolve all other deferred promises.
     */
    return new Promise((resolve, reject) => {
      runAsAsync(callback, args)
        .then((value) => {
          resolve({ value, cached: false })
          resolvePromises({ value, cached: true })
        })
        .catch((error) => {
          reject(error)
          rejectPromises(error)
        })
    })
  }
}

/**
 * Dynamically import a module and ensure it has a default export
 */
export async function resolveDefault(importPath: string, parentURL: URL | string) {
  const resolvedPath = await import.meta.resolve!(importPath, parentURL)
  const moduleExports = await import(resolvedPath)

  /**
   * Make sure a default export exists
   */
  if (!moduleExports.default) {
    throw new RuntimeException(`Missing export default from "${importPath}" module`, {
      cause: {
        source: resolvedPath,
      },
    })
  }

  return moduleExports.default
}

/**
 * - if `import.meta.hot` is true then the callback will always be evaluated
 * - otherwise, the callback will be evaluated only when the cached value is missing
 */
export async function resolveCachedWithHotFallback(cachedValue: any, callback: () => any) {
  // @ts-expect-error import.meta.hot is not defined in this context.
  if (import.meta.hot) return await callback()

  return cachedValue || (await callback())
}
