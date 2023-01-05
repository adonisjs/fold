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
import type { BindingResolver } from '../../src/types.js'

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

  test('restore multiple implementations', async ({ assert }) => {
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

    container.restoreAll([UserService])

    const user1 = await container.call(controller, 'show')
    expectTypeOf(user1).toEqualTypeOf<{ id: number; username: string }>()
    assert.deepEqual(user1, { id: 1, username: 'virk' })
  })

  test('restore all implementations', async ({ assert }) => {
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

    container.restoreAll()

    const user1 = await container.call(controller, 'show')
    expectTypeOf(user1).toEqualTypeOf<{ id: number; username: string }>()
    assert.deepEqual(user1, { id: 1, username: 'virk' })
  })

  test('disallow swap names other than class constructor', async ({ assert }) => {
    const container = new Container()

    assert.throws(
      // @ts-expect-error
      () => container.swap(1, () => {}),
      'Cannot call swap on value "1". Only classes can be swapped'
    )

    assert.throws(
      // @ts-expect-error
      () => container.swap([], () => {}),
      'Cannot call swap on value "[]". Only classes can be swapped'
    )

    assert.throws(
      // @ts-expect-error
      () => container.swap({}, () => {}),
      'Cannot call swap on value "{}". Only classes can be swapped'
    )
  })

  test('use swap over contextual binding', async ({ assert }) => {
    const container = new Container()

    abstract class Hash {
      abstract make(value: string): string
    }

    class Argon2 {
      make(value: string): string {
        return value.toUpperCase()
      }
    }

    class FakedHash {
      make(_: string): string {
        return 'fake'
      }
    }

    @inject()
    class UsersController {
      constructor(public hash: Hash) {}
    }

    container.contextualBinding(UsersController, Hash, () => {
      return new Argon2()
    })
    container.swap(Hash, () => {
      return new FakedHash()
    })

    expectTypeOf(container.contextualBinding<typeof Hash>)
      .parameter(2)
      .toEqualTypeOf<BindingResolver<any, Hash>>()

    const controller = await container.make(UsersController)
    expectTypeOf(controller).toEqualTypeOf<UsersController>()
    assert.instanceOf(controller.hash, FakedHash)
    assert.equal(controller.hash.make('foo'), 'fake')
  })
})
