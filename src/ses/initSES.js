"use strict";

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
 * Cleanse this frame or die trying.
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
 * @param global :Record(any) Assumed to be the real global object for
 *        this frame. Since initSES will allow global variable
 *        references that appear at the top level of the whitelist,
 *        our safety depends on these variables being frozen as a side
 *        effect of freezing the corresponding properties of
 *        <tt>global</tt>. These properties are also duplicated onto a
 *        <i>root accessible primordial</i>, which is provided as the
 *        <tt>this</tt> binding for hermetic eval calls -- emulating
 *        the safe subset of the normal global object.
 * @param whitelist :Record(Permit) 
 *            where Permit = true | "*" | Record(Permit).
 *        Describes the subset of naming paths starting from the root
 *        that should be accessible. The <i>accessible primordials</i>
 *        are this root plus all values found by navigating these paths
 *        starting from this root. All non-whitelisted properties of
 *        accessible primordials are deleted, and then all accessible
 *        primordials are frozen with the whitelisted properties
 *        frozen as data properties.
 * @param verify :F([srcString, startNameString, whitelist], srcString)
 *        An ES5 source verification procedure that returns the
 *        srcString if successful and otherwise throws an error. A
 *        source string verifies iff it is statically valid ES5-strict
 *        program text when parsed starting with the startNameString
 *        start production, and if it contains no free variables other
 *        than those listed at the top level of the whitelist.
 * @param ObjTable :F([],Record({get: F([Object], any), set: F([Object, any])}))
 *        A constructor of object tables, where an object table maps
 *        from objects-as-keys to values. The proposed EphemeronTable,
 *        if available, would be an excellent choice; but leakier
 *        tables are fine since these tables become unreachable after
 *        initialization anyway. 
 */
function initSES(global, whitelist, verify, ObjTable) {

  var dirty = true;

  function fail(str) { throw new EvalError(str); }
  
  if (function(){return this;}()) { fail('Requires at least ES5 support'); }

  /**
   * Code being eval'ed sees <tt>root</tt> as its <tt>this</tt>, as if
   * <tt>root</tt> were the global object. 
   * 
   * <p>Root's properties are exactly the whitelistes global variable
   * references. These properties, both as they appear on the global
   * object and on this root object, are frozen and so cannot
   * diverge. This preserves the illusion.
   */
  var root = {};

  // Repair phase -- monkey patch safe replacements
  (function() {
    
    var unsafeEval = eval;
    var UnsafeFunction = Function;
    var unsafeRegExpExec = RegExp.prototype.exec;
    var unsafeRegExpTest = RegExp.prototype.test;
    
    Function = function(var_args) {
      if (dirty) { fail('Initial cleaning failed'); }
      var params = ([]).slice.call(arguments, 0);
      var body = params.pop();
      body = body || ''; // Worry about NaN
      params = params.join(',');
      var expr = 'function(' + params + '\n){' + body + '}';
      expr = verify(expr, 'FunctionExpr', whitelist);
      return unsafeEval('"use strict";(' + expr +');');
    };
    Function.prototype = UnsafeFunction.prototype;
    Function.prototype.constructor = Function;
    
    eval = function(src) {
      return Function(src).call(root);
    };
    
    RegExp.prototype.exec = function(specimen) {
      return unsafeRegExpExec.call(this, String(specimen));
    };
    RegExp.prototype.test = function(specimen) {
      return unsafeRegExpTest.call(this, String(specimen));
    };
  })();

  /**
   * Read the current value of base[name], and freeze that property as
   * a data property to ensure that all further reads of that same
   * property from that base produce the same value.
   * 
   * <p>The frozen property should preserve the enumerability of the
   * original property.
   */
  function read(base, name) {
    var result = base[name];
    Object.defineProperty(base, name, {
      value: result, writable: false, configurable: false
    });
    return result;
  }

  // initialize accessible global variables and root
  Object.keys(whitelist).forEach(function(name) {
    var desc = Object.getOwnPropertyDescriptor(global, name);
    if (desc) {
      var permit = whitelist[name];
      if (permit) {
        var value = read(global, name);
        Object.defineProperty(root, name, { 
          value: value, 
          writable: false,
          configurable: false,
	  enumerable: desc.enumerable
        });
      }
    }
  });

  function isPrimitive(value) {
    return value !== Object(value);
  }

  // the whiteTable should map from each path-accessible
  // primordial object to the permit that describes how it should be
  // cleaned. To ensure that each subsequent traverse obtains the
  // same values, these paths become paths of frozen data
  // properties. 
  var whiteTable = ObjTable();
  function register(value, permit) {
    if (isPrimitive(value)) { return; }
    whiteTable.set(value, permit);
    if (typeof permit === 'object') {
      Object.keys(permit).forEach(function(name) {
	var sub = read(value, name);
	register(sub, permit[name]);
      });
    }
  }
  register(root, whitelist);

  // We initialize the whiteTable only so that we can process "*"
  // inheritance in the whitelist, by walking actual superclass chains.
  function isPermitted(base, name) {
    var permit = whiteTable.get(base);
    if (permit[name]) { return true; }
    while (true) {
      base = Object.getPrototypeOf(base);
      if (base === null) { return false; }
      permit = whiteTable.get(base);
      if (typeof permit === 'object' && name in permit) {
	return permit[name] === '*';
      }
    }
  }
  
  // Assumes all super objects are otherwise accessible and so will
  // be independently cleaned.
  function clean(value) {
    if (isPrimitive(value)) { return; }
    Object.getOwnPropertyNames(value).forEach(function(name) {
      if (isPermitted(value, name)) {
	var sub = read(value, name);
        clean(sub);
      } else {
	// Strict delete throws on failure
        delete value[name];
      }
    });
    Object.freeze(value);
  }
  clean(root);

  // We succeeded. Enable safe Function and eval to work.
  dirty = false;
}
