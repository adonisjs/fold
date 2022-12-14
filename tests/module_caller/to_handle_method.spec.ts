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

test.group('moduleCaller | toHandleMethod', () => {
  test('make handle method object from module caller', async ({ assert }) => {
    class HomeController {}
    assert.isFunction(moduleCaller(HomeController, 'handle').toHandleMethod().handle)
  })

  test('pass fixed container instance to the handle method object', async ({ assert }) => {
    class HomeController {
      handle(args: string[]) {
        args.push('invoked')
      }
    }

    const args: string[] = []
    const container = new Container()

    const handler = moduleCaller(HomeController, 'handle').toHandleMethod(container)
    await handler.handle(args)
    assert.deepEqual(args, ['invoked'])
  })

  test('pass runtime resolver to the handle method object', async ({ assert }) => {
    class HomeController {
      async handle(resolver: ContainerResolver<any>) {
        const args = await resolver.make('args')
        args.push('invoked')
      }
    }

    const container = new Container()
    const resolver = container.createResolver()
    resolver.bindValue('args', [])

    const handler = moduleCaller(HomeController, 'handle').toHandleMethod()

    await handler.handle(resolver, resolver)
    assert.deepEqual(await resolver.make('args'), ['invoked'])
  })
})
