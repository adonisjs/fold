> **[@adonisjs/fold](../README.md)**

[Globals](../README.md) / [@adonisjs/fold](../modules/_adonisjs_fold.md) / [Tracer](_adonisjs_fold.tracer.md) /

# Class: Tracer

Tracer is used to emit event from the IoC container
at different steps. Read the guides to understand
how tracer works

## Hierarchy

* `internal`

  * **Tracer**

## Implements

* [TracerContract](../interfaces/_adonisjs_fold.tracercontract.md)

### Index

#### Classes

* [EventEmitter](_adonisjs_fold.tracer.eventemitter.md)

#### Methods

* [addListener](_adonisjs_fold.tracer.md#addlistener)
* [emit](_adonisjs_fold.tracer.md#emit)
* [eventNames](_adonisjs_fold.tracer.md#eventnames)
* [getMaxListeners](_adonisjs_fold.tracer.md#getmaxlisteners)
* [in](_adonisjs_fold.tracer.md#in)
* [listenerCount](_adonisjs_fold.tracer.md#listenercount)
* [listeners](_adonisjs_fold.tracer.md#listeners)
* [off](_adonisjs_fold.tracer.md#off)
* [on](_adonisjs_fold.tracer.md#on)
* [once](_adonisjs_fold.tracer.md#once)
* [out](_adonisjs_fold.tracer.md#out)
* [prependListener](_adonisjs_fold.tracer.md#prependlistener)
* [prependOnceListener](_adonisjs_fold.tracer.md#prependoncelistener)
* [rawListeners](_adonisjs_fold.tracer.md#rawlisteners)
* [removeAllListeners](_adonisjs_fold.tracer.md#removealllisteners)
* [removeListener](_adonisjs_fold.tracer.md#removelistener)
* [setMaxListeners](_adonisjs_fold.tracer.md#setmaxlisteners)
* [once](_adonisjs_fold.tracer.md#static-once)

## Methods

###  addListener

▸ **addListener**(`event`: string | symbol, `listener`: function): *this*

*Inherited from void*

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

*Implementation of [TracerContract](../interfaces/_adonisjs_fold.tracercontract.md)*

*Inherited from void*

**Parameters:**

Name | Type |
------ | ------ |
`event` | string \| symbol |
`...args` | any[] |

**Returns:** *boolean*

___

###  eventNames

▸ **eventNames**(): *`Array<string | symbol>`*

*Implementation of [TracerContract](../interfaces/_adonisjs_fold.tracercontract.md)*

*Inherited from void*

**Returns:** *`Array<string | symbol>`*

___

###  getMaxListeners

▸ **getMaxListeners**(): *number*

*Implementation of [TracerContract](../interfaces/_adonisjs_fold.tracercontract.md)*

*Inherited from void*

**Returns:** *number*

___

###  in

▸ **in**(`namespace`: string, `cached`: boolean): *void*

*Implementation of [TracerContract](../interfaces/_adonisjs_fold.tracercontract.md)*

**Parameters:**

Name | Type |
------ | ------ |
`namespace` | string |
`cached` | boolean |

**Returns:** *void*

___

###  listenerCount

▸ **listenerCount**(`type`: string | symbol): *number*

*Implementation of [TracerContract](../interfaces/_adonisjs_fold.tracercontract.md)*

*Inherited from void*

**Parameters:**

Name | Type |
------ | ------ |
`type` | string \| symbol |

**Returns:** *number*

___

###  listeners

▸ **listeners**(`event`: string | symbol): *`Function`[]*

*Implementation of [TracerContract](../interfaces/_adonisjs_fold.tracercontract.md)*

*Inherited from void*

**Parameters:**

Name | Type |
------ | ------ |
`event` | string \| symbol |

**Returns:** *`Function`[]*

___

###  off

▸ **off**(`event`: string | symbol, `listener`: function): *this*

*Inherited from void*

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

*Implementation of [TracerContract](../interfaces/_adonisjs_fold.tracercontract.md)*

**Returns:** *void*

___

###  prependListener

▸ **prependListener**(`event`: string | symbol, `listener`: function): *this*

*Inherited from void*

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

*Implementation of [TracerContract](../interfaces/_adonisjs_fold.tracercontract.md)*

*Inherited from void*

**Parameters:**

Name | Type |
------ | ------ |
`event` | string \| symbol |

**Returns:** *`Function`[]*

___

###  removeAllListeners

▸ **removeAllListeners**(`event?`: string | symbol): *this*

*Implementation of [TracerContract](../interfaces/_adonisjs_fold.tracercontract.md)*

*Inherited from void*

**Parameters:**

Name | Type |
------ | ------ |
`event?` | string \| symbol |

**Returns:** *this*

___

###  removeListener

▸ **removeListener**(`event`: string | symbol, `listener`: function): *this*

*Inherited from void*

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

*Implementation of [TracerContract](../interfaces/_adonisjs_fold.tracercontract.md)*

*Inherited from void*

**Parameters:**

Name | Type |
------ | ------ |
`n` | number |

**Returns:** *this*

___

### `Static` once

▸ **once**(`emitter`: `EventEmitter`, `event`: string | symbol): *`Promise<any[]>`*

**Parameters:**

Name | Type |
------ | ------ |
`emitter` | `EventEmitter` |
`event` | string \| symbol |

**Returns:** *`Promise<any[]>`*