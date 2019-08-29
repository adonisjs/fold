**[@adonisjs/fold](../README.md)**

[Globals](../README.md) › ["Contracts/index"](../modules/_contracts_index_.md) › [IocContract](_contracts_index_.ioccontract.md)

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
* [hasAlias](_contracts_index_.ioccontract.md#hasalias)
* [hasBinding](_contracts_index_.ioccontract.md#hasbinding)
* [hasFake](_contracts_index_.ioccontract.md#hasfake)
* [isAutoloadNamespace](_contracts_index_.ioccontract.md#isautoloadnamespace)
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

▸ **bind**(`name`: string, `callback`: [BindCallback](../modules/_contracts_index_.md#bindcallback)): *void*

**Parameters:**

Name | Type |
------ | ------ |
`name` | string |
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
`namespace?` | undefined \| string |
`clearRequireCache?` | undefined \| false \| true |

**Returns:** *void*

___

###  fake

▸ **fake**(`name`: string, `callback`: [BindCallback](../modules/_contracts_index_.md#bindcallback)): *void*

**Parameters:**

Name | Type |
------ | ------ |
`name` | string |
`callback` | [BindCallback](../modules/_contracts_index_.md#bindcallback) |

**Returns:** *void*

___

###  getAliasNamespace

▸ **getAliasNamespace**(`name`: string): *string | undefined*

**Parameters:**

Name | Type |
------ | ------ |
`name` | string |

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

###  hasAlias

▸ **hasAlias**(`name`: string): *boolean*

**Parameters:**

Name | Type |
------ | ------ |
`name` | string |

**Returns:** *boolean*

___

###  hasBinding

▸ **hasBinding**(`namespace`: string, `checkAliases?`: undefined | false | true): *boolean*

**Parameters:**

Name | Type |
------ | ------ |
`namespace` | string |
`checkAliases?` | undefined \| false \| true |

**Returns:** *boolean*

___

###  hasFake

▸ **hasFake**(`name`: string): *boolean*

**Parameters:**

Name | Type |
------ | ------ |
`name` | string |

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

###  make

▸ **make**<**T**>(`name`: string, `args?`: string[]): *T*

**Type parameters:**

▪ **T**: *any*

**Parameters:**

Name | Type |
------ | ------ |
`name` | string |
`args?` | string[] |

**Returns:** *T*

___

###  restore

▸ **restore**(`name`: string): *void*

**Parameters:**

Name | Type |
------ | ------ |
`name` | string |

**Returns:** *void*

___

###  singleton

▸ **singleton**(`name`: string, `callback`: [BindCallback](../modules/_contracts_index_.md#bindcallback)): *void*

**Parameters:**

Name | Type |
------ | ------ |
`name` | string |
`callback` | [BindCallback](../modules/_contracts_index_.md#bindcallback) |

**Returns:** *void*

___

###  use

▸ **use**<**T**>(`name`: string): *T*

**Type parameters:**

▪ **T**: *any*

**Parameters:**

Name | Type |
------ | ------ |
`name` | string |

**Returns:** *T*

___

###  useEsm

▸ **useEsm**<**T**>(`name`: string): *T*

**Type parameters:**

▪ **T**: *any*

**Parameters:**

Name | Type |
------ | ------ |
`name` | string |

**Returns:** *T*

___

###  useFake

▸ **useFake**<**T**>(`name`: string): *T*

**Type parameters:**

▪ **T**: *any*

**Parameters:**

Name | Type |
------ | ------ |
`name` | string |

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