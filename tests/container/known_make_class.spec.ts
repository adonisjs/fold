import { test } from '@japa/runner'
import { expectTypeOf } from 'expect-type'
import { Container } from '../../src/container.js'

test.group('Container | Make class | Known bindings', () => {
  test('create a fresh instance of the container', ({ assert }) => {
    assert.instanceOf(new Container(), Container)
  })

  test('throw error when unsupported data type is given to the container', async ({ assert }) => {
    const container = new Container<{ foo: 'bar' }>()

    try {
      const obj = await container.make({ foo: 'bar' })
      expectTypeOf(obj).toEqualTypeOf<never>()
    } catch (error) {
      assert.equal(error.message, `Cannot construct value "{ foo: 'bar' }" using container`)
    }

    try {
      const numeric = await container.make(1)
      expectTypeOf(numeric).toEqualTypeOf<never>()
    } catch (error) {
      assert.equal(error.message, `Cannot construct value "1" using container`)
    }

    try {
      const bool = await container.make(false)
      expectTypeOf(bool).toEqualTypeOf<never>()
    } catch (error) {
      assert.equal(error.message, `Cannot construct value "false" using container`)
    }

    try {
      const notDefined = await container.make(undefined)
      expectTypeOf(notDefined).toEqualTypeOf<never>()
    } catch (error) {
      assert.equal(error.message, `Cannot construct value "undefined" using container`)
    }

    try {
      const nullValue = await container.make(null)
      expectTypeOf(nullValue).toEqualTypeOf<never>()
    } catch (error) {
      assert.equal(error.message, `Cannot construct value "null" using container`)
    }

    try {
      const mapValue = await container.make(new Map([[1, 1]]))
      expectTypeOf(mapValue).toEqualTypeOf<never>()
    } catch (error) {
      assert.equal(error.message, `Cannot construct value "Map(1) { 1 => 1 }" using container`)
    }

    try {
      const setValue = await container.make(new Set([1]))
      expectTypeOf(setValue).toEqualTypeOf<never>()
    } catch (error) {
      assert.equal(error.message, `Cannot construct value "Set(1) { 1 }" using container`)
    }

    try {
      const arrayValue = await container.make(['foo'])
      expectTypeOf(arrayValue).toEqualTypeOf<never>()
    } catch (error) {
      assert.equal(error.message, `Cannot construct value "[ 'foo' ]" using container`)
    }

    function foo() {}
    try {
      const func = await container.make(foo)
      expectTypeOf(func).toEqualTypeOf<never>()
    } catch (error) {
      assert.equal(error.message, `Cannot construct value "[Function: foo]" using container`)
    }
  })

  test('throw error when unable to resolve a binding by name', async ({ assert }) => {
    const container = new Container<{ foo: 'bar' }>()

    try {
      const obj = await container.make('bar')
      expectTypeOf(obj).toEqualTypeOf<never>()
    } catch (error) {
      assert.equal(error.message, `Cannot resolve binding "bar" from the container`)
    }

    try {
      const obj = await container.make(Symbol('bar'))
      expectTypeOf(obj).toEqualTypeOf<never>()
    } catch (error) {
      assert.equal(error.message, `Cannot resolve binding "Symbol(bar)" from the container`)
    }
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

  test('throw error when injecting non-class values to the constructor', async ({ assert }) => {
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
    await assert.rejects(
      () => container.make(UserService),
      `Cannot construct value "{ foo: 'bar' }" using container`
    )
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

  test('raise error when injecting a primitive class', async ({ assert }) => {
    class UserService {
      static containerInjections = {
        _constructor: [String],
      }
      constructor() {}
    }

    const container = new Container<{ foo: 'bar' }>()
    await assert.rejects(
      () => container.make(UserService),
      'Cannot construct value "[Function: String]" using container'
    )
  })

  test('throw error when constructing primitive values', async ({ assert }) => {
    const container = new Container<{ foo: 'bar' }>()

    await assert.rejects(
      () => container.make(String),
      'Cannot construct value "[Function: String]" using container'
    )
  })
})
