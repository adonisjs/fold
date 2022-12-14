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
      'The container binding key must be of type "string", "symbol", or a "class constructor"'
    )

    assert.throws(
      // @ts-expect-error
      () => container.bind([], () => {}),
      'The container binding key must be of type "string", "symbol", or a "class constructor"'
    )

    assert.throws(
      // @ts-expect-error
      () => container.bind({}, () => {}),
      'The container binding key must be of type "string", "symbol", or a "class constructor"'
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

  test('find if all the bindings exists', async ({ assert }) => {
    const container = new Container()
    class Route {}

    const routeSymbol = Symbol('route')

    container.bind(Route, () => new Route())
    container.bind('route', () => new Route())
    container.bind(routeSymbol, () => new Route())

    assert.isTrue(container.hasAllBindings([Route, 'route', routeSymbol]))
    assert.isFalse(container.hasAllBindings([Route, 'db', routeSymbol]))
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
      'The container binding key must be of type "string", "symbol", or a "class constructor"'
    )

    assert.throws(
      // @ts-expect-error
      () => container.singleton([], () => {}),
      'The container binding key must be of type "string", "symbol", or a "class constructor"'
    )

    assert.throws(
      // @ts-expect-error
      () => container.singleton({}, () => {}),
      'The container binding key must be of type "string", "symbol", or a "class constructor"'
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

  test('parallel calls to make should resolve the same singleton', async ({ assert }) => {
    const container = new Container()
    class Route {}

    container.singleton('route', () => {
      return new Route()
    })

    const [route, route1] = await Promise.all([container.make('route'), container.make('route')])

    assert.instanceOf(route, Route)
    assert.instanceOf(route1, Route)
    assert.strictEqual(route, route1)
  })

  test('fail when parallel calls to singleton fails', async ({ assert }) => {
    const container = new Container()
    container.singleton('route', () => {
      throw new Error('Rejected')
    })

    const results = await Promise.allSettled([container.make('route'), container.make('route')])

    assert.deepEqual(
      results.map((result) => result.status),
      ['rejected', 'rejected']
    )
  })

  test('fail when parallel calls to async singleton fails', async ({ assert }) => {
    const container = new Container()
    container.singleton('route', async () => {
      throw new Error('Rejected')
    })

    const results = await Promise.allSettled([container.make('route'), container.make('route')])

    assert.deepEqual(
      results.map((result) => result.status),
      ['rejected', 'rejected']
    )
  })

  test('fail when single call to async singleton fails', async ({ assert }) => {
    const container = new Container()
    container.singleton('route', async () => {
      throw new Error('Rejected')
    })

    await assert.rejects(() => container.make('route'), 'Rejected')
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
      'The container binding key must be of type "string", "symbol", or a "class constructor"'
    )

    assert.throws(
      // @ts-expect-error
      () => container.bindValue([], 1),
      'The container binding key must be of type "string", "symbol", or a "class constructor"'
    )

    assert.throws(
      // @ts-expect-error
      () => container.bindValue({}, 1),
      'The container binding key must be of type "string", "symbol", or a "class constructor"'
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

  test('find if all bindings exists', async ({ assert }) => {
    const container = new Container()
    class Route {}

    const routeSymbol = Symbol('route')

    container.bindValue(Route, new Route())
    container.bindValue('route', new Route())
    container.bindValue(routeSymbol, new Route())

    assert.isTrue(container.hasAllBindings([Route, 'route', routeSymbol]))
    assert.isFalse(container.hasAllBindings([Route, 'db', routeSymbol]))
  })
})

test.group('Container | Contextual Bindings', () => {
  test('raise error when "provide" method is called before "asksFor" method', async ({
    assert,
  }) => {
    const container = new Container()
    class Route {}

    assert.throws(
      () => container.when(Route).provide(() => {}),
      'Missing value for contextual binding. Call "asksFor" method before calling the "provide" method'
    )
  })

  test('disallow contextual bindings on anything other than classes', async ({ assert }) => {
    const container = new Container()
    class Hash {}
    class Route {}

    assert.throws(
      // @ts-expect-error
      () => container.contextualBinding('route', 'hash', () => {}),
      'The binding value for contextual binding should be class'
    )

    assert.throws(
      // @ts-expect-error
      () => container.contextualBinding('route', Hash, () => {}),
      'The parent value for contextual binding should be class'
    )

    assert.throws(
      // @ts-expect-error
      () => container.contextualBinding(Route, 'hash', () => {}),
      'The binding value for contextual binding should be class'
    )
  })
})

test.group('Container | Aliases', () => {
  test('register an alias that point to an existing binding', async ({ assert }) => {
    const container = new Container()
    class Route {}

    container.bind('route', () => {
      return new Route()
    })
    container.alias('adonisjs.route', 'route')

    const route = await container.make('adonisjs.route')
    expectTypeOf(route).toBeAny()
    assert.instanceOf(route, Route)
  })

  test('use symbol for the alias name', async ({ assert }) => {
    const container = new Container()
    class Route {}

    container.bind('route', () => {
      return new Route()
    })
    container.alias(Symbol.for('adonisjs.route'), 'route')

    const route = await container.make(Symbol.for('adonisjs.route'))
    expectTypeOf(route).toBeAny()
    assert.instanceOf(route, Route)
  })

  test('disallow values other than string or symbol for the alias name', async ({ assert }) => {
    const container = new Container()

    assert.throws(
      // @ts-expect-error
      () => container.alias(1, 'router'),
      'The container alias key must be of type "string" or "symbol"'
    )

    assert.throws(
      // @ts-expect-error
      () => container.alias([], 'router'),
      'The container alias key must be of type "string" or "symbol"'
    )

    assert.throws(
      // @ts-expect-error
      () => container.alias({}, 'router'),
      'The container alias key must be of type "string" or "symbol"'
    )
  })

  test('return true from hasBinding when checking for alias', async ({ assert }) => {
    const container = new Container()
    class Route {}

    const routeSymbol = Symbol('route')

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
    const container = new Container()
    class Route {}

    const routeSymbol = Symbol('route')

    container.bind(Route, () => new Route())
    container.bind('route', () => new Route())
    container.bind(routeSymbol, () => new Route())
    container.alias('adonisjs.router', 'route')

    assert.isTrue(container.hasAllBindings([Route, 'route', routeSymbol, 'adonisjs.router']))
    assert.isFalse(container.hasAllBindings([Route, 'db', routeSymbol]))
  })
})
