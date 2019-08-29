**[@adonisjs/fold](../README.md)**

[Globals](../README.md) › ["Ioc/Tracer"](../modules/_ioc_tracer_.md) › [Tracer](_ioc_tracer_.tracer.md) › [EventEmitter](_ioc_tracer_.tracer.eventemitter.md)

# Class: EventEmitter

## Hierarchy

* **EventEmitter**

## Index

### Properties

* [defaultMaxListeners](_ioc_tracer_.tracer.eventemitter.md#static-defaultmaxlisteners)

### Methods

* [addListener](_ioc_tracer_.tracer.eventemitter.md#addlistener)
* [emit](_ioc_tracer_.tracer.eventemitter.md#emit)
* [eventNames](_ioc_tracer_.tracer.eventemitter.md#eventnames)
* [getMaxListeners](_ioc_tracer_.tracer.eventemitter.md#getmaxlisteners)
* [listenerCount](_ioc_tracer_.tracer.eventemitter.md#listenercount)
* [listeners](_ioc_tracer_.tracer.eventemitter.md#listeners)
* [off](_ioc_tracer_.tracer.eventemitter.md#off)
* [on](_ioc_tracer_.tracer.eventemitter.md#on)
* [once](_ioc_tracer_.tracer.eventemitter.md#once)
* [prependListener](_ioc_tracer_.tracer.eventemitter.md#prependlistener)
* [prependOnceListener](_ioc_tracer_.tracer.eventemitter.md#prependoncelistener)
* [rawListeners](_ioc_tracer_.tracer.eventemitter.md#rawlisteners)
* [removeAllListeners](_ioc_tracer_.tracer.eventemitter.md#removealllisteners)
* [removeListener](_ioc_tracer_.tracer.eventemitter.md#removelistener)
* [setMaxListeners](_ioc_tracer_.tracer.eventemitter.md#setmaxlisteners)
* [listenerCount](_ioc_tracer_.tracer.eventemitter.md#static-listenercount)

## Properties

### `Static` defaultMaxListeners

▪ **defaultMaxListeners**: *number*

## Methods

###  addListener

▸ **addListener**(`event`: string | symbol, `listener`: function): *this*

**Parameters:**

▪ **event**: *string | symbol*

▪ **listener**: *function*

▸ (...`args`: any[]): *void*

**Parameters:**

Name | Type |
------ | ------ |
`...args` | any[] |

**Returns:** *this*

___

###  emit

▸ **emit**(`event`: string | symbol, ...`args`: any[]): *boolean*

**Parameters:**

Name | Type |
------ | ------ |
`event` | string \| symbol |
`...args` | any[] |

**Returns:** *boolean*

___

###  eventNames

▸ **eventNames**(): *Array‹string | symbol›*

**Returns:** *Array‹string | symbol›*

___

###  getMaxListeners

▸ **getMaxListeners**(): *number*

**Returns:** *number*

___

###  listenerCount

▸ **listenerCount**(`type`: string | symbol): *number*

**Parameters:**

Name | Type |
------ | ------ |
`type` | string \| symbol |

**Returns:** *number*

___

###  listeners

▸ **listeners**(`event`: string | symbol): *Function[]*

**Parameters:**

Name | Type |
------ | ------ |
`event` | string \| symbol |

**Returns:** *Function[]*

___

###  off

▸ **off**(`event`: string | symbol, `listener`: function): *this*

**Parameters:**

▪ **event**: *string | symbol*

▪ **listener**: *function*

▸ (...`args`: any[]): *void*

**Parameters:**

Name | Type |
------ | ------ |
`...args` | any[] |

**Returns:** *this*

___

###  on

▸ **on**(`event`: string | symbol, `listener`: function): *this*

**Parameters:**

▪ **event**: *string | symbol*

▪ **listener**: *function*

▸ (...`args`: any[]): *void*

**Parameters:**

Name | Type |
------ | ------ |
`...args` | any[] |

**Returns:** *this*

___

###  once

▸ **once**(`event`: string | symbol, `listener`: function): *this*

**Parameters:**

▪ **event**: *string | symbol*

▪ **listener**: *function*

▸ (...`args`: any[]): *void*

**Parameters:**

Name | Type |
------ | ------ |
`...args` | any[] |

**Returns:** *this*

___

###  prependListener

▸ **prependListener**(`event`: string | symbol, `listener`: function): *this*

**Parameters:**

▪ **event**: *string | symbol*

▪ **listener**: *function*

▸ (...`args`: any[]): *void*

**Parameters:**

Name | Type |
------ | ------ |
`...args` | any[] |

**Returns:** *this*

___

###  prependOnceListener

▸ **prependOnceListener**(`event`: string | symbol, `listener`: function): *this*

**Parameters:**

▪ **event**: *string | symbol*

▪ **listener**: *function*

▸ (...`args`: any[]): *void*

**Parameters:**

Name | Type |
------ | ------ |
`...args` | any[] |

**Returns:** *this*

___

###  rawListeners

▸ **rawListeners**(`event`: string | symbol): *Function[]*

**Parameters:**

Name | Type |
------ | ------ |
`event` | string \| symbol |

**Returns:** *Function[]*

___

###  removeAllListeners

▸ **removeAllListeners**(`event?`: string | symbol): *this*

**Parameters:**

Name | Type |
------ | ------ |
`event?` | string \| symbol |

**Returns:** *this*

___

###  removeListener

▸ **removeListener**(`event`: string | symbol, `listener`: function): *this*

**Parameters:**

▪ **event**: *string | symbol*

▪ **listener**: *function*

▸ (...`args`: any[]): *void*

**Parameters:**

Name | Type |
------ | ------ |
`...args` | any[] |

**Returns:** *this*

___

###  setMaxListeners

▸ **setMaxListeners**(`n`: number): *this*

**Parameters:**

Name | Type |
------ | ------ |
`n` | number |

**Returns:** *this*

___

### `Static` listenerCount

▸ **listenerCount**(`emitter`: EventEmitter, `event`: string | symbol): *number*

**`deprecated`** since v4.0.0

**Parameters:**

Name | Type |
------ | ------ |
`emitter` | EventEmitter |
`event` | string \| symbol |

**Returns:** *number*