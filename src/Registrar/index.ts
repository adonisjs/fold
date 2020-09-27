/*
 * @adonisjs/fold
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { esmRequire, resolveFrom, Exception } from '@poppinss/utils'
import { IocContract } from '../Contracts'

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
	 * Whether or not the providers have been registered
	 */
	private registered: boolean = false

	constructor(public ioc: IocContract, private basePath?: string) {}

	/**
	 * Load the provider by requiring the file from the disk
	 * and instantiate it. If ioc container is using ES6
	 * imports, then default exports are handled
	 * automatically.
	 */
	private loadProvider(providerPath: string) {
		providerPath = this.basePath ? resolveFrom(this.basePath, providerPath) : providerPath
		const provider = esmRequire(providerPath)

		if (typeof provider !== 'function') {
			throw new Exception(`Make sure export default the provider from "${providerPath}"`)
		}

		return new provider(this.ioc)
	}

	/**
	 * Loop's over an array of provider paths, register them and pushes them to the
	 * `providers` collection. This collection is later used to
	 *  boot providers
	 */
	private deepRegister(providerPaths: string[]) {
		providerPaths.forEach((providerPath: string) => {
			const provider = this.loadProvider(providerPath)
			this.providers.push(provider)

			if (typeof provider.register === 'function') {
				provider.register()
			}

			if (provider.provides) {
				this.deepRegister(provider.provides)
			}
		})
	}

	/**
	 * Register an array of provider paths
	 */
	public useProviders(providersPaths: string[]): this {
		this.providersPaths = providersPaths
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
		if (this.registered) {
			return this.providers
		}

		this.registered = true
		this.deepRegister(this.providersPaths)

		return this.providers
	}

	/**
	 * Boot all the providers by calling the `boot` method.
	 * Boot methods are called in series.
	 */
	public async boot() {
		const providers = this.register()

		for (let provider of providers) {
			/* istanbul ignore else */
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
