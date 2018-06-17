// Composited file - DO NOT EDIT
(function(global) {
  'use strict';
  if (!('window' in global && 'document' in global))
    return;

  //----------------------------------------------------------------------
  //
  // DOM
  // https://dom.spec.whatwg.org/
  //
  //----------------------------------------------------------------------

  // CustomEvent
  // https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent/CustomEvent
  // Needed for: IE11-
  (function () {
    if ('CustomEvent' in global && typeof global.CustomEvent === "function")
      return;
    function CustomEvent ( event, params ) {
      params = params || { bubbles: false, cancelable: false, detail: undefined };
      var evt = document.createEvent( 'CustomEvent' );
      evt.initCustomEvent( event, params.bubbles, params.cancelable, params.detail );
      return evt;
    }
    CustomEvent.prototype = global.Event.prototype;
    global.CustomEvent = CustomEvent;
  })();


  // DOMTokenList
  // Add second argument to native DOMTokenList.toggle() if necessary
  // https://dom.spec.whatwg.org/#dom-domtokenlist-toggle
  (function() {
    if (!('DOMTokenList' in global)) return;
    var e = document.createElement('span');
    if (!('classList' in e)) return;
    e.classList.toggle('x', false);
    if (!e.classList.contains('x')) return;
    global.DOMTokenList.prototype.toggle = function toggle(token/*, force*/) {
      var force = arguments[1];
      if (force === undefined) {
        var add = !this.contains(token);
        this[add ? 'add' : 'remove'](token);
        return add;
      }
      force = !!force;
      this[force ? 'add' : 'remove'](token);
      return force;
    };
  }());

  // Element.matches(selectors)

  // Needed for: IE, Firefox 3.6, early Webkit and Opera 15.0
  // Use msMatchesSelector(selector) for IE
  // Use oMatchesSelector(selector) for Opera 15.0
  // Use mozMatchesSelector(selector) for Firefox 3.6
  // Use webkitMatchesSelector(selector) for early Webkit
  // Use polyfill if no matches() support, but querySelectorAll() support
  if ('Element' in global && !Element.prototype.matches) {
    if (Element.prototype.msMatchesSelector) {
      Element.prototype.matches = Element.prototype.msMatchesSelector;
    } else if (Element.prototype.oMatchesSelector) {
      Element.prototype.matches = Element.prototype.oMatchesSelector;
    } else if (Element.prototype.mozMatchesSelector) {
      Element.prototype.matches = Element.prototype.mozMatchesSelector;
    } else if (Element.prototype.webkitMatchesSelector) {
      Element.prototype.matches = Element.prototype.webkitMatchesSelector;
    } else if (document.querySelectorAll) {
      Element.prototype.matches = function matches(selector) {
        var matches = (this.document || this.ownerDocument).querySelectorAll(selector),
            i = matches.length;
        while (--i >= 0 && matches.item(i) !== this) {}
        return i > -1;
      };
    }
  }

  // Element.closest(selectors)
  // https://dom.spec.whatwg.org/#dom-element-closest
  if (window.Element && !Element.prototype.closest) {
    Element.prototype.closest = function(s) {
      var matches = (this.document || this.ownerDocument).querySelectorAll(s),
          i,
          el = this;
      do {
        i = matches.length;
        while (--i >= 0 && matches.item(i) !== el) {};
      } while ((i < 0) && (el = el.parentElement));
      return el;
    };
  }

  function mixin(o, ps) {
    if (!o) return;
    Object.keys(ps).forEach(function(p) {
      if ((p in o) || (p in o.prototype)) return;
      Object.defineProperty(
        o.prototype,
        p,
        Object.getOwnPropertyDescriptor(ps, p)
      );
    });
  }

  // Mixin ParentNode
  // https://dom.spec.whatwg.org/#interface-parentnode

  function convertNodesIntoANode(nodes) {
    var node = null;
    nodes = nodes.map(function(node) {
      return !(node instanceof Node) ? document.createTextNode(node) : node;
    });
    if (nodes.length === 1) {
      node = nodes[0];
    } else {
      node = document.createDocumentFragment();
      nodes.forEach(function(n) { node.appendChild(n); });
    }
    return node;
  }

  var ParentNode = {
    prepend: function(/*...nodes*/) {
      var nodes = [].slice.call(arguments);
      nodes = convertNodesIntoANode(nodes);
      this.insertBefore(nodes, this.firstChild);
    },
    append: function(/*...nodes*/) {
      var nodes = [].slice.call(arguments);
      nodes = convertNodesIntoANode(nodes);
      this.appendChild(nodes);
    }
  };

  mixin(global.Document, ParentNode);
  mixin(global.DocumentFragment, ParentNode);
  mixin(global.Element, ParentNode);

  // Mixin ChildNode
  // https://dom.spec.whatwg.org/#interface-childnode

  var ChildNode = {
    before: function(/*...nodes*/) {
      var nodes = [].slice.call(arguments);
      var parent = this.parentNode;
      if (!parent) return;
      var viablePreviousSibling = this.previousSibling;
      while (nodes.indexOf(viablePreviousSibling) !== -1)
        viablePreviousSibling = viablePreviousSibling.previousSibling;
      var node = convertNodesIntoANode(nodes);
      parent.insertBefore(node, viablePreviousSibling ?
                          viablePreviousSibling.nextSibling : parent.firstChild);
    },
    after: function(/*...nodes*/) {
      var nodes = [].slice.call(arguments);
      var parent = this.parentNode;
      if (!parent) return;
      var viableNextSibling = this.nextSibling;
      while (nodes.indexOf(viableNextSibling) !== -1)
        viableNextSibling = viableNextSibling.nextSibling;
      var node = convertNodesIntoANode(nodes);
      parent.insertBefore(node, viableNextSibling);
    },
    replaceWith: function(/*...nodes*/) {
      var nodes = [].slice.call(arguments);
      var parent = this.parentNode;
      if (!parent) return;
      var viableNextSibling = this.nextSibling;
      while (nodes.indexOf(viableNextSibling) !== -1)
        viableNextSibling = viableNextSibling.nextSibling;
      var node = convertNodesIntoANode(nodes);

      if (this.parentNode === parent)
        parent.replaceChild(node, this);
      else
        parent.insertBefore(node, viableNextSibling);
    },
    remove: function() {
      if (!this.parentNode) return;
      this.parentNode.removeChild(this);
    }
  };

  mixin(global.DocumentType, ChildNode);
  mixin(global.Element, ChildNode);
  mixin(global.CharacterData, ChildNode);

}(self));
// URL Polyfill
// Draft specification: https://url.spec.whatwg.org

// Notes:
// - Primarily useful for parsing URLs and modifying query parameters
// - Should work in IE8+ and everything more modern

(function (global) {
  'use strict';

  function isSequence(o) {
    if (!o) return false;
    if ('Symbol' in global && 'iterator' in global.Symbol &&
        typeof o[Symbol.iterator] === 'function') return true;
    if (Array.isArray(o)) return true;
    return false;
  }

  function toArray(iter) {
    return ('from' in Array) ? Array.from(iter) : Array.prototype.slice.call(iter);
  }

  (function() {

    // Browsers may have:
    // * No global URL object
    // * URL with static methods only - may have a dummy constructor
    // * URL with members except searchParams
    // * Full URL API support
    var origURL = global.URL;
    var nativeURL;
    try {
      if (origURL) {
        nativeURL = new global.URL('http://example.com');
        if ('searchParams' in nativeURL)
          return;
        if (!('href' in nativeURL))
          nativeURL = undefined;
      }
    } catch (_) {}

    // NOTE: Doesn't do the encoding/decoding dance
    function urlencoded_serialize(pairs) {
      var output = '', first = true;
      pairs.forEach(function (pair) {
        var name = encodeURIComponent(pair.name);
        var value = encodeURIComponent(pair.value);
        if (!first) output += '&';
        output += name + '=' + value;
        first = false;
      });
      return output.replace(/%20/g, '+');
    }

    // NOTE: Doesn't do the encoding/decoding dance
    function urlencoded_parse(input, isindex) {
      var sequences = input.split('&');
      if (isindex && sequences[0].indexOf('=') === -1)
        sequences[0] = '=' + sequences[0];
      var pairs = [];
      sequences.forEach(function (bytes) {
        if (bytes.length === 0) return;
        var index = bytes.indexOf('=');
        if (index !== -1) {
          var name = bytes.substring(0, index);
          var value = bytes.substring(index + 1);
        } else {
          name = bytes;
          value = '';
        }
        name = name.replace(/\+/g, ' ');
        value = value.replace(/\+/g, ' ');
        pairs.push({ name: name, value: value });
      });
      var output = [];
      pairs.forEach(function (pair) {
        output.push({
          name: decodeURIComponent(pair.name),
          value: decodeURIComponent(pair.value)
        });
      });
      return output;
    }

    function URLUtils(url) {
      if (nativeURL)
        return new origURL(url);
      var anchor = document.createElement('a');
      anchor.href = url;
      return anchor;
    }

    function URLSearchParams(init) {
      var $this = this;
      this._list = [];

      if (init === undefined || init === null) {
        // no-op
      } else if (init instanceof URLSearchParams) {
        // In ES6 init would be a sequence, but special case for ES5.
        this._list = urlencoded_parse(String(init));
      } else if (typeof init === 'object' && isSequence(init)) {
        toArray(init).forEach(function(e) {
          if (!isSequence(e)) throw TypeError();
          var nv = toArray(e);
          if (nv.length !== 2) throw TypeError();
          $this._list.push({name: String(nv[0]), value: String(nv[1])});
        });
      } else if (typeof init === 'object' && init) {
        Object.keys(init).forEach(function(key) {
          $this._list.push({name: String(key), value: String(init[key])});
        });
      } else {
        init = String(init);
        if (init.substring(0, 1) === '?')
          init = init.substring(1);
        this._list = urlencoded_parse(init);
      }

      this._url_object = null;
      this._setList = function (list) { if (!updating) $this._list = list; };

      var updating = false;
      this._update_steps = function() {
        if (updating) return;
        updating = true;

        if (!$this._url_object) return;

        // Partial workaround for IE issue with 'about:'
        if ($this._url_object.protocol === 'about:' &&
            $this._url_object.pathname.indexOf('?') !== -1) {
          $this._url_object.pathname = $this._url_object.pathname.split('?')[0];
        }

        $this._url_object.search = urlencoded_serialize($this._list);

        updating = false;
      };
    }


    Object.defineProperties(URLSearchParams.prototype, {
      append: {
        value: function (name, value) {
          this._list.push({ name: name, value: value });
          this._update_steps();
        }, writable: true, enumerable: true, configurable: true
      },

      'delete': {
        value: function (name) {
          for (var i = 0; i < this._list.length;) {
            if (this._list[i].name === name)
              this._list.splice(i, 1);
            else
              ++i;
          }
          this._update_steps();
        }, writable: true, enumerable: true, configurable: true
      },

      get: {
        value: function (name) {
          for (var i = 0; i < this._list.length; ++i) {
            if (this._list[i].name === name)
              return this._list[i].value;
          }
          return null;
        }, writable: true, enumerable: true, configurable: true
      },

      getAll: {
        value: function (name) {
          var result = [];
          for (var i = 0; i < this._list.length; ++i) {
            if (this._list[i].name === name)
              result.push(this._list[i].value);
          }
          return result;
        }, writable: true, enumerable: true, configurable: true
      },

      has: {
        value: function (name) {
          for (var i = 0; i < this._list.length; ++i) {
            if (this._list[i].name === name)
              return true;
          }
          return false;
        }, writable: true, enumerable: true, configurable: true
      },

      set: {
        value: function (name, value) {
          var found = false;
          for (var i = 0; i < this._list.length;) {
            if (this._list[i].name === name) {
              if (!found) {
                this._list[i].value = value;
                found = true;
                ++i;
              } else {
                this._list.splice(i, 1);
              }
            } else {
              ++i;
            }
          }

          if (!found)
            this._list.push({ name: name, value: value });

          this._update_steps();
        }, writable: true, enumerable: true, configurable: true
      },

      entries: {
        value: function() { return new Iterator(this._list, 'key+value'); },
        writable: true, enumerable: true, configurable: true
      },

      keys: {
        value: function() { return new Iterator(this._list, 'key'); },
        writable: true, enumerable: true, configurable: true
      },

      values: {
        value: function() { return new Iterator(this._list, 'value'); },
        writable: true, enumerable: true, configurable: true
      },

      forEach: {
        value: function(callback) {
          var thisArg = (arguments.length > 1) ? arguments[1] : undefined;
          this._list.forEach(function(pair, index) {
            callback.call(thisArg, pair.value, pair.name);
          });

        }, writable: true, enumerable: true, configurable: true
      },

      toString: {
        value: function () {
          return urlencoded_serialize(this._list);
        }, writable: true, enumerable: false, configurable: true
      }
    });

    function Iterator(source, kind) {
      var index = 0;
      this['next'] = function() {
        if (index >= source.length)
          return {done: true, value: undefined};
        var pair = source[index++];
        return {done: false, value:
                kind === 'key' ? pair.name :
                kind === 'value' ? pair.value :
                [pair.name, pair.value]};
      };
    }

    if ('Symbol' in global && 'iterator' in global.Symbol) {
      Object.defineProperty(URLSearchParams.prototype, global.Symbol.iterator, {
        value: URLSearchParams.prototype.entries,
        writable: true, enumerable: true, configurable: true});
      Object.defineProperty(Iterator.prototype, global.Symbol.iterator, {
        value: function() { return this; },
        writable: true, enumerable: true, configurable: true});
    }

    function URL(url, base) {
      if (!(this instanceof global.URL))
        throw new TypeError("Failed to construct 'URL': Please use the 'new' operator.");

      if (base) {
        url = (function () {
          if (nativeURL) return new origURL(url, base).href;
          var iframe;
          try {
            var doc;
            // Use another document/base tag/anchor for relative URL resolution, if possible
            if (Object.prototype.toString.call(window.operamini) === "[object OperaMini]") {
              iframe = document.createElement('iframe');
              iframe.style.display = 'none';
              document.documentElement.appendChild(iframe);
              doc = iframe.contentWindow.document;
            } else if (document.implementation && document.implementation.createHTMLDocument) {
              doc = document.implementation.createHTMLDocument('');
            } else if (document.implementation && document.implementation.createDocument) {
              doc = document.implementation.createDocument('http://www.w3.org/1999/xhtml', 'html', null);
              doc.documentElement.appendChild(doc.createElement('head'));
              doc.documentElement.appendChild(doc.createElement('body'));
            } else if (window.ActiveXObject) {
              doc = new window.ActiveXObject('htmlfile');
              doc.write('<head><\/head><body><\/body>');
              doc.close();
            }

            if (!doc) throw Error('base not supported');

            var baseTag = doc.createElement('base');
            baseTag.href = base;
            doc.getElementsByTagName('head')[0].appendChild(baseTag);
            var anchor = doc.createElement('a');
            anchor.href = url;
            return anchor.href;
          } finally {
            if (iframe)
              iframe.parentNode.removeChild(iframe);
          }
        }());
      }

      // An inner object implementing URLUtils (either a native URL
      // object or an HTMLAnchorElement instance) is used to perform the
      // URL algorithms. With full ES5 getter/setter support, return a
      // regular object For IE8's limited getter/setter support, a
      // different HTMLAnchorElement is returned with properties
      // overridden

      var instance = URLUtils(url || '');

      // Detect for ES5 getter/setter support
      // (an Object.defineProperties polyfill that doesn't support getters/setters may throw)
      var ES5_GET_SET = (function() {
        if (!('defineProperties' in Object)) return false;
        try {
          var obj = {};
          Object.defineProperties(obj, { prop: { 'get': function () { return true; } } });
          return obj.prop;
        } catch (_) {
          return false;
        }
      })();

      var self = ES5_GET_SET ? this : document.createElement('a');



      var query_object = new URLSearchParams(
        instance.search ? instance.search.substring(1) : null);
      query_object._url_object = self;

      Object.defineProperties(self, {
        href: {
          get: function () { return instance.href; },
          set: function (v) { instance.href = v; tidy_instance(); update_steps(); },
          enumerable: true, configurable: true
        },
        origin: {
          get: function () {
            if ('origin' in instance) return instance.origin;
            return this.protocol + '//' + this.host;
          },
          enumerable: true, configurable: true
        },
        protocol: {
          get: function () { return instance.protocol; },
          set: function (v) { instance.protocol = v; },
          enumerable: true, configurable: true
        },
        username: {
          get: function () { return instance.username; },
          set: function (v) { instance.username = v; },
          enumerable: true, configurable: true
        },
        password: {
          get: function () { return instance.password; },
          set: function (v) { instance.password = v; },
          enumerable: true, configurable: true
        },
        host: {
          get: function () {
            // IE returns default port in |host|
            var re = {'http:': /:80$/, 'https:': /:443$/, 'ftp:': /:21$/}[instance.protocol];
            return re ? instance.host.replace(re, '') : instance.host;
          },
          set: function (v) { instance.host = v; },
          enumerable: true, configurable: true
        },
        hostname: {
          get: function () { return instance.hostname; },
          set: function (v) { instance.hostname = v; },
          enumerable: true, configurable: true
        },
        port: {
          get: function () { return instance.port; },
          set: function (v) { instance.port = v; },
          enumerable: true, configurable: true
        },
        pathname: {
          get: function () {
            // IE does not include leading '/' in |pathname|
            if (instance.pathname.charAt(0) !== '/') return '/' + instance.pathname;
            return instance.pathname;
          },
          set: function (v) { instance.pathname = v; },
          enumerable: true, configurable: true
        },
        search: {
          get: function () { return instance.search; },
          set: function (v) {
            if (instance.search === v) return;
            instance.search = v; tidy_instance(); update_steps();
          },
          enumerable: true, configurable: true
        },
        searchParams: {
          get: function () { return query_object; },
          enumerable: true, configurable: true
        },
        hash: {
          get: function () { return instance.hash; },
          set: function (v) { instance.hash = v; tidy_instance(); },
          enumerable: true, configurable: true
        },
        toString: {
          value: function() { return instance.toString(); },
          enumerable: false, configurable: true
        },
        valueOf: {
          value: function() { return instance.valueOf(); },
          enumerable: false, configurable: true
        }
      });

      function tidy_instance() {
        var href = instance.href.replace(/#$|\?$|\?(?=#)/g, '');
        if (instance.href !== href)
          instance.href = href;
      }

      function update_steps() {
        query_object._setList(instance.search ? urlencoded_parse(instance.search.substring(1)) : []);
        query_object._update_steps();
      };

      return self;
    }

    if (origURL) {
      for (var i in origURL) {
        if (origURL.hasOwnProperty(i) && typeof origURL[i] === 'function')
          URL[i] = origURL[i];
      }
    }

    global.URL = URL;
    global.URLSearchParams = URLSearchParams;
  }());

  // Patch native URLSearchParams constructor to handle sequences/records
  // if necessary.
  (function() {
    if (new global.URLSearchParams([['a', 1]]).get('a') === '1' &&
        new global.URLSearchParams({a: 1}).get('a') === '1')
      return;
    var orig = global.URLSearchParams;
    global.URLSearchParams = function(init) {
      if (init && typeof init === 'object' && isSequence(init)) {
        var o = new orig();
        toArray(init).forEach(function(e) {
          if (!isSequence(e)) throw TypeError();
          var nv = toArray(e);
          if (nv.length !== 2) throw TypeError();
          o.append(nv[0], nv[1]);
        });
        return o;
      } else if (init && typeof init === 'object') {
        o = new orig();
        Object.keys(init).forEach(function(key) {
          o.set(key, init[key]);
        });
        return o;
      } else {
        return new orig(init);
      }
    };
  }());

}(self));
// Work-In-Progress 'prollyfill' for Fetch API
// Standard: https://fetch.spec.whatwg.org/#fetch-api
//
// As usual, the intent is to produce a forward-compatible
// subset so that code can be written using future standard
// functionality; not every case is considered or supported.

// Requires ES2015: Promise, Symbol.iterator (or polyfill)
// Requires: URL (or polyfill)

// Example:
//   fetch('README.md')
//     .then(function(response) { return response.text(); })
//     .then(function(text) { alert(text); });

(function(global) {
  'use strict';

  // Web IDL concepts

  // https://heycam.github.io/webidl/#idl-ByteString
  function ByteString(value) {
    value = String(value);
    if (value.match(/[^\x00-\xFF]/)) throw TypeError('Not a valid ByteString');
    return value;
  }

  // https://heycam.github.io/webidl/#idl-USVString
  function USVString(value) {
    value = String(value);
    return value.replace(
        /([\u0000-\uD7FF\uE000-\uFFFF]|[\uD800-\uDBFF][\uDC00-\uDFFF]|[\uD800-\uDFFF])/g,
      function (c) {
        if (/^[\uD800-\uDFFF]$/.test(c)) return '\uFFFD';
        return c;
      });
  }

  function ushort(x) { return x & 0xFFFF; }

  // 2 Terminology

  function byteLowerCase(s) {
    return String(s).replace(/[A-Z]/g, function(c) { return c.toLowerCase(); });
  }

  function byteUpperCase(s) {
    return String(s).replace(/[a-z]/g, function(c) { return c.toUpperCase(); });
  }

  function byteCaseInsensitiveMatch(a, b) {
    return byteLowerCase(a) === byteLowerCase(b);
  }

  // 2.1 HTTP

  // 2.1.1 Methods

  function isForbiddenMethod(m) {
    m = byteUpperCase(m);
    return m === 'CONNECT' || m === 'TRACE' || m === 'TRACK';
  }

  function normalizeMethod(m) {
    var u = byteUpperCase(m);
    if (u === 'DELETE' || u === 'GET' || u === 'HEAD' || u === 'OPTIONS' ||
        u === 'POST' || u === 'PUT') return u;
    return m;
  }

  function isName(s) {
    return /^[!#$%&'*+\-.09A-Z^_`a-z|~]+$/.test(s);
  }
  function isValue(s) {
    // TODO: Implement me
    return true;
  }
  function isForbiddenHeaderName(n) {
    n = String(n).toLowerCase();
    var forbidden = {
      'accept-charset': true,
      'accept-encoding': true,
      'access-control-request-headers': true,
      'access-control-request-method': true,
      'connection': true,
      'content-length': true,
      'cookie': true,
      'cookie2': true,
      'date': true,
      'dnt': true,
      'expect': true,
      'host': true,
      'keep-alive': true,
      'origin': true,
      'referer': true,
      'te': true,
      'trailer': true,
      'transfer-encoding': true,
      'upgrade': true,
      'user-agent': true,
      'via': true
    };
    return forbidden[n] || n.substring(0, 6) === 'proxy-' || n.substring(0, 4) === 'sec-';
  }

  function isForbiddenResponseHeaderName(n) {
    n = String(n).toLowerCase();
    var forbidden = {
      'set-cookie': true,
      'set-cookie2': true
    };
    return forbidden[n];
  }

  function isSimpleHeader(name, value) {
    name = String(name).toLowerCase();
    return name === 'accept' || name === 'accept-language' || name === 'content-language' ||
      (name === 'content-type' &&
       ['application/x-www-form-encoded', 'multipart/form-data', 'text/plain'].indexOf(value) !== -1);
  }

  //
  // 5.1 Headers class
  //

  // typedef (Headers or sequence<sequence<ByteString>> or OpenEndedDictionary<ByteString>) HeadersInit;

  // Constructor(optional HeadersInit init)
  function Headers(init) {
    this._guard = 'none';
    this._headerList = [];
    if (init) fill(this, init);
  }

  function fill(headers, init) {
    if (init instanceof Headers) {
      init._headerList.forEach(function(header) {
        headers.append(header[0], header[1]);
      });
    } else if (Array.isArray(init)) {
      init.forEach(function(header) {
        if (!Array.isArray(header) || header.length !== 2) throw TypeError();
        headers.append(header[0], header[1]);
      });
    } else {
      init = Object(init);
      Object.keys(init).forEach(function(key) {
        headers.append(key, init[key]);
      });
    }
  }

  // interface Headers
  Headers.prototype = {
    // void append(ByteString name, ByteString value);
    append: function append(name, value) {
      name = ByteString(name);
      if (!isName(name) || !isValue(value)) throw TypeError();
      if (this._guard === 'immutable') throw TypeError();
      else if (this._guard === 'request' && isForbiddenHeaderName(name)) return;
      else if (this._guard === 'request-no-CORS' && !isSimpleHeader(name, value)) return;
      else if (this._guard === 'response' && isForbiddenResponseHeaderName(name)) return;

      name = name.toLowerCase();
      this._headerList.push([name, value]);
    },

    // void delete(ByteString name);
    'delete': function delete_(name) {
      name = ByteString(name);
      if (!isName(name)) throw TypeError();
      if (this._guard === 'immutable') throw TypeError();
      else if (this._guard === 'request' && isForbiddenHeaderName(name)) return;
      else if (this._guard === 'request-no-CORS' && !isSimpleHeader(name, 'invalid')) return;
      else if (this._guard === 'response' && isForbiddenResponseHeaderName(name)) return;

      name = name.toLowerCase();
      var index = 0;
      while (index < this._headerList.length) {
        if (this._headerList[index][0] === name)
          this._headerList.splice(index, 1);
        else
          ++index;
      }
    },

    // ByteString? get(ByteString name);
    get: function get(name) {
      name = ByteString(name);
      if (!isName(name)) throw TypeError();
      name = name.toLowerCase();
      for (var index = 0; index < this._headerList.length; ++index) {
        if (this._headerList[index][0] === name)
          return this._headerList[index][1];
      }
      return null;
    },

    // sequence<ByteString> getAll(ByteString name);
    getAll: function getAll(name) {
      name = ByteString(name);
      if (!isName(name)) throw TypeError();
      name = name.toLowerCase();
      var sequence = [];
      for (var index = 0; index < this._headerList.length; ++index) {
        if (this._headerList[index][0] === name)
          sequence.push(this._headerList[index][1]);
      }
      return sequence;
    },

    // boolean has(ByteString name);
    has: function has(name) {
      name = ByteString(name);
      if (!isName(name)) throw TypeError();
      name = name.toLowerCase();
      for (var index = 0; index < this._headerList.length; ++index) {
        if (this._headerList[index][0] === name)
          return true;
      }
      return false;
    },

    // void set(ByteString name, ByteString value);
    set: function set(name, value) {
      name = ByteString(name);
      if (!isName(name) || !isValue(value)) throw TypeError();
      if (this._guard === 'immutable') throw TypeError();
      else if (this._guard === 'request' && isForbiddenHeaderName(name)) return;
      else if (this._guard === 'request-no-CORS' && !isSimpleHeader(name, value)) return;
      else if (this._guard === 'response' && isForbiddenResponseHeaderName(name)) return;

      name = name.toLowerCase();
      for (var index = 0; index < this._headerList.length; ++index) {
        if (this._headerList[index][0] === name) {
          this._headerList[index++][1] = value;
          while (index < this._headerList.length) {
            if (this._headerList[index][0] === name)
              this._headerList.splice(index, 1);
            else
              ++index;
          }
          return;
        }
      }
      this._headerList.push([name, value]);
    }
  };
  Headers.prototype[Symbol.iterator] = function() {
    return new HeadersIterator(this);
  };

  function HeadersIterator(headers) {
    this._headers = headers;
    this._index = 0;
  }
  HeadersIterator.prototype = {};
  HeadersIterator.prototype.next = function() {
    if (this._index >= this._headers._headerList.length)
      return { value: undefined, done: true };
    return { value: this._headers._headerList[this._index++], done: false };
  };
  HeadersIterator.prototype[Symbol.iterator] = function() { return this; };


  //
  // 5.2 Body mixin
  //

  function Body(_stream) {
    // TODO: Handle initialization from other types
    this._stream = _stream;
    this.bodyUsed = false;
  }

  // interface FetchBodyStream
  Body.prototype = {
    // Promise<ArrayBuffer> arrayBuffer();
    arrayBuffer: function() {
      if (this.bodyUsed) return Promise.reject(TypeError());
      this.bodyUsed = true;
      if (this._stream instanceof ArrayBuffer) return Promise.resolve(this._stream);
      var value = this._stream;
      return new Promise(function(resolve, reject) {
        var octets = unescape(encodeURIComponent(value)).split('').map(function(c) {
          return c.charCodeAt(0);
        });
        resolve(new Uint8Array(octets).buffer);
      });
    },
    // Promise<Blob> blob();
    blob: function() {
      if (this.bodyUsed) return Promise.reject(TypeError());
      this.bodyUsed = true;
      if (this._stream instanceof Blob) return Promise.resolve(this._stream);
      return Promise.resolve(new Blob([this._stream]));
    },
    // Promise<FormData> formData();
    formData: function() {
      if (this.bodyUsed) return Promise.reject(TypeError());
      this.bodyUsed = true;
      if (this._stream instanceof FormData) return Promise.resolve(this._stream);
      return Promise.reject(Error('Not yet implemented'));
    },
    // Promise<JSON> json();
    json: function() {
      if (this.bodyUsed) return Promise.reject(TypeError());
      this.bodyUsed = true;
      var that = this;
      return new Promise(function(resolve, reject) {
        resolve(JSON.parse(that._stream));
      });
    },
    // Promise<USVString> text();
    text: function() {
      if (this.bodyUsed) return Promise.reject(TypeError());
      this.bodyUsed = true;
      return Promise.resolve(String(this._stream));
    }
  };

  //
  // 5.3 Request class
  //

  // typedef (Request or USVString) RequestInfo;

  // Constructor(RequestInfo input, optional RequestInit init)
  function Request(input, init) {
    if (arguments.length < 1) throw TypeError('Not enough arguments');

    Body.call(this, null);

    // readonly attribute ByteString method;
    this.method = 'GET';

    // readonly attribute USVString url;
    this.url = '';

    // readonly attribute Headers headers;
    this.headers = new Headers();
    this.headers._guard = 'request';

    // readonly attribute DOMString referrer;
    this.referrer = null; // TODO: Implement.

    // readonly attribute RequestMode mode;
    this.mode = null; // TODO: Implement.

    // readonly attribute RequestCredentials credentials;
    this.credentials = 'omit';

    if (input instanceof Request) {
      if (input.bodyUsed) throw TypeError();
      input.bodyUsed = true;
      this.method = input.method;
      this.url = input.url;
      this.headers = new Headers(input.headers);
      this.headers._guard = input.headers._guard;
      this.credentials = input.credentials;
      this._stream = input._stream;
    } else {
      input = USVString(input);
      this.url = String(new URL(input, self.location));
    }

    init = Object(init);

    if ('method' in init) {
      var method = ByteString(init.method);
      if (isForbiddenMethod(method)) throw TypeError();
      this.method = normalizeMethod(method);
    }

    if ('headers' in init) {
      this.headers = new Headers();
      fill(this.headers, init.headers);
    }

    if ('body' in init)
      this._stream = init.body;

    if ('credentials' in init &&
        (['omit', 'same-origin', 'include'].indexOf(init.credentials) !== -1))
      this.credentials = init.credentials;
  }

  // interface Request
  Request.prototype = Body.prototype;

  //
  // 5.4 Response class
  //

  // Constructor(optional FetchBodyInit body, optional ResponseInit init)
  function Response(body, init) {
    if (arguments.length < 1)
      body = '';

    this.headers = new Headers();
    this.headers._guard = 'response';

    // Internal
    if (body instanceof XMLHttpRequest && '_url' in body) {
      var xhr = body;
      this.type = 'basic'; // TODO: ResponseType
      this.url = USVString(xhr._url);
      this.status = xhr.status;
      this.ok = 200 <= this.status && this.status <= 299;
      this.statusText = xhr.statusText;
      xhr.getAllResponseHeaders()
        .split(/\r?\n/)
        .filter(function(header) { return header.length; })
        .forEach(function(header) {
          var i = header.indexOf(':');
          this.headers.append(header.substring(0, i), header.substring(i + 2));
        }, this);
      Body.call(this, xhr.responseText);
      return;
    }

    Body.call(this, body);

    init = Object(init) || {};

    // readonly attribute USVString url;
    this.url = '';

    // readonly attribute unsigned short status;
    var status = 'status' in init ? ushort(init.status) : 200;
    if (status < 200 || status > 599) throw RangeError();
    this.status = status;

    // readonly attribute boolean ok;
    this.ok = 200 <= this.status && this.status <= 299;

    // readonly attribute ByteString statusText;
    var statusText = 'statusText' in init ? String(init.statusText) : 'OK';
    if (/[^\x00-\xFF]/.test(statusText)) throw TypeError();
    this.statusText = statusText;

    // readonly attribute Headers headers;
    if ('headers' in init) fill(this.headers, init);

    // TODO: Implement these
    // readonly attribute ResponseType type;
    this.type = 'basic'; // TODO: ResponseType
  }

  // interface Response
  Response.prototype = Body.prototype;

  Response.redirect = function() {
    // TODO: Implement?
    throw Error('Not supported');
  };

  //
  // 5.5 Structured cloning of Headers, FetchBodyStream, Request, Response
  //

  //
  // 5.6 Fetch method
  //

  // Promise<Response> fetch(RequestInfo input, optional RequestInit init);
  function fetch(input, init) {
    return new Promise(function(resolve, reject) {
      var r = new Request(input, init);

      var xhr = new XMLHttpRequest(), async = true;
      xhr._url = r.url;

      try { xhr.open(r.method, r.url, async); } catch (e) { throw TypeError(e.message); }

      for (var iter = r.headers[Symbol.iterator](), step = iter.next();
           !step.done; step = iter.next())
        xhr.setRequestHeader(step.value[0], step.value[1]);

      if (r.credentials === 'include')
        xhr.withCredentials = true;

      xhr.onreadystatechange = function() {
        if (xhr.readyState !== XMLHttpRequest.DONE) return;
        if (xhr.status === 0)
          reject(new TypeError('Network error'));
        else
          resolve(new Response(xhr));
      };

      xhr.send(r._stream);
    });
  }

  // Exported
  if (!('fetch' in global)) {
    global.Headers = Headers;
    global.Request = Request;
    global.Response = Response;
    global.fetch = fetch;
  }

}(self));
