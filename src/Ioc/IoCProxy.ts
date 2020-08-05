/*
 * @adonisjs/fold
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { IocContract } from '../Contracts'

/**
 * Checks for the existence of fake on the target
 */
function hasFake(target: any) {
	return target.container.hasFake(target.binding)
}

/**
 * Calls the trap on the target
 */
function callTrap(target: any, trap: any, ...args: any[]) {
	if (hasFake(target)) {
		return Reflect[trap](target.container.useFake(target.binding, target.actual), ...args)
	} else {
		return Reflect[trap](target.actual, ...args)
	}
}

/**
 * Proxy handler to handle objects
 */
const objectHandler = {
	get(target: any, ...args: any[]) {
		return callTrap(target, 'get', ...args)
	},

	apply(target: any, ...args: any[]) {
		return callTrap(target, 'apply', ...args)
	},

	defineProperty(target: any, ...args: any[]) {
		return callTrap(target, 'defineProperty', ...args)
	},

	deleteProperty(target: any, ...args: any[]) {
		return callTrap(target, 'deleteProperty', ...args)
	},

	getOwnPropertyDescriptor(target: any, ...args: any[]) {
		return callTrap(target, 'getOwnPropertyDescriptor', ...args)
	},

	getPrototypeOf(target: any, ...args: any[]) {
		return callTrap(target, 'getPrototypeOf', ...args)
	},

	has(target: any, ...args: any[]) {
		return callTrap(target, 'has', ...args)
	},

	isExtensible(target: any, ...args: any[]) {
		return callTrap(target, 'isExtensible', ...args)
	},

	ownKeys(target: any, ...args: any[]) {
		return callTrap(target, 'ownKeys', ...args)
	},

	preventExtensions() {
		throw new Error('Cannot prevent extensions during a fake')
	},

	set(target: any, ...args: any[]) {
		return callTrap(target, 'set', ...args)
	},

	setPrototypeOf(target: any, ...args: any[]) {
		return callTrap(target, 'setPrototypeOf', ...args)
	},
}

/**
 * Proxy handler to handle classes and functions
 */
const classHandler = Object.assign({}, objectHandler, {
	construct(target: any, ...args: any[]) {
		return callTrap(target, 'construct', args)
	},
})

/**
 * Proxies the objects to fallback to fake, when it exists.
 */
export class IoCProxyObject {
	constructor(public binding: string, public actual: any, public container: IocContract) {
		return new Proxy(this, objectHandler)
	}
}

/**
 * Proxies the class constructor to fallback to fake, when it exists.
 */
export function IocProxyClass(binding: string, actual: any, container: IocContract) {
	function Wrapped() {}
	Wrapped.binding = binding
	Wrapped.actual = actual
	Wrapped.container = container

	return new Proxy(Wrapped, classHandler)
}
