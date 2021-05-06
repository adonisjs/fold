/*
 * @adonisjs/fold
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import type { Fakes } from './Fakes'

function getBindingValue(handler: { options: Fakes; namespace: string; value: any }) {
  return handler.options.has(handler.namespace)
    ? handler.options.resolve(handler.namespace, handler.value)
    : handler.value
}

/**
 * Proxy handler to handle objects
 */
const objectHandler = (options: { options: Fakes; namespace: string; value: any }) => {
  return {
    get(_: object, key: string, receiver?: any) {
      const descriptor = Object.getOwnPropertyDescriptor(options.value, key)

      /**
       * Handling the proxy invariants use case. Learn more
       *
       * https://262.ecma-international.org/8.0/#sec-proxy-object-internal-methods-and-internal-slots-get-p-receiver
       *
       * Check the following "get" trap
       * https://github.com/kpruden/on-change/blob/5b80da1f5f7ac80c37d7bd19122188acb7ad0b19/index.js#L44-L66
       */
      if (descriptor && !descriptor.configurable) {
        if (descriptor.set && !descriptor.get) {
          return undefined
        }
        if (descriptor.writable === false) {
          return Reflect.get(options.value, key, receiver)
        }
      }

      return Reflect.get(getBindingValue(options), key, receiver)
    },

    apply(_: object, thisArgument: any, args: any[]) {
      return Reflect.apply(getBindingValue(options), thisArgument, args)
    },

    defineProperty(_: object, propertyKey: PropertyKey, attributes: PropertyDescriptor) {
      return Reflect.defineProperty(getBindingValue(options), propertyKey, attributes)
    },

    deleteProperty(_: object, propertyKey: PropertyKey) {
      return Reflect.deleteProperty(getBindingValue(options), propertyKey)
    },

    getOwnPropertyDescriptor(_: object, propertyKey: PropertyKey) {
      return Reflect.getOwnPropertyDescriptor(getBindingValue(options), propertyKey)
    },

    getPrototypeOf(_: object) {
      return Reflect.getPrototypeOf(getBindingValue(options))
    },

    has(_: object, propertyKey: PropertyKey) {
      return Reflect.has(getBindingValue(options), propertyKey)
    },

    isExtensible(_: object) {
      return Reflect.isExtensible(getBindingValue(options))
    },

    ownKeys(_: object) {
      return Reflect.ownKeys(getBindingValue(options))
    },

    preventExtensions() {
      throw new Error('Cannot prevent extensions during a fake')
    },

    set(_: object, propertyKey: PropertyKey, value: any, receiver?: any) {
      return Reflect.set(getBindingValue(options), propertyKey, value, receiver)
    },

    setPrototypeOf(_: object, proto: object | null) {
      return Reflect.setPrototypeOf(getBindingValue(options), proto)
    },
  }
}

/**
 * Proxy handler to handle classes and functions
 */
const classHandler = (options: { options: Fakes; namespace: string; value: any }) => {
  return Object.assign({}, objectHandler(options), {
    construct(_: object, args: any[], newTarget?: any) {
      return Reflect.construct(getBindingValue(options), args, newTarget)
    },
  })
}

/**
 * Proxies the objects to fallback to fake, when it exists.
 */
export class IocProxyObject {
  constructor(public namespace: string, public value: any, public options: Fakes) {
    return new Proxy(value, objectHandler({ namespace, value, options }))
  }
}

/**
 * Proxies the class constructor to fallback to fake, when it exists.
 */
export function IocProxyClass(namespace: string, value: any, options: Fakes) {
  return new Proxy(value, classHandler({ namespace, value, options }))
}
