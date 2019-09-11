/*
* @adonisjs/fold
*
* (c) Harminder Virk <virk@adonisjs.com>
*
* For the full copyright and license information, please view the LICENSE
* file that was distributed with this source code.
*/

import 'reflect-metadata'
import { Filesystem } from '@poppinss/dev-utils'
import { join } from 'path'

import test from 'japa'
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
    assert.throw(fn, 'ioc.bind expect 2nd argument to be a function')
  })

  test('bind value to the container', (assert) => {
    const ioc = new Ioc()
    ioc.bind('App/Foo', () => {
      return 'foo'
    })

    assert.equal(ioc.use('App/Foo'), 'foo')
  })

  test('compute value everytime use is called', (assert) => {
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

  test('define alias for a binding', (assert) => {
    const ioc = new Ioc()
    ioc.bind('App/Foo', () => {
      return 'foo'
    })

    ioc.alias('App/Foo', 'foo')
    assert.strictEqual(ioc.use('foo'), 'foo')
  })

  test('return true from hasBinding when it exists', (assert) => {
    const ioc = new Ioc()
    ioc.bind('App/Foo', () => {
      return { foo: true }
    })

    ioc.alias('App/Foo', 'Foo')

    assert.isTrue(ioc.hasBinding('App/Foo'))
    assert.isFalse(ioc.hasBinding('Foo'))
    assert.isTrue(ioc.hasBinding('Foo', true))
  })

  test('return true from hasAlias when it exists', (assert) => {
    const ioc = new Ioc()
    ioc.bind('App/Foo', () => {
      return { foo: true }
    })

    ioc.alias('App/Foo', 'Foo')
    assert.isTrue(ioc.hasAlias('Foo'))
  })

  test('return alias namespace if exists', (assert) => {
    const ioc = new Ioc()
    ioc.bind('App/Foo', () => {
      return { foo: true }
    })

    ioc.alias('App/Foo', 'Foo')

    assert.isUndefined(ioc.getAliasNamespace('Bar'))
    assert.equal(ioc.getAliasNamespace('Foo'), 'App/Foo')
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

  test('proxy class static properties must point to fake class', (assert) => {
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

  test('emit events in relationship when with use', (assert) => {
    const ioc = new Ioc(true)
    const stack: any[] = []

    ioc.tracer.on('use', (data) => {
      stack.push(data)
    })

    ioc.bind('App/Config', () => {
      return 'config'
    })

    ioc.bind('App/Logger', () => {
      return 'logger'
    })

    ioc.bind('App/Server', (app) => {
      return `${app.use('App/Config')}-${app.use('App/Logger')}`
    })

    ioc.use('App/Server')
    ioc.use('App/Config')
    ioc.use('App/Logger')

    assert.deepEqual(stack, [
      { namespace: 'App/Server', parent: undefined, cached: false },
      { namespace: 'App/Config', parent: 'App/Server', cached: false },
      { namespace: 'App/Logger', parent: 'App/Server', cached: false },
      { namespace: 'App/Config', parent: undefined, cached: false },
      { namespace: 'App/Logger', parent: undefined, cached: false },
    ])
  })

  test('emit correct data from event when is a singleton', (assert) => {
    const ioc = new Ioc(true)
    const stack: any[] = []

    ioc.tracer.on('use', (data) => {
      stack.push(data)
    })

    ioc.singleton('App/Config', () => {
      return 'config'
    })

    ioc.singleton('App/Logger', () => {
      return 'logger'
    })

    ioc.bind('App/Server', (app) => {
      return `${app.use('App/Config')}-${app.use('App/Logger')}`
    })

    ioc.use('App/Server')
    ioc.use('App/Config')
    ioc.use('App/Logger')

    assert.deepEqual(stack, [
      { namespace: 'App/Server', parent: undefined, cached: false },
      { namespace: 'App/Config', parent: 'App/Server', cached: false },
      { namespace: 'App/Logger', parent: 'App/Server', cached: false },
      { namespace: 'App/Config', parent: undefined, cached: true },
      { namespace: 'App/Logger', parent: undefined, cached: true },
    ])
  })

  test('emit correct data from event when using aliases', (assert) => {
    const ioc = new Ioc(true)
    const stack: any[] = []

    ioc.tracer.on('use', (data) => {
      stack.push(data)
    })

    ioc.singleton('App/Config', () => {
      return 'config'
    })

    ioc.singleton('App/Logger', () => {
      return 'logger'
    })

    ioc.bind('App/Server', (app) => {
      return `${app.use('App/Config')}-${app.use('App/Logger')}`
    })

    ioc.alias('App/Server', 'server')
    ioc.alias('App/Config', 'config')
    ioc.alias('App/Logger', 'logger')

    ioc.use('server')
    ioc.use('config')
    ioc.use('logger')

    assert.deepEqual(stack, [
      { namespace: 'App/Server', parent: undefined, cached: false },
      { namespace: 'App/Config', parent: 'App/Server', cached: false },
      { namespace: 'App/Logger', parent: 'App/Server', cached: false },
      { namespace: 'App/Config', parent: undefined, cached: true },
      { namespace: 'App/Logger', parent: undefined, cached: true },
    ])
  })
})

test.group('Ioc | autoloads', (group) => {
  group.afterEach(async () => {
    await fs.cleanup()
  })

  test('bind a directory to be autoloaded', async (assert) => {
    await fs.add('services/foo.js', `module.exports = { name: 'foo' }`)

    const ioc = new Ioc()
    ioc.autoload(fs.basePath, 'App')

    assert.deepEqual(ioc.use('App/services/foo'), { name: 'foo' })
  })

  test('do not autoload alias when namespace is similar but not same', async (assert) => {
    await fs.add('services/foo.js', `module.exports = { name: 'foo' }`)

    const ioc = new Ioc()
    ioc.autoload(fs.basePath, 'App')

    const fn = () => ioc.use('Apple/services/foo')
    assert.throw(fn, 'E_IOC_LOOKUP_FAILED: Cannot resolve Apple/services/foo namespace from the IoC Container')
  })

  test('cache require calls for autoloaded directories', async (assert) => {
    await fs.add('services/foo.js', `module.exports = { name: 'foo' }`)

    const ioc = new Ioc(true)
    const stack: any[] = []

    ioc.tracer.on('use', (node) => {
      stack.push(node)
    })

    ioc.autoload(fs.basePath, 'App')
    ioc.use('App/services/foo')
    ioc.use('App/services/foo')

    assert.deepEqual(stack, [
      {
        namespace: 'App/services/foo',
        cached: false,
        parent: undefined,
      },
      {
        namespace: 'App/services/foo',
        cached: true,
        parent: undefined,
      },
    ])
  })

  test('trace ioc calls inside autoloaded path', async (assert) => {
    await fs.add('services/foo.js', `
      const Foo = use('App/Foo')
      module.exports = { name: Foo.getName() }
    `)

    const ioc = new Ioc(true)
    const stack: any[] = []

    ioc.tracer.on('use', (node) => {
      stack.push(node)
    })

    ioc.bind('App/Foo', () => {
      return {
        getName () {
          return 'foo'
        },
      }
    })

    global['use'] = ioc.use.bind(ioc)

    ioc.autoload(fs.basePath, 'App')
    ioc.use('App/services/foo')
    ioc.use('App/services/foo')

    assert.deepEqual(stack, [
      {
        namespace: 'App/services/foo',
        cached: false,
        parent: undefined,
      },
      {
        namespace: 'App/Foo',
        cached: false,
        parent: 'App/services/foo',
      },
      {
        namespace: 'App/services/foo',
        cached: true,
        parent: undefined,
      },
    ])
  })

  test('raise error when lookup fails', (assert) => {
    const ioc = new Ioc()
    const fn = () => ioc.use('japa')
    assert.throw(fn, 'E_IOC_LOOKUP_FAILED: Cannot resolve japa namespace from the IoC Container')
  })

  test('clear autoload cache for a given file', async (assert) => {
    await fs.add('foo.js', `module.exports = { name: 'foo' }`)

    const ioc = new Ioc()
    ioc.autoload(fs.basePath, 'App')

    assert.deepEqual(ioc.use('App/foo'), { name: 'foo' })

    /**
     * Changing file contents, however it's cached and returns
     * old value
     */
    await fs.add('foo.js', `module.exports = { name: 'bar' }`)
    assert.deepEqual(ioc.use('App/foo'), { name: 'foo' })

    ioc.clearAutoloadCache('App/foo', true)
    assert.deepEqual(ioc.use('App/foo'), { name: 'bar' })
  })

  test('calling clearAutoloadCache on un-exising module must be a noop', async () => {
    const ioc = new Ioc()
    ioc.autoload(fs.basePath, 'App')
    ioc.clearAutoloadCache('App/Foo')
  })

  test('wrap autoloaded output object with a proxy when proxies are enabled', async (assert) => {
    await fs.add('foo.js', `module.exports = { name: 'foo' }`)

    const ioc = new Ioc()
    ioc.autoload(fs.basePath, 'App')
    ioc.useProxies()

    ioc.fake('App/foo', () => {
      return { name: 'bar' }
    })

    assert.deepEqual(ioc.use('App/foo'), { name: 'bar' })
  })

  test('wrap autoloaded output class with a proxy when proxies are enabled', async (assert) => {
    await fs.add('foo.js', `module.exports = class User {}`)

    const ioc = new Ioc()
    ioc.autoload(fs.basePath, 'App')
    ioc.useProxies()

    class FakeUser {}

    ioc.fake('App/foo', () => {
      return FakeUser
    })

    assert.instanceOf(new (ioc.use('App/foo'))(), FakeUser)
  })

  test('wrap autoload esm default exports to proxy', async (assert) => {
    await fs.add('bar.ts', `export default class User {}`)

    const ioc = new Ioc()
    ioc.autoload(fs.basePath, 'App')
    ioc.useProxies()

    class FakeUser {}

    ioc.fake('App/bar', () => {
      return FakeUser
    })

    assert.instanceOf(new (ioc.use('App/bar').default)(), FakeUser)
  })

  test('do not wrap esm named exports to proxy', async (assert) => {
    await fs.add('bar.ts', `export class User {}`)

    const ioc = new Ioc()
    ioc.autoload(fs.basePath, 'App')
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

  test('make instance of a class and inject dependencies', (assert) => {
    const ioc = new Ioc()
    class Foo {
      constructor (public bar: Bar) {
      }

      static get inject () {
        return {
          instance: ['App/Bar'],
        }
      }
    }

    class Bar {}

    ioc.bind('App/Bar', () => {
      return new Bar()
    })

    assert.instanceOf(ioc.make<Foo>(Foo).bar, Bar)
  })

  test('do not make instance when makePlain is set to true', (assert) => {
    const ioc = new Ioc()
    class Foo {
      constructor (public bar: Bar) {
      }

      static get makePlain () {
        return true
      }

      static get inject () {
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

  test('do not make instance when namespace is an alias', (assert) => {
    const ioc = new Ioc()
    class Bar {}

    ioc.bind('App/Bar', () => {
      return Bar
    })

    ioc.alias('App/Bar', 'Bar')
    assert.deepEqual(ioc.make('Bar'), Bar)
  })

  test('make instance when namespace is part of autoload', async (assert) => {
    await fs.add('Foo.js', `module.exports = class Foo {
      constructor () {
        this.name = 'foo'
      }
    }`)

    const ioc = new Ioc()
    ioc.autoload(join(fs.basePath), 'Admin')
    assert.deepEqual(ioc.make<any>('Admin/Foo').name, 'foo')
  })

  test('work fine with esm export default', async (assert) => {
    await fs.add('Bar.ts', `export default class Bar {
      public name = 'bar'
    }`)

    const ioc = new Ioc()
    ioc.autoload(fs.basePath, 'App')
    assert.deepEqual((ioc.make('App/Bar') as any).name, 'bar')
  })

  test('do not make esm named exports', async (assert) => {
    await fs.add('Bar.ts', `export class Bar {
      public name = 'bar'
    }`)

    const ioc = new Ioc()
    ioc.autoload(fs.basePath, 'App')
    assert.equal(ioc.make('App/Bar').Bar.name, 'Bar')
  })

  test('wrap make output object to proxy', async (assert) => {
    await fs.add('Bar.ts', `export default class Bar {
      public name = 'bar'
    }`)

    const ioc = new Ioc()
    ioc.autoload(fs.basePath, 'App')
    ioc.useProxies()

    class FakeBar {
      public name: string
      constructor (originalName: string) {
        this.name = `fake${originalName}`
      }
    }

    ioc.fake('App/Bar', (_container, user) => {
      return new FakeBar(user.name)
    })

    assert.equal(ioc.make('App/Bar').name, 'fakebar')
  })

  test('do not wrap esm named modules to proxy', async (assert) => {
    await fs.add('Bar.ts', `export class Bar {
      public name = 'bar'
    }`)

    const ioc = new Ioc()
    ioc.autoload(fs.basePath, 'App')
    ioc.useProxies()

    class FakeBar {
      public name: string
      constructor (originalName: string) {
        this.name = `fake${originalName}`
      }
    }

    ioc.fake('App/Bar', (_container, user) => {
      return new FakeBar(user.name)
    })

    assert.equal(ioc.make('App/Bar').Bar.name, 'Bar')
  })
})

test.group('Ioc | with', () => {
  test('execute the callback when all bindings exists', async (assert) => {
    assert.plan(2)

    const ioc = new Ioc(false)
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
    const ioc = new Ioc(false)
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

      public getName () {
        return this.name
      }
    }

    const ioc = new Ioc()
    ioc.useProxies()
    ioc.bind('App/Foo', () => {
      return new Foo()
    })

    const value = ioc.use<any>('App/Foo')
    assert.equal(value.name, 'foo')
    assert.equal(value.getName(), 'foo')
    assert.isUndefined(value.nonProp)

    value.nonProp = true

    assert.isTrue(value.nonProp)
    assert.equal(value.constructor.name, 'Foo')
    assert.deepEqual(
      Object.getOwnPropertyNames(Object.getPrototypeOf(value)),
      ['constructor', 'getName'],
    )
  })

  test('ensure proxy traps works fine with fakes', (assert) => {
    class Foo {
      public name = 'foo'

      public getName () {
        return this.name
      }

      public invoke (...args) {
        return args.concat(['real'])
      }
    }

    class FooFake {
      public name = 'foofake'

      public getName () {
        return this.name
      }
    }

    const ioc = new Ioc()
    ioc.bind('App/Foo', () => {
      return new Foo()
    })
    ioc.useProxies()

    const value = ioc.use<any>('App/Foo')

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
    assert.deepEqual(
      Object.getOwnPropertyNames(Object.getPrototypeOf(value)),
      ['constructor', 'getName', 'invoke'],
    )

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
      getName () {
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
    assert.deepEqual(
      Object.getOwnPropertyNames(Object.getPrototypeOf(value)),
      ['constructor', 'getName'],
    )

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
      getName () {
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

      public getName () {
        return this.name
      }
    }

    class FooFake {
      public name = 'foofake'

      public getName () {
        return this.name
      }
    }

    const ioc = new Ioc()
    ioc.useProxies()
    ioc.bind('App/Foo', () => {
      return new Foo()
    })

    const value = ioc.use<any>('App/Foo')

    assert.equal(value.name, 'foo')
    assert.equal(value.getName(), 'foo')
    assert.isUndefined(value.nonProp)

    value.nonProp = true

    assert.isTrue(value.nonProp)
    assert.equal(value.constructor.name, 'Foo')
    assert.deepEqual(
      Object.getOwnPropertyNames(Object.getPrototypeOf(value)),
      ['constructor', 'getName'],
    )

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
    assert.deepEqual(
      Object.getOwnPropertyNames(Object.getPrototypeOf(value)),
      ['constructor', 'getName'],
    )

    // Fake restored
    ioc.restore('App/Foo')

    assert.equal(value.name, 'foo')
    assert.equal(value.getName(), 'foo')
    assert.equal(value.constructor.name, 'Foo')
    assert.deepEqual(
      Object.getOwnPropertyNames(Object.getPrototypeOf(value)),
      ['constructor', 'getName'],
    )
  })

  test('proxy class constructor', (assert) => {
    interface FooConstructor {
      new (): Foo
    }

    class Foo {
      public name = 'foo'

      public getName () {
        return this.name
      }
    }

    class FooFake {
      public name = 'foofake'

      public getName () {
        return this.name
      }
    }

    const ioc = new Ioc()
    ioc.useProxies()
    ioc.bind('App/Foo', () => {
      return Foo
    })

    const value = ioc.use<FooConstructor>('App/Foo')
    assert.instanceOf(new value(), Foo)

    ioc.fake('App/Foo', () => {
      return FooFake
    })
    assert.instanceOf(new value(), FooFake)
  })

  test('proxy class constructor via ioc.make', (assert) => {
    interface FooConstructor {
      new (): Foo
    }

    class Foo {
      public name = 'foo'

      public getName () {
        return this.name
      }
    }

    class FooFake {
      public name = 'foofake'

      public getName () {
        return this.name
      }
    }

    const ioc = new Ioc()
    ioc.useProxies()
    ioc.bind('App/Foo', () => {
      return Foo
    })

    const value = ioc.make<FooConstructor>('App/Foo')
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
    await fs.add('Bar.ts', `export = class Bar {
      public name = 'bar'
    }`)

    const ioc = new Ioc()
    ioc.autoload(fs.basePath, 'App')

    class BarFake {
      public name = 'barfake'

      public getName () {
        return this.name
      }
    }

    ioc.useProxies()

    const value = ioc.use('App/Bar')
    assert.equal(new (value)().name, 'bar')

    ioc.fake('App/Bar', () => {
      return BarFake
    })

    assert.equal(new (value)().name, 'barfake')
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

      public getName () {
        return this.name
      }
    }

    ioc.useProxies()

    const value = ioc.use('App/Bar')
    assert.equal(new (value)().name, 'bar')

    ioc.fake('App/Bar', () => {
      return FooFake
    })

    assert.equal(new (value)().name, 'foofake')
  })

  test('proxy autoloaded class using make', async (assert) => {
    await fs.add('Bar.ts', `export default class Bar {
      public name = 'bar'
    }`)

    const ioc = new Ioc()
    ioc.autoload(fs.basePath, 'App')

    class BarFake {
      public name = 'barfake'

      public getName () {
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

      public getName () {
        return this.name
      }
    }

    class FooFake {
      public name = 'foofake'

      public getName () {
        return this.name
      }
    }

    const ioc = new Ioc()
    ioc.useProxies()
    ioc.bind('App/Foo', () => {
      return new Foo()
    })

    const value = ioc.make<Foo>('App/Foo')
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
      constructor (public bar: any) {
      }
    }

    assert.deepEqual(Foo['inject'], {
      instance: ['App/Bar'],
    })
  })

  test('set inject property for constructor injections via reflection', (assert) => {
    class Bar {}

    @inject()
    class Foo {
      constructor (public bar: Bar) {
      }
    }

    assert.deepEqual(Foo['inject'], {
      instance: [Bar],
    })
  })

  test('set inject property for constructor by mix-matching reflection and custom injections', (assert) => {
    class Bar {}

    @inject(['App/Baz'])
    class Foo {
      constructor (public baz: any, public bar: Bar) {
      }
    }

    assert.deepEqual(Foo['inject'], { instance: ['App/Baz', Bar] })
  })

  test('define custom injections after reflection index', (assert) => {
    class Bar {}

    @inject([null, 'App/Baz'])
    class Foo {
      constructor (public bar: Bar, public baz: any) {
      }
    }

    assert.deepEqual(Foo['inject'], { instance: [Bar, 'App/Baz'] })
  })

  test('set injections when parameter is no information', (assert) => {
    class Bar {}

    @inject()
    class Foo {
      constructor (public bar: Bar, public baz) {
      }
    }

    assert.deepEqual(Foo['inject'], { instance: [Bar, Object] })
  })

  test('set parameter injections', (assert) => {
    class Bar {}

    class Foo {
      @inject()
      public greet (_bar: Bar) {
      }
    }

    assert.deepEqual(Foo['inject'], { greet: [Bar] })
  })

  test('param inject multiple dependencies', (assert) => {
    class Bar {}

    class Foo {
      @inject()
      public greet (_bar: Bar, _baz: any) {
      }
    }

    assert.deepEqual(Foo['inject'], { greet: [Bar, Object] })
  })

  test('inject constructor dependencies injected via decorator', (assert) => {
    const ioc = new Ioc()
    class Bar {}

    @inject()
    class Foo {
      constructor (public bar: Bar) {}
    }

    assert.instanceOf(ioc.make(Foo).bar, Bar)
  })

  test('inject constructor dependencies with inline arguments', (assert) => {
    const ioc = new Ioc()
    class Bar {}

    @inject()
    class Foo {
      constructor (public username: string, public bar: Bar) {}
    }

    const foo = ioc.make(Foo, ['virk'])
    assert.instanceOf(foo.bar, Bar)
    assert.equal(foo.username, 'virk')
  })

  test('raise error when class has primitive or object constructor injections', (assert) => {
    const ioc = new Ioc()

    @inject()
    class Foo {
      constructor (public baz: string) {}
    }

    const fn = () => ioc.make(Foo)
    assert.throw(fn, `Cannot inject {String Constructor} to {Foo} at position 1`)
  })

  test('inject method dependencies injected via decorator', (assert) => {
    assert.plan(1)

    const ioc = new Ioc()
    class Bar {}

    class Foo {
      @inject()
      public greet (bar: Bar) {
        assert.instanceOf(bar, Bar)
      }
    }

    ioc.call(ioc.make(Foo), 'greet')
  })

  test('inject method dependencies with inline arguments', (assert) => {
    assert.plan(2)

    const ioc = new Ioc()
    class Bar {}

    class Foo {
      @inject()
      public greet (username: string, bar: Bar) {
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
      public greet (username: string, bar: BarContract) {
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
      public greet (_username: string, _bar: Bar) {
      }
    }

    const fn = () => ioc.call(ioc.make<Foo>(Foo), 'greet', [])
    assert.throw(fn, 'Cannot inject {String Constructor} to {Foo.greet} at position 1')
  })

  test('call object method even when it has zero injections', (assert) => {
    assert.plan(1)

    const ioc = new Ioc()
    class Foo {
      public greet () {
        assert.isTrue(true)
      }
    }

    ioc.call(ioc.make(Foo), 'greet')
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

  test('lookup autoload from namespace', (assert) => {
    const ioc = new Ioc()
    ioc.autoload(fs.basePath, 'App')

    assert.deepEqual(ioc.lookup('App/Foo'), {
      namespace: 'App/Foo',
      type: 'autoload',
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

  test('lookup autoload value from a lookup node', async (assert) => {
    await fs.add('Foo.js', `module.exports = 'bar'`)

    const ioc = new Ioc()
    ioc.autoload(fs.basePath, 'App')
    assert.equal(ioc.use({ type: 'autoload', namespace: 'App/Foo' }), 'bar')
  })

  test('raise exception when unable to resolve lookup namespace', async (assert) => {
    await fs.add('Foo.js', `module.exports = 'bar'`)

    const ioc = new Ioc()
    ioc.autoload(fs.basePath, 'App')
    const fn = () => ioc.use({ type: 'binding', namespace: 'App/Foo' })

    assert.throw(fn, 'E_IOC_BINDING_NOT_FOUND: Cannot resolve App/Foo binding from the IoC Container')
  })

  test('do not resolve binding for autoload lookup node', async (assert) => {
    await fs.add('Foo.js', `module.exports = 'bar'`)

    const ioc = new Ioc()
    ioc.bind('App/Foo', () => {
      return 'foo'
    })

    const fn = () => ioc.use({ type: 'autoload', namespace: 'App/Foo' })
    assert.throw(fn, /Cannot find module/)
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
    await fs.add('Foo.js', `module.exports = class Bar {}`)

    const ioc = new Ioc()
    ioc.autoload(fs.basePath, 'App')

    assert.equal(ioc.make({ type: 'autoload', namespace: 'App/Foo' }).constructor.name, 'Bar')
  })

  test('do not make binding for autoload lookup node', async (assert) => {
    await fs.add('Foo.js', `module.exports = 'bar'`)

    const ioc = new Ioc()
    ioc.bind('App/Foo', () => {
      return 'foo'
    })

    const fn = () => ioc.make({ type: 'autoload', namespace: 'App/Foo' })
    assert.throw(fn, /Cannot find module/)
  })

  test('raise exception when unable to make lookup namespace', async (assert) => {
    await fs.add('Foo.js', `module.exports = 'bar'`)

    const ioc = new Ioc()
    ioc.autoload(fs.basePath, 'App')
    const fn = () => ioc.make({ type: 'binding', namespace: 'App/Foo' })

    assert.throw(fn, 'E_IOC_BINDING_NOT_FOUND: Cannot resolve App/Foo binding from the IoC Container')
  })
})
