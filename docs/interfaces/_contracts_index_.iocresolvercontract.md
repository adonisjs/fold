[@adonisjs/fold](../README.md) › ["Contracts/index"](../modules/_contracts_index_.md) › [IocResolverContract](_contracts_index_.iocresolvercontract.md)

# Interface: IocResolverContract

Shape of the IocResolver class

## Hierarchy

* **IocResolverContract**

## Index

### Methods

* [call](_contracts_index_.iocresolvercontract.md#call)
* [resolve](_contracts_index_.iocresolvercontract.md#resolve)

## Methods

###  call

▸ **call**<**T**>(`namespace`: string | [IocResolverLookupNode](../modules/_contracts_index_.md#iocresolverlookupnode), `prefixNamespace?`: undefined | string, `args?`: any[]): *T*

**Type parameters:**

▪ **T**: *any*

**Parameters:**

Name | Type |
------ | ------ |
`namespace` | string &#124; [IocResolverLookupNode](../modules/_contracts_index_.md#iocresolverlookupnode) |
`prefixNamespace?` | undefined &#124; string |
`args?` | any[] |

**Returns:** *T*

___

###  resolve

▸ **resolve**(`namespace`: string, `prefixNamespace?`: undefined | string): *[IocResolverLookupNode](../modules/_contracts_index_.md#iocresolverlookupnode)*

**Parameters:**

Name | Type |
------ | ------ |
`namespace` | string |
`prefixNamespace?` | undefined &#124; string |

**Returns:** *[IocResolverLookupNode](../modules/_contracts_index_.md#iocresolverlookupnode)*
