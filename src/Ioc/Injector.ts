/*
 * @adonisjs/fold
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { IocContract } from '../Contracts'
import { isPrimtiveConstructor } from '../helpers'
import { types } from '@poppinss/utils/build/helpers'
import { InvalidInjectionException } from '../Exceptions/InvalidInjectionException'

/**
 * Exposes the API to injecting dependencies to a class or a method
 */
export class Injector {
  constructor(private container: IocContract) {}

  /**
   * Resolves the injections to be injected to a method or the
   * class constructor
   */
  private resolve(targetName: string, injections: any[], runtimeValues: any[]): any[] {
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
      if (runtimeValues[index] !== undefined) {
        return runtimeValues[index]
      }

      /**
       * Disallow object and primitive constructors
       */
      if (isPrimtiveConstructor(injection)) {
        throw InvalidInjectionException.invoke(injections[index], targetName, index)
      }

      return this.container.make(injection)
    })
  }

  /**
   * Resolves the injections to be injected to a method or the
   * class constructor
   */
  private async resolveAsync(
    targetName: string,
    injections: any[],
    runtimeValues: any[]
  ): Promise<any[]> {
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
     * for a given index, otherwise fallback to `container.makeAsync`.
     */
    return Promise.all(
      injections.map((injection: any, index: number) => {
        if (runtimeValues[index] !== undefined) {
          return runtimeValues[index]
        }

        /**
         * Disallow object and primitive constructors
         */
        if (isPrimtiveConstructor(injection)) {
          throw InvalidInjectionException.invoke(injections[index], targetName, index)
        }

        return this.container.makeAsync(injection)
      })
    )
  }

  /**
   * Find if the value can be instantiated
   */
  private isNewable(target: any) {
    return (types.isFunction(target) || types.isClass(target)) && target.makePlain !== true
  }

  /**
   * Get injections for a given property from the target
   */
  private getInjections(target: any, prop: string): any[] {
    return target.hasOwnProperty('inject') ? target.inject[prop] || [] : []
  }

  /**
   * Inject dependencies to the constructor of the class
   */
  public make(target: any, runtimeValues: any[]) {
    if (!this.isNewable(target)) {
      return target
    }

    return new target(
      ...this.resolve(target.name, this.getInjections(target, 'instance'), runtimeValues)
    )
  }

  /**
   * Inject dependencies asynchronously to the constructor of the class
   */
  public async makeAsync(target: any, runtimeValues: any[]) {
    if (!this.isNewable(target)) {
      return target
    }

    return new target(
      ...(await this.resolveAsync(
        target.name,
        this.getInjections(target, 'instance'),
        runtimeValues
      ))
    )
  }

  /**
   * Injects dependencies to the class method
   */
  public call(target: any, method: string, runtimeValues: any[]) {
    const constructor = target.constructor

    return target[method](
      ...this.resolve(
        `${constructor.name}.${method}`,
        this.getInjections(constructor, method),
        runtimeValues
      )
    )
  }

  /**
   * Injects dependencies asynchronously to the class method
   */
  public async callAsync(target: any, method: string, runtimeValues: any[]) {
    const constructor = target.constructor

    return target[method](
      ...(await this.resolveAsync(
        `${constructor.name}.${method}`,
        this.getInjections(constructor, method),
        runtimeValues
      ))
    )
  }
}
