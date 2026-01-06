/*
 * @adonisjs/fold
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { defineStaticProperty } from '@poppinss/utils'
import { RuntimeException } from '@poppinss/utils/exception'

import debug from '../debug.ts'
import type { ErrorCreator, InspectableConstructor } from '../types.ts'

/**
 * Creating a debugging error that points to the source
 * using the @inject decorator
 *
 * @param original - The original error to extract stack trace from
 */
function createDebuggingError(original: Error) {
  return function createError(message: string) {
    const error = new RuntimeException(message)
    error.stack = original.stack
    return error
  }
}

/**
 * Initiating the "containerInjections" property on the target, which is assumed
 * to be the class constructor.
 *
 * @param target - The class constructor or prototype
 * @param method - The method name or constructor identifier
 * @param createError - Error creator function for debugging
 */
function initiateContainerInjections(
  target: any,
  method: string | symbol,
  createError: ErrorCreator
) {
  defineStaticProperty(target, 'containerInjections', { initialValue: {}, strategy: 'inherit' })
  target.containerInjections[method] = {
    createError,
    dependencies: [],
  }
}

/**
 * Defining the injections for the constructor of the class using
 * reflection
 *
 * @param target - The class constructor to define injections for
 * @param createError - Error creator function for debugging
 */
function defineConstructorInjections(target: InspectableConstructor, createError: ErrorCreator) {
  const params = Reflect.getMetadata('design:paramtypes', target)
  /* c8 ignore next 3 */
  if (!params) {
    return
  }

  initiateContainerInjections(target, '_constructor', createError)
  if (debug.enabled) {
    debug('defining constructor injections for %O, params %O', `[class: ${target.name}]`, params)
  }

  for (const param of params) {
    target.containerInjections!._constructor.dependencies.push(param)
  }
}

/**
 * Defining the injections for the class instance method
 *
 * @param target - The class prototype
 * @param method - The method name to define injections for
 * @param createError - Error creator function for debugging
 */
function defineMethodInjections(target: any, method: string | symbol, createError: ErrorCreator) {
  const constructor = target.constructor as InspectableConstructor
  const params = Reflect.getMetadata('design:paramtypes', target, method)
  /* c8 ignore next 3 */
  if (!params) {
    return
  }

  initiateContainerInjections(constructor, method, createError)
  if (debug.enabled) {
    debug(
      'defining method injections for %O, method %O, params %O',
      `[class ${constructor.name}]`,
      method,
      params
    )
  }

  for (const param of params) {
    constructor.containerInjections![method].dependencies.push(param)
  }
}

/**
 * The "@inject" decorator uses Reflection to inspect the dependencies of a class
 * or a method and defines them as metadata on the class for the container to
 * discover them.
 *
 * @example
 * ```ts
 * @inject()
 * class UsersController {
 *   constructor(private database: Database) {}
 * }
 * ```
 *
 * @example
 * ```ts
 * class UsersController {
 *   @inject()
 *   async index(request: Request, response: Response) {
 *     // Method with dependency injection
 *   }
 * }
 * ```
 */
export function inject() {
  /**
   * Creating an error builder for the inject decorator, so that
   * the stack trace can point back to the code that used
   * the decorator
   */
  const createError = createDebuggingError(new Error())

  function injectDecorator<C extends Function>(target: C): void
  function injectDecorator(target: any, propertyKey: string | symbol): void
  function injectDecorator(target: any, propertyKey?: string | symbol): void {
    if (!propertyKey) {
      defineConstructorInjections(target, createError)
      return
    }

    defineMethodInjections(target, propertyKey, createError)
  }

  return injectDecorator
}
