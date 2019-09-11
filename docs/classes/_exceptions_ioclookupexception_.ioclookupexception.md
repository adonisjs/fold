**[@adonisjs/fold](../README.md)**

[Globals](../README.md) › [&quot;Exceptions/IocLookupException&quot;](../modules/_exceptions_ioclookupexception_.md) › [IocLookupException](_exceptions_ioclookupexception_.ioclookupexception.md)

# Class: IocLookupException

## Hierarchy

* Exception

  * **IocLookupException**

## Index

### Constructors

* [constructor](_exceptions_ioclookupexception_.ioclookupexception.md#constructor)

### Properties

* [code](_exceptions_ioclookupexception_.ioclookupexception.md#optional-code)
* [message](_exceptions_ioclookupexception_.ioclookupexception.md#message)
* [name](_exceptions_ioclookupexception_.ioclookupexception.md#name)
* [stack](_exceptions_ioclookupexception_.ioclookupexception.md#optional-stack)
* [status](_exceptions_ioclookupexception_.ioclookupexception.md#status)

### Methods

* [lookupFailed](_exceptions_ioclookupexception_.ioclookupexception.md#static-lookupfailed)
* [missingBinding](_exceptions_ioclookupexception_.ioclookupexception.md#static-missingbinding)

## Constructors

###  constructor

\+ **new IocLookupException**(`message`: string, `status?`: undefined | number, `code?`: undefined | string): *[IocLookupException](_exceptions_ioclookupexception_.ioclookupexception.md)*

*Inherited from void*

**Parameters:**

Name | Type |
------ | ------ |
`message` | string |
`status?` | undefined &#124; number |
`code?` | undefined &#124; string |

**Returns:** *[IocLookupException](_exceptions_ioclookupexception_.ioclookupexception.md)*

## Properties

### `Optional` code

• **code**? : *undefined | string*

*Inherited from void*

___

###  message

• **message**: *string*

*Inherited from void*

*Overrides void*

___

###  name

• **name**: *string*

*Inherited from void*

*Overrides void*

___

### `Optional` stack

• **stack**? : *undefined | string*

*Inherited from void*

*Overrides void*

___

###  status

• **status**: *number*

*Inherited from void*

## Methods

### `Static` lookupFailed

▸ **lookupFailed**(`namespace`: string): *[IocLookupException](_exceptions_ioclookupexception_.ioclookupexception.md)*

**Parameters:**

Name | Type |
------ | ------ |
`namespace` | string |

**Returns:** *[IocLookupException](_exceptions_ioclookupexception_.ioclookupexception.md)*

___

### `Static` missingBinding

▸ **missingBinding**(`namespace`: string): *[IocLookupException](_exceptions_ioclookupexception_.ioclookupexception.md)*

**Parameters:**

Name | Type |
------ | ------ |
`namespace` | string |

**Returns:** *[IocLookupException](_exceptions_ioclookupexception_.ioclookupexception.md)*