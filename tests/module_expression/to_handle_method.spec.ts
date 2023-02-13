/*
 * @adonisjs/fold
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { test } from '@japa/runner'
import { fileURLToPath } from 'node:url'
import { Container } from '../../src/container.js'
import { moduleExpression } from '../../src/module_expression.js'

const BASE_URL = new URL('../app/', import.meta.url)
const BASE_PATH = fileURLToPath(BASE_URL)

test.group('moduleExpression | toHandleMethod', (group) => {
  group.each.setup(({ context }) => {
    context.fs.baseUrl = BASE_URL
    context.fs.basePath = BASE_PATH
  })

  test('make handle method object from module expression', async ({ assert }) => {
    assert.isFunction(
      moduleExpression('#controllers/users_controller', import.meta.url).toHandleMethod().handle
    )
  })

  test('pass fixed container instance to the handle method object', async ({ assert, fs }) => {
    await fs.create(
      'controllers/users_controller.ts',
      `
      export default class UsersController {
        handle(args) {
          args.push('invoked')
        }
      }
    `
    )

    const args: string[] = []
    const container = new Container()
    const handler = moduleExpression(
      '#controllers/users_controller',
      import.meta.url
    ).toHandleMethod(container)

    await handler.handle(args)
    assert.deepEqual(args, ['invoked'])
  })

  test('pass runtime resolver to the handle method object', async ({ assert, fs }) => {
    await fs.create(
      'controllers/admin_controller.ts',
      `
      export default class AdminController {
        async handle(resolver) {
          const args = await resolver.make('args')
          args.push('invoked')
        }
      }
    `
    )

    const container = new Container()
    const resolver = container.createResolver()
    resolver.bindValue('args', [])
    const handler = moduleExpression(
      '#controllers/admin_controller',
      import.meta.url
    ).toHandleMethod()

    await handler.handle(resolver, resolver)
    assert.deepEqual(await resolver.make('args'), ['invoked'])
  })

  test('raise exception when module is missing default export', async ({ assert, fs }) => {
    await fs.create(
      'controllers/posts_controller.ts',
      `
      export class PostsController {
        handle(args) {
          args.push('invoked')
        }
      }
    `
    )

    const args: string[] = []
    const container = new Container()
    const resolver = container.createResolver()
    const provider = moduleExpression(
      '#controllers/posts_controller',
      import.meta.url
    ).toHandleMethod()

    await assert.rejects(
      () => provider.handle(resolver, args),
      'Missing export default from "#controllers/posts_controller" module'
    )
  })
})
