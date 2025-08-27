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
 * Tracing channel for container.make method calls
 *
 * This channel emits events when the container resolves dependencies,
 * providing data about the binding being resolved.
 *
 * @example
 * ```ts
 * containerMake.subscribe('start', (message) => {
 *   console.log('Starting resolution for:', message.binding)
 * })
 * ```
 */
export const containerMake = diagnostics_channel.tracingChannel<
  'adonisjs.container.make',
  ContainerMakeTracingData
>('adonisjs.container.make')
