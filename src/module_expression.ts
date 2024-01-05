/*
 * @adonisjs/fold
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Container } from './container.js'
import { resolveDefault } from './helpers.js'
import { ContainerResolver } from './resolver.js'
import type { ModuleHandler, ModuleCallable } from './types.js'

/**
 * The moduleExpression module works around a very specific pattern we use
 * with AdonisJS, ie to bind modules as string.
 *
 * For example: With the router of AdonisJS, we can bind a controller to a route
 * as follows.
 *
 * ```ts
 * Route.get('users', '#controllers/users_controller.index')
 * ```
 *
 * Behind the scenes, we have to run following operations in order to call a
 * method on the users_controller class.
 *
 * - Dynamic import `#controllers/users_controller` module
 * - Check if the module has a default export.
 * - Create an instance of the default export class using the container.
 * - Call the `index` method on the controller class using the container.
 *
 * Router is just one example, we do this with event listeners, redis pub/sub
 * and so on.
 *
 * So, instead of writing all this parsing logic, we encapsulate it inside the
 * "moduleExpression" module.
 */
export function moduleExpression(expression: string, parentURL: URL | string) {
  return {
    /**
     * Parses a module expression to extract the module import path
     * and the method to call on the default exported class.
     *
     * ```ts
     * moduleExpression('#controllers/users_controller').parse()
     * // ['#controllers/users_controller', 'handle']
     * ```
     *
     * With method
     * ```ts
     * moduleExpression('#controllers/users_controller.index').parse()
     * // ['#controllers/users_controller', 'index']
     * ```
     */
    parse(): [string, string] {
      const parts = expression.split('.')
      if (parts.length === 1) {
        return [expression, 'handle']
      }

      const method = parts.pop()!
      return [parts.join('.'), method]
    },

    /**
     * Converts the module expression to a callable function. Invoking this
     * method run internally import the module, create a new instance of the
     * default export class using the container and invokes the method using
     * the container.
     *
     * You can create a callable function using the container instance as shown below
     *
     * ```ts
     * const fn = moduleExpression('#controllers/users_controller.index')
     *  .toCallable(container)
     *
     * // Call the function and pass context to it
     * await fn(ctx)
     * ```
     *
     * Another option is to not pass the container at the time of creating
     * the callable function, but instead pass a resolver instance at
     * the time of calling the function
     *
     * ```ts
     * const fn = moduleExpression('#controllers/users_controller.index')
     *  .toCallable()
     *
     * // Call the function and pass context to it
     * const resolver = container.createResolver()
     * await fn(resolver, ctx)
     * ```
     */
    toCallable<
      T extends Container<any> | ContainerResolver<any> | undefined = undefined,
      Args extends any[] = any[],
    >(container?: T): ModuleCallable<T, Args> {
      let defaultExport: any = null
      const [importPath, method] = this.parse()

      /**
       * When container defined at the time of the calling this function,
       * we will use it to inside the return function
       */
      if (container) {
        return async function (...args: Args) {
          defaultExport = defaultExport || (await resolveDefault(importPath, parentURL))
          return container.call(await container.make(defaultExport), method, args)
        } as ModuleCallable<T, Args>
      }

      /**
       * Otherwise the return function asks for the resolver or container
       */
      return async function (resolver: ContainerResolver<any> | Container<any>, ...args: Args) {
        defaultExport = defaultExport || (await resolveDefault(importPath, parentURL))
        return resolver.call(await resolver.make(defaultExport), method, args)
      } as ModuleCallable<T, Args>
    },

    /**
     * Converts the module expression to an object with handle method. Invoking the
     * handle method run internally imports the module, create a new instance of
     * the default export class using the container and invokes the method using
     * the container.
     *
     * You can create a handle method object using the container instance as shown below
     *
     * ```ts
     * const handler = moduleExpression('#controllers/users_controller.index')
     *  .toHandleMethod(container)
     *
     * // Call the function and pass context to it
     * await handler.handle(ctx)
     * ```
     *
     * Another option is to not pass the container at the time of creating
     * the handle method object, but instead pass a resolver instance at
     * the time of calling the function
     *
     * ```ts
     * const handler = moduleExpression('#controllers/users_controller.index')
     *  .toHandleMethod()
     *
     * // Call the function and pass context to it
     * const resolver = container.createResolver()
     * await handler.handle(resolver, ctx)
     * ```
     */
    toHandleMethod<
      T extends Container<any> | ContainerResolver<any> | undefined = undefined,
      Args extends any[] = any[],
    >(container?: T): ModuleHandler<T, Args> {
      let defaultExport: any = null
      const [importPath, method] = this.parse()

      if (container) {
        return {
          async handle(...args: Args) {
            defaultExport = defaultExport || (await resolveDefault(importPath, parentURL))
            return container.call(await container.make(defaultExport), method, args)
          },
        } as ModuleHandler<T, Args>
      }

      return {
        async handle(resolver: ContainerResolver<any> | Container<any>, ...args: Args) {
          defaultExport = defaultExport || (await resolveDefault(importPath, parentURL))
          return resolver.call(await resolver.make(defaultExport), method, args)
        },
      } as ModuleHandler<T, Args>
    },
  }
}
