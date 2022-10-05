import { test } from '@japa/runner'
import { expectTypeOf } from 'expect-type'
import { Container } from '../../src/container.js'

test.group('Container | Make class | Known bindings', () => {
  test('create a fresh instance of the container', ({ assert }) => {
    assert.instanceOf(new Container(), Container)
  })

  test('return non classes values as it is', async ({ assert }) => {
    const container = new Container<{ foo: 'bar' }>()

    const obj = await container.make({ foo: 'bar' })
    expectTypeOf(obj).toEqualTypeOf<{ foo: string }>()
    assert.deepEqual(obj, { foo: 'bar' })

    const numeric = await container.make(1)
    expectTypeOf(numeric).toEqualTypeOf<number>()
    assert.deepEqual(numeric, 1)

    const bool = await container.make(false)
    expectTypeOf(bool).toEqualTypeOf<boolean>()
    assert.deepEqual(bool, false)

    const notDefined = await container.make(undefined)
    expectTypeOf(notDefined).toEqualTypeOf<undefined>()
    assert.deepEqual(notDefined, undefined)

    const nullValue = await container.make(null)
    expectTypeOf(nullValue).toEqualTypeOf<null>()
    assert.deepEqual(nullValue, null)

    const mapValue = await container.make(new Map([[1, 1]]))
    expectTypeOf(mapValue).toEqualTypeOf<Map<number, number>>()
    assert.deepEqual(mapValue, new Map([[1, 1]]))

    const setValue = await container.make(new Set([1]))
    expectTypeOf(setValue).toEqualTypeOf<Set<number>>()
    assert.deepEqual(setValue, new Set([1]))

    const arrayValue = await container.make(['foo'])
    expectTypeOf(arrayValue).toEqualTypeOf<string[]>()
    assert.deepEqual(arrayValue, ['foo'])

    function foo() {}
    const func = await container.make(foo)
    expectTypeOf(func).toEqualTypeOf<() => void>()
    assert.deepEqual(func, foo)
  })

  test('make instance of a class using the container', async ({ assert }) => {
    class UserService {
      foo = 'bar'
    }
    const container = new Container<{ foo: 'bar' }>()
    const service = await container.make(UserService)

    expectTypeOf(service).toEqualTypeOf<UserService>()
    assert.instanceOf(service, UserService)
    assert.equal(service.foo, 'bar')
  })

  test('multiple calls to make should return a fresh instance', async ({ assert }) => {
    class UserService {
      foo = 'bar'
    }
    const container = new Container<{ foo: 'bar' }>()
    const service = await container.make(UserService)
    const service1 = await container.make(UserService)

    expectTypeOf(service).toEqualTypeOf<UserService>()
    expectTypeOf(service1).toEqualTypeOf<UserService>()
    assert.instanceOf(service, UserService)
    assert.instanceOf(service1, UserService)
    assert.notStrictEqual(service1, service)
    assert.equal(service.foo, 'bar')
  })

  test('inject constructor dependencies as defined in containerInjections', async ({ assert }) => {
    class Database {}

    class UserService {
      static containerInjections = {
        _constructor: [Database],
      }
      constructor(public db: Database) {}
    }

    const container = new Container<{ foo: 'bar' }>()
    const service = await container.make(UserService)

    expectTypeOf(service).toEqualTypeOf<UserService>()
    assert.instanceOf(service, UserService)
    assert.instanceOf(service.db, Database)
  })

  test('inject non class dependencies as it is', async ({ assert }) => {
    class UserService {
      args: any[]

      static containerInjections = {
        _constructor: [{ foo: 'bar' }, 1, ['foo'], false, undefined, null, false],
      }
      constructor(...args: any[]) {
        this.args = args
      }
    }

    const container = new Container<{ foo: 'bar' }>()
    const service = await container.make(UserService)

    assert.instanceOf(service, UserService)
    expectTypeOf(service).toEqualTypeOf<UserService>()
    assert.deepEqual(service.args, [{ foo: 'bar' }, 1, ['foo'], false, undefined, null, false])
  })

  test('do not inject constructor dependencies when containerInjections are empty', async ({
    assert,
  }) => {
    class UserService {
      static containerInjections = {
        _constructor: [],
      }
      constructor(public name: string) {}
    }

    const container = new Container<{ foo: 'bar' }>()
    const service = await container.make(UserService)

    assert.instanceOf(service, UserService)
    expectTypeOf(service).toEqualTypeOf<UserService>()
    assert.isUndefined(service.name)
  })

  test('raise error when injecting is a primitive class', async ({ assert }) => {
    class UserService {
      args: any[]

      static containerInjections = {
        _constructor: [String],
      }
      constructor() {}
    }

    const container = new Container<{ foo: 'bar' }>()
    await assert.rejects(
      () => container.make(UserService),
      'Cannot inject "[Function: String]". The value cannot be constructed'
    )
  })

  test('return primitive constructor as it is', async ({ assert }) => {
    const container = new Container<{ foo: 'bar' }>()

    const stringPrimitive = await container.make(String)
    expectTypeOf(stringPrimitive).toEqualTypeOf<String>()
    assert.deepEqual(stringPrimitive, String)
  })
})
