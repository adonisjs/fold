/*
 * @adonisjs/fold
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { test } from '@japa/runner'
import { moduleExpression } from '../../src/module_expression.js'

test.group('moduleExpression | parse', () => {
  test('parse module expression with no methods', async ({ assert }) => {
    assert.deepEqual(moduleExpression('#controllers/users_controller', import.meta.url).parse(), [
      '#controllers/users_controller',
      'handle',
    ])
  })

  test('parse module expression with method name', async ({ assert }) => {
    assert.deepEqual(
      moduleExpression('#controllers/users_controller.index', import.meta.url).parse(),
      ['#controllers/users_controller', 'index']
    )
  })

  test('parse module expression with multiple dot separators inside it', async ({ assert }) => {
    assert.deepEqual(
      moduleExpression('#controllers/users.controller.index', import.meta.url).parse(),
      ['#controllers/users.controller', 'index']
    )
  })
})
