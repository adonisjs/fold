/*
 * @adonisjs/fold
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { FakeCallback, IocContract } from '../Contracts'
import { IocLookupException } from '../Exceptions/IocLookupException'

/**
 * Manages the container fakes
 */
export class Fakes {
  /**
   * Registered fakes
   */
  private list: Map<
    string,
    { callback: FakeCallback<any, IocContract>; cachedValue?: any }
  > = new Map()

  constructor(private container: IocContract) {}

  /**
   * Register a fake for a given namespace
   */
  public register(namespace: string, callback: FakeCallback<any, IocContract>): this {
    this.list.set(namespace, { callback })
    return this
  }

  /**
   * Find if namespace has a fake registered
   */
  public has(namespace: string): boolean {
    return this.list.has(namespace)
  }

  /**
   * Clear all fakes
   */
  public clear() {
    return this.list.clear()
  }

  /**
   * Delete fake for a given namespace
   */
  public delete(namespace: string) {
    return this.list.delete(namespace)
  }

  /**
   * Resolve the fake for a given namespace. An exception is raised if
   * not fake is defined
   */
  public resolve(namespace: string, originalValue: any): boolean {
    const fake = this.list.get(namespace)
    if (!fake) {
      throw IocLookupException.missingFake(namespace)
    }

    fake.cachedValue = fake.cachedValue ?? fake.callback(this.container, originalValue)
    return fake.cachedValue
  }
}
