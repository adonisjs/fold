[@adonisjs/fold](../README.md) > [@adonisjs/fold](../modules/_adonisjs_fold.md) > [Tracer](../classes/_adonisjs_fold.tracer.md)

# Class: Tracer

Tracer is used to emit event from the IoC container at different steps. Read the guides to understand how tracer works

## Hierarchy

 `internal`

**↳ Tracer**

## Implements

* [TracerContract](../interfaces/_adonisjs_fold.tracercontract.md)

## Index

### Classes

* [EventEmitter](_adonisjs_fold.tracer.eventemitter.md)

### Methods

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
* [once](_adonisjs_fold.tracer.md#once-1)

---

## Methods

<a id="addlistener"></a>

###  addListener

▸ **addListener**(event: *`string` \| `symbol`*, listener: *`function`*): `this`

**Parameters:**

| Name | Type |
| ------ | ------ |
| event | `string` \| `symbol` |
| listener | `function` |

**Returns:** `this`

___
<a id="emit"></a>

###  emit

▸ **emit**(event: *`string` \| `symbol`*, ...args: *`any`[]*): `boolean`

**Parameters:**

| Name | Type |
| ------ | ------ |
| event | `string` \| `symbol` |
| `Rest` args | `any`[] |

**Returns:** `boolean`

___
<a id="eventnames"></a>

###  eventNames

▸ **eventNames**(): `Array`<`string` \| `symbol`>

**Returns:** `Array`<`string` \| `symbol`>

___
<a id="getmaxlisteners"></a>

###  getMaxListeners

▸ **getMaxListeners**(): `number`

**Returns:** `number`

___
<a id="in"></a>

###  in

▸ **in**(namespace: *`string`*, cached: *`boolean`*): `void`

**Parameters:**

| Name | Type |
| ------ | ------ |
| namespace | `string` |
| cached | `boolean` |

**Returns:** `void`

___
<a id="listenercount"></a>

###  listenerCount

▸ **listenerCount**(type: *`string` \| `symbol`*): `number`

**Parameters:**

| Name | Type |
| ------ | ------ |
| type | `string` \| `symbol` |

**Returns:** `number`

___
<a id="listeners"></a>

###  listeners

▸ **listeners**(event: *`string` \| `symbol`*): `Function`[]

**Parameters:**

| Name | Type |
| ------ | ------ |
| event | `string` \| `symbol` |

**Returns:** `Function`[]

___
<a id="off"></a>

###  off

▸ **off**(event: *`string` \| `symbol`*, listener: *`function`*): `this`

**Parameters:**

| Name | Type |
| ------ | ------ |
| event | `string` \| `symbol` |
| listener | `function` |

**Returns:** `this`

___
<a id="on"></a>

###  on

▸ **on**(event: *`string` \| `symbol`*, listener: *`function`*): `this`

**Parameters:**

| Name | Type |
| ------ | ------ |
| event | `string` \| `symbol` |
| listener | `function` |

**Returns:** `this`

___
<a id="once"></a>

###  once

▸ **once**(event: *`string` \| `symbol`*, listener: *`function`*): `this`

**Parameters:**

| Name | Type |
| ------ | ------ |
| event | `string` \| `symbol` |
| listener | `function` |

**Returns:** `this`

___
<a id="out"></a>

###  out

▸ **out**(): `void`

**Returns:** `void`

___
<a id="prependlistener"></a>

###  prependListener

▸ **prependListener**(event: *`string` \| `symbol`*, listener: *`function`*): `this`

**Parameters:**

| Name | Type |
| ------ | ------ |
| event | `string` \| `symbol` |
| listener | `function` |

**Returns:** `this`

___
<a id="prependoncelistener"></a>

###  prependOnceListener

▸ **prependOnceListener**(event: *`string` \| `symbol`*, listener: *`function`*): `this`

**Parameters:**

| Name | Type |
| ------ | ------ |
| event | `string` \| `symbol` |
| listener | `function` |

**Returns:** `this`

___
<a id="rawlisteners"></a>

###  rawListeners

▸ **rawListeners**(event: *`string` \| `symbol`*): `Function`[]

**Parameters:**

| Name | Type |
| ------ | ------ |
| event | `string` \| `symbol` |

**Returns:** `Function`[]

___
<a id="removealllisteners"></a>

###  removeAllListeners

▸ **removeAllListeners**(event?: *`string` \| `symbol`*): `this`

**Parameters:**

| Name | Type |
| ------ | ------ |
| `Optional` event | `string` \| `symbol` |

**Returns:** `this`

___
<a id="removelistener"></a>

###  removeListener

▸ **removeListener**(event: *`string` \| `symbol`*, listener: *`function`*): `this`

**Parameters:**

| Name | Type |
| ------ | ------ |
| event | `string` \| `symbol` |
| listener | `function` |

**Returns:** `this`

___
<a id="setmaxlisteners"></a>

###  setMaxListeners

▸ **setMaxListeners**(n: *`number`*): `this`

**Parameters:**

| Name | Type |
| ------ | ------ |
| n | `number` |

**Returns:** `this`

___
<a id="once-1"></a>

### `<Static>` once

▸ **once**(emitter: *`EventEmitter`*, event: *`string` \| `symbol`*): `Promise`<`any`[]>

**Parameters:**

| Name | Type |
| ------ | ------ |
| emitter | `EventEmitter` |
| event | `string` \| `symbol` |

**Returns:** `Promise`<`any`[]>

___

