/**
 * @module @adonisjs/fold
 */

/*
* @adonisjs/fold
*
* (c) Harminder Virk <virk@adonisjs.com>
*
* For the full copyright and license information, please view the LICENSE
* file that was distributed with this source code.
*/

import Emitter from 'events'
import { TracerContract } from '../Contracts'

/**
 * Tracer is used to emit event from the IoC container
 * at different steps. Read the guides to understand
 * how tracer works
 */
export class Tracer extends Emitter implements TracerContract {
  private namespaces: string[] = []

  public in (namespace: string, cached: boolean): void {
    const parent = this.namespaces[this.namespaces.length - 1]
    this.emit('use', { namespace, cached, parent })
    this.namespaces.push(namespace)
  }

  public out (): void {
    this.namespaces.pop()
  }
}

/**
 * Fake tracer that noops every operation. This is done
 * to keep code using tracer free of if/else
 */
class NoopTracer extends Emitter implements TracerContract {
  public in () {}
  public out () {}
}

export default function tracer (enabled: boolean) {
  return enabled ? new Tracer() : (new NoopTracer() as unknown) as Tracer
}
