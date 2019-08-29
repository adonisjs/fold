**[@adonisjs/fold](../README.md)**

[Globals](../README.md) › ["Ioc/index"](../modules/_ioc_index_.md) › [Ioc](_ioc_index_.ioc.md)

# Class: Ioc

Ioc container to manage and compose dependencies of your application
with ease.

The container follows and encourages the use of dependency injection
in your application and provides all the neccessary tools to make
DI simpler.

## Hierarchy

* **Ioc**

## Implements

* [IocContract](../interfaces/_contracts_index_.ioccontract.md)

## Index

### Constructors

* [constructor](_ioc_index_.ioc.md#constructor)

### Properties

* [autoloadedAliases](_ioc_index_.ioc.md#autoloadedaliases)
* [autoloads](_ioc_index_.ioc.md#autoloads)
* [tracer](_ioc_index_.ioc.md#tracer)

### Methods

* [alias](_ioc_index_.ioc.md#alias)
* [autoload](_ioc_index_.ioc.md#autoload)
* [bind](_ioc_index_.ioc.md#bind)
* [call](_ioc_index_.ioc.md#call)
* [clearAutoloadCache](_ioc_index_.ioc.md#clearautoloadcache)
* [fake](_ioc_index_.ioc.md#fake)
* [getAliasNamespace](_ioc_index_.ioc.md#getaliasnamespace)
* [getAutoloadBaseNamespace](_ioc_index_.ioc.md#getautoloadbasenamespace)
* [hasAlias](_ioc_index_.ioc.md#hasalias)
* [hasBinding](_ioc_index_.ioc.md#hasbinding)
* [hasFake](_ioc_index_.ioc.md#hasfake)
* [isAutoloadNamespace](_ioc_index_.ioc.md#isautoloadnamespace)
* [make](_ioc_index_.ioc.md#make)
* [restore](_ioc_index_.ioc.md#restore)
* [singleton](_ioc_index_.ioc.md#singleton)
* [use](_ioc_index_.ioc.md#use)
* [useEsm](_ioc_index_.ioc.md#useesm)
* [useFake](_ioc_index_.ioc.md#usefake)
* [useProxies](_ioc_index_.ioc.md#useproxies)
* [with](_ioc_index_.ioc.md#with)

## Constructors

###  constructor

\+ **new Ioc**(`_emitEvents`: boolean): *[Ioc](_ioc_index_.ioc.md)*

**Parameters:**

Name | Type | Default |
------ | ------ | ------ |
`_emitEvents` | boolean | false |

**Returns:** *[Ioc](_ioc_index_.ioc.md)*

## Properties

###  autoloadedAliases

• **autoloadedAliases**: *string[]* =  []

*Implementation of [IocContract](../interfaces/_contracts_index_.ioccontract.md).[autoloadedAliases](../interfaces/_contracts_index_.ioccontract.md#autoloadedaliases)*

An array of autoloaded aliases, stored along side with
`_autoloads` for a quick lookup on keys

___

###  autoloads

• **autoloads**: *object*

*Implementation of [IocContract](../interfaces/_contracts_index_.ioccontract.md).[autoloads](../interfaces/_contracts_index_.ioccontract.md#autoloads)*

Autoloaded directories under a namespace

#### Type declaration:

* \[ **namespace**: *string*\]: string

___

###  tracer

• **tracer**: *[Tracer](_ioc_tracer_.tracer.md)* =  tracer(this._emitEvents)

*Implementation of [IocContract](../interfaces/_contracts_index_.ioccontract.md).[tracer](../interfaces/_contracts_index_.ioccontract.md#tracer)*

## Methods

###  alias

▸ **alias**(`namespace`: string, `alias`: string): *void*

*Implementation of [IocContract](../interfaces/_contracts_index_.ioccontract.md)*

Define alias for an existing binding. IoC container doesn't handle uniqueness
conflicts for you and it's upto you to make sure that all aliases are
unique.

Use method [hasAlias](_ioc_index_.ioc.md#hasalias) to know, if an alias already exists.

**Parameters:**

Name | Type |
------ | ------ |
`namespace` | string |
`alias` | string |

**Returns:** *void*

___

###  autoload

▸ **autoload**(`directoryPath`: string, `namespace`: string): *void*

*Implementation of [IocContract](../interfaces/_contracts_index_.ioccontract.md)*

Define an alias for an existing directory and require
files without fighting with relative paths.

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

Name | Type |
------ | ------ |
`directoryPath` | string |
`namespace` | string |

**Returns:** *void*

___

###  bind

▸ **bind**(`namespace`: string, `callback`: [BindCallback](../modules/_contracts_index_.md#bindcallback)): *void*

*Implementation of [IocContract](../interfaces/_contracts_index_.ioccontract.md)*

Add a new binding with a namespace. Keeping the namespace unique
is the responsibility of the user. We do not restrict duplicate
namespaces, since it's perfectly acceptable to provide new
values for existing bindings.

**`example`** 
```js
ioc.bind('App/User', function () {
 return new User()
})
```

**Parameters:**

Name | Type |
------ | ------ |
`namespace` | string |
`callback` | [BindCallback](../modules/_contracts_index_.md#bindcallback) |

**Returns:** *void*

___

###  call

▸ **call**<**T**, **K**>(`target`: T, `method`: K, `args?`: any[]): *any*

*Implementation of [IocContract](../interfaces/_contracts_index_.ioccontract.md)*

Call method on an object and inject dependencies to it automatically.

**Type parameters:**

▪ **T**: *object*

▪ **K**: *keyof T*

**Parameters:**

Name | Type |
------ | ------ |
`target` | T |
`method` | K |
`args?` | any[] |

**Returns:** *any*

___

###  clearAutoloadCache

▸ **clearAutoloadCache**(`namespace?`: undefined | string, `clearRequireCache`: boolean): *void*

Clear the autoload cache for all the cached files or for a
single namespace.

Optionally, you can remove it from `require` cache too.

**Parameters:**

Name | Type | Default |
------ | ------ | ------ |
`namespace?` | undefined \| string | - |
`clearRequireCache` | boolean | false |

**Returns:** *void*

___

###  fake

▸ **fake**(`namespace`: string, `callback`: [BindCallback](../modules/_contracts_index_.md#bindcallback)): *void*

*Implementation of [IocContract](../interfaces/_contracts_index_.ioccontract.md)*

Register a fake for an existing binding. The fakes only work when
`ADONIS_IOC_PROXY` environment variable is set to `true`. AdonisJs
will set it to true automatically during testing.

NOTE: The return value of fakes is always cached, since multiple
calls to `use` after that should point to a same return value.

**`example`** 
```js
ioc.fake('App/User', function () {
 return new FakeUser()
})
```

**Parameters:**

Name | Type |
------ | ------ |
`namespace` | string |
`callback` | [BindCallback](../modules/_contracts_index_.md#bindcallback) |

**Returns:** *void*

___

###  getAliasNamespace

▸ **getAliasNamespace**(`name`: string): *string | undefined*

*Implementation of [IocContract](../interfaces/_contracts_index_.ioccontract.md)*

Returns the complete namespace for a given alias. To avoid
`undefined` values, it is recommended to use `hasAlias`
before using this method.

**Parameters:**

Name | Type |
------ | ------ |
`name` | string |

**Returns:** *string | undefined*

___

###  getAutoloadBaseNamespace

▸ **getAutoloadBaseNamespace**(`namespace`: string): *string | undefined*

*Implementation of [IocContract](../interfaces/_contracts_index_.ioccontract.md)*

Returns the base namespace for an autoloaded namespace.

**`example`** 
```js
ioc.autoload(join(__dirname, 'app'), 'App')

ioc.getAutoloadBaseNamespace('App/Services/Foo') // returns App
```

**Parameters:**

Name | Type |
------ | ------ |
`namespace` | string |

**Returns:** *string | undefined*

___

###  hasAlias

▸ **hasAlias**(`name`: string): *boolean*

*Implementation of [IocContract](../interfaces/_contracts_index_.ioccontract.md)*

Returns a boolean telling if an alias
exists

**Parameters:**

Name | Type |
------ | ------ |
`name` | string |

**Returns:** *boolean*

___

###  hasBinding

▸ **hasBinding**(`namespace`: string, `checkAliases`: boolean): *boolean*

Returns a boolean telling if binding for a given namespace
exists or not. Also optionally check for aliases too.

**`example`** 
```js
ioc.hasBinding('Adonis/Src/View')    // namespace
ioc.hasBinding('View')               // alias
```

**Parameters:**

Name | Type | Default |
------ | ------ | ------ |
`namespace` | string | - |
`checkAliases` | boolean | false |

**Returns:** *boolean*

___

###  hasFake

▸ **hasFake**(`name`: string): *boolean*

*Implementation of [IocContract](../interfaces/_contracts_index_.ioccontract.md)*

A boolean telling if a fake exists for a binding or
not.

**Parameters:**

Name | Type |
------ | ------ |
`name` | string |

**Returns:** *boolean*

___

###  isAutoloadNamespace

▸ **isAutoloadNamespace**(`namespace`: string): *boolean*

*Implementation of [IocContract](../interfaces/_contracts_index_.ioccontract.md)*

Returns a boolean telling if namespace is part of autoloads or not.
This method results may vary from the [use](_ioc_index_.ioc.md#use) method, since
the `use` method gives prefrence to the `bindings` first.

### NOTE:
Check the following example carefully.

**`example`** 
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

Name | Type |
------ | ------ |
`namespace` | string |

**Returns:** *boolean*

___

###  make

▸ **make**<**T**>(`namespace`: any, `args?`: string[]): *T*

Make an instance of class and auto inject it's dependencies. The instance
is only created if `namespace` is part of an autoload or is an class
constructor.

The bindings added via `ioc.bind` or `ioc.singleton` controls their state
by themselves.

**Type parameters:**

▪ **T**: *any*

**Parameters:**

Name | Type |
------ | ------ |
`namespace` | any |
`args?` | string[] |

**Returns:** *T*

___

###  restore

▸ **restore**(`name`: string): *void*

*Implementation of [IocContract](../interfaces/_contracts_index_.ioccontract.md)*

Restore the fake

**Parameters:**

Name | Type |
------ | ------ |
`name` | string |

**Returns:** *void*

___

###  singleton

▸ **singleton**(`namespace`: string, `callback`: [BindCallback](../modules/_contracts_index_.md#bindcallback)): *void*

*Implementation of [IocContract](../interfaces/_contracts_index_.ioccontract.md)*

Add a new binding as a singleton. This method behaves similar to
[bind](_ioc_index_.ioc.md#bind), just the value is cached after the first use. The
`callback` will be invoked only once.

**`example`** 
```js
ioc.singleton('App/User', function () {
 return new User()
})
```

**Parameters:**

Name | Type |
------ | ------ |
`namespace` | string |
`callback` | [BindCallback](../modules/_contracts_index_.md#bindcallback) |

**Returns:** *void*

___

###  use

▸ **use**<**T**>(`namespace`: string): *T*

*Implementation of [IocContract](../interfaces/_contracts_index_.ioccontract.md)*

Use the binding by resolving it from the container. The resolve method
does some great work to resolve the value for you.

1. The name will be searched for an existing binding.
2. Checked against aliases.
3. Checked against autoloaded directories.
4. Fallback to Node.js `require` call.

**`example`** 
```js
ioc.use('View')                // alias
ioc.use('Adonis/Src/View')     // binding
ioc.use('App/Services/User')   // Autoload
ioc.use('lodash')              // Fallback to Node.js require
```

**Type parameters:**

▪ **T**: *any*

**Parameters:**

Name | Type |
------ | ------ |
`namespace` | string |

**Returns:** *T*

___

###  useEsm

▸ **useEsm**<**T**>(`namespace`: string): *T*

*Implementation of [IocContract](../interfaces/_contracts_index_.ioccontract.md)*

Wraps the return value of `use` to an ESM module. This is used
by the AdonisJs typescript transformer.

**Type parameters:**

▪ **T**: *any*

**Parameters:**

Name | Type |
------ | ------ |
`namespace` | string |

**Returns:** *T*

___

###  useFake

▸ **useFake**<**T**>(`namespace`: string): *T*

*Implementation of [IocContract](../interfaces/_contracts_index_.ioccontract.md)*

Use the fake for a given namespace. You don't have to manually
read values from this method, unless you know what you are
doing.

This method is internally used by ioc container proxy objects to
point to a fake when `useProxies` is called and fake exists.

**Type parameters:**

▪ **T**: *any*

**Parameters:**

Name | Type |
------ | ------ |
`namespace` | string |

**Returns:** *T*

___

###  useProxies

▸ **useProxies**(): *this*

*Implementation of [IocContract](../interfaces/_contracts_index_.ioccontract.md)*

Instruct IoC container to use proxies when returning
bindings from `use` and `make` methods.

**Returns:** *this*

___

###  with

▸ **with**(`namespaces`: string[], `callback`: function): *void*

Execute a callback by resolving bindings from the container and only
executed when all bindings exists in the container.

This is a clean way to use bindings, when you are not that user application
is using them or not.

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

▪ **namespaces**: *string[]*

▪ **callback**: *function*

▸ (...`args`: any[]): *void*

**Parameters:**

Name | Type |
------ | ------ |
`...args` | any[] |

**Returns:** *void*