/*
 * @adonisjs/fold
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { dirname } from 'path'
import { esmRequire, Exception } from '@poppinss/utils'
import { resolveFrom } from '@poppinss/utils/build/helpers'
import { Constructor } from '../Contracts'

/**
 * Registrar is used to register and boot the providers
 */
export class Registrar {
  /**
   * The first level of provider paths provided to the registrar
   */
  private providersPaths: string[] = []

  /**
   * An array of loaded providers. Their can be more providers than the
   * `_providersPaths` array, since each provider can provide it's
   * own sub providers
   */
  private providers: any[] = []

  /**
   * Method to instantiate provider instances. One can also defined
   * a custom instantiater function
   */
  private providersInstantiater = <T extends Constructor<any>>(provider: T) =>
    new provider(...this.providerConstructorParams)

  /**
   * Whether or not the providers can be collected
   */
  private collected: boolean = false

  constructor(private providerConstructorParams: any[], private basePath?: string) {}

  /**
   * Load the provider by requiring the file from the disk
   * and instantiate it. If ioc container is using ES6
   * imports, then default exports are handled
   * automatically.
   */
  private loadProvider(providerPath: string, basePath?: string) {
    providerPath = this.basePath
      ? resolveFrom(basePath || this.basePath, providerPath)
      : providerPath

    const provider = esmRequire(providerPath)

    if (typeof provider !== 'function') {
      throw new Exception(`"${providerPath}" provider must use export default statement`)
    }

    return {
      provider: this.providersInstantiater(provider),
      resolvedPath: dirname(providerPath),
    }
  }

  /**
   * Loop's over an array of provider paths and pushes them to the
   * `providers` collection. This collection is later used to
   * register and boot providers
   */
  private collect(providerPaths: string[], basePath?: string) {
    providerPaths.forEach((providerPath: string) => {
      const { provider, resolvedPath } = this.loadProvider(providerPath, basePath)
      this.providers.push(provider)

      if (provider.provides) {
        this.collect(provider.provides, resolvedPath)
      }
    })
  }

  /**
   * Register an array of provider paths
   */
  public useProviders(
    providersPaths: string[],
    callback?: <T extends Constructor<any>>(provider: T) => InstanceType<T>
  ): this {
    this.providersPaths = providersPaths

    if (typeof callback === 'function') {
      this.providersInstantiater = callback
    }

    return this
  }

  /**
   * Register all the providers by instantiating them and
   * calling the `register` method.
   *
   * The provider instance will be returned, which can be used
   * to boot them as well.
   */
  public register() {
    if (this.collected) {
      return this.providers
    }

    this.collected = true
    this.collect(this.providersPaths)

    /**
     * Register collected providers
     */
    this.providers.forEach((provider) => {
      if (typeof provider.register === 'function') {
        provider.register()
      }
    })

    return this.providers
  }

  /**
   * Boot all the providers by calling the `boot` method.
   * Boot methods are called in series.
   */
  public async boot() {
    const providers = this.register()

    for (let provider of providers) {
      if (typeof provider.boot === 'function') {
        await provider.boot()
      }
    }
  }

  /**
   * Register an boot providers together.
   */
  public async registerAndBoot() {
    const providers = this.register()
    await this.boot()
    return providers
  }
}
