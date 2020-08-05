/*
 * @poppinss/utils
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import test from 'japa'
import { Ioc } from '../src/Ioc'

test.group('Ioc Resolver', () => {
	test('call namespace expression', (assert) => {
		class UserController {
			public handle() {
				return 'foo'
			}
		}

		const ioc = new Ioc()
		ioc.bind('App/UserController', () => new UserController())

		const resolver = ioc.getResolver()
		assert.equal(resolver.call('App/UserController'), 'foo')
	})

	test('call namespace expression with method', (assert) => {
		class UserController {
			public getUser() {
				return 'foo'
			}
		}

		const ioc = new Ioc()
		ioc.bind('App/UserController', () => new UserController())

		const resolver = ioc.getResolver()
		assert.equal(resolver.call('App/UserController.getUser'), 'foo')
	})

	test('call async namespace expression', async (assert) => {
		class UserController {
			public async getUser() {
				return 'foo'
			}
		}

		const ioc = new Ioc()
		ioc.bind('App/UserController', () => new UserController())

		const resolver = ioc.getResolver()
		const value = await resolver.call('App/UserController.getUser')
		assert.equal(value, 'foo')
	})

	test('raise exception when unable to lookup namespace', async (assert) => {
		const ioc = new Ioc()
		const resolver = ioc.getResolver()

		const fn = () => resolver.call('App/UserController.getUser')
		assert.throw(fn, 'Unable to resolve App/UserController namespace from IoC container')
	})

	test('allow runtime prefix namespace', (assert) => {
		class UserController {
			public handle() {
				return 'foo'
			}
		}

		const ioc = new Ioc()
		ioc.bind('App/UserController', () => new UserController())

		const resolver = ioc.getResolver()
		assert.equal(resolver.call('UserController', 'App'), 'foo')
	})

	test('handle use case where namespace is same but prefix namespace is different', (assert) => {
		class UserController {
			public handle() {
				return 'user'
			}
		}

		class AdminController {
			public handle() {
				return 'admin'
			}
		}

		const ioc = new Ioc()
		ioc.bind('App/UserController', () => new UserController())
		ioc.bind('Admin/UserController', () => new AdminController())

		const resolver = ioc.getResolver()
		assert.equal(resolver.call('UserController', 'App'), 'user')
		assert.equal(resolver.call('UserController', 'Admin'), 'admin')
	})

	test('handle use case where namespace is same but defined a different runtime prefix namespace', (assert) => {
		class UserController {
			public handle() {
				return 'user'
			}
		}

		class AdminController {
			public handle() {
				return 'admin'
			}
		}

		const ioc = new Ioc()
		ioc.bind('App/UserController', () => new UserController())
		ioc.bind('Admin/UserController', () => new AdminController())

		const resolver = ioc.getResolver(undefined, undefined, 'App')
		assert.equal(resolver.call('UserController'), 'user')
		assert.equal(resolver.call('UserController', 'Admin'), 'admin')
	})

	test('pass resolve result to the call method', (assert) => {
		class UserController {
			public getUser() {
				return 'foo'
			}
		}

		const ioc = new Ioc()
		ioc.bind('App/UserController', () => new UserController())

		const resolver = ioc.getResolver()
		const lookupNode = resolver.resolve('App/UserController.getUser')
		assert.equal(resolver.call(lookupNode), 'foo')
	})
})
