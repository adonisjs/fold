> **[@adonisjs/fold](../README.md)**

[Globals](../README.md) / [@adonisjs/fold](../modules/_adonisjs_fold.md) / [TracerContract](_adonisjs_fold.tracercontract.md) /

# Interface: TracerContract

## Hierarchy

* `EventEmitter`

  * **TracerContract**

## Implemented by

* [Tracer](../classes/_adonisjs_fold.tracer.md)

### Index

#### Properties

* [defaultMaxListeners](_adonisjs_fold.tracercontract.md#static-defaultmaxlisteners)

#### Methods

* [addListener](_adonisjs_fold.tracercontract.md#addlistener)
* [emit](_adonisjs_fold.tracercontract.md#emit)
* [eventNames](_adonisjs_fold.tracercontract.md#eventnames)
* [getMaxListeners](_adonisjs_fold.tracercontract.md#getmaxlisteners)
* [in](_adonisjs_fold.tracercontract.md#in)
* [listenerCount](_adonisjs_fold.tracercontract.md#listenercount)
* [listeners](_adonisjs_fold.tracercontract.md#listeners)
* [off](_adonisjs_fold.tracercontract.md#off)
* [on](_adonisjs_fold.tracercontract.md#on)
* [once](_adonisjs_fold.tracercontract.md#once)
* [out](_adonisjs_fold.tracercontract.md#out)
* [prependListener](_adonisjs_fold.tracercontract.md#prependlistener)
* [prependOnceListener](_adonisjs_fold.tracercontract.md#prependoncelistener)
* [rawListeners](_adonisjs_fold.tracercontract.md#rawlisteners)
* [removeAllListeners](_adonisjs_fold.tracercontract.md#removealllisteners)
* [removeListener](_adonisjs_fold.tracercontract.md#removelistener)
* [setMaxListeners](_adonisjs_fold.tracercontract.md#setmaxlisteners)
* [listenerCount](_adonisjs_fold.tracercontract.md#static-listenercount)

## Properties

### `Static` defaultMaxListeners

▪ **defaultMaxListeners**: *number*

*Inherited from void*

## Methods

###  addListener

▸ **addListener**(`event`: string | symbol, `listener`: function): *this*

*Inherited from void*

*Overrides void*

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

*Inherited from void*

*Overrides void*

**Parameters:**

Name | Type |
------ | ------ |
`event` | string \| symbol |
`...args` | any[] |

**Returns:** *boolean*

___

###  eventNames

▸ **eventNames**(): *`Array<string | symbol>`*

*Inherited from void*

*Overrides void*

**Returns:** *`Array<string | symbol>`*

___

###  getMaxListeners

▸ **getMaxListeners**(): *number*

*Inherited from void*

*Overrides void*

**Returns:** *number*

___

###  in

▸ **in**(`namespace`: string, `cached`: boolean): *void*

**Parameters:**

Name | Type |
------ | ------ |
`namespace` | string |
`cached` | boolean |

**Returns:** *void*

___

###  listenerCount

▸ **listenerCount**(`type`: string | symbol): *number*

*Inherited from void*

*Overrides void*

**Parameters:**

Name | Type |
------ | ------ |
`type` | string \| symbol |

**Returns:** *number*

___

###  listeners

▸ **listeners**(`event`: string | symbol): *`Function`[]*

*Inherited from void*

*Overrides void*

**Parameters:**

Name | Type |
------ | ------ |
`event` | string \| symbol |

**Returns:** *`Function`[]*

___

###  off

▸ **off**(`event`: string | symbol, `listener`: function): *this*

*Inherited from void*

*Overrides void*

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

*Inherited from void*

*Overrides void*

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

*Inherited from void*

*Overrides void*

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

###  out

▸ **out**(): *void*

**Returns:** *void*

___

###  prependListener

▸ **prependListener**(`event`: string | symbol, `listener`: function): *this*

*Inherited from void*

*Overrides void*

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

*Inherited from void*

*Overrides void*

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

▸ **rawListeners**(`event`: string | symbol): *`Function`[]*

*Inherited from void*

*Overrides void*

**Parameters:**

Name | Type |
------ | ------ |
`event` | string \| symbol |

**Returns:** *`Function`[]*

___

###  removeAllListeners

▸ **removeAllListeners**(`event?`: string | symbol): *this*

*Inherited from void*

*Overrides void*

**Parameters:**

Name | Type |
------ | ------ |
`event?` | string \| symbol |

**Returns:** *this*

___

###  removeListener

▸ **removeListener**(`event`: string | symbol, `listener`: function): *this*

*Inherited from void*

*Overrides void*

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

*Inherited from void*

*Overrides void*

**Parameters:**

Name | Type |
------ | ------ |
`n` | number |

**Returns:** *this*

___

### `Static` listenerCount

▸ **listenerCount**(`emitter`: `EventEmitter`, `event`: string | symbol): *number*

*Inherited from void*

**`deprecated`** since v4.0.0

**Parameters:**

Name | Type |
------ | ------ |
`emitter` | `EventEmitter` |
`event` | string \| symbol |

**Returns:** *number*