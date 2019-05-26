[@adonisjs/fold](../README.md) > [@adonisjs/fold](../modules/_adonisjs_fold.md) > [IocContract](../interfaces/_adonisjs_fold.ioccontract.md)

# Interface: IocContract

Ioc container interface

## Hierarchy

**IocContract**

## Implemented by

* [Ioc](../classes/_adonisjs_fold.ioc.md)

## Index

### Properties

* [autoloadedAliases](_adonisjs_fold.ioccontract.md#autoloadedaliases)
* [autoloads](_adonisjs_fold.ioccontract.md#autoloads)
* [tracer](_adonisjs_fold.ioccontract.md#tracer)

### Methods

* [alias](_adonisjs_fold.ioccontract.md#alias)
* [autoload](_adonisjs_fold.ioccontract.md#autoload)
* [bind](_adonisjs_fold.ioccontract.md#bind)
* [call](_adonisjs_fold.ioccontract.md#call)
* [clearAutoloadCache](_adonisjs_fold.ioccontract.md#clearautoloadcache)
* [fake](_adonisjs_fold.ioccontract.md#fake)
* [getAliasNamespace](_adonisjs_fold.ioccontract.md#getaliasnamespace)
* [getAutoloadBaseNamespace](_adonisjs_fold.ioccontract.md#getautoloadbasenamespace)
* [hasAlias](_adonisjs_fold.ioccontract.md#hasalias)
* [hasBinding](_adonisjs_fold.ioccontract.md#hasbinding)
* [hasFake](_adonisjs_fold.ioccontract.md#hasfake)
* [isAutoloadNamespace](_adonisjs_fold.ioccontract.md#isautoloadnamespace)
* [make](_adonisjs_fold.ioccontract.md#make)
* [restore](_adonisjs_fold.ioccontract.md#restore)
* [singleton](_adonisjs_fold.ioccontract.md#singleton)
* [use](_adonisjs_fold.ioccontract.md#use)
* [useEsm](_adonisjs_fold.ioccontract.md#useesm)
* [useFake](_adonisjs_fold.ioccontract.md#usefake)
* [useProxies](_adonisjs_fold.ioccontract.md#useproxies)
* [with](_adonisjs_fold.ioccontract.md#with)

---

## Properties

<a id="autoloadedaliases"></a>

###  autoloadedAliases

**● autoloadedAliases**: *`string`[]*

___
<a id="autoloads"></a>

###  autoloads

**● autoloads**: *`object`*

#### Type declaration

[namespace: `string`]: `string`

___
<a id="tracer"></a>

###  tracer

**● tracer**: *[TracerContract](_adonisjs_fold.tracercontract.md)*

___

## Methods

<a id="alias"></a>

###  alias

▸ **alias**(namespace: *`string`*, alias: *`string`*): `void`

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

**Parameters:**

| Name | Type |
| ------ | ------ |
| directoryPath | `string` |
| namespace | `string` |

**Returns:** `void`

___
<a id="bind"></a>

###  bind

▸ **bind**(name: *`string`*, callback: *[BindCallback](../modules/_adonisjs_fold.md#bindcallback)*): `void`

**Parameters:**

| Name | Type |
| ------ | ------ |
| name | `string` |
| callback | [BindCallback](../modules/_adonisjs_fold.md#bindcallback) |

**Returns:** `void`

___
<a id="call"></a>

###  call

▸ **call**<`T`,`K`>(target: *`T`*, method: *`K`*, args: *`any`[]*): `any`

**Type parameters:**

#### T :  `object`
#### K :  `keyof T`
**Parameters:**

| Name | Type |
| ------ | ------ |
| target | `T` |
| method | `K` |
| args | `any`[] |

**Returns:** `any`

___
<a id="clearautoloadcache"></a>

###  clearAutoloadCache

▸ **clearAutoloadCache**(namespace?: *`undefined` \| `string`*, clearRequireCache?: *`undefined` \| `false` \| `true`*): `void`

**Parameters:**

| Name | Type |
| ------ | ------ |
| `Optional` namespace | `undefined` \| `string` |
| `Optional` clearRequireCache | `undefined` \| `false` \| `true` |

**Returns:** `void`

___
<a id="fake"></a>

###  fake

▸ **fake**(name: *`string`*, callback: *[BindCallback](../modules/_adonisjs_fold.md#bindcallback)*): `void`

**Parameters:**

| Name | Type |
| ------ | ------ |
| name | `string` |
| callback | [BindCallback](../modules/_adonisjs_fold.md#bindcallback) |

**Returns:** `void`

___
<a id="getaliasnamespace"></a>

###  getAliasNamespace

▸ **getAliasNamespace**(name: *`string`*): `string` \| `undefined`

**Parameters:**

| Name | Type |
| ------ | ------ |
| name | `string` |

**Returns:** `string` \| `undefined`

___
<a id="getautoloadbasenamespace"></a>

###  getAutoloadBaseNamespace

▸ **getAutoloadBaseNamespace**(namespace: *`string`*): `string` \| `undefined`

**Parameters:**

| Name | Type |
| ------ | ------ |
| namespace | `string` |

**Returns:** `string` \| `undefined`

___
<a id="hasalias"></a>

###  hasAlias

▸ **hasAlias**(name: *`string`*): `boolean`

**Parameters:**

| Name | Type |
| ------ | ------ |
| name | `string` |

**Returns:** `boolean`

___
<a id="hasbinding"></a>

###  hasBinding

▸ **hasBinding**(namespace: *`string`*, checkAliases?: *`undefined` \| `false` \| `true`*): `boolean`

**Parameters:**

| Name | Type |
| ------ | ------ |
| namespace | `string` |
| `Optional` checkAliases | `undefined` \| `false` \| `true` |

**Returns:** `boolean`

___
<a id="hasfake"></a>

###  hasFake

▸ **hasFake**(name: *`string`*): `boolean`

**Parameters:**

| Name | Type |
| ------ | ------ |
| name | `string` |

**Returns:** `boolean`

___
<a id="isautoloadnamespace"></a>

###  isAutoloadNamespace

▸ **isAutoloadNamespace**(namespace: *`string`*): `boolean`

**Parameters:**

| Name | Type |
| ------ | ------ |
| namespace | `string` |

**Returns:** `boolean`

___
<a id="make"></a>

###  make

▸ **make**<`T`>(name: *`string`*, relativeFrom?: *`undefined` \| `string`*): `T`

**Type parameters:**

#### T :  `any`
**Parameters:**

| Name | Type |
| ------ | ------ |
| name | `string` |
| `Optional` relativeFrom | `undefined` \| `string` |

**Returns:** `T`

___
<a id="restore"></a>

###  restore

▸ **restore**(name: *`string`*): `void`

**Parameters:**

| Name | Type |
| ------ | ------ |
| name | `string` |

**Returns:** `void`

___
<a id="singleton"></a>

###  singleton

▸ **singleton**(name: *`string`*, callback: *[BindCallback](../modules/_adonisjs_fold.md#bindcallback)*): `void`

**Parameters:**

| Name | Type |
| ------ | ------ |
| name | `string` |
| callback | [BindCallback](../modules/_adonisjs_fold.md#bindcallback) |

**Returns:** `void`

___
<a id="use"></a>

###  use

▸ **use**<`T`>(name: *`string`*, relativeFrom?: *`undefined` \| `string`*): `T`

**Type parameters:**

#### T :  `any`
**Parameters:**

| Name | Type |
| ------ | ------ |
| name | `string` |
| `Optional` relativeFrom | `undefined` \| `string` |

**Returns:** `T`

___
<a id="useesm"></a>

###  useEsm

▸ **useEsm**<`T`>(name: *`string`*, relativeFrom?: *`undefined` \| `string`*): `object`

**Type parameters:**

#### T :  `any`
**Parameters:**

| Name | Type |
| ------ | ------ |
| name | `string` |
| `Optional` relativeFrom | `undefined` \| `string` |

**Returns:** `object`

___
<a id="usefake"></a>

###  useFake

▸ **useFake**<`T`>(name: *`string`*): `T`

**Type parameters:**

#### T :  `any`
**Parameters:**

| Name | Type |
| ------ | ------ |
| name | `string` |

**Returns:** `T`

___
<a id="useproxies"></a>

###  useProxies

▸ **useProxies**(): `this`

**Returns:** `this`

___
<a id="with"></a>

###  with

▸ **with**(namespaces: *`string`[]*, cb: *`function`*): `void`

**Parameters:**

| Name | Type |
| ------ | ------ |
| namespaces | `string`[] |
| cb | `function` |

**Returns:** `void`

___

