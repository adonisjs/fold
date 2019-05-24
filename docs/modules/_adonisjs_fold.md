[@adonisjs/fold](../README.md) > [@adonisjs/fold](../modules/_adonisjs_fold.md)

# External module: @adonisjs/fold

## Index

### Classes

* [IoCProxyObject](../classes/_adonisjs_fold.iocproxyobject.md)
* [Ioc](../classes/_adonisjs_fold.ioc.md)
* [Registrar](../classes/_adonisjs_fold.registrar.md)
* [Tracer](../classes/_adonisjs_fold.tracer.md)

### Interfaces

* [IocContract](../interfaces/_adonisjs_fold.ioccontract.md)
* [TracerContract](../interfaces/_adonisjs_fold.tracercontract.md)

### Type aliases

* [AutoloadCacheItem](_adonisjs_fold.md#autoloadcacheitem)
* [BindCallback](_adonisjs_fold.md#bindcallback)
* [Binding](_adonisjs_fold.md#binding)

### Functions

* [IocProxyClass](_adonisjs_fold.md#iocproxyclass)
* [inject](_adonisjs_fold.md#inject)
* [tracer](_adonisjs_fold.md#tracer-1)

---

## Type aliases

<a id="autoloadcacheitem"></a>

###  AutoloadCacheItem

**Ƭ AutoloadCacheItem**: *`object`*

Shape of autoloaded cache entry

#### Type declaration

___
<a id="bindcallback"></a>

###  BindCallback

**Ƭ BindCallback**: *`function`*

#### Type declaration
▸(app: *[IocContract](../interfaces/_adonisjs_fold.ioccontract.md)*): `unknown`

**Parameters:**

| Name | Type |
| ------ | ------ |
| app | [IocContract](../interfaces/_adonisjs_fold.ioccontract.md) |

**Returns:** `unknown`

___
<a id="binding"></a>

###  Binding

**Ƭ Binding**: *`object`*

Shape of binding stored inside the IoC container

#### Type declaration

___

## Functions

<a id="iocproxyclass"></a>

###  IocProxyClass

▸ **IocProxyClass**(binding: *`string`*, actual: *`any`*, container: *[IocContract](../interfaces/_adonisjs_fold.ioccontract.md)*): `any`

Proxies the class constructor to fallback to fake, when it exists.

**Parameters:**

| Name | Type |
| ------ | ------ |
| binding | `string` |
| actual | `any` |
| container | [IocContract](../interfaces/_adonisjs_fold.ioccontract.md) |

**Returns:** `any`

___
<a id="inject"></a>

###  inject

▸ **inject**(value?: *`any`*): `decorator`

Injects bindings to the class constructor

**Parameters:**

| Name | Type |
| ------ | ------ |
| `Optional` value | `any` |

**Returns:** `decorator`

___
<a id="tracer-1"></a>

###  tracer

▸ **tracer**(enabled: *`boolean`*): [Tracer](../classes/_adonisjs_fold.tracer.md)

**Parameters:**

| Name | Type |
| ------ | ------ |
| enabled | `boolean` |

**Returns:** [Tracer](../classes/_adonisjs_fold.tracer.md)

___

