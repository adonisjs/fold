'use strict'

/**
  * adonis-fold
  * Copyright(c) 2015-2015 Harminder Virk
  * MIT Licensed
*/

const parallel = require('co-parallel')
const co = require('co')
const _ = require('lodash')
const requireStack = require('require-stack')

let Registrar = exports = module.exports = {}

/**
 * @description requires an array of provider names and returns
 * an array of the provider instances
 * @method mapProviders
 * @param  {Array} arrayOfProviderPaths
 * @return {Array}
 * @public
 */
Registrar.mapProviders = function (arrayOfProviderPaths) {
  return _.unique(arrayOfProviderPaths).map((provider) => {
    const trimmedProvider = provider.trim()
    const Module = requireStack(trimmedProvider)

    return new Module()
  })
}

/**
 * @description requires an array of provider instances
 * and runs register foreach provider
 * @method registerProviders
 * @param  {Array} arrayOfProviders
 * @return {Array}
 * @public
 */
Registrar.registerProviders = function (arrayOfProviders) {
  return arrayOfProviders.map((provider) => provider.register())
}

/**
 * @description requires an array of provider instances
 * and runs boot foreach provider
 * @method bootProviders
 * @param  {Array} arrayOfProviders
 * @return {Array}
 * @public
 */
Registrar.bootProviders = function (arrayOfProviders) {
  return arrayOfProviders.map((provider) => provider.boot())
}

/**
 * @description requires an array of provider and returns
 * their register method
 * @method require
 * @param  {Array} arrayOfProviderPaths
 * @return {Array}
 * @public
 */
Registrar.require = function (arrayOfProviderPaths) {
  const arrayOfProviders = Registrar.mapProviders(arrayOfProviderPaths)

  return Registrar.registerProviders(arrayOfProviders)
}

/**
 * @description registers an array of providers by
 * called their register method.
 * @method register
 * @param  {Array} arrayOfProviders
 * @return {void}
 * @public
 */
Registrar.register = function (arrayOfProviderPaths) {
  const arrayOfProviders = Registrar.mapProviders(arrayOfProviderPaths)

  return co(function * () {
    yield parallel(Registrar.registerProviders(arrayOfProviders))
    return yield parallel(Registrar.bootProviders(arrayOfProviders))
  })
}
