/*
 * @adonisjs/fold
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { test } from '@japa/runner'
import { enqueue } from '../src/helpers.js'

test.group('Enqueue', () => {
  test('parallel calls should invoke the underlying method once', async ({ assert }) => {
    const stack: string[] = []
    const fn = enqueue(() => {
      stack.push('invoked')
    })

    await Promise.all([fn(), fn(), fn()])
    assert.deepEqual(stack, ['invoked'])
  })

  test('get return value from the underlying method', async ({ assert }) => {
    const fn = enqueue(() => {
      return new Date().getTime()
    })

    const times = await Promise.all([fn(), fn(), fn()])
    assert.lengthOf(times, 3)
    assert.strictEqual(times[0].value, times[1].value)
    assert.strictEqual(times[1].value, times[2].value)
  })

  test('get return value from the async underlying method', async ({ assert }) => {
    const fn = enqueue(async () => {
      return new Date().getTime()
    })

    const times = await Promise.all([fn(), fn(), fn()])
    assert.lengthOf(times, 3)
    assert.strictEqual(times[0].value, times[1].value)
    assert.strictEqual(times[1].value, times[2].value)
  })

  test('get error from the underlying method', async ({ assert }) => {
    const fn = enqueue(() => {
      throw new Error('failed')
    })

    await assert.rejects(() => Promise.all([fn(), fn(), fn()]), 'failed')
  })

  test('get error from the underlying async method', async ({ assert }) => {
    const fn = enqueue(async () => {
      throw new Error('failed')
    })

    await assert.rejects(() => Promise.all([fn(), fn(), fn()]), 'failed')
  })

  test('get error for all underlying method calls', async ({ assert }) => {
    const fn = enqueue(() => {
      throw new Error('failed')
    })

    const results = await Promise.allSettled([fn(), fn(), fn()])
    assert.deepEqual(
      results.map((result) => result.status),
      ['rejected', 'rejected', 'rejected']
    )
  })

  test('get error for all underlying async method calls', async ({ assert }) => {
    const fn = enqueue(async () => {
      throw new Error('failed')
    })

    const results = await Promise.allSettled([fn(), fn(), fn()])
    assert.deepEqual(
      results.map((result) => result.status),
      ['rejected', 'rejected', 'rejected']
    )
  })

  test('cache value in multiple sequential calls', async ({ assert }) => {
    const fn = enqueue(async () => {
      return new Date()
    })

    const date = await fn()
    const date1 = await fn()
    const date2 = await fn()
    assert.strictEqual(date.value, date1.value)
    assert.strictEqual(date1.value, date2.value)
  })

  test('cache error in sequential calls', async ({ assert }) => {
    const fn = enqueue(async () => {
      throw new Error('failed')
    })

    await assert.rejects(() => fn(), 'failed')
    await assert.rejects(() => fn(), 'failed')
    await assert.rejects(() => fn(), 'failed')
    await assert.rejects(() => fn(), 'failed')
  })

  test('resolve queue promises in the order they are registered', async ({ assert }) => {
    const stack: string[] = []
    const fn = enqueue(() => {
      stack.push('invoked')
    })

    const firstWrapper = async () => {
      await fn()
      stack.push('first')
    }

    const secondWrapper = async () => {
      await fn()
      stack.push('second')
    }

    const thirdWrapper = async () => {
      await fn()
      stack.push('third')
    }

    await firstWrapper()
    await secondWrapper()
    await thirdWrapper()

    assert.deepEqual(stack, ['invoked', 'first', 'second', 'third'])
  })

  test('resolve parallel queue promises in the order they are registered', async ({ assert }) => {
    const stack: string[] = []
    const fn = enqueue(() => {
      stack.push('invoked')
    })

    const firstWrapper = async () => {
      await fn()
      stack.push('first')
    }

    const secondWrapper = async () => {
      await fn()
      stack.push('second')
    }

    const thirdWrapper = async () => {
      await fn()
      stack.push('third')
    }

    await Promise.all([firstWrapper(), secondWrapper(), thirdWrapper()])
    assert.deepEqual(stack, ['invoked', 'first', 'second', 'third'])
  })

  test('resolve parallel queue promises with allSettled', async ({ assert }) => {
    const stack: string[] = []
    const fn = enqueue(() => {
      stack.push('invoked')
    })

    const firstWrapper = async () => {
      await fn()
      stack.push('first')
    }

    const secondWrapper = async () => {
      await fn()
      stack.push('second')
    }

    const thirdWrapper = async () => {
      await fn()
      stack.push('third')
    }

    await Promise.allSettled([firstWrapper(), secondWrapper(), thirdWrapper()])
    assert.deepEqual(stack, ['invoked', 'first', 'second', 'third'])
  })

  test('reject parallel queue promises in the order they are registered', async ({ assert }) => {
    const stack: string[] = []
    const fn = enqueue(async () => {
      throw new Error('Failed')
    })

    const firstWrapper = async () => {
      try {
        await fn()
      } catch {
        stack.push('handled by first')
      }
    }

    const secondWrapper = async () => {
      try {
        await fn()
      } catch {
        stack.push('handled by second')
      }
    }

    const thirdWrapper = async () => {
      try {
        await fn()
      } catch {
        stack.push('handled by third')
      }
    }

    await Promise.all([firstWrapper(), secondWrapper(), thirdWrapper()])
    assert.deepEqual(stack, ['handled by first', 'handled by second', 'handled by third'])
  })

  test('reject parallel queue promises in the order they are registered with allSettled', async ({
    assert,
  }) => {
    const stack: string[] = []
    const fn = enqueue(async () => {
      throw new Error('Failed')
    })

    const firstWrapper = async () => {
      try {
        await fn()
      } catch (error) {
        stack.push('handled by first')
        throw error
      }
    }

    const secondWrapper = async () => {
      try {
        await fn()
      } catch (error) {
        stack.push('handled by second')
        throw error
      }
    }

    const thirdWrapper = async () => {
      try {
        await fn()
      } catch (error) {
        stack.push('handled by third')
        throw error
      }
    }

    await Promise.allSettled([firstWrapper(), secondWrapper(), thirdWrapper()])
    assert.deepEqual(stack, ['handled by first', 'handled by second', 'handled by third'])
  })
})
