# ECMAScript 2015+ Polyfill

[script](ecmascript.js) -
[tests](https://inexorabletash.github.io/polyfill/tests/ecmascript.html)
[standard](http://www.ecma-international.org/ecma-262/)

These assume ECMAScript 5 support plus native TypedArrays (i.e. IE11 or newer browsers).

#### Fundamental Objects
* Object: `assign()`, `entries()`, `getOwnPropertyDescriptors()`, `is()`, `setPrototypeOf()`, `values()`
* Symbol: `Symbol(description)`, `Symbol.for()`, `Symbol.keyFor()`, `Symbol.iterator`, `Symbol.toStringTag`
  * No security, just creates an object with a unique string representation. `typeof Symbol()` will incorrectly report `"object"` but `Symbol() instanceof Symbol` will return `true`. Used primarily for iterator protocols.
* Not supported: `Function.prototype.toMethod()`

#### Numbers and Dates
* Number: `EPILON`, `isFinite()`, `isInteger()`, `isNaN()`, `isSafeInteger()`, `MAX_SAFE_INTEGER`, `MIN_SAFE_INTEGER`, `parseFloat()`, `parseInt()`
* Math: `acosh()`, `asinh()`, `atanh()`, `cbrt()`, `clz32()`, `cosh()`, `expm1()`, `fround`, `hypot()`, `imul()`, `log1p()`, `log10()`, `log2()`, `sign()`, `sinh()`, `tanh()`, `trunc()`

#### Text Processing
* String: `fromCodePoint()`, `raw`
* String prototype: `codePointAt()`, `endsWith()`, `includes()`, `padEnd()`, `padStart()`, `repeat()`, `startsWith()`, `[@@iterator]()`
  * Not supported: `String.prototype.normalize()` - see https://github.com/walling/unorm/
* RegExp prototype: `@@match()`, `@@replace()`, `@@search()`, `@@split()`, `flags`
* String.prototype `match()`, `replace()`, `search()`, and `split()` dispatch through RegExp symbol methods

#### Indexed Collections
* Array: `from()`, `of()`
* Array prototype: `copyWithin()`, `entries()`, `fill()`, `find()`, `findIndex()`, `includes()`, `keys()`, `values()`, `[@@iterator]()`
* _TypedArray_
* %TypedArray% prototype: `from()`, `of()`
* %TypedArray% prototype: `copyWithin()`, `entries()`, `every()`, `fill()`, `filter()`, `find()`, `findIndex()`, `forEach()`, `indexOf()`, `join()`, `keys()`, `lastIndexOf()`, `map()`, `reduce()`, `reduceRight()`, `reverse()`, `slice()`, `some()`, `sort()`, `values()`, `[@@iterator]()`

#### Keyed Collections
* Map: `clear()`, `delete()`, `entries()`, `forEach()`, `get()`, `keys()`, `has()`, `set()`, `size`, `values()`, `[@@iterator]()`
* Set: `add()`, `clear()`, `delete()`, `entries()`, `forEach()`, `has()`, `size`, `values()`, `[@@iterator]()`
* WeakMap: `clear()`, `delete()`, `get()`, `has()`, `set()`
* WeakSet: `add()`, `clear()`, `delete()`, `has()`
  * WeakMap and WeakSet are intrusive and modify the `valueOf` property of keys

#### Asynchronous Programming
* Promise: `Promise.resolve()`, `Promise.reject()`, `Promise.cast()`, `Promise.race()`, `Promise.all()`
* Promise prototype: `catch()`, `finally()`, `then()`
