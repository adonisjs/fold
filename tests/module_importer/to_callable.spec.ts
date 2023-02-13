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

test.group('moduleImporter | toCallable', (group) => {
  group.each.setup(({ context }) => {
    context.fs.baseUrl = BASE_URL
    context.fs.basePath = BASE_PATH
  })

  test('make callable from module importer', async ({ assert }) => {
    assert.isFunction(
      // @ts-expect-error
      moduleImporter(() => import('#middleware/auth'), 'handle').toCallable()
    )
  })

  test('pass fixed container instance to the callable', async ({ assert, fs }) => {
    await fs.create(
      'middleware/silent_auth.ts',
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

    // @ts-expect-error
    const fn = moduleImporter(() => import('#middleware/silent_auth'), 'handle').toCallable(
      container
    )

    await fn(args)
    assert.deepEqual(args, ['invoked'])
  })

  test('pass runtime resolver to the callable', async ({ assert, fs }) => {
    await fs.create(
      'middleware/silent_auth_v1.ts',
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

    // @ts-expect-error
    const fn = moduleImporter(() => import('#middleware/silent_auth_v1'), 'handle').toCallable()

    await fn(resolver, resolver)
    assert.deepEqual(await resolver.make('args'), ['invoked'])
  })

  test('raise exception when module is missing default export', async ({ assert, fs }) => {
    await fs.create(
      'middleware/silent_auth_v2.ts',
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

    // @ts-expect-error
    const fn = moduleImporter(() => import('#middleware/silent_auth_v2'), 'handle').toCallable(
      container
    )

    await assert.rejects(
      () => fn(args),
      `Missing "export default" from lazy import "()=>import('#middleware/silent_auth_v2')"`
    )
  })
})
