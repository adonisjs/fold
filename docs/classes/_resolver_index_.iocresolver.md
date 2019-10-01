[@adonisjs/fold](../README.md) › ["Resolver/index"](../modules/_resolver_index_.md) › [IocResolver](_resolver_index_.iocresolver.md)

# Class: IocResolver

Exposes the API to resolve and call bindings from the IoC container. The resolver
internally caches the IoC container lookup nodes to boost performance.

## Hierarchy

* **IocResolver**

## Index

### Constructors

* [constructor](_resolver_index_.iocresolver.md#constructor)

### Methods

* [call](_resolver_index_.iocresolver.md#call)
* [resolve](_resolver_index_.iocresolver.md#resolve)

## Constructors

###  constructor

\+ **new IocResolver**(`_container`: [IocContract](../interfaces/_contracts_index_.ioccontract.md), `_fallbackMethod?`: undefined | string, `_rcNamespaceKey?`: undefined | string, `_fallbackNamespace?`: undefined | string): *[IocResolver](_resolver_index_.iocresolver.md)*

**Parameters:**

Name | Type |
------ | ------ |
`_container` | [IocContract](../interfaces/_contracts_index_.ioccontract.md) |
`_fallbackMethod?` | undefined &#124; string |
`_rcNamespaceKey?` | undefined &#124; string |
`_fallbackNamespace?` | undefined &#124; string |

**Returns:** *[IocResolver](_resolver_index_.iocresolver.md)*

## Methods

###  call

▸ **call**<**T**>(`namespace`: string | [IocResolverLookupNode](../modules/_resolver_index_.md#iocresolverlookupnode), `prefixNamespace?`: undefined | string, `args?`: any[]): *T*

Calls the namespace.method expression with any arguments that needs to
be passed. Also supports type-hinting dependencies.

**Type parameters:**

▪ **T**: *any*

**Parameters:**

Name | Type |
------ | ------ |
`namespace` | string &#124; [IocResolverLookupNode](../modules/_resolver_index_.md#iocresolverlookupnode) |
`prefixNamespace?` | undefined &#124; string |
`args?` | any[] |

**Returns:** *T*

___

###  resolve

▸ **resolve**(`namespace`: string, `prefixNamespace`: string | undefined): *[IocResolverLookupNode](../modules/_resolver_index_.md#iocresolverlookupnode)*

Resolves the namespace and returns it's lookup node

**Parameters:**

Name | Type | Default |
------ | ------ | ------ |
`namespace` | string | - |
`prefixNamespace` | string &#124; undefined |  this._prefixNamespace |

**Returns:** *[IocResolverLookupNode](../modules/_resolver_index_.md#iocresolverlookupnode)*
