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
import { moduleImporter } from '../../src/module_importer.js'

const BASE_URL = new URL('../app/', import.meta.url)
const BASE_PATH = fileURLToPath(BASE_URL)

test.group('moduleImporter | toHandleMethod', (group) => {
  group.each.setup(() => {
    return () => remove(BASE_PATH)
  })

  test('make callable from module importer', async ({ assert }) => {
    assert.isFunction(
      // @ts-expect-error
      moduleImporter(() => import('#middleware/auth'), 'handle').toHandleMethod().handle
    )
  })

  test('pass fixed container instance to the callable', async ({ assert }) => {
    await outputFile(
      join(BASE_PATH, 'middleware/silent_auth_v3.ts'),
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

  test('pass runtime resolver to the callable', async ({ assert }) => {
    await outputFile(
      join(BASE_PATH, 'middleware/silent_auth_v4.ts'),
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

  test('raise exception when module is missing default export', async ({ assert }) => {
    await outputFile(
      join(BASE_PATH, 'middleware/silent_auth_v5.ts'),
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
      'Missing export default from "()=>import(\'#middleware/silent_auth_v5\')" module'
    )
  })
})
