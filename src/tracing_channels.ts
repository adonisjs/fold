/*
 * @adonisjs/fold
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import diagnostics_channel from 'node:diagnostics_channel'
import type { ContainerMakeTracingData } from './types.ts'

/**
 * Traces container.make method calls that performs resolution using
 * the container
 */
export const containerMake = diagnostics_channel.tracingChannel<
  'adonisjs:container.make',
  ContainerMakeTracingData
>('adonisjs:container.make')
