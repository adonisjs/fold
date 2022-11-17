/*
 * @adonisjs/fold
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { test } from '@japa/runner'
import { parseImportExpression } from '../index.js'

test.group('Parse import expression', () => {
  test('parse import expression with no methods', async ({ assert }) => {
    assert.deepEqual(parseImportExpression('#controllers/users_controller'), [
      '#controllers/users_controller',
      'handle',
    ])
  })

  test('parse import expression with method name', async ({ assert }) => {
    assert.deepEqual(parseImportExpression('#controllers/users_controller.index'), [
      '#controllers/users_controller',
      'index',
    ])
  })

  test('parse import expression with multiple dot separators inside it', async ({ assert }) => {
    assert.deepEqual(parseImportExpression('#controllers/users.controller.index'), [
      '#controllers/users.controller',
      'index',
    ])
  })
})
