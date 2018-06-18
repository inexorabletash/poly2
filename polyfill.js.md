Polyfill Bundle
---------------
[script](polyfill.js)

Bundled together; nearly every page I create needs at least some of
these. For IE, requires IE11 or later.

This bundles includes:

* ECMAScript      [script](ecmascript.js) - [draft](https://tc39.github.io/ecma262/)
* DOM             [script](dom.js)    - [living standard](https://dom.spec.whatwg.org)
* Fetch           [script](fetch.js)  - [living standard](https://fetch.spec.whatwg.org)
* URL             [script](url.js)    - [living standard](https://url.spec.whatwg.org)

polyfill.min.js is a minimized version, c/o https://github.com/mishoo/UglifyJS2
