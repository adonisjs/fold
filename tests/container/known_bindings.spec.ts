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

  test('resolve binding using the resolver', async ({ assert }) => {
    const container = new Container<{ route: Route }>()
    class Route {}

    container.bind('route', () => {
      return new Route()
    })

    const resolver = container.createResolver()
    const route = await resolver.make('route')

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

  test('resolve singleton using the resolver', async ({ assert }) => {
    class Route {}
    const container = new Container<{ route: Route }>()

    container.singleton('route', () => {
      return new Route()
    })

    const resolver = container.createResolver()
    const route = await resolver.make('route')

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

  test('resolve value using the container resolver', async ({ assert }) => {
    class Route {}
    const container = new Container<{ route: Route }>()

    container.bindValue('route', new Route())

    const resolver = container.createResolver()
    const route = await resolver.make('route')

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

test.group('Container | Aliases', () => {
  test('register an alias that point to an existing binding', async ({ assert }) => {
    const container = new Container<{ 'route': Route; 'adonisjs.route': Route; 'foo': Foo }>()

    class Route {
      makeUrl() {}
    }
    class Foo {}

    container.bind('route', () => {
      return new Route()
    })
    // @ts-expect-error
    container.alias('adonisjs.route', 'foo')
    container.alias('adonisjs.route', 'route')

    const route = await container.make('adonisjs.route')
    expectTypeOf(route).toEqualTypeOf<Route>()
    assert.instanceOf(route, Route)
  })

  test('use symbol for the alias name', async ({ assert }) => {
    const aliasSymbol = Symbol('adonisjs.route')
    const container = new Container<{ route: Route; [aliasSymbol]: Route }>()
    class Route {
      makeUrl() {}
    }

    container.bind('route', () => {
      return new Route()
    })

    container.alias(aliasSymbol, 'route')

    const route = await container.make(aliasSymbol)
    expectTypeOf(route).toEqualTypeOf<Route>()
    assert.instanceOf(route, Route)
  })

  test('make alias point to class constructor', async ({ assert }) => {
    const container = new Container<{ 'adonisjs.route': Route }>()
    class Route {
      makeUrl() {}
    }
    class Foo {}

    container.bind(Route, () => {
      return new Route()
    })

    // @ts-expect-error
    container.alias('adonisjs.route', Foo)
    container.alias('adonisjs.route', Route)

    const route = await container.make('adonisjs.route')
    expectTypeOf(route).toEqualTypeOf<Route>()
    assert.instanceOf(route, Route)
  })

  test('disallow values other than string or symbol for the alias name', async ({ assert }) => {
    const container = new Container<{ 'route': Route; 'adonisjs.route': Route }>()
    class Route {
      makeUrl() {}
    }

    assert.throws(
      // @ts-expect-error
      () => container.alias(1, 'route'),
      'The container alias key must be of type "string" or "symbol"'
    )

    assert.throws(
      // @ts-expect-error
      () => container.alias([], 'route'),
      'The container alias key must be of type "string" or "symbol"'
    )

    assert.throws(
      // @ts-expect-error
      () => container.alias({}, 'route'),
      'The container alias key must be of type "string" or "symbol"'
    )
  })

  test('return true from hasBinding when checking for alias', async ({ assert }) => {
    const routeSymbol = Symbol('route')

    const container = new Container<{
      [routeSymbol]: Route
      'route': Route
      'adonisjs.router': Route
    }>()
    class Route {}

    container.bind(Route, () => new Route())
    container.bind('route', () => new Route())
    container.bind(routeSymbol, () => new Route())
    container.alias('adonisjs.router', 'route')

    assert.isTrue(container.hasBinding(Route))
    assert.isTrue(container.hasBinding('route'))
    assert.isTrue(container.hasBinding(routeSymbol))
    assert.isTrue(container.hasBinding('adonisjs.router'))
    assert.isFalse(container.hasBinding('db'))
  })

  test('return true from hasAllBindings when checking for alias', async ({ assert }) => {
    const routeSymbol = Symbol('route')

    const container = new Container<{
      [routeSymbol]: Route
      'route': Route
      'adonisjs.router': Route
    }>()
    class Route {}

    container.bind(Route, () => new Route())
    container.bind('route', () => new Route())
    container.bind(routeSymbol, () => new Route())
    container.alias('adonisjs.router', 'route')

    assert.isTrue(container.hasAllBindings([Route, 'route', routeSymbol, 'adonisjs.router']))
    assert.isFalse(container.hasAllBindings([Route, 'db', routeSymbol]))
  })
})
