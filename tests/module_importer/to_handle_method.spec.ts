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
import { moduleImporter } from '../../src/module_importer.js'

const BASE_URL = new URL('../app/', import.meta.url)
const BASE_PATH = fileURLToPath(BASE_URL)

test.group('moduleImporter | toHandleMethod', (group) => {
  group.each.setup(({ context }) => {
    context.fs.baseUrl = BASE_URL
    context.fs.basePath = BASE_PATH
  })

  test('make handle method object from module importer', async ({ assert }) => {
    assert.isFunction(
      // @ts-expect-error
      moduleImporter(() => import('#middleware/auth'), 'handle').toHandleMethod().handle
    )
  })

  test('pass fixed container instance to the handle method object', async ({ assert, fs }) => {
    await fs.create(
      'middleware/silent_auth_v3.ts',
      `
      export default class SilentAuthMiddleware {
        handle(args) {
          args.push('invoked')
        }
      }
    `
    )

    const args: string[] = []
    const container = new Container()

    const handler = moduleImporter(
      // @ts-expect-error
      () => import('#middleware/silent_auth_v3'),
      'handle'
    ).toHandleMethod(container)

    await handler.handle(args)
    assert.deepEqual(args, ['invoked'])
  })

  test('pass runtime resolver to the handle method object', async ({ assert, fs }) => {
    await fs.create(
      'middleware/silent_auth_v4.ts',
      `
      export default class SilentAuthMiddleware {
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

    const handler = moduleImporter(
      // @ts-expect-error
      () => import('#middleware/silent_auth_v4'),
      'handle'
    ).toHandleMethod()

    await handler.handle(resolver, resolver)
    assert.deepEqual(await resolver.make('args'), ['invoked'])
  })

  test('raise exception when module is missing default export', async ({ assert, fs }) => {
    await fs.create(
      'middleware/silent_auth_v5.ts',
      `
      export class SilentAuthMiddleware {
        async handle(resolver) {
          const args = await resolver.make('args')
          args.push('invoked')
        }
      }
    `
    )

    const args: string[] = []
    const container = new Container()

    const handler = moduleImporter(
      // @ts-expect-error
      () => import('#middleware/silent_auth_v5'),
      'handle'
    ).toHandleMethod(container)

    await assert.rejects(
      () => handler.handle(args),
      `Missing "export default" from lazy import "()=>import('#middleware/silent_auth_v5')"`
    )
  })
})
