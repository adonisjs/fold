/*
 * @adonisjs/fold
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import type { Constructor } from './types.js'
import { RuntimeException } from '@poppinss/utils'

/**
 * Type guard and check if value is a class constructor. Plain old
 * functions are not considered as class constructor.
 */
export function isClass<T>(value: unknown): value is Constructor<T> {
  return typeof value === 'function' && value.toString().startsWith('class ')
}

/**
 * Dynamically import a module and ensure it has a default export
 */
export async function importDefault(importFn: () => Promise<{ default: any }>) {
  const moduleExports = await importFn()

  /**
   * Make sure a default export exists
   */
  if (!moduleExports.default) {
    throw new RuntimeException(`Missing export default from "${importFn}" module`, {
      cause: {
        source: importFn,
      },
    })
  }

  return moduleExports.default
}

/**
 * Dynamically import a module and ensure it has a default export
 */
export async function resolveDefault(importPath: string, parentURL: URL | string) {
  const resolvedPath = await import.meta.resolve!(importPath, parentURL)
  const moduleExports = await import(resolvedPath)

  /**
   * Make sure a default export exists
   */
  if (!moduleExports.default) {
    throw new RuntimeException(`Missing export default from "${importPath}" module`, {
      cause: {
        source: resolvedPath,
      },
    })
  }

  return moduleExports.default
}
