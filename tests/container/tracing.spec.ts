/*
 * @adonisjs/fold
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { test } from '@japa/runner'
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
})
