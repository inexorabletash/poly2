polyfill - JavaScript and Web Polyfills
=======================================

This is a collection of polyfills covering web platform features, from those defined as part of the ECMAScript standard to new web browser functionality. Most are for features shipping in major browsers. A few are experimental and called out as such, subject to change at any time.

My philosophy is that it's better to write future-looking code that takes advantage of new Web platform APIs where possible, and fill in the gaps with polyfills. There is no effort to produce 100% compliant behavior, or to completely hide differences in browser behavior.

I use these in various pages on my sites; most are by me, or I have at least tweaked them. A more comprehensive list of polyfills can be found at [The All-In-One Entirely-Not-Alphabetical No-Bullshit Guide to HTML5 Fallbacks](https://github.com/Modernizr/Modernizr/wiki/HTML5-Cross-browser-Polyfills) by Paul Irish.

### Getting the Code ###

You're already here! Great, just download it, or use:

[git](https://git-scm.com/): `git clone https://github.com/inexorabletash/polyfill.git`

[bower](http://bower.io/): `bower install js-polyfills`

[npm](https://www.npmjs.com/): `npm install js-polyfills`

> It is *not* packaged as Node.js module(s); there's nothing to `require()`, this is just for distribution.

Or just include scripts directly in your page via CDN (c/o [RawGit](https://rawgit.com/)):

    <script src="https://cdn.rawgit.com/inexorabletash/polyfill/$TAGNAME/polyfill.min.js"></script>

(look at [Releases](https://github.com/inexorabletash/polyfill/releases) for the tag name, e.g. "v1.2.3")

### Files ###

The polyfills are roughly split up into files matching 1:1 with Web standards (specifications, living standards documents, etc). So there is [dom.js](dom.js) for [DOM](https://dom.spec.whatwg.org), etc.

Since I generally use several in my hobby projects, bundled/minified versions are available:

* [web.js](web.js) (minified: [web.min.js](web.min.js)) includes the most common Web polyfills - it assumes ES2015 support
  * Includes: [dom.js](dom.js) [url.js](url.js) [fetch.js](fetch.js)
* [polyfill.js](polyfill.js) (minified: [polyfill.min.js](polyfill.min.js)) has everything in [web.js](web.js) plus [es6.js](es6.js) and [es2016.js](es2016.js) and [es2017.js](es2017.js)

Minification is done via https://github.com/mishoo/UglifyJS2

> Some of the files use `console.assert()` calls to catch bugs during development. These are
> automatically removed from the included minified versions. If you use your own minifying
> processor it may cause to assertions to appear when unnecessary function names are stripped.
> You can safely remove these lines as part of a build step (e.g. using `grep -V`), or use a
> minifier that does this automatically. For [UglifyJS2](https://github.com/mishoo/UglifyJS2)
> the option is: `drop_console`


ECMAScript / JavaScript Polyfills
---------------------------------

[ECMAScript 2015](es6.md) - Previous standard, supported by browsers circa 2016.

[ECMAScript 2016](es2016.md) - Previous standard, supported by browsers circa 2017.

[ECMAScript 2017](es2017.md) - Most recent standard. Implementation in progress or complete in latest browsers.

[ECMAScript proposed](experimental/es-proposed.md) - Proposals for future editions of the standard. Here there be dragons.


HTML
----
[script](html.js) -
[tests](https://inexorabletash.github.io/polyfill/tests/html.html) -
[living standard](https://html.spec.whatwg.org)



DOM
---
[script](dom.js) -
[tests](https://inexorabletash.github.io/polyfill/tests/dom.html) -
[living standard](https://dom.spec.whatwg.org)

* Element: `matches(selectors)` [spec](https://dom.spec.whatwg.org/#dom-element-matches), `closest(selectors)` [spec](https://dom.spec.whatwg.org/#dom-element-closest)
* [Custom Events](https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent/CustomEvent)
* [DOMTokenList](https://dom.spec.whatwg.org/#interface-domtokenlist): `toggle(token, force)` [spec](https://dom.spec.whatwg.org/#dom-domtokenlist-toggle)
* [ParentNode](https://dom.spec.whatwg.org/#interface-parentnode): `node.prepend(nodes...)`, `node.append(nodes...)`
* [ChildNode](https://dom.spec.whatwg.org/#interface-childnode): `node.before(nodes...)` , `node.after(nodes...)` , `node.replaceWith(nodes...)` , `node.remove()`

Fetch
-----
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


URL API
-------
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


Uncommon Polyfills
==================

The following are of limited use and are *not* included in the `web.js` / `polyfill.js` bundled versions.

Keyboard Events
---------------
[script](keyboard.js) -
[demo page](https://inexorabletash.github.io/polyfill/demos/keyboard.html) -
[draft spec](https://w3c.github.io/uievents/)

KeyboardEvent: `code`, `key`, `location`

[more details](keyboard.md)


Obsolete
--------
[Obsolete and Unmaintained Polyfills](obsolete/README.md)
