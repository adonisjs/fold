/*
 * @adonisjs/fold
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { test } from '@japa/runner'

import { Container } from '../../src/container.js'
import { moduleCaller } from '../../src/module_caller.js'
import { ContainerResolver } from '../../src/resolver.js'

test.group('moduleCaller | toCallable', () => {
  test('make callable from module caller', async ({ assert }) => {
    class HomeController {}
    assert.isFunction(moduleCaller(HomeController, 'handle').toCallable())
  })

  test('pass fixed container instance to the callable', async ({ assert }) => {
    class HomeController {
      handle(args: string[]) {
        args.push('invoked')
      }
    }

    const args: string[] = []
    const container = new Container()

    const fn = moduleCaller(HomeController, 'handle').toCallable(container)
    await fn(args)
    assert.deepEqual(args, ['invoked'])
  })

  test('pass runtime resolver to the callable', async ({ assert }) => {
    class HomeController {
      async handle(resolver: ContainerResolver<any>) {
        const args = await resolver.make('args')
        args.push('invoked')
      }
    }

    const container = new Container()
    const resolver = container.createResolver()
    resolver.bindValue('args', [])

    const fn = moduleCaller(HomeController, 'handle').toCallable()

    await fn(resolver, resolver)
    assert.deepEqual(await resolver.make('args'), ['invoked'])
  })
})
