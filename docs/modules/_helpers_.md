[@adonisjs/fold](../README.md) › ["helpers"](_helpers_.md)

# External module: "helpers"

## Index

### Functions

* [clearRequireCache](_helpers_.md#clearrequirecache)
* [ensureIsFunction](_helpers_.md#ensureisfunction)
* [isClass](_helpers_.md#isclass)
* [isEsm](_helpers_.md#isesm)
* [isObject](_helpers_.md#isobject)
* [isPrimtiveConstructor](_helpers_.md#isprimtiveconstructor)

## Functions

###  clearRequireCache

▸ **clearRequireCache**(`modulePath`: string): *void*

Clears the require cache for a given module

**Parameters:**

Name | Type |
------ | ------ |
`modulePath` | string |

**Returns:** *void*

___

###  ensureIsFunction

▸ **ensureIsFunction**(`callback`: Function, `message`: string): *void*

Raises error with a message when callback is not
a function.

**Parameters:**

Name | Type |
------ | ------ |
`callback` | Function |
`message` | string |

**Returns:** *void*

___

###  isClass

▸ **isClass**(`fn`: any): *boolean*

Returns a function telling if value is a class or not

**Parameters:**

Name | Type |
------ | ------ |
`fn` | any |

**Returns:** *boolean*

___

###  isEsm

▸ **isEsm**(`value`: any): *boolean*

Returns a boolean telling if value is an esm module
with `export default`.

**Parameters:**

Name | Type |
------ | ------ |
`value` | any |

**Returns:** *boolean*

___

###  isObject

▸ **isObject**(`value`: any): *boolean*

Returns a boolean to differentiate between null and objects
and arrays too

**Parameters:**

Name | Type |
------ | ------ |
`value` | any |

**Returns:** *boolean*

___

###  isPrimtiveConstructor

▸ **isPrimtiveConstructor**(`value`: any): *boolean*

Returns a boolean telling if value is a primitive or object constructor.

**Parameters:**

Name | Type |
------ | ------ |
`value` | any |

**Returns:** *boolean*
