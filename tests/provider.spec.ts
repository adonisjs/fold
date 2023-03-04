import { test } from '@japa/runner'
import { RuntimeException } from '@poppinss/utils'
import { expectTypeOf } from 'expect-type'
import { Container } from '../src/container.js'
import { containerProvider } from '../src/provider.js'

test.group('Provider', () => {
  test('return empty array when class has no dependencies', async ({ assert }) => {
    class UserService {}
    const container = new Container()
    const resolver = container.createResolver()

    const dependencies = await containerProvider(UserService, 'constructor', resolver)

    assert.deepEqual(dependencies, [])
    expectTypeOf(dependencies).toEqualTypeOf<any[]>()
  })

  test('use runtime values when class has no dependencies', async ({ assert }) => {
    class UserService {}
    const container = new Container()
    const resolver = container.createResolver()

    const dependencies = await containerProvider(UserService, 'constructor', resolver, [
      'foo',
      { foo: 'bar' },
    ])

    assert.deepEqual(dependencies, ['foo', { foo: 'bar' }])
    expectTypeOf(dependencies).toEqualTypeOf<any[]>()
  })

  test('make class dependencies using the resolver', async ({ assert }) => {
    class Database {}
    class UserService {
      static containerInjections = {
        constructor: {
          dependencies: [Database],
          createError: (message: string) => new RuntimeException(message),
        },
      }
    }

    const container = new Container()
    const resolver = container.createResolver()

    const dependencies = await containerProvider(UserService, 'constructor', resolver)

    assert.deepEqual(dependencies, [new Database()])
    expectTypeOf(dependencies).toEqualTypeOf<any[]>()
  })

  test('give priority to runtime values over defined dependencies', async ({ assert }) => {
    class Database {}
    class UserService {
      static containerInjections = {
        constructor: {
          dependencies: [Database],
          createError: (message: string) => new RuntimeException(message),
        },
      }
    }

    const container = new Container()
    const resolver = container.createResolver()

    const dependencies = await containerProvider(UserService, 'constructor', resolver, [
      { foo: 'bar' },
    ])

    assert.deepEqual(dependencies, [{ foo: 'bar' }])
    expectTypeOf(dependencies).toEqualTypeOf<any[]>()
  })

  test('use all runtime values regardless of the dependencies length', async ({ assert }) => {
    class Database {}
    class UserService {
      static containerInjections = {
        constructor: {
          dependencies: [Database],
          createError: (message: string) => new RuntimeException(message),
        },
      }
    }

    const container = new Container()
    const resolver = container.createResolver()

    const dependencies = await containerProvider(UserService, 'constructor', resolver, [
      undefined,
      { foo: 'bar' },
    ])

    assert.deepEqual(dependencies, [new Database(), { foo: 'bar' }])
    expectTypeOf(dependencies).toEqualTypeOf<any[]>()
  })

  test('dis-allow primitive constructors', async ({ assert }) => {
    class UserService {
      static containerInjections = {
        constructor: {
          dependencies: [String],
          createError: (message: string) => new RuntimeException(message),
        },
      }
    }

    const container = new Container()
    const resolver = container.createResolver()

    await assert.rejects(async () => {
      await containerProvider(UserService, 'constructor', resolver, [])
    }, 'Cannot inject "[Function: String]" in "[class UserService]"')
  })
})
