/*
 * @adonisjs/fold
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { test } from '@japa/runner'
import { parseBindingReference } from '../src/parse_binding_reference.ts'

test.group('Parse binding reference', () => {
  test('parse magic string value', async ({ assert }) => {
    assert.deepEqual(await parseBindingReference('#controllers/home_controller'), {
      moduleNameOrPath: '#controllers/home_controller',
      method: 'handle',
    })

    assert.deepEqual(await parseBindingReference('#controllers/home_controller.index'), {
      moduleNameOrPath: '#controllers/home_controller',
      method: 'index',
    })

    assert.deepEqual(await parseBindingReference('#controllers/home.controller.index'), {
      moduleNameOrPath: '#controllers/home.controller',
      method: 'index',
    })
  })

  test('parse class reference', async ({ assert }) => {
    class HomeController {}

    assert.deepEqual(await parseBindingReference([HomeController]), {
      moduleNameOrPath: 'HomeController',
      method: 'handle',
    })

    assert.deepEqual(await parseBindingReference([HomeController, 'index']), {
      moduleNameOrPath: 'HomeController',
      method: 'index',
    })
  })

  test('parse lazy import reference', async ({ assert }) => {
    const HomeController = () => import('#controllers/home_controller' as any)

    assert.deepEqual(await parseBindingReference([HomeController]), {
      moduleNameOrPath: '#controllers/home_controller',
      method: 'handle',
    })

    assert.deepEqual(await parseBindingReference([HomeController, 'index']), {
      moduleNameOrPath: '#controllers/home_controller',
      method: 'index',
    })
  })

  test('parse lazy import reference from a collection', async ({ assert }) => {
    const controllers = {
      HomeController: () => import('#controllers/home_controller' as any),
    }

    assert.deepEqual(await parseBindingReference([controllers.HomeController]), {
      moduleNameOrPath: '#controllers/home_controller',
      method: 'handle',
    })

    assert.deepEqual(await parseBindingReference([controllers.HomeController, 'index']), {
      moduleNameOrPath: '#controllers/home_controller',
      method: 'index',
    })
  })
})
