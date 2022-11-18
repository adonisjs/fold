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

  test('disallow swap names other than string symbol or class constructor', async ({ assert }) => {
    const container = new Container()

    assert.throws(
      // @ts-expect-error
      () => container.swap(1, () => {}),
      'The container binding key must be of type "string", "symbol", or a "class constructor"'
    )

    assert.throws(
      // @ts-expect-error
      () => container.swap([], () => {}),
      'The container binding key must be of type "string", "symbol", or a "class constructor"'
    )

    assert.throws(
      // @ts-expect-error
      () => container.swap({}, () => {}),
      'The container binding key must be of type "string", "symbol", or a "class constructor"'
    )

    assert.throws(
      () => container.restore(1),
      'The container binding key must be of type "string", "symbol", or a "class constructor"'
    )

    assert.throws(
      () => container.restore([]),
      'The container binding key must be of type "string", "symbol", or a "class constructor"'
    )

    assert.throws(
      () => container.restore({}),
      'The container binding key must be of type "string", "symbol", or a "class constructor"'
    )
  })

  test('restore multiple swapped bindings', async ({ assert }) => {
    const container = new Container<{ route: Route; route1: Route }>()
    class Route {}
    class FakedRoute extends Route {}

    container.bind('route', () => {
      return new Route()
    })
    container.bind('route1', () => {
      return new Route()
    })

    container.swap('route', () => {
      return new FakedRoute()
    })
    container.swap('route1', () => {
      return new FakedRoute()
    })

    const route = await container.make('route')
    expectTypeOf(route).toEqualTypeOf<Route>()

    assert.instanceOf(route, Route)
    assert.instanceOf(route, FakedRoute)

    const route1 = await container.make('route1')
    expectTypeOf(route1).toEqualTypeOf<Route>()

    assert.instanceOf(route1, Route)
    assert.instanceOf(route1, FakedRoute)

    /**
     * Restoring multiple
     */
    container.restoreAll(['route', 'route1'])

    const route2 = await container.make('route')
    expectTypeOf(route2).toEqualTypeOf<Route>()

    assert.instanceOf(route2, Route)
    assert.notInstanceOf(route2, FakedRoute)

    const route3 = await container.make('route1')
    expectTypeOf(route3).toEqualTypeOf<Route>()

    assert.instanceOf(route3, Route)
    assert.notInstanceOf(route3, FakedRoute)
  })
})
