import { test } from '@japa/runner'
import { EventEmitter } from 'node:events'
import { expectTypeOf } from 'expect-type'
import { pEvent, pEventMultiple } from 'p-event'

import { Container } from '../../src/container.js'

test.group('Container | Events', () => {
  test('emit event when a binding is resolved', async ({ assert }) => {
    const emitter = new EventEmitter()
    const container = new Container({ emitter })
    class Route {}

    container.bind('route', () => {
      return new Route()
    })

    const [event, route] = await Promise.all([
      pEvent(emitter, 'container:resolve'),
      container.make('route'),
    ])

    expectTypeOf(route).toBeAny()
    assert.instanceOf(route, Route)
    assert.deepEqual(event, { binding: 'route', value: route })
  })

  test('emit event when a singleton is resolved', async ({ assert }) => {
    const emitter = new EventEmitter()
    const container = new Container({ emitter })
    class Route {}

    container.singleton('route', () => {
      return new Route()
    })

    const [event, route] = await Promise.all([
      pEvent(emitter, 'container:resolve'),
      container.make('route'),
    ])

    expectTypeOf(route).toBeAny()
    assert.instanceOf(route, Route)
    assert.deepEqual(event, { binding: 'route', value: route })
  })

  test('emit event when a singleton is resolved multiple times', async ({ assert }) => {
    const emitter = new EventEmitter()
    const container = new Container({ emitter })
    class Route {}

    container.singleton('route', () => {
      return new Route()
    })

    const [event, route] = await Promise.all([
      pEvent(emitter, 'container:resolve'),
      container.make('route'),
    ])
    const [event1, route1] = await Promise.all([
      pEvent(emitter, 'container:resolve'),
      container.make('route'),
    ])

    expectTypeOf(route).toBeAny()
    assert.instanceOf(route, Route)
    assert.deepEqual(event, { binding: 'route', value: route })
    assert.deepEqual(event1, { binding: 'route', value: route1 })
  })

  test('emit event when a value is resolved', async ({ assert }) => {
    const emitter = new EventEmitter()
    const container = new Container({ emitter })
    class Route {}

    container.bindValue('route', new Route())

    const [event, route] = await Promise.all([
      pEvent(emitter, 'container:resolve'),
      container.make('route'),
    ])

    expectTypeOf(route).toBeAny()
    assert.instanceOf(route, Route)
    assert.deepEqual(event, { binding: 'route', value: route })
  })

  test('emit event when class is constructed', async ({ assert }) => {
    const emitter = new EventEmitter()
    const container = new Container({ emitter })
    class Route {}

    const [event, route] = await Promise.all([
      pEvent(emitter, 'container:resolve'),
      container.make(Route),
    ])

    expectTypeOf(route).toEqualTypeOf<Route>()
    assert.instanceOf(route, Route)
    assert.deepEqual(event, { binding: Route, value: route })
  })

  test('emit event for nested dependencies', async ({ assert }) => {
    const emitter = new EventEmitter()
    const container = new Container({ emitter })

    class Config {}
    class Encryption {
      static containerInjections = {
        _constructor: [Config],
      }
    }
    class Route {
      static containerInjections = {
        _constructor: [Encryption],
      }
    }

    const [events, route] = await Promise.all([
      pEventMultiple(emitter, 'container:resolve', { count: 3 }),
      container.make(Route),
    ])

    expectTypeOf(route).toEqualTypeOf<Route>()
    assert.instanceOf(route, Route)
    assert.lengthOf(events, 3)

    assert.deepEqual(events[0], { binding: Config, value: new Config() })
    assert.deepEqual(events[1], { binding: Encryption, value: new Encryption() })
    assert.deepEqual(events[2], { binding: Route, value: route })
  })

  test('emit event when swaps are resolved', async ({ assert }) => {
    const emitter = new EventEmitter()
    const container = new Container({ emitter })
    class Route {}
    class FakedRoute extends Route {}

    container.swap(Route, () => new FakedRoute())

    const [event, route] = await Promise.all([
      pEvent(emitter, 'container:resolve'),
      container.make(Route),
    ])

    expectTypeOf(route).toEqualTypeOf<Route>()
    assert.instanceOf(route, Route)
    assert.instanceOf(route, FakedRoute)
    assert.deepEqual(event, { binding: Route, value: route })
  })
})
