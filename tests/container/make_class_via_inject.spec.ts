import 'reflect-metadata'
import { test } from '@japa/runner'
import { EventEmitter } from 'node:events'
import { expectTypeOf } from 'expect-type'
import { Container } from '../../src/container.js'
import { inject } from '../../src/decorators/inject.js'
import type { BindingResolver } from '../../src/types.js'

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

  test('throw error when injecting primitive values', async ({ assert }) => {
    @inject()
    class UserService {
      args: any[]

      constructor(...args: any[]) {
        this.args = args
      }
    }

    const container = new Container()
    await assert.rejects(
      () => container.make(UserService),
      'Cannot construct value "[Function: Array]" using container'
    )
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

  test('raise exception when injecting primitive classes', async ({ assert }) => {
    @inject()
    class UserService {
      constructor(public db: string) {}
    }

    const container = new Container()
    await assert.rejects(
      () => container.make(UserService),
      'Cannot construct value "[Function: String]" using container'
    )
  })

  test('raise exception when injecting a typescript type', async ({ assert }) => {
    type Db = {}

    @inject()
    class UserService {
      constructor(public db: Db) {}
    }

    const container = new Container()
    await assert.rejects(
      () => container.make(UserService),
      'Cannot construct value "[Function: Object]" using container'
    )
  })

  test('raise exception when injecting a typescript interface', async ({ assert }) => {
    interface Db {}

    @inject()
    class UserService {
      constructor(public db: Db) {}
    }

    const container = new Container()
    await assert.rejects(
      () => container.make(UserService),
      'Cannot construct value "[Function: Object]" using container'
    )
  })
})

test.group('Container | Make class with contextual bindings', () => {
  test('resolve contextual bindings for a class constructor', async ({ assert }) => {
    const container = new Container()

    abstract class Hash {
      abstract make(value: string): string
    }

    @inject()
    class UsersController {
      constructor(public hash: Hash) {}
    }

    class Argon2 {
      make(value: string): string {
        return value.toUpperCase()
      }
    }

    const builder = container.when(UsersController).asksFor(Hash)
    builder.provide(() => {
      return new Argon2()
    })

    expectTypeOf(builder.provide).parameters.toEqualTypeOf<[BindingResolver<any, Hash>]>()
    expectTypeOf(container.contextualBinding<typeof Hash>)
      .parameter(2)
      .toEqualTypeOf<BindingResolver<any, Hash>>()

    const controller = await container.make(UsersController)
    expectTypeOf(controller).toEqualTypeOf<UsersController>()
    assert.instanceOf(controller.hash, Argon2)
  })

  test('do not resolve contextual binding when parent is registered as a binding to the container', async ({
    assert,
  }) => {
    const container = new Container()

    abstract class Hash {
      abstract make(value: string): string
    }

    class BaseHasher extends Hash {
      make(value: string): string {
        return value.toUpperCase()
      }
    }

    @inject()
    class UsersController {
      constructor(public hash: Hash) {}
    }

    class Argon2 {
      make(value: string): string {
        return value.toUpperCase()
      }
    }

    const builder = container.when(UsersController).asksFor(Hash)
    builder.provide(() => {
      return new Argon2()
    })

    expectTypeOf(builder.provide).parameters.toEqualTypeOf<[BindingResolver<any, Hash>]>()
    expectTypeOf(container.contextualBinding<typeof Hash>)
      .parameter(2)
      .toEqualTypeOf<BindingResolver<any, Hash>>()

    /**
     * As soon as a binding for the class is defined, the binding
     * callback will be source of truth.
     *
     * Contextual bindings are used when container performs constructor
     * building
     */
    container.bind(UsersController, () => {
      return new UsersController(new BaseHasher())
    })

    const controller = await container.make(UsersController)
    expectTypeOf(controller).toEqualTypeOf<UsersController>()
    assert.instanceOf(controller.hash, BaseHasher)
  })

  test('given preference to contextual binding when binding is also registered to the container', async ({
    assert,
  }) => {
    const container = new Container()

    abstract class Hash {
      abstract make(value: string): string
    }

    @inject()
    class UsersController {
      constructor(public hash: Hash) {}
    }

    class Argon2 {
      make(value: string): string {
        return value.toUpperCase()
      }
    }

    class Bcrypt {
      make(value: string): string {
        return value.toUpperCase()
      }
    }

    const builder = container.when(UsersController).asksFor(Hash)
    builder.provide(() => {
      return new Argon2()
    })

    expectTypeOf(builder.provide).parameters.toEqualTypeOf<[BindingResolver<any, Hash>]>()
    expectTypeOf(container.contextualBinding<typeof Hash>)
      .parameter(2)
      .toEqualTypeOf<BindingResolver<any, Hash>>()

    /**
     * When the binding is registered in the container, we consider
     * it as the default value.
     *
     * Therefore, the contextual binding takes preference over it.
     */
    container.bind(Hash, () => {
      return new Bcrypt()
    })

    const controller = await container.make(UsersController)
    expectTypeOf(controller).toEqualTypeOf<UsersController>()
    assert.instanceOf(controller.hash, Argon2)
  })

  test('re-use container to resolve the same binding', async ({ assert }) => {
    const container = new Container()

    abstract class Hash {
      abstract make(value: string): string
    }

    class BaseHasher extends Hash {
      make(value: string): string {
        return value.toUpperCase()
      }
    }

    @inject()
    class UsersController {
      constructor(public hash: Hash) {}
    }

    container.bind(Hash, () => new BaseHasher())

    const builder = container.when(UsersController).asksFor(Hash)
    builder.provide((resolver) => {
      return resolver.make(Hash)
    })

    expectTypeOf(builder.provide).parameters.toEqualTypeOf<[BindingResolver<any, Hash>]>()
    expectTypeOf(container.contextualBinding<typeof Hash>)
      .parameter(2)
      .toEqualTypeOf<BindingResolver<any, Hash>>()

    const controller = await container.make(UsersController)
    expectTypeOf(controller).toEqualTypeOf<UsersController>()

    assert.instanceOf(controller.hash, BaseHasher)
  })

  test('handle case when class has a contextual binding but not for the current binding', async ({
    assert,
  }) => {
    const container = new Container()

    class Foo {}

    abstract class Hash {
      abstract make(value: string): string
    }

    @inject()
    class UsersController {
      constructor(public hash: Hash) {}
    }

    const builder = container.when(UsersController).asksFor(Foo)
    builder.provide(() => {
      return new Foo()
    })

    expectTypeOf(builder.provide).parameters.toEqualTypeOf<[BindingResolver<any, Foo>]>()
    expectTypeOf(container.contextualBinding<typeof Hash>)
      .parameter(2)
      .toEqualTypeOf<BindingResolver<any, Hash>>()

    const controller = await container.make(UsersController)
    expectTypeOf(controller).toEqualTypeOf<UsersController>()
    assert.instanceOf(controller.hash, Hash)
  })
})
