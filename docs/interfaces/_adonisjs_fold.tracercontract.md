[@adonisjs/fold](../README.md) > [@adonisjs/fold](../modules/_adonisjs_fold.md) > [TracerContract](../interfaces/_adonisjs_fold.tracercontract.md)

# Interface: TracerContract

## Hierarchy

 `EventEmitter`

**↳ TracerContract**

## Implemented by

* [Tracer](../classes/_adonisjs_fold.tracer.md)

## Index

### Properties

* [defaultMaxListeners](_adonisjs_fold.tracercontract.md#defaultmaxlisteners)

### Methods

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
* [listenerCount](_adonisjs_fold.tracercontract.md#listenercount-1)

---

## Properties

<a id="defaultmaxlisteners"></a>

### `<Static>` defaultMaxListeners

**● defaultMaxListeners**: *`number`*

___

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
<a id="listenercount-1"></a>

### `<Static>` listenerCount

▸ **listenerCount**(emitter: *`EventEmitter`*, event: *`string` \| `symbol`*): `number`

*__deprecated__*: since v4.0.0

**Parameters:**

| Name | Type |
| ------ | ------ |
| emitter | `EventEmitter` |
| event | `string` \| `symbol` |

**Returns:** `number`

___

