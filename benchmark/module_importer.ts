/*
 * @adonisjs/fold
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

// @ts-expect-error
import benchmark from 'benchmark'
import Thread from '#services/thread'
import { Container } from '../index.js'
import { importDefault } from '../src/helpers.js'
import { moduleImporter } from '../src/module_importer.js'

const suite = new benchmark.Suite()

/**
 * Our implementation that returns a callable function
 */
const fn = moduleImporter(() => import('#services/users'), 'find').toCallable()

/**
 * Our implementation that returns an object with handle method.
 */
const handler = moduleImporter(() => import('#services/posts'), 'find').toHandleMethod()

/**
 * If we decided not to have cached version and rely on dynamic imports
 * all the time
 */
const native = async (resolver: Container<any>) => {
  const defaultExport = await importDefault(() => import('#services/comments'))
  return resolver.call(await resolver.make(defaultExport), 'find')
}

/**
 * What if there was were dynamic imports in first place and we were
 * just importing everything inline in one place.
 */
const inline = async (resolver: Container<any>) => {
  return resolver.call(await resolver.make(Thread), 'find')
}

const container = new Container()

suite
  .add('handler', {
    defer: true,
    fn: (deferred: any) => {
      handler.handle(container, []).then(() => deferred.resolve())
    },
  })
  .add('callable', {
    defer: true,
    fn: (deferred: any) => {
      fn(container, []).then(() => deferred.resolve())
    },
  })
  .add('native dynamic', {
    defer: true,
    fn: (deferred: any) => {
      native(container).then(() => deferred.resolve())
    },
  })
  .add('inline', {
    defer: true,
    fn: (deferred: any) => {
      inline(container).then(() => deferred.resolve())
    },
  })
  .on('cycle', function (event: any) {
    console.log(String(event.target))
  })
  .on('complete', function (this: any) {
    console.log('Fastest is ' + this.filter('fastest').map('name'))
  })
  .run({ async: true })
