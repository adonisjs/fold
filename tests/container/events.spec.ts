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

  test('do not emit when non class value is resolved', async ({ assert }) => {
    const emitter = new EventEmitter()
    const container = new Container({ emitter })

    await assert.rejects(
      async () =>
        await Promise.all([
          pEvent(emitter, 'container:resolve', { timeout: 100 }),
          container.make('route'),
        ]),
      'Promise timed out after 100 milliseconds'
    )

    await assert.rejects(
      async () =>
        await Promise.all([
          pEvent(emitter, 'container:resolve', { timeout: 100 }),
          container.make({ foo: 'bar' }),
        ]),
      'Promise timed out after 100 milliseconds'
    )

    await assert.rejects(
      async () =>
        await Promise.all([
          pEvent(emitter, 'container:resolve', { timeout: 100 }),
          container.make([]),
        ]),
      'Promise timed out after 100 milliseconds'
    )
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
        constructor: [Config],
      }
    }
    class Route {
      static containerInjections = {
        constructor: [Encryption],
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
})
