import 'reflect-metadata'
import { test } from '@japa/runner'
import { EventEmitter } from 'node:events'
import { expectTypeOf } from 'expect-type'
import { Container } from '../../src/container.js'
import { inject } from '../../src/decorators/inject.js'

test.group('Container | Make class via inject', () => {
  test('inject constructor dependencies using @inject', async ({ assert }) => {
    class Database {}

    @inject()
    class UserService {
      constructor(public db: Database) {}
    }

    const container = new Container()
    const service = await container.make(UserService)

    expectTypeOf(service).toEqualTypeOf<UserService>()
    assert.instanceOf(service, UserService)
    assert.instanceOf(service.db, Database)
  })

  test('inject primitive values as it is', async ({ assert }) => {
    @inject()
    class UserService {
      args: any[]

      constructor(...args: any[]) {
        this.args = args
      }
    }

    const container = new Container()
    const service = await container.make(UserService)

    assert.instanceOf(service, UserService)
    expectTypeOf(service).toEqualTypeOf<UserService>()
    assert.deepEqual(service.args, [Array])
  })

  test('construct nested dependencies', async ({ assert }) => {
    class Config {}

    @inject()
    class Encryption {
      constructor(public config: Config) {}
    }

    @inject()
    class UserService {
      constructor(public encryption: Encryption) {}
    }

    const container = new Container()
    const service = await container.make(UserService)

    assert.instanceOf(service, UserService)
    expectTypeOf(service).toEqualTypeOf<UserService>()

    assert.instanceOf(service.encryption, Encryption)
    expectTypeOf(service.encryption).toEqualTypeOf<Encryption>()

    assert.instanceOf(service.encryption.config, Config)
    expectTypeOf(service.encryption.config).toEqualTypeOf<Config>()
  })

  test('construct method dependencies', async ({ assert }) => {
    class Config {}

    @inject()
    class Encryption {
      constructor(public config: Config) {}
    }

    class UserService {
      @inject()
      find(encryption: Encryption) {
        return encryption
      }
    }

    const container = new Container()
    const encryption = await container.call(await container.make(UserService), 'find')

    assert.instanceOf(encryption, Encryption)
    expectTypeOf(encryption).toEqualTypeOf<Encryption>()

    assert.instanceOf(encryption.config, Config)
    expectTypeOf(encryption.config).toEqualTypeOf<Config>()
  })

  test('inject constructor dependencies inside a sub-class', async ({ assert }) => {
    class Database {}

    @inject()
    class BaseService {
      constructor(public db: Database) {}
    }

    @inject()
    class UserService extends BaseService {}

    // @ts-expect-error
    assert.notStrictEqual(UserService.containerInjections, BaseService.containerInjections)

    const container = new Container()
    const service = await container.make(UserService)

    expectTypeOf(service).toEqualTypeOf<UserService>()
    assert.instanceOf(service, UserService)
    assert.instanceOf(service, BaseService)
    assert.instanceOf(service.db, Database)
  })

  test('inject sub-class constructor own dependencies', async ({ assert }) => {
    class Database {}
    class Emitter extends EventEmitter {}

    @inject()
    class BaseService {
      constructor(public db: Database) {}
    }

    @inject()
    class UserService extends BaseService {
      constructor(db: Database, public emitter: Emitter) {
        super(db)
      }
    }

    const container = new Container()
    const service = await container.make(UserService)

    // @ts-expect-error
    assert.notStrictEqual(UserService.containerInjections, BaseService.containerInjections)

    expectTypeOf(service).toEqualTypeOf<UserService>()
    assert.instanceOf(service, UserService)
    assert.instanceOf(service, BaseService)
    assert.instanceOf(service.db, Database)
    assert.instanceOf(service.emitter, Emitter)
  })

  test('inject method dependencies inside a sub-class', async ({ assert }) => {
    class Database {}
    class Emitter extends EventEmitter {}

    class BaseService {
      @inject()
      foo(db: Database) {
        return db
      }
    }

    class UserService extends BaseService {
      @inject()
      bar(emitter: Emitter) {
        return emitter
      }
    }

    const container = new Container()
    const service = await container.make(UserService)
    const fooResult = await container.call(service, 'foo')
    const barResult = await container.call(service, 'bar')

    // @ts-expect-error
    assert.notStrictEqual(UserService.containerInjections, BaseService.containerInjections)

    expectTypeOf(service).toEqualTypeOf<UserService>()
    expectTypeOf(fooResult).toEqualTypeOf<Database>()
    expectTypeOf(barResult).toEqualTypeOf<Emitter>()

    assert.instanceOf(fooResult, Database)
    assert.instanceOf(barResult, Emitter)
  })
})
