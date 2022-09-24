/*
 * @adonisjs/fold
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import 'reflect-metadata'
import { test } from '@japa/runner'
import { expectTypeOf } from 'expect-type'

import { inject } from '../../index.js'
import { Container } from '../../src/container.js'

test.group('Container | swap', () => {
  test('swap a class implementation', async ({ assert }) => {
    class UserService {
      get() {
        return {
          id: 1,
          username: 'virk',
        }
      }
    }

    class UsersController {
      constructor() {}

      @inject()
      show(user: UserService) {
        return user.get()
      }
    }

    class FakedUserService extends UserService {
      get() {
        return {
          id: 1,
          username: 'faked-virk',
        }
      }
    }

    const container = new Container()
    container.swap(UserService, () => {
      return new FakedUserService()
    })

    const controller = await container.make(UsersController)
    expectTypeOf(controller).toEqualTypeOf<UsersController>()

    const user = await container.call(controller, 'show')
    expectTypeOf(user).toEqualTypeOf<{ id: number; username: string }>()

    assert.deepEqual(user, { id: 1, username: 'faked-virk' })
  })

  test('restore class implementation', async ({ assert }) => {
    class UserService {
      get() {
        return {
          id: 1,
          username: 'virk',
        }
      }
    }

    class UsersController {
      constructor() {}

      @inject()
      show(user: UserService) {
        return user.get()
      }
    }

    class FakedUserService extends UserService {
      get() {
        return {
          id: 1,
          username: 'faked-virk',
        }
      }
    }

    const container = new Container()
    container.swap(UserService, () => {
      return new FakedUserService()
    })

    const controller = await container.make(UsersController)
    expectTypeOf(controller).toEqualTypeOf<UsersController>()

    const user = await container.call(controller, 'show')
    expectTypeOf(user).toEqualTypeOf<{ id: number; username: string }>()
    assert.deepEqual(user, { id: 1, username: 'faked-virk' })

    container.restore(UserService)

    const user1 = await container.call(controller, 'show')
    expectTypeOf(user1).toEqualTypeOf<{ id: number; username: string }>()
    assert.deepEqual(user1, { id: 1, username: 'virk' })
  })

  test('swap a binding', async ({ assert }) => {
    const container = new Container<{ route: Route }>()
    class Route {}
    class FakedRoute extends Route {}

    container.bind('route', () => {
      return new Route()
    })

    container.swap('route', () => {
      return new FakedRoute()
    })

    const route = await container.make('route')
    expectTypeOf(route).toEqualTypeOf<Route>()

    assert.instanceOf(route, Route)
    assert.instanceOf(route, FakedRoute)
  })

  test('restore swapped binding', async ({ assert }) => {
    const container = new Container<{ route: Route }>()
    class Route {}
    class FakedRoute extends Route {}

    container.bind('route', () => {
      return new Route()
    })

    container.swap('route', () => {
      return new FakedRoute()
    })

    const route = await container.make('route')
    expectTypeOf(route).toEqualTypeOf<Route>()

    assert.instanceOf(route, Route)
    assert.instanceOf(route, FakedRoute)

    container.restoreAll()

    const route1 = await container.make('route')
    expectTypeOf(route1).toEqualTypeOf<Route>()

    assert.instanceOf(route1, Route)
    assert.notInstanceOf(route1, FakedRoute)
  })
})
