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
import { Container, makeImportProvider } from '../index.js'

const BASE_URL = new URL('./app/', import.meta.url)
const BASE_PATH = fileURLToPath(BASE_URL)

test.group('Make import provider', (group) => {
  group.each.setup(() => {
    return () => {
      remove(BASE_PATH)
    }
  })

  test('make provider from import expression', async ({ assert }) => {
    assert.containsSubset(makeImportProvider('#controllers/users_controller'), {
      importPath: '#controllers/users_controller',
      method: 'handle',
      defaultExport: null,
    })
  })

  test('invoke method on import expression', async ({ assert }) => {
    await outputFile(
      join(BASE_PATH, 'controllers/users_controller.ts'),
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
    const resolver = container.createResolver()
    const provider = makeImportProvider('#controllers/users_controller')

    await provider.handle(resolver, [args])
    assert.deepEqual(args, ['invoked'])
    assert.isDefined(provider.defaultExport)
  })

  test('raise exception when module is missing default export', async ({ assert }) => {
    await outputFile(
      join(BASE_PATH, 'controllers/posts_controller.ts'),
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
    const provider = makeImportProvider('#controllers/posts_controller')

    await assert.rejects(
      () => provider.handle(resolver, args),
      'Missing export default from "#controllers/posts_controller" module'
    )
  })
})
