// Composited file - DO NOT EDIT
//----------------------------------------------------------------------
//
// ECMAScript 2015+ Polyfills
//
// For browsers that only support ES5 and TypedArrays (i.e. IE11).
//
//----------------------------------------------------------------------

(function (global) {
  "use strict";

  var undefined = (void 0); // Paranoia

  // Helpers

  function strict(o) {
    return o === global ? undefined : o;
  }

  function isSymbol(s) {
    return (typeof s === 'symbol') || ('Symbol' in global && s instanceof global.Symbol);
  }

  function getPropertyDescriptor(target, name) {
    var desc = Object.getOwnPropertyDescriptor(target, name);
    var proto = Object.getPrototypeOf(target);
    while (!desc && proto) {
      desc = Object.getOwnPropertyDescriptor(proto, name);
      proto = Object.getPrototypeOf(proto);
    }
    return desc;
  }

  var enqueue = (function(nativePromise, nativeSetImmediate) {
    if (nativePromise)
      return function(job) { nativePromise.resolve().then(function() { job(); }); };
    if (nativeSetImmediate)
      return function(job) { nativeSetImmediate(job); };
    return function(job) { setTimeout(job, 0); };
  }(global['Promise'], global['setImmediate']));

  function define(o, p, v, override) {
    if (p in o && !override)
      return;

    if (typeof v === 'function') {
      // Sanity check that functions are appropriately named (where possible)
      console.assert(isSymbol(p) || !('name' in v) || v.name === p || v.name === p + '_', 'Expected function name "' + p.toString() + '", was "' + v.name + '"');
      Object.defineProperty(o, p, {
        value: v,
        configurable: true,
        enumerable: false,
        writable: true
      });
    } else {
      Object.defineProperty(o, p, {
        value: v,
        configurable: false,
        enumerable: false,
        writable: false
      });
    }
  }

  function set_internal(o, p, v) {
    Object.defineProperty(o, p, {
      value: v,
      configurable: false,
      enumerable: false,
      writable: true
    });
  }

  // Snapshot intrinsic functions
  var $isNaN = global.isNaN,
      $parseInt = global.parseInt,
      $parseFloat = global.parseFloat;

  var E = Math.E,
      LOG10E = Math.LOG10E,
      LOG2E = Math.LOG2E,
      abs = Math.abs,
      ceil = Math.ceil,
      exp = Math.exp,
      floor = Math.floor,
      log = Math.log,
      max = Math.max,
      min = Math.min,
      pow = Math.pow,
      random = Math.random,
      sqrt = Math.sqrt;

  var orig_match = String.prototype.match,
      orig_replace = String.prototype.replace,
      orig_search = String.prototype.search,
      orig_split = String.prototype.split;

  // These are used for implementing the polyfills, but not exported.


  var empty = Object.create(null);

  //----------------------------------------------------------------------
  //
  // ECMAScript 2015
  // http://www.ecma-international.org/ecma-262/6.0/
  //
  //----------------------------------------------------------------------

  // ---------------------------------------
  // 19.4 Symbol Objects
  // ---------------------------------------

  // NOTE: Symbols are defined here - out of spec order - since we need the
  // properties and prototype to be populated for other polyfills.

  // NOTE: Not secure, nor is obj[$$symbol] hidden from Object.keys()

  var symbolForKey;
  (function() {
    var secret = Object.create(null);
    var symbolMap = {};
    symbolForKey = function(k) {
      return symbolMap[k];
    };

    var GlobalSymbolRegistry = [];

    function unique(bits) {
      return Array(bits + 1).join('x').replace(/x/g, function() {
        return random() < 0.5 ? '\u200C' : '\u200D'; // JWNJ / ZWJ
      });
    }

    // 19.4.1 The Symbol Constructor
    // 19.4.1.1 Symbol ( description=undefined )
    function Symbol(description) {
      if (!(this instanceof Symbol)) return new Symbol(description, secret);
      if (this instanceof Symbol && arguments[1] !== secret) throw TypeError();

      var descString = description === undefined ? undefined : String(description);

      set_internal(this, '[[SymbolData]]', unique(128));
      set_internal(this, '[[Description]]', descString);

      symbolMap[this] = this;
      return this;
    }

    if (!('Symbol' in global))
      global.Symbol = Symbol;

    // 19.4.2 Properties of the Symbol Constructor

    // 19.4.2.1 Symbol.asyncIterator

    // 19.4.2.2 Symbol.for (key)
    define(Symbol, 'for', function for_(key) {
      var stringKey = String(key);
      for (var i = 0; i < GlobalSymbolRegistry.length; ++i) {
        var e = GlobalSymbolRegistry[i];
        if (SameValue(e['[[key]]'], stringKey)) return e['[[symbol]]'];
      }
      var newSymbol = Symbol(key);
      GlobalSymbolRegistry.push({'[[key]]': stringKey, '[[symbol]]': newSymbol});
      return newSymbol;
    });

    // 19.4.2.3 Symbol.hasInstance
    // 19.4.2.4 Symbol.isConcatSpreadable

    // 19.4.2.5 Symbol.iterator
    define(global.Symbol, 'iterator', global.Symbol('Symbol.iterator'));

    // 19.4.2.6 Symbol.keyFor (sym)
    define(Symbol, 'keyFor', function keyFor(sym) {
      if (!(sym instanceof Symbol)) throw TypeError();
      for (var i = 0; i < GlobalSymbolRegistry.length; ++i) {
        var e = GlobalSymbolRegistry[i];
        if (SameValue(e['[[symbol]]'], sym)) return e['[[key]]'];
      }
      return undefined;
    });

    // 19.4.2.7 Symbol.match
    define(global.Symbol, 'match', global.Symbol('Symbol.match'));

    // 19.4.2.8 Symbol.prototype

    // 19.4.2.9 Symbol.replace
    define(global.Symbol, 'replace', global.Symbol('Symbol.replace'));

    // 19.4.2.10 Symbol.search
    define(global.Symbol, 'search', global.Symbol('Symbol.search'));

    // 19.4.2.11 Symbol.species

    // 19.4.2.12 Symbol.split
    define(global.Symbol, 'split', global.Symbol('Symbol.split'));

    // 19.4.2.13 Symbol.toPrimitive

    // 19.4.2.14 Symbol.toStringTag
    define(global.Symbol, 'toStringTag', global.Symbol('Symbol.toStringTag'));

    // 19.4.2.15 Symbol.unscopables

    // 19.4.3 Properties of the Symbol Prototype Object
    // 19.4.3.1 Symbol.prototype.constructor

    // 19.4.3.2 Symbol.prototype.toString ( )
    Object.defineProperty(Symbol.prototype, 'toString', {
      value: function toString() {
        var s = strict(this);
        var desc = s['[[Description]]'];
        return 'Symbol(' + (desc === undefined ? '' : desc) + s['[[SymbolData]]'] + ')';
      },
      configurable: true, writeable: true, enumerable: false });

    // 19.4.3.3 Symbol.prototype.valueOf ( )
    Object.defineProperty(Symbol.prototype, 'valueOf', {
      value: function valueOf() {
        // To prevent automatic string conversion:
        throw TypeError();

        // Spec has approximately the following:
        //var s = strict(this);
        //if (Type(s) === 'symbol') return s;
        //if (Type(s) !== 'object') throw TypeError();
        //if (!('[[SymbolData]]' in s)) throw TypeError();
        //return s['[[SymbolData]]'];
      },
      configurable: true, writeable: true, enumerable: false });

    // 19.4.3.4 Symbol.prototype [ @@toPrimitive ] ( hint )

    // 19.4.3.5 Symbol.prototype [ @@toStringTag ]
    // (Done later to polyfill partial implementations)

    // 19.4.4 Properties of Symbol Instances
  }());

  console.assert(typeof global.Symbol() === 'symbol' || symbolForKey(String(global.Symbol('x'))) !== undefined);

  // Defined here so that other prototypes can reference it
  // 25.1.2 The %IteratorPrototype% Object
  var $IteratorPrototype$ = {};

  //----------------------------------------
  // 6 ECMAScript Data Types and Values
  //----------------------------------------

  // 6.1 ECMAScript Language Types

  // "Type(x)" is used as shorthand for "the type of x"...
  function Type(v) {
    switch (typeof v) {
    case 'undefined': return 'undefined';
    case 'boolean': return 'boolean';
    case 'number': return 'number';
    case 'string': return 'string';
    case 'symbol': return 'symbol';
    default:
      if (v === null) return 'null';
      if (v instanceof global.Symbol) return 'symbol';
      return 'object';
    }
  }

  // 6.1.5.1 Well-Known Symbols
  var $$iterator = global.Symbol.iterator,
      $$match = global.Symbol.match,
      $$replace = global.Symbol.replace,
      $$search = global.Symbol.search,
      $$split = global.Symbol.split,
      $$toStringTag = global.Symbol.toStringTag;

  //----------------------------------------
  // 7 Abstract Operations
  //----------------------------------------

  //----------------------------------------
  // 7.1 Type Conversion
  //----------------------------------------

  // 7.1.1 ToPrimitive ( input [ , PreferredType ] )
  // just use valueOf()

  // 7.1.2 ToBoolean ( argument )
  // just use Boolean()

  // 7.1.3 ToNumber ( argument )
  // just use Number()

  // 7.1.4 ToInteger ( argument )
  function ToInteger(n) {
    n = Number(n);
    if ($isNaN(n)) return 0;
    if (n === 0 || n === Infinity || n === -Infinity) return n;
    return ((n < 0) ? -1 : 1) * floor(abs(n));
  }

  // 7.1.5 ToInt32 ( argument )
  function ToInt32(v) { return v >> 0; }

  // 7.1.6 ToUint32 ( argument )
  function ToUint32(v) { return v >>> 0; }

  // 7.1.7 ToInt16 ( argument )
  function ToInt16(v) { return (v << 16) >> 16; }

  // 7.1.8 ToUint16 ( argument )
  function ToUint16(v) { return v & 0xFFFF; }

  // 7.1.9 ToInt8 ( argument )
  function ToInt8(v) { return (v << 24) >> 24; }

  // 7.1.10 ToUint8 ( argument )
  function ToUint8(v) { return v & 0xFF; }

  // 7.1.11 ToUint8Clamp ( argument )
  function ToUint8Clamp(argument) {
    var number = Number(argument);
    if ($isNaN(number)) return 0;
    if (number <= 0) return 0;
    if (number >= 255) return 255;
    var f = floor(number);
    if ((f + 0.5) < number) return f + 1;
    if (number < (f + 0.5)) return f;
    if (f % 2) return f + 1;
    return f;
  }

  // 7.1.12 ToString ( argument )
  // just use String()

  // 7.1.12.1 NumberToString ( m )
  // TODO: Inspect usage.

  // 7.1.13 ToObject ( argument )
  function ToObject(v) {
    if (v === null || v === undefined) throw TypeError();
    return Object(v);
  }

  // 7.1.14 ToPropertyKey ( argument )
  function ToPropertyKey(v) {
    return String(v);
  }

  // 7.1.15 ToLength ( argument )
  function ToLength(v) {
    var len = ToInteger(v);
    if (len <= 0) return 0;
    if (len === Infinity) return 0x20000000000000 - 1; // 2^53-1
    return min(len, 0x20000000000000 - 1); // 2^53-1
  }

  // 7.1.16 CanonicalNumericIndexString ( argument )

  // 7.1.17 ToIndex ( value )
  // TODO: Polyfill/use?

  //----------------------------------------
  // 7.2 Testing and Comparison Operations
  //----------------------------------------

  // 7.2.1 RequireObjectCoercible ( argument )
  // 7.2.2 IsArray ( argument )

  // 7.2.3 IsCallable ( argument )
  function IsCallable(o) { return typeof o === 'function'; }

  // 7.2.4 IsConstructor ( argument )
  function IsConstructor(o) {
    // Hacks for Safari 7 TypedArray XXXConstructor objects
    if (/Constructor/.test(Object.prototype.toString.call(o))) return true;
    if (/Function/.test(Object.prototype.toString.call(o))) return true;
    // TODO: Can this be improved on?
    return typeof o === 'function';
  }

  // 7.2.5 IsExtensible ( O )
  // 7.2.6 IsInteger ( argument )

  // 7.2.7 IsPropertyKey ( argument )
  function IsPropertyKey(argument) {
    if (Type(argument) === 'string') return true;
    if (Type(argument) === 'symbol') return true;
    return false;
  }

  // 7.2.8 IsRegExp ( argument )
  // 7.2.9 IsStringPrefix ( p, q )

  // 7.2.10 SameValue ( x, y )
  function SameValue(x, y) {
    if (typeof x !== typeof y) return false;
    switch (typeof x) {
    case 'undefined':
      return true;
    case 'number':
      if (x !== x && y !== y) return true;
      if (x === 0 && y === 0) return 1/x === 1/y;
      return x === y;
    case 'boolean':
    case 'string':
    case 'object':
    default:
      return x === y;
    }
  }

  // 7.2.11 SameValueZero ( x, y )
  function SameValueZero(x, y) {
    if (typeof x !== typeof y) return false;
    switch (typeof x) {
    case 'undefined':
      return true;
    case 'number':
      if (x !== x && y !== y) return true;
      return x === y;
    case 'boolean':
    case 'string':
    case 'object':
    default:
      return x === y;
    }
  }

  // 7.2.12 SameValueNonNumber ( x, y )

  //----------------------------------------
  // 7.3 Operations on Objects
  //----------------------------------------

  // 7.3.1 Get ( O, P )
  // - just use o.p or o[p]

  // 7.3.2 GetV ( V, P )
  function GetV(v, p) {
    var o = ToObject(v);
    return o[p];
  }

  // 7.3.3 Set ( O, P, V, Throw )
  // - just use o.p = v or o[p] = v

  // 7.3.4 CreateDataProperty ( O, P, V )
  function CreateDataProperty(O, P, V) {
    Object.defineProperty(O, P, {
      value: V,
      writable: true,
      enumerable: true,
      configurable: true
    });
  }

  // 7.3.5 CreateMethodProperty ( O, P, V )
  // 7.3.6 CreateDataPropertyOrThrow ( O, P, V )
  // 7.3.7 DefinePropertyOrThrow ( O, P, desc )
  // 7.3.8 DeletePropertyOrThrow ( O, P )

  // 7.3.9 GetMethod ( O, P )
  // TODO: Update signature and callers.
  function GetMethod(o, p) {
    var func = GetV(o, p);
    if (func === undefined || func === null) return undefined;
    if (!IsCallable(func)) throw TypeError();
    return func;
  }

  // 7.3.10 HasProperty ( O, P )
  function HasProperty(o, p) {
    while (o) {
      if (Object.prototype.hasOwnProperty.call(o, p)) return true;
      if (Type(o) !== 'object') return false;
      var op = Object.getPrototypeOf(o);
      if (op === o) return false; // IE8 has self-referential prototypes
      o = op;
    }
    return false;
  }

  // 7.3.11 HasOwnProperty ( O, P )
  function HasOwnProperty(o, p) {
    return Object.prototype.hasOwnProperty.call(o, p);
  }

  // 7.3.12 Call ( F, V [ , argumentsList ] )
  // 7.3.13 Construct ( F [ , argumentsList [ , newTarget ]] )
  // 7.3.14 SetIntegrityLevel ( O, level )
  // 7.3.15 TestIntegrityLevel ( O, level )
  // 7.3.16 CreateArrayFromList ( elements )
  // 7.3.17 CreateListFromArrayLike ( obj [ , elementTypes ] )
  // 7.3.18 Invoke ( V, P [ , argumentsList ] )
  // 7.3.19 OrdinaryHasInstance ( C, O )
  // 7.3.20 SpeciesConstructor ( O, defaultConstructor )

  // 7.3.21 EnumerableOwnPropertyNames ( O, kind )
  // TODO: Align this and callers with spec.
  function EnumerableOwnProperties(o, kind) {
    var ownKeys = Object.keys(o);
    var properties = [];
    ownKeys.forEach(function(key) {
      var desc = Object.getOwnPropertyDescriptor(o, key);
      if (desc && desc.enumerable) {
        if (kind === 'key') properties.push(key);
        else {
          var value = o[key];
          if (kind === 'value') properties.push(value);
          else properties.push([key, value]);
        }
      }
    });
    return properties;
  }

  // 7.3.22 GetFunctionRealm ( obj )
  // 7.3.23 CopyDataProperties ( target, source, excludedItems )

  //----------------------------------------
  // 7.4 Operations on Iterator Objects
  //----------------------------------------

  // 7.4.1 GetIterator ( obj, method )
  // TODO: Update signature
  function GetIterator(obj, method) {
    if (arguments.length < 2)
      method = GetMethod(obj, $$iterator);
    var iterator = method.call(obj);
    if (Type(iterator) !== 'object') throw TypeError();
    return iterator;
  }

  // 7.4.2 IteratorNext ( iteratorRecord [ , value ] )
  function IteratorNext(iteratorRecord, value) {
    if (arguments.length < 2)
      var result = iteratorRecord.next();
    else
      result = iteratorRecord.next(value);
    if (Type(result) !== 'object') throw TypeError();
    return result;
  }

  // 7.4.3 IteratorComplete ( iterResult )
  function IteratorComplete(iterResult) {
    console.assert(Type(iterResult) === 'object');
    return Boolean(iterResult.done);
  }

  // 7.4.4 IteratorValue ( iterResult )
  function IteratorValue(iterResult) {
    console.assert(Type(iterResult) === 'object');
    return iterResult.value;
  }

  // 7.4.5 IteratorStep ( iteratorRecord )
  function IteratorStep( iteratorRecord, value ) {
    var result = IteratorNext(iteratorRecord, value);
    var done = result['done'];
    if (Boolean(done) === true) return false;
    return result;
  }

  // 7.4.6 IteratorClose ( iteratorRecord, completion )
  function IteratorClose( iteratorRecord, completion ) {
    console.assert(Type(iteratorRecord) === 'object');
    var _return = GetMethod(iteratorRecord, 'return');
    if (_return === undefined) return completion;
    try {
      var innerResult = _return[iteratorRecord]();
    } catch (result) {
      // TODO: If completion.[[type]] is throw, return completion
      return result;
    }
    if (Type(innerResult) !== 'object') throw TypeError();
    return completion;
  }

  // 7.4.7 AsyncIteratorClose ( iteratorRecord, completion )

  // 7.4.8 CreateIterResultObject ( value, done )
  function CreateIterResultObject(value, done) {
    console.assert(Type(done) === 'boolean');
    var obj = {};
    obj["value"] = value;
    obj["done"] = done;
    return obj;
  }

  // 7.4.9 CreateListIteratorRecord ( list )
  // 7.4.9.1 ListIterator next ( )

  //----------------------------------------
  // 8 Executable Code and Execution Contexts
  //----------------------------------------

  //----------------------------------------
  // 8.4 Jobs and Job Queues
  //----------------------------------------

  // 8.4.1 EnqueueJob ( queueName, job, arguments )
  function EnqueueJob(queueName, job, args) {
    var fn = function() { job.apply(undefined, args); };
    enqueue(fn);
  }

  // TODO: Align with spec.
  function NextJob(result) {
    // no-op
  }

  //----------------------------------------
  // 9 Ordinary and Exotic Objects Behaviours
  //----------------------------------------

  // 9.1.11 [[OwnPropertyKeys]] ( )
  function OwnPropertyKeys(o) {
    return Object.getOwnPropertyNames(o);
  }

  // 9.1.12 ObjectCreate ( proto [ , internalSlotsList ] )
  function ObjectCreate(proto, internalSlotsList) {
    return Object.create(proto, internalSlotsList);
  }

  // ---------------------------------------
  // 19 Fundamental Objects
  // ---------------------------------------

  // ---------------------------------------
  // 19.1 Object Objects
  // ---------------------------------------

  // 19.1.1 The Object Constructor
  // 19.1.1.1 Object ( [ value ] )
  // 19.1.2 Properties of the Object Constructor

  // 19.1.2.1 Object.assign ( target, ...sources )
  define(
    Object, 'assign',
    function assign(target, /*...*/sources) {
      var to = ToObject(target);
      if (arguments.length < 2) return to;

      var sourcesIndex = 1;
      while (sourcesIndex < arguments.length) {
        var nextSource = arguments[sourcesIndex++];
        if (nextSource === undefined || nextSource === null) {
          var keys = [];
        } else {
          var from = ToObject(nextSource);
          keys = OwnPropertyKeys(from);
        }
        for (var keysIndex = 0; keysIndex < keys.length; ++keysIndex) {
          var nextKey = keys[keysIndex];
          var desc = Object.getOwnPropertyDescriptor(from, nextKey);
          if (desc !== undefined && desc.enumerable) {
            var propValue = from[nextKey];
            to[nextKey] = propValue;
          }
        }
      }
      return to;
    });

  // 19.1.2.2 Object.create ( O , Properties )
  // 19.1.2.3 Object.defineProperties ( O, Properties )
  // 19.1.2.4 Object.defineProperty ( O, P, Attributes )

  // 19.1.2.5 Object.entries ( O )
  define(
    Object, 'entries',
    function entries(o) {
      var obj = ToObject(o);
      return EnumerableOwnProperties(obj, 'key+value');
    });


  // 19.1.2.6 Object.freeze ( O )
  // 19.1.2.7 Object.getOwnPropertyDescriptor ( O, P )

  // 19.1.2.8 Object.getOwnPropertyDescriptors ( O )
  define(
    Object, 'getOwnPropertyDescriptors',
    function getOwnPropertyDescriptors(o) {
      var obj = ToObject(o);
      // ReturnIfAbrupt(obj)
      var keys = Object.getOwnPropertyNames(obj);
      // ReturnIfAbrupt(keys)
      var descriptors = {};
      for (var i = 0; i < keys.length; ++i) {
        var nextKey = keys[i];
        var descriptor = Object.getOwnPropertyDescriptor(obj, nextKey);
        // ReturnIfAbrupt(desc)
        // ReturnIfAbrupt(descriptor)
        CreateDataProperty(descriptors, nextKey, descriptor);
      }
      return descriptors;
    });


  (function() {
    var nativeSymbols = (typeof global.Symbol() === 'symbol'),
        $getOwnPropertyNames = Object.getOwnPropertyNames,
        $keys = Object.keys,
        $window_names = (typeof window === 'object' ? $getOwnPropertyNames(window) : []);

    function isStringKey(k) { return !symbolForKey(k); }

    // 19.1.2.9 Object.getOwnPropertyNames ( O )
    define(
      Object, 'getOwnPropertyNames',
      function getOwnPropertyNames(o) {
        if (Object.prototype.toString.call(o) === '[object Window]') {
          // Workaround for cross-realm calling by IE itself.
          // https://github.com/inexorabletash/polyfill/issues/96
          try {
            return $getOwnPropertyNames(o).filter(isStringKey);
          } catch (_) {
            return $window_names.slice();
          }
        }
        return $getOwnPropertyNames(o).filter(isStringKey);
      }, !nativeSymbols);

    // 19.1.2.10 Object.getOwnPropertySymbols ( O )
    define(
      Object, 'getOwnPropertySymbols',
      function getOwnPropertySymbols(o) {
        return $getOwnPropertyNames(o).filter(symbolForKey).map(symbolForKey);
      }, !nativeSymbols);

    // 19.1.2.16 Object.keys ( O )
    define(
      Object, 'keys',
      function keys(o) {
        return $keys(o).filter(isStringKey);
      }, !nativeSymbols);
  }());

  // 19.1.2.11 Object.getPrototypeOf ( O )

  // 19.1.2.12 Object.is ( value1, value2 )
  define(
    Object, 'is',
    function is(value1, value2) {
      return SameValue(value1, value2);
    });

  // 19.1.2.13 Object.isExtensible ( O )
  // 19.1.2.14 Object.isFrozen ( O )
  // 19.1.2.15 Object.isSealed ( O )

  // 19.1.2.16 Object.keys ( O )
  // see above

  // 19.1.2.17 Object.preventExtensions ( O )
  // 19.1.2.18 Object.prototype
  // 19.1.2.19 Object.seal ( O )

  // 19.1.2.20 Object.setPrototypeOf ( O, proto )
  define(
    Object, 'setPrototypeOf',
    function setPrototypeOf(o, proto) {
      if (Type(o) !== 'object') throw TypeError();
      if (Type(proto) !== 'object' && Type(proto) !== 'null') throw TypeError();
      o.__proto__ = proto;
      return o;
    }
  );

  // 19.1.2.21 Object.values ( O )
  define(
    Object, 'values',
    function values(o) {
      var obj = ToObject(o);
      return EnumerableOwnProperties(obj, 'value');
    });


  // 19.1.3 Properties of the Object Prototype Object
  // 19.1.3.1 Object.prototype.constructor
  // 19.1.3.2 Object.prototype.hasOwnProperty ( V )
  // 19.1.3.3 Object.prototype.isPrototypeOf ( V )
  // 19.1.3.4 Object.prototype.propertyIsEnumerable ( V )
  // 19.1.3.5 Object.prototype.toLocaleString ( [ reserved1 [ , reserved2 ] ] )

  // 19.1.3.6 Object.prototype.toString ( )
  var o_p_ts = Object.prototype.toString;
  define(Object.prototype, 'toString',
         function() {
           var o = strict(this);
           if (o === Object(o) && $$toStringTag in o) {
             return '[object ' + o[$$toStringTag] + ']';
           }
           return o_p_ts.apply(o, arguments);
         },
         typeof $$toStringTag !== 'symbol');

  // 19.1.3.7 Object.prototype.valueOf ( )
  // 19.1.4 Properties of Object Instances

  // ---------------------------------------
  // 19.2 Function Objects
  // ---------------------------------------

  // (nothing polyfillable)

  // ---------------------------------------
  // 19.3 Boolean Objects
  // ---------------------------------------

  // (nothing polyfillable)

  // ---------------------------------------
  // 19.4 Symbol Objects
  // ---------------------------------------

  // Moved earlier in this script, so that other polyfills can depend on them.

  // 19.4.3.5 Symbol.prototype [ @@toStringTag ]
  define(global.Symbol.prototype, global.Symbol.toStringTag, 'Symbol');

  // ---------------------------------------
  // 19.5 Error Objects
  // ---------------------------------------

  // (nothing polyfillable)

  // ---------------------------------------
  // 20 Numbers and Dates
  // ---------------------------------------

  // ---------------------------------------
  // 20.1 Number Objects
  // ---------------------------------------

  // 20.1.1 The Number Constructor
  // 20.1.1.1 Number ( value )
  // 20.1.2 Properties of the Number Constructor

  // 20.1.2.1 Number.EPSILON
  define(
    Number, 'EPSILON',
    (function () {
      var next, result;
      for (next = 1; 1 + next !== 1; next = next / 2)
        result = next;
      return result;
    }()));

  // 20.1.2.2 Number.isFinite ( number )
  define(
    Number, 'isFinite',
    function isFinite(number) {
      if (Type(number) !== 'number') return false;
      if (number !== number || number === +Infinity || number === -Infinity) return false;
      return true;
    });

  // 20.1.2.3 Number.isInteger ( number )
  define(
    Number, 'isInteger',
    function isInteger(number) {
      if (Type(number) !== 'number') return false;
      if (number !== number || number === +Infinity || number === -Infinity) return false;
      var integer = ToInteger(number);
      if (integer !== number) return false;
      return true;
    });

  // 20.1.2.4 Number.isNaN ( number )
  define(
    Number, 'isNaN',
    function isNaN(number) {
      if (Type(number) !== 'number') return false;
      if (number !== number) return true;
      return false;
    });

  // 20.1.2.5 Number.isSafeInteger ( number )
  define(
    Number, 'isSafeInteger',
    function isSafeInteger(number) {
      if (Type(number) !== 'number') return false;
      if (number !== number || number === +Infinity || number === -Infinity) return false;
      var integer = ToInteger(number);
      if (integer !== number) return false;
      if (abs(integer) <= (0x20000000000000 - 1)) // 2^53-1
        return true;
      return false;
    });

  // 20.1.2.6 Number.MAX_SAFE_INTEGER
  define(
    Number, 'MAX_SAFE_INTEGER',
    9007199254740991); // 2^53-1

  // 20.1.2.7 Number.MAX_VALUE

  // 20.1.2.8 Number.MIN_SAFE_INTEGER
  define(
    Number, 'MIN_SAFE_INTEGER',
    -9007199254740991); // -2^53+1

  // 20.1.2.9 Number.MIN_VALUE
  // 20.1.2.10 Number.NaN
  // 20.1.2.11 Number.NEGATIVE_INFINITY

  // 20.1.2.12 Number.parseFloat ( string )
  define(Number, 'parseFloat', $parseFloat);

  // 20.1.2.13 Number.parseInt ( string, radix )
  define(Number, 'parseInt', $parseInt);

  // 20.1.2.14 Number.POSITIVE_INFINITY
  // 20.1.2.15 Number.prototype

  // 20.1.3 Properties of the Number Prototype Object
  // 20.1.3.1 Number.prototype.constructor
  // 20.1.3.2 Number.prototype.toExponential ( fractionDigits )
  // 20.1.3.3 Number.prototype.toFixed ( fractionDigits )
  // 20.1.3.4 Number.prototype.toLocaleString ( [ reserved1 [ , reserved2 ] ] )
  // 20.1.3.5 Number.prototype.toPrecision ( precision )
  // 20.1.3.6 Number.prototype.toString ( [ radix ] )
  // 20.1.3.7 Number.prototype.valueOf ( )
  // 20.1.4 Properties of Number Instances

  // ---------------------------------------
  // 20.2 The Math Object
  // ---------------------------------------

  // 20.2.1 Value Properties of the Math Object
  // 20.2.1.1 Math.E
  // 20.2.1.2 Math.LN10
  // 20.2.1.3 Math.LN2
  // 20.2.1.4 Math.LOG10E
  // 20.2.1.5 Math.LOG2E
  // 20.2.1.6 Math.PI
  // 20.2.1.7 Math.SQRT1_2
  // 20.2.1.8 Math.SQRT2

  // 20.2.1.9 Math [ @@toStringTag ]
  define(Math, $$toStringTag, 'Math');

  // 20.2.2 Function Properties of the Math Object
  // 20.2.2.1 Math.abs ( x )
  // 20.2.2.2 Math.acos ( x )

  // 20.2.2.3 Math.acosh ( x )
  define(
    Math, 'acosh',
    function acosh(x) {
      x = Number(x);
      return log(x + sqrt(x * x - 1));
    });

  // 20.2.2.4 Math.asin ( x )

  // 20.2.2.5 Math.asinh ( x )
  define(
    Math, 'asinh',
    function asinh(x) {
      x = Number(x);
      if (SameValue(x, -0)) {
        return x;
      }
      var s = sqrt(x * x + 1);
      return (s === -x) ? log(0) : log(x + s);
    });

  // 20.2.2.6 Math.atan ( x )

  // 20.2.2.7 Math.atanh ( x )
  define(
    Math, 'atanh',
    function atanh(x) {
      x = Number(x);
      return (x === 0) ? x : log((1 + x) / (1 - x)) / 2;
    });

  // 20.2.2.8 Math.atan2 ( y, x )

  // 20.2.2.9 Math.cbrt ( x )
  define(
    Math, 'cbrt',
    function cbrt(x) {
      x = Number(x);
      if ($isNaN(x/x)) {
        return x;
      }
      var r = pow(abs(x), 1/3);
      var t = x/r/r;
      return r + (r * (t-r) / (2*r + t));
    });

  // 20.2.2.10 Math.ceil ( x )

  // 20.2.2.11 Math.clz32 ( x )
  define(
    Math, 'clz32',
    function clz32(x) {
      function clz8(x) {
        return (x & 0xf0) ? (x & 0x80 ? 0 : x & 0x40 ? 1 : x & 0x20 ? 2 : 3) :
        (x & 0x08 ? 4 : x & 0x04 ? 5 : x & 0x02 ? 6 : x & 0x01 ? 7 : 8);
      }
      x = ToUint32(x);
      return x & 0xff000000 ? clz8(x >> 24) :
        x & 0xff0000 ? clz8(x >> 16) + 8 :
        x & 0xff00 ? clz8(x >> 8) + 16 : clz8(x) + 24;
    });



  // 20.2.2.12 Math.cos ( x )

  // 20.2.2.13 Math.cosh ( x )
  define(
    Math, 'cosh',
    function cosh(x) {
      x = Number(x);
      return (pow(E, x) + pow(E, -x)) / 2;
    });

  // 20.2.2.14 Math.exp ( x )

  // 20.2.2.15 Math.expm1 ( x )
  define(
    Math, 'expm1',
    function expm1(x) {
      x = Number(x);
      // from: http://www.johndcook.com/cpp_log1p.html
      if (SameValue(x, -0)) {
        return -0;
      } else if (abs(x) < 1e-5) {
        return x + 0.5 * x * x; // two terms of Taylor expansion
      } else {
        return exp(x) - 1;
      }
    });

  // 20.2.2.16 Math.floor ( x )

  // 20.2.2.17 Math.fround ( x )
  define(
    Math, 'fround',
    function fround(x) {
      if ($isNaN(x)) {
        return NaN;
      }
      if (1/x === +Infinity || 1/x === -Infinity || x === +Infinity || x === -Infinity) {
        return x;
      }
      return (new Float32Array([x]))[0];
    });

  // 20.2.2.18 Math.hypot ( value1, value2, ...values )
  define(
    Math, 'hypot',
    function hypot() {
      var values = [];
      var m = 0, sawNaN = false;
      for (var i = 0; i < arguments.length; ++i) {
        var n = abs(Number(arguments[i]));
        if (n === Infinity) return n;
        if (n !== n) sawNaN = true;
        if (n > m) m = n;
        values[i] = n;
      }
      if (sawNaN) return NaN;
      if (m === 0) return +0;
      var sum = +0;
      for (i = 0; i < values.length; ++i) {
        var r = values[i] / m;
        sum = sum + r * r;
      }
      return m * sqrt(sum);
    });

  // 20.2.2.19 Math.imul ( x, y )
  define(
    Math, 'imul',
    function imul(x, y) {
      var a = ToUint32(x);
      var b = ToUint32(y);
      // (slow but accurate)
      var ah  = (a >>> 16) & 0xffff;
      var al = a & 0xffff;
      var bh  = (b >>> 16) & 0xffff;
      var bl = b & 0xffff;
      return ((al * bl) + (((ah * bl + al * bh) << 16) >>> 0)|0);
    }, ('imul' in Math && Math.imul(1, 0x80000000) === 0) // Safari 7 bug
  );

  // 20.2.2.20 Math.log ( x )

  // 20.2.2.21 Math.log1p ( x )
  define(
    Math, 'log1p',
    function log1p(x) {
      x = Number(x);
      // from: http://www.johndcook.com/cpp_expm1.html
      if (x < -1) {
        return NaN;
      } else if (SameValue(x, -0)) {
        return -0;
      } else if (abs(x) > 1e-4) {
        return log(1 + x);
      } else {
        return (-0.5 * x + 1) * x;
      }
    });

  // 20.2.2.22 Math.log10 ( x )
  define(
    Math, 'log10',
    function log10(x) {
      x = Number(x);
      return log(x) * LOG10E;
    });

  // 20.2.2.23 Math.log2 ( x )
  define(
    Math, 'log2',
    function log2(x) {
      x = Number(x);
      return log(x) * LOG2E;
    });

  // 20.2.2.24 Math.max ( value1, value2, ...values )
  // 20.2.2.25 Math.min ( value1, value2, ...values )
  // 20.2.2.26 Math.pow ( base, exponent )
  // 20.2.2.27 Math.random ( )
  // 20.2.2.28 Math.round ( x )

  // 20.2.2.29 Math.sign ( x )
  define(
    Math, 'sign',
    function sign(x) {
      x = Number(x);
      return x < 0 ? -1 : x > 0 ? 1 : x;
    });

  // 20.2.2.30 Math.sin ( x )

  // 20.2.2.31 Math.sinh ( x )
  define(
    Math, 'sinh',
    function sinh(x) {
      x = Number(x);
      return SameValue(x, -0) ? x : (pow(E, x) - pow(E, -x)) / 2;
    });

  // 20.2.2.32 Math.sqrt ( x )
  // 20.2.2.33 Math.tan ( x )

  // 20.2.2.34 Math.tanh ( x )
  define(
    Math, 'tanh',
    function tanh(x) {
      x = Number(x);
      var n = pow(E, 2 * x) - 1,
          d = pow(E, 2 * x) + 1;
      if (SameValue(x, -0))
        return x;
      return (n === d) ? 1 : n / d; // Handle Infinity/Infinity
    });

  // 20.2.2.35 Math.trunc ( x )
  define(
    Math, 'trunc',
    function trunc(x) {
      x = Number(x);
      return $isNaN(x) ? NaN :
        x < 0 ? ceil(x) : floor(x);
    });

  // ---------------------------------------
  // 20.3 Date Objects
  // ---------------------------------------

  // (nothing polyfillable)

  // ---------------------------------------
  // 21 Text Processing
  // ---------------------------------------

  var string_regexp_dispatch = (function() {
    var faux = {}, secret = Symbol();
    faux[Symbol.match] = function() { return secret; };
    return ("").match(faux) === secret;
  }());

  // 21.1 String Objects
  // 21.1.1 The String Constructor
  // 21.1.1.1 String ( value )
  // 21.1.2 Properties of the String Constructor
  // 21.1.2.1 String.fromCharCode ( ...codeUnits )

  // 21.1.2.2 String.fromCodePoint ( ...codePoints )
  define(
    String, 'fromCodePoint',
    function fromCodePoint(/*...codePoints*/) {
      var codePoints = arguments,
          length = codePoints.length,
          elements = [],
          nextIndex = 0;
      while (nextIndex < length) {
        var next = codePoints[nextIndex];
        var nextCP = Number(next);
        if (!SameValue(nextCP, ToInteger(nextCP)) ||
            nextCP < 0 || nextCP > 0x10FFFF) {
          throw RangeError('Invalid code point ' + nextCP);
        }
        if (nextCP < 0x10000) {
          elements.push(String.fromCharCode(nextCP));
        } else {
          nextCP -= 0x10000;
          elements.push(String.fromCharCode((nextCP >> 10) + 0xD800));
          elements.push(String.fromCharCode((nextCP % 0x400) + 0xDC00));
        }
        nextIndex += 1;
      }
      return elements.join('');
    });

  // 21.1.2.3 String.prototype

  // 21.1.2.4 String.raw ( template, ...substitutions )
  define(
    String, 'raw',
    function raw(template /*, ...substitutions*/) {
      var substitutions = [].slice.call(arguments, 1);

      var cooked = Object(template);
      var rawValue = cooked['raw'];
      var raw = Object(rawValue);
      var len = raw['length'];
      var literalSegments = ToLength(len);
      if (literalSegments <= 0) return '';
      var stringElements = [];
      var nextIndex = 0;
      while (true) {
        var next = raw[nextIndex];
        var nextSeg = String(next);
        stringElements.push(nextSeg);
        if (nextIndex + 1 === literalSegments)
          return stringElements.join('');
        next = substitutions[nextIndex];
        var nextSub = String(next);
        stringElements.push(nextSub);
        nextIndex = nextIndex + 1;
      }
    });

  // See https://githib.com/inexorabletash/uate for a more useful version.

  // 21.1.3 Properties of the String Prototype Object
  // 21.1.3.1 String.prototype.charAt ( pos )
  // 21.1.3.2 String.prototype.charCodeAt ( pos )

  // 21.1.3.3 String.prototype.codePointAt ( pos )
  define(
    String.prototype, 'codePointAt',
    function codePointAt(pos) {
      var o = strict(this);
      var s = String(o);
      var position = ToInteger(pos);
      var size = s.length;
      if (position < 0 || position >= size) return undefined;
      var first = s.charCodeAt(position);
      if (first < 0xD800 || first > 0xDBFF || position + 1 === size) return first;
      var second = s.charCodeAt(position + 1);
      if (second < 0xDC00 || second > 0xDFFF) return first;
      return ((first - 0xD800) * 1024) + (second - 0xDC00) + 0x10000;
    });

  // 21.1.3.4 String.prototype.concat ( ...args )
  // 21.1.3.5 String.prototype.constructor

  // 21.1.3.6 String.prototype.endsWith ( searchString [ , endPosition ] )
  define(
    String.prototype, 'endsWith',
    function endsWith(searchString) {
      var endPosition = arguments[1];

      var o = strict(this);
      var s = String(o);
      var searchStr = String(searchString);
      var len = s.length;
      var pos = (endPosition === undefined) ? len : ToInteger(endPosition);
      var end = min(max(pos, 0), len);
      var searchLength = searchStr.length;
      var start = end - searchLength;
      if (start < 0) return false;
      if (s.substring(start, start + searchLength) === searchStr) return true;
      return false;
    });

  // 21.1.3.7 String.prototype.includes ( searchString [ , position ] )
  define(
    String.prototype, 'includes',
    function includes(searchString) {
      var position = arguments[1];

      var o = strict(this);
      var s = String(o);
      var searchStr = String(searchString);
      var pos = ToInteger(position);
      var len = s.length;
      var start = min(max(pos, 0), len);
      return s.indexOf(searchStr, start) !== -1;
    });

  // 21.1.3.8 String.prototype.indexOf ( searchString [ , position ] )
  // 21.1.3.9 String.prototype.lastIndexOf ( searchString [ , position ] )
  // 21.1.3.10 String.prototype.localeCompare ( that [ , reserved1 [ , reserved2 ] ] )
  // 21.1.3.11 String.prototype.match ( regexp )
  define(
    String.prototype, 'match',
    function match(regexp) {
      var o = strict(this);
      var s = String(o);
      if (HasProperty(regexp, $$match)) var rx = regexp;
      else rx = new RegExp(regexp);
      return rx[$$match](s);
    }, !string_regexp_dispatch);

  // 21.1.3.12 String.prototype.normalize ( [ form ] )

  // Not practical due to table sizes; if needed, pull in:
  // https://github.com/walling/unorm/

  // 21.1.3.13 String.prototype.padEnd ( maxLength [ , fillString ] )
  define(
    String.prototype, 'padEnd',
    function padEnd(maxLength) {
      var fillString = arguments[1];

      var o = this;
      // ReturnIfAbrupt(o)
      var s = String(this);
      // ReturnIfAbrupt(s)
      var stringLength = s.length;
      if (fillString === undefined) var fillStr = '';
      else fillStr = String(fillString);
      // ReturnIfAbrupt(fillStr)
      if (fillStr === '') fillStr = ' ';
      var intMaxLength = ToLength(maxLength);
      // ReturnIfAbrupt(intMaxLength)
      if (intMaxLength <= stringLength) return s;
      var fillLen = intMaxLength - stringLength;
      var stringFiller = '';
      while (stringFiller.length < fillLen)
        stringFiller = stringFiller + fillStr;
      return s + stringFiller.substring(0, fillLen);
    });

  // 21.1.3.14 String.prototype.padStart ( maxLength [ , fillString ] )
  define(
    String.prototype, 'padStart',
    function padStart(maxLength) {
      var fillString = arguments[1];

      var o = this;
      // ReturnIfAbrupt(o)
      var s = String(this);
      // ReturnIfAbrupt(s)
      var stringLength = s.length;
      if (fillString === undefined) var fillStr = '';
      else fillStr = String(fillString);
      // ReturnIfAbrupt(fillStr)
      if (fillStr === '') fillStr = ' ';
      var intMaxLength = ToLength(maxLength);
      // ReturnIfAbrupt(intMaxLength)
      if (intMaxLength <= stringLength) return s;
      var fillLen = intMaxLength - stringLength;
      var stringFiller = '';
      while (stringFiller.length < fillLen)
        stringFiller = stringFiller + fillStr;
      return stringFiller.substring(0, fillLen) + s;
    });


  // 21.1.3.15 String.prototype.repeat ( count )
  define(
    String.prototype, 'repeat',
    function repeat(count) {
      var o = strict(this);
      var s = String(o);
      var n = ToInteger(count);
      if (n < 0) throw RangeError();
      if (n === Infinity) throw RangeError();
      var t = new Array(n + 1).join(s);
      return t;
    });

  // 21.1.3.16 String.prototype.replace ( searchValue, replaceValue )
  define(
    String.prototype, 'replace',
    function replace(searchValue, replaceValue) {
      var o = strict(this);
      if (HasProperty(searchValue, $$replace))
        return searchValue[$$replace](o, replaceValue);
      return orig_replace.call(o, searchValue, replaceValue);
    }, !string_regexp_dispatch);

  // 21.1.3.17 String.prototype.search ( regexp )
  define(
    String.prototype, 'search',
    function search(regexp) {
      var o = strict(this);
      var string = String(o);
      if (HasProperty(regexp, $$search)) var rx = regexp;
      else rx = new RegExp(regexp);
      return rx[$$search](string);
    }, !string_regexp_dispatch);

  // 21.1.3.18 String.prototype.slice ( start, end )
  // 21.1.3.19 String.prototype.split ( separator, limit )
  define(
    String.prototype, 'split',
    function split(separator, limit) {
      var o = strict(this);
      if (HasProperty(separator, $$split))
        return separator[$$split](o, limit);
      return orig_split.call(o, separator, limit);
    }, !string_regexp_dispatch);

  // 21.1.3.20 String.prototype.startsWith ( searchString [ , position ] )
  define(
    String.prototype, 'startsWith',
    function startsWith(searchString) {
      var position = arguments[1];

      var o = strict(this);
      var s = String(o);
      var searchStr = String(searchString);
      var pos = ToInteger(position);
      var len = s.length;
      var start = min(max(pos, 0), len);
      var searchLength = searchStr.length;
      if (searchLength + start > len) return false;
      if (s.substring(start, start + searchLength) === searchStr) return true;
      return false;
    });

  // 21.1.3.21 String.prototype.substring ( start, end )
  // 21.1.3.22 String.prototype.toLocaleLowerCase ( [ reserved1 [ , reserved2 ] ] )
  // 21.1.3.23 String.prototype.toLocaleUpperCase ( [ reserved1 [ , reserved2 ] ] )
  // 21.1.3.24 String.prototype.toLowerCase ( )
  // 21.1.3.25 String.prototype.toString ( )
  // 21.1.3.26 String.prototype.toUpperCase ( )
  // 21.1.3.27 String.prototype.trim ( )
  // 21.1.3.28 String.prototype.valueOf ( )

  // 21.1.3.29 String.prototype [ @@iterator ] ( )
  define(
    String.prototype, $$iterator,
    function entries() {
      return CreateStringIterator(this, 'value');
    });

  // 21.1.4 Properties of String Instances
  // 21.1.4.1 length

  // 21.1.5 String Iterator Objects
  /** @constructor */
  function StringIterator() {}

  // 21.1.5.1 CreateStringIterator ( string )
  function CreateStringIterator(string, kind) {
    var s = String(string);
    var iterator = new StringIterator;
    set_internal(iterator, '[[IteratedString]]', s);
    set_internal(iterator, '[[StringIteratorNextIndex]]', 0);
    set_internal(iterator, '[[StringIterationKind]]', kind);
    return iterator;
  }

  // 21.1.5.2 The %StringIteratorPrototype% Object
  var $StringIteratorPrototype$ = Object.create($IteratorPrototype$);
  StringIterator.prototype = $StringIteratorPrototype$;

  // 21.1.5.2.1 %StringIteratorPrototype%.next ( )
  define(
    $StringIteratorPrototype$, 'next',
    function next() {
      var o = ToObject(this);
      var s = String(o['[[IteratedString]]']),
          index = o['[[StringIteratorNextIndex]]'],
          len = s.length;
      if (index >= len) {
        set_internal(o, '[[StringIteratorNextIndex]]', Infinity);
        return CreateIterResultObject(undefined, true);
      }
      var cp = s.codePointAt(index);
      set_internal(o, '[[StringIteratorNextIndex]]', index + (cp > 0xFFFF ? 2 : 1));
      return CreateIterResultObject(String.fromCodePoint(cp), false);
    });

  // 21.1.5.2.2 %StringIteratorPrototype% [ @@toStringTag ]
  define($StringIteratorPrototype$, $$toStringTag, 'String Iterator');

  // 21.1.5.3 Properties of String Iterator Instances

  // ---------------------------------------
  // 21.2 RegExp (Regular Expression) Objects
  // ---------------------------------------

  // 21.2.3 The RegExp Constructor
  // 21.2.3.1 RegExp ( pattern, flags )
  // 21.2.3.2 Abstract Operations for the RegExp Constructor
  // 21.2.4 Properties of the RegExp Constructor
  // 21.2.4.1 RegExp.prototype
  // 21.2.4.2 get RegExp [ @@species ]
  // 21.2.5 Properties of the RegExp Prototype Object
  // 21.2.5.1 RegExp.prototype.constructor
  // 21.2.5.2 RegExp.prototype.exec ( string )
  // 21.2.5.3 get RegExp.prototype.dotAll

  // 21.2.5.4 get RegExp.prototype.flags
  if (!('flags' in RegExp.prototype)) {
    Object.defineProperty(
      RegExp.prototype, 'flags', {
        get: function() {
          var s = String(this);
          return s.substring(s.lastIndexOf('/') + 1);
        }
      });
  }

  // 21.2.5.5 get RegExp.prototype.global
  // 21.2.5.6 get RegExp.prototype.ignoreCase

  // 21.2.5.7 RegExp.prototype [ @@match ] ( string )
  define(RegExp.prototype, $$match, function(string) {
    var o = strict(this);
    return orig_match.call(string, o);
  });

  // 21.2.5.8 get RegExp.prototype.multiline

  // 21.2.5.9 RegExp.prototype [ @@replace ] ( string, replaceValue )
  define(RegExp.prototype, $$replace, function(string, replaceValue) {
    var o = strict(this);
    return orig_replace.call(string, o, replaceValue);
  });

  // 21.2.5.10 RegExp.prototype [ @@search ] ( string )
  define(RegExp.prototype, $$search, function(string) {
    var o = strict(this);
    return orig_search.call(string, o);
  });

  // 21.2.5.11 get RegExp.prototype.source

  // 21.2.5.12 RegExp.prototype [ @@split ] ( string, limit )
  define(RegExp.prototype, $$split, function(string, limit) {
    var o = strict(this);
    return orig_split.call(string, o, limit);
  });

  // 21.2.5.13 get RegExp.prototype.sticky
  // 21.2.5.14 RegExp.prototype.test ( S )
  // 21.2.5.15 RegExp.prototype.toString ( )
  // 21.2.5.16 get RegExp.prototype.unicode

  // 21.2.6 Properties of RegExp Instances
  // 21.2.6.1 lastIndex

  // ---------------------------------------
  // 22 Indexed Collections
  // ---------------------------------------

  // ---------------------------------------
  // 22.1 Array Objects
  // ---------------------------------------

  // 22.1.1 The Array Constructor
  // 22.1.1.1 Array ( )
  // 22.1.1.2 Array ( len )
  // 22.1.1.3 Array ( ...items )

  // 22.1.2 Properties of the Array Constructor

  // 22.1.2.1 Array.from ( items [ , mapfn [ , thisArg ] ] )
  define(
    Array, 'from',
    function from(items) {
      var mapfn = arguments[1];
      var thisArg = arguments[2];

      var c = strict(this);
      if (mapfn === undefined) {
        var mapping = false;
      } else {
        if (!IsCallable(mapfn)) throw TypeError();
        var t = thisArg;
        mapping = true;
      }
      var usingIterator = GetMethod(items, $$iterator);
      if (usingIterator !== undefined) {
         if (IsConstructor(c)) {
          var a = new c();
        } else {
          a = new Array(0);
        }
        var iterator = GetIterator(items, usingIterator);
        var k = 0;
        while (true) {
          var next = IteratorStep(iterator);
          if (next === false) {
            a.length = k;
            return a;
          }
          var nextValue = IteratorValue(next);
          if (mapping)
            var mappedValue = mapfn.call(t, nextValue);
          else
            mappedValue = nextValue;
          a[k] = mappedValue;
          k += 1;
        }
      }
      var arrayLike = ToObject(items);
      var lenValue = arrayLike.length;
      var len = ToLength(lenValue);
      if (IsConstructor(c)) {
        a = new c(len);
      } else {
        a = new Array(len);
      }
      k = 0;
      while (k < len) {
        var kValue = arrayLike[k];
        if (mapping)
          mappedValue = mapfn.call(t, kValue, k);
        else
          mappedValue = kValue;
        a[k] = mappedValue;
        k += 1;
      }
      a.length = len;
      return a;
    });

  // 22.1.2.2 Array.isArray ( arg )

  // 22.1.2.3 Array.of ( ...items )
  define(
    Array, 'of',
    function of() {
      var items = arguments;

      var lenValue = items.length;
      var len = ToUint32(lenValue);
      var c = strict(this), a;
      if (IsConstructor(c)) {
        a = new c(len);
        a = ToObject(a);
      } else {
        a = new Array(len);
      }
      var k = 0;
      while (k < len) {
        a[k] = items[k];
        k += 1;
      }
      a.length = len;
      return a;
    });

  // 22.1.2.4 Array.prototype
  // 22.1.2.5 get Array [ @@species ]
  // 22.1.3 Properties of the Array Prototype Object
  // 22.1.3.1 Array.prototype.concat ( ...arguments )
  // 22.1.3.1.1 RS: IsConcatSpreadable ( O )
  // 22.1.3.2 Array.prototype.constructor
  // 22.1.3.3 Array.prototype.copyWithin ( target, start [ , end ] )
  define(
    Array.prototype, 'copyWithin',
    function copyWithin(target, start/*, end*/) {
      var end = arguments[2];

      var o = ToObject(this);
      var lenVal = o.length;
      var len = ToLength(lenVal);
      len = max(len, 0);
      var relativeTarget = ToInteger(target);
      var to;
      if (relativeTarget < 0)
        to = max(len + relativeTarget, 0);
      else
        to = min(relativeTarget, len);
      var relativeStart = ToInteger(start);
      var from;
      if (relativeStart < 0)
        from = max(len + relativeStart, 0);
      else
        from = min(relativeStart, len);
      var relativeEnd;
      if (end === undefined)
        relativeEnd = len;
      else
        relativeEnd = ToInteger(end);
      var final;
      if (relativeEnd < 0)
        final = max(len + relativeEnd, 0);
      else
        final = min(relativeEnd, len);
      var count = min(final - from, len - to);
      var direction;
      if (from < to && to < from + count) {
        direction = -1;
        from = from + count - 1;
        to = to + count - 1;
      } else {
        direction = 1;
      }
      while (count > 0) {
        var fromKey = String(from);
        var toKey = String(to);
        var fromPresent = HasProperty(o, fromKey);
        if (fromPresent) {
          var fromVal = o[fromKey];
          o[toKey] = fromVal;
        } else {
          delete o[toKey];
        }
        from = from + direction;
        to = to + direction;
        count = count - 1;
      }
      return o;
    });

  // 22.1.3.4 Array.prototype.entries ( )
  var nativeArrayIteratorMethods =
        ('entries' in Array.prototype && 'next' in [].entries());

  define(
    Array.prototype, 'entries',
    function entries() {
      return CreateArrayIterator(this, 'key+value');
    }, !nativeArrayIteratorMethods);

  // 22.1.3.5 Array.prototype.every ( callbackfn [ , thisArg ] )

  // 22.1.3.6 Array.prototype.fill ( value [ , start [ , end ] ] )
  define(
    Array.prototype, 'fill',
    function fill(value/*, start, end*/) {
      var start = arguments[1],
          end = arguments[2];

      var o = ToObject(this);
      var lenVal = o.length;
      var len = ToLength(lenVal);
      len = max(len, 0);
      var relativeStart = ToInteger(start);
      var k;
      if (relativeStart < 0)
        k = max((len + relativeStart), 0);
      else
        k = min(relativeStart, len);
      var relativeEnd;
      if (end === undefined)
        relativeEnd = len;
      else
        relativeEnd = ToInteger(end);
      var final;
      if (relativeEnd < 0)
        final = max((len + relativeEnd), 0);
      else
        final = min(relativeEnd, len);
      while (k < final) {
        var pk = String(k);
        o[pk] = value;
        k += 1;
      }
      return o;
    });

  // 22.1.3.7 Array.prototype.filter ( callbackfn [ , thisArg ] )

  // 22.1.3.8 Array.prototype.find ( predicate [ , thisArg ] )
  define(
    Array.prototype, 'find',
    function find(predicate) {
      var o = ToObject(this);
      var lenValue = o.length;
      var len = ToInteger(lenValue);
      if (!IsCallable(predicate)) throw TypeError();
      var t = arguments.length > 1 ? arguments[1] : undefined;
      var k = 0;
      while (k < len) {
        var pk = String(k);
        var kPresent = HasProperty(o, pk);
        if (kPresent) {
          var kValue = o[pk];
          var testResult = predicate.call(t, kValue, k, o);
          if (Boolean(testResult)) {
            return kValue;
          }
        }
        ++k;
      }
      return undefined;
    });

  // 22.1.3.9 Array.prototype.findIndex ( predicate [ , thisArg ] )
  define(
    Array.prototype, 'findIndex',
    function findIndex(predicate) {
      var o = ToObject(this);
      var lenValue = o.length;
      var len = ToLength(lenValue);
      if (!IsCallable(predicate)) throw TypeError();
      var t = arguments.length > 1 ? arguments[1] : undefined;
      var k = 0;
      while (k < len) {
        var pk = String(k);
        var kPresent = HasProperty(o, pk);
        if (kPresent) {
          var kValue = o[pk];
          var testResult = predicate.call(t, kValue, k, o);
          if (Boolean(testResult)) {
            return k;
          }
        }
        ++k;
      }
      return -1;
    });

  // 22.1.3.10 Array.prototype.forEach ( callbackfn [ , thisArg ] )

  // 22.1.3.11 Array.prototype.includes ( searchElement [ , fromIndex ] )
  define(
    Array.prototype, 'includes',
    function includes(target) {
      var fromIndex = arguments[1];

      var o = ToObject(this);
      var len = ToLength(o["length"]);
      if (len === 0) return false;
      var n = ToInteger(fromIndex);
      if (n >= 0) {
        var k = n;
      } else {
        k = len + n;
        if (k < 0) k = 0;
      }
      while (k < len) {
        var elementK = o[k];
        if (SameValueZero(o[k], target))
          return true;
        k += 1;
      }
      return false;
    });


  // 22.1.3.12 Array.prototype.indexOf ( searchElement [ , fromIndex ] )
  // 22.1.3.13 Array.prototype.join ( separator )

  // 22.1.3.14 Array.prototype.keys ( )
  define(
    Array.prototype, 'keys',
    function keys() {
      return CreateArrayIterator(this, 'key');
    }, !nativeArrayIteratorMethods);

  // 22.1.3.15 Array.prototype.lastIndexOf ( searchElement [ , fromIndex ] )
  // 22.1.3.16 Array.prototype.map ( callbackfn [ , thisArg ] )
  // 22.1.3.17 Array.prototype.pop ( )
  // 22.1.3.18 Array.prototype.push ( ...items )
  // 22.1.3.19 Array.prototype.reduce ( callbackfn [ , initialValue ] )
  // 22.1.3.20 Array.prototype.reduceRight ( callbackfn [ , initialValue ] )
  // 22.1.3.21 Array.prototype.reverse ( )
  // 22.1.3.22 Array.prototype.shift ( )
  // 22.1.3.23 Array.prototype.slice ( start, end )
  // 22.1.3.24 Array.prototype.some ( callbackfn [ , thisArg ] )
  // 22.1.3.25 Array.prototype.sort ( comparefn )
  // 22.1.3.26 Array.prototype.splice ( start, deleteCount, ...items )
  // 22.1.3.27 Array.prototype.toLocaleString ( [ reserved1 [ , reserved2 ] ] )
  // 22.1.3.28 Array.prototype.toString ( )
  // 22.1.3.29 Array.prototype.unshift ( ...items )

  // 22.1.3.30 Array.prototype.values ( )
  define(
    Array.prototype, 'values',
    function values() {
      return CreateArrayIterator(this, 'value');
    }, !nativeArrayIteratorMethods);

  // 22.1.3.31 Array.prototype [ @@iterator ] ( )
  define(
    Array.prototype, $$iterator,
    Array.prototype.values
    );

  // 22.1.3.32 Array.prototype [ @@unscopables ]
  // 22.1.4 Properties of Array Instances
  // 22.1.4.1 length

  // 22.1.5 Array Iterator Objects
  function ArrayIterator() {}

  // 22.1.5.1 CreateArrayIterator ( array, kind )
  function CreateArrayIterator(array, kind) {
    var o = ToObject(array);
    var iterator = new ArrayIterator;
    set_internal(iterator, '[[IteratedObject]]', o);
    set_internal(iterator, '[[ArrayIteratorNextIndex]]', 0);
    set_internal(iterator, '[[ArrayIterationKind]]', kind);
    return iterator;
  }

  // 22.1.5.2 The %ArrayIteratorPrototype% Object
  var $ArrayIteratorPrototype$ = Object.create($IteratorPrototype$);
  ArrayIterator.prototype = $ArrayIteratorPrototype$;

  // 22.1.5.2.1 %ArrayIteratorPrototype%.next ( )
  define(
    $ArrayIteratorPrototype$, 'next',
    function next() {
      var o = strict(this);
      if (Type(o) !== 'object') throw TypeError();
      var a = o['[[IteratedObject]]'],
          index = o['[[ArrayIteratorNextIndex]]'],
          itemKind = o['[[ArrayIterationKind]]'],
          lenValue = a.length,
          len = ToUint32(lenValue),
          elementKey,
          elementValue;
      if (itemKind.indexOf('sparse') !== -1) {
        var found = false;
        while (!found && index < len) {
          elementKey = String(index);
          found = HasProperty(a, elementKey);
          if (!found) {
            index += 1;
          }
        }
      }
      if (index >= len) {
        set_internal(o, '[[ArrayIteratorNextIndex]]', Infinity);
        return CreateIterResultObject(undefined, true);
      }
      elementKey = index;
      set_internal(o, '[[ArrayIteratorNextIndex]]', index + 1);
      if (itemKind.indexOf('value') !== -1)
        elementValue = a[elementKey];
      if (itemKind.indexOf('key+value') !== -1)
        return CreateIterResultObject([elementKey, elementValue], false);
      if (itemKind.indexOf('key') !== -1)
        return CreateIterResultObject(elementKey, false);
      if (itemKind === 'value')
        return CreateIterResultObject(elementValue, false);
      throw Error('Internal error');
    });

  // 22.1.5.2.2 %ArrayIteratorPrototype% [ @@toStringTag ]
  define($ArrayIteratorPrototype$, $$toStringTag, 'Array Iterator');

  // 22.1.5.3 Properties of Array Iterator Instances


  // ---------------------------------------
  // 22.2 TypedArray Objects
  // ---------------------------------------

  ['Int8Array', 'Uint8Array', 'Uint8ClampedArray',
   'Int16Array', 'Uint16Array',
   'Int32Array', 'Uint32Array',
   'Float32Array', 'Float64Array'].forEach(function ($TypedArrayName$) {
     if (!($TypedArrayName$ in global))
       return;
     var $TypedArray$ = global[$TypedArrayName$];

     // 22.2.1 The %TypedArray% Intrinsic Object
     // 22.2.1.1 %TypedArray% ( length )
     // 22.2.1.2 %TypedArray% ( typedArray )
     // 22.2.1.3 %TypedArray% ( object )
     // 22.2.1.4 %TypedArray% ( buffer [ , byteOffset [ , length ] ] )
     // 22.2.1.5 %TypedArray% ( all other argument combinations )
     // 22.2.2 Properties of the %TypedArray% Intrinsic Object

     // 22.2.2.1 %TypedArray%.from ( source [ , mapfn [ , thisArg ] ] )
     define(
       $TypedArray$, 'from',
       function from(source) {
         var mapfn = arguments[1];
         var thisArg = arguments[2];

         var c = strict(this);
         if (!IsConstructor(c)) throw TypeError();
         if (mapfn === undefined) {
           var mapping = false;
         } else {
           if (IsCallable(mapfn)) throw TypeError();
           var t = thisArg;
           mapping = true;
         }
         var usingIterator = GetMethod(source, $$iterator);
         if (usingIterator !== undefined) {
           var iterator = GetIterator(source, usingIterator);
           var values = [];
           var next = true;
           while (next !== false) {
             next = IteratorStep(iterator);
             if (next !== false) {
               var nextValue = IteratorValue(next);
               values.push(nextValue);
             }
           }
           var len = values.length;
           var newObj = new c(len);
           var k = 0;
           while (k < len) {
             var kValue = values.shift();
             if (mapping) {
               var mappedValue = mapfn.call(t, kValue);
             } else {
               mappedValue = kValue;
             }
             newObj[k] = mappedValue;
             ++k;
           }
           console.assert(values.length === 0);
           return newObj;
         }
         var arrayLike = ToObject(source);
         var lenValue = arrayLike.length;
         len = ToLength(lenValue);
         newObj = new c(len);
         k = 0;
         while (k < len) {
           kValue = arrayLike[k];
           if (mapping) {
             mappedValue = mapfn.call(t, kValue, k);
           } else {
             mappedValue = kValue;
           }
           newObj[k] = mappedValue;
           ++k;
         }
         return newObj;
       });

     // 22.2.2.2 %TypedArray%.of ( ...items )
     define(
       $TypedArray$, 'of',
       function of() {
         var items = arguments;

         var len = items.length;
         var c = strict(this);
         var newObj = new c(len);
         var k = 0;
         while (k < len) {
           newObj[k] = items[k];
           ++k;
         }
         return newObj;
       });

     // 22.2.2.3 %TypedArray%.prototype
     // 22.2.2.4 get %TypedArray% [ @@species ]
     // 22.2.3 Properties of the %TypedArrayPrototype% Object
     // 22.2.3.1 get %TypedArray%.prototype.buffer
     // 22.2.3.2 get %TypedArray%.prototype.byteLength
     // 22.2.3.3 get %TypedArray%.prototype.byteOffset
     // 22.2.3.4 %TypedArray%.prototype.constructor

     // 22.2.3.5 %TypedArray%.prototype.copyWithin ( target, start [ , end ] )
     define($TypedArray$.prototype, 'copyWithin', Array.prototype.copyWithin);

     // 22.2.3.6 %TypedArray%.prototype.entries ( )
     define($TypedArray$.prototype, 'entries', Array.prototype.entries);

     // 22.2.3.7 %TypedArray%.prototype.every ( callbackfn [ , thisArg ] )
     define($TypedArray$.prototype, 'every', Array.prototype.every);

     // 22.2.3.8 %TypedArray%.prototype.fill ( value [ , start [ , end ] ] )
     define(
       $TypedArray$.prototype, 'fill',
       //Array.prototype.fill // Doesn't work in Safari 7
       function fill(value/*, start, end*/) {
         var start = arguments[1],
             end = arguments[2];

         var o = ToObject(this);
         var lenVal = o.length;
         var len = ToLength(lenVal);
         len = max(len, 0);
         var relativeStart = ToInteger(start);
         var k;
         if (relativeStart < 0) k = max((len + relativeStart), 0);
         else k = min(relativeStart, len);
         var relativeEnd;
         if (end === undefined) relativeEnd = len;
         else relativeEnd = ToInteger(end);
         var final;
         if (relativeEnd < 0) final = max((len + relativeEnd), 0);
         else final = min(relativeEnd, len);
         while (k < final) {
           var pk = String(k);
           o[pk] = value;
           k += 1;
         }
         return o;
       });

     // 22.2.3.9 %TypedArray%.prototype.filter ( callbackfn [ , thisArg ] )
     define(
       $TypedArray$.prototype, 'filter',
       function filter(callbackfn) {
         var thisArg = arguments[1];

         var o = ToObject(this);
         var lenVal = o.length;
         var len = ToLength(lenVal);
         if (!IsCallable(callbackfn)) throw TypeError();
         var t = thisArg;
         var c = o.constructor;
         var kept = [];
         var k = 0;
         var captured = 0;
         while (k < len) {
           var kValue = o[k];
           var selected = callbackfn.call(t, kValue, k, o);
           if (selected) {
             kept.push(kValue);
             ++captured;
           }
           ++k;
         }
         var a = new c(captured);
         var n = 0;
         for (var i = 0; i < kept.length; ++i) {
           var e = kept[i];
           a[n] = e;
           ++n;
         }
         return a;
       });

     // 22.2.3.10 %TypedArray%.prototype.find ( predicate [ , thisArg ] )
     define($TypedArray$.prototype, 'find', Array.prototype.find);

     // 22.2.3.11 %TypedArray%.prototype.findIndex ( predicate [ , thisArg ] )
     define($TypedArray$.prototype, 'findIndex', Array.prototype.findIndex);

     // 22.2.3.12 %TypedArray%.prototype.forEach ( callbackfn [ , thisArg ] )
     define($TypedArray$.prototype, 'forEach', Array.prototype.forEach);

     // 22.2.3.13 %TypedArray%.prototype.includes ( searchElement [ , fromIndex ] )
     // TODO: Implement.

     // 22.2.3.14 %TypedArray%.prototype.indexOf ( searchElement [ , fromIndex ] )
     define($TypedArray$.prototype, 'indexOf', Array.prototype.indexOf);

     // 22.2.3.15 %TypedArray%.prototype.join ( separator )
     define($TypedArray$.prototype, 'join', Array.prototype.join);

     // 22.2.3.16 %TypedArray%.prototype.keys ( )
     define($TypedArray$.prototype, 'keys', Array.prototype.keys);

     // 22.2.3.17 %TypedArray%.prototype.lastIndexOf ( searchElement [ , fromIndex ] )
     define($TypedArray$.prototype, 'lastIndexOf', Array.prototype.lastIndexOf);

     // 22.2.3.18 get %TypedArray%.prototype.length

     // 22.2.3.19 %TypedArray%.prototype.map ( callbackfn [ , thisArg ] )
     define(
       $TypedArray$.prototype, 'map',
       function map(callbackfn) {
         var thisArg = arguments[1];

         var o = ToObject(this);
         var lenValue = o.length;
         var len = ToLength(lenValue);
         if (!IsCallable(callbackfn)) throw TypeError();
         var t = thisArg;
         var a = undefined;
         var c = o.constructor;
         if (IsConstructor(c))
           a = new c(len);
         if (a === undefined)
           a = new Array(len);
         var k = 0;
         while (k < len) {
           var kPresent = HasProperty(o, k);
           if (kPresent) {
             var kValue = o[k];
             var mappedValue = callbackfn.call(t, kValue, k, o);
             a[k] = mappedValue;
           }
           ++k;
         }
         return a;
       });

     // 22.2.3.20 %TypedArray%.prototype.reduce ( callbackfn [ , initialValue ] )
     define($TypedArray$.prototype, 'reduce', Array.prototype.reduce);

     // 22.2.3.21 %TypedArray%.prototype.reduceRight ( callbackfn [ , initialValue ] )
     define($TypedArray$.prototype, 'reduceRight', Array.prototype.reduceRight);

     // 22.2.3.22 %TypedArray%.prototype.reverse ( )
     define($TypedArray$.prototype, 'reverse', Array.prototype.reverse);

     // 22.2.3.23 %TypedArray%.prototype.set ( overloaded [ , offset ] )
     // 22.2.3.23.1 %TypedArray%.prototype.set ( array [ , offset ] )
     // 22.2.3.23.2 %TypedArray%.prototype.set ( typedArray [ , offset ] )

     // 22.2.3.24 %TypedArray%.prototype.slice ( start, end )
     define(
       $TypedArray$.prototype, 'slice',
       function slice(start, end) {
         var o = ToObject(this);
         var lenVal = o.length;
         var len = ToLength(lenVal);
         var relativeStart = ToInteger(start);
         var k = (relativeStart < 0) ? max(len + relativeStart, 0) : min(relativeStart, len);
         var relativeEnd = (end === undefined) ? len : ToInteger(end);
         var final = (relativeEnd < 0) ? max(len + relativeEnd, 0) : min(relativeEnd, len);
         var count = final - k;
         var c = o.constructor;
         if (IsConstructor(c)) {
           var a = new c(count);
         } else {
           throw TypeError();
         }
         var n = 0;
         while (k < final) {
           var kValue = o[k];
           a[n] = kValue;
           ++k;
           ++n;
         }
         return a;
       });

     // 22.2.3.25 %TypedArray%.prototype.some ( callbackfn [ , thisArg ] )
     define($TypedArray$.prototype, 'some', Array.prototype.some);

     // 22.2.3.26 %TypedArray%.prototype.sort ( comparefn )
     define(
       $TypedArray$.prototype, 'sort',
       function sort() {
         var comparefn = arguments[0];

         function sortCompare(x, y) {
           console.assert(Type(x) === 'number' && Type(y) === 'number');
           if (x !== x && y !== y) return +0;
           if (x !== x) return 1;
           if (y !== y) return -1;
           if (comparefn !== undefined) {
             return comparefn(x, y);
           }
           if (x < y) return -1;
           if (x > y) return 1;
           return +0;
         }
         return Array.prototype.sort.call(this, sortCompare);
       });

     // 22.2.3.27 %TypedArray%.prototype.subarray ( begin, end )
     // 22.2.3.28 %TypedArray%.prototype.toLocaleString ( [ reserved1 [ , reserved2 ] ] )
     // 22.2.3.29 %TypedArray%.prototype.toString ( )

     // 22.2.3.30 %TypedArray%.prototype.values ( )
     define($TypedArray$.prototype, 'values', Array.prototype.values);

     // 22.2.3.31 %TypedArray%.prototype [ @@iterator ] ( )
     define(
       $TypedArray$.prototype, $$iterator,
       $TypedArray$.prototype.values
     );

     // 22.2.3.32 get %TypedArray%.prototype [ @@toStringTag ]
     define($TypedArray$.prototype, $$toStringTag, $TypedArrayName$);

     // 22.2.4 The TypedArray Constructors
     // 22.2.5 Properties of the TypedArray Constructors
     // 22.2.6 Properties of the TypedArray Prototype Objects
     // 22.2.7 Properties of TypedArray Instances
   });

  // ---------------------------------------
  // 23 Keyed Collections
  // ---------------------------------------

  // ---------------------------------------
  // 23.1 Map Objects
  // ---------------------------------------

  (function() {
    // 23.1.1 The Map Constructor

    // 23.1.1.1 Map ( [ iterable ] )
    /** @constructor */
    function Map(/*iterable*/) {
      var map = strict(this);
      var iterable = arguments[0];

      if (Type(map) !== 'object') throw TypeError();
      if ('[[MapData]]' in map) throw TypeError();

      if (iterable !== undefined) {
        var adder = map['set'];
        if (!IsCallable(adder)) throw TypeError();
        var iter = GetIterator(ToObject(iterable));
      }
      set_internal(map, '[[MapData]]', { keys: [], values: [] });
      if (iter === undefined) return map;
      while (true) {
        var next = IteratorStep(iter);
        if (next === false)
          return map;
        var nextItem = IteratorValue(next);
        if (Type(nextItem) !== 'object') throw TypeError();
        var k = nextItem[0];
        var v = nextItem[1];
        adder.call(map, k, v);
      }

      return map;
    }

    if (!('Map' in global) ||
        (function() { try { new global.Map([]); return false; } catch (_) { return true; } }()) ||
        (function() { try { return !new global.Map().entries().next; } catch (_) { return true; } }()) ||
        (new global.Map([['a', 1]]).size !== 1))
      global.Map = Map;


    function MapDataIndexOf(mapData, key) {
      var i;
      if (key === key) return mapData.keys.indexOf(key);
      // Slow case for NaN
      for (i = 0; i < mapData.keys.length; i += 1)
        if (SameValueZero(mapData.keys[i], key)) return i;
      return -1;
    }

    // 23.1.2 Properties of the Map Constructor
    // 23.1.2.1 Map.prototype
    var $MapPrototype$ = {};
    Map.prototype = $MapPrototype$;

    // 23.1.2.2 get Map [ @@species ]

    // 23.1.3 Properties of the Map Prototype Object
    // 23.1.3.1 Map.prototype.clear ( )
    define(
      Map.prototype, 'clear',
      function clear() {
        var m = strict(this);
        if (Type(m) !== 'object') throw TypeError();
        if (!('[[MapData]]' in m)) throw TypeError();
        if (m['[[MapData]]'] === undefined) throw TypeError();
        var entries = m['[[MapData]]'];
        entries.keys.length = 0;
        entries.values.length = 0;
        return undefined;
      });

    // 23.1.3.2 Map.prototype.constructor

    // 23.1.3.3 Map.prototype.delete ( key )
    define(
      Map.prototype, 'delete',
      function delete_(key) {
        var m = strict(this);
        if (Type(m) !== 'object') throw TypeError();
        if (!('[[MapData]]' in m)) throw TypeError();
        if (m['[[MapData]]'] === undefined) throw TypeError();
        var entries = m['[[MapData]]'];
        var i = MapDataIndexOf(entries, key);
        if (i < 0) return false;
        entries.keys[i] = empty;
        entries.values[i] = empty;
        return true;
      });

    // 23.1.3.4 Map.prototype.entries ( )
    define(
      Map.prototype, 'entries',
      function entries() {
        var m = strict(this);
        if (Type(m) !== 'object') throw TypeError();
        return CreateMapIterator(m, 'key+value');
      });

    // 23.1.3.5 Map.prototype.forEach ( callbackfn [ , thisArg ] )
    define(
      Map.prototype, 'forEach',
      function forEach(callbackfn /*, thisArg*/) {
        var thisArg = arguments[1];

        var m = strict(this);
        if (Type(m) !== 'object') throw TypeError();
        if (!('[[MapData]]' in m)) throw TypeError();
        if (m['[[MapData]]'] === undefined) throw TypeError();
        var entries = m['[[MapData]]'];

        if (!IsCallable(callbackfn)) {
          throw TypeError('First argument to forEach is not callable.');
        }
        for (var i = 0; i < entries.keys.length; ++i) {
          if (entries.keys[i] !== empty) {
            callbackfn.call(thisArg, entries.values[i], entries.keys[i], m);
          }
        }
        return undefined;
      });

    // 23.1.3.6 Map.prototype.get ( key )
    define(
      Map.prototype, 'get',
      function get(key) {
        var m = strict(this);
        if (Type(m) !== 'object') throw TypeError();
        if (!('[[MapData]]' in m)) throw TypeError();
        if (m['[[MapData]]'] === undefined) throw TypeError();
        var entries = m['[[MapData]]'];
        var i = MapDataIndexOf(entries, key);
        if (i >= 0) return entries.values[i];
        return undefined;
      });

    // 23.1.3.7 Map.prototype.has ( key )
    define(
      Map.prototype, 'has',
      function has(key) {
        var m = strict(this);
        if (Type(m) !== 'object') throw TypeError();
        if (!('[[MapData]]' in m)) throw TypeError();
        if (m['[[MapData]]'] === undefined) throw TypeError();
        var entries = m['[[MapData]]'];
        if (MapDataIndexOf(entries, key) >= 0) return true;
        return false;
      });

    // 23.1.3.8 Map.prototype.keys ( )
    define(
      Map.prototype, 'keys',
      function keys() {
        var m = strict(this);
        if (Type(m) !== 'object') throw TypeError();
        return CreateMapIterator(m, 'key');
      });

    // 23.1.3.9 Map.prototype.set ( key, value )
    define(
      Map.prototype, 'set',
      function set(key, value) {
        var m = strict(this);
        if (Type(m) !== 'object') throw TypeError();
        if (!('[[MapData]]' in m)) throw TypeError();
        if (m['[[MapData]]'] === undefined) throw TypeError();
        var entries = m['[[MapData]]'];
        var i = MapDataIndexOf(entries, key);
        if (i < 0) i = entries.keys.length;
        if (SameValue(key, -0)) key = 0;
        entries.keys[i] = key;
        entries.values[i] = value;
        return m;
      });

    // 23.1.3.10 get Map.prototype.size
    Object.defineProperty(
      Map.prototype, 'size', {
        get: function() {
          var m = strict(this);
          if (Type(m) !== 'object') throw TypeError();
          if (!('[[MapData]]' in m)) throw TypeError();
          if (m['[[MapData]]'] === undefined) throw TypeError();
          var entries = m['[[MapData]]'];
          var count = 0;
          for (var i = 0; i < entries.keys.length; ++i) {
            if (entries.keys[i] !== empty)
              count = count + 1;
          }
          return count;
        }
      });

    // 23.1.3.11 Map.prototype.values ( )
    define(
      Map.prototype, 'values',
      function values() {
        var m = strict(this);
        if (Type(m) !== 'object') throw TypeError();
        return CreateMapIterator(m, 'value');
      });

    // 23.1.3.12 Map.prototype [ @@iterator ] ( )
    define(
      Map.prototype, $$iterator,
      function() {
        var m = strict(this);
        if (Type(m) !== 'object') throw TypeError();
        return CreateMapIterator(m, 'key+value');
      });

    // 23.1.3.13 Map.prototype [ @@toStringTag ]
    define(global.Map.prototype, $$toStringTag, 'Map');

    // 23.1.4 Properties of Map Instances
    // 23.1.5 Map Iterator Objects

    /** @constructor */
    function MapIterator() {}

    // 23.1.5.1 CreateMapIterator ( map, kind )
    function CreateMapIterator(map, kind) {
      if (Type(map) !== 'object') throw TypeError();
      if (!('[[MapData]]' in map)) throw TypeError();
      if (map['[[MapData]]'] === undefined) throw TypeError();
      var iterator = new MapIterator;
      set_internal(iterator, '[[Map]]', map);
      set_internal(iterator, '[[MapNextIndex]]', 0);
      set_internal(iterator, '[[MapIterationKind]]', kind);
      return iterator;
    }

    // 23.1.5.2 The %MapIteratorPrototype% Object
    var $MapIteratorPrototype$ = Object.create($IteratorPrototype$);
    MapIterator.prototype = $MapIteratorPrototype$;

    // 23.1.5.2.1 %MapIteratorPrototype%.next ( )
    define(
      $MapIteratorPrototype$, 'next',
      function next() {
        var o = strict(this);
        if (Type(o) !== 'object') throw TypeError();
        var m = o['[[Map]]'],
            index = o['[[MapNextIndex]]'],
            itemKind = o['[[MapIterationKind]]'],
            entries = m['[[MapData]]'];
        while (index < entries.keys.length) {
          var e = {key: entries.keys[index], value: entries.values[index]};
          index = index += 1;
          set_internal(o, '[[MapNextIndex]]', index);
          if (e.key !== empty) {
            if (itemKind === 'key') {
              return CreateIterResultObject(e.key, false);
            } else if (itemKind === 'value') {
              return CreateIterResultObject(e.value, false);
            } else {
              return CreateIterResultObject([e.key, e.value], false);
            }
          }
        }
        return CreateIterResultObject(undefined, true);
      });

    // 23.1.5.2.2 %MapIteratorPrototype% [ @@toStringTag ]
    define($MapIteratorPrototype$, $$toStringTag, 'Map Iterator');

    // 23.1.5.3 Properties of Map Iterator Instances
  }());

  // ---------------------------------------
  // 23.2 Set Objects
  // ---------------------------------------

  (function() {
    // 23.2.1 The Set Constructor
    // 23.2.1.1 Set ( [ iterable ] )

    /** @constructor */
    function Set(/*iterable*/) {
      var set = strict(this);
      var iterable = arguments[0];

      if (Type(set) !== 'object') throw TypeError();
      if ('[[SetData]]' in set) throw TypeError();

      if (iterable !== undefined) {
        var adder = set['add'];
        if (!IsCallable(adder)) throw TypeError();
        var iter = GetIterator(ToObject(iterable));
      }
      set_internal(set, '[[SetData]]', []);
      if (iter === undefined) return set;
      while (true) {
        var next = IteratorStep(iter);
        if (next === false)
          return set;
        var nextValue = IteratorValue(next);
        adder.call(set, nextValue);
      }

      return set;
    }

    if (!('Set' in global) ||
        (function() { try { return !new global.Set().entries().next; } catch (_) { return true; } }()) ||
        (new global.Set([1]).size !== 1))
      global.Set = Set;

    function SetDataIndexOf(setData, key) {
      var i;
      if (key === key)
        return setData.indexOf(key);
      // Slow case for NaN
      for (i = 0; i < setData.length; i += 1)
        if (SameValueZero(setData[i], key)) return i;
      return -1;
    }

    // 23.2.2 Properties of the Set Constructor

    // 23.2.2.1 Set.prototype
    var $SetPrototype$ =  {};
    Set.prototype = $SetPrototype$;

    // 23.2.2.2 get Set [ @@species ]
    // 23.2.3 Properties of the Set Prototype Object

    // 23.2.3.1 Set.prototype.add ( value )
    define(
      Set.prototype, 'add',
      function add(value) {
        var s = strict(this);
        if (Type(s) !== 'object') throw TypeError();
        if (!('[[SetData]]' in s)) throw TypeError();
        if (s['[[SetData]]'] === undefined) throw TypeError();
        if (SameValue(value, -0)) value = 0;
        var entries = s['[[SetData]]'];
        var i = SetDataIndexOf(entries, value);
        if (i < 0) i = s['[[SetData]]'].length;
        s['[[SetData]]'][i] = value;

        return s;
      });

    // 23.2.3.2 Set.prototype.clear ( )
    define(
      Set.prototype, 'clear',
      function clear() {
        var s = strict(this);
        if (Type(s) !== 'object') throw TypeError();
        if (!('[[SetData]]' in s)) throw TypeError();
        if (s['[[SetData]]'] === undefined) throw TypeError();
        var entries = s['[[SetData]]'];
        entries.length = 0;
        return undefined;
      });

    // 23.2.3.3 Set.prototype.constructor
    // 23.2.3.4 Set.prototype.delete ( value )
    define(
      Set.prototype, 'delete',
      function delete_(value) {
        var s = strict(this);
        if (Type(s) !== 'object') throw TypeError();
        if (!('[[SetData]]' in s)) throw TypeError();
        if (s['[[SetData]]'] === undefined) throw TypeError();
        var entries = s['[[SetData]]'];
        var i = SetDataIndexOf(entries, value);
        if (i < 0) return false;
        entries[i] = empty;
        return true;
      });

    // 23.2.3.5 Set.prototype.entries ( )
    define(
      Set.prototype, 'entries',
      function entries() {
        var s = strict(this);
        if (Type(s) !== 'object') throw TypeError();
        return CreateSetIterator(s, 'key+value');
      });

    // 23.2.3.6 Set.prototype.forEach ( callbackfn [ , thisArg ] )
    define(
      Set.prototype, 'forEach',
      function forEach(callbackfn/*, thisArg*/) {
        var thisArg = arguments[1];

        var s = strict(this);
        if (Type(s) !== 'object') throw TypeError();
        if (!('[[SetData]]' in s)) throw TypeError();
        if (s['[[SetData]]'] === undefined) throw TypeError();
        var entries = s['[[SetData]]'];

        if (!IsCallable(callbackfn)) {
          throw TypeError('First argument to forEach is not callable.');
        }
        for (var i = 0; i < entries.length; ++i) {
          if (entries[i] !== empty) {
            callbackfn.call(thisArg, entries[i], entries[i], s);
          }
        }
      });

    // 23.2.3.7 Set.prototype.has ( value )
    define(
      Set.prototype, 'has',
      function has(key) {
        var s = strict(this);
        if (Type(s) !== 'object') throw TypeError();
        if (!('[[SetData]]' in s)) throw TypeError();
        if (s['[[SetData]]'] === undefined) throw TypeError();
        var entries = s['[[SetData]]'];
        return SetDataIndexOf(entries, key) !== -1;
      });

    // 23.2.3.8 Set.prototype.keys ( )
    // See Set.prototype.values

    // 23.2.3.9 get Set.prototype.size
    Object.defineProperty(
      Set.prototype, 'size', {
        get: function() {
          var s = strict(this);
          if (Type(s) !== 'object') throw TypeError();
          if (!('[[SetData]]' in s)) throw TypeError();
          if (s['[[SetData]]'] === undefined) throw TypeError();
          var entries = s['[[SetData]]'];
          var count = 0;
          for (var i = 0; i < entries.length; ++i) {
            if (entries[i] !== empty)
              count = count + 1;
          }
          return count;
        }
      });

    // 23.2.3.10 Set.prototype.values ( )
    define(
      Set.prototype, 'values',
      function values() {
        var s = strict(this);
        if (Type(s) !== 'object') throw TypeError();
        return CreateSetIterator(s, 'value');
      });
    // NOTE: function name is still 'values':
    Set.prototype.keys = Set.prototype.values;

    // 23.2.3.11 Set.prototype [ @@iterator ] ( )
    define(
      Set.prototype, $$iterator,
      function() {
        var s = strict(this);
        if (Type(s) !== 'object') throw TypeError();
        return CreateSetIterator(s);
      });

    // 23.2.3.12 Set.prototype [ @@toStringTag ]
    define(global.Set.prototype, $$toStringTag, 'Set');

    // 23.2.4 Properties of Set Instances
    // 23.2.5 Set Iterator Objects
    /** @constructor */
    function SetIterator() {}

    // 23.2.5.1 CreateSetIterator ( set, kind )
    function CreateSetIterator(set, kind) {
      if (Type(set) !== 'object') throw TypeError();
      if (!('[[SetData]]' in set)) throw TypeError();
      if (set['[[SetData]]'] === undefined) throw TypeError();
      var iterator = new SetIterator;
      set_internal(iterator, '[[IteratedSet]]', set);
      set_internal(iterator, '[[SetNextIndex]]', 0);
      set_internal(iterator, '[[SetIterationKind]]', kind);
      return iterator;
    }

    // 23.2.5.2 The %SetIteratorPrototype% Object
    var $SetIteratorPrototype$ = Object.create($IteratorPrototype$);
    SetIterator.prototype = $SetIteratorPrototype$;

    // 23.2.5.2.1 %SetIteratorPrototype%.next ( )
    define(
      $SetIteratorPrototype$, 'next',
      function next() {
        var o = strict(this);
        if (Type(o) !== 'object') throw TypeError();
        var s = o['[[IteratedSet]]'],
            index = o['[[SetNextIndex]]'],
            itemKind = o['[[SetIterationKind]]'],
            entries = s['[[SetData]]'];
        while (index < entries.length) {
          var e = entries[index];
          index = index += 1;
          set_internal(o, '[[SetNextIndex]]', index);
          if (e !== empty) {
            if (itemKind === 'key+value')
              return CreateIterResultObject([e, e], false);
            return CreateIterResultObject(e, false);
          }
        }
        return CreateIterResultObject(undefined, true);
      });

    // 23.2.5.2.2 %SetIteratorPrototype% [ @@toStringTag ]
    define($SetIteratorPrototype$, $$toStringTag, 'Set Iterator');

    // 23.2.5.3 Properties of Set Iterator Instances

  }());

  // ---------------------------------------
  // 23.3 WeakMap Objects
  // ---------------------------------------

  // 23.3.1 The WeakMap Constructor
  // 23.3.1.1 WeakMap ( [ iterable ] )
  // 23.3.2 Properties of the WeakMap Constructor
  // 23.3.2.1 WeakMap.prototype
  // 23.3.3 Properties of the WeakMap Prototype Object
  // 23.3.3.1 WeakMap.prototype.constructor
  // 23.3.3.2 WeakMap.prototype.delete ( key )
  // 23.3.3.3 WeakMap.prototype.get ( key )
  // 23.3.3.4 WeakMap.prototype.has ( key )

  // 23.3.3.5 WeakMap.prototype.set ( key, value )
  // Patch to return self.
  (function() {
    var wm = new global.WeakMap();
    var orig = global.WeakMap.prototype.set;
    define(global.WeakMap.prototype, 'set', function set() {
      orig.apply(this, arguments);
      return this;
    }, wm.set({}, 0) !== wm);
  }());

  // 23.3.3.6 WeakMap.prototype [ @@toStringTag ]
  define(WeakMap.prototype, $$toStringTag, 'WeakMap');

  // 23.3.4 Properties of WeakMap Instances


  // ---------------------------------------
  // 23.4 WeakSet Objects
  // ---------------------------------------

  (function() {
    // 23.4.1 The WeakSet Constructor
    // 23.4.1.1 WeakSet ( [ iterable ] )
    /** @constructor */
    function WeakSet(/*iterable*/) {
      var set = strict(this);
      var iterable = arguments[0];

      if (Type(set) !== 'object') throw TypeError();
      if ('[[WeakSetData]]' in set) throw TypeError();

      if (iterable !== undefined) {
        var adder = set['add'];
        if (!IsCallable(adder)) throw TypeError();
        var iter = GetIterator(ToObject(iterable));
      }
      set_internal(set, '[[WeakSetData]]', new WeakMap);
      if (iter === undefined) return set;
      while (true) {
        var next = IteratorStep(iter);
        if (next === false)
          return set;
        var nextValue = IteratorValue(next);
        adder.call(set, nextValue);
      }

      return set;
    }

    if (!('WeakSet' in global))
      global.WeakSet = WeakSet;

    // 23.4.2 Properties of the WeakSet Constructor
    // 23.4.2.1 WeakSet.prototype
    var $WeakSetPrototype$ = {};
    WeakSet.prototype = $WeakSetPrototype$;

    // 23.4.3 Properties of the WeakSet Prototype Object
    // 23.4.3.1 WeakSet.prototype.add ( value )
    define(
      WeakSet.prototype, 'add',
      function add(value) {
        var S = strict(this);
        if (Type(S) !== 'object') throw TypeError();
        if (S['[[WeakSetData]]'] === undefined) throw TypeError();
        if (Type(value) !== 'object') throw TypeError('Expected object');
        S['[[WeakSetData]]'].set(value, true);
        return S;
      });

    // 23.4.3.2 WeakSet.prototype.constructor
    // 23.4.3.3 WeakSet.prototype.delete ( value )
    define(
      WeakSet.prototype, 'delete',
      function delete_(value) {
        var S = strict(this);
        if (Type(S) !== 'object') throw TypeError();
        if (S['[[WeakSetData]]'] === undefined) throw TypeError();
        if (Type(value) !== 'object') throw TypeError('Expected object');
        return S['[[WeakSetData]]'].delete(value);
      });

    // 23.4.3.4 WeakSet.prototype.has ( value )
    define(
      WeakSet.prototype, 'has',
      function has(key) {
        var S = strict(this);
        if (Type(S) !== 'object') throw TypeError();
        if (S['[[WeakSetData]]'] === undefined) throw TypeError();
        if (Type(key) !== 'object') throw TypeError('Expected object');
        return S['[[WeakSetData]]'].get(key) === true;
      });

    // 23.4.3.5 WeakSet.prototype [ @@toStringTag ]
    define(global.WeakSet.prototype, $$toStringTag, 'WeakSet');

    // 23.4.4 Properties of WeakSet Instances

    // Polyfills for incomplete native implementations:
    (function() {
      var ws = new global.WeakSet();
      var orig = global.WeakSet.prototype.add;
      define(global.WeakSet.prototype, 'add', function add() {
        orig.apply(this, arguments);
        return this;
      }, ws.add({}) !== ws);
    }());
  }());

  // ---------------------------------------
  // 24 Structured Data
  // ---------------------------------------

  // ---------------------------------------
  // 24.1 ArrayBuffer Objects
  // ---------------------------------------

  (function() {
    if (!('ArrayBuffer' in global))
      return;

    // 24.1.1 Abstract Operations For ArrayBuffer Objects
    // 24.1.1.1 AllocateArrayBuffer ( constructor, byteLength )
    // 24.1.1.2 IsDetachedBuffer ( arrayBuffer )
    // 24.1.1.3 DetachArrayBuffer ( arrayBuffer )
    // 24.1.1.4 CloneArrayBuffer ( srcBuffer, srcByteOffset [, cloneConstructor] )
    // 24.1.1.5 GetValueFromBuffer ( arrayBuffer, byteIndex, type, isLittleEndian )
    // 24.1.1.6 SetValueInBuffer ( arrayBuffer, byteIndex, type, value, isLittleEndian )
    // 24.1.2 The ArrayBuffer Constructor
    // 24.1.2.1 ArrayBuffer ( length )
    // 24.1.3 Properties of the ArrayBuffer Constructor

    // 24.1.3.1 ArrayBuffer.isView ( arg )
    define(
      ArrayBuffer, 'isView',
      function isView(arg) {
        if (Type(arg) !== 'object') return false;
        if ('buffer' in arg && arg.buffer instanceof ArrayBuffer) return true;
        return false;
      });

    // 24.1.3.2 ArrayBuffer.prototype
    // 24.1.3.3 get ArrayBuffer [ @@species ]
    // 24.1.4 Properties of the ArrayBuffer Prototype Object
    // 24.1.4.1 get ArrayBuffer.prototype.byteLength
    // 24.1.4.2 ArrayBuffer.prototype.constructor
    // 24.1.4.3 ArrayBuffer.prototype.slice ( start, end )

    // 24.1.4.4 ArrayBuffer.prototype [ @@toStringTag ]
    define(ArrayBuffer.prototype, $$toStringTag, 'ArrayBuffer');

    // 24.1.5 Properties of the ArrayBuffer Instances
  }());

  // ---------------------------------------
  // 24.2 DataView Objects
  // ---------------------------------------

  (function() {
    if (!('DataView' in global))
      return;

    // 24.2.1 Abstract Operations For DataView Objects
    // 24.2.1.1 GetViewValue(view, requestIndex, isLittleEndian, type)
    // 24.2.1.2 SetViewValue(view, requestIndex, isLittleEndian, type, value)
    // 24.2.2 The DataView Constructor
    // 24.2.2.1 DataView (buffer [ , byteOffset [ , byteLength ] ] )
    // 24.2.3 Properties of the DataView Constructor
    // 24.2.3.1 DataView.prototype
    // 24.2.4 Properties of the DataView Prototype Object
    // 24.2.4.1 get DataView.prototype.buffer
    // 24.2.4.2 get DataView.prototype.byteLength
    // 24.2.4.3 get DataView.prototype.byteOffset
    // 24.2.4.4 DataView.prototype.constructor
    // 24.2.4.5 DataView.prototype.getFloat32 ( byteOffset [ , littleEndian ] )
    // 24.2.4.6 DataView.prototype.getFloat64 ( byteOffset [ , littleEndian ] )
    // 24.2.4.7 DataView.prototype.getInt8 ( byteOffset )
    // 24.2.4.8 DataView.prototype.getInt16 ( byteOffset [ , littleEndian ] )
    // 24.2.4.9 DataView.prototype.getInt32 ( byteOffset [ , littleEndian ] )
    // 24.2.4.10 DataView.prototype.getUint8 ( byteOffset )
    // 24.2.4.11 DataView.prototype.getUint16 ( byteOffset [ , littleEndian ] )
    // 24.2.4.12 DataView.prototype.getUint32 ( byteOffset [ , littleEndian ] )
    // 24.2.4.13 DataView.prototype.setFloat32 ( byteOffset, value [ , littleEndian ] )
    // 24.2.4.14 DataView.prototype.setFloat64 ( byteOffset, value [ , littleEndian ] )
    // 24.2.4.15 DataView.prototype.setInt8 ( byteOffset, value )
    // 24.2.4.16 DataView.prototype.setInt16 ( byteOffset, value [ , littleEndian ] )
    // 24.2.4.17 DataView.prototype.setInt32 ( byteOffset, value [ , littleEndian ] )
    // 24.2.4.18 DataView.prototype.setUint8 ( byteOffset, value )
    // 24.2.4.19 DataView.prototype.setUint16 ( byteOffset, value [ , littleEndian ] )
    // 24.2.4.20 DataView.prototype.setUint32 ( byteOffset, value [ , littleEndian ] )

    // 24.2.4.21 DataView.prototype[ @@toStringTag ]
    define(DataView.prototype, $$toStringTag, 'DataView');

    // 24.2.5 Properties of DataView Instances
  }());

  // ---------------------------------------
  // 24.3 The JSON Object
  // ---------------------------------------

  // 24.3.1 JSON.parse ( text [ , reviver ] )
  // 24.3.2 JSON.stringify ( value [ , replacer [ , space ] ] )
  // 24.3.3 JSON [ @@toStringTag ]
  define(JSON, $$toStringTag, 'JSON');

  // ---------------------------------------
  // 24.4 The Atomics Object
  // ---------------------------------------

  // ---------------------------------------
  // 25 Control Abstraction Objects
  // ---------------------------------------

  // ---------------------------------------
  // 25.1 Iteration
  // ---------------------------------------

  // 25.1.1 Common Iteration Interfaces
  // 25.1.1.1 The Iterable Interface
  // 25.1.1.2 The Iterator Interface
  // 25.1.1.3 The AsyncIterable Interface
  // 25.1.1.4 The AsyncIterator Interface
  // 25.1.1.5 The IteratorResult Interface

  // 25.1.2 The %IteratorPrototype% Object
  // Defined earlier, so other prototypes can reference it.
  // 25.1.2.1 %IteratorPrototype% [ @@iterator ] ( )
  define($IteratorPrototype$, $$iterator, function() {
    return this;
  });


  // ---------------------------------------
  // 25.6 Promise Objects
  // ---------------------------------------

  (function() {
    // 25.6.1 Promise Abstract Operations

    // 25.6.1.1 PromiseCapability Records
    // 25.6.1.1.1 IfAbruptRejectPromise ( value, capability )

    function IfAbruptRejectPromise(value, capability) {
      var rejectResult = capability['[[Reject]]'].call(undefined, value);
      return capability['[[Promise]]'];
    }

    // 25.6.1.2 PromiseReaction Records

    // 25.6.1.3 CreateResolvingFunctions ( promise )

    function CreateResolvingFunctions(promise) {
      var alreadyResolved = {'[[value]]': false};
      var resolve = PromiseResolveFunction();
      set_internal(resolve, '[[Promise]]',  promise);
      set_internal(resolve, '[[AlreadyResolved]]', alreadyResolved);
      var reject = PromiseRejectFunction();
      set_internal(reject, '[[Promise]]', promise);
      set_internal(reject, '[[AlreadyResolved]]', alreadyResolved);
      return { '[[Resolve]]': resolve, '[[Reject]]': reject};
    }

    // 25.6.1.3.1 Promise Reject Functions

    function PromiseRejectFunction() {
      var F = function(reason) {
        console.assert(Type(F['[[Promise]]']) === 'object');
        var promise = F['[[Promise]]'];
        var alreadyResolved = F['[[AlreadyResolved]]'];
        if (alreadyResolved['[[value]]']) return undefined;
        set_internal(alreadyResolved, '[[value]]', true);
        return RejectPromise(promise, reason);
      };
      return F;
    }

    // 25.6.1.3.2 Promise Resolve Functions

    function PromiseResolveFunction() {
      var F = function(resolution) {
        console.assert(Type(F['[[Promise]]']) === 'object');
        var promise = F['[[Promise]]'];
        var alreadyResolved = F['[[AlreadyResolved]]'];
        if (alreadyResolved['[[value]]']) return undefined;
        set_internal(alreadyResolved, '[[value]]', true);

        if (SameValue(resolution, promise))  {
          var selfResolutionError = TypeError();
          return RejectPromise(promise, selfResolutionError);
        }
        if (Type(resolution) !== 'object')
          return FulfillPromise(promise, resolution);
        try {
          var then = resolution['then'];
        } catch(then) {
          return RejectPromise(promise, then);
        }
        if (!IsCallable(then))
          return FulfillPromise(promise, resolution);
        EnqueueJob('PromiseJobs', PromiseResolveThenableJob, [promise, resolution, then]);
        return undefined;
      };
      return F;
    }

    // 25.6.1.4 FulfillPromise ( promise, value )

    function FulfillPromise(promise, value) {
      console.assert(promise['[[PromiseState]]'] === 'pending');
      var reactions = promise['[[PromiseFulfillReactions]]'];
      set_internal(promise, '[[PromiseResult]]', value);
      set_internal(promise, '[[PromiseFulfillReactions]]', undefined);
      set_internal(promise, '[[PromiseRejectReactions]]', undefined);
      set_internal(promise, '[[PromiseState]]', 'fulfilled');
      return TriggerPromiseReactions(reactions, value);
    }

    // 25.6.1.5 NewPromiseCapability ( C )

    function NewPromiseCapability(c) {
      // To keep Promise hermetic, this doesn't look much like the spec.
      return CreatePromiseCapabilityRecord(undefined, c);
    }

    // 25.6.1.5.1 CreatePromiseCapabilityRecord ( promise, constructor )

    function CreatePromiseCapabilityRecord(promise, constructor) {
      // To keep Promise hermetic, this doesn't look much like the spec.
      console.assert(IsConstructor(constructor));
      var promiseCapability = {};
      set_internal(promiseCapability, '[[Promise]]', promise);
      set_internal(promiseCapability, '[[Resolve]]', undefined);
      set_internal(promiseCapability, '[[Reject]]', undefined);
      var executor = GetCapabilitiesExecutor();
      set_internal(executor, '[[Capability]]', promiseCapability);

      // NOTE: Differs from spec; object is constructed here
      var constructorResult = promise = new constructor(executor);
      set_internal(promiseCapability, '[[Promise]]', promise);

      if (!IsCallable(promiseCapability['[[Resolve]]'])) throw TypeError();
      if (!IsCallable(promiseCapability['[[Reject]]'])) throw TypeError();
      if (Type(constructorResult) === 'object' && !SameValue(promise, constructorResult)) throw TypeError();
      return promiseCapability;
    }

    // 25.6.1.5.2 GetCapabilitiesExecutor Functions

    function GetCapabilitiesExecutor() {
      var F = function(resolve, reject) {
        console.assert(F['[[Capability]]']);
        var promiseCapability = F['[[Capability]]'];
        if (promiseCapability['[[Resolve]]'] !== undefined) throw TypeError();
        if (promiseCapability['[[Reject]]'] !== undefined) throw TypeError();
        set_internal(promiseCapability, '[[Resolve]]', resolve);
        set_internal(promiseCapability, '[[Reject]]', reject);
        return undefined;
      };
      return F;
    }

    // 25.6.1.6 IsPromise ( x )

    function IsPromise(x) {
      if (Type(x) !== 'object') return false;
      if (!('[[PromiseState]]' in x)) return false;
      if (x['[[PromiseState]]'] === undefined) return false;
      return true;
    }

    // 25.6.1.7 RejectPromise ( promise, reason )

    function RejectPromise(promise, reason) {
      console.assert(promise['[[PromiseState]]'] === 'pending');
      var reactions = promise['[[PromiseRejectReactions]]'];
      set_internal(promise, '[[PromiseResult]]', reason);
      set_internal(promise, '[[PromiseFulfillReactions]]', undefined);
      set_internal(promise, '[[PromiseRejectReactions]]', undefined);
      set_internal(promise, '[[PromiseState]]', 'rejected');
      return TriggerPromiseReactions(reactions, reason);
    }

    // 25.6.1.8 TriggerPromiseReactions ( reactions, argument )

    function TriggerPromiseReactions(reactions, argument) {
      for (var i = 0, len = reactions.length; i < len; ++i)
        EnqueueJob('PromiseJobs', PromiseReactionJob, [reactions[i], argument]);
      return undefined;
    }

    // 25.6.2 Promise Jobs

    // 25.6.2.1 PromiseReactionJob ( reaction, argument )

    function PromiseReactionJob(reaction, argument) {
      var promiseCapability = reaction['[[Capabilities]]'];
      var handler = reaction['[[Handler]]'];
      var handlerResult, status;
      try {
        if (handler === 'Identity') handlerResult = argument;
        else if (handler === 'Thrower') throw argument;
        else handlerResult = handler.call(undefined, argument);
      } catch (handlerResult) {
        status = promiseCapability['[[Reject]]'].call(undefined, handlerResult);
        NextJob(status); return;
      }
      status = promiseCapability['[[Resolve]]'].call(undefined, handlerResult);
      NextJob(status);
    }

    // 25.6.2.2 PromiseResolveThenableJob ( promiseToResolve, thenable, then)

    function PromiseResolveThenableJob(promiseToResolve, thenable, then) {
      // SPEC BUG: promise vs. promiseToResolve
      var resolvingFunctions = CreateResolvingFunctions(promiseToResolve);
      try {
        var thenCallResult = then.call(thenable, resolvingFunctions['[[Resolve]]'],
                                       resolvingFunctions['[[Reject]]']);
      } catch (thenCallResult) {
        var status = resolvingFunctions['[[Reject]]'].call(undefined, thenCallResult);
        NextJob(status); return;
      }
      NextJob(thenCallResult);
    }

    // 25.6.3 The Promise Constructor

    // 25.6.3.1 Promise ( executor )

    function Promise(executor) {
      var config = { configurable: false, enumerable: false, writable: true, value: undefined };
      Object.defineProperty(this, '[[PromiseState]]', config);
      Object.defineProperty(this, '[[PromiseConstructor]]', config);
      Object.defineProperty(this, '[[PromiseResult]]', config);
      Object.defineProperty(this, '[[PromiseFulfillReactions]]', config);
      Object.defineProperty(this, '[[PromiseRejectReactions]]', config);

      var promise = this;
      if (Type(promise) !== 'object') throw new TypeError();
      if (!('[[PromiseState]]' in promise)) throw TypeError();
      if (promise['[[PromiseState]]'] !== undefined) throw TypeError();
      if (!IsCallable(executor)) throw TypeError();

      set_internal(promise, '[[PromiseConstructor]]', Promise);

      return InitializePromise(promise, executor);
    }

    // 25.6.3.1.1 InitializePromise ( promise, executor )

    function InitializePromise(promise, executor) {
      console.assert('[[PromiseState]]' in promise);
      console.assert(IsCallable(executor));
      set_internal(promise, '[[PromiseState]]', 'pending');
      set_internal(promise, '[[PromiseFulfillReactions]]', []);
      set_internal(promise, '[[PromiseRejectReactions]]', []);
      var resolvingFunctions = CreateResolvingFunctions(promise);
      try {
        var completion = executor.call(undefined, resolvingFunctions['[[Resolve]]'],
                                       resolvingFunctions['[[Reject]]']);
      } catch (completion) {
        var status = resolvingFunctions['[[Reject]]'].call(undefined, completion);
      }
      return promise;
    }

    // 25.6.4 Properties of the Promise Constructor
    // 25.6.4.1 Promise.all ( iterable )

    define(Promise, 'all', function all(iterable) {
      var c = strict(this);
      var promiseCapability = NewPromiseCapability(c);
      try {
        var iterator = GetIterator(iterable);
      } catch (value) {
        promiseCapability['[[Reject]]'].call(undefined, value);
        return promiseCapability['[[Promise]]'];
      }
      var values = [];
      var remainingElementsCount = { value: 1 };
      var index = 0;
      while (true) {
        try {
          var next = IteratorStep(iterator);
        } catch (value) {
          promiseCapability['[[Reject]]'].call(undefined, value);
          return promiseCapability['[[Promise]]'];
        }
        if (!next) {
          remainingElementsCount.value -= 1;
          if (remainingElementsCount.value === 0) {
            var resolveResult = promiseCapability['[[Resolve]]'].apply(undefined, values);


          }
          return promiseCapability['[[Promise]]'];
        }
        try {
          var nextValue = IteratorValue(next);
        } catch (value) {
          promiseCapability['[[Reject]]'].call(undefined, value);
          return promiseCapability['[[Promise]]'];
        }
        try {
          var nextPromise = c.resolve(nextValue);
        } catch (value) {
          promiseCapability['[[Reject]]'].call(undefined, value);
          return promiseCapability['[[Promise]]'];
        }
        var resolveElement = PromiseAllResolveElementFunction();
        set_internal(resolveElement, '[[AlreadyCalled]]', { value: false });
        set_internal(resolveElement, '[[Index]]', index);
        set_internal(resolveElement, '[[Values]]', values);
        set_internal(resolveElement, '[[Capabilities]]', promiseCapability);
        set_internal(resolveElement, '[[RemainingElements]]', remainingElementsCount);
        remainingElementsCount.value += 1;
        try {
          var result = nextPromise.then(resolveElement, promiseCapability['[[Reject]]']);
        } catch (value) {
          promiseCapability['[[Reject]]'].call(undefined, value);
          return promiseCapability['[[Promise]]'];
        }
        index += 1;
      }
    });

    // 25.6.4.1.1 Promise.all Resolve Element Functions

    function PromiseAllResolveElementFunction() {
      var F = function(x) {
        var alreadyCalled = F['[[AlreadyCalled]]'];
        if (alreadyCalled.value) return undefined;
        alreadyCalled.value = true;
        var index = F['[[Index]]'];
        var values = F['[[Values]]'];
        var promiseCapability = F['[[Capabilities]]'];
        var remainingElementsCount = F['[[RemainingElements]]'];
        try {
          values[index] = x;
        } catch (result) {
          promiseCapability['[[Reject]]'].call(undefined, result);
          return promiseCapability['[[Promise]]'];
        }
        remainingElementsCount.value -= 1;
        if (remainingElementsCount.value === 0)
          return promiseCapability['[[Resolve]]'].call(undefined, values);
        return undefined;
      };
      return F;
    }

    // 25.6.4.2 Promise.prototype

    Promise.prototype = {};

    // 25.6.4.3 Promise.race ( iterable )

    define(Promise, 'race', function race(iterable) {
      var c = strict(this);
      var promiseCapability = NewPromiseCapability(c);
      try {
        var iterator = GetIterator(iterable);
      } catch (value) {
        promiseCapability['[[Reject]]'].call(undefined, value);
        return promiseCapability['[[Promise]]'];
      }
      while (true) {
        try {
          var next = IteratorStep(iterator);
        } catch (value) {
          promiseCapability['[[Reject]]'].call(undefined, value);
          return promiseCapability['[[Promise]]'];
        }
        if (!next) return promiseCapability['[[Promise]]'];
        try {
          var nextValue = IteratorValue(next);
        } catch (value) {
          promiseCapability['[[Reject]]'].call(undefined, value);
          return promiseCapability['[[Promise]]'];
        }
        try {
          var nextPromise = c.resolve(nextValue);
        } catch (value) {
          promiseCapability['[[Reject]]'].call(undefined, value);
          return promiseCapability['[[Promise]]'];
        }
        try {
          nextPromise.then(promiseCapability['[[Resolve]]'], promiseCapability['[[Reject]]']);
        } catch (value) {
          promiseCapability['[[Reject]]'].call(undefined, value);
          return promiseCapability['[[Promise]]'];
        }
      }
    });

    // 25.6.4.4 Promise.reject ( r )

    define(Promise, 'reject', function reject(r) {
      var c = strict(this);
      var promiseCapability = NewPromiseCapability(c);
      var rejectResult = promiseCapability['[[Reject]]'].call(undefined, r);
      return promiseCapability['[[Promise]]'];
    });

    // 25.6.4.5 Promise.resolve ( x )

    define(Promise, 'resolve', function resolve(x) {
      var c = strict(this);
      if (IsPromise(x)) {
        var constructor = x['[[PromiseConstructor]]'];
        if (SameValue(constructor, c)) return x;
      }
      var promiseCapability = NewPromiseCapability(c);
      var resolveResult = promiseCapability['[[Resolve]]'].call(undefined, x);
      return promiseCapability['[[Promise]]'];
    });

    // 25.6.4.6 Promise [ @@create ] ( )
    // 25.6.4.6.1 AllocatePromise ( constructor )
    // 25.6.5 Properties of the Promise Prototype Object
    // 25.6.5.1 Promise.prototype.catch ( onRejected )

    define(Promise.prototype, 'catch', function catch_(onRejected) {
      var promise = this;
      return promise.then(undefined, onRejected);
    });

    // 25.6.5.2 Promise.prototype.constructor

    Promise.prototype.constructor = Promise;

    // 25.6.5.3 Promise.prototype.then ( onFulfilled , onRejected )

    define(Promise.prototype, 'then', function then(onFulfilled, onRejected) {
      var promise = this;
      if (!IsPromise(promise)) throw TypeError();
      if (!IsCallable(onFulfilled)) onFulfilled = 'Identity';
      if (!IsCallable(onRejected)) onRejected = 'Thrower';
      var c = promise.constructor;
      var promiseCapability = NewPromiseCapability(c);
      var fulfillReaction = { '[[Capabilities]]': promiseCapability,
                              '[[Handler]]': onFulfilled };
      var rejectReaction = { '[[Capabilities]]': promiseCapability,
                             '[[Handler]]': onRejected };
      if (promise['[[PromiseState]]'] === 'pending') {
        promise['[[PromiseFulfillReactions]]'].push(fulfillReaction);
        promise['[[PromiseRejectReactions]]'].push(rejectReaction);
      } else if (promise['[[PromiseState]]'] === 'fulfilled') {
        var value = promise['[[PromiseResult]]'];
        EnqueueJob('PromiseJobs', PromiseReactionJob, [fulfillReaction, value]);
      } else if (promise['[[PromiseState]]'] === 'rejected') {
        var reason = promise['[[PromiseResult]]'];
        EnqueueJob('PromiseJobs', PromiseReactionJob, [rejectReaction, reason]);
      }
      return promiseCapability['[[Promise]]'];
    });

    // 25.6.6 Properties of Promise Instances

    if (!('Promise' in global))
      global.Promise = Promise;

    // Patch early Promise.cast vs. Promise.resolve implementations
    if ('cast' in global.Promise) global.Promise.resolve = global.Promise.cast;

  }());

  // 25.6.5.1 Promise.prototype [ @@toStringTag ]
  define(Promise.prototype, $$toStringTag, 'Promise');

  // 25.6.5.3 Promise.prototype.finally ( onFinally )
  define(
    Promise.prototype, 'finally',
    function finally_(func) {
      return this.then(
        function(r) { func(); return r; },
        function(r) { func(); throw r; }
      );
    });

  // ---------------------------------------
  // 26 Reflection
  // ---------------------------------------

  (function() {
    // 26.1 The Reflect Object
    if (!('Reflect' in global))
      global.Reflect = {};

    // 26.1.1 Reflect.apply ( target, thisArgument, argumentsList )
    define(
      Reflect, 'apply',
      function apply(target, thisArgument, argumentsList) {
        if (!IsCallable(target)) throw TypeError();
        return Function.prototype.apply.call(target, thisArgument, argumentsList);
      });

    // 26.1.2 Reflect.construct ( target, argumentsList [ , newTarget ] )
    define(
      Reflect, 'construct',
      function construct(target, argumentsList) {
        return __cons(target, argumentsList);
      });

    // 26.1.3 Reflect.defineProperty ( target, propertyKey, attributes )
    define(
      Reflect, 'defineProperty',
      function defineProperty(target, propertyKey, attributes) {
        try {
          Object.defineProperty(target, propertyKey, attributes);
          return true;
        } catch (_) {
          return false;
        }
      });

    // 26.1.4 Reflect.deleteProperty ( target, propertyKey )
    define(
      Reflect, 'deleteProperty',
      function deleteProperty(target,name) {
        try {
          delete target[name];
          return !HasOwnProperty(target, name);
        } catch (_) {
          return false;
        }
      });

    // 26.1.5 Reflect.get ( target, propertyKey [ , receiver ] )
    define(
      Reflect, 'get',
      function get(target, name, receiver) {
        target = ToObject(target);
        name = String(name);
        receiver = (receiver === undefined) ? target : ToObject(receiver);
        var desc = getPropertyDescriptor(target, name);
        if (desc && 'get' in desc)
          return Function.prototype.call.call(desc['get'], receiver);
        return target[name];
      });

    // 26.1.6 Reflect.getOwnPropertyDescriptor ( target, propertyKey )
    define(
      Reflect, 'getOwnPropertyDescriptor',
      Object.getOwnPropertyDescriptor);

    // 26.1.7 Reflect.getPrototypeOf ( target )
    define(
      Reflect, 'getPrototypeOf',
      Object.getPrototypeOf);

    // 26.1.8 Reflect.has ( target, propertyKey )
    define(
      Reflect, 'has',
      function has(target,name) {
        return String(name) in ToObject(target);
      });

    // 26.1.9 Reflect.isExtensible ( target )
    define(
      Reflect, 'isExtensible',
      Object.isExtensible);

    // 26.1.10 Reflect.ownKeys ( target )
    define(
      Reflect, 'ownKeys',
      function ownKeys(target) {
        var obj = ToObject(target);
        return Object.getOwnPropertyNames(obj);
      });

    // 26.1.11 Reflect.preventExtensions ( target )
    define(
      Reflect, 'preventExtensions',
      function preventExtensions(target) {
        try { Object.preventExtensions(target); return true; } catch (_) { return false; }
      });

    // 26.1.12 Reflect.set ( target, propertyKey, V [ , receiver ] )
    define(
      Reflect, 'set',
      function set(target, name, value, receiver) {
        target = ToObject(target);
        name = String(name);
        receiver = (receiver === undefined) ? target : ToObject(receiver);
        var desc = getPropertyDescriptor(target, name);
        try {
          if (desc && 'set' in desc)
            Function.prototype.call.call(desc['set'], receiver, value);
          else if (desc && !desc.writable)
            return false;
          else
            target[name] = value;
          return true;
        } catch (_) {
          return false;
        }
      });

    // 26.1.13 Reflect.setPrototypeOf ( target, proto )
    define(
      Reflect, 'setPrototypeOf',
      function setPrototypeOf(target, proto) {
        try {
          target.__proto__ = proto;
          return Reflect.getPrototypeOf(target) === proto;
        } catch(_) {
          return false;
        }
      });

  }());

  // ---------------------------------------
  // 26.2 Proxy Objects
  // ---------------------------------------

  // Not polyfillable.

}(self));

// This helper is defined outside the main scope so that the use of
// 'eval' does not taint the scope for minifiers.
function __cons(t, a) {
  return eval('new t(' + a.map(function(_, i) { return 'a[' + i + ']'; }).join(',') + ')');
}
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
  // https://dom.spec.whatwg.org/#dom-domtokenlist-toggle
  (function() {
    if (!('DOMTokenList' in global)) return;
    var e = document.createElement('span');
    if (!('classList' in e)) return;

    // Patch toggle() to support 'force' argument.
    e.classList.toggle('x', false);
    if (e.classList.contains('x')) {
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
    }

    // Patch contains() to ignore invalid tokens.
    try {
      e.classList.contains('');
      e.classList.contains('a b');
    } catch (_) {
      var orig = global.DOMTokenList.prototype.contains;
      global.DOMTokenList.prototype.contains = function contains(token) {
        if (token === '' || token.indexOf(' ') !== -1)
          return false;
        return orig.apply(this, arguments);
      };
    }
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
