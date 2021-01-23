/*
 * @adonisjs/fold
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Filesystem } from '@poppinss/dev-utils'
import { join } from 'path'

import test from 'japa'
import { Registrar } from '../src/Registrar'
import { Ioc } from '../src/Ioc'

const fs = new Filesystem(join(__dirname, './app'))

test.group('Registrar', (group) => {
	group.afterEach(async () => {
		await fs.cleanup()
	})

	test('register an array of providers', async (assert) => {
		await fs.add(
			'providers/FooProvider.js',
			`module.exports = class MyProvider {
      constructor () {
        this.registered = false
      }

      register () {
        this.registered = true
      }
    }`
		)

		const registrar = new Registrar([[new Ioc()]])
		registrar.useProviders([join(fs.basePath, 'providers', 'FooProvider')])

		const providers = await registrar.register()
		assert.isTrue((providers[0] as any).registered)
	})

	test('register an array of providers when defined as es6 modules', async (assert) => {
		await fs.add(
			'providers/BarProvider.ts',
			`export default class MyProvider {
      public registered = false
      register () {
        this.registered = true
      }
    }`
		)

		const registrar = new Registrar([new Ioc()])
		registrar.useProviders([join(fs.basePath, 'providers', 'BarProvider')])

		const providers = await registrar.register()
		assert.isTrue((providers[0] as any).registered)
	})

	test('register and boot providers together', async (assert) => {
		await fs.add(
			'providers/BarProvider.ts',
			`export default class MyProvider {
      public registered = false
      public booted = false

      register () {
        this.registered = true
      }

      async boot () {
        this.booted = true
      }
    }`
		)

		const registrar = new Registrar([new Ioc()])
		registrar.useProviders([join(fs.basePath, 'providers', 'BarProvider')])

		const providers = await registrar.registerAndBoot()
		assert.isTrue((providers[0] as any).registered)
		assert.isTrue((providers[0] as any).booted)
	})

	test('let providers define their own sub providers', async (assert) => {
		await fs.add(
			'providers/BazProvider.ts',
			`export default class MyProvider {
      public registered = false
      public booted = false

      register () {
        this.registered = true
      }

      async boot () {
        this.booted = true
      }
    }`
		)

		await fs.add(
			'providers/BarProvider.ts',
			`export default class MyProvider {
      public registered = false
      public booted = false

      public provides = ['${join(fs.basePath, 'providers', 'BazProvider')}']

      register () {
        this.registered = true
      }

      async boot () {
        this.booted = true
      }
    }`
		)

		const registrar = new Registrar([new Ioc()])
		registrar.useProviders([join(fs.basePath, 'providers', 'BarProvider')])

		const providers = await registrar.registerAndBoot()
		assert.isTrue((providers[0] as any).registered)
		assert.isTrue((providers[0] as any).booted)

		assert.isTrue((providers[1] as any).registered)
		assert.isTrue((providers[1] as any).booted)
	})

	test('raise exception when provider is not exported as a default export', async (assert) => {
		assert.plan(1)
		await fs.add(
			'providers/BarProvider.ts',
			`export class MyProvider {
      public registered = false
      public booted = false

      register () {
        this.registered = true
      }

      async boot () {
        this.booted = true
      }
    }`
		)

		const providerPath = join(fs.basePath, 'providers', 'BarProvider')
		const registrar = new Registrar([new Ioc()])
		registrar.useProviders([providerPath])

		try {
			await registrar.register()
		} catch (err) {
			assert.equal(err.message, `"${providerPath}" provider must use export default statement`)
		}
	})

	test('resolve providers from relative path', async (assert) => {
		await fs.add(
			'providers/FooProvider.js',
			`module.exports = class MyProvider {
      constructor () {
        this.registered = false
      }

      register () {
        this.registered = true
      }
    }`
		)

		const registrar = new Registrar([new Ioc()], fs.basePath)
		registrar.useProviders(['./providers/FooProvider.js'])

		const providers = await registrar.register()
		assert.isTrue((providers[0] as any).registered)
	})

	test('resolve sub providers from relative path', async (assert) => {
		await fs.add(
			'providers/BazProvider.ts',
			`export default class MyProvider {
      public registered = false
      public booted = false

      register () {
        this.registered = true
      }

      async boot () {
        this.booted = true
      }
    }`
		)

		await fs.add(
			'providers/BarProvider.ts',
			`export default class MyProvider {
      public registered = false
      public booted = false

      public provides = ['./BazProvider']

      register () {
        this.registered = true
      }

      async boot () {
        this.booted = true
      }
    }`
		)

		const registrar = new Registrar([[new Ioc()]], fs.basePath)
		registrar.useProviders(['./providers/BarProvider'])

		const providers = await registrar.registerAndBoot()
		assert.isTrue((providers[0] as any).registered)
		assert.isTrue((providers[0] as any).booted)

		assert.isTrue((providers[1] as any).registered)
		assert.isTrue((providers[1] as any).booted)
	})
})
