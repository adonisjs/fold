[@adonisjs/fold](../README.md) › ["Registrar/index"](../modules/_registrar_index_.md) › [Registrar](_registrar_index_.registrar.md)

# Class: Registrar

## Hierarchy

* **Registrar**

## Index

### Constructors

* [constructor](_registrar_index_.registrar.md#constructor)

### Properties

* [ioc](_registrar_index_.registrar.md#ioc)

### Methods

* [boot](_registrar_index_.registrar.md#boot)
* [register](_registrar_index_.registrar.md#register)
* [registerAndBoot](_registrar_index_.registrar.md#registerandboot)
* [useProviders](_registrar_index_.registrar.md#useproviders)

## Constructors

###  constructor

\+ **new Registrar**(`ioc`: [IocContract](../interfaces/_contracts_index_.ioccontract.md), `_basePath?`: undefined | string): *[Registrar](_registrar_index_.registrar.md)*

**Parameters:**

Name | Type |
------ | ------ |
`ioc` | [IocContract](../interfaces/_contracts_index_.ioccontract.md) |
`_basePath?` | undefined &#124; string |

**Returns:** *[Registrar](_registrar_index_.registrar.md)*

## Properties

###  ioc

• **ioc**: *[IocContract](../interfaces/_contracts_index_.ioccontract.md)*

## Methods

###  boot

▸ **boot**(): *Promise‹void›*

Boot all the providers by calling the `boot` method.
Boot methods are called in series.

**Returns:** *Promise‹void›*

___

###  register

▸ **register**(): *any[]*

Register all the providers by instantiating them and
calling the `register` method.

The provider instance will be returned, which can be used
to boot them as well.

**Returns:** *any[]*

___

###  registerAndBoot

▸ **registerAndBoot**(): *Promise‹any[]›*

Register an boot providers together.

**Returns:** *Promise‹any[]›*

___

###  useProviders

▸ **useProviders**(`providersPaths`: string[]): *this*

Register an array of provider paths

**Parameters:**

Name | Type |
------ | ------ |
`providersPaths` | string[] |

**Returns:** *this*
