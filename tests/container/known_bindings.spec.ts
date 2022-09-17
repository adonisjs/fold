import { test } from '@japa/runner'
import { expectTypeOf } from 'expect-type'
import { Container } from '../../src/container.js'

test.group('Container | Bindings', () => {
  test('register a binding to the container', async ({ assert }) => {
    const container = new Container<{ route: Route }>()
    class Route {}

    container.bind('route', () => {
      return new Route()
    })

    const route = await container.make('route')
    expectTypeOf(route).toEqualTypeOf<Route>()
    assert.instanceOf(route, Route)
  })

  test('use symbol for the binding name', async ({ assert }) => {
    class Route {}
    const routeSymbol = Symbol('route')

    const container = new Container<{ [routeSymbol]: Route }>()
    container.bind(routeSymbol, () => {
      return new Route()
    })

    const route = await container.make(routeSymbol)
    expectTypeOf(route).toEqualTypeOf<Route>()
    assert.instanceOf(route, Route)
  })

  test('use class constructor for the binding name', async ({ assert }) => {
    class Route {}

    const container = new Container()
    container.bind(Route, () => {
      return new Route()
    })

    const route = await container.make(Route)
    expectTypeOf(route).toEqualTypeOf<Route>()
    assert.instanceOf(route, Route)
  })

  test('return fresh value everytime from the factory function', async ({ assert }) => {
    class Route {}
    const container = new Container<{ route: Route }>()

    container.bind('route', () => {
      return new Route()
    })

    const route = await container.make('route')
    const route1 = await container.make('route')

    expectTypeOf(route).toEqualTypeOf<Route>()
    expectTypeOf(route1).toEqualTypeOf<Route>()
    assert.instanceOf(route, Route)
    assert.instanceOf(route1, Route)
    assert.notStrictEqual(route, route1)
  })
})

test.group('Container | Bindings Singleton', () => {
  test('register a singleton to the container', async ({ assert }) => {
    class Route {}
    const container = new Container<{ route: Route }>()

    container.singleton('route', () => {
      return new Route()
    })

    const route = await container.make('route')

    expectTypeOf(route).toEqualTypeOf<Route>()
    assert.instanceOf(route, Route)
  })

  test('use symbol for the singleton name', async ({ assert }) => {
    class Route {}
    const routeSymbol = Symbol('route')
    const container = new Container<{ [routeSymbol]: Route }>()

    container.singleton(routeSymbol, () => {
      return new Route()
    })

    const route = await container.make(routeSymbol)

    expectTypeOf(route).toEqualTypeOf<Route>()
    assert.instanceOf(route, Route)
  })

  test('use class constructor for the singleton name', async ({ assert }) => {
    const container = new Container()
    class Route {}

    container.singleton(Route, () => {
      return new Route()
    })

    const route = await container.make(Route)

    expectTypeOf(route).toEqualTypeOf<Route>()
    assert.instanceOf(route, Route)
  })

  test('return cached value everytime from the factory function', async ({ assert }) => {
    class Route {}
    const container = new Container<{ route: Route }>()

    container.singleton('route', () => {
      return new Route()
    })

    const route = await container.make('route')
    const route1 = await container.make('route')

    expectTypeOf(route).toEqualTypeOf<Route>()
    expectTypeOf(route1).toEqualTypeOf<Route>()
    assert.instanceOf(route, Route)
    assert.instanceOf(route1, Route)
    assert.strictEqual(route, route1)
  })
})

test.group('Container | Binding values', () => {
  test('register a value to the container', async ({ assert }) => {
    class Route {}
    const container = new Container<{ route: Route }>()

    container.bindValue('route', new Route())

    const route = await container.make('route')

    expectTypeOf(route).toEqualTypeOf<Route>()
    assert.instanceOf(route, Route)
  })

  test('use symbol for the value name', async ({ assert }) => {
    class Route {}
    const routeSymbol = Symbol('route')
    const container = new Container<{ [routeSymbol]: Route }>()

    container.bindValue(routeSymbol, new Route())

    const route = await container.make(routeSymbol)

    expectTypeOf(route).toEqualTypeOf<Route>()
    assert.instanceOf(route, Route)
  })

  test('use class constructor for the value name', async ({ assert }) => {
    const container = new Container()
    class Route {}

    container.bindValue(Route, new Route())

    const route = await container.make(Route)

    expectTypeOf(route).toEqualTypeOf<Route>()
    assert.instanceOf(route, Route)
  })

  test('return same value every time', async ({ assert }) => {
    const container = new Container<{ route: Route }>()
    class Route {}

    container.bindValue('route', new Route())

    const route = await container.make('route')
    const route1 = await container.make('route')

    expectTypeOf(route).toEqualTypeOf<Route>()
    expectTypeOf(route1).toEqualTypeOf<Route>()
    assert.instanceOf(route, Route)
    assert.instanceOf(route1, Route)
    assert.strictEqual(route, route1)
  })

  test('give priority to values over bindings', async ({ assert }) => {
    class Route {}
    const container = new Container<{ route: Route }>()

    container.bindValue('route', new Route())
    container.bind('route', () => {
      return { foo: 'bar' }
    })

    const route = await container.make('route')
    const route1 = await container.make('route')

    expectTypeOf(route).toEqualTypeOf<Route>()
    expectTypeOf(route1).toEqualTypeOf<Route>()
    assert.instanceOf(route, Route)
    assert.instanceOf(route1, Route)
    assert.strictEqual(route, route1)
  })
})
