/*
 * @adonisjs/fold
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Container } from './container.js'
import { ContainerResolver } from './resolver.js'
import type { ModuleHandler, ModuleCallable, Constructor } from './types.js'

/**
 * The moduleCaller works around a very specific pattern we use with
 * AdonisJS, ie to constructor classes and call methods using the
 * container.
 *
 * For example: Controllers of AdonisJS allows defining a controller
 * as follows
 *
 * ```ts
 * route.get('/', [HomeController, 'index'])
 * ```
 *
 * Behind the scenes, we have to run following operations in order to call the
 * handle method on the defined middleware.
 *
 * - Create an instance of the controller class using the container.
 * - Call the method using the container. Hence having the ability to use
 *   DI
 */
export function moduleCaller(target: Constructor<any>, method: string) {
  return {
    /**
     * Converts the class reference to a callable function. Invoking this method
     * internally creates a new instance of the class using the container and
     * invokes the method using the container.
     *
     * You can create a callable function using the container instance as shown below
     *
     * ```ts
     * const fn = moduleCaller(HomeController, 'handle')
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
     * const fn = moduleCaller(HomeController, 'handle')
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
      /**
       * When container defined at the time of the calling this function,
       * we will use it to inside the return function
       */
      if (container) {
        return async function (...args: Args) {
          return container.call(await container.make(target), method, args)
        } as ModuleCallable<T, Args>
      }

      /**
       * Otherwise the return function asks for the resolver or container
       */
      return async function (resolver: ContainerResolver<any> | Container<any>, ...args: Args) {
        return resolver.call(await resolver.make(target), method, args)
      } as ModuleCallable<T, Args>
    },

    /**
     * Converts the class reference to an object with handle method. Invoking this
     * method internally creates a new instance of the class using the container
     * and invokes the method using the container.
     *
     * You can create a handle method object using the container instance as shown below
     *
     * ```ts
     * const handler = moduleCaller(HomeController, 'handle')
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
     * const handler = moduleCaller(HomeController, 'handle')
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
      if (container) {
        return {
          async handle(...args: Args) {
            return container.call(await container.make(target), method, args)
          },
        } as ModuleHandler<T, Args>
      }

      return {
        async handle(resolver: ContainerResolver<any> | Container<any>, ...args: Args) {
          return resolver.call(await resolver.make(target), method, args)
        },
      } as ModuleHandler<T, Args>
    },
  }
}
