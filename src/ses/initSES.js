// Copyright (C) 2009 Google Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Exports "whitelist", a recursively defined JSON
 * record enumerating all the naming paths in the ES5.1 spec, those
 * de-facto extensions that we judge to be safe, and SES extensions
 * provided by the SES runtime.
 *
 * <p>Each JSON record enumerates the disposition of the properties on
 * some corresponding primordial object, with the root record
 * representing the global object. For each such record, the values
 * associated with its property names can be
 * <ul>
 * <li>Another record, in which case this property is simply
 *     whitelisted and that next record represents the disposition of
 *     the object which is its value.
 * <li>true, in which case this property is simply whitelisted. The
 *     value associated with that property is still traversed and
 *     tamed, but only according to the taming of the objects that
 *     object inherits from.
 * <li>"*", in which case this property on this object is whitelisted,
 *     as is this property as inherited by all objects that inherit
 *     from this object. The values associated with all such properties
 *     are still traversed and tamed, but only according to the taming
 *     of the objects that object inherits from.
 * <li>"skip", in which case this property on this object is simply
 *     whitelisted, as is this property as inherited by all objects
 *     that inherit from this object, but we avoid taming the value
 *     associated with that property.
 * </ul>
 *
 * The members of the whitelist are either
 * <ul>
 * <li>(uncommented) defined by the ES5.1 normative standard text,
 * <li>(questionable) providing sources of non-determinism, in
 *     violation of pure object-capability rules.
 * <li>(ES5 Appendix B) common elements of de facto JavaScript
 *     described by the non-normative Appendix B.
 * <li>(Harmless whatwg) extensions documented at
 *     <a href="http://wiki.whatwg.org/wiki/Web_ECMAScript"
 *     >http://wiki.whatwg.org/wiki/Web_ECMAScript</a> that seem to be
 *     harmless. Note that the RegExp constructor extensions on that
 *     page are <b>not harmless</b> and so must not be whitelisted.
 * <li>(ES-Harmony proposal) accepted as "proposal" status for
 *     EcmaScript-Harmony.
 * <li>(Marked as "skip") in which case there should be an explanatory
 *     comment explaining why (TODO(erights)). These are generally
 *     workarounds for browser bugs, which should be cited
 *     (TODO(erights)). Any of these whose comments say "fatal" need
 *     to be fixed before we might be considered safe. Ideally, we can
 *     retire all "skip" entries by the time SES is ready for secure
 *     production use.
 * </ul>
 *
 * <p>We factor out true and "skip" into the variables t and s just to
 * get a bit better compression from simple minifiers.
 */
var whitelist;

(function() {
//  "use strict"; // not here because of an unreported Caja bug

  var t = true;
  var s = "skip";
  whitelist = {
    cajaVM: {                        // Caja support
      log: t,
      compile: t,
      compileModule: t,              // experimental
      def: t
    },
    Q: {                             // Dr. SES support
      get: t,
      post: t,
      put: t,
      "delete": t,
      when: t,
      defer: t,
      reject: t,
      ref: t,
      near: t,
      defined: t,
      run: t,
      Promise: t,
      isPromise: t,
      def: t
    },
    WeakMap: t,                      // ES-Harmony proposal
    Proxy: {                         // ES-Harmony proposal
      create: t,
      createFunction: t
    },
    escape: t,                       // ES5 Appendix B
    unescape: t,                     // ES5 Appendix B
    Object: {
      getPropertyDescriptor: t,      // ES-Harmony proposal
      getPropertyNames: t,           // ES-Harmony proposal
      identical: t,                  // ES-Harmony proposal
      prototype: {
        constructor: "*",
        toString: "*",
        toLocaleString: "*",
        valueOf: t,
        hasOwnProperty: t,
        isPrototypeOf: t,
        propertyIsEnumerable: t
      },
      getPrototypeOf: t,
      getOwnPropertyDescriptor: t,
      getOwnPropertyNames: t,
      create: t,
      defineProperty: t,
      defineProperties: t,
      seal: t,
      freeze: t,
      preventExtensions: t,
      isSealed: t,
      isFrozen: t,
      isExtensible: t,
      keys: t
    },
    NaN: t,
    Infinity: t,
    undefined: t,
    eval: t,
    parseInt: t,
    parseFloat: t,
    isNaN: t,
    isFinite: t,
    decodeURI: t,
    decodeURIComponent: t,
    encodeURI: t,
    encodeURIComponent: t,
    Function: {
      prototype: {
        apply: t,
        call: t,
        bind: t,
        prototype: "*",
        length: "*",
        caller: s,                 // when not poison, could be fatal
        arguments: s,              // when not poison, could be fatal
        arity: s,                  // non-std, deprecated in favor of length
        name: s                    // non-std
      }
    },
    Array: {
      prototype: {
        concat: t,
        join: t,
        pop: t,
        push: t,
        reverse: t,
        shift: t,
        slice: t,
        sort: t,
        splice: t,
        unshift: t,
        indexOf: t,
        lastIndexOf: t,
        every: t,
        some: t,
        forEach: t,
        map: t,
        filter: t,
        reduce: t,
        reduceRight: t,
        length: s                    // can't be redefined on Mozilla
      },
      isArray: t
    },
    String: {
      prototype: {
        substr: t,                   // ES5 Appendix B
        anchor: t,                   // Harmless whatwg
        big: t,                      // Harmless whatwg
        blink: t,                    // Harmless whatwg
        bold: t,                     // Harmless whatwg
        fixed: t,                    // Harmless whatwg
        fontcolor: t,                // Harmless whatwg
        fontsize: t,                 // Harmless whatwg
        italics: t,                  // Harmless whatwg
        link: t,                     // Harmless whatwg
        small: t,                    // Harmless whatwg
        strike: t,                   // Harmless whatwg
        sub: t,                      // Harmless whatwg
        sup: t,                      // Harmless whatwg
        trimLeft: t,                 // non-standard
        trimRight: t,                // non-standard
        valueOf: t,
        charAt: t,
        charCodeAt: t,
        concat: t,
        indexOf: t,
        lastIndexOf: t,
        localeCompare: t,
        match: t,
        replace: t,
        search: t,
        slice: t,
        split: t,
        substring: t,
        toLowerCase: t,
        toLocaleLowerCase: t,
        toUpperCase: t,
        toLocaleUpperCase: t,
        trim: t,
        length: s                  // can't be redefined on Mozilla
      },
      fromCharCode: t
    },
    Boolean: {
      prototype: {
        valueOf: t
      }
    },
    Number: {
      prototype: {
        valueOf: t,
        toFixed: t,
        toExponential: t,
        toPrecision: t
      },
      MAX_VALUE: t,
      MIN_VALUE: t,
      NaN: t,
      NEGATIVE_INFINITY: t,
      POSITIVE_INFINITY: t
    },
    Math: {
      E: t,
      LN10: t,
      LN2: t,
      LOG2E: t,
      LOG10E: t,
      PI: t,
      SQRT1_2: t,
      SQRT2: t,

      abs: t,
      acos: t,
      asin: t,
      atan: t,
      atan2: t,
      ceil: t,
      cos: t,
      exp: t,
      floor: t,
      log: t,
      max: t,
      min: t,
      pow: t,
      random: t,                     // questionable
      round: t,
      sin: t,
      sqrt: t,
      tan: t
    },
    Date: {                          // no-arg Date constructor is questionable
      prototype: {
        getYear: t,                  // ES5 Appendix B
        setYear: t,                  // ES5 Appendix B
        toGMTString: t,              // ES5 Appendix B
        toDateString: t,
        toTimeString: t,
        toLocaleString: t,
        toLocaleDateString: t,
        toLocaleTimeString: t,
        getTime: t,
        getFullYear: t,
        getUTCFullYear: t,
        getMonth: t,
        getUTCMonth: t,
        getDate: t,
        getUTCDate: t,
        getDay: t,
        getUTCDay: t,
        getHours: t,
        getUTCHours: t,
        getMinutes: t,
        getUTCMinutes: t,
        getSeconds: t,
        getUTCSeconds: t,
        getMilliseconds: t,
        getUTCMilliseconds: t,
        getTimezoneOffset: t,
        setTime: t,
        setFullYear: t,
        setUTCFullYear: t,
        setMonth: t,
        setUTCMonth: t,
        setDate: t,
        setUTCDate: t,
        setHours: t,
        setUTCHours: t,
        setMinutes: t,
        setUTCMinutes: t,
        setSeconds: t,
        setUTCSeconds: t,
        setMilliseconds: t,
        setUTCMilliseconds: t,
        toUTCString: t,
        toISOString: t,
        toJSON: t
      },
      parse: t,
      UTC: t,
      now: t                         // questionable
    },
    RegExp: {
      prototype: {
        exec: t,
        test: t,
        source: s,
        global: s,
        ignoreCase: s,
        multiline: s,
        lastIndex: s,
        sticky: s                    // non-std
      }
    },
    Error: {
      prototype: {
        name: "*",
        message: "*"
      }
    },
    EvalError: {
      prototype: t
    },
    RangeError: {
      prototype: t
    },
    ReferenceError: {
      prototype: t
    },
    SyntaxError: {
      prototype: t
    },
    TypeError: {
      prototype: t
    },
    URIError: {
      prototype: t
    },
    JSON: {
      parse: t,
      stringify: t
    }
  };
})();
// Copyright (C) 2010 Google Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview export an "atLeastFreeVarNames" function for internal
 * use by the SES-on-ES5 implementation, which enumerates at least the
 * identifiers which occur freely in a source text string.
 */


/**
 * Calling atLeastFreeVarNames on a {@code programSrc} string
 * argument, the result should include at least all the free variable
 * names of {@code programSrc}.
 *
 * <p>Assuming that programSrc that parses as a strict Program,
 * atLeastFreeVarNames(programSrc) returns a Record whose enumerable
 * own property names must include the names of all the free variables
 * occuring in programSrc. It can include as many other strings as is
 * convenient so long as it includes these. The value of each of these
 * properties should be {@code true}.
 */
var atLeastFreeVarNames;
(function() {
//  "use strict"; // not here because of an unreported Caja bug

  /////////////// KLUDGE SWITCHES ///////////////

  /**
   * Currently we use this to limit the input text to ascii only, in
   * order to simply our identifier gathering. This is only a
   * temporary development hack.
   */
  function LIMIT_SRC(programSrc) {
    if (!((/^[\u0000-\u007f]*$/m).test(programSrc))) {
      throw new Error('Non-ascii texts not yet supported');
    }
  }

  /**
   * This is safe only because of the above LIMIT_SRC
   * To do this right takes quite a lot of unicode machinery. See
   * the "Identifier" production at
   * http://es-lab.googlecode.com/svn/trunk/src/parser/es5parser.ojs
   * which depends on
   * http://es-lab.googlecode.com/svn/trunk/src/parser/unicode.js
   *
   * SECURITY_BUG: TODO: This must still identify possible identifiers
   * that contain {@code \u} encoded characters.
   */
  var SHOULD_MATCH_IDENTIFIER = (/(\w|\$)+/gm);


  //////////////// END KLUDGE SWITCHES ///////////

  atLeastFreeVarNames = function atLeastFreeVarNames(programSrc) {
    programSrc = String(programSrc);
    LIMIT_SRC(programSrc);
    // Now that we've temporarily limited our attention to ascii...
    var result = Object.create(null);
    var a;
    while ((a = SHOULD_MATCH_IDENTIFIER.exec(programSrc))) {
      var name = a[0];
      if (name === 'ident___') {
        // See WeakMap.js
        throw new EvalError('Apparent identifier "ident___" not permitted');
      }
      result[name] = true;
    }
    return result;
  };

})();
// Copyright (C) 2010 Google Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Install a leaky WeakMap emulation on platforms that
 * don't provide a built-in one.
 */

/**
 * This {@code WeakMap} emulation is observably equivalent to the
 * ES-Harmony WeakMap, but with leakier garbage collection properties.
 *
 * <p>As with true WeakMaps, in this emulation, a key does not
 * retain maps indexed by that key and (crucially) a map does not
 * retain the keys it indexes. A key by itself also does not retain
 * the values associated with that key.
 *
 * <p>However, the values placed in an emulated WeakMap are retained
 * so long as that map is retained and those associations are not
 * overridden. For example, when used to support membranes, all
 * values exported from a given membrane will live for the lifetime
 * of the membrane. But when the membrane is revoked, all objects
 * encapsulated within that membrane will still be collected. This
 * is the best we can do without VM support.
 */
var WeakMap;

/**
 * If this is an ES5 platform and the ES-Harmony {@code WeakMap} is
 * absent, install an approximate emulation.
 *
 * <p>See {@code WeakMap} for documentation of the garbage collection
 * properties of this emulation.
 *
 * <p>Will also install some other elements of ES5 as needed to bring
 * an almost ES5 platform to be a more complete emulation of
 * ES5. On not-quite-ES5 platforms, some elements of these emulations
 * on lose SES safety. The platform must at least provide
 * Object.getOwnPropertyNames, because it cannot reasonably be
 * emulated.
 */
(function(global) {
//  "use strict"; // not here because of an unreported Caja bug

  var gopn = Object.getOwnPropertyNames;
  if (!gopn) {
    debugger;
    throw new EvalError('Please upgrade to a JavaScript platform ' +
                        'which implements Object.getOwnPropertyName');
  }

  var hop = Object.prototype.hasOwnProperty;
  var slice = Array.prototype.slice;
  var push = Array.prototype.push;
  var defProp = Object.defineProperty;
  var classProp = Object.prototype.toString;

  var real = {};
  gopn(Object).forEach(function(name) {
    real[name] = Object[name];
  });

  function defMissingProp(base, name, missingFunc) {
    if (!(name in base)) {
      defProp(base, name, {
        value: missingFunc,
        writable: true,
        enumerable: false,
        configurable: true
      });
      if (base === Object) {
        real[name] = missingFunc;
      }
    }
  }

  function identical(x, y) {
    if (x === y) {
      // 0 === -0, but they are not identical
      return x !== 0 || 1/x === 1/y;
    } else {
      // NaN !== NaN, but they are identical.
      // NaNs are the only non-reflexive value, i.e., if x !== x,
      // then x is a NaN.
      return x !== x && y !== y;
    }
  }

  /////////////// KLUDGE SWITCHES ///////////////

  /////////////////////////////////
  // The following are only the minimal kludges needed for the current
  // Mozilla Minefield (Firefox Beta) or Chromium Beta. At the time of
  // this writing, these are Mozilla 4.0b5pre and Chromium 6.0.490.0
  // (3135). As these move forward, kludges can be removed until we
  // simply rely on ES5.


  /**
   * Work around for https://bugzilla.mozilla.org/show_bug.cgi?id=591846
   * as applied to the RegExp constructor.
   *
   * <p>Note that Mozilla lists this bug as closed. But reading that
   * bug thread clarifies that is partially because the following code
   * allows us to work around the non-configurability of the RegExp
   * statics.
   */
  var UnsafeRegExp = RegExp;
  function FakeRegExp(pattern, flags) {
    switch (arguments.length) {
      case 0: {
        return UnsafeRegExp();
      }
      case 1: {
        return UnsafeRegExp(pattern);
      }
      default: {
        return UnsafeRegExp(pattern, flags);
      }
    }
  }
  FakeRegExp.prototype = UnsafeRegExp.prototype;
  FakeRegExp.prototype.constructor = FakeRegExp;
  global.RegExp = FakeRegExp;

  /**
   * Work around for http://code.google.com/p/google-caja/issues/detail?id=528
   */
  var unsafeRegExpExec = RegExp.prototype.exec;
  var unsafeRegExpTest = RegExp.prototype.test;
  RegExp.prototype.exec = function(specimen) {
    return unsafeRegExpExec.call(this, String(specimen));
  };
  RegExp.prototype.test = function(specimen) {
    return unsafeRegExpTest.call(this, String(specimen));
  };

  // As of this writing, the only major browser that does implement
  // Object.getOwnPropertyNames but not Object.freeze etc is Safari 5
  // (JavaScriptCode). When Safari implements these, the following
  // calls to defMissingProp can simply be removed.
  defMissingProp(Object, 'freeze',            function(obj) { return obj; });
  defMissingProp(Object, 'seal',              function(obj) { return obj; });
  defMissingProp(Object, 'preventExtensions', function(obj) { return obj; });
  defMissingProp(Object, 'isFrozen',          function(obj) { return false; });
  defMissingProp(Object, 'isSealed',          function(obj) { return false; });
  defMissingProp(Object, 'isExtensible',      function(obj) { return true; });
  defMissingProp(Function.prototype, 'bind',  function(self, var_args) {
    var thisFunc = this;
    var leftArgs = slice.call(arguments, 1);
    function funcBound(var_args) {
      var args = leftArgs.concat(slice.call(arguments, 0));
      return thisFunc.apply(self, args);
    }
    delete funcBound.prototype;
    return funcBound;
  });

  //////////////// END KLUDGE SWITCHES ///////////

  //////////////// New ES-Harmony methods ///////////

  defMissingProp(Object, 'getPropertyDescriptor', function(obj, name) {
    while (obj !== null) {
      var result = real.getOwnPropertyDescriptor(obj, name);
      if (result) { return result; }
      obj = real.getPrototypeOf(obj);
    }
    return undefined;
  });

  defMissingProp(Object, 'getPropertyNames', function(obj) {
    var result = [];
    while (obj !== null) {
      push.apply(result, gopn(obj));
      obj = real.getPrototypeOf(obj);
    }
    return result;
  });

  /**
   * Still strawman rather than official proposal.
   */
  defMissingProp(Object, 'identical', identical);

  //////////////// END New ES-Harmony methods ///////////


  if (typeof WeakMap === 'function') { return; }

  var NO_IDENT = 'noident:0';

  /**
   * Gets a value which is either NO_IDENT or uniquely identifies the
   * key object, for use in making maps keyed by this key object.
   *
   * <p>Two keys that are {@code identical} MUST have the same {@code
   * identity}. Two keys that are not {@code identical} MUST either
   * have different identities, or one of their identities MUST be
   * {@code NO_IDENT}. An identity is either a string or a const
   * function returning a mostly-unique string. The identity of an
   * object is always either NO_IDENT or such a function. The identity
   * of the function itself is used to resolve collisions on the name
   * in the array.
   *
   * <p>When a map stores a key's identity rather than the key itself,
   * the map does not cause the key to be retained. See the emulated
   * {@code WeakMap} below for the resulting gc properties.
   *
   * <p>To identify objects with reasonable efficiency on ES5 by
   * itself (i.e., without any object-keyed collections), we need to
   * add a reasonably hidden property to such key objects when we
   * can. This raises three issues:
   * <ul>
   * <li>arranging to add this property to objects before we lose the
   *     chance, and
   * <li>reasonably hiding the existence of this new property from
   *     most JavaScript code.
   * <li>preventing <i>identity theft</i>, where one object is created
   *     falsely claiming to have the identity of another object.
   * </ul>
   * We do so by
   * <ul>
   * <li>Making the hidden property non-enumerable, so we need not
   *     worry about for-in loops or {@code Object.keys},
   * <li>Making the hidden property an accessor property, where the
   *     hidden property's getter is the identity, and the value the
   *     getter returns is the mostly unique string.
   * <li>monkey patching those reflective methods that would
   *     prevent extensions, to add this hidden property first,
   * <li>monkey patching those methods that would reveal this
   *     hidden property, and
   * <li>monkey patching those methods that would overwrite this
   *     hidden property.
   * </ul>
   * Given our parser-less verification strategy, the remaining
   * non-transparencies which are not easily fixed are
   * <ul>
   * <li>The {@code delete}, {@code in}, property access
   *     ({@code []}, and {@code .}), and property assignment
   *     operations each reveal the
   *     presence of the hidden property. The property access
   *     operations also reveal the randomness provided by
   *     {@code Math.random}. This not currently an issue but may
   *     become one if SES otherwise seeks to hide Math.random.
   * </ul>
   * These are not easily fixed because they are primitive operations
   * which cannot be monkey patched. However, because we're
   * representing the precious identity by the identity of the
   * property's getter rather than the value gotten, this identity
   * itself cannot leak or be installed by the above non-transparent
   * operations.
   *
   * <p>Due to <a href=
   * "https://bugzilla.mozilla.org/show_bug.cgi?id=637994"
   * >Bug: Inherited accessor properties (sometimes?) reported as own
   * properties</a> we're reverting the logic of <a href=
   * "http://code.google.com/p/es-lab/source/browse/trunk/src/ses/WeakMap.js"
   * >WeakMap.js</a> from getter based as in r493 to array-based as in r491
   */
  function identity(key) {
    var name;
    if (key === Object(key)) {
      if (hop.call(key, 'ident___')) { return key.ident___; }
      if (!real.isExtensible(key)) { return NO_IDENT; }
      name = 'hash:' + Math.random();
      var result = real.freeze([name]);

      defProp(key, 'ident___', {
        value: result,
        writable: false,
        enumerable: false,
        configurable: false
      });
      return result;
    }
    if (typeof key === 'string') { return 'str:' + key; }
    return 'lit:' + key;
  }

  /**
   * Monkey patch operations that would make their first argument
   * non-extensible.
   */
  function identifyFirst(base, name) {
    var oldFunc = base[name];
    defProp(base, name, {
      value: function(obj, var_args) {
        identity(obj);
        return oldFunc.apply(this, arguments);
      }
    });
  }
  identifyFirst(Object, 'freeze');
  identifyFirst(Object, 'seal');
  identifyFirst(Object, 'preventExtensions');
  identifyFirst(Object, 'defineProperty');
  identifyFirst(Object, 'defineProperties');

  defProp(Object, 'getOwnPropertyNames', {
    value: function(obj) {
      var result = gopn(obj);
      var i = result.indexOf('ident___');
      if (i >= 0) { result.splice(i, 1); }
      return result;
    }
  });

  defProp(Object, 'getPropertyNames', {
    value: function(obj) {
      var result = real.getPropertyNames(obj);
      var i = result.indexOf('ident___');
      if (i >= 0) { result.splice(i, 1); }
      return result;
    }
  });

  defProp(Object, 'getOwnPropertyDescriptor', {
    value: function(obj, name) {
      if (name === 'ident___') { return undefined; }
      return real.getOwnPropertyDescriptor(obj, name);
    }
  });

  defProp(Object, 'getPropertyDescriptor', {
    value: function(obj, name) {
      if (name === 'ident___') { return undefined; }
      return real.getPropertyDescriptor(obj, name);
    }
  });

  defProp(Object, 'create', {
    value: function(parent, pdmap) {
      var result = real.create(parent);
      identity(result);
      if (pdmap) {
        real.defineProperties(result, pdmap);
      }
      return result;
    }
  });

  function constFunc(func) {
    Object.freeze(func.prototype);
    return Object.freeze(func);
  }

  if (WeakMap === undefined) {
    WeakMap = constFunc(function() {
      var identities = {};
      var values = {};
      return Object.freeze({
        get: constFunc(function(key) {
          var id = identity(key);
          var name;
          if (typeof id === 'string') {
            name = id;
            id = key;
          } else {
            name = id[0];
          }
          var ids = identities[name] || [];
          var i = ids.indexOf(id);
          return (i < 0) ? undefined : values[name][i];
        }),
        set: constFunc(function(key, value) {
          if (key !== Object(key)) {
            throw new TypeError('Key must not be a value type: ' + key);
          }
          var id = identity(key);
          var name;
          if (typeof id === 'string') {
            name = id;
            id = key;
          } else {
            name = id[0];
          }
          var ids = identities[name] || (identities[name] = []);
          var vals = values[name] || (values[name] = []);
          var i = ids.indexOf(id);
          if (i < 0) { i = ids.length; }
          ids[i] = id;
          vals[i] = value;
        })
      });
    });
  }

})(this);
// Copyright (C) 2009 Google Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Make this frame SES-safe or die trying.
 *
 * <p>Should be called before any other potentially dangerous script
 * is executed in this frame. If it succeeds, the new global bindings
 * for <tt>eval</tt> and <tt>Function</tt> in this frame will only
 * load code according to the <i>loader isolation</i> rules of the
 * object-capability model. If all other code executed directly in
 * this frame (i.e., other than through these <tt>eval</tt> and
 * <tt>Function</tt> bindings) takes care to uphold object-capability
 * rules, then untrusted code loaded via <tt>eval</tt> and
 * <tt>Function</tt> will be constrained by those rules.
 *
 * <p>On a pre-ES5 browser, this script will fail cleanly, leaving the
 * frame intact. Otherwise, if this script fails, it may leave this
 * frame in an unusable state. All following description assumes this
 * script succeeds and that the browser conforms to the ES5 spec. The
 * ES5 spec allows browsers to implement more than is specified as
 * long as certain invariants are maintained. We further assume that
 * these extensions are not maliciously designed to obey the letter of
 * these invariants while subverting the intent of the spec. In other
 * words, even on an ES5 conformant browser, we do not presume to
 * defend ourselves from a browser that is out to get us.
 *
 * @param global ::Record(any) Assumed to be the real global object for
 *        this frame. Since startSES will allow global variable
 *        references that appear at the top level of the whitelist,
 *        our safety depends on these variables being frozen as a side
 *        effect of freezing the corresponding properties of
 *        <tt>global</tt>. These properties are also duplicated onto a
 *        <i>root accessible primordial</i>, which is provided as the
 *        <tt>this</tt> binding for hermetic eval calls -- emulating
 *        the safe subset of the normal global object.
 * @param whitelist ::Record(Permit)
 *            where Permit = true | "*" | "skip" | Record(Permit).
 *        Describes the subset of naming paths starting from the root
 *        that should be accessible. The <i>accessible primordials</i>
 *        are this root plus all values found by navigating these paths
 *        starting from this root. All non-whitelisted properties of
 *        accessible primordials are deleted, and then all accessible
 *        primordials are frozen with the whitelisted properties
 *        frozen as data properties.
 * @param atLeastFreeVarNames ::F([string], Record(true))
 *        Given the sourceText for a strict Program,
 *        atLeastFreeVarNames(sourceText) returns a Record whose
 *        enumerable own property names must include the names of all the
 *        free variables occuring in sourceText. It can include as
 *        many other strings as is convenient so long as it includes
 *        these. The value of each of these properties should be
 *        {@code true}.
 */
function startSES(global, whitelist, atLeastFreeVarNames) {
//  "use strict"; // not here because of an unreported Caja bug

  /////////////// KLUDGE SWITCHES ///////////////

  /////////////////////////////////
  // The following are only the minimal kludges needed for the current
  // Mozilla Minefield (Firefox Beta) or Chrome Beta. At the time of
  // this writing, these are Mozilla 4.0b13pre (2011-03-02) and Chrome
  // 11.0.686.1 dev. As these move forward, kludges can be removed
  // until we simply rely on ES5.

  /**
   * This switch simply reflects that not all almost-ES5 browsers yet
   * implement strict mode.
   */
  //var REQUIRE_STRICT = true;
  var REQUIRE_STRICT = false;

  /**
   * This switch represents some non-isolated, and thus, not yet
   * reported bug on Chrome/v8 only, that results in
   * "Uncaught TypeError: Cannot redefine property: defineProperty"
   * TODO(erights): isolate and report this.
   */
  //var FREEZE_EARLY = undefined;
  var FREEZE_EARLY = Array.prototype.forEach;

  /**
   * This switch represents what looks like another manifestation of
   * the same undiagnosed bug as that motivating FREEZE_EARLY. The
   * symptom is again
   * "TypeError: Cannot redefine property: defineProperty"
   * with a similar stack.
   */
  //var TOLERATE_FAILED_FREEZE = false;
  var TOLERATE_FAILED_FREEZE = true;

  /**
   * Workaround for <a href=
   * "https://bugs.webkit.org/show_bug.cgi?id=55537"
   * >https://bugs.webkit.org/show_bug.cgi?id=55537</a>.
   */
  //var TOLERATE_MISSING_DESCRIPTOR = false;
  var TOLERATE_MISSING_DESCRIPTOR = true;

  //////////////// END KLUDGE SWITCHES ///////////

  var dirty = true;

  function fail(str) {
    debugger;
    throw new EvalError(str);
  }

  if (typeof WeakMap === 'undefined') {
    fail('No built-on WeakMaps, so WeakMap.js must be loaded first');
  }

  if (REQUIRE_STRICT && function(){return this;}()) {
    fail('Requires at least ES5 support');
  }

  /**
   * Code being eval'ed sees <tt>root</tt> as its <tt>this</tt>, as if
   * <tt>root</tt> were the global object.
   *
   * <p>Root's properties are exactly the whitelistes global variable
   * references. These properties, both as they appear on the global
   * object and on this root object, are frozen and so cannot
   * diverge. This preserves the illusion.
   */
  var root = Object.create(null);

  /** Repair phase -- monkey patch safe replacements */
  (function() {

    /**
     * The unsafe* variables hold precious values that must not escape
     * to untrusted code. When {@code eval} is invoked via {@code
     * unsafeEval}, this is a call to the indirect eval function, not
     * the direct eval operator.
     */
    var unsafeEval = eval;
    var UnsafeFunction = Function;

    /**
     * Fails if {@code programSrc} does not parse as a strict Program
     * production.
     *
     * <p>Uses Ankur Taly's trick to cheaply check that a program
     * parses using the platform's parser, as implicitly accessed by
     * the original eval function, while nevertheless ensuring that no
     * code from {@code programSrc} executes in the process.
     *
     * <p>TODO(erights): Switch to Crock's alternate suggestion of
     * calling UnsafeFunction instead, since it will report early
     * errors but will not execute regardless.
     */
    function verifyStrictProgram(programSrc) {
      try {
        unsafeEval('"use strict"; ' +
                   'throw "NotASyntaxError"; ' +
                   programSrc);
      } catch (ex) {
        if (ex !== 'NotASyntaxError') {
          throw ex;
        }
      }
    }

    /**
     * Fails if {@code exprSource} does not parse as a strict
     * Expression production.
     */
    function verifyStrictExpression(exprSrc) {
      verifyStrictProgram(exprSrc + ';');
      verifyStrictProgram('( ' + exprSrc + '\n);');
    }

    /**
     * For all the enumerable own properties of {@code from}, copy
     * their descriptors to {@code virtualGlobal}, except that the
     * property added to {@code virtualGlobal} is unconditionally
     * non-enumerable and (for the moment) configurable.
     *
     * <p>By copying descriptors rather than values, any accessor
     * properties of {@code env} becomes an accessors of {code
     * virtualGlobal} with the same getter and setter. If these do not
     * use their {@code this} value, then the original any copied
     * properties are effectively joined.
     *
     * <p>We make these configurable so that {@code virtualGlobal} can
     * be further configured before being frozen. We make these
     * non-enumerable in order to emulate the normal behavior of
     * built-in properties of typical global objects, such as the
     * browser's {@code window} object.
     */
    function initGlobalProperties(from, virtualGlobal) {
      for (var name in from) {
        var desc = Object.getOwnPropertyDescriptor(from, name);
        if (desc) {
          desc.enumerable = false;
          desc.configurable = true;
          Object.defineProperty(virtualGlobal, name, desc);
        }
      }
    }

    /**
     * Make a frozen virtual global object whose properties are the
     * union of the whitelisted globals and the enumerable own
     * properties of {@code env}.
     *
     * <p>If there is a collision, the property from {@code env}
     * shadows the whitelisted global. We shadow by overwriting rather
     * than inheritance so that shadowing makes the original binding
     * inaccessible.
     *
     * <p>TODO(erights): Revisit whether the elements of {@code env}
     * should be made to appear as properties on the virtual global
     * binding of "this", rather than simply being in virtual global
     * scope. Each decision violates some assumptions.
     */
    function makeVirtualGlobal(env) {
      var virtualGlobal = Object.create(null);
      initGlobalProperties(root, virtualGlobal);
      initGlobalProperties(env, virtualGlobal);
      return Object.freeze(virtualGlobal);
    }

    /**
     * Make a frozen scope object which inherits from
     * {@code virtualGlobal}, for use by {@code with} to prevent
     * access to any {@code freeNames} other than those found on the.
     * {@code virtualGlobal}.
     */
    function makeScopeObject(virtualGlobal, freeNames) {
      var scopeObject = Object.create(virtualGlobal);
      for (var name in freeNames) {
        if (!(name in virtualGlobal)) {
          (function(name) {
            Object.defineProperty(scopeObject, name, {
              get: function() {
                throw new ReferenceError('"' + name + '" not in scope');
              },
              set: function(ignored) {
                throw new TypeError('Can\'t set "' + name + '"');
              },
              enumerable: true
            });
          })(name);
        }
      }
      return Object.freeze(scopeObject);
    }


    /**
     * Compile {@code exprSrc} as a strict expression into a function
     * of an environment {@code env}, that when called evaluates
     * {@code exprSrc} in a virtual global environment consisting only
     * of the whitelisted globals and a snapshot of the enumerable own
     * properties of {@code env}.
     *
     * <p>When SES {@code compile} is provided primitively, it should
     * accept a Program and return a function that evaluates it to the
     * Program's completion value. Unfortunately, this is not
     * practical as a library without some non-standard support from
     * the platform such as an parser API that provides an AST.
     *
     * <p>Thanks to Mike Samuel and Ankur Taly for this trick of using
     * {@code with} together with RegExp matching to intercept free
     * variable access without parsing.
     *
     * <p>TODO(erights): Switch to Erik Corry's suggestion that we
     * bring each of these variables into scope by generating a
     * shadowing declaration, rather than using "with".
     *
     * <p>TODO(erights): Find out if any platforms have any way to
     * associate a file name and line number with eval'ed text, and
     * arrange to pass these through compile and all its relevant
     * callers.
     */
    function compile(exprSrc) {
      if (dirty) { fail('Initial cleaning failed'); }
      verifyStrictExpression(exprSrc);
      var freeNames = atLeastFreeVarNames(exprSrc);
      var wrapperSrc =
        '(function() { ' +
        // non-strict code, where this === scopeObject
        '  with (this) { ' +
        '    return function() { ' +
        '      "use strict"; ' +
        '      return ( ' +
        // strict code, where this === virtualGlobal
        '        ' + exprSrc + '\n' +
        '      );\n' +
        '    };\n' +
        '  }\n' +
        '})';
      var wrapper = unsafeEval(wrapperSrc);
      return function(env) {
        var virtualGlobal = makeVirtualGlobal(env);
        var scopeObject = makeScopeObject(virtualGlobal, freeNames);
        return wrapper.call(scopeObject).call(virtualGlobal);
      };
    }

    var directivePattern = (/^['"](?:\w|\s)*['"]$/m);

    var requirePattern = (/^(?:\w*\s*(?:\w|\$|\.)*\s*=\s*)?\s*require\s*\(\s*['"]((?:\w|\$|\.|\/)+)['"]\s*\)$/m);

    /**
     * As an experiment, recognize a stereotyped prelude of the
     * CommonJS module system.
     */
    function getRequirements(modSrc) {
      var result = [];
      var stmts = modSrc.split(';');
      var stmt;
      var i = 0, ilen = stmts.length;
      for (; i < ilen; i++) {
        stmt = stmts[i].trim();
        if (stmt !== '') {
          if (!directivePattern.test(stmt)) { break; }
        }
      }
      for (; i < ilen; i++) {
        stmt = stmts[i].trim();
        if (stmt !== '') {
          var m = requirePattern.exec(stmt);
          if (!m) { break; }
          result.push(m[1]);
        }
      }
      return Object.freeze(result);
    }

    /**
     * A module source is actually any valid FunctionBody, and thus any valid
     * Program.
     *
     * <p>In addition, in case the module source happens to begin with
     * a streotyped prelude of the CommonJS module system, the
     * function resulting from module compilation has an additional
     * {@code "requirements"} property whose value is a list of the
     * module names being required by that prelude. These requirements
     * are the module's "immediate synchronous dependencies".
     *
     * <p>This {@code "requirements"} property is adequate to
     * bootstrap support for a CommonJS module system, since a loader
     * can first load and compile the transitive closure of an initial
     * module's synchronous depencies before actually executing any of
     * these module functions.
     *
     * <p>With a similarly lightweight RegExp, we should be able to
     * similarly recognize the {@code "load"} syntax of <a href=
     * "http://wiki.ecmascript.org/doku.php?id=strawman:simple_modules#syntax"
     * >Sam and Dave's module proposal for ES-Harmony</a>. However,
     * since browsers do not currently accept this syntax,
     * {@code getRequirements} above would also have to extract these
     * from the text to be compiled.
     */
    function compileModule(modSrc) {
      var moduleMaker = compile('(function() {' + modSrc + '}).call(this)');
      moduleMaker.requirements = getRequirements(modSrc);
      Object.freeze(moduleMaker.prototype);
      return Object.freeze(moduleMaker);
    }

    /**
     * A safe form of the {@code Function} constructor, which
     * constructs strict functions that can only refer freely to the
     * whitelisted globals.
     *
     * <p>The returned function is strict whether or not it declares
     * itself to be.
     */
    function FakeFunction(var_args) {
      var params = [].slice.call(arguments, 0);
      var body = params.pop();
      body = String(body || '');
      params = params.join(',');
      var exprSrc = '(function(' + params + '\n){' + body + '})';
      return compile(exprSrc)({});
    }
    FakeFunction.prototype = UnsafeFunction.prototype;
    FakeFunction.prototype.constructor = FakeFunction;
    global.Function = FakeFunction;

    /**
     * A safe form of the indirect {@code eval} function, which
     * evaluates {@code src} as strict code that can only refer freely
     * to the whitelisted globals.
     *
     * <p>Given our parserless methods of verifying untrusted sources,
     * we unfortunately have no practical way to obtain the completion
     * value of a safely evaluated Program. Instead, we adopt a
     * compromise based on the following observation. All Expressions
     * are valid Programs, and all Programs are valid
     * FunctionBodys. If {@code src} parses as a strict expression,
     * then we evaluate it as an expression it and correctly return its
     * completion value, since that is simply the value of the
     * expression.
     *
     * <p>Otherwise, we evaluate {@code src} as a FunctionBody and
     * return what that would return from its implicit enclosing
     * function. If {@code src} is simply a Program, then it would not
     * have an explicit {@code return} statement, and so we fail to
     * return its completion value. This is sufficient for using
     * {@code eval} to emulate script tags, since script tags also
     * lose the completion value.
     *
     * <p>When SES {@code eval} is provided primitively, it should
     * accept a Program and evaluate it to the Program's completion
     * value. Unfortunately, this is not practical as a library
     * without some non-standard support from the platform such as an
     * parser API that provides an AST.
     */
    function fakeEval(src) {
      try {
        verifyStrictExpression(src);
      } catch (x) {
        src = '(function() {' + src + '\n}).call(this)';
      }
      return compile(src)({});
    }
    global.eval = fakeEval;

    var defended = WeakMap();
    /**
     * To define a defended object is to freeze it and all objects
     * transitively reachable from it via transitive reflective
     * property and prototype traversal.
     */
    function def(root) {
      var defending = WeakMap();
      var defendingList = [];
      function recur(val) {
        if (val !== Object(val) || defended.get(val) || defending.get(val)) {
          return;
        }
        defending.set(val, true);
        defendingList.push(val);
        Object.freeze(val);
        recur(Object.getPrototypeOf(val));
        Object.getOwnPropertyNames(val).forEach(function(p) {
          if (typeof val === 'function' &&
              (p === 'caller' || p === 'arguments')) {
            return;
          }
          var desc = Object.getOwnPropertyDescriptor(val, p);
          if (!desc) {
            if (TOLERATE_MISSING_DESCRIPTOR) { return; }
            fail('missing descriptor: ' + p);
          }
          try {
            recur(desc.value);
            recur(desc.get);
            recur(desc.set);
          } catch (err) {
            if (TOLERATE_FAILED_FREEZE && err instanceof TypeError) {
              cajaVM.log('still diagnosing(' + p + '): ' + err);
            } else {
              throw err;
            }
          }
        });
      }
      recur(root);
      defendingList.forEach(function(obj) {
        defended.set(obj, true);
      });
      return root;
    }

    global.cajaVM = {
      log: function(str) {
        if (typeof console !== 'undefined' &&
            typeof console.log === 'function') {
          console.log(str);
        }
      },
      compile: compile,
      compileModule: compileModule,
      def: def
    };

  })();

  var cantNeuter = [];

  /**
   * Read the current value of base[name], and freeze that property as
   * a data property to ensure that all further reads of that same
   * property from that base produce the same value.
   *
   * <p>The frozen property should preserve the enumerability of the
   * original property.
   */
  function read(base, name) {
    var desc = Object.getOwnPropertyDescriptor(base, name);
    if (desc && 'value' in desc && !desc.writable && !desc.configurable) {
      return desc.value;
    }

    var result = base[name];
    try {
      Object.defineProperty(base, name, {
        value: result, writable: false, configurable: false
      });
    } catch (ex) {
      cantNeuter.push({base: base, name: name, err: ex});
    }
    return result;
  }

  /** Initialize accessible global variables and root */
  Object.keys(whitelist).forEach(function(name) {
    var desc = Object.getOwnPropertyDescriptor(global, name);
    if (desc) {
      var permit = whitelist[name];
      if (permit) {
        var value = read(global, name);
        Object.defineProperty(root, name, {
          value: value,
          writable: false,
          enumerable: desc.enumerable,
          configurable: false
        });
      }
    }
  });

  /**
   * The whiteTable should map from each path-accessible primordial
   * object to the permit object that describes how it should be
   * cleaned.
   *
   * <p>To ensure that each subsequent traverse obtains the same
   * values, these paths become paths of frozen data properties.
   */
  var whiteTable = WeakMap();
  function register(value, permit) {
    if (value !== Object(value)) { return; }
    if (typeof permit !== 'object') {
      return;
    }
    var oldPermit = whiteTable.get(value);
    if (oldPermit) {
      debugger;
      return;
    }
    whiteTable.set(value, permit);
    Object.keys(permit).forEach(function(name) {
      if (permit[name] !== 'skip') {
        var sub = read(value, name);
        register(sub, permit[name]);
      }
    });
  }
  register(root, whitelist);

  /**
   * We initialize the whiteTable only so that we can process "*" and
   * "skip" inheritance in the whitelist, by walking actual superclass
   * chains.
   */
  function isPermitted(base, name) {
    var permit = whiteTable.get(base);
    if (permit) {
      if (permit[name]) { return permit[name]; }
    }
    while (true) {
      base = Object.getPrototypeOf(base);
      if (base === null) { return false; }
      permit = whiteTable.get(base);
      if (permit && name in permit) {
        var result = permit[name];
        if (result === '*' || result === 'skip') {
          return result;
        } else {
          return false;
        }
      }
    }
  }

  var cleaning = WeakMap();

  var skipped = [];
  var goodDeletions = [];
  var badDeletions = [];

  /**
   * Assumes all super objects are otherwise accessible and so will be
   * independently cleaned.
   */
  function clean(value, n) {
    if (value !== Object(value)) { return; }
    if (cleaning.get(value)) { return; }
    cleaning.set(value, true);
    Object.getOwnPropertyNames(value).forEach(function(name) {
      var path = n + (n ? '.' : '') + name;
      var p = isPermitted(value, name);
      if (p) {
        if (p === 'skip') {
          skipped.push(path);
        } else {
          var sub = read(value, name);
          clean(sub, path);
        }
      } else {
        // Strict delete throws on failure, which we can't count on yet
        var success;
        try {
          success = delete value[name];
        } catch (x) {
          debugger;
          success = false;
        }
        if (success) {
          goodDeletions.push(path);
        } else {
          debugger;
          badDeletions.push(path);
        }
      }
    });
    if (value !== FREEZE_EARLY) {
      Object.freeze(value);
    }
  }
  if (FREEZE_EARLY) { Object.freeze(FREEZE_EARLY); }
  clean(root, '');

  function reportDiagnosis(desc, problemList) {
    if (problemList.length === 0) { return false; }
    cajaVM.log(desc + ': ' + problemList.sort().join(' '));
    return true;
  }

  //reportDiagnosis('Skipped', skipped);
  reportDiagnosis('Deleted', goodDeletions);

  if (cantNeuter.length >= 1) {
    var complaint = cantNeuter.map(function(p) {
      var desc = Object.getPropertyDescriptor(p.base, p.name);
      if (!desc) {
        return '  Missing ' + p.name;
      }
      return p.name + '(' + p.err + '): ' +
        Object.getOwnPropertyNames(desc).map(function(attrName) {
          var v = desc[attrName];
          if (v === Object(v)) { v = 'a ' + typeof v; }
          return attrName + ': ' + v;
        }).join(', ');

    });
    reportDiagnosis("Can't neuter", complaint);
  }

  if (!reportDiagnosis("Can't delete", badDeletions)) {
    // We succeeded. Enable safe Function, eval, and compile to work.
    cajaVM.log("success");
    dirty = false;
  }
}
// Copyright (C) 2011 Google Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Call startSES to turn this frame into a SES
 * environment following object-capability rules.
 */

(function() {
  "use strict";

  startSES(window, whitelist, atLeastFreeVarNames);
})();