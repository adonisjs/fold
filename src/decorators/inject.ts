/*
 * @adonisjs/fold
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { defineStaticProperty } from '@poppinss/utils'
import debug from '../debug.js'

/**
 * Initiating the "containerInjections" property on the target, which is assumed
 * to be the class constructor.
 */
function initiateContainerInjections(target: any, method: string | symbol) {
  defineStaticProperty(target, 'containerInjections', { initialValue: {}, strategy: 'inherit' })
  target.containerInjections[method] = []
}

/**
 * Defining the injections for the constructor of the class using
 * reflection
 */
function defineConstructorInjections(target: any) {
  const params = Reflect.getMetadata('design:paramtypes', target)
  /* c8 ignore next 3 */
  if (!params) {
    return
  }

  initiateContainerInjections(target, '_constructor')
  if (debug.enabled) {
    debug('defining constructor injections for %O, params %O', `[class: ${target.name}]`, params)
  }
  for (const param of params) {
    target.containerInjections._constructor.push(param)
  }
}

/**
 * Defining the injections for the class instance method
 */
function defineMethodInjections(target: any, method: string | symbol) {
  const constructor = target.constructor
  const params = Reflect.getMetadata('design:paramtypes', target, method)
  /* c8 ignore next 3 */
  if (!params) {
    return
  }

  initiateContainerInjections(constructor, method)
  if (debug.enabled) {
    debug(
      'defining method injections for %O, method %O, params %O',
      `[class ${constructor.name}]`,
      method,
      params
    )
  }
  for (const param of params) {
    constructor.containerInjections[method].push(param)
  }
}

/**
 * The "@inject" decorator uses Reflection to inspect the dependencies of a class
 * or a method and defines them as metaData on the class for the container to
 * discover them.
 */
export function inject() {
  function injectDecorator<C extends Function>(target: C): void
  function injectDecorator(target: any, propertyKey: string | symbol): void
  function injectDecorator(target: any, propertyKey?: string | symbol): void {
    if (!propertyKey) {
      defineConstructorInjections(target)
      return
    }

    defineMethodInjections(target, propertyKey)
  }

  return injectDecorator
}
