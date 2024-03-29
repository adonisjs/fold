import { test } from '@japa/runner'
import { expectTypeOf } from 'expect-type'
import { Container } from '../src/container.js'
import { ContainerProvider } from '../src/types.js'

test.group('Resolver', () => {
  test('give priority to resolver values over binding values', async ({ assert }) => {
    class UserService {
      name?: string
    }

    const container = new Container()
    const resolver = container.createResolver()

    const service = new UserService()
    service.name = 'container_service'

    const service1 = new UserService()
    service1.name = 'resolver_service'

    container.bindValue(UserService, service)
    resolver.bindValue(UserService, service1)

    const resolvedService = await resolver.make(UserService)

    expectTypeOf(resolvedService).toEqualTypeOf<UserService>()
    assert.strictEqual(resolvedService, service1)
    assert.strictEqual(resolvedService.name, 'resolver_service')
  })

  test('use static containerProvider to construct a class', async ({ assert }) => {
    assert.plan(4)

    class UserService {
      static containerProvider: ContainerProvider = (
        binding,
        property,
        resolver,
        defaultProvider,
        runtimeValues
      ) => {
        assert.deepEqual(binding, UserService)
        assert.deepEqual(this, UserService)
        assert.equal(property, '_constructor')
        return defaultProvider(binding, property, resolver, runtimeValues)
      }
      name?: string
    }

    const container = new Container()
    const resolver = container.createResolver()

    const resolvedService = await resolver.make(UserService)

    expectTypeOf(resolvedService).toEqualTypeOf<UserService>()
    assert.instanceOf(resolvedService, UserService)
  })

  test('use static containerProvider to call a method', async ({ assert }) => {
    assert.plan(3)

    class UserService {
      static containerProvider: ContainerProvider = (
        binding,
        property,
        resolver,
        defaultProvider,
        runtimeValues
      ) => {
        assert.deepEqual(binding, UserService)
        assert.deepEqual(this, UserService)
        assert.equal(property, 'store')
        return defaultProvider(binding, property, resolver, runtimeValues)
      }

      name?: string

      store() {}
    }

    const container = new Container()
    const resolver = container.createResolver()

    await resolver.call(new UserService(), 'store')
  })

  test('disallow binding names other than string symbol or class constructor', async ({
    assert,
  }) => {
    const container = new Container()
    const resolver = container.createResolver()

    assert.throws(
      // @ts-expect-error
      () => resolver.bindValue(1, 1),
      'The container binding key must be of type "string", "symbol", or a "class constructor"'
    )

    assert.throws(
      // @ts-expect-error
      () => resolver.bindValue([], 1),
      'The container binding key must be of type "string", "symbol", or a "class constructor"'
    )

    assert.throws(
      // @ts-expect-error
      () => resolver.bindValue({}, 1),
      'The container binding key must be of type "string", "symbol", or a "class constructor"'
    )
  })

  test('find if a binding exists', async ({ assert }) => {
    const container = new Container()
    const resolver = container.createResolver()
    class Route {}

    const routeSymbol = Symbol('route')

    container.bind(Route, () => new Route())
    resolver.bindValue('route', new Route())
    container.bindValue(routeSymbol, new Route())

    assert.isTrue(resolver.hasBinding(Route))
    assert.isTrue(resolver.hasBinding('route'))
    assert.isTrue(resolver.hasBinding(routeSymbol))
    assert.isFalse(resolver.hasBinding('db'))
  })

  test('find if all bindings exists', async ({ assert }) => {
    const container = new Container()
    const resolver = container.createResolver()
    class Route {}

    const routeSymbol = Symbol('route')

    container.bind(Route, () => new Route())
    resolver.bindValue('route', new Route())
    container.bindValue(routeSymbol, new Route())

    assert.isTrue(resolver.hasAllBindings([Route, 'route', routeSymbol]))
    assert.isFalse(resolver.hasAllBindings([Route, 'db', routeSymbol]))
  })
})
