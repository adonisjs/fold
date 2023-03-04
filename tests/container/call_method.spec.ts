import { test } from '@japa/runner'
import { expectTypeOf } from 'expect-type'
import { Container } from '../../src/container.js'

test.group('Container | Call method', () => {
  test('dis-allow method call on values other than an object', async ({ assert }) => {
    const container = new Container()

    // @ts-expect-error
    await assert.rejects(() => container.call(1, 'foo'), 'Missing method "foo" on "1"')

    await assert.rejects(
      // @ts-expect-error
      () => container.call(false, 'foo'),
      'Missing method "foo" on "false"'
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
      'Missing method "foo" on "Map(1) { 1 => 1 }"'
    )

    await assert.rejects(
      // @ts-expect-error
      () => container.call(new Set([1]), 'foo'),
      'Missing method "foo" on "Set(1) { 1 }"'
    )

    await assert.rejects(
      // @ts-expect-error
      () => container.call(['foo'], 'foo'),
      'Missing method "foo" on "[ \'foo\' ]"'
    )

    await assert.rejects(
      // @ts-expect-error
      () => container.call(function foo() {}, 'foo'),
      'Missing method "foo" on "[Function: foo]"'
    )
  })

  test('invoke plain object methods without any DI', async ({ assert }) => {
    const container = new Container()
    const fooResult = await container.call({ foo: () => 'bar' }, 'foo')

    expectTypeOf(fooResult).toEqualTypeOf<'bar'>()
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

  test('throw error when injecting non class dependencies to the container', async ({ assert }) => {
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
    await assert.rejects(
      () => container.call(new UserService(), 'foo'),
      `Cannot inject "{ foo: 'bar' }" in "[class: UserService]". The value cannot be constructed`
    )
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

  test('raise error when class method has dependencies but no hints', async ({ assert }) => {
    class UserService {
      foo(id: number) {
        return id
      }
    }

    const container = new Container()
    await assert.rejects(
      () => container.call(new UserService(), 'foo'),
      'Cannot call "UserService.foo" method. Container is not able to resolve its dependencies'
    )
  })

  test('work fine when runtime values satisfies dependencies', async ({ assert }) => {
    class UserService {
      foo(id: number) {
        return id
      }
    }

    const container = new Container()
    assert.equal(await container.call(new UserService(), 'foo', [1]), 1)
  })

  test('work fine when method param has a default value', async ({ assert }) => {
    class UserService {
      foo(id: number = 2) {
        return id
      }
    }

    const container = new Container()
    assert.equal(await container.call(new UserService(), 'foo'), 2)
  })
})
