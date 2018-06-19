# poly2 - JavaScript and Web Polyfills

This is a collection of polyfills covering web platform features, from
those defined as part of the ECMAScript standard to new web browser
functionality. Most are for features shipping in major browsers. A few
are experimental and called out as such, subject to change at any
time.

This is a fork of my previous
[polyfill collection](https://github.com/inexorabletash/polyfill)
because I no longer need to support older versions of IE (prior to IE
11). Older versions of IE are not supported.

All polyfills assume ECMAScript 5 support plus native TypedArrays
(IE11 or newer browsers).

### Getting the Code

You're already here! Great, just download it, or use:

[git](https://git-scm.com/): `git clone https://github.com/inexorabletash/polyfill.git`

_What about NPM or other package management systems?_

Nope. Not interested. Too much work for no personal benefit since I don't use them.

### Files

The polyfills are roughly split up into files matching 1:1 with Web
standards (specifications, living standards documents, etc). So there
is [dom.js](dom.js) for [DOM](https://dom.spec.whatwg.org), etc.

Since I generally use several in my hobby projects, a bundled/minified
version is available:

[polyfill.js](polyfill.js) (minified: [polyfill.min.js](polyfill.min.js)) includes:
* Web polyfills: [dom.js](dom.js) [url.js](url.js) [fetch.js](fetch.js)
* ECMAScript:  [ecmascript.js](ecmascript.js)

Minification is done via https://github.com/mishoo/UglifyJS2

> Some of the files use `console.assert()` calls to catch bugs during development. These are
> automatically removed from the included minified versions. If you use your own minifying
> processor it may cause to assertions to appear when unnecessary function names are stripped.
> You can safely remove these lines as part of a build step (e.g. using `grep -V`), or use a
> minifier that does this automatically. For [UglifyJS2](https://github.com/mishoo/UglifyJS2)
> the option is: `drop_console`


## Main Polyfills

## ECMAScript / JavaScript Polyfills

[script](ecmascript.js) -
[tests](https://inexorabletash.github.io/polyfill/tests/ecmascript.html)
[standard](http://www.ecma-international.org/ecma-262/)

See also: [ECMAScript proposed](experimental/es-proposed.md) - Proposals for future editions of the standard. Here there be dragons.

### Fundamental Objects
* Object: `assign()`, `entries()`, `getOwnPropertyDescriptors()`, `is()`, `setPrototypeOf()`, `values()`
* Symbol: `Symbol(description)`, `Symbol.for()`, `Symbol.keyFor()`, `Symbol.iterator`, `Symbol.toStringTag`
  * No security, just creates an object with a unique string representation. `typeof Symbol()` will incorrectly report `"object"` but `Symbol() instanceof Symbol` will return `true`. Used primarily for iterator protocols.
* Not supported: `Function.prototype.toMethod()`

### Numbers and Dates
* Number: `EPILON`, `isFinite()`, `isInteger()`, `isNaN()`, `isSafeInteger()`, `MAX_SAFE_INTEGER`, `MIN_SAFE_INTEGER`, `parseFloat()`, `parseInt()`
* Math: `acosh()`, `asinh()`, `atanh()`, `cbrt()`, `clz32()`, `cosh()`, `expm1()`, `fround`, `hypot()`, `imul()`, `log1p()`, `log10()`, `log2()`, `sign()`, `sinh()`, `tanh()`, `trunc()`

### Text Processing
* String: `fromCodePoint()`, `raw`
* String prototype: `codePointAt()`, `endsWith()`, `includes()`, `padEnd()`, `padStart()`, `repeat()`, `startsWith()`, `[@@iterator]()`
  * Not supported: `String.prototype.normalize()` - see https://github.com/walling/unorm/
* RegExp prototype: `@@match()`, `@@replace()`, `@@search()`, `@@split()`, `flags`
* String.prototype `match()`, `replace()`, `search()`, and `split()` dispatch through RegExp symbol methods

### Indexed Collections
* Array: `from()`, `of()`
* Array prototype: `copyWithin()`, `entries()`, `fill()`, `find()`, `findIndex()`, `includes()`, `keys()`, `values()`, `[@@iterator]()`
* %TypedArray% prototype: `from()`, `of()`
* %TypedArray% prototype: `copyWithin()`, `entries()`, `every()`, `fill()`, `filter()`, `find()`, `findIndex()`, `forEach()`, `indexOf()`, `join()`, `keys()`, `lastIndexOf()`, `map()`, `reduce()`, `reduceRight()`, `reverse()`, `slice()`, `some()`, `sort()`, `values()`, `[@@iterator]()`

### Keyed Collections
* Map: `clear()`, `delete()`, `entries()`, `forEach()`, `get()`, `keys()`, `has()`, `set()`, `size`, `values()`, `[@@iterator]()`
* Set: `add()`, `clear()`, `delete()`, `entries()`, `forEach()`, `has()`, `size`, `values()`, `[@@iterator]()`
* WeakSet: `add()`, `clear()`, `delete()`, `has()`

### Asynchronous Programming
* Promise: `all()`, `race()`,`resolve()`, `reject()`
* Promise prototype: `catch()`, `finally()`, `then()`


## Web Polyfills

### DOM

[script](dom.js) -
[tests](https://inexorabletash.github.io/polyfill/tests/dom.html) -
[living standard](https://dom.spec.whatwg.org)

* [Element](https://dom.spec.whatwg.org/#interface-element): `matches(selectors)`, `closest(selectors)`
* [DOMTokenList](https://dom.spec.whatwg.org/#interface-domtokenlist): `toggle(token, force)`
* [ParentNode](https://dom.spec.whatwg.org/#interface-parentnode): `prepend(nodes...)`, `append(nodes...)`
* [ChildNode](https://dom.spec.whatwg.org/#interface-childnode): `before(nodes...)` , `after(nodes...)` , `replaceWith(nodes...)` , `remove()`
* [CustomEvents](https://dom.spec.whatwg.org/#interface-customevent)

### Fetch

[script](fetch.js) -
[tests](https://inexorabletash.github.io/polyfill/tests/fetch.html) -
[living standard](https://fetch.spec.whatwg.org)

Example:

```js
fetch('http://example.com/foo.json')
  .then(function(response) { return response.json(); })
  .then(function(data) { console.log(data); });
```

Supported:
* Headers: `new Headers()`, `append(name, value)`, `delete(name)`, `get(name)`, `getAll(name)`, `has(name)`, `set(name, value)`, `[Symbol.iterator]()`
* Body: `arrayBuffer()`, `blob()`, `formData()`, `json()`, `text()` - but conversions are limited
* Request: `new Request(input, init)`, `method`, `headers`, `body`, `url`
* Response: `new Response(body, init)`, `headers`, `url`, `status`, `statusText`, `body`
* `fetch(input, init)`

### URL API

[script](url.js) -
[tests](https://inexorabletash.github.io/polyfill/tests/url.html) -
[living standard](https://url.spec.whatwg.org/)

```javascript
var url = new URL(url, base);
var value = url.searchParams.get(name);
var valueArray = url.searchParams.getAll(name);
url.searchParams.append(name, valueOrValues);
url.searchParams.delete(name);

var p = new URLSearchParams('a=1&b=2');
```

* URL: `href`, `origin`, `protocol`, `username`, `password`, `host`, `hostname`, `port`, `pathname`, `search`, `searchParams`, `hash`
* URLSearchParams: `append(name, value)`, `delete(name)`, `get(name)`, `getAll(name)`, `has(name)`, `set(name, value)`, `entries()`, `keys()`, `values()`, `forEach(callback)` and `[Symbol.iterator]()` (if defined)


## Uncommon Polyfills

The following are of limited use and are *not* included in the `polyfill.js` bundle.

### Keyboard Events

[script](keyboard.js) -
[demo page](https://inexorabletash.github.io/polyfill/demos/keyboard.html) -
[draft spec](https://w3c.github.io/uievents/)

KeyboardEvent: `code`, `key`, `location`

[more details](keyboard.md)
