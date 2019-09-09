**[@adonisjs/fold](../README.md)**

[Globals](../README.md) › [&quot;Contracts/index&quot;](../modules/_contracts_index_.md) › [IocContract](_contracts_index_.ioccontract.md)

# Interface: IocContract

Ioc container interface

## Hierarchy

* **IocContract**

## Implemented by

* [Ioc](../classes/_ioc_index_.ioc.md)

## Index

### Properties

* [autoloadedAliases](_contracts_index_.ioccontract.md#autoloadedaliases)
* [autoloads](_contracts_index_.ioccontract.md#autoloads)
* [tracer](_contracts_index_.ioccontract.md#tracer)

### Methods

* [alias](_contracts_index_.ioccontract.md#alias)
* [autoload](_contracts_index_.ioccontract.md#autoload)
* [bind](_contracts_index_.ioccontract.md#bind)
* [call](_contracts_index_.ioccontract.md#call)
* [clearAutoloadCache](_contracts_index_.ioccontract.md#clearautoloadcache)
* [fake](_contracts_index_.ioccontract.md#fake)
* [getAliasNamespace](_contracts_index_.ioccontract.md#getaliasnamespace)
* [getAutoloadBaseNamespace](_contracts_index_.ioccontract.md#getautoloadbasenamespace)
* [getResolver](_contracts_index_.ioccontract.md#getresolver)
* [hasAlias](_contracts_index_.ioccontract.md#hasalias)
* [hasBinding](_contracts_index_.ioccontract.md#hasbinding)
* [hasFake](_contracts_index_.ioccontract.md#hasfake)
* [isAutoloadNamespace](_contracts_index_.ioccontract.md#isautoloadnamespace)
* [lookup](_contracts_index_.ioccontract.md#lookup)
* [make](_contracts_index_.ioccontract.md#make)
* [restore](_contracts_index_.ioccontract.md#restore)
* [singleton](_contracts_index_.ioccontract.md#singleton)
* [use](_contracts_index_.ioccontract.md#use)
* [useEsm](_contracts_index_.ioccontract.md#useesm)
* [useFake](_contracts_index_.ioccontract.md#usefake)
* [useProxies](_contracts_index_.ioccontract.md#useproxies)
* [with](_contracts_index_.ioccontract.md#with)

## Properties

###  autoloadedAliases

• **autoloadedAliases**: *string[]*

___

###  autoloads

• **autoloads**: *object*

#### Type declaration:

* \[ **namespace**: *string*\]: string

___

###  tracer

• **tracer**: *[TracerContract](_contracts_index_.tracercontract.md)*

## Methods

###  alias

▸ **alias**(`namespace`: string, `alias`: string): *void*

**Parameters:**

Name | Type |
------ | ------ |
`namespace` | string |
`alias` | string |

**Returns:** *void*

___

###  autoload

▸ **autoload**(`directoryPath`: string, `namespace`: string): *void*

**Parameters:**

Name | Type |
------ | ------ |
`directoryPath` | string |
`namespace` | string |

**Returns:** *void*

___

###  bind

▸ **bind**(`namespace`: string, `callback`: [BindCallback](../modules/_contracts_index_.md#bindcallback)): *void*

**Parameters:**

Name | Type |
------ | ------ |
`namespace` | string |
`callback` | [BindCallback](../modules/_contracts_index_.md#bindcallback) |

**Returns:** *void*

___

###  call

▸ **call**<**T**, **K**>(`target`: T, `method`: K, `args`: any[]): *any*

**Type parameters:**

▪ **T**: *object*

▪ **K**: *keyof T*

**Parameters:**

Name | Type |
------ | ------ |
`target` | T |
`method` | K |
`args` | any[] |

**Returns:** *any*

___

###  clearAutoloadCache

▸ **clearAutoloadCache**(`namespace?`: undefined | string, `clearRequireCache?`: undefined | false | true): *void*

**Parameters:**

Name | Type |
------ | ------ |
`namespace?` | undefined &#124; string |
`clearRequireCache?` | undefined &#124; false &#124; true |

**Returns:** *void*

___

###  fake

▸ **fake**(`namespace`: string, `callback`: [BindCallback](../modules/_contracts_index_.md#bindcallback)): *void*

**Parameters:**

Name | Type |
------ | ------ |
`namespace` | string |
`callback` | [BindCallback](../modules/_contracts_index_.md#bindcallback) |

**Returns:** *void*

___

###  getAliasNamespace

▸ **getAliasNamespace**(`namespace`: string): *string | undefined*

**Parameters:**

Name | Type |
------ | ------ |
`namespace` | string |

**Returns:** *string | undefined*

___

###  getAutoloadBaseNamespace

▸ **getAutoloadBaseNamespace**(`namespace`: string): *string | undefined*

**Parameters:**

Name | Type |
------ | ------ |
`namespace` | string |

**Returns:** *string | undefined*

___

###  getResolver

▸ **getResolver**(`fallbackMethod?`: undefined | string, `rcNamespaceKey?`: undefined | string, `fallbackNamespace?`: undefined | string): *[IocResolverContract](_contracts_index_.iocresolvercontract.md)*

**Parameters:**

Name | Type |
------ | ------ |
`fallbackMethod?` | undefined &#124; string |
`rcNamespaceKey?` | undefined &#124; string |
`fallbackNamespace?` | undefined &#124; string |

**Returns:** *[IocResolverContract](_contracts_index_.iocresolvercontract.md)*

___

###  hasAlias

▸ **hasAlias**(`namespace`: string): *boolean*

**Parameters:**

Name | Type |
------ | ------ |
`namespace` | string |

**Returns:** *boolean*

___

###  hasBinding

▸ **hasBinding**(`namespace`: string, `checkAliases?`: undefined | false | true): *boolean*

**Parameters:**

Name | Type |
------ | ------ |
`namespace` | string |
`checkAliases?` | undefined &#124; false &#124; true |

**Returns:** *boolean*

___

###  hasFake

▸ **hasFake**(`namespace`: string): *boolean*

**Parameters:**

Name | Type |
------ | ------ |
`namespace` | string |

**Returns:** *boolean*

___

###  isAutoloadNamespace

▸ **isAutoloadNamespace**(`namespace`: string): *boolean*

**Parameters:**

Name | Type |
------ | ------ |
`namespace` | string |

**Returns:** *boolean*

___

###  lookup

▸ **lookup**(`namespace`: string, `prefixNamespace?`: undefined | string): *[LookupNode](../modules/_contracts_index_.md#lookupnode) | null*

**Parameters:**

Name | Type |
------ | ------ |
`namespace` | string |
`prefixNamespace?` | undefined &#124; string |

**Returns:** *[LookupNode](../modules/_contracts_index_.md#lookupnode) | null*

___

###  make

▸ **make**<**T**>(`namespace`: string | [LookupNode](../modules/_contracts_index_.md#lookupnode), `args?`: string[]): *T*

**Type parameters:**

▪ **T**: *any*

**Parameters:**

Name | Type |
------ | ------ |
`namespace` | string &#124; [LookupNode](../modules/_contracts_index_.md#lookupnode) |
`args?` | string[] |

**Returns:** *T*

___

###  restore

▸ **restore**(`namespace`: string): *void*

**Parameters:**

Name | Type |
------ | ------ |
`namespace` | string |

**Returns:** *void*

___

###  singleton

▸ **singleton**(`namespace`: string, `callback`: [BindCallback](../modules/_contracts_index_.md#bindcallback)): *void*

**Parameters:**

Name | Type |
------ | ------ |
`namespace` | string |
`callback` | [BindCallback](../modules/_contracts_index_.md#bindcallback) |

**Returns:** *void*

___

###  use

▸ **use**<**T**>(`namespace`: string | [LookupNode](../modules/_contracts_index_.md#lookupnode)): *T*

**Type parameters:**

▪ **T**: *any*

**Parameters:**

Name | Type |
------ | ------ |
`namespace` | string &#124; [LookupNode](../modules/_contracts_index_.md#lookupnode) |

**Returns:** *T*

___

###  useEsm

▸ **useEsm**<**T**>(`namespace`: string | [LookupNode](../modules/_contracts_index_.md#lookupnode)): *T*

**Type parameters:**

▪ **T**: *any*

**Parameters:**

Name | Type |
------ | ------ |
`namespace` | string &#124; [LookupNode](../modules/_contracts_index_.md#lookupnode) |

**Returns:** *T*

___

###  useFake

▸ **useFake**<**T**>(`namespace`: string): *T*

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

**Returns:** *this*

___

###  with

▸ **with**(`namespaces`: string[], `cb`: function): *void*

**Parameters:**

▪ **namespaces**: *string[]*

▪ **cb**: *function*

▸ (...`args`: any[]): *void*

**Parameters:**

Name | Type |
------ | ------ |
`...args` | any[] |

**Returns:** *void*