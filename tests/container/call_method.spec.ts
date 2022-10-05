import { test } from '@japa/runner'
import { expectTypeOf } from 'expect-type'
import { Container } from '../../src/container.js'

test.group('Container | Call method', () => {
  test('dis-allow method call on values other than an object', async ({ assert }) => {
    const container = new Container()

    // @ts-expect-error
    await assert.rejects(() => container.call(1, 'foo'), 'method "foo" does not exists on "Number"')

    await assert.rejects(
      // @ts-expect-error
      () => container.call(false, 'foo'),
      'method "foo" does not exists on "Boolean"'
    )

    await assert.rejects(
      // @ts-expect-error
      () => container.call(undefined, 'foo'),
      `Cannot read properties of undefined (reading 'foo')`
    )

    await assert.rejects(
      // @ts-expect-error
      () => container.call(null, 'foo'),
      `Cannot read properties of null (reading 'foo')`
    )

    await assert.rejects(
      // @ts-expect-error
      () => container.call(new Map([[1, 1]]), 'foo'),
      'method "foo" does not exists on "Map"'
    )

    await assert.rejects(
      // @ts-expect-error
      () => container.call(new Set([1]), 'foo'),
      'method "foo" does not exists on "Set"'
    )

    await assert.rejects(
      // @ts-expect-error
      () => container.call(['foo'], 'foo'),
      'method "foo" does not exists on "Array"'
    )

    await assert.rejects(
      // @ts-expect-error
      () => container.call(function foo() {}, 'foo'),
      'method "foo" does not exists on "Function"'
    )
  })

  test('invoke plain object methods without any DI', async ({ assert }) => {
    const container = new Container()
    const fooResult = await container.call({ foo: () => 'bar' }, 'foo')

    expectTypeOf(fooResult).toEqualTypeOf<string>()
    assert.equal(fooResult, 'bar')
  })

  test('invoke method on class instance', async ({ assert }) => {
    class UserService {
      foo() {
        return 'bar'
      }
    }

    const container = new Container()
    const fooResult = await container.call(new UserService(), 'foo')

    expectTypeOf(fooResult).toEqualTypeOf<string>()
    assert.equal(fooResult, 'bar')
  })

  test('inject dependencies to class method', async ({ assert }) => {
    class Database {}

    class UserService {
      static containerInjections = {
        foo: [Database],
      }

      foo(db: Database) {
        return db
      }
    }

    const container = new Container()
    const fooResult = await container.call(new UserService(), 'foo')

    expectTypeOf(fooResult).toEqualTypeOf<Database>()
    assert.instanceOf(fooResult, Database)
  })

  test('inject non class dependencies to class method', async ({ assert }) => {
    class Database {}

    class UserService {
      static containerInjections = {
        foo: [Database, { foo: 'bar' }, 1],
      }

      foo(_: any, __: any, id: number) {
        return id
      }
    }

    const container = new Container()
    const fooResult = await container.call(new UserService(), 'foo')

    expectTypeOf(fooResult).toEqualTypeOf<number>()
    assert.equal(fooResult, 1)
  })

  test('merge runtime values with container dependencies', async ({ assert }) => {
    class Database {}

    class UserService {
      static containerInjections = {
        foo: [Database, String, Number],
      }

      foo(db: Database, name: string, id: number) {
        return { db, name, id }
      }
    }

    const container = new Container()
    const fooResult = await container.call(new UserService(), 'foo', [undefined, 'foo', 1])

    expectTypeOf(fooResult).toEqualTypeOf<{ db: Database; name: string; id: number }>()
    assert.deepEqual(fooResult, { db: new Database(), id: 1, name: 'foo' })
  })

  test('raise exception when method does not exist', async ({ assert }) => {
    class UserService {}

    const container = new Container()
    await assert.rejects(
      // @ts-expect-error
      () => container.call(new UserService(), 'foo'),
      'Missing method "foo" on "UserService {}"'
    )
  })
})
