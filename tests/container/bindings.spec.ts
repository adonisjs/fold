import { test } from '@japa/runner'
import { expectTypeOf } from 'expect-type'
import { Container } from '../../src/container.js'

test.group('Container | Bindings', () => {
  test('register a binding to the container', async ({ assert }) => {
    const container = new Container()
    class Route {}

    container.bind('route', () => {
      return new Route()
    })

    const route = await container.make('route')
    expectTypeOf(route).toBeAny()
    assert.instanceOf(route, Route)
  })

  test('use symbol for the binding name', async ({ assert }) => {
    const container = new Container()
    class Route {}

    const routeSymbol = Symbol('route')
    container.bind(routeSymbol, () => {
      return new Route()
    })

    const route = await container.make(routeSymbol)
    expectTypeOf(route).toBeAny()
    assert.instanceOf(route, Route)
  })

  test('use class constructor for the binding name', async ({ assert }) => {
    const container = new Container()
    class Route {
      booted = false
      boot() {
        this.booted = true
      }
    }

    container.bind(Route, () => {
      const route = new Route()
      route.boot()

      return route
    })

    const route = await container.make(Route)
    expectTypeOf(route).toEqualTypeOf<Route>()
    assert.instanceOf(route, Route)
    assert.isTrue(route.booted)
  })

  test('disallow binding names other than string symbol or class constructor', async ({
    assert,
  }) => {
    const container = new Container()

    assert.throws(
      // @ts-expect-error
      () => container.bind(1, () => {}),
      'Invalid binding key type. Only "string", "symbol" and "class constructor" is accepted'
    )

    assert.throws(
      // @ts-expect-error
      () => container.bind([], () => {}),
      'Invalid binding key type. Only "string", "symbol" and "class constructor" is accepted'
    )

    assert.throws(
      // @ts-expect-error
      () => container.bind({}, () => {}),
      'Invalid binding key type. Only "string", "symbol" and "class constructor" is accepted'
    )
  })

  test('return fresh value everytime from the factory function', async ({ assert }) => {
    const container = new Container()
    class Route {}

    container.bind('route', () => {
      return new Route()
    })

    const route = await container.make('route')
    const route1 = await container.make('route')

    expectTypeOf(route).toBeAny()
    expectTypeOf(route1).toBeAny()
    assert.instanceOf(route, Route)
    assert.instanceOf(route1, Route)
    assert.notStrictEqual(route, route1)
  })

  test('find if a binding exists', async ({ assert }) => {
    const container = new Container()
    class Route {}

    const routeSymbol = Symbol('route')

    container.bind(Route, () => new Route())
    container.bind('route', () => new Route())
    container.bind(routeSymbol, () => new Route())

    assert.isTrue(container.hasBinding(Route))
    assert.isTrue(container.hasBinding('route'))
    assert.isTrue(container.hasBinding(routeSymbol))
    assert.isFalse(container.hasBinding('db'))
  })
})

test.group('Container | Bindings Singleton', () => {
  test('register a singleton to the container', async ({ assert }) => {
    const container = new Container()
    class Route {}

    container.singleton('route', () => {
      return new Route()
    })

    const route = await container.make('route')
    expectTypeOf(route).toBeAny()
    assert.instanceOf(route, Route)
  })

  test('use symbol for the singleton name', async ({ assert }) => {
    const container = new Container()
    class Route {}

    const routeSymbol = Symbol('route')
    container.singleton(routeSymbol, () => {
      return new Route()
    })

    const route = await container.make(routeSymbol)
    expectTypeOf(route).toBeAny()
    assert.instanceOf(route, Route)
  })

  test('use class constructor for the singleton name', async ({ assert }) => {
    const container = new Container()
    class Route {
      booted = false
      boot() {
        this.booted = true
      }
    }

    container.singleton(Route, () => {
      const route = new Route()
      route.boot()

      return route
    })

    const route = await container.make(Route)
    expectTypeOf(route).toEqualTypeOf<Route>()
    assert.instanceOf(route, Route)
    assert.isTrue(route.booted)
  })

  test('disallow binding names other than string symbol or class constructor', async ({
    assert,
  }) => {
    const container = new Container()

    assert.throws(
      // @ts-expect-error
      () => container.singleton(1, () => {}),
      'Invalid binding key type. Only "string", "symbol" and "class constructor" is accepted'
    )

    assert.throws(
      // @ts-expect-error
      () => container.singleton([], () => {}),
      'Invalid binding key type. Only "string", "symbol" and "class constructor" is accepted'
    )

    assert.throws(
      // @ts-expect-error
      () => container.singleton({}, () => {}),
      'Invalid binding key type. Only "string", "symbol" and "class constructor" is accepted'
    )
  })

  test('return cached value everytime from the factory function', async ({ assert }) => {
    const container = new Container()
    class Route {}

    container.singleton('route', () => {
      return new Route()
    })

    const route = await container.make('route')
    const route1 = await container.make('route')

    expectTypeOf(route).toBeAny()
    expectTypeOf(route1).toBeAny()
    assert.instanceOf(route, Route)
    assert.instanceOf(route1, Route)
    assert.strictEqual(route, route1)
  })

  test('find if a binding exists', async ({ assert }) => {
    const container = new Container()
    class Route {}

    const routeSymbol = Symbol('route')

    container.singleton(Route, () => new Route())
    container.singleton('route', () => new Route())
    container.singleton(routeSymbol, () => new Route())

    assert.isTrue(container.hasBinding(Route))
    assert.isTrue(container.hasBinding('route'))
    assert.isTrue(container.hasBinding(routeSymbol))
    assert.isFalse(container.hasBinding('db'))
  })
})

test.group('Container | Binding values', () => {
  test('register a value to the container', async ({ assert }) => {
    const container = new Container()
    class Route {}

    container.bindValue('route', new Route())

    const route = await container.make('route')
    expectTypeOf(route).toBeAny()
    assert.instanceOf(route, Route)
  })

  test('use symbol for the value name', async ({ assert }) => {
    const container = new Container()
    class Route {}

    const routeSymbol = Symbol('route')
    container.bindValue(routeSymbol, new Route())

    const route = await container.make(routeSymbol)
    expectTypeOf(route).toBeAny()
    assert.instanceOf(route, Route)
  })

  test('use class constructor for the value name', async ({ assert }) => {
    const container = new Container()
    class Route {
      booted = false
      boot() {
        this.booted = true
      }
    }

    const routeInstance = new Route()
    routeInstance.boot()

    container.bindValue(Route, routeInstance)

    const route = await container.make(Route)
    expectTypeOf(route).toEqualTypeOf<Route>()
    assert.instanceOf(route, Route)
    assert.isTrue(route.booted)
  })

  test('return same value every time', async ({ assert }) => {
    const container = new Container()
    class Route {}

    container.bindValue('route', new Route())

    const route = await container.make('route')
    const route1 = await container.make('route')

    expectTypeOf(route).toBeAny()
    expectTypeOf(route1).toBeAny()
    assert.instanceOf(route, Route)
    assert.instanceOf(route1, Route)
    assert.strictEqual(route, route1)
  })

  test('give priority to values over bindings', async ({ assert }) => {
    const container = new Container()
    class Route {}

    container.bindValue('route', new Route())
    container.bind('route', () => {
      return { foo: 'bar' }
    })

    const route = await container.make('route')
    const route1 = await container.make('route')

    expectTypeOf(route).toBeAny()
    expectTypeOf(route1).toBeAny()
    assert.instanceOf(route, Route)
    assert.instanceOf(route1, Route)
    assert.strictEqual(route, route1)
  })

  test('disallow binding names other than string symbol or class constructor', async ({
    assert,
  }) => {
    const container = new Container()

    assert.throws(
      // @ts-expect-error
      () => container.bindValue(1, 1),
      'Invalid binding key type. Only "string", "symbol" and "class constructor" is accepted'
    )

    assert.throws(
      // @ts-expect-error
      () => container.bindValue([], 1),
      'Invalid binding key type. Only "string", "symbol" and "class constructor" is accepted'
    )

    assert.throws(
      // @ts-expect-error
      () => container.bindValue({}, 1),
      'Invalid binding key type. Only "string", "symbol" and "class constructor" is accepted'
    )
  })

  test('find if a binding exists', async ({ assert }) => {
    const container = new Container()
    class Route {}

    const routeSymbol = Symbol('route')

    container.bindValue(Route, new Route())
    container.bindValue('route', new Route())
    container.bindValue(routeSymbol, new Route())

    assert.isTrue(container.hasBinding(Route))
    assert.isTrue(container.hasBinding('route'))
    assert.isTrue(container.hasBinding(routeSymbol))
    assert.isFalse(container.hasBinding('db'))
  })
})
