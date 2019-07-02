> **[@adonisjs/fold](../README.md)**

[Globals](../README.md) / [@adonisjs/fold](../modules/_adonisjs_fold.md) / [IocContract](_adonisjs_fold.ioccontract.md) /

# Interface: IocContract

Ioc container interface

## Hierarchy

* **IocContract**

## Implemented by

* [Ioc](../classes/_adonisjs_fold.ioc.md)

### Index

#### Properties

* [autoloadedAliases](_adonisjs_fold.ioccontract.md#autoloadedaliases)
* [autoloads](_adonisjs_fold.ioccontract.md#autoloads)
* [tracer](_adonisjs_fold.ioccontract.md#tracer)

#### Methods

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

## Properties

###  autoloadedAliases

• **autoloadedAliases**: *string[]*

___

###  autoloads

• **autoloads**: *object*

#### Type declaration:

● \[▪ **namespace**: *string*\]: string

___

###  tracer

• **tracer**: *[TracerContract](_adonisjs_fold.tracercontract.md)*

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

▸ **bind**(`name`: string, `callback`: [BindCallback](../modules/_adonisjs_fold.md#bindcallback)): *void*

**Parameters:**

Name | Type |
------ | ------ |
`name` | string |
`callback` | [BindCallback](../modules/_adonisjs_fold.md#bindcallback) |

**Returns:** *void*

___

###  call

▸ **call**<**T**, **K**>(`target`: `T`, `method`: `K`, `args`: any[]): *any*

**Type parameters:**

▪ **T**: *object*

▪ **K**: *keyof T*

**Parameters:**

Name | Type |
------ | ------ |
`target` | `T` |
`method` | `K` |
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

▸ **fake**(`name`: string, `callback`: [BindCallback](../modules/_adonisjs_fold.md#bindcallback)): *void*

**Parameters:**

Name | Type |
------ | ------ |
`name` | string |
`callback` | [BindCallback](../modules/_adonisjs_fold.md#bindcallback) |

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

▸ **make**<**T**>(`name`: string, `args?`: string[]): *`T`*

**Type parameters:**

▪ **T**: *any*

**Parameters:**

Name | Type |
------ | ------ |
`name` | string |
`args?` | string[] |

**Returns:** *`T`*

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

▸ **singleton**(`name`: string, `callback`: [BindCallback](../modules/_adonisjs_fold.md#bindcallback)): *void*

**Parameters:**

Name | Type |
------ | ------ |
`name` | string |
`callback` | [BindCallback](../modules/_adonisjs_fold.md#bindcallback) |

**Returns:** *void*

___

###  use

▸ **use**<**T**>(`name`: string): *`T`*

**Type parameters:**

▪ **T**: *any*

**Parameters:**

Name | Type |
------ | ------ |
`name` | string |

**Returns:** *`T`*

___

###  useEsm

▸ **useEsm**<**T**>(`name`: string): *`T`*

**Type parameters:**

▪ **T**: *any*

**Parameters:**

Name | Type |
------ | ------ |
`name` | string |

**Returns:** *`T`*

___

###  useFake

▸ **useFake**<**T**>(`name`: string): *`T`*

**Type parameters:**

▪ **T**: *any*

**Parameters:**

Name | Type |
------ | ------ |
`name` | string |

**Returns:** *`T`*

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