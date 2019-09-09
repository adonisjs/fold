/**
 * @module @adonisjs/fold
 */

/*
* @adonisjs/fold
*
* (c) Harminder Virk <virk@adonisjs.com>
*
* For the full copyright and license information, please view the LICENSE
* file that was distributed with this source code.
*/

import { esmRequire } from '@poppinss/utils'
import { IocContract } from '../Contracts'

export class Registrar {
  /**
   * The first level of provider paths provided to the registrar
   */
  private _providersPaths: string[]

  /**
   * An array of loaded providers. Their can be more providers than the
   * `_providersPaths` array, since each provider can provide it's
   * own sub providers
   */
  private _providers: any[] = []

  /**
   * Whether or not the providers can be collected
   */
  private _collected: boolean = false

  constructor (public ioc: IocContract) {
  }

  /**
   * Load the provider by requiring the file from the disk
   * and instantiate it. If ioc container is using ES6
   * imports, then default exports are handled
   * automatically.
   */
  private _loadProvider (providerPath: string) {
    const provider = esmRequire(providerPath)
    if (typeof (provider) !== 'function') {
      throw new Error(`Make sure export default the provider from ${providerPath}`)
    }

    return new provider(this.ioc)
  }

  /**
   * Loop's over an array of provider paths and pushes them to the
   * `providers` collection. This collection is later used to
   * register and boot providers
   */
  private _collect (providerPaths) {
    providerPaths.forEach((providerPath) => {
      const provider = this._loadProvider(providerPath)
      this._providers.push(provider)

      if (provider.provides) {
        this._collect(provider.provides)
      }
    })
  }

  /**
   * Register an array of provider paths
   */
  public useProviders (providersPaths: string[]): this {
    this._providersPaths = providersPaths
    return this
  }

  /**
   * Register all the providers by instantiating them and
   * calling the `register` method.
   *
   * The provider instance will be returned, which can be used
   * to boot them as well.
   */
  public register () {
    if (this._collected) {
      return this._providers
    }

    this._collected = true
    this._collect(this._providersPaths)

    /**
     * Register collected providers
     */
    this._providers.forEach((provider) => {
      if (typeof (provider.register) === 'function') {
        provider.register()
      }
    })

    return this._providers
  }

  /**
   * Boot all the providers by calling the `boot` method.
   * Boot methods are called in series.
   */
  public async boot () {
    const providers = this.register()

    for (let provider of providers) {
      /* istanbul ignore else */
      if (typeof (provider.boot) === 'function') {
        await provider.boot()
      }
    }
  }

  /**
   * Register an boot providers together.
   */
  public async registerAndBoot () {
    const providers = this.register()
    await this.boot()
    return providers
  }
}
