/*
 * @adonisjs/fold
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import test from 'japa'
import { Ioc } from '../src/Ioc'

test.group('Ioc Resolver', () => {
  test('call handle method when no explicit method is defined', async (assert) => {
    class UserController {
      public handle() {
        return 'foo'
      }
    }

    const ioc = new Ioc()
    ioc.bind('App/UserController', () => new UserController())

    const resolver = ioc.getResolver()
    assert.equal(await resolver.call('App/UserController'), 'foo')
  })

  test('call namespace expression with method', async (assert) => {
    class UserController {
      public getUser() {
        return 'foo'
      }
    }

    const ioc = new Ioc()
    ioc.bind('App/UserController', () => new UserController())

    const resolver = ioc.getResolver()
    assert.equal(await resolver.call('App/UserController.getUser'), 'foo')
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
    assert.plan(1)

    const ioc = new Ioc()
    const resolver = ioc.getResolver()

    try {
      await resolver.call('App/UserController.getUser')
    } catch ({ message }) {
      assert.equal(
        message,
        'E_IOC_LOOKUP_FAILED: Cannot resolve "App/UserController" namespace from the IoC Container'
      )
    }
  })

  test('allow runtime prefix namespace', async (assert) => {
    class UserController {
      public handle() {
        return 'foo'
      }
    }

    const ioc = new Ioc()
    ioc.bind('App/UserController', () => new UserController())

    const resolver = ioc.getResolver()
    assert.equal(await resolver.call('UserController', 'App'), 'foo')
  })

  test('handle use case where namespace is same but prefix namespace is different', async (assert) => {
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
    assert.equal(await resolver.call('UserController', 'App'), 'user')
    assert.equal(await resolver.call('UserController', 'Admin'), 'admin')
  })

  test('handle use case where namespace is same but defined a different runtime prefix namespace', async (assert) => {
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
    assert.equal(await resolver.call('UserController'), 'user')
    assert.equal(await resolver.call('UserController', 'Admin'), 'admin')
  })

  test('pass resolve result to the call method', async (assert) => {
    class UserController {
      public getUser() {
        return 'foo'
      }
    }

    const ioc = new Ioc()
    ioc.bind('App/UserController', () => new UserController())

    const resolver = ioc.getResolver()
    const lookupNode = resolver.resolve('App/UserController.getUser')
    assert.equal(await resolver.call(lookupNode), 'foo')
  })
})
