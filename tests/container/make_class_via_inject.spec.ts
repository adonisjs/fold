import 'reflect-metadata'
import { test } from '@japa/runner'
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
})
