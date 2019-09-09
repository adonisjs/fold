**[@adonisjs/fold](../README.md)**

[Globals](../README.md) › [&quot;Contracts/index&quot;](_contracts_index_.md)

# External module: "Contracts/index"

## Index

### Interfaces

* [IocContract](../interfaces/_contracts_index_.ioccontract.md)
* [IocResolverContract](../interfaces/_contracts_index_.iocresolvercontract.md)
* [TracerContract](../interfaces/_contracts_index_.tracercontract.md)

### Type aliases

* [AutoloadCacheItem](_contracts_index_.md#autoloadcacheitem)
* [BindCallback](_contracts_index_.md#bindcallback)
* [Binding](_contracts_index_.md#binding)
* [IocResolverLookupNode](_contracts_index_.md#iocresolverlookupnode)
* [LookupNode](_contracts_index_.md#lookupnode)

## Type aliases

###  AutoloadCacheItem

Ƭ **AutoloadCacheItem**: *object*

Shape of autoloaded cache entry

#### Type declaration:

___

###  BindCallback

Ƭ **BindCallback**: *function*

#### Type declaration:

▸ (`app`: [IocContract](../interfaces/_contracts_index_.ioccontract.md)): *unknown*

**Parameters:**

Name | Type |
------ | ------ |
`app` | [IocContract](../interfaces/_contracts_index_.ioccontract.md) |

___

###  Binding

Ƭ **Binding**: *object*

Shape of binding stored inside the IoC container

#### Type declaration:

___

###  IocResolverLookupNode

Ƭ **IocResolverLookupNode**: *object*

#### Type declaration:

___

###  LookupNode

Ƭ **LookupNode**: *object*

Shape of lookup node pulled using `ioc.lookup` method. This node
can be passed to `ioc.use`, or `ioc.make` or `ioc.useEsm` to
skip many checks and resolve the right thing

#### Type declaration: