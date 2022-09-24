import { test } from '@japa/runner'
import { EventEmitter } from 'node:events'
import { expectTypeOf } from 'expect-type'

import { Container } from '../../src/container.js'

test.group('Container | Hooks', () => {
  test('run hook when a binding a resolved', async ({ assert }) => {
    const emitter = new EventEmitter()
    const container = new Container<{ route: Route }>({ emitter })
    class Route {
      pattern: string
    }

    container.bind('route', () => {
      return new Route()
    })

    container.resolving('route', (route) => {
      expectTypeOf(route).toEqualTypeOf<Route>()
      route.pattern = '/'
    })

    const route = await container.make('route')
    expectTypeOf(route).toEqualTypeOf<Route>()

    assert.instanceOf(route, Route)
    assert.equal(route.pattern, '/')
  })

  test('run hook only once when a singleton resolved', async ({ assert }) => {
    const emitter = new EventEmitter()
    const container = new Container<{ route: Route }>({ emitter })
    class Route {
      invocations: number = 0
    }

    container.bind('route', () => {
      return new Route()
    })

    container.resolving('route', (route) => {
      expectTypeOf(route).toEqualTypeOf<Route>()
      route.invocations++
    })

    await container.make('route')
    await container.make('route')
    await container.make('route')

    const route = await container.make('route')
    expectTypeOf(route).toEqualTypeOf<Route>()

    assert.instanceOf(route, Route)
    assert.equal(route.invocations, 1)
  })

  test('do not run hooks when values are resolved', async ({ assert }) => {
    const emitter = new EventEmitter()
    const container = new Container<{ route: Route }>({ emitter })
    class Route {
      invocations: number = 0
    }

    container.bindValue('route', new Route())

    container.resolving('route', (route) => {
      expectTypeOf(route).toEqualTypeOf<Route>()
      route.invocations++
    })

    await container.make('route')
    await container.make('route')
    await container.make('route')

    const route = await container.make('route')
    expectTypeOf(route).toEqualTypeOf<Route>()

    assert.instanceOf(route, Route)
    assert.equal(route.invocations, 0)
  })

  test('run hooks when classes are constructed', async ({ assert }) => {
    const emitter = new EventEmitter()
    const container = new Container({ emitter })
    class Route {
      invocations: number = 0
    }

    container.resolving(Route, (route) => {
      expectTypeOf(route).toEqualTypeOf<Route>()
      route.invocations++
    })

    await container.make('route')
    await container.make('route')
    await container.make('route')

    const route = await container.make(Route)
    expectTypeOf(route).toEqualTypeOf<Route>()

    assert.instanceOf(route, Route)
    assert.equal(route.invocations, 1)
  })

  test('run hooks when a swap is resolved', async ({ assert }) => {
    const emitter = new EventEmitter()
    const container = new Container({ emitter })
    class Route {
      invocations: number = 0
    }
    class FakedRoute extends Route {}

    container.resolving(Route, (route) => {
      expectTypeOf(route).toEqualTypeOf<Route>()
      route.invocations++
    })

    container.swap(Route, () => {
      return new FakedRoute()
    })

    await container.make('route')
    await container.make('route')
    await container.make('route')

    const route = await container.make(Route)
    expectTypeOf(route).toEqualTypeOf<Route>()

    assert.instanceOf(route, Route)
    assert.instanceOf(route, FakedRoute)
    assert.equal(route.invocations, 1)
  })
})
