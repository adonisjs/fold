/*
* @adonisjs/fold
*
* (c) Harminder Virk <virk@adonisjs.com>
*
* For the full copyright and license information, please view the LICENSE
* file that was distributed with this source code.
*/

import { IocContract } from '../Contracts'
import { isClass, isPrimtiveConstructor } from '../helpers'
import { InvalidInjectionException } from '../Exceptions/InvalidInjectionException'

export class Injector {
  constructor (private _container: IocContract) {
  }

  /**
   * Resolves the injections to be injected to a method or the
   * class constructor
   */
  private _resolveInjections (targetName: string, injections: any[], runtimeValues: any[]): any[] {
    /**
     * If the runtime values length is greater or same as the length
     * of injections, then we treat them as the source of truth
     * and inject them as it is
     */
    if (runtimeValues.length >= injections.length) {
      return runtimeValues
    }

    /**
     * Loop over all the injections and give preference to runtime value
     * for a given index, otherwise fallback to `container.make`.
     */
    return injections.map((injection: any, index: number) => {
      if (runtimeValues && runtimeValues[index] !== undefined) {
        return runtimeValues[index]
      }

      /**
       * Disallow object and primitive constructors
       */
      if (isPrimtiveConstructor(injection)) {
        throw InvalidInjectionException.invoke(injections[index], targetName, index)
      }

      return this._container['make'](injection)
    })
  }

  /**
   * Injects dependencies to the constructor of a class.
   */
  public injectDependencies (target: any, runtimeValues: any[]) {
    if (!isClass(target) || target.makePlain === true) {
      return target
    }

    const injections = target.hasOwnProperty('inject') ? (target.inject.instance || []) : []
    return new target(...this._resolveInjections(target.name, injections, runtimeValues))
  }

  /**
   * Injects dependencies to the constructor of a class.
   */
  public injectMethodDependencies (target: any, method: string, runtimeValues: any[]) {
    const constructor = target.constructor

    const injections = constructor && constructor.hasOwnProperty('inject')
      ? (constructor.inject[method] || [])
      : []

    return target[method](...this._resolveInjections(`${constructor.name}.${method}`, injections, runtimeValues))
  }
}
