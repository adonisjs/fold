[@adonisjs/fold](../README.md) › ["Ioc/Injector"](../modules/_ioc_injector_.md) › [Injector](_ioc_injector_.injector.md)

# Class: Injector

## Hierarchy

* **Injector**

## Index

### Constructors

* [constructor](_ioc_injector_.injector.md#constructor)

### Methods

* [injectDependencies](_ioc_injector_.injector.md#injectdependencies)
* [injectMethodDependencies](_ioc_injector_.injector.md#injectmethoddependencies)

## Constructors

###  constructor

\+ **new Injector**(`_container`: [IocContract](../interfaces/_contracts_index_.ioccontract.md)): *[Injector](_ioc_injector_.injector.md)*

**Parameters:**

Name | Type |
------ | ------ |
`_container` | [IocContract](../interfaces/_contracts_index_.ioccontract.md) |

**Returns:** *[Injector](_ioc_injector_.injector.md)*

## Methods

###  injectDependencies

▸ **injectDependencies**(`target`: any, `runtimeValues`: any[]): *any*

Injects dependencies to the constructor of a class.

**Parameters:**

Name | Type |
------ | ------ |
`target` | any |
`runtimeValues` | any[] |

**Returns:** *any*

___

###  injectMethodDependencies

▸ **injectMethodDependencies**(`target`: any, `method`: string, `runtimeValues`: any[]): *any*

Injects dependencies to the constructor of a class.

**Parameters:**

Name | Type |
------ | ------ |
`target` | any |
`method` | string |
`runtimeValues` | any[] |

**Returns:** *any*
