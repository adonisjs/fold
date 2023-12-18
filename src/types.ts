/*
 * @adonisjs/fold
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import type { Exception } from '@poppinss/utils'

import type { Container } from './container.js'
import type { ContainerResolver } from './resolver.js'

/**
 * A function to create custom errors when container fails. It can be
 * used to point errors to the original source
 */
export type ErrorCreator = (message: string) => Exception

/**
 * Extract functions from a type
 */
export type ExtractFunctions<T> = {
  [P in keyof T]: T[P] extends (...args: any[]) => any ? P : never
}[keyof T]

/**
 * Shape of a class constructor
 */
export type Constructor<T> = new (...args: any[]) => T

/**
 * Shape of a abstract class constructor
 */
export type AbstractConstructor<T> = abstract new (...args: any[]) => T

/**
 * Shape of a class constructor with injections
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
 */
export type Make<T> = T extends AbstractConstructor<infer A> ? A : never

/**
 * Accepted values for the binding key
 */
export type BindingKey = string | symbol | AbstractConstructor<any>

/**
 * Shape of the binding resolver
 */
export type BindingResolver<KnownBindings extends Record<any, any>, Value> = (
  resolver: ContainerResolver<KnownBindings>,
  runtimeValues?: any[]
) => Value | Promise<Value>

/**
 * Shape of the registered bindings
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
    }
>

/**
 * Shape of the registered contextual bindings
 */
export type ContextualBindings = Map<
  AbstractConstructor<any>,
  { resolver: BindingResolver<Record<any, any>, any> }
>

/**
 * Shape of the registered swaps
 */
export type Swaps = Map<AbstractConstructor<any>, BindingResolver<Record<any, any>, any>>

/**
 * Shape of the registered binding values
 */
export type BindingValues = Map<BindingKey, any>

/**
 * The data emitted using the `container:resolve` event. If known bindings
 * are defined, then the bindings and values will be correctly
 * inferred.
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
 */
export type HookCallback<KnownBindings extends Record<any, any>, Value> = (
  value: Value,
  resolver: ContainerResolver<KnownBindings>
) => void | Promise<void>

/**
 * Hooks can be registered for all the supported binding datatypes.
 */
export type Hooks = Map<BindingKey, Set<HookCallback<any, any>>>

/**
 * The default implementation of the container
 * provider.
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
 */
export type ContainerOptions = {
  emitter?: {
    emit(event: string | symbol, ...values: any[]): any
  }
}

/**
 * The shape of the function that imports a module expression and runs
 * it using the container
 */
export type ModuleCallable<T, Args extends any[]> = T extends undefined
  ? (resolver: ContainerResolver<any> | Container<any>, ...args: Args) => Promise<any>
  : (...args: Args) => Promise<any>

/**
 * The shape of the handle method objects that imports a module expression
 * and runs it using the container
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
