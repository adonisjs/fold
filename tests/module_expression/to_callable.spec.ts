/*
 * @adonisjs/fold
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { join } from 'node:path'
import { test } from '@japa/runner'
import { fileURLToPath } from 'node:url'
import { outputFile, remove } from 'fs-extra'
import { Container } from '../../src/container.js'
import { moduleExpression } from '../../src/module_expression.js'

const BASE_URL = new URL('../app/', import.meta.url)
const BASE_PATH = fileURLToPath(BASE_URL)

test.group('moduleExpression | toCallable', (group) => {
  group.each.setup(() => {
    return () => remove(BASE_PATH)
  })

  test('make callable from module expression', async ({ assert }) => {
    assert.isFunction(
      moduleExpression('#controllers/auth/users_controller', import.meta.url).toCallable()
    )
  })

  test('pass fixed container instance to the callable', async ({ assert }) => {
    await outputFile(
      join(BASE_PATH, 'controllers/auth/users_controller.ts'),
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
    const fn = moduleExpression('#controllers/auth/users_controller', import.meta.url).toCallable(
      container
    )

    await fn(args)
    assert.deepEqual(args, ['invoked'])
  })

  test('pass runtime resolver to the callable', async ({ assert }) => {
    await outputFile(
      join(BASE_PATH, 'controllers/auth/admin_controller.ts'),
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
    const fn = moduleExpression('#controllers/auth/admin_controller', import.meta.url).toCallable()

    await fn(resolver, resolver)
    assert.deepEqual(await resolver.make('args'), ['invoked'])
  })

  test('raise exception when module is missing default export', async ({ assert }) => {
    await outputFile(
      join(BASE_PATH, 'controllers/auth/posts_controller.ts'),
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
    const fn = moduleExpression('#controllers/auth/posts_controller', import.meta.url).toCallable()

    await assert.rejects(
      () => fn(resolver, args),
      'Missing export default from "#controllers/auth/posts_controller" module'
    )
  })
})
