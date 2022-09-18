import { test } from '@japa/runner'
import { expectTypeOf } from 'expect-type'
import { Container } from '../src/container.js'
import { ContainerProvider } from '../src/types.js'

test.group('Resolver', () => {
  test('give priority to resolver values over binding values', async ({ assert }) => {
    class UserService {
      name: string
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

  test('use custom containerProvider from the class constructor', async ({ assert }) => {
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
      name: string
    }

    const container = new Container()
    const resolver = container.createResolver()

    const resolvedService = await resolver.make(UserService)

    expectTypeOf(resolvedService).toEqualTypeOf<UserService>()
    assert.instanceOf(resolvedService, UserService)
  })
})
