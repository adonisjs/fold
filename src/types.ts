/*
 * @adonisjs/fold
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import type { Exception } from '@poppinss/utils/exception'
import type { AbstractConstructor } from '@poppinss/utils/types'

import type { Container } from './container.ts'
import type { ContainerResolver } from './resolver.ts'

/**
 * A function to create custom errors when container fails. It can be
 * used to point errors to the original source
 *
 * @param message - The error message to use
 * @returns Exception instance
 */
export type ErrorCreator = (message: string) => Exception

/**
 * Shape of a class constructor with injections
 *
 * @template T - The constructor type
 */
export type InspectableConstructor = Function & {
  containerInjections?: Record<
    string | number | symbol,
    {
      dependencies: any[]
      createError?: ErrorCreator
    }
  >
  containerProvider?: ContainerProvider
}

/**
 * Returns the inferred value for the make method
 *
 * @template T - The type to infer from
 */
export type Make<T> = T extends AbstractConstructor<infer A> ? A : never

/**
 * Accepted values for the binding key
 *
 * Can be a string, symbol, or abstract constructor
 */
export type BindingKey = string | symbol | AbstractConstructor<any>

/**
 * Shape of the binding resolver
 *
 * @template KnownBindings - Known bindings record type
 * @template Value - The resolved value type
 * @param resolver - Container resolver instance
 * @param runtimeValues - Optional runtime values
 * @returns The resolved value or promise of resolved value
 */
export type BindingResolver<KnownBindings extends Record<any, any>, Value> = (
  resolver: ContainerResolver<KnownBindings>,
  runtimeValues?: any[]
) => Value | Promise<Value>

/**
 * Shape of the registered bindings
 *
 * Map structure containing binding keys and their resolver configurations
 */
export type Bindings = Map<
  BindingKey,
  | { resolver: BindingResolver<Record<any, any>, any>; isSingleton: false }
  | {
      resolver: (
        containerResolver: ContainerResolver<Record<any, any>>,
        runtimeValues?: any[]
      ) => Promise<{ value: any; cached: boolean }>
      isSingleton: true
      hooksPromise?: Promise<void>
    }
>

/**
 * Shape of the registered contextual bindings
 *
 * Map structure for contextual binding resolvers
 */
export type ContextualBindings = Map<
  AbstractConstructor<any>,
  { resolver: BindingResolver<Record<any, any>, any> }
>

/**
 * Shape of the registered swaps
 *
 * Map structure for binding swaps during testing
 */
export type Swaps = Map<AbstractConstructor<any>, BindingResolver<Record<any, any>, any>>

/**
 * Shape of the registered binding values
 *
 * Map structure containing cached binding values
 */
export type BindingValues = Map<BindingKey, any>

/**
 * The data emitted by the `container_binding:resolved` event. If known bindings
 * are defined, then the bindings and values will be correctly
 * inferred.
 *
 * @template KnownBindings - Known bindings record type
 */
export type ContainerResolveEventData<KnownBindings> =
  | {
      binding: AbstractConstructor<unknown>
      value: unknown
    }
  | {
      [K in keyof KnownBindings]: {
        binding: K
        value: KnownBindings[K]
      }
    }[keyof KnownBindings]

/**
 * Shape of the hooks callback
 *
 * @template KnownBindings - Known bindings record type
 * @template Value - The resolved value type
 * @param value - The resolved value
 * @param resolver - Container resolver instance
 * @returns Void or promise of void
 */
export type HookCallback<KnownBindings extends Record<any, any>, Value> = (
  value: Value,
  resolver: ContainerResolver<KnownBindings>
) => void | Promise<void>

/**
 * Hooks can be registered for all the supported binding datatypes.
 *
 * Map structure containing binding keys and their associated hook callbacks
 */
export type Hooks = Map<BindingKey, Set<HookCallback<any, any>>>

/**
 * The default implementation of the container
 * provider.
 *
 * @param binding - The inspectable constructor
 * @param property - The property key
 * @param resolver - Container resolver instance
 * @param runtimeValues - Optional runtime values
 * @returns Promise of dependency array
 */
export type DefaultContainerProvider = (
  binding: InspectableConstructor,
  property: string | symbol | number,
  resolver: ContainerResolver<any>,
  runtimeValues?: any[]
) => Promise<any[]>

/**
 * The container provider to discover and build dependencies
 * for the constructor or the class method.
 *
 * @param binding - The inspectable constructor
 * @param property - The property key
 * @param resolver - Container resolver instance
 * @param defaultProvider - Default container provider
 * @param runtimeValues - Optional runtime values
 * @returns Promise of dependency array
 */
export type ContainerProvider = (
  binding: InspectableConstructor,
  property: string | symbol | number,
  resolver: ContainerResolver<any>,
  defaultProvider: DefaultContainerProvider,
  runtimeValues?: any[]
) => Promise<any[]>

/**
 * Options accepted by the container class
 *
 * @property emitter - Optional event emitter for container events
 */
export type ContainerOptions = {
  emitter?: {
    emit(event: string | symbol, ...values: any[]): any
  }
}

/**
 * The shape of the function that imports a module expression and runs
 * it using the container
 *
 * @template T - The module type
 * @template Args - Function arguments type
 * @param resolver - Container resolver or container instance
 * @param args - Function arguments
 * @returns Promise of any value
 */
export type ModuleCallable<T, Args extends any[]> = T extends undefined
  ? (resolver: ContainerResolver<any> | Container<any>, ...args: Args) => Promise<any>
  : (...args: Args) => Promise<any>

/**
 * The shape of the handle method object that imports a module expression
 * and runs it using the container
 *
 * @template T - The module type
 * @template Args - Handler arguments type
 * @property name - Optional handler name
 * @property handle - Handler function
 */
export type ModuleHandler<T, Args extends any[]> = T extends undefined
  ? {
      name?: string
      handle(resolver: ContainerResolver<any> | Container<any>, ...args: Args): Promise<any>
    }
  : {
      name?: string
      handle(...args: Args): Promise<any>
    }

/**
 * Data shared with the container.make tracing channel
 *
 * @property binding - The binding being resolved (constructor, string, or symbol)
 */
export type ContainerMakeTracingData = {
  binding: AbstractConstructor<any> | string | symbol
}
