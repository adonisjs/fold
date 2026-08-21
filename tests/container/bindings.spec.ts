/*
 * @adonisjs/fold
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { test } from '@japa/runner'
import { expectTypeOf } from 'expect-type'
import { Container } from '../../src/container.ts'

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

  test('return fresh value every time from the factory function', async ({ assert }) => {
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

test.group('Container | Conditional bindings', () => {
  abstract class PaymentGateway {
    abstract name: string
  }

  class StripePaymentGateway implements PaymentGateway {
    name = 'stripe'
  }

  class BetaPaymentGateway implements PaymentGateway {
    name = 'beta'
  }

  class FeatureFlags {
    constructor(public flags: string[]) {}
  }

  test('use a conditional binding when its condition matches', async ({ assert }) => {
    const container = new Container()
    const resolver = container.createResolver()

    container.bind(PaymentGateway, () => new StripePaymentGateway())
    container
      .if(async (currentResolver) => {
        const featureFlags = await currentResolver.make(FeatureFlags)
        return featureFlags.flags.includes('new-payment')
      })
      .bind(PaymentGateway, () => new BetaPaymentGateway())
    resolver.bindValue(FeatureFlags, new FeatureFlags(['new-payment']))

    const paymentGateway = await resolver.make(PaymentGateway)

    expectTypeOf(paymentGateway).toEqualTypeOf<PaymentGateway>()
    assert.instanceOf(paymentGateway, BetaPaymentGateway)
  })

  test('evaluate the condition using values local to each resolver', async ({ assert }) => {
    const container = new Container()
    const resolver = container.createResolver()
    const betaResolver = container.createResolver()

    container.bind(PaymentGateway, () => new StripePaymentGateway())
    container
      .if(async (currentResolver) => {
        const featureFlags = await currentResolver.make(FeatureFlags)
        return featureFlags.flags.includes('new-payment')
      })
      .bind(PaymentGateway, () => new BetaPaymentGateway())
    resolver.bindValue(FeatureFlags, new FeatureFlags([]))
    betaResolver.bindValue(FeatureFlags, new FeatureFlags(['new-payment']))

    assert.instanceOf(await resolver.make(PaymentGateway), StripePaymentGateway)
    assert.instanceOf(await betaResolver.make(PaymentGateway), BetaPaymentGateway)
  })

  test('use the first matching conditional binding', async ({ assert }) => {
    const container = new Container()
    const invocations: string[] = []

    container
      .if(() => {
        invocations.push('first')
        return true
      })
      .bind(PaymentGateway, () => new BetaPaymentGateway())
    container
      .if(() => {
        invocations.push('second')
        return true
      })
      .bind(PaymentGateway, () => new StripePaymentGateway())

    assert.instanceOf(await container.make(PaymentGateway), BetaPaymentGateway)
    assert.deepEqual(invocations, ['first'])
  })

  test('fall back to regular resolution when no condition matches', async ({ assert }) => {
    const container = new Container()

    container.bind(PaymentGateway, () => new StripePaymentGateway())
    container.if(() => false).bind(PaymentGateway, () => new BetaPaymentGateway())

    assert.instanceOf(await container.make(PaymentGateway), StripePaymentGateway)
  })

  test('run hooks for conditional bindings', async ({ assert }) => {
    const container = new Container()

    container.if(() => true).bind(PaymentGateway, () => new BetaPaymentGateway())
    container.resolving(PaymentGateway, (paymentGateway) => {
      paymentGateway.name = 'hooked'
    })

    const paymentGateway = await container.make(PaymentGateway)

    assert.equal(paymentGateway.name, 'hooked')
  })

  test('report conditional bindings as registered bindings', ({ assert }) => {
    const container = new Container()

    container.if(() => false).bind(PaymentGateway, () => new BetaPaymentGateway())

    assert.isTrue(container.hasBinding(PaymentGateway))
    assert.isTrue(container.createResolver().hasBinding(PaymentGateway))
  })

  test('use a string as the conditional binding key', async ({ assert }) => {
    const container = new Container()

    container.bind('gateway', () => new StripePaymentGateway())
    container.if(() => true).bind('gateway', () => new BetaPaymentGateway())

    assert.instanceOf(await container.make('gateway'), BetaPaymentGateway)
  })

  test('use a symbol as the conditional binding key', async ({ assert }) => {
    const container = new Container()
    const gateway = Symbol('gateway')

    container.bind(gateway, () => new StripePaymentGateway())
    container.if(() => true).bind(gateway, () => new BetaPaymentGateway())

    assert.instanceOf(await container.make(gateway), BetaPaymentGateway)
  })

  test('propagate the error thrown by a condition', async ({ assert }) => {
    const container = new Container()

    container.bind(PaymentGateway, () => new StripePaymentGateway())
    container
      .if(() => {
        throw new Error('Cannot read the feature flags')
      })
      .bind(PaymentGateway, () => new BetaPaymentGateway())

    await assert.rejects(() => container.make(PaymentGateway), 'Cannot read the feature flags')
  })

  test('give precedence to swaps over conditional bindings', async ({ assert }) => {
    const container = new Container()

    container.if(() => true).bind(PaymentGateway, () => new BetaPaymentGateway())
    container.swap(PaymentGateway, () => new StripePaymentGateway())

    assert.instanceOf(await container.make(PaymentGateway), StripePaymentGateway)

    container.restore(PaymentGateway)
    assert.instanceOf(await container.make(PaymentGateway), BetaPaymentGateway)
  })

  test('give precedence to contextual bindings over conditional bindings', async ({ assert }) => {
    const container = new Container()

    class CheckoutController {
      static containerInjections = { _constructor: { dependencies: [PaymentGateway] } }
      constructor(public paymentGateway: PaymentGateway) {}
    }

    container.if(() => true).bind(PaymentGateway, () => new BetaPaymentGateway())
    container
      .when(CheckoutController)
      .asksFor(PaymentGateway)
      .provide(() => new StripePaymentGateway())

    const controller = await container.make(CheckoutController)

    assert.instanceOf(controller.paymentGateway, StripePaymentGateway)
    assert.instanceOf(await container.make(PaymentGateway), BetaPaymentGateway)
  })

  test('give precedence to container values over conditional bindings', async ({ assert }) => {
    const container = new Container()
    const gateway = new StripePaymentGateway()

    container.if(() => true).bind(PaymentGateway, () => new BetaPaymentGateway())
    container.bindValue(PaymentGateway, gateway)

    assert.strictEqual(await container.make(PaymentGateway), gateway)
  })

  test('give precedence to resolver values over conditional bindings', async ({ assert }) => {
    const container = new Container()
    const gateway = new StripePaymentGateway()

    container.if(() => true).bind(PaymentGateway, () => new BetaPaymentGateway())

    const resolver = container.createResolver()
    resolver.bindValue(PaymentGateway, gateway)

    assert.strictEqual(await resolver.make(PaymentGateway), gateway)
    assert.instanceOf(await container.make(PaymentGateway), BetaPaymentGateway)
  })

  test('explain unmatched conditions when resolution fails', async ({ assert }) => {
    const container = new Container()

    container.if(() => false).bind('gateway', () => new BetaPaymentGateway())
    container.if(() => false).bind('gateway', () => new StripePaymentGateway())

    assert.isTrue(container.hasBinding('gateway'))

    try {
      await container.make('gateway')
      assert.fail('Expected the resolution to fail')
    } catch (error) {
      assert.equal(error.message, 'Cannot resolve binding "gateway" from the container')
      assert.equal(
        error.help,
        'The binding has 2 conditional binding(s) registered, but none of their conditions returned true. Register a fallback using the "container.bind()" method'
      )
    }
  })

  test('do not explain unmatched conditions for an unregistered binding', async ({ assert }) => {
    const container = new Container()

    try {
      await container.make('gateway')
      assert.fail('Expected the resolution to fail')
    } catch (error) {
      assert.equal(error.message, 'Cannot resolve binding "gateway" from the container')
      assert.isUndefined(error.help)
    }
  })

  test('disallow invalid conditional binding names', ({ assert }) => {
    const container = new Container()

    assert.throws(
      () =>
        container
          .if(() => true)
          .bind(
            // @ts-expect-error
            1,
            () => new BetaPaymentGateway()
          ),
      'The container binding key must be of type "string", "symbol", or a "class constructor"'
    )
  })

  test('receive the parent asking for the binding inside the condition', async ({ assert }) => {
    const container = new Container()
    const parents: unknown[] = []

    class CheckoutController {
      static containerInjections = { _constructor: { dependencies: [PaymentGateway] } }
      constructor(public paymentGateway: PaymentGateway) {}
    }

    container.bind(PaymentGateway, () => new StripePaymentGateway())
    container
      .if((_, __, parent) => {
        parents.push(parent)
        return parent === CheckoutController
      })
      .bind(PaymentGateway, () => new BetaPaymentGateway())

    const controller = await container.make(CheckoutController)
    const standalone = await container.make(PaymentGateway)

    assert.instanceOf(controller.paymentGateway, BetaPaymentGateway)
    assert.instanceOf(standalone, StripePaymentGateway)
    assert.deepEqual(parents, [CheckoutController, null])
  })

  test('cache the value of a conditional singleton', async ({ assert }) => {
    const container = new Container()
    let invocations = 0

    container
      .if(() => true)
      .singleton(PaymentGateway, () => {
        invocations++
        return new BetaPaymentGateway()
      })

    const first = await container.make(PaymentGateway)
    const second = await container.make(PaymentGateway)

    assert.strictEqual(first, second)
    assert.equal(invocations, 1)
  })

  test('evaluate the condition of a singleton on every resolution', async ({ assert }) => {
    const container = new Container()
    let useBeta = true
    let conditions = 0

    container.bind(PaymentGateway, () => new StripePaymentGateway())
    container
      .if(() => {
        conditions++
        return useBeta
      })
      .singleton(PaymentGateway, () => new BetaPaymentGateway())

    const beta = await container.make(PaymentGateway)
    useBeta = false
    const stripe = await container.make(PaymentGateway)

    assert.instanceOf(beta, BetaPaymentGateway)
    assert.instanceOf(stripe, StripePaymentGateway)
    assert.equal(conditions, 2)
  })

  test('run hooks only once for a conditional singleton', async ({ assert }) => {
    const container = new Container()
    let hooks = 0

    container.if(() => true).singleton(PaymentGateway, () => new BetaPaymentGateway())
    container.resolving(PaymentGateway, () => {
      hooks++
    })

    await container.make(PaymentGateway)
    await container.make(PaymentGateway)

    assert.equal(hooks, 1)
  })

  test('receive runtime values inside the condition', async ({ assert }) => {
    const container = new Container()
    const received: (any[] | undefined)[] = []

    container.bind(PaymentGateway, () => new StripePaymentGateway())
    container
      .if((_, runtimeValues) => {
        received.push(runtimeValues)
        return runtimeValues?.[0] === 'beta'
      })
      .bind(PaymentGateway, () => new BetaPaymentGateway())

    assert.instanceOf(await container.make(PaymentGateway, ['beta']), BetaPaymentGateway)
    assert.instanceOf(await container.make(PaymentGateway), StripePaymentGateway)
    assert.deepEqual(received, [['beta'], undefined])
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

  test('return cached value every time from the factory function', async ({ assert }) => {
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
