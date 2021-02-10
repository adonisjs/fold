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

test.group('Ioc', () => {
  test('raise error when bind callback is not a function', (assert) => {
    const ioc = new Ioc()
    const fn = () => (ioc as any).bind('App/Foo', 'hello')
    assert.throw(fn, 'E_RUNTIME_EXCEPTION: "ioc.bind" expect 2nd argument to be a function')
  })

  test('add binding to the container', (assert) => {
    const ioc = new Ioc()
    ioc.bind('App/Foo', () => {
      return 'foo'
    })

    assert.deepEqual(ioc.lookup('App/Foo'), { namespace: 'App/Foo', type: 'binding' })
  })

  test('add singleton binding to the container', (assert) => {
    const ioc = new Ioc()
    ioc.singleton('App/Foo', () => {
      return 'foo'
    })

    assert.deepEqual(ioc.lookup('App/Foo'), { namespace: 'App/Foo', type: 'binding' })
  })

  test('register import alias', (assert) => {
    const ioc = new Ioc()
    ioc.alias(join(__dirname, './app'), 'App')

    assert.deepEqual(ioc.lookup('App/Foo'), { namespace: 'App/Foo', type: 'alias' })
    assert.isNull(ioc.lookup('Apple/Foo'))
    assert.deepEqual(ioc.importAliases, { App: join(__dirname, './app') })
  })

  test('register fake', (assert) => {
    const ioc = new Ioc()
    ioc.fake('App/Foo', () => {})

    assert.isTrue(ioc.hasFake('App/Foo'))
  })

  test('return true from "hasBinding" when binding exists', (assert) => {
    const ioc = new Ioc()
    ioc.bind('App/Foo', () => {
      return { foo: true }
    })

    assert.isTrue(ioc.hasBinding('App/Foo'))
    assert.isFalse(ioc.hasBinding('Foo'))
  })

  test('return true from "isAliasPath" when namespace is part of import aliases', (assert) => {
    const ioc = new Ioc()
    ioc.alias(join(__dirname, './app'), 'App')

    assert.isTrue(ioc.isAliasPath('App/Foo'))
    assert.isFalse(ioc.isAliasPath('Foo'))
  })

  test('return false from "isAliasPath" when import alias has a conflict with binding', (assert) => {
    const ioc = new Ioc()

    ioc.alias(join(__dirname, './app'), 'App')
    ioc.bind('App/Foo', () => {
      return { foo: true }
    })

    assert.isFalse(ioc.isAliasPath('App/Foo'))
    assert.isFalse(ioc.isAliasPath('Foo'))
  })

  test('return true from "hasFake" when fake exists', (assert) => {
    const ioc = new Ioc()
    ioc.fake('App/Foo', () => {})

    assert.isTrue(ioc.hasFake('App/Foo'))
  })
})

test.group('Ioc | lookup', () => {
  test('lookup namespace', (assert) => {
    const ioc = new Ioc()
    ioc.bind('App/Foo', () => {
      return 'foo'
    })

    assert.deepEqual(ioc.lookup('App/Foo'), {
      namespace: 'App/Foo',
      type: 'binding',
    })
  })

  test('lookup absolute namespace', (assert) => {
    const ioc = new Ioc()
    ioc.bind('App/Foo', () => {
      return 'foo'
    })

    assert.deepEqual(ioc.lookup('/App/Foo'), {
      namespace: 'App/Foo',
      type: 'binding',
    })
  })

  test('lookup namespace with a prefix', (assert) => {
    const ioc = new Ioc()
    ioc.bind('App/Foo', () => {
      return 'foo'
    })

    assert.deepEqual(ioc.lookup('Foo', 'App'), {
      namespace: 'App/Foo',
      type: 'binding',
    })
  })

  test('lookup absolute namespace with a prefix', (assert) => {
    const ioc = new Ioc()
    ioc.bind('App/Foo', () => {
      return 'foo'
    })

    assert.deepEqual(ioc.lookup('/App/Foo', 'App'), {
      namespace: 'App/Foo',
      type: 'binding',
    })
  })

  test('lookup namespace from aliases', (assert) => {
    const ioc = new Ioc()
    ioc.alias(join(__dirname, './app'), 'App')

    assert.deepEqual(ioc.lookup('App/Foo'), {
      namespace: 'App/Foo',
      type: 'alias',
    })
  })

  test('lookup namespace from aliases with a prefix', (assert) => {
    const ioc = new Ioc()
    ioc.alias(join(__dirname, './app'), 'App')

    assert.deepEqual(ioc.lookup('Foo', 'App'), {
      namespace: 'App/Foo',
      type: 'alias',
    })
  })

  test('lookup absolute namespace from aliases with a prefix', (assert) => {
    const ioc = new Ioc()
    ioc.alias(join(__dirname, './app'), 'App')

    assert.deepEqual(ioc.lookup('/App/Foo', 'App'), {
      namespace: 'App/Foo',
      type: 'alias',
    })
  })

  test('give preference to binding when alias and binding namespace has a conflict', (assert) => {
    const ioc = new Ioc()
    ioc.alias(join(__dirname, './app'), 'App')

    ioc.bind('App/Foo', () => {
      return 'foo'
    })

    assert.deepEqual(ioc.lookup('App/Foo'), { namespace: 'App/Foo', type: 'binding' })
  })

  test('return null when namespace is not a binding and neither part of import aliases', (assert) => {
    const ioc = new Ioc()
    assert.isNull(ioc.lookup('App/Foo'))
  })
})

test.group('Ioc | resolveBinding', () => {
  test('resolve binding', (assert) => {
    const ioc = new Ioc()
    ioc.bind('App/Foo', () => {
      return 'foo'
    })

    assert.equal(ioc.resolveBinding('App/Foo'), 'foo')
  })

  test('do not resolve import alias', (assert) => {
    const ioc = new Ioc()
    ioc.alias(join(__dirname, './app'), 'App')

    assert.throw(
      () => ioc.resolveBinding('App/Foo'),
      'E_IOC_LOOKUP_FAILED: Cannot resolve "App/Foo" namespace from the IoC Container'
    )
  })

  test('raise exception when binding is not registered', (assert) => {
    const ioc = new Ioc()
    assert.throw(
      () => ioc.resolveBinding('App/Foo'),
      'E_IOC_LOOKUP_FAILED: Cannot resolve "App/Foo" namespace from the IoC Container'
    )
  })

  test('resolve binding on every call', (assert) => {
    const ioc = new Ioc()
    ioc.bind('App/Foo', () => {
      return Symbol('foo')
    })

    assert.notStrictEqual(ioc.resolveBinding('App/Foo'), ioc.resolveBinding('App/Foo'))
  })

  test('do not resolve singleton in subsequent calls', (assert) => {
    const ioc = new Ioc()
    ioc.singleton('App/Foo', () => {
      return Symbol('foo')
    })

    assert.strictEqual(ioc.resolveBinding('App/Foo'), ioc.resolveBinding('App/Foo'))
  })

  test('wrap output "object" inside proxy when fake is registered', (assert) => {
    const ioc = new Ioc()
    ioc.bind('App/Foo', () => {
      return { foo: true }
    })

    ioc.useProxies()
    ioc.fake('App/Foo', () => {
      return { foo: false }
    })

    assert.deepEqual(ioc.resolveBinding('App/Foo'), { foo: false })
  })

  test('wrap output "class constructor" inside proxy when fake is registered', (assert) => {
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

    assert.instanceOf(new (ioc.resolveBinding('App/Foo'))(), FakeUser)
  })

  test('class "static properties" must point to fake class', (assert) => {
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

    assert.equal(ioc.resolveBinding('App/Foo').userName, 'nikk')
  })

  test('class "constructor" must point to the fake object', (assert) => {
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

    const Foo = ioc.resolveBinding('App/Foo')
    const foo = new Foo()

    assert.equal(foo.constructor.userName, 'nikk')
  })

  test('class "constructor" must point to the original object, when "no fake is defined"', (assert) => {
    const ioc = new Ioc()
    class User {
      public static userName = 'virk'
    }

    ioc.bind('App/Foo', () => {
      return User
    })

    ioc.useProxies()

    const Foo = ioc.resolveBinding('App/Foo')
    const foo = new Foo()

    assert.equal(foo.constructor.userName, 'virk')
  })

  test('super class "constructor" must point to the fake class', (assert) => {
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

    class Bar extends ioc.resolveBinding('App/Foo') {
      public static userName = 'nikk'
      public username = 'nikk'
    }

    const bar = new Bar()
    assert.deepEqual(bar.constructor, Bar)
    assert.deepEqual(bar.constructor['userName'], 'nikk')
    assert.deepEqual(bar.username, 'nikk')
    assert.deepEqual(Object.getPrototypeOf(bar.constructor)['userName'], 'romain')
  })

  test('super class "constructor" must point to the original class, when "no fake is defined"', (assert) => {
    const ioc = new Ioc()
    class User {
      public static userName = 'virk'
      public username = 'virk'
    }

    ioc.bind('App/Foo', () => {
      return User
    })
    ioc.useProxies()

    class Bar extends ioc.resolveBinding('App/Foo') {
      public static userName = 'nikk'
      public username = 'nikk'
    }

    const bar = new Bar()
    assert.deepEqual(bar.constructor, Bar)
    assert.deepEqual(bar.constructor['userName'], 'nikk')
    assert.deepEqual(bar.username, 'nikk')
    assert.deepEqual(Object.getPrototypeOf(bar.constructor)['userName'], 'virk')
  })

  test('do not wrap "literal" values inside proxy', (assert) => {
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

    assert.equal(ioc.resolveBinding('App/Foo'), 'foo')
  })

  test('trap "ioc.use" statement when binding is defined', (assert) => {
    const ioc = new Ioc()
    ioc.bind('App/Foo', () => {
      return 'foo'
    })

    ioc.trap(() => {
      return { name: 'foo' }
    })

    assert.deepEqual(ioc.use('App/Foo'), { name: 'foo' })
  })

  test('trap "ioc.use" statement when binding is not defined', (assert) => {
    const ioc = new Ioc()
    ioc.trap(() => {
      return { name: 'foo' }
    })

    assert.deepEqual(ioc.use('App/Foo'), { name: 'foo' })
  })
})

test.group('Ioc | require', (group) => {
  group.afterEach(async () => {
    await fs.cleanup()
  })

  test('import "esm ts" module', async (assert) => {
    await fs.add(
      'app/User.ts',
      `
      export default class User {
        public username = 'virk'
      }
    `
    )

    const ioc = new Ioc()
    ioc.alias(join(fs.basePath, './app'), 'App')
    const resolved = ioc.require('App/User')

    assert.property(resolved, 'default')
    assert.equal(new resolved.default().username, 'virk')
  })

  test('handle path subsitions carefully', async (assert) => {
    await fs.add(
      'app/User/App/User.ts',
      `
      export default class User {
        public username = 'virk'
      }
    `
    )

    const ioc = new Ioc()
    ioc.alias(join(fs.basePath, './app'), 'App')
    const resolved = ioc.require('App/User/App/User')

    assert.property(resolved, 'default')
    assert.equal(new resolved.default().username, 'virk')
  })

  test('import "cjs js" module', async (assert) => {
    await fs.add(
      'app/User.cjs.js',
      `
      module.exports = class User {
        constructor() {
          this.username = 'virk'
        }
      }
    `
    )

    const ioc = new Ioc()
    ioc.alias(join(fs.basePath, './app'), 'App')
    const resolved = ioc.require('App/User.cjs')

    assert.equal(new resolved().username, 'virk')
  })

  test('raise exception when module is missing', async (assert) => {
    assert.plan(1)

    const ioc = new Ioc()
    ioc.alias(join(fs.basePath, './app'), 'App')

    try {
      ioc.require('App/Foo')
    } catch (error) {
      assert.match(error.message, /Cannot find module/)
    }
  })

  test('wrap output "object" inside proxy when fake is registered', async (assert) => {
    await fs.add(
      'app/User.ts',
      `
      const user = {
        username: 'virk'
      }
      export default user
    `
    )

    await fs.add(
      'app/User.cjs.js',
      `
      module.exports = {
        username: 'virk'
      }
    `
    )

    const ioc = new Ioc()
    ioc.alias(join(fs.basePath, './app'), 'App')
    ioc.useProxies()

    ioc.fake('App/User', () => {
      return { username: 'romain' }
    })

    ioc.fake('App/User.cjs', () => {
      return { username: 'romain' }
    })

    assert.deepEqual(ioc.require('App/User').default, { username: 'romain' })
    assert.isTrue(ioc.require('App/User').__esModule)
    assert.deepEqual(ioc.require('App/User.cjs'), { username: 'romain' })

    ioc.useProxies(false)

    assert.deepEqual(ioc.require('App/User').default, { username: 'virk' })
    assert.isTrue(ioc.require('App/User').__esModule)
    assert.deepEqual(ioc.require('App/User.cjs'), { username: 'virk' })
  })

  test('wrap output "class constructor" inside proxy when fake is registered', async (assert) => {
    await fs.add(
      'app/User.ts',
      `
      export default class User {
        public username = 'virk'
      }
    `
    )

    await fs.add(
      'app/User.cjs.js',
      `
      module.exports = class User {
        constructor() {
          this.username = 'virk'
        }
      }
    `
    )

    const ioc = new Ioc()
    ioc.alias(join(fs.basePath, './app'), 'App')
    ioc.useProxies()

    ioc.fake('App/User', () => {
      return class FakeUser {
        public username = 'romain'
      }
    })

    ioc.fake('App/User.cjs', () => {
      return class FakeUser {
        public username = 'romain'
      }
    })

    assert.equal(new (ioc.require('App/User').default)().username, 'romain')
    assert.isTrue(ioc.require('App/User').__esModule)
    assert.equal(new (ioc.require('App/User.cjs'))().username, 'romain')

    ioc.useProxies(false)

    assert.equal(new (ioc.require('App/User').default)().username, 'virk')
    assert.isTrue(ioc.require('App/User').__esModule)
    assert.equal(new (ioc.require('App/User.cjs'))().username, 'virk')
  })

  test('class "static properties" must point to fake class', async (assert) => {
    await fs.add(
      'app/User.ts',
      `
      export default class User {
        public static userName = 'virk'
      }
    `
    )

    await fs.add(
      'app/User.cjs.js',
      `
      module.exports = class User {
        static get userName() {
          return 'virk'
        }
      }
    `
    )

    const ioc = new Ioc()
    ioc.alias(join(fs.basePath, './app'), 'App')
    ioc.useProxies()

    ioc.fake('App/User', () => {
      return class FakeUser {
        public static userName = 'romain'
      }
    })

    ioc.fake('App/User.cjs', () => {
      return class FakeUser {
        public static userName = 'romain'
      }
    })

    ioc.useProxies()
    assert.equal(ioc.require('App/User').default.userName, 'romain')
    assert.equal(ioc.require('App/User.cjs').userName, 'romain')

    ioc.useProxies(false)
    assert.equal(ioc.require('App/User').default.userName, 'virk')
    assert.equal(ioc.require('App/User.cjs').userName, 'virk')
  })

  test('class "constructor" must point to the fake object', async (assert) => {
    await fs.add(
      'app/User.ts',
      `
      export default class User {
        public static userName = 'virk'
      }
    `
    )

    await fs.add(
      'app/User.cjs.js',
      `
      module.exports = class User {
        static get userName() {
          return 'virk'
        }
      }
    `
    )

    const ioc = new Ioc()
    ioc.alias(join(fs.basePath, './app'), 'App')
    ioc.useProxies()

    ioc.fake('App/User', () => {
      return class FakeUser {
        public static userName = 'romain'
      }
    })

    ioc.fake('App/User.cjs', () => {
      return class FakeUser {
        public static userName = 'romain'
      }
    })

    ioc.useProxies()

    const fakeUser = new (ioc.require('App/User').default)()
    assert.equal(fakeUser.constructor.userName, 'romain')

    const fakeUserCjs = new (ioc.require('App/User.cjs'))()
    assert.equal(fakeUserCjs.constructor.userName, 'romain')

    ioc.useProxies(false)

    const user = new (ioc.require('App/User').default)()
    assert.equal(user.constructor.userName, 'virk')

    const userCjs = new (ioc.require('App/User.cjs'))()
    assert.equal(userCjs.constructor.userName, 'virk')
  })

  test('class "constructor" must point to the original object, when "no fake is defined"', async (assert) => {
    await fs.add(
      'app/User.ts',
      `
      export default class User {
        public static userName = 'virk'
      }
    `
    )

    await fs.add(
      'app/User.cjs.js',
      `
      module.exports = class User {
        static get userName() {
          return 'virk'
        }
      }
    `
    )

    const ioc = new Ioc()
    ioc.alias(join(fs.basePath, './app'), 'App')
    ioc.useProxies()

    const user = new (ioc.require('App/User').default)()
    assert.equal(user.constructor.userName, 'virk')

    const userCjs = new (ioc.require('App/User.cjs'))()
    assert.equal(userCjs.constructor.userName, 'virk')
  })

  test('super class "constructor" must point to the fake class', async (assert) => {
    await fs.add(
      'app/User.ts',
      `export default class User {
        public static userName = 'virk'
        public username = 'virk'
      }`
    )

    const ioc = new Ioc()
    ioc.alias(join(fs.basePath, './app'), 'App')
    ioc.useProxies()

    ioc.fake('App/User', () => {
      return class FakeUser {
        public static userName = 'romain'
        public username = 'romain'
      }
    })

    const User = ioc.require('App/User').default
    class Bar extends User {
      public static userName = 'nikk'
      public username = 'nikk'
    }

    const bar = new Bar()
    assert.deepEqual(bar.constructor, Bar)
    assert.deepEqual(bar.constructor['userName'], 'nikk')
    assert.deepEqual(bar.username, 'nikk')
    assert.deepEqual(Object.getPrototypeOf(bar.constructor)['userName'], 'romain')
  })

  test('super class "constructor" must point to the original class, when "no fake is defined"', async (assert) => {
    await fs.add(
      'app/User.ts',
      `export default class User {
        public static userName = 'virk'
        public username = 'virk'
      }`
    )

    const ioc = new Ioc()
    ioc.alias(join(fs.basePath, './app'), 'App')
    ioc.useProxies()

    const User = ioc.require('App/User').default
    class Bar extends User {
      public static userName = 'nikk'
      public username = 'nikk'
    }

    const bar = new Bar()
    assert.deepEqual(bar.constructor, Bar)
    assert.deepEqual(bar.constructor['userName'], 'nikk')
    assert.deepEqual(bar.username, 'nikk')
    assert.deepEqual(Object.getPrototypeOf(bar.constructor)['userName'], 'virk')
  })

  test('do not wrap "literal" values inside proxy', async (assert) => {
    await fs.add(
      'app/User.ts',
      `const name = 'virk'

      export default name
      `
    )

    const ioc = new Ioc()
    ioc.alias(join(fs.basePath, './app'), 'App')
    ioc.useProxies()

    ioc.fake('App/User', () => {
      return class FakeUser {
        public static userName = 'nikk'
      }
    })

    assert.equal(ioc.require('App/User').default, 'virk')
  })

  test('trap "ioc.use" statement when binding is defined', (assert) => {
    const ioc = new Ioc()
    ioc.bind('App/Foo', () => {
      return 'foo'
    })

    ioc.trap(() => {
      return { name: 'foo' }
    })

    assert.deepEqual(ioc.use('App/Foo'), { name: 'foo' })
  })

  test('trap "ioc.use" statement when binding is not defined', (assert) => {
    const ioc = new Ioc()
    ioc.trap(() => {
      return { name: 'foo' }
    })

    assert.deepEqual(ioc.use('App/Foo'), { name: 'foo' })
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

  test('make instance and inject dependencies', (assert) => {
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
      return Bar
    })

    assert.equal(ioc.make('Admin/Foo').name, 'bar')
    assert.isTrue(types.isProxy(ioc.use('Admin/Foo')))
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
      return Baz
    })

    assert.equal(ioc.make('Admin/Bar').name, 'baz')
    assert.isTrue(types.isProxy(ioc.use('Admin/Bar').default))
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

  test('trap "ioc.make" statement when binding is defined', (assert) => {
    const ioc = new Ioc()
    ioc.bind('App/Foo', () => {
      return 'foo'
    })

    ioc.trap(() => {
      return { name: 'foo' }
    })

    assert.deepEqual(ioc.make('App/Foo'), { name: 'foo' })
  })

  test('trap "ioc.make" statement when binding is not defined', (assert) => {
    const ioc = new Ioc()
    ioc.trap(() => {
      return { name: 'foo' }
    })

    assert.deepEqual(ioc.make('App/Foo'), { name: 'foo' })
  })
})

test.group('Ioc | withBindings', () => {
  test('execute the callback when all bindings exists', async (assert) => {
    assert.plan(2)
    const ioc = new Ioc()

    ioc.bind('App/Foo', () => {
      return 'foo'
    })

    ioc.bind('App/Bar', () => {
      return 'bar'
    })

    ioc.withBindings(['App/Foo', 'App/Bar'], (foo, bar) => {
      assert.equal(foo, 'foo')
      assert.equal(bar, 'bar')
    })
  })

  test('do not execute the callback if any bindings is missing', async () => {
    const ioc = new Ioc()

    ioc.bind('App/Foo', () => {
      return 'foo'
    })

    ioc.withBindings(['App/Foo', 'App/Bar'], () => {
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
    assert.equal(ioc.make('App/Bar').name, 'bar')

    ioc.fake('App/Bar', () => {
      return BarFake
    })

    assert.equal(ioc.make('App/Bar').name, 'barfake')
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

  test('set injections when parameter has no type', (assert) => {
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

  test('set multiple parameter injections', (assert) => {
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

    ioc.call(ioc.make(Foo), 'greet')
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
})
