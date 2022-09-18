import { ContainerResolver } from './resolver.js'

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
 * Shape of a class constructor with injections
 */
export type InspectableConstructor = Function & {
  containerInjections?: Record<string | number | symbol, any[]>
}

/**
 * Returns the inferred value for the make method
 */
export type Make<T> = T extends Constructor<infer A> ? A : T

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
  string | symbol | Constructor<any>,
  { resolver: BindingResolver<Record<any, any>, any>; isSingleton: boolean }
>

/**
 * Shape of the registered binding values
 */
export type BindingValues = Map<string | symbol | Constructor<any>, any>

/**
 * The data emitted using the `container:resolve` event. If known bindings
 * are defined, then the bindings and values will be correctly
 * inferred.
 */
export type ContainerResolveEventData<KnownBindings> =
  | {
      binding: Constructor<unknown>
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
export type Hooks = Map<string | symbol | Constructor<any>, Set<HookCallback<any, any>>>

/**
 * Options accepted by the container class
 */
export type ContainerOptions = {
  emitter?: {
    emit(event: string | symbol, ...values: any[]): any
  }
}
