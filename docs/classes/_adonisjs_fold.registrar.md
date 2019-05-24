[@adonisjs/fold](../README.md) > [@adonisjs/fold](../modules/_adonisjs_fold.md) > [Registrar](../classes/_adonisjs_fold.registrar.md)

# Class: Registrar

## Hierarchy

**Registrar**

## Index

### Constructors

* [constructor](_adonisjs_fold.registrar.md#constructor)

### Properties

* [ioc](_adonisjs_fold.registrar.md#ioc)

### Methods

* [boot](_adonisjs_fold.registrar.md#boot)
* [register](_adonisjs_fold.registrar.md#register)
* [registerAndBoot](_adonisjs_fold.registrar.md#registerandboot)
* [useProviders](_adonisjs_fold.registrar.md#useproviders)

---

## Constructors

<a id="constructor"></a>

###  constructor

⊕ **new Registrar**(ioc: *[IocContract](../interfaces/_adonisjs_fold.ioccontract.md)*): [Registrar](_adonisjs_fold.registrar.md)

**Parameters:**

| Name | Type |
| ------ | ------ |
| ioc | [IocContract](../interfaces/_adonisjs_fold.ioccontract.md) |

**Returns:** [Registrar](_adonisjs_fold.registrar.md)

___

## Properties

<a id="ioc"></a>

###  ioc

**● ioc**: *[IocContract](../interfaces/_adonisjs_fold.ioccontract.md)*

___

## Methods

<a id="boot"></a>

###  boot

▸ **boot**(providers: *`any`[]*): `Promise`<`void`>

Boot all the providers by calling the `boot` method. Boot methods are called in series.

**Parameters:**

| Name | Type |
| ------ | ------ |
| providers | `any`[] |

**Returns:** `Promise`<`void`>

___
<a id="register"></a>

###  register

▸ **register**(): `any`[]

Register all the providers by instantiating them and calling the `register` method.

The provider instance will be returned, which can be used to boot them as well.

**Returns:** `any`[]

___
<a id="registerandboot"></a>

###  registerAndBoot

▸ **registerAndBoot**(): `Promise`<`any`[]>

Register an boot providers together.

**Returns:** `Promise`<`any`[]>

___
<a id="useproviders"></a>

###  useProviders

▸ **useProviders**(providersPaths: *`string`[]*): `this`

Register an array of provider paths

**Parameters:**

| Name | Type |
| ------ | ------ |
| providersPaths | `string`[] |

**Returns:** `this`

___

