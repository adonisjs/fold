import { ContainerResolver } from './resolver.js'
import type { InspectableConstructor } from './types.js'

const primitiveConstructors = [String, Function, Object, Date, Number, Boolean]

/**
 * The default provider for resolving dependencies. It uses the resolver
 * to resolve all the values.
 */
export async function containerProvider(
  binding: InspectableConstructor,
  property: string | symbol | number,
  resolver: ContainerResolver<any>,
  runtimeValues?: any[]
) {
  const values = runtimeValues || []

  /**
   * Return early when the class does not have static "containerInjections"
   * property or if there are no injections for the given property
   */
  if (!binding.containerInjections || !binding.containerInjections[property]) {
    return values
  }

  const injections = binding.containerInjections[property]

  /**
   * If the length of runtime values is more than the injections
   * length, then we make sure to return all the runtime
   * values and fill undefined slots with container lookup
   */
  if (values.length > injections.length) {
    return Promise.all(
      values.map((value, index) => {
        if (value !== undefined) {
          return value
        }

        const injection = injections[index]
        if (primitiveConstructors.includes(injection)) {
          throw new Error(`Cannot inject "${injection.name}"`)
        }

        return resolver.make(injection)
      })
    )
  }

  /**
   * Otherwise, we go through the injections, giving
   * priority to the runtime values for a given index.
   */
  return Promise.all(
    injections.map((injection, index) => {
      if (values[index] !== undefined) {
        return values[index]
      }

      if (primitiveConstructors.includes(injection)) {
        throw new Error(`Cannot inject "${injection.name}"`)
      }

      return resolver.make(injection)
    })
  )
}
