/*
 * @adonisjs/fold
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import test from 'japa'
import 'reflect-metadata'
import { join } from 'path'
import { types } from 'util'
import { Filesystem } from '@poppinss/dev-utils'

import { Ioc } from '../src/Ioc'
import { inject } from '../src/decorators'

const fs = new Filesystem(join(__dirname, './app'))

test.group('Ioc', (group) => {
	group.afterEach(async () => {
		await fs.cleanup()
	})

	test('raise error when bind callback is not a function', (assert) => {
		const ioc = new Ioc()
		const fn = () => (ioc as any).bind('App/Foo', 'hello')
		assert.throw(fn, 'E_RUNTIME_EXCEPTION: "ioc.bind" expect 2nd argument to be a function')
	})

	test('bind value to the container', (assert) => {
		const ioc = new Ioc()
		ioc.bind('App/Foo', () => {
			return 'foo'
		})

		assert.deepEqual(ioc.lookup('App/Foo'), { namespace: 'App/Foo', type: 'binding' })
	})

	test('register directory alias', (assert) => {
		const ioc = new Ioc()
		ioc.alias(join(__dirname, './app'), 'App')

		assert.deepEqual(ioc.lookup('App/Foo'), { namespace: 'App/Foo', type: 'alias' })
		assert.isNull(ioc.lookup('Apple/Foo'))
	})

	test('give preference to binding when alias and binding namespace has a conflict', (assert) => {
		const ioc = new Ioc()
		ioc.alias(join(__dirname, './app'), 'App')
		ioc.bind('App/Foo', () => {
			return 'foo'
		})

		assert.deepEqual(ioc.lookup('App/Foo'), { namespace: 'App/Foo', type: 'binding' })
	})

	test('return null when namespace is not a binding and neither part of directory alias', (assert) => {
		const ioc = new Ioc()
		assert.isNull(ioc.lookup('App/Foo'))
	})

	test('return true from "hasBinding" when binding exists', (assert) => {
		const ioc = new Ioc()
		ioc.bind('App/Foo', () => {
			return { foo: true }
		})

		assert.isTrue(ioc.hasBinding('App/Foo'))
		assert.isFalse(ioc.hasBinding('Foo'))
	})

	test('return true from "isAliasPath" when namespace is part of directory alias', (assert) => {
		const ioc = new Ioc()
		ioc.alias(join(__dirname, './app'), 'App')

		assert.isTrue(ioc.isAliasPath('App/Foo'))
		assert.isFalse(ioc.isAliasPath('Foo'))
	})

	test('return false from "isAliasPath" during directory alias and binding name conflict', (assert) => {
		const ioc = new Ioc()
		ioc.alias(join(__dirname, './app'), 'App')
		ioc.bind('App/Foo', () => {
			return { foo: true }
		})

		assert.isFalse(ioc.isAliasPath('App/Foo'))
		assert.isFalse(ioc.isAliasPath('Foo'))
	})
})

test.group('Ioc | use', () => {
	test('compute value everytime "use" is invoked', (assert) => {
		const ioc = new Ioc()
		ioc.bind('App/Foo', () => {
			return Symbol('foo')
		})

		assert.notStrictEqual(ioc.use('App/Foo'), ioc.use('App/Foo'))
	})

	test('do not compute value everytime when binded as singleton', (assert) => {
		const ioc = new Ioc()
		ioc.singleton('App/Foo', () => {
			return Symbol('foo')
		})

		assert.strictEqual(ioc.use('App/Foo'), ioc.use('App/Foo'))
	})

	test('wrap binding output object with a proxy when proxies are enabled', (assert) => {
		const ioc = new Ioc()
		ioc.bind('App/Foo', () => {
			return { foo: true }
		})

		ioc.useProxies()
		ioc.fake('App/Foo', () => {
			return { foo: false }
		})

		assert.deepEqual(ioc.use('App/Foo'), { foo: false })
	})

	test('wrap binding output class with a proxy when proxies are enabled', (assert) => {
		const ioc = new Ioc()
		class User {}
		class FakeUser {}

		ioc.bind('App/Foo', () => {
			return User
		})

		ioc.useProxies()
		ioc.fake('App/Foo', () => {
			return FakeUser
		})

		assert.instanceOf(new (ioc.use('App/Foo'))(), FakeUser)
	})

	test('class static properties must point to fake class', (assert) => {
		const ioc = new Ioc()
		class User {
			public static userName = 'virk'
		}

		class FakeUser {
			public static userName = 'nikk'
		}

		ioc.bind('App/Foo', () => {
			return User
		})

		ioc.useProxies()
		ioc.fake('App/Foo', () => {
			return FakeUser
		})

		assert.equal(ioc.use('App/Foo').userName, 'nikk')
	})

	test('class constructor must point to the fake object', (assert) => {
		const ioc = new Ioc()
		class User {
			public static userName = 'virk'
		}

		class FakeUser {
			public static userName = 'nikk'
		}

		ioc.bind('App/Foo', () => {
			return User
		})

		ioc.useProxies()
		ioc.fake('App/Foo', () => {
			return FakeUser
		})

		const Foo = ioc.use('App/Foo')
		const foo = new Foo()

		assert.equal(foo.constructor.userName, 'nikk')
	})

	test('class constructor must point to the original object when no fake is defined', (assert) => {
		const ioc = new Ioc()
		class User {
			public static userName = 'virk'
		}

		ioc.bind('App/Foo', () => {
			return User
		})

		ioc.useProxies()

		const Foo = ioc.use('App/Foo')
		const foo = new Foo()

		assert.equal(foo.constructor.userName, 'virk')
	})

	test('extending via the proxy class must point to the original object', (assert) => {
		const ioc = new Ioc()
		class User {
			public static userName = 'virk'
			public username = 'virk'
		}

		ioc.bind('App/Foo', () => {
			return User
		})
		ioc.useProxies()

		class Bar extends ioc.use('App/Foo') {
			public static userName = 'nikk'
			public username = 'nikk'
		}

		const bar = new Bar()
		assert.deepEqual(bar.constructor, Bar)
		assert.deepEqual(bar.constructor['userName'], 'nikk')
		assert.deepEqual(bar.username, 'nikk')
		assert.deepEqual(Object.getPrototypeOf(bar.constructor)['userName'], 'virk')
	})

	test('extending via the proxy class must point to the fake object, when fake is defined', (assert) => {
		const ioc = new Ioc()
		class User {
			public static userName = 'virk'
			public username = 'virk'
		}

		class FakeUser {
			public static userName = 'romain'
			public username = 'romain'
		}

		ioc.bind('App/Foo', () => {
			return User
		})

		ioc.useProxies()
		ioc.fake('App/Foo', () => {
			return FakeUser
		})

		class Bar extends ioc.use('App/Foo') {
			public static userName = 'nikk'
			public username = 'nikk'
		}

		const bar = new Bar()
		assert.deepEqual(bar.constructor, Bar)
		assert.deepEqual(bar.constructor['userName'], 'nikk')
		assert.deepEqual(bar.username, 'nikk')
		assert.deepEqual(Object.getPrototypeOf(bar.constructor)['userName'], 'romain')
	})

	test('do not proxy literal values', (assert) => {
		const ioc = new Ioc()
		class FakeUser {
			public static userName = 'nikk'
		}

		ioc.bind('App/Foo', () => {
			return 'foo'
		})

		ioc.useProxies()
		ioc.fake('App/Foo', () => {
			return FakeUser
		})

		assert.equal(ioc.use('App/Foo'), 'foo')
	})
})

test.group('Ioc | directory aliases', (group) => {
	group.afterEach(async () => {
		await fs.cleanup()
	})

	test('define alias for a directory', async (assert) => {
		await fs.add('services/foo.js', "module.exports = { name: 'foo' }")

		const ioc = new Ioc()
		ioc.alias(fs.basePath, 'App')

		assert.deepEqual(ioc.use('App/services/foo'), { name: 'foo' })

		const fn = () => ioc.use('Apple/services/foo')
		assert.throw(
			fn,
			'E_IOC_LOOKUP_FAILED: Cannot resolve "Apple/services/foo" namespace from the IoC Container'
		)
	})

	test('raise error when lookup fails', (assert) => {
		const ioc = new Ioc()
		const fn = () => ioc.use('japa')
		assert.throw(fn, 'E_IOC_LOOKUP_FAILED: Cannot resolve "japa" namespace from the IoC Container')
	})

	test('clear alias import cache', async (assert) => {
		await fs.add('foo.js', "module.exports = { name: 'foo' }")

		const ioc = new Ioc()
		ioc.alias(fs.basePath, 'App')

		assert.deepEqual(ioc.use('App/foo'), { name: 'foo' })

		/**
		 * Changing file contents, however it's cached and returns
		 * old value
		 */
		await fs.add('foo.js', "module.exports = { name: 'bar' }")
		assert.deepEqual(ioc.use('App/foo'), { name: 'foo' })

		/**
		 * Clearing cache re reads the file from the disk
		 */
		ioc.clearAliasesCache('App/foo', true)
		assert.deepEqual(ioc.use('App/foo'), { name: 'bar' })
	})

	test('calling importsCache on un cached namespace must be a noop', async () => {
		const ioc = new Ioc()
		ioc.alias(fs.basePath, 'App')
		ioc.clearAliasesCache('App/Foo')
	})

	test('wrap aliases output object with a proxy when proxies are enabled', async (assert) => {
		await fs.add('foo.js', "module.exports = { name: 'foo' }")

		const ioc = new Ioc()
		ioc.alias(fs.basePath, 'App')
		ioc.useProxies()

		ioc.fake('App/foo', () => {
			return { name: 'bar' }
		})

		assert.deepEqual(ioc.use('App/foo'), { name: 'bar' })
	})

	test('wrap aliases output class with a proxy when proxies are enabled', async (assert) => {
		await fs.add('foo.js', 'module.exports = class User {}')

		const ioc = new Ioc()
		ioc.alias(fs.basePath, 'App')
		ioc.useProxies()

		class FakeUser {}

		ioc.fake('App/foo', () => {
			return FakeUser
		})

		assert.instanceOf(new (ioc.use('App/foo'))(), FakeUser)
	})

	test('wrap autoload esm default exports to proxy', async (assert) => {
		await fs.add('bar.ts', 'export default class User {}')

		const ioc = new Ioc()
		ioc.alias(fs.basePath, 'App')
		ioc.useProxies()

		class FakeUser {}

		ioc.fake('App/bar', () => {
			return FakeUser
		})

		assert.instanceOf(new (ioc.use('App/bar').default)(), FakeUser)
	})

	test('do not wrap esm named exports to proxy', async (assert) => {
		await fs.add('bar.ts', 'export class User {}')

		const ioc = new Ioc()
		ioc.alias(fs.basePath, 'App')
		ioc.useProxies()

		class FakeUser {}

		ioc.fake('App/bar', () => {
			return FakeUser
		})

		assert.notInstanceOf(new (ioc.use('App/bar').User)(), FakeUser)
	})
})

test.group('Ioc | make', (group) => {
	group.afterEach(async () => {
		await fs.cleanup()
	})

	test('make instance of a class', (assert) => {
		const ioc = new Ioc()
		class Foo {}

		assert.instanceOf(ioc.make(Foo), Foo)
	})

	test('do not wrap class objects inside proxies when useProxies is true', (assert) => {
		const ioc = new Ioc()
		class Foo {}

		ioc.useProxies()
		assert.isFalse(types.isProxy(ioc.make(Foo)))
	})

	test('make instance of a class and inject dependencies', (assert) => {
		const ioc = new Ioc()

		class Bar {}
		ioc.bind('App/Bar', () => {
			return new Bar()
		})

		class Foo {
			constructor(public bar: Bar) {}

			/**
			 * Class injections
			 */
			public static get inject() {
				return {
					instance: ['App/Bar'],
				}
			}
		}

		assert.instanceOf(ioc.make(Foo).bar, Bar)
	})

	test('make instance of a class and inject dependencies with runtime dependencies', (assert) => {
		const ioc = new Ioc()

		class Bar {}
		class Baz {}
		ioc.bind('App/Bar', () => {
			return new Bar()
		})

		class Foo {
			constructor(public bar: Bar, public foo: any) {}

			/**
			 * Class injections
			 */
			public static get inject() {
				return {
					instance: ['App/Bar'],
				}
			}
		}

		assert.equal(ioc.make(Foo, [new Bar(), 'foo']).foo, 'foo')
		assert.instanceOf(ioc.make(Foo, [new Bar(), 'foo']).bar, Bar)
		assert.instanceOf(ioc.make(Foo, [new Baz(), 'foo']).bar, Baz)
	})

	test('do not make instance when makePlain is set to true', (assert) => {
		const ioc = new Ioc()
		class Foo {
			constructor(public bar: Bar) {}

			public static get makePlain(): true {
				return true
			}

			public static get inject() {
				return ['App/Bar']
			}
		}

		class Bar {}

		ioc.bind('App/Bar', () => {
			return new Bar()
		})

		assert.deepEqual(ioc.make(Foo), Foo)
	})

	test('do not make instance when namespace is a binding', (assert) => {
		const ioc = new Ioc()
		class Bar {}

		ioc.bind('App/Bar', () => {
			return Bar
		})

		assert.deepEqual(ioc.make('App/Bar'), Bar)
	})

	test('make instance when namespace is part of directory aliases', async (assert) => {
		await fs.add(
			'Foo.js',
			`module.exports = class Foo {
	      constructor () {
	        this.name = 'foo'
	      }
	    }`
		)

		const ioc = new Ioc()
		ioc.alias(join(fs.basePath), 'Admin')
		assert.deepEqual(ioc.make('Admin/Foo').name, 'foo')
	})

	test('inject dependencies when namespace is part of directory aliases', async (assert) => {
		await fs.add(
			'Foo.js',
			`module.exports = class Foo {
	      constructor (bar) {
	        this.bar = bar
				}

				static get inject() {
					return {
						instance: ['App/Bar'],
					}
				}
	    }`
		)

		const ioc = new Ioc()
		class Bar {}
		ioc.bind('App/Bar', () => {
			return new Bar()
		})

		ioc.alias(join(fs.basePath), 'Admin')
		assert.instanceOf(ioc.make('Admin/Foo').bar, Bar)
	})

	test('allow faking directory aliases namespace', async (assert) => {
		await fs.add(
			'Foo.js',
			`module.exports = class Foo {
	      constructor () {
	        this.name = 'foo'
				}
	    }`
		)

		const ioc = new Ioc()
		ioc.alias(join(fs.basePath), 'Admin')
		ioc.useProxies()

		class Bar {
			public name = 'bar'
		}
		ioc.fake('Admin/Foo', () => {
			return new Bar()
		})

		assert.equal(ioc.make('Admin/Foo').name, 'bar')
		assert.isTrue(types.isProxy(ioc.make('Admin/Foo')))
	})

	test('make instance when namespace is part of directory aliases', async (assert) => {
		await fs.add(
			'Bar.ts',
			`export default class Bar {
	      constructor () {
	        this.name = 'bar'
	      }
	    }`
		)

		const ioc = new Ioc()
		ioc.alias(join(fs.basePath), 'Admin')
		assert.deepEqual(ioc.make('Admin/Bar').name, 'bar')
	})

	test('inject dependencies when namespace is part of directory aliases', async (assert) => {
		await fs.add(
			'Bar.ts',
			`export default class Bar {
	      constructor (baz) {
	        this.baz = baz
				}

				static get inject() {
					return {
						instance: ['App/Baz'],
					}
				}
	    }`
		)

		const ioc = new Ioc()
		class Baz {}
		ioc.bind('App/Baz', () => {
			return new Baz()
		})

		ioc.alias(join(fs.basePath), 'Admin')
		assert.instanceOf(ioc.make('Admin/Bar').baz, Baz)
	})

	test('allow faking directory aliases namespace', async (assert) => {
		await fs.add(
			'Bar.ts',
			`export default class Bar {
	      constructor () {
	        this.name = 'bar'
				}
	    }`
		)

		const ioc = new Ioc()
		ioc.alias(join(fs.basePath), 'Admin')
		ioc.useProxies()

		class Baz {
			public name = 'baz'
		}
		ioc.fake('Admin/Bar', () => {
			return new Baz()
		})

		assert.equal(ioc.make('Admin/Bar').name, 'baz')
		assert.isTrue(types.isProxy(ioc.make('Admin/Bar')))
	})

	test('do not make esm named exports', async (assert) => {
		await fs.add(
			'Bar.ts',
			`export class Bar {
	      public name = 'bar'
	    }`
		)

		const ioc = new Ioc()
		ioc.alias(fs.basePath, 'App')
		assert.equal(ioc.make('App/Bar').Bar.name, 'Bar')
	})

	test('do not proxy named exports', async (assert) => {
		await fs.add(
			'Bar.ts',
			`export class Bar {
	      public name = 'bar'
	    }`
		)

		const ioc = new Ioc()
		ioc.useProxies()

		ioc.alias(fs.basePath, 'App')
		assert.isFalse(types.isProxy(ioc.make('App/Bar')))
	})
})

test.group('Ioc | with', () => {
	test('execute the callback when all bindings exists', async (assert) => {
		assert.plan(2)
		const ioc = new Ioc()

		ioc.bind('App/Foo', () => {
			return 'foo'
		})

		ioc.bind('App/Bar', () => {
			return 'bar'
		})

		ioc.with(['App/Foo', 'App/Bar'], (foo, bar) => {
			assert.equal(foo, 'foo')
			assert.equal(bar, 'bar')
		})
	})

	test('do not execute the callback if any bindings is missing', async () => {
		const ioc = new Ioc()

		ioc.bind('App/Foo', () => {
			return 'foo'
		})

		ioc.with(['App/Foo', 'App/Bar'], () => {
			throw new Error('Never expected to be called')
		})
	})
})

test.group('Ioc | Proxy', (group) => {
	group.afterEach(async () => {
		await fs.cleanup()
	})

	test('ensure proxy traps works fine on class instance', (assert) => {
		class Foo {
			public name = 'foo'
			public getName() {
				return this.name
			}
		}

		const ioc = new Ioc()
		ioc.useProxies()
		ioc.bind('App/Foo', () => {
			return new Foo()
		})

		const value = ioc.use('App/Foo')
		assert.equal(value.name, 'foo')
		assert.equal(value.getName(), 'foo')
		assert.isUndefined(value.nonProp)

		value.nonProp = true
		assert.isTrue(value.nonProp)
		assert.equal(value.constructor.name, 'Foo')

		assert.deepEqual(Object.getOwnPropertyNames(Object.getPrototypeOf(value)), [
			'constructor',
			'getName',
		])
	})

	test('ensure proxy traps works fine with fakes', (assert) => {
		class Foo {
			public name = 'foo'
			public getName() {
				return this.name
			}
			public invoke(...args: any[]) {
				return args.concat(['real'])
			}
		}

		class FooFake {
			public name = 'foofake'
			public getName() {
				return this.name
			}
		}

		const ioc = new Ioc()
		ioc.bind('App/Foo', () => {
			return new Foo()
		})

		ioc.useProxies()
		const value = ioc.use('App/Foo')

		/**
		 * Trap get
		 */
		assert.equal(value.name, 'foo')

		/**
		 * Trap get (hold scope)
		 */
		assert.equal(value.getName(), 'foo')

		/**
		 * Trap get (reflect truth)
		 */
		assert.isUndefined(value.nonProp)

		/**
		 * Trap set
		 */
		value.nonProp = true
		assert.isTrue(value.nonProp)

		/**
		 * Trap get constructor
		 */
		assert.equal(value.constructor.name, 'Foo')

		/**
		 * Trap getPrototypeOf
		 */
		assert.deepEqual(Object.getOwnPropertyNames(Object.getPrototypeOf(value)), [
			'constructor',
			'getName',
			'invoke',
		])

		/**
		 * Trap ownKeys
		 */
		assert.deepEqual(Object.getOwnPropertyNames(value), ['name', 'nonProp'])

		/**
		 * Trap isExtensible
		 */
		assert.isTrue(Object.isExtensible(value))

		/**
		 * Trap deleteProperty
		 */
		delete value.nonProp
		assert.isUndefined(value.nonProp)

		/**
		 * Trap has
		 */
		assert.isTrue('name' in value)
		assert.isFalse('nonProp' in value)

		/**
		 * Trap setPrototypeOf
		 */
		Object.setPrototypeOf(value, {
			getName() {
				return 'proto name'
			},
		})

		assert.equal(value.getName(), 'proto name')
		Object.setPrototypeOf(value, Foo.prototype)
		assert.equal(value.getName(), 'foo')

		/**
		 * Trap preventExtensions
		 */
		const fn = () => Object.preventExtensions(value)
		assert.throw(fn, 'Cannot prevent extensions during a fake')

		ioc.fake('App/Foo', () => {
			return new FooFake()
		})

		/**
		 * Trap get
		 */
		assert.equal(value.name, 'foofake')

		/**
		 * Trap get (hold scope)
		 */
		assert.equal(value.getName(), 'foofake')

		/**
		 * Trap get (reflect truth)
		 */
		assert.isUndefined(value.nonProp)

		/**
		 * Trap set
		 */
		value.nonProp = true
		assert.isTrue(value.nonProp)

		/**
		 * Trap get constructor
		 */
		assert.equal(value.constructor.name, 'FooFake')

		/**
		 * Trap getPrototypeOf
		 */
		assert.deepEqual(Object.getOwnPropertyNames(Object.getPrototypeOf(value)), [
			'constructor',
			'getName',
		])

		/**
		 * Trap ownKeys
		 */
		assert.deepEqual(Object.getOwnPropertyNames(value), ['name', 'nonProp'])

		/**
		 * Trap isExtensible
		 */
		assert.isTrue(Object.isExtensible(value))

		/**
		 * Trap deleteProperty
		 */
		delete value.nonProp
		assert.isUndefined(value.nonProp)

		/**
		 * Trap has
		 */
		assert.isTrue('name' in value)
		assert.isFalse('nonProp' in value)

		/**
		 * Trap setPrototypeOf
		 */
		Object.setPrototypeOf(value, {
			getName() {
				return 'proto name'
			},
		})

		assert.equal(value.getName(), 'proto name')
		Object.setPrototypeOf(value, Foo.prototype)
		assert.equal(value.getName(), 'foofake')

		/**
		 * Trap preventExtensions
		 */
		const fn1 = () => Object.preventExtensions(value)
		assert.throw(fn1, 'Cannot prevent extensions during a fake')
	})

	test('ensure proxy traps works fine when fake has been restored', (assert) => {
		class Foo {
			public name = 'foo'
			public getName() {
				return this.name
			}
		}

		class FooFake {
			public name = 'foofake'
			public getName() {
				return this.name
			}
		}

		const ioc = new Ioc()
		ioc.useProxies()

		ioc.bind('App/Foo', () => {
			return new Foo()
		})

		const value = ioc.use('App/Foo')
		assert.equal(value.name, 'foo')
		assert.equal(value.getName(), 'foo')
		assert.isUndefined(value.nonProp)

		value.nonProp = true

		assert.isTrue(value.nonProp)
		assert.equal(value.constructor.name, 'Foo')
		assert.deepEqual(Object.getOwnPropertyNames(Object.getPrototypeOf(value)), [
			'constructor',
			'getName',
		])

		// Fake added
		ioc.fake('App/Foo', () => {
			return new FooFake()
		})

		assert.equal(value.name, 'foofake')
		assert.equal(value.getName(), 'foofake')
		assert.isUndefined(value.nonProp)

		value.nonProp = true

		assert.isTrue(value.nonProp)
		assert.equal(value.constructor.name, 'FooFake')
		assert.deepEqual(Object.getOwnPropertyNames(Object.getPrototypeOf(value)), [
			'constructor',
			'getName',
		])

		// Fake restored
		ioc.restore('App/Foo')

		assert.equal(value.name, 'foo')
		assert.equal(value.getName(), 'foo')
		assert.equal(value.constructor.name, 'Foo')
		assert.deepEqual(Object.getOwnPropertyNames(Object.getPrototypeOf(value)), [
			'constructor',
			'getName',
		])
	})

	test('proxy class constructor', (assert) => {
		class Foo {
			public name = 'foo'
			public getName() {
				return this.name
			}
		}

		class FooFake {
			public name = 'foofake'
			public getName() {
				return this.name
			}
		}

		const ioc = new Ioc()
		ioc.useProxies()
		ioc.bind('App/Foo', () => {
			return Foo
		})

		const value = ioc.use('App/Foo')
		assert.instanceOf(new value(), Foo)

		ioc.fake('App/Foo', () => {
			return FooFake
		})

		assert.instanceOf(new value(), FooFake)
	})

	test('proxy class constructor via ioc.make', (assert) => {
		class Foo {
			public name = 'foo'
			public getName() {
				return this.name
			}
		}

		class FooFake {
			public name = 'foofake'
			public getName() {
				return this.name
			}
		}

		const ioc = new Ioc()
		ioc.useProxies()
		ioc.bind('App/Foo', () => {
			return Foo
		})

		const value = ioc.make('App/Foo')
		assert.instanceOf(new value(), Foo)

		ioc.fake('App/Foo', () => {
			return FooFake
		})

		assert.instanceOf(new value(), FooFake)
	})

	test('do not proxy literals when using ioc.make', (assert) => {
		const ioc = new Ioc()
		ioc.useProxies()
		ioc.bind('App/Foo', () => {
			return 'foo'
		})

		const value = ioc.make('App/Foo')
		assert.equal(value, 'foo')

		ioc.fake('App/Foo', () => {
			return 'fakefake'
		})

		assert.equal(value, 'foo')
	})

	test('do not proxy literals when using ioc.use', (assert) => {
		const ioc = new Ioc()
		ioc.useProxies()
		ioc.bind('App/Foo', () => {
			return 'foo'
		})

		const value = ioc.use('App/Foo')
		assert.equal(value, 'foo')

		ioc.fake('App/Foo', () => {
			return 'fakefake'
		})
		assert.equal(value, 'foo')
	})

	test('proxy autoloaded class using use', async (assert) => {
		await fs.add(
			'Bar.ts',
			`export = class Bar {
	      public name = 'bar'
	    }`
		)

		const ioc = new Ioc()
		ioc.alias(fs.basePath, 'App')

		class BarFake {
			public name = 'barfake'
			public getName() {
				return this.name
			}
		}

		ioc.useProxies()
		const value = ioc.use('App/Bar')
		assert.equal(new value().name, 'bar')

		ioc.fake('App/Bar', () => {
			return BarFake
		})
		assert.equal(new value().name, 'barfake')
	})

	test('proxy bindings using use', async (assert) => {
		const ioc = new Ioc()
		ioc.bind('App/Bar', () => {
			class Bar {
				public name = 'bar'
			}
			return Bar
		})

		class FooFake {
			public name = 'foofake'
			public getName() {
				return this.name
			}
		}

		ioc.useProxies()
		const value = ioc.use('App/Bar')
		assert.equal(new value().name, 'bar')

		ioc.fake('App/Bar', () => {
			return FooFake
		})
		assert.equal(new value().name, 'foofake')
	})

	test('proxy autoloaded class using make', async (assert) => {
		await fs.add(
			'Bar.ts',
			`export default class Bar {
	      public name = 'bar'
	    }`
		)

		const ioc = new Ioc()
		ioc.alias(fs.basePath, 'App')

		class BarFake {
			public name = 'barfake'
			public getName() {
				return this.name
			}
		}

		ioc.useProxies()
		const value = ioc.make('App/Bar')
		assert.equal(value.name, 'bar')

		ioc.fake('App/Bar', () => {
			return new BarFake()
		})
		assert.equal(value.name, 'barfake')
	})

	test('proxy bindings using make', (assert) => {
		class Foo {
			public name = 'foo'
			public getName() {
				return this.name
			}
		}

		class FooFake {
			public name = 'foofake'
			public getName() {
				return this.name
			}
		}

		const ioc = new Ioc()
		ioc.useProxies()
		ioc.bind('App/Foo', () => {
			return new Foo()
		})

		const value = ioc.make('App/Foo')
		assert.equal(value.name, 'foo')

		ioc.fake('App/Foo', () => {
			return new FooFake()
		})
		assert.equal(value.name, 'foofake')
	})
})

test.group('Ioc | inject decorator', () => {
	test('set inject property for constructor injections', (assert) => {
		@inject(['App/Bar'])
		class Foo {
			constructor(public bar: any) {}
		}

		assert.deepEqual(Foo['inject'], {
			instance: ['App/Bar'],
		})
	})

	test('set inject property for constructor injections via reflection', (assert) => {
		class Bar {}

		@inject()
		class Foo {
			constructor(public bar: Bar) {}
		}

		assert.deepEqual(Foo['inject'], {
			instance: [Bar],
		})
	})

	test('set inject property for constructor by mix-matching reflection and custom injections', (assert) => {
		class Bar {}

		@inject(['App/Baz'])
		class Foo {
			constructor(public baz: any, public bar: Bar) {}
		}

		assert.deepEqual(Foo['inject'], { instance: ['App/Baz', Bar] })
	})

	test('define custom injections after reflection index', (assert) => {
		class Bar {}

		@inject([null, 'App/Baz'])
		class Foo {
			constructor(public bar: Bar, public baz: any) {}
		}

		assert.deepEqual(Foo['inject'], { instance: [Bar, 'App/Baz'] })
	})

	test('set injections when parameter is no information', (assert) => {
		class Bar {}

		@inject()
		class Foo {
			constructor(public bar: Bar, public baz) {}
		}

		assert.deepEqual(Foo['inject'], { instance: [Bar, Object] })
	})

	test('set parameter injections', (assert) => {
		class Bar {}

		class Foo {
			@inject()
			public greet(_bar: Bar) {}
		}

		assert.deepEqual(Foo['inject'], { greet: [Bar] })
	})

	test('param inject multiple dependencies', (assert) => {
		class Bar {}

		class Foo {
			@inject()
			public greet(_bar: Bar, _baz: any) {}
		}

		assert.deepEqual(Foo['inject'], { greet: [Bar, Object] })
	})

	test('inject constructor dependencies injected via decorator', (assert) => {
		const ioc = new Ioc()
		class Bar {}

		@inject()
		class Foo {
			constructor(public bar: Bar) {}
		}

		assert.instanceOf(ioc.make(Foo).bar, Bar)
	})

	test('inject constructor dependencies with runtime arguments', (assert) => {
		const ioc = new Ioc()
		class Bar {}

		@inject()
		class Foo {
			constructor(public username: string, public bar: Bar) {}
		}

		const foo = ioc.make(Foo, ['virk'])

		assert.instanceOf(foo.bar, Bar)
		assert.equal(foo.username, 'virk')
	})

	test('raise error when class has primitive or object constructor injections', (assert) => {
		const ioc = new Ioc()

		@inject()
		class Foo {
			constructor(public baz: string) {}
		}

		const fn = () => ioc.make(Foo)
		assert.throw(fn, 'Cannot inject "{String Constructor}" to "Foo" at position "1"')
	})

	test('inject method dependencies injected via decorator', (assert) => {
		assert.plan(1)
		const ioc = new Ioc()

		class Bar {}

		class Foo {
			@inject()
			public greet(bar: Bar) {
				assert.instanceOf(bar, Bar)
			}
		}

		ioc.call(ioc.make(Foo), 'greet', [])
	})

	test('inject method dependencies with runtime arguments', (assert) => {
		assert.plan(2)
		const ioc = new Ioc()

		class Bar {}

		class Foo {
			@inject()
			public greet(username: string, bar: Bar) {
				assert.equal(username, 'virk')
				assert.instanceOf(bar, Bar)
			}
		}

		ioc.call(ioc.make(Foo), 'greet', ['virk'])
	})

	test('inject method dependencies with interface type hinting', (assert) => {
		assert.plan(2)
		const ioc = new Ioc()

		interface BarContract {}
		class Bar {}

		ioc.bind('App/Bar', () => {
			return new Bar()
		})

		class Foo {
			@inject([null, 'App/Bar'])
			public greet(username: string, bar: BarContract) {
				assert.equal(username, 'virk')
				assert.instanceOf(bar, Bar)
			}
		}

		ioc.call(ioc.make(Foo), 'greet', ['virk'])
	})

	test('raise error when method has primitive or object constructor injections', (assert) => {
		const ioc = new Ioc()
		class Bar {}

		class Foo {
			@inject()
			public greet(_username: string, _bar: Bar) {}
		}

		const fn = () => ioc.call(ioc.make(Foo), 'greet', [])
		assert.throw(fn, 'Cannot inject "{String Constructor}" to "Foo.greet" at position "1"')
	})

	test('call object method even when it has zero injections', (assert) => {
		assert.plan(1)
		const ioc = new Ioc()

		class Foo {
			public greet() {
				assert.isTrue(true)
			}
		}

		ioc.call(ioc.make(Foo), 'greet', [])
	})
})

test.group('Ioc | lookup', (group) => {
	group.afterEach(async () => {
		await fs.cleanup()
	})

	test('lookup binding from namespace', (assert) => {
		const ioc = new Ioc()
		ioc.bind('App/Foo', () => {
			return 'foo'
		})

		assert.deepEqual(ioc.lookup('App/Foo'), {
			namespace: 'App/Foo',
			type: 'binding',
		})
	})

	test('lookup directory alias from namespace', (assert) => {
		const ioc = new Ioc()
		ioc.alias(fs.basePath, 'App')

		assert.deepEqual(ioc.lookup('App/Foo'), {
			namespace: 'App/Foo',
			type: 'alias',
		})
	})
})

test.group('Ioc | lookup resolve', (group) => {
	group.afterEach(async () => {
		await fs.cleanup()
	})

	test('lookup binding from a lookup node', (assert) => {
		const ioc = new Ioc()
		ioc.bind('App/Foo', () => {
			return 'foo'
		})

		assert.equal(ioc.use({ type: 'binding', namespace: 'App/Foo' }), 'foo')
	})

	test('lookup directory alias value from a lookup node', async (assert) => {
		await fs.add('Foo.js', "module.exports = 'bar'")

		const ioc = new Ioc()
		ioc.alias(fs.basePath, 'App')

		assert.equal(ioc.use({ type: 'alias', namespace: 'App/Foo' }), 'bar')
	})

	test('raise exception when unable to resolve lookup namespace', async (assert) => {
		await fs.add('Foo.js', "module.exports = 'bar'")
		const ioc = new Ioc()

		ioc.alias(fs.basePath, 'App')

		const fn = () => ioc.use({ type: 'binding', namespace: 'App/Foo' })
		assert.throw(
			fn,
			'E_IOC_LOOKUP_FAILED: Cannot resolve "App/Foo" namespace from the IoC Container'
		)
	})

	test('do not resolve binding for autoload lookup node', async (assert) => {
		await fs.add('Foo.js', "module.exports = 'bar'")
		const ioc = new Ioc()

		ioc.bind('App/Foo', () => {
			return 'foo'
		})

		const fn = () => ioc.use({ type: 'alias', namespace: 'App/Foo' })
		assert.throw(
			fn,
			'E_IOC_LOOKUP_FAILED: Cannot resolve "App/Foo" namespace from the IoC Container'
		)
	})

	test('make binding from binding lookup node', (assert) => {
		const ioc = new Ioc()
		class Bar {}

		ioc.bind('App/Foo', () => {
			return Bar
		})

		assert.equal(ioc.make({ type: 'binding', namespace: 'App/Foo' }), Bar)
	})

	test('make binding from autoloaded lookup node', async (assert) => {
		await fs.add(
			'Foo.js',
			`
		module.exports = class Bar {
			constructor () {
				this.name = 'bar'
			}
		}
		`
		)

		const ioc = new Ioc()
		ioc.alias(fs.basePath, 'App')

		assert.equal(ioc.make({ type: 'alias', namespace: 'App/Foo' }).name, 'bar')
	})

	test('do not make binding for autoload lookup node', async (assert) => {
		await fs.add('Foo.js', "module.exports = 'bar'")
		const ioc = new Ioc()

		ioc.bind('App/Foo', () => {
			return 'foo'
		})

		const fn = () => ioc.make({ type: 'alias', namespace: 'App/Foo' })
		assert.throw(
			fn,
			'E_IOC_LOOKUP_FAILED: Cannot resolve "App/Foo" namespace from the IoC Container'
		)
	})

	test('raise exception when unable to make lookup namespace', async (assert) => {
		await fs.add('Foo.js', "module.exports = 'bar'")

		const ioc = new Ioc()
		ioc.alias(fs.basePath, 'App')

		const fn = () => ioc.make({ type: 'binding', namespace: 'App/Foo' })

		assert.throw(
			fn,
			'E_IOC_LOOKUP_FAILED: Cannot resolve "App/Foo" namespace from the IoC Container'
		)
	})

	test('define custom onLookupFailed message', async (assert) => {
		await fs.add('Foo.js', "module.exports = 'bar'")

		const ioc = new Ioc()
		ioc.alias(fs.basePath, 'App')
		ioc.onLookupFailed = function () {
			throw new Error('Namespace is missing')
		}

		const fn = () => ioc.make({ type: 'binding', namespace: 'App/Foo' })
		assert.throw(fn, 'Namespace is missing')
	})
})
