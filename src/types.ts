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
  resolver: ContainerResolver<KnownBindings>
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
