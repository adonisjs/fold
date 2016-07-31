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
 * @description requires an array of provider and returns
 * their register method
 * @method require
 * @param  {Array} arrayOfProviders
 * @return {Array}
 * @public
 */
Registrar.require = function (arrayOfProviders) {
  return Registrar.mapProviders(arrayOfProviders)
    .map((provider) => provider.register())
}

/**
 * @description registers an array of providers by
 * called their register method.
 * @method register
 * @param  {Array} arrayOfProviders
 * @return {void}
 * @public
 */
Registrar.register = function (arrayOfProviders) {
  // const providers = Registrar.mapProviders(arrayOfProviders)
  arrayOfProviders = Registrar.require(arrayOfProviders)

  return co(function * () {
    return yield parallel(arrayOfProviders)
  })
}
