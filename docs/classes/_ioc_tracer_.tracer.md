> **[@adonisjs/fold](../README.md)**

[Globals](../README.md) / ["Ioc/Tracer"](../modules/_ioc_tracer_.md) / [Tracer](_ioc_tracer_.tracer.md) /

# Class: Tracer

Tracer is used to emit event from the IoC container
at different steps. Read the guides to understand
how tracer works

## Hierarchy

* `internal`

  * **Tracer**

## Implements

* [TracerContract](../interfaces/_contracts_index_.tracercontract.md)

## Index

### Classes

* [EventEmitter](_ioc_tracer_.tracer.eventemitter.md)

### Methods

* [addListener](_ioc_tracer_.tracer.md#addlistener)
* [emit](_ioc_tracer_.tracer.md#emit)
* [eventNames](_ioc_tracer_.tracer.md#eventnames)
* [getMaxListeners](_ioc_tracer_.tracer.md#getmaxlisteners)
* [in](_ioc_tracer_.tracer.md#in)
* [listenerCount](_ioc_tracer_.tracer.md#listenercount)
* [listeners](_ioc_tracer_.tracer.md#listeners)
* [off](_ioc_tracer_.tracer.md#off)
* [on](_ioc_tracer_.tracer.md#on)
* [once](_ioc_tracer_.tracer.md#once)
* [out](_ioc_tracer_.tracer.md#out)
* [prependListener](_ioc_tracer_.tracer.md#prependlistener)
* [prependOnceListener](_ioc_tracer_.tracer.md#prependoncelistener)
* [rawListeners](_ioc_tracer_.tracer.md#rawlisteners)
* [removeAllListeners](_ioc_tracer_.tracer.md#removealllisteners)
* [removeListener](_ioc_tracer_.tracer.md#removelistener)
* [setMaxListeners](_ioc_tracer_.tracer.md#setmaxlisteners)
* [once](_ioc_tracer_.tracer.md#static-once)

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

*Implementation of [TracerContract](../interfaces/_contracts_index_.tracercontract.md)*

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

*Implementation of [TracerContract](../interfaces/_contracts_index_.tracercontract.md)*

*Inherited from void*

**Returns:** *`Array<string | symbol>`*

___

###  getMaxListeners

▸ **getMaxListeners**(): *number*

*Implementation of [TracerContract](../interfaces/_contracts_index_.tracercontract.md)*

*Inherited from void*

**Returns:** *number*

___

###  in

▸ **in**(`namespace`: string, `cached`: boolean): *void*

*Implementation of [TracerContract](../interfaces/_contracts_index_.tracercontract.md)*

**Parameters:**

Name | Type |
------ | ------ |
`namespace` | string |
`cached` | boolean |

**Returns:** *void*

___

###  listenerCount

▸ **listenerCount**(`type`: string | symbol): *number*

*Implementation of [TracerContract](../interfaces/_contracts_index_.tracercontract.md)*

*Inherited from void*

**Parameters:**

Name | Type |
------ | ------ |
`type` | string \| symbol |

**Returns:** *number*

___

###  listeners

▸ **listeners**(`event`: string | symbol): *`Function`[]*

*Implementation of [TracerContract](../interfaces/_contracts_index_.tracercontract.md)*

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

*Implementation of [TracerContract](../interfaces/_contracts_index_.tracercontract.md)*

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

*Implementation of [TracerContract](../interfaces/_contracts_index_.tracercontract.md)*

*Inherited from void*

**Parameters:**

Name | Type |
------ | ------ |
`event` | string \| symbol |

**Returns:** *`Function`[]*

___

###  removeAllListeners

▸ **removeAllListeners**(`event?`: string | symbol): *this*

*Implementation of [TracerContract](../interfaces/_contracts_index_.tracercontract.md)*

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

*Implementation of [TracerContract](../interfaces/_contracts_index_.tracercontract.md)*

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