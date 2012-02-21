// Polyfills: Compatibility shims that all scripts can share

//----------------------------------------------------------------------
//
// Browser Polyfills
//
//----------------------------------------------------------------------

// Failing in Workers in Chrome: if (window && document) {
if ('window' in this && 'document' in this) {
  /*jslint sloppy:true*/

  //----------------------------------------------------------------------
  //
  // Web Standards Polyfills
  //
  //----------------------------------------------------------------------


  //
  // document.head (HTML5)
  //
  document.head = document.head || document.getElementsByTagName('head')[0];

  //
  // XMLHttpRequest (http://www.w3.org/TR/XMLHttpRequest/)
  //
  window.XMLHttpRequest = window.XMLHttpRequest || function () {
    /*global ActiveXObject*/
    try { return new ActiveXObject("Msxml2.XMLHTTP.6.0"); } catch (e1) { }
    try { return new ActiveXObject("Msxml2.XMLHTTP.3.0"); } catch (e2) { }
    try { return new ActiveXObject("Msxml2.XMLHTTP"); } catch (e3) { }
    throw new Error("This browser does not support XMLHttpRequest.");
  };
  XMLHttpRequest.UNSENT = 0;
  XMLHttpRequest.OPENED = 1;
  XMLHttpRequest.HEADERS_RECEIVED = 2;
  XMLHttpRequest.LOADING = 3;
  XMLHttpRequest.DONE = 4;

  if (!window.BlobBuilder) {
    window.BlobBuilder = window.WebKitBlobBuilder || window.MozBlobBuilder;
  }

  //
  // Base64 utility methods (HTML5)
  //
  (function () {
    /*jslint plusplus: true, bitwise: true*/
    var B64_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
    window.atob = window.atob || function (a) {
      a = String(a);
      var pos = 0,
          len = a.length,
          octets = [],
          e1, e2, e3, e4,
          o1, o2, o3;

      while (pos < len) {
        e1 = B64_ALPHABET.indexOf(a.charAt(pos++));
        e2 = (pos < len) ? B64_ALPHABET.indexOf(a.charAt(pos++)) : -1; // required
        e3 = (pos < len) ? B64_ALPHABET.indexOf(a.charAt(pos++)) : 64; // optional padding
        e4 = (pos < len) ? B64_ALPHABET.indexOf(a.charAt(pos++)) : 64; // optional padding

        if (e1 === -1 || e2 === -1 || e3 === -1 || e4 === -1) {
          throw new Error("INVALID_CHARACTER_ERR");
        }

        // 11111122 22223333 33444444
        o1 = (e1 << 2) | (e2 >> 4);
        o2 = ((e2 & 0xf) << 4) | (e3 >> 2);
        o3 = ((e3 & 0x3) << 6) | e4;

        octets.push(String.fromCharCode(o1));
        if (e3 !== 64) {
          octets.push(String.fromCharCode(o2));
        }
        if (e4 !== 64) {
          octets.push(String.fromCharCode(o3));
        }
      }

      return octets.join('');
    };
    window.btoa = window.btoa || function (b) {
      b = String(b);
      var pos = 0,
          len = b.length,
          out = [],
          o1, o2, o3,
          e1, e2, e3, e4;

      while (pos < len) {
        o1 = b.charCodeAt(pos++);
        o2 = b.charCodeAt(pos++);
        o3 = b.charCodeAt(pos++);

        // 111111 112222 222233 333333
        e1 = o1 >> 2;
        e2 = ((o1 & 0x3) << 4) | (o2 >> 4);
        e3 = ((o2 & 0xf) << 2) | (o3 >> 6);
        e4 = o3 & 0x3f;

        if (pos === len + 2) {
          e3 = 64; e4 = 64;
        }
        else if (pos === len + 1) {
          e4 = 64;
        }

        out.push(B64_ALPHABET.charAt(e1),
                 B64_ALPHABET.charAt(e2),
                 B64_ALPHABET.charAt(e3),
                 B64_ALPHABET.charAt(e4));
      }

      return out.join('');
    };
  } ());

  //----------------------------------------------------------------------
  //
  // Performance (see also: raf.js)
  //
  //----------------------------------------------------------------------

  // setImmediate
  // https://dvcs.w3.org/hg/webperf/raw-file/tip/specs/setImmediate/Overview.html
  (function () {
    function setImmediate(callback, args) {
      var params = [callback, 0], i;
      for (i = 1; i < arguments.length; i += 1) {
        params.push(arguments[i]);
      }
      return window.setTimeout.apply(null, params);
    }

    function clearImmediate(handle) {
      window.clearTimeout(handle);
    }

    window.setImmediate =
      window.setImmediate ||
      window.msSetImmediate ||
      setImmediate;

    window.clearImmediate =
      window.clearImmediate ||
      window.msClearImmediate ||
      clearImmediate;
  } ());

  //----------------------------------------------------------------------
  //
  // DOM
  //
  //----------------------------------------------------------------------

  //
  // Selectors API Level 1 (http://www.w3.org/TR/selectors-api/)
  // http://ajaxian.com/archives/creating-a-queryselector-for-ie-that-runs-at-native-speed
  //
  if (!document.querySelectorAll) {
    document.querySelectorAll = function (selectors) {
      /*jslint nomen:true*/
      var style = document.createElement('style'), elements = [], element;
      document.documentElement.firstChild.appendChild(style);
      document._qsa = [];

      style.styleSheet.cssText = selectors + '{x-qsa:expression(document._qsa && document._qsa.push(this))}';
      window.scrollBy(0, 0);
      style.parentNode.removeChild(style);

      while (document._qsa.length) {
        element = document._qsa.shift();
        element.style.removeAttribute('x-qsa');
        elements.push(element);
      }
      document._qsa = null;
      return elements;
    };
  }

  if (!document.querySelector) {
    document.querySelector = function (selectors) {
      var elements = document.querySelectorAll(selectors);
      return (elements.length) ? elements[0] : null;
    };
  }

  if (!document.getElementsByClassName) {
    document.getElementsByClassName = function (className) {
      return document.querySelectorAll('.' + String(className));
    };
  }

  //
  // DOM Enumerations (http://www.w3.org/TR/DOM-Level-2-Core/)
  //
  window.Node = window.Node || function Node() { throw new Error("Illegal constructor"); };
  window.Node.ELEMENT_NODE = 1;
  window.Node.ATTRIBUTE_NODE = 2;
  window.Node.TEXT_NODE = 3;
  window.Node.CDATA_SECTION_NODE = 4;
  window.Node.ENTITY_REFERENCE_NODE = 5;
  window.Node.ENTITY_NODE = 6;
  window.Node.PROCESSING_INSTRUCTION_NODE = 7;
  window.Node.COMMENT_NODE = 8;
  window.Node.DOCUMENT_NODE = 9;
  window.Node.DOCUMENT_TYPE_NODE = 10;
  window.Node.DOCUMENT_FRAGMENT_NODE = 11;
  window.Node.NOTATION_NODE = 12;

  window.DOMException = window.DOMException || function DOMException() { throw new TypeError("Illegal constructor"); };
  window.DOMException.INDEX_SIZE_ERR = 1;
  window.DOMException.DOMSTRING_SIZE_ERR = 2;
  window.DOMException.HIERARCHY_REQUEST_ERR = 3;
  window.DOMException.WRONG_DOCUMENT_ERR = 4;
  window.DOMException.INVALID_CHARACTER_ERR = 5;
  window.DOMException.NO_DATA_ALLOWED_ERR = 6;
  window.DOMException.NO_MODIFICATION_ALLOWED_ERR = 7;
  window.DOMException.NOT_FOUND_ERR = 8;
  window.DOMException.NOT_SUPPORTED_ERR = 9;
  window.DOMException.INUSE_ATTRIBUTE_ERR = 10;
  window.DOMException.INVALID_STATE_ERR = 11;
  window.DOMException.SYNTAX_ERR = 12;
  window.DOMException.INVALID_MODIFICATION_ERR = 13;
  window.DOMException.NAMESPACE_ERR = 14;
  window.DOMException.INVALID_ACCESS_ERR = 15;

  //----------------------------------------------------------------------
  //
  // Events
  //
  //----------------------------------------------------------------------

  // Shim for DOM Events
  // http://www.quirksmode.org/blog/archives/2005/10/_and_the_winner_1.html
  // Use addEvent(object, event, handler) instead of object.addEventListener(event, handler)

  window.addEvent = function (obj, type, fn) {
    if (obj.addEventListener) {
      obj.addEventListener(type, fn, false);
    } else if (obj.attachEvent) {
      obj["e" + type + fn] = fn;
      obj[type + fn] = function () {
        var e = window.event;
        e.currentTarget = obj;
        e.preventDefault = function () { e.returnValue = false; };
        e.stopPropagation = function () { e.cancelBubble = true; };
        e.target = e.srcElement;
        e.timeStamp = new Date();
        obj["e" + type + fn].call(this, e);
      };
      obj.attachEvent("on" + type, obj[type + fn]);
    }
  };

  window.removeEvent = function (obj, type, fn) {
    if (obj.removeEventListener) {
      obj.removeEventListener(type, fn, false);
    } else if (obj.detachEvent) {
      obj.detachEvent("on" + type, obj[type + fn]);
      obj[type + fn] = null;
      obj["e" + type + fn] = null;
    }
  };

  //----------------------------------------------------------------------
  //
  // Classes
  //
  //----------------------------------------------------------------------

  // Shim for http://www.whatwg.org/specs/web-apps/current-work/multipage/elements.html#dom-classlist
  // Use getClassList(elem) instead of elem.classList()

  window.getClassList = function (elem) {
    if (!elem || !('className' in elem)) { throw new TypeError("No element specified"); }
    if ('classList' in elem) { return elem.classList; }

    var classList = {
      length: elem.className.split(/\s+/g).length,
      item: function (idx) {
        var classes = elem.className.split(/\s+/g);
        return 0 <= idx && idx < classes.length ? classes[idx] : null;
      },
      contains: function (token) {
        var classes = elem.className.split(/\s+/g),
            index = classes.indexOf(token);

        return index !== -1;
      },
      // TODO: multiple tokens
      add: function (token) {
        var classes = elem.className.split(/\s+/g),
            index = classes.indexOf(token);

        if (index === -1) {
          classes.push(token);
          elem.className = classes.join(' ');
          classList.length = classes.length;
        }
      },
      // TODO: multiple tokens
      remove: function (token) {
        var classes = elem.className.split(/\s+/g),
            index = classes.indexOf(token);

        if (index !== -1) {
          classes.splice(index, 1);
          elem.className = classes.join(' ');
          classList.length = classes.length;
        }
      },
      // TODO: multiple tokens
      toggle: function (token) {
        var classes = elem.className.split(/\s+/g),
            index = classes.indexOf(token);

        if (index === -1) {
          classes.push(token);
          elem.className = classes.join(' ');
        } else {
          classes.splice(index, 1);
          elem.className = classes.join(' ');
        }
        classList.length = classes.length;
      }
    };
    return classList;
  };


  //----------------------------------------------------------------------
  //
  // Common but non-standard browser functions
  //
  //----------------------------------------------------------------------

  (function () {
    // JavaScript 1.8.1
    String.prototype.trimLeft = String.prototype.trimLeft || function () {
      return String(this).replace(/^\s+/, '');
    };

    // JavaScript 1.8.1
    String.prototype.trimRight = String.prototype.trimRight || function () {
      return String(this).replace(/\s+$/, '');
    };

    // JavaScript 1.?
    var ESCAPES = {
      //'\x00': '\\0', Special case in FF3.6, removed by FF10
      '\b': '\\b',
      '\t': '\\t',
      '\n': '\\n',
      '\f': '\\f',
      '\r': '\\r',
      '"' : '\\"',
      '\\': '\\\\'
    };
    String.prototype.quote = String.prototype.quote || function() {
      return '"' + String(this).replace(/[\x00-\x1F"\\\x7F-\uFFFF]/g, function(c) {
        if (Object.prototype.hasOwnProperty.call(ESCAPES, c)) {
          return ESCAPES[c];
        } else if (c.charCodeAt(0) <= 0xFF) {
          return '\\x' + ('00' + c.charCodeAt(0).toString(16).toUpperCase()).slice(-2);
        } else {
          return '\\u' + ('0000' + c.charCodeAt(0).toString(16).toUpperCase()).slice(-4);
        }
      }) + '"';
    };
  }());
}

//----------------------------------------------------------------------
//
// ECMAScript 5 Polyfills
//
//----------------------------------------------------------------------

//----------------------------------------------------------------------
// ES5 15.2 Object Objects
//----------------------------------------------------------------------

//
// ES5 15.2.3 Properties of the Object Constructor
//

// ES5 15.2.3.2 Object.getPrototypeOf ( O )
// From http://ejohn.org/blog/objectgetprototypeof/
// NOTE: won't work for typical function T() {}; T.prototype = {}; new T; case
// since the constructor property is destroyed.
if (!Object.getPrototypeOf) {
  Object.getPrototypeOf = function (o) {
    if (o !== Object(o)) { throw new TypeError("Object.getPrototypeOf called on non-object"); }
    return o.__proto__ || o.constructor.prototype || Object.prototype;
  };
}

//    // ES5 15.2.3.3 Object.getOwnPropertyDescriptor ( O, P )
//    if (typeof Object.getOwnPropertyDescriptor !== "function") {
//        Object.getOwnPropertyDescriptor = function (o, name) {
//            if (o !== Object(o)) { throw new TypeError(); }
//            if (o.hasOwnProperty(name)) {
//                return {
//                    value: o[name],
//                    enumerable: true,
//                    writable: true,
//                    configurable: true
//                };
//            }
//        };
//    }

// ES5 15.2.3.4 Object.getOwnPropertyNames ( O )
if (typeof Object.getOwnPropertyNames !== "function") {
  Object.getOwnPropertyNames = function (o) {
    if (o !== Object(o)) { throw new TypeError("Object.getOwnPropertyNames called on non-object"); }
    var props = [], p;
    for (p in o) {
      if (Object.prototype.hasOwnProperty.call(o, p)) {
        props.push(p);
      }
    }
    return props;
  };
}

// ES5 15.2.3.5 Object.create ( O [, Properties] )
if (typeof Object.create !== "function") {
  Object.create = function (prototype, properties) {
    "use strict";
    if (prototype !== Object(prototype)) { throw new TypeError(); }
    /** @constructor */
    function Ctor() {}
    Ctor.prototype = prototype;
    var o = new Ctor();
    o.constructor = Ctor;
    if (arguments.length > 1) {
      if (properties !== Object(properties)) { throw new TypeError(); }
      Object.defineProperties(o, properties);
    }
    return o;
  };
}

// ES 15.2.3.6 Object.defineProperty ( O, P, Attributes )
// Partial support for most common case - getters, setters, and values
if (!Object.defineProperty ||
    !(function () { try { Object.defineProperty({}, 'x', {}); return true; } catch (e) { return false; } } ())) {
  Object.defineProperty = function (o, prop, desc) {
    "use strict";
    if (o !== Object(o)) { throw new TypeError("Object.defineProperty called on non-object"); }
    if (Object.prototype.__defineGetter__ && ('get' in desc)) {
      Object.prototype.__defineGetter__.call(o, prop, desc.get);
    }
    if (Object.prototype.__defineSetter__ && ('set' in desc)) {
      Object.prototype.__defineSetter__.call(o, prop, desc.set);
    }
    if ('value' in desc) {
      o[prop] = desc.value;
    }
    return o;
  };
}

// ES 15.2.3.7 Object.defineProperties ( O, Properties )
if (typeof Object.defineProperties !== "function") {
  Object.defineProperties = function (o, properties) {
    "use strict";
    if (o !== Object(o)) { throw new TypeError("Object.defineProperties called on non-object"); }
    var name;
    for (name in properties) {
      if (Object.prototype.hasOwnProperty.call(properties, name)) {
        Object.defineProperty(o, name, properties[name]);
      }
    }
    return o;
  };
}


// ES5 15.2.3.14 Object.keys ( O )
// https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Object/keys
if (!Object.keys) {
  Object.keys = function (o) {
    if (o !== Object(o)) { throw new TypeError('Object.keys called on non-object'); }
    var ret = [], p;
    for (p in o) {
      if (Object.prototype.hasOwnProperty.call(o, p)) {
        ret.push(p);
      }
    }
    return ret;
  };
}

//----------------------------------------------------------------------
// ES5 15.3 Function Objects
//----------------------------------------------------------------------

//
// ES5 15.3.4 Properties of the Function Prototype Object
//

// ES5 15.3.4.5 Function.prototype.bind ( thisArg [, arg1 [, arg2, ... ]] )
// https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Function/bind
if (!Function.prototype.bind) {
  Function.prototype.bind = function (o) {
    if (typeof this !== 'function') { throw new TypeError("Bind must be called on a function"); }
    var slice = [].slice,
        args = slice.call(arguments, 1),
        self = this,
        bound = function () {
          return self.apply(this instanceof nop ? this : (o || {}),
                            args.concat(slice.call(arguments)));
        };

    /** @constructor */
    function nop() {}
    nop.prototype = self.prototype;

    bound.prototype = new nop();

    return bound;
  };
}


//----------------------------------------------------------------------
// ES5 15.4 Array Objects
//----------------------------------------------------------------------

//
// ES5 15.4.3 Properties of the Array Constructor
//


// ES5 15.4.3.2 Array.isArray ( arg )
// https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/isArray
Array.isArray = Array.isArray || function (o) { return Boolean(o && Object.prototype.toString.call(Object(o)) === '[object Array]'); };


//
// ES5 15.4.4 Properties of the Array Prototype Object
//

// ES5 15.4.4.14 Array.prototype.indexOf ( searchElement [ , fromIndex ] )
// From https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/indexOf
if (!Array.prototype.indexOf) {
  Array.prototype.indexOf = function (searchElement /*, fromIndex */) {
    "use strict";

    if (this === void 0 || this === null) { throw new TypeError(); }

    var t = Object(this);
    var len = t.length >>> 0;
    if (len === 0) { return -1; }

    var n = 0;
    if (arguments.length > 0) {
      n = Number(arguments[1]);
      if (isNaN(n)) {
        n = 0;
      } else if (n !== 0 && n !== (1 / 0) && n !== -(1 / 0)) {
        n = (n > 0 || -1) * Math.floor(Math.abs(n));
      }
    }

    if (n >= len) { return -1; }

    var k = n >= 0 ? n : Math.max(len - Math.abs(n), 0);

    for (; k < len; k++) {
      if (k in t && t[k] === searchElement) {
        return k;
      }
    }
    return -1;
  };
}

// ES5 15.4.4.15 Array.prototype.lastIndexOf ( searchElement [ , fromIndex ] )
// From https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/lastIndexOf
if (!Array.prototype.lastIndexOf) {
  Array.prototype.lastIndexOf = function (searchElement /*, fromIndex*/) {
    "use strict";

    if (this === void 0 || this === null) { throw new TypeError(); }

    var t = Object(this);
    var len = t.length >>> 0;
    if (len === 0) { return -1; }

    var n = len;
    if (arguments.length > 1) {
      n = Number(arguments[1]);
      if (n !== n) {
        n = 0;
      } else if (n !== 0 && n !== (1 / 0) && n !== -(1 / 0)) {
        n = (n > 0 || -1) * Math.floor(Math.abs(n));
      }
    }

    var k = n >= 0 ? Math.min(n, len - 1) : len - Math.abs(n);

    for (; k >= 0; k--) {
      if (k in t && t[k] === searchElement) {
        return k;
      }
    }
    return -1;
  };
}

// ES5 15.4.4.16 Array.prototype.every ( callbackfn [ , thisArg ] )
// From https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/every
if (!Array.prototype.every) {
  Array.prototype.every = function (fun /*, thisp */) {
    "use strict";

    if (this === void 0 || this === null) { throw new TypeError(); }

    var t = Object(this);
    var len = t.length >>> 0;
    if (typeof fun !== "function") { throw new TypeError(); }

    var thisp = arguments[1], i;
    for (i = 0; i < len; i++) {
      if (i in t && !fun.call(thisp, t[i], i, t)) {
        return false;
      }
    }

    return true;
  };
}

// ES5 15.4.4.17 Array.prototype.some ( callbackfn [ , thisArg ] )
// From https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/some
if (!Array.prototype.some) {
  Array.prototype.some = function (fun /*, thisp */) {
    "use strict";

    if (this === void 0 || this === null) { throw new TypeError(); }

    var t = Object(this);
    var len = t.length >>> 0;
    if (typeof fun !== "function") { throw new TypeError(); }

    var thisp = arguments[1], i;
    for (i = 0; i < len; i++) {
      if (i in t && fun.call(thisp, t[i], i, t)) {
        return true;
      }
    }

    return false;
  };
}

// ES5 15.4.4.18 Array.prototype.forEach ( callbackfn [ , thisArg ] )
// From https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/forEach
if (!Array.prototype.forEach) {
  Array.prototype.forEach = function (fun /*, thisp */) {
    "use strict";

    if (this === void 0 || this === null) { throw new TypeError(); }

    var t = Object(this);
    var len = t.length >>> 0;
    if (typeof fun !== "function") { throw new TypeError(); }

    var thisp = arguments[1], i;
    for (i = 0; i < len; i++) {
      if (i in t) {
        fun.call(thisp, t[i], i, t);
      }
    }
  };
}


// ES5 15.4.4.19 Array.prototype.map ( callbackfn [ , thisArg ] )
// From https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/Map
if (!Array.prototype.map) {
  Array.prototype.map = function (fun /*, thisp */) {
    "use strict";

    if (this === void 0 || this === null) { throw new TypeError(); }

    var t = Object(this);
    var len = t.length >>> 0;
    if (typeof fun !== "function") { throw new TypeError(); }

    var res = []; res.length = len;
    var thisp = arguments[1], i;
    for (i = 0; i < len; i++) {
      if (i in t) {
        res[i] = fun.call(thisp, t[i], i, t);
      }
    }

    return res;
  };
}

// ES5 15.4.4.20 Array.prototype.filter ( callbackfn [ , thisArg ] )
// From https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/Filter
if (!Array.prototype.filter) {
  Array.prototype.filter = function (fun /*, thisp */) {
    "use strict";

    if (this === void 0 || this === null) { throw new TypeError(); }

    var t = Object(this);
    var len = t.length >>> 0;
    if (typeof fun !== "function") { throw new TypeError(); }

    var res = [];
    var thisp = arguments[1], i;
    for (i = 0; i < len; i++) {
      if (i in t) {
        var val = t[i]; // in case fun mutates this
        if (fun.call(thisp, val, i, t)) {
          res.push(val);
        }
      }
    }

    return res;
  };
}


// ES5 15.4.4.21 Array.prototype.reduce ( callbackfn [ , initialValue ] )
// From https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/Reduce
if (!Array.prototype.reduce) {
  Array.prototype.reduce = function (fun /*, initialValue */) {
    "use strict";

    if (this === void 0 || this === null) { throw new TypeError(); }

    var t = Object(this);
    var len = t.length >>> 0;
    if (typeof fun !== "function") { throw new TypeError(); }

    // no value to return if no initial value and an empty array
    if (len === 0 && arguments.length === 1) { throw new TypeError(); }

    var k = 0;
    var accumulator;
    if (arguments.length >= 2) {
      accumulator = arguments[1];
    } else {
      do {
        if (k in t) {
          accumulator = t[k++];
          break;
        }

        // if array contains no values, no initial value to return
        if (++k >= len) { throw new TypeError(); }
      }
      while (true);
    }

    while (k < len) {
      if (k in t) {
        accumulator = fun.call(undefined, accumulator, t[k], k, t);
      }
      k++;
    }

    return accumulator;
  };
}


// ES5 15.4.4.22 Array.prototype.reduceRight ( callbackfn [, initialValue ] )
// From https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/ReduceRight
if (!Array.prototype.reduceRight) {
  Array.prototype.reduceRight = function (callbackfn /*, initialValue */) {
    "use strict";

    if (this === void 0 || this === null) { throw new TypeError(); }

    var t = Object(this);
    var len = t.length >>> 0;
    if (typeof callbackfn !== "function") { throw new TypeError(); }

    // no value to return if no initial value, empty array
    if (len === 0 && arguments.length === 1) { throw new TypeError(); }

    var k = len - 1;
    var accumulator;
    if (arguments.length >= 2) {
      accumulator = arguments[1];
    } else {
      do {
        if (k in this) {
          accumulator = this[k--];
          break;
        }

        // if array contains no values, no initial value to return
        if (--k < 0) { throw new TypeError(); }
      }
      while (true);
    }

    while (k >= 0) {
      if (k in t) {
        accumulator = callbackfn.call(undefined, accumulator, t[k], k, t);
      }
      k--;
    }

    return accumulator;
  };
}


//----------------------------------------------------------------------
// ES5 15.5 String Objects
//----------------------------------------------------------------------

//
// ES5 15.5.4 Properties of the String Prototype Object
//


// ES5 15.5.4.20 String.prototype.trim()
if (!String.prototype.trim) {
  String.prototype.trim = function () {
    return String(this).replace(/^\s+/, '').replace(/\s+$/, '');
  };
}



//----------------------------------------------------------------------
// ES5 15.9 Date Objects
//----------------------------------------------------------------------


//
// ES 15.9.4 Properties of the Date Constructor
//

// ES5 15.9.4.4 Date.now ( )
// From https://developer.mozilla.org/en/Core_JavaScript_1.5_Reference/Global_Objects/Date/now
if (!Date.now) {
  Date.now = function now() {
    return Number(new Date());
  };
}


//
// ES5 15.9.5 Properties of the Date Prototype Object
//

// ES5 15.9.4.43 Date.prototype.toISOString ( )
// Inspired by http://www.json.org/json2.js
if (!Date.prototype.toISOString) {
  Date.prototype.toISOString = function () {
    function pad2(n) { return ('00' + n).slice(-2); }
    function pad3(n) { return ('000' + n).slice(-3); }

    return this.getUTCFullYear() + '-' +
      pad2(this.getUTCMonth() + 1) + '-' +
      pad2(this.getUTCDate()) + 'T' +
      pad2(this.getUTCHours()) + ':' +
      pad2(this.getUTCMinutes()) + ':' +
      pad2(this.getUTCSeconds()) + '.' +
      pad3(this.getUTCMilliseconds()) + 'Z';
  };
}