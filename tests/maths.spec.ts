import { test } from '@japa/runner'

test.group('Maths.add', () => {
  test('add two numbers', ({ assert }) => {
    // Test logic goes here
    assert.equal(2 + 2, 4)
  })
})
