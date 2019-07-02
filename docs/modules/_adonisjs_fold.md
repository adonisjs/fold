> **[@adonisjs/fold](../README.md)**

[Globals](../README.md) / [@adonisjs/fold](_adonisjs_fold.md) /

# External module: @adonisjs/fold

### Index

#### Classes

* [IoCProxyObject](../classes/_adonisjs_fold.iocproxyobject.md)
* [Ioc](../classes/_adonisjs_fold.ioc.md)
* [Registrar](../classes/_adonisjs_fold.registrar.md)
* [Tracer](../classes/_adonisjs_fold.tracer.md)

#### Interfaces

* [IocContract](../interfaces/_adonisjs_fold.ioccontract.md)
* [TracerContract](../interfaces/_adonisjs_fold.tracercontract.md)

#### Type aliases

* [AutoloadCacheItem](_adonisjs_fold.md#autoloadcacheitem)
* [BindCallback](_adonisjs_fold.md#bindcallback)
* [Binding](_adonisjs_fold.md#binding)

#### Functions

* [IocProxyClass](_adonisjs_fold.md#iocproxyclass)
* [inject](_adonisjs_fold.md#inject)
* [tracer](_adonisjs_fold.md#tracer)

## Type aliases

###  AutoloadCacheItem

Ƭ **AutoloadCacheItem**: *object*

Shape of autoloaded cache entry

#### Type declaration:

___

###  BindCallback

Ƭ **BindCallback**: *function*

#### Type declaration:

▸ (`app`: [IocContract](../interfaces/_adonisjs_fold.ioccontract.md)): *unknown*

**Parameters:**

Name | Type |
------ | ------ |
`app` | [IocContract](../interfaces/_adonisjs_fold.ioccontract.md) |

___

###  Binding

Ƭ **Binding**: *object*

Shape of binding stored inside the IoC container

#### Type declaration:

## Functions

###  IocProxyClass

▸ **IocProxyClass**(`binding`: string, `actual`: any, `container`: [IocContract](../interfaces/_adonisjs_fold.ioccontract.md)): *any*

Proxies the class constructor to fallback to fake, when it exists.

**Parameters:**

Name | Type |
------ | ------ |
`binding` | string |
`actual` | any |
`container` | [IocContract](../interfaces/_adonisjs_fold.ioccontract.md) |

**Returns:** *any*

___

###  inject

▸ **inject**(`value?`: any): *`decorator`*

Injects bindings to the class constructor

**Parameters:**

Name | Type |
------ | ------ |
`value?` | any |

**Returns:** *`decorator`*

___

###  tracer

▸ **tracer**(`enabled`: boolean): *[Tracer](../classes/_adonisjs_fold.tracer.md)*

**Parameters:**

Name | Type |
------ | ------ |
`enabled` | boolean |

**Returns:** *[Tracer](../classes/_adonisjs_fold.tracer.md)*