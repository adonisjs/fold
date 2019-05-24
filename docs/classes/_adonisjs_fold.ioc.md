[@adonisjs/fold](../README.md) > [@adonisjs/fold](../modules/_adonisjs_fold.md) > [Ioc](../classes/_adonisjs_fold.ioc.md)

# Class: Ioc

Ioc container to manage and compose dependencies of your application with ease.

The container follows and encourages the use of dependency injection in your application and provides all the neccessary tools to make DI simpler.

## Hierarchy

**Ioc**

## Implements

* [IocContract](../interfaces/_adonisjs_fold.ioccontract.md)

## Index

### Constructors

* [constructor](_adonisjs_fold.ioc.md#constructor)

### Properties

* [autoloadedAliases](_adonisjs_fold.ioc.md#autoloadedaliases)
* [autoloads](_adonisjs_fold.ioc.md#autoloads)
* [tracer](_adonisjs_fold.ioc.md#tracer)

### Methods

* [alias](_adonisjs_fold.ioc.md#alias)
* [autoload](_adonisjs_fold.ioc.md#autoload)
* [bind](_adonisjs_fold.ioc.md#bind)
* [call](_adonisjs_fold.ioc.md#call)
* [clearAutoloadCache](_adonisjs_fold.ioc.md#clearautoloadcache)
* [fake](_adonisjs_fold.ioc.md#fake)
* [getAliasNamespace](_adonisjs_fold.ioc.md#getaliasnamespace)
* [getAutoloadBaseNamespace](_adonisjs_fold.ioc.md#getautoloadbasenamespace)
* [hasAlias](_adonisjs_fold.ioc.md#hasalias)
* [hasBinding](_adonisjs_fold.ioc.md#hasbinding)
* [hasFake](_adonisjs_fold.ioc.md#hasfake)
* [isAutoloadNamespace](_adonisjs_fold.ioc.md#isautoloadnamespace)
* [make](_adonisjs_fold.ioc.md#make)
* [restore](_adonisjs_fold.ioc.md#restore)
* [singleton](_adonisjs_fold.ioc.md#singleton)
* [use](_adonisjs_fold.ioc.md#use)
* [useFake](_adonisjs_fold.ioc.md#usefake)
* [useProxies](_adonisjs_fold.ioc.md#useproxies)
* [with](_adonisjs_fold.ioc.md#with)

---

## Constructors

<a id="constructor"></a>

###  constructor

⊕ **new Ioc**(_emitEvents?: *`boolean`*): [Ioc](_adonisjs_fold.ioc.md)

**Parameters:**

| Name | Type | Default value |
| ------ | ------ | ------ |
| `Default value` _emitEvents | `boolean` | false |

**Returns:** [Ioc](_adonisjs_fold.ioc.md)

___

## Properties

<a id="autoloadedaliases"></a>

###  autoloadedAliases

**● autoloadedAliases**: *`string`[]* =  []

An array of autoloaded aliases, stored along side with `_autoloads` for a quick lookup on keys

___
<a id="autoloads"></a>

###  autoloads

**● autoloads**: *`object`*

Autoloaded directories under a namespace

#### Type declaration

[namespace: `string`]: `string`

___
<a id="tracer"></a>

###  tracer

**● tracer**: *[Tracer](_adonisjs_fold.tracer.md)* =  tracer(this._emitEvents)

___

## Methods

<a id="alias"></a>

###  alias

▸ **alias**(namespace: *`string`*, alias: *`string`*): `void`

Define alias for an existing binding. IoC container doesn't handle uniqueness conflicts for you and it's upto you to make sure that all aliases are unique.

Use method [hasAlias](_adonisjs_fold.ioc.md#hasalias) to know, if an alias already exists.

**Parameters:**

| Name | Type |
| ------ | ------ |
| namespace | `string` |
| alias | `string` |

**Returns:** `void`

___
<a id="autoload"></a>

###  autoload

▸ **autoload**(directoryPath: *`string`*, namespace: *`string`*): `void`

Define an alias for an existing directory and require files without fighting with relative paths.

Giving the following directory structure

```sh
.app/
├── controllers
│   └── foo.js
├── services
│   └── foo.js
├── models
│   └── foo.js
```

You are in file `controllers/foo.js`

### Without autoload

```js
require('../services/foo')
require('../models/foo')
```

### With outoload

```
ioc.autoload(join(__dirname, 'app'), 'App')

use('App/services/foo')
use('App/mdoels/foo')
```

**Parameters:**

| Name | Type |
| ------ | ------ |
| directoryPath | `string` |
| namespace | `string` |

**Returns:** `void`

___
<a id="bind"></a>

###  bind

▸ **bind**(namespace: *`string`*, callback: *[BindCallback](../modules/_adonisjs_fold.md#bindcallback)*): `void`

Add a new binding with a namespace. Keeping the namespace unique is the responsibility of the user. We do not restrict duplicate namespaces, since it's perfectly acceptable to provide new values for existing bindings.

*__example__*:
 ```js
ioc.bind('App/User', function () {
 return new User()
})
```

**Parameters:**

| Name | Type |
| ------ | ------ |
| namespace | `string` |
| callback | [BindCallback](../modules/_adonisjs_fold.md#bindcallback) |

**Returns:** `void`

___
<a id="call"></a>

###  call

▸ **call**<`T`,`K`>(target: *`T`*, method: *`K`*, args?: *`any`[]*): `any`

Call method on an object and inject dependencies to it automatically.

**Type parameters:**

#### T :  `object`
#### K :  `keyof T`
**Parameters:**

| Name | Type |
| ------ | ------ |
| target | `T` |
| method | `K` |
| `Optional` args | `any`[] |

**Returns:** `any`

___
<a id="clearautoloadcache"></a>

###  clearAutoloadCache

▸ **clearAutoloadCache**(namespace?: *`undefined` \| `string`*, clearRequireCache?: *`boolean`*): `void`

Clear the autoload cache for all the cached files or for a single namespace.

Optionally, you can remove it from `require` cache too.

**Parameters:**

| Name | Type | Default value |
| ------ | ------ | ------ |
| `Optional` namespace | `undefined` \| `string` | - |
| `Default value` clearRequireCache | `boolean` | false |

**Returns:** `void`

___
<a id="fake"></a>

###  fake

▸ **fake**(namespace: *`string`*, callback: *[BindCallback](../modules/_adonisjs_fold.md#bindcallback)*): `void`

Register a fake for an existing binding. The fakes only work when `ADONIS_IOC_PROXY` environment variable is set to `true`. AdonisJs will set it to true automatically during testing.

NOTE: The return value of fakes is always cached, since multiple calls to `use` after that should point to a same return value.

*__example__*:
 ```js
ioc.fake('App/User', function () {
 return new FakeUser()
})
```

**Parameters:**

| Name | Type |
| ------ | ------ |
| namespace | `string` |
| callback | [BindCallback](../modules/_adonisjs_fold.md#bindcallback) |

**Returns:** `void`

___
<a id="getaliasnamespace"></a>

###  getAliasNamespace

▸ **getAliasNamespace**(name: *`string`*): `string` \| `undefined`

Returns the complete namespace for a given alias. To avoid `undefined` values, it is recommended to use `hasAlias` before using this method.

**Parameters:**

| Name | Type |
| ------ | ------ |
| name | `string` |

**Returns:** `string` \| `undefined`

___
<a id="getautoloadbasenamespace"></a>

###  getAutoloadBaseNamespace

▸ **getAutoloadBaseNamespace**(namespace: *`string`*): `string` \| `undefined`

Returns the base namespace for an autoloaded namespace.

*__example__*:
 ```js
ioc.autoload(join(__dirname, 'app'), 'App')

ioc.getAutoloadBaseNamespace('App/Services/Foo') // returns App
```

**Parameters:**

| Name | Type |
| ------ | ------ |
| namespace | `string` |

**Returns:** `string` \| `undefined`

___
<a id="hasalias"></a>

###  hasAlias

▸ **hasAlias**(name: *`string`*): `boolean`

Returns a boolean telling if an alias exists

**Parameters:**

| Name | Type |
| ------ | ------ |
| name | `string` |

**Returns:** `boolean`

___
<a id="hasbinding"></a>

###  hasBinding

▸ **hasBinding**(namespace: *`string`*, checkAliases?: *`boolean`*): `boolean`

Returns a boolean telling if binding for a given namespace exists or not. Also optionally check for aliases too.

*__example__*:
 ```js
ioc.hasBinding('Adonis/Src/View')    // namespace
ioc.hasBinding('View')               // alias
```

**Parameters:**

| Name | Type | Default value |
| ------ | ------ | ------ |
| namespace | `string` | - |
| `Default value` checkAliases | `boolean` | false |

**Returns:** `boolean`

___
<a id="hasfake"></a>

###  hasFake

▸ **hasFake**(name: *`string`*): `boolean`

A boolean telling if a fake exists for a binding or not.

**Parameters:**

| Name | Type |
| ------ | ------ |
| name | `string` |

**Returns:** `boolean`

___
<a id="isautoloadnamespace"></a>

###  isAutoloadNamespace

▸ **isAutoloadNamespace**(namespace: *`string`*): `boolean`

Returns a boolean telling if namespace is part of autoloads or not. This method results may vary from the [use](_adonisjs_fold.ioc.md#use) method, since the `use` method gives prefrence to the `bindings` first.

### NOTE:

Check the following example carefully.

*__example__*:
 ```js
// Define autoload namespace
ioc.autoload(join(__dirname, 'app'), 'App')

ioc.bind('App/Services/Foo', () => {
})

// return true
ioc.isAutoloadNamespace('App/Services/Foo')

// Returns value from `bind` and not disk
ioc.use('isAutoloadNamespace')
```

**Parameters:**

| Name | Type |
| ------ | ------ |
| namespace | `string` |

**Returns:** `boolean`

___
<a id="make"></a>

###  make

▸ **make**<`T`>(namespace: *`any`*, relativeFrom?: *`undefined` \| `string`*): `T`

Make an instance of class and auto inject it's dependencies. The instance is only created if `namespace` is part of an autoload or is an class constructor.

The bindings added via `ioc.bind` or `ioc.singleton` controls their state by themselves.

**Type parameters:**

#### T :  `any`
**Parameters:**

| Name | Type |
| ------ | ------ |
| namespace | `any` |
| `Optional` relativeFrom | `undefined` \| `string` |

**Returns:** `T`

___
<a id="restore"></a>

###  restore

▸ **restore**(name: *`string`*): `void`

Restore the fake

**Parameters:**

| Name | Type |
| ------ | ------ |
| name | `string` |

**Returns:** `void`

___
<a id="singleton"></a>

###  singleton

▸ **singleton**(namespace: *`string`*, callback: *[BindCallback](../modules/_adonisjs_fold.md#bindcallback)*): `void`

Add a new binding as a singleton. This method behaves similar to [bind](_adonisjs_fold.ioc.md#bind), just the value is cached after the first use. The `callback` will be invoked only once.

*__example__*:
 ```js
ioc.singleton('App/User', function () {
 return new User()
})
```

**Parameters:**

| Name | Type |
| ------ | ------ |
| namespace | `string` |
| callback | [BindCallback](../modules/_adonisjs_fold.md#bindcallback) |

**Returns:** `void`

___
<a id="use"></a>

###  use

▸ **use**<`T`>(namespace: *`string`*, relativeFrom?: *`undefined` \| `string`*): `T`

Use the binding by resolving it from the container. The resolve method does some great work to resolve the value for you.

1.  The name will be searched for an existing binding.
2.  Checked against aliases.
3.  Checked against autoloaded directories.
4.  Fallback to Node.js `require` call.

*__example__*:
 ```js
ioc.use('View')                // alias
ioc.use('Adonis/Src/View')     // binding
ioc.use('App/Services/User')   // Autoload
ioc.use('lodash')              // Fallback to Node.js require
```

**Type parameters:**

#### T :  `any`
**Parameters:**

| Name | Type |
| ------ | ------ |
| namespace | `string` |
| `Optional` relativeFrom | `undefined` \| `string` |

**Returns:** `T`

___
<a id="usefake"></a>

###  useFake

▸ **useFake**<`T`>(namespace: *`string`*): `T`

Use the fake for a given namespace. You don't have to manually read values from this method, unless you know what you are doing.

This method is internally used by ioc container proxy objects to point to a fake when `useProxies` is called and fake exists.

**Type parameters:**

#### T :  `any`
**Parameters:**

| Name | Type |
| ------ | ------ |
| namespace | `string` |

**Returns:** `T`

___
<a id="useproxies"></a>

###  useProxies

▸ **useProxies**(): `this`

Instruct IoC container to use proxies when returning bindings from `use` and `make` methods.

**Returns:** `this`

___
<a id="with"></a>

###  with

▸ **with**(namespaces: *`string`[]*, callback: *`function`*): `void`

Execute a callback by resolving bindings from the container and only executed when all bindings exists in the container.

This is a clean way to use bindings, when you are not that user application is using them or not.

```js
boot () {
 this.app.with(['Adonis/Src/Auth'], (Auth) => {
   Auth.extend('mongo', 'serializer', function () {
     return new MongoSerializer()
   })
 })
}
```

**Parameters:**

| Name | Type |
| ------ | ------ |
| namespaces | `string`[] |
| callback | `function` |

**Returns:** `void`

___

