/*
 * @adonisjs/fold
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { test } from '@japa/runner'
import { AsyncLocalStorage } from 'node:async_hooks'
import { Container } from '../../src/container.ts'
import { containerMake } from '../../src/tracing_channels.ts'

test.group('Container | Tracing', () => {
  test('trace the construction of a class', async ({ assert, cleanup }) => {
    class UserService {}

    const events: string[] = []
    const bindings: unknown[] = []
    const handlers = {
      start: (message: { binding: unknown }) => {
        bindings.push(message.binding)
        events.push('start')
      },
      end: () => events.push('end'),
      asyncStart: () => events.push('asyncStart'),
      asyncEnd: () => events.push('asyncEnd'),
      error: () => events.push('error'),
    }
    containerMake.subscribe(handlers)
    cleanup(() => containerMake.unsubscribe(handlers))

    const container = new Container()
    assert.instanceOf(await container.make(UserService), UserService)
    assert.deepEqual(events, ['start', 'end', 'asyncStart', 'asyncEnd'])
    assert.deepEqual(bindings, [UserService])
  })

  test('trace the failure to construct a class', async ({ assert, cleanup }) => {
    class UserService {
      static get containerProvider(): any {
        throw new Error('Cannot read containerProvider')
      }
    }

    const events: string[] = []
    const handlers = {
      start: () => events.push('start'),
      end: () => events.push('end'),
      asyncStart: () => events.push('asyncStart'),
      asyncEnd: () => events.push('asyncEnd'),
      error: () => events.push('error'),
    }
    containerMake.subscribe(handlers)
    cleanup(() => containerMake.unsubscribe(handlers))

    const container = new Container()
    await assert.rejects(() => container.make(UserService), 'Cannot read containerProvider')
    assert.deepEqual(events, ['start', 'end', 'error', 'asyncStart', 'asyncEnd'])
  })

  test('construct the class within the store bound to the tracing channel', async ({
    assert,
    cleanup,
  }) => {
    const storage = new AsyncLocalStorage<any>()
    containerMake.start.bindStore(storage, (message) => message.binding as any)
    cleanup(() => {
      containerMake.start.unbindStore(storage)
    })

    class UserService {
      store = storage.getStore()
    }

    const container = new Container()
    const service = await container.make(UserService)
    assert.strictEqual(service.store, UserService)
  })

  test('trace a binding resolved by the container once', async ({ assert, cleanup }) => {
    class UserService {}

    const bindings: unknown[] = []
    const handlers = {
      start: (message: { binding: unknown }) => {
        bindings.push(message.binding)
      },
      end: () => {},
      asyncStart: () => {},
      asyncEnd: () => {},
      error: () => {},
    }
    containerMake.subscribe(handlers)
    cleanup(() => containerMake.unsubscribe(handlers))

    const container = new Container()
    container.bind(UserService, () => new UserService())

    assert.instanceOf(await container.make(UserService), UserService)
    assert.deepEqual(bindings, [UserService])
  })
})
