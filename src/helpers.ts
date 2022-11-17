/*
 * @adonisjs/fold
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import type { Constructor, ImportProvider } from './types.js'
import { ContainerResolver } from './resolver.js'
import { MissingDefaultExportException } from './exceptions/missing_default_export_exception.js'

/**
 * Type guard and check if value is a class constructor. Plain old
 * functions are not considered as class constructor.
 */
export function isClass<T>(value: unknown): value is Constructor<T> {
  return typeof value === 'function' && value.toString().startsWith('class ')
}

/**
 * Parses an import expression to module path and its method.
 *
 * ```ts
 * parseImportExpression('#controllers/users_controller')
 * // ['#controllers/users_controller', 'handle']
 * ```
 *
 * With method
 * ```ts
 * parseImportExpression('#controllers/users_controller.index')
 * // ['#controllers/users_controller', 'index']
 * ```
 */
export function parseImportExpression(importExpression: string): [string, string] {
  const parts = importExpression.split('.')
  if (parts.length === 1) {
    return [importExpression, 'handle']
  }

  const method = parts.pop()!
  return [parts.join('.'), method]
}

/**
 * Import provider allows lazy loading import expressions, alongside
 * constructing the class constructor and calling methods via container.
 *
 * ```ts
 * const provider = makeImportProvider('#controllers/users_controller.index')
 * await provider.handle(resolver, ...values)
 * ```
 */
export function makeImportProvider(importExpression: string): ImportProvider {
  const [importPath, method] = parseImportExpression(importExpression)

  return {
    importPath,
    method,
    defaultExport: null,
    async handle(resolver: ContainerResolver<any>, runtimeValues?: any[]) {
      if (!this.defaultExport) {
        const moduleExports = await import(importPath)

        /**
         * Make sure a default export exists
         */
        if (!moduleExports.default) {
          throw new MissingDefaultExportException(
            `Missing export default from "${this.importPath}" module`
          )
        }

        this.defaultExport = moduleExports.default
      }

      return resolver.call(await resolver.make(this.defaultExport), this.method, runtimeValues)
    },
  }
}
