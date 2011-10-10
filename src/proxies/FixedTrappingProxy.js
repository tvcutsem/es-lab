// Copyright (C) 2011 Software Languages Lab, Vrije Universiteit Brussel
// This code is dual-licensed under both the Apache License and the MPL

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

/* Version: MPL 1.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is a prototype implementation of the fixed Harmony
 * Proxies strawman.
 *
 * The Initial Developer of the Original Code is
 * Tom Van Cutsem, Vrije Universiteit Brussel.
 * Portions created by the Initial Developer are Copyright (C) 2011
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *
 */

(function(){ // function-as-module pattern
"use strict";

// ----------------------------------------------------------------------------
// this is a prototype implementation of
// http://wiki.ecmascript.org/doku.php?id=strawman:fixed_properties

// This code was tested on tracemonkey / Firefox 7
// The code also loads correctly on v8 --harmony_proxies --harmony_weakmaps (v3.6.5.1)
// but does not work entirely as intended, since v8 proxies don't allow
// proxy handlers to return non-configurable property descriptors

// Dependencies:
//  - ECMAScript 5, ES5 strict mode
//  - Harmony Proxies with non-standard support for passing through
//    non-configurable properties
//  - Harmony WeakMaps

// Loading this file will automatically patch Proxy.create and
// Proxy.createFunction such that they support fixed, trapping proxies
// This is done by automatically wrapping all user-defined proxy handlers
// in a FixedHandler that checks and enforces ES5 invariants.

// A FixedHandler is a wrapper for a target proxy handler H.
// The FixedHandler forwards all operations to H, but additionally
// performs a number of integrity checks on the results of some traps,
// to make sure H does not violate the ES5 invariants w.r.t. non-configurable
// properties and non-extensible, sealed or frozen objects.

// For each property that H exposes as own, non-configurable
// (e.g. by returning a descriptor from a call to getOwnPropertyDescriptor)
// the FixedHandler keeps a record of that property's attributes
// (it does so by defining these properties on a non-proxy "fixedProps"
//  object). When the proxy becomes non-extensible, the "fixedProps" object
// will additionally store configurable own properties.
// We will call such properties that are stored on the "fixedProps" object
// "fixed properties".

// We will name fixed non-configurable properties "sealed properties".
// We will name fixed non-configurable non-writable properties "frozen
// properties".

// The FixedHandler upholds the following invariants w.r.t. non-configurability:
// - getOwnPropertyDescriptor cannot report sealed properties as non-existent
// - getOwnPropertyDescriptor cannot report incompatible changes to the
//   attributes of a sealed property (e.g. reporting a non-configurable
//   property as configurable, or reporting a non-configurable, non-writable
//   property as writable)
// - getPropertyDescriptor cannot report sealed properties as non-existent
// - getPropertyDescriptor cannot report incompatible changes to the
//   attributes of a sealed property. It _can_ report incompatible changes
//   to the attributes of non-own, inherited properties.
// - defineProperty cannot make incompatible changes to the attributes of
//   sealed properties
// - properties returned by the fix() trap are merged with fixed properties,
//   ensuring no incompatible changes can be made when calling freeze, seal,
//   preventExtensions. This merging is as atomic as Object.defineProperties.
// - delete cannot report a successful deletion of a sealed property
// - hasOwn cannot report a sealed property as non-existent
// - has cannot report a sealed property as non-existent
// - get cannot report inconsistent values for frozen data
//   properties, and must report undefined for sealed accessors with an
//   undefined getter
// - set cannot report a successful assignment for frozen data
//   properties or sealed accessors with an undefined setter.

// - if a property of a non-extensible proxy is reported as non-existent,
//   then it must forever be reported as non-existent. This applies to
//   own and inherited properties and is enforced in the
//   delete, fix, get{Own}PropertyDescriptor and has{Own} traps.

// Violation of any of these invariants by H will result in TypeError being
// thrown.

// Additionally, once Object.preventExtensions, Object.seal or Object.freeze
// is invoked on the proxy, the set of own property names for the proxy is
// fixed. Any property name that is not fixed is called a 'new' property.

// The FixedHandler upholds the following invariants regarding extensibility:
// - getOwnPropertyDescriptor cannot report new properties as existent
//   (it must report them as non-existent by returning undefined)
// - defineProperty cannot successfully add a new property (it must reject)
// - getOwnPropertyNames cannot list new properties
// - hasOwn cannot report true for new properties (it must report false)
// - keys cannot list new properties

// Invariants currently not enforced:
// - getOwnPropertyNames lists only own property names
// - getOwnPropertyNames lists all own property names
// - keys lists only enumerable own property names
// - keys lists all enumerable own property names
// - enumerate lists all enumerable own property names
// - if any of the enumerating traps reports a property as non-existent,
//   we do not enforce that such properties cannot later be reported
//   as existent

// Invariants with regard to inheritance are currently not enforced.
// - a non-configurable potentially inherited property on a proxy with
//   non-mutable ancestry cannot be reported as non-existent

// An object with non-mutable ancestry is a non-extensible object whose
// [[Prototype]] is either null or an object with non-mutable ancestry.

// The FixedHandler is compatible with the existing ForwardingHandler.
// Invariant: when a FixedHandler wraps a ForwardingHandler to an
// ES5-compliant object, the FixedHandler will never throw a TypeError.

// ==== Changes in Handler API compared to current Harmony:Proxies ====

// 1. The fix() trap is parameterized with the name of the operation that
//    caused the trap invocation, either one of the Strings 'freeze', 'seal',
//    or 'preventExtensions'. The idea is that a forwarding handler can
//    now easily forward this operation generically by performing:
//    fix: function(op) { Object[op](target); return true; }

// 2. The fix() trap no longer "fixes" the proxy in the sense that the
//    proxy doesn't "become" a new object. The proxy remains fully
//    trapping. There is a new Proxy.stopTrapping(obj) operation that
//    can control this aspect of a proxy separately.

//    Proxy.stopTrapping(obj)
//      - expects an Object, and always returns obj
//      - if obj is a non-proxy object, this is a no-op
//      - if obj is a proxy, calls the proxy's new "stopTrapping" trap.
//        This trap either returns undefined | pdmap.
//        If the trap returns a pdmap, the proxy henceforth 'becomes'
//        an object that contains the props in the pdmap.
//        If the trap returns undefined, Proxy.stopTrapping is a no-op.
//        (rationale for the no-op behavior: we don't want clients to be
//         able to figure out whether an object is a proxy by calling
//         Object.stopTrapping).

// === Design Notes ===

// Changes to consider:
// - Rename 'fix' trap to 'protect' trap. The term 'fix' is ambiguous:
//   - old meaning referred to preventExtensions
//   - new meaning = 'pinning' properties to the fixedProps object

// - We could make the initial fixedProps object parameterizable, as in:
//      Proxy.create(handler, proto, fixedProps)
//    The proxy would inherit from its fixedProps object its [[Class]], for use
//    in ({}).prototype.toString.call(aProxy) or possibly even in internal
//    nominal type checks. This is the starting direction for the new
//    "Direct Proxies" proposal, coming soon.

// ----------------------------------------------------------------------------

// ---- Normalization functions for property descriptors ----

function isStandardAttribute(name) {
  return /^(get|set|value|writable|enumerable|configurable)$/.test(name);
}

// Adapted from ES5 section 8.10.5
function toPropertyDescriptor(obj) {
  if (Object(obj) !== obj) {
    throw new TypeError("property descriptor should be an Object, given: "+
                        obj);
  }
  var desc = {};
  if ('enumerable' in obj) { desc.enumerable = !!obj.enumerable; }
  if ('configurable' in obj) { desc.configurable = !!obj.configurable; }
  if ('value' in obj) { desc.value = obj.value; }
  if ('writable' in obj) { desc.writable = !!obj.writable; }
  if ('get' in obj) {
    var getter = obj.get;
    if (getter !== undefined && typeof getter !== "function") {
      throw new TypeError("property descriptor 'get' attribute must be "+
                          "callable or undefined, given: "+getter);
    }
    desc.get = getter;
  }
  if ('set' in obj) {
    var setter = obj.set;
    if (setter !== undefined && typeof setter !== "function") {
      throw new TypeError("property descriptor 'set' attribute must be "+
                          "callable or undefined, given: "+setter);
    }
    desc.set = setter;
  }
  if ('get' in desc || 'set' in desc) {
    if ('value' in desc || 'writable' in desc) {
      throw new TypeError("property descriptor cannot be both a data and an "+
                          "accessor descriptor: "+obj);
    }
  }
  return desc;
}

function isAccessorDescriptor(desc) {
  if (desc === undefined) return false;
  return ('get' in desc || 'set' in desc);
}
function isDataDescriptor(desc) {
  if (desc === undefined) return false;
  return ('value' in desc || 'writable' in desc);
}
function isGenericDescriptor(desc) {
  if (desc === undefined) return false;
  return !isAccessorDescriptor(desc) && !isDataDescriptor(desc);
}

function toCompletePropertyDescriptor(desc) {
  var internalDesc = toPropertyDescriptor(desc);
  if (isGenericDescriptor(internalDesc) || isDataDescriptor(internalDesc)) {
    if (!('value' in internalDesc)) { internalDesc.value = undefined; }
    if (!('writable' in internalDesc)) { internalDesc.writable = false; }
  } else {
    if (!('get' in internalDesc)) { internalDesc.get = undefined; }
    if (!('set' in internalDesc)) { internalDesc.set = undefined; }
  }
  if (!('enumerable' in internalDesc)) { internalDesc.enumerable = false; }
  if (!('configurable' in internalDesc)) { internalDesc.configurable = false; }
  return internalDesc;
}

/**
 * Returns a fresh property descriptor that is guaranteed
 * to be complete (i.e. contain all the standard attributes).
 * Additionally, any non-standard enumerable properties of
 * attributes are copied over to the fresh descriptor.
 *
 * If attributes is undefined, returns undefined.
 *
 * See also: http://wiki.ecmascript.org/doku.php?id=harmony:proxies_semantics
 */
function normalizeAndCompletePropertyDescriptor(attributes) {
  if (attributes === undefined) { return undefined; }
  var desc = toCompletePropertyDescriptor(attributes);
  // Note: no need to call FromPropertyDescriptor(desc), as we represent
  // "internal" property descriptors as proper Objects from the start
  for (var name in attributes) {
    if (!isStandardAttribute(name)) {
      Object.defineProperty(desc, name,
        { value: attributes[name],
          writable: true,
          enumerable: true,
          configurable: true });
    }
  }
  return desc;
}

/**
 * Returns a fresh property descriptor whose standard
 * attributes are guaranteed to be data properties of the right type.
 * Additionally, any non-standard enumerable properties of
 * attributes are copied over to the fresh descriptor.
 *
 * If attributes is undefined, will throw a TypeError.
 *
 * See also: http://wiki.ecmascript.org/doku.php?id=harmony:proxies_semantics
 */
function normalizePropertyDescriptor(attributes) {
  var desc = toPropertyDescriptor(attributes);
  // Note: no need to call FromGenericPropertyDescriptor(desc), as we represent
  // "internal" property descriptors as proper Objects from the start
  for (var name in attributes) {
    if (!isStandardAttribute(name)) {
      Object.defineProperty(desc, name,
        { value: attributes[name],
          writable: true,
          enumerable: true,
          configurable: true });
    }
  }
  return desc;
}

// store a reference to the real ES5 primitives before patching them later
var prim_preventExtensions = Object.preventExtensions,
    prim_seal = Object.seal,
    prim_freeze = Object.freeze,
    prim_isExtensible = Object.isExtensible,
    prim_isSealed = Object.isSealed,
    prim_isFrozen = Object.isFrozen;

// ---- The FixedHandler wrapper ----

function FixedHandler(targetHandler) {
  // the handler that is "guarded"
  this.targetHandler = targetHandler;
  // A record of previously exposed own properties.
  // As long as the proxy is extensible, fixedProps need only store
  // non-configurable properties. Once the proxy becomes non-extensible,
  // fixedProps stores all own properties, including configurable ones.
  this.fixedProps = Object.create(null);
}

FixedHandler.prototype = {
  
  /**
   * Is this proxy still extensible?
   *
   * Extensibility of the proxy is derived from extensibility of its
   * fixedProps object.
   */
  isExtensible: function() {
    return prim_isExtensible(this.fixedProps);
  },
  
  /**
   * Is 'name' a fixed, own property of the proxy?
   */
  isFixed: function(name) {
    return ({}).hasOwnProperty.call(this.fixedProps, name);
  },
  
  // === fundamental traps ===
  
  /**
   * If name denotes a fixed property, check:
   *   - whether targetHandler reports it as existent
   *   - whether the returned descriptor is compatible with the fixed property
   * If the proxy is non-extensible, check:
   *   - whether name is not a new property
   * Additionally, the returned descriptor is normalized and completed.
   */
  getOwnPropertyDescriptor: function(name) {
    "use strict";
    name = String(name);
    var desc = this.targetHandler.getOwnPropertyDescriptor(name);
    desc = normalizeAndCompletePropertyDescriptor(desc);
    
    if (desc === undefined) {
      // if name exists and is non-configurable, delete will throw
      //   (can't report a non-configurable own property as non-existent)
      // if name does not exist, will be a no-op
      // if name is configurable, will delete the property      
      try {
        delete this.fixedProps[name];
      } catch (e) {
        // re-throw solely to improve the error message
        throw new TypeError("cannot report non-configurable property '"+name+
                            "' as non-existent");
      }
      return undefined;
    }
    
    // at this point, we know (desc !== undefined), i.e.
    // targetHandler reports 'name' as an existing property
    
    // Note: we could collapse the following two if-tests into a single
    // test. Separating out the cases to improve error reporting.
    
    if (!this.isExtensible()) {
      // if name exists, should be a no-op as per ES5 8.12.9, step 5
      // if name does not exist, will raise an exception
      // as per ES5 8.12.9, step 3
      try {
        Object.defineProperty(this.fixedProps, name, {});
      } catch (e) {
        // rethrowing solely to improve error message
        throw new TypeError("cannot report a new own property '"+
                            name + "' on a non-extensible object");
      }
    }

    if (this.isFixed(name) || // if 'name' was previously fixed,
        !desc.configurable) { // or is reported as non-configurable
      // check and remember the returned desc
      // will throw if desc is not compatible with fixedDesc, if it exists
      Object.defineProperty(this.fixedProps, name, desc);
    }
    
    return desc;
  },
  
  /**
   * If name denotes a fixed property, check:
   *   - whether targetHandler reports it as existent
   *   - whether the returned descriptor is compatible with the fixed property
   * Additionally, the returned descriptor is normalized and completed.
   * If name does not denote a fixed property, we assume the returned property
   * is inherited. In that case, no further checks are required, since an
   * inherited property, even if non-configurable, can always be shadowed later
   * by an incompatible property further down the inheritance chain
   */
  getPropertyDescriptor: function(name) {
    "use strict";
    name = String(name);
    var desc = this.targetHandler.getPropertyDescriptor(name);
    desc = normalizeAndCompletePropertyDescriptor(desc);

    if (desc === undefined) {
      // if name exists and is non-configurable, delete will throw
      //   (can't report a non-configurable own property as non-existent)
      // if name does not exist, will be a no-op
      // if name is configurable, will delete the property      
      try {
        delete this.fixedProps[name];        
      } catch (e) {
        // re-throw solely to improve the error message
        throw new TypeError("cannot report non-configurable property '"+name+
                            "' as non-existent");
      }
      return undefined;
    }
    
    // at this point, we know (desc !== undefined), i.e.
    // targetHandler reports 'name' as an existing property
    
    // even if proxy is non-extensible and does not define 'name',
    // [[GetProperty]] may return a descriptor ('name' may have been
    // defined on an extensible [[Prototype]])
    
    // if 'name' was previously fixed, check and remember the returned desc
    // Note: if name was not previously fixed,
    // we treat desc as an inherited property and perform no check
    if (this.isFixed(name)) {
      // will throw if desc is not compatible with fixedDesc, if it exists
      Object.defineProperty(this.fixedProps, name, desc);
    }
    
    return desc;
  },
  
  /**
   * If name denotes a fixed property, check for incompatible changes.
   * If the proxy is non-extensible, check that new properties are rejected.
   */
  defineProperty: function(name, desc) {
    // TODO(tvcutsem): the current tracemonkey implementation of proxies
    // auto-completes 'desc', which is not correct. 'desc' should be
    // normalized, but not completed. Consider:
    // Object.defineProperty(proxy, 'foo', {enumerable:false})
    // This trap will receive desc =
    //  {value:undefined,writable:false,enumerable:false,configurable:false}
    // This will also set all other attributes to their default value,
    // which is unexpected and different from [[DefineOwnProperty]].
    // Bug filed: https://bugzilla.mozilla.org/show_bug.cgi?id=601329

    name = String(name);    
    desc = normalizePropertyDescriptor(desc);
    var success = this.targetHandler.defineProperty(name, desc);
    success = !!success; // coerce to Boolean


    if (success === true) {
      
      // Note: we could collapse the following two if-tests into a single
      // test. Separating out the cases to improve error reporting.
      
      if (!this.isExtensible()) {
        // if name exists, should be a no-op as per ES5 8.12.9, step 5
        // if name does not exist, will raise an exception
        // as per ES5 8.12.9, step 3
        try {
          Object.defineProperty(this.fixedProps, name, {});
        } catch (e) {
          // rethrowing solely to improve error message
          throw new TypeError("cannot successfully add a new property '"+
                              name + "' to a non-extensible object");
        }
      }

      if (this.isFixed(name) || !desc.configurable) {
        // will throw if desc is not compatible with fixedDesc, if it exists
        Object.defineProperty(this.fixedProps, name, desc);
      }
      
    }
    
    return success;
  },
  
  /**
   * Check whether all properties returned by the fix() trap are compatible
   * with the already fixed properties.
   *
   * Note: we slightly modified the fix trap such that it receives the
   * operation name (freeze,seal,preventExtensions) as an argument.
   */
  fix: function(operation) {      
    // guard against recursive fixing
    if (this.fixing) {
      throw new TypeError("cannot recursively call the fix() trap "+
                          "while fixing a proxy");
    }

    var props = null;
    try {
      this.fixing = true;
      props = this.targetHandler.fix(operation);
    } finally {
      delete this.fixing;
    }

    if (props === undefined) {
      throw new TypeError(operation + " was rejected");
    }
    
    // will throw if any of the props returned already exist in
    // fixedProps and are incompatible with existing attributes
    Object.defineProperties(this.fixedProps, props);
    
    // the proxy is set to non-extensible by the caller of fix, by
    // making this.fixedProps non-extensible, sealed or frozen
  },
  
  /**
   * A new fundamental trap, triggered by Object.stopTrapping(aProxy)
   *
   * Returns undefined | a property descriptor map
   * The FixedHandler merges the returned properties with the fixedProps
   * object.
   */
  stopTrapping: function() {
    // guard against recursive calls to stopTrapping
    if (this.stopping) {
      throw new TypeError("cannot recursively call stopTrapping() "+
                          "while calling stopTrapping() on a proxy");
    }

    var props = null;
    try {
      this.stopping = true;
      props = this.targetHandler.stopTrapping();
    } finally {
      delete this.stopping;
    }
    
    if (props) {
      // will throw if any of the props returned already exist in
      // fixedProps and are incompatible with existing attributes
      Object.defineProperties(this.fixedProps, props);      
    }
    
    // the FixedHandler proxy becomes disabled by the caller of
    // the stopTrapping trap, by replacing the proxy's handler
    // traps by default forwarding traps

    return props;
  },
  
  /**
   * If name denotes a fixed property, check whether handler rejects.
   */
  'delete': function(name) { 
    "use strict";
    name = String(name);
    var res = this.targetHandler['delete'](name);
    res = !!res; // coerce to Boolean
    
    if (res === true) {
      //  if name was not previously fixed, this is a no-op
      //  if name is fixed and configurable, delete it from fixedProps
      //  if name is fixed and non-configurable, delete will throw
      try {
        delete this.fixedProps[name];
      } catch (e) {
        // rethrow solely to improve the error message
        throw new TypeError("property '"+name+"' is non-configurable "+
                            "and can't be deleted");        
      }
    }
    
    return res;
  },
  
  /**
   * Checks whether the trap result does not contain any new properties
   * if the proxy is non-extensible.
   *
   * Additionally, the trap result is normalized.
   * Instead of returning the trap result directly:
   *  - create and return a fresh Array,
   *  - of which each element is coerced to String,
   *  - which does not contain duplicates.
   *
   * TODO(tvcutsem): strictly speaking, the returned result should
   * at least contain the non-configurable properties from this.fixedProps,
   * but this might require an unpleasant amount of bookkeeping.
   */
  getOwnPropertyNames: function() {
    var trapResult = this.targetHandler.getOwnPropertyNames();

    // propNames is used as a set of strings
    var propNames = Object.create(null);
    var numProps = +trapResult.length;
    var result = new Array(numProps);
    
    for (var i = 0; i < numProps; i++) {
      var s = String(trapResult[i]);
      if (propNames[s]) {
        // TODO(tvcutsem): we could also silently ignore duplicates
        throw new TypeError("getOwnPropertyNames cannot list a "+
                            "duplicate property '"+s+"'");
      }
      if (!this.isExtensible() && !this.isFixed(s)) {
        // non-extensible proxies don't tolerate new own property names
        throw new TypeError("getOwnPropertyNames cannot list a new "+
                            "property '"+s+"' on a non-extensible object");
      }
      
      propNames[s] = true;
      result[i] = s;
    }
    
    return result;
  },
  
  /**
   * Contrary to getOwnPropertyNames, this trap does not check whether the
   * trap result does not contain any new properties if the proxy is
   * non-extensible: the proxy may still inherit from extensible prototypes
   * that add new properties later.
   *
   * The trap result is normalized.
   * Instead of returning the trap result directly:
   *  - create and return a fresh Array,
   *  - of which each element is coerced to String,
   *  - which does not contain duplicates.
   *
   * TODO(tvcutsem): strictly speaking, the returned result should
   * at least contain the non-configurable properties from this.fixedProps
   * but this might require an unpleasant amount of bookkeeping.
   */
  getPropertyNames: function() {
    var trapResult = this.targetHandler.getPropertyNames();
  
    // propNames is used as a set of strings
    var propNames = Object.create(null);
    var numProps = +trapResult.length;
    var result = new Array(numProps);
    
    for (var i = 0; i < numProps; i++) {
      var s = String(trapResult[i]);
      if (propNames[s]) {
        throw new TypeError("getPropertyNames cannot list a "+
                            "duplicate property '"+s+"'");
      }
      propNames[s] = true;
      result[i] = s;
    }
    return result;
  },
  
  // === derived traps ===
  
  /**
   * If name denotes a fixed property, check whether the trap returns true.
   * If name denotes a new property on a non-extensible proxy, check whether
   * the trap returns false.
   */
  hasOwn: function(name) {
    "use strict";
    name = String(name);
    // simulate missing derived trap fall-back behavior
    var trap = this.targetHandler.hasOwn;
    var res = (trap || TrapDefaults.hasOwn).call(this.targetHandler, name);
    res = !!res; // coerce to Boolean
        
    if (res === false) {
      try {
        // if name exists and is non-configurable, delete will throw
        //   (can't report a non-configurable own property as non-existent)
        // if name does not exist, will be a no-op
        // if name is configurable, will delete the property (this also
        // ensures that on a non-extensible proxy it cannot be added later)         
        delete this.fixedProps[name];
      } catch (e) {
        // re-throw solely to improve the error message
        throw new TypeError("cannot report existing non-configurable own "+
                            "property '"+name + "' as a non-existent own "+
                            "property");
      }
    } else {
      // res === true, if the proxy is non-extensible,
      // check that name is no new property
      if (!this.isExtensible()) {
        // if name exists, should be a no-op as per ES5 8.12.9, step 5
        // if name does not exist, will raise an exception
        // as per ES5 8.12.9, step 3
        try {
          Object.defineProperty(this.fixedProps, name, {});
        } catch (e) {
          // rethrowing solely to improve error message
          throw new TypeError("cannot report a new own property '"+
                              name + "' on a non-extensible object");
        }
      }
    }
    
    return res;
  },
  
  /**
   * If name denotes a fixed property, check whether the trap returns true.
   */
  has: function(name) {
    "use strict";
    name = String(name);
    // simulate missing derived trap fall-back behavior
    var trap = this.targetHandler.has;
    var res = (trap || TrapDefaults.has).call(this.targetHandler, name);
    res = !!res; // coerce to Boolean
    
    if (res === false) {
      try {
        // if name exists and is non-configurable, delete will throw
        //   (can't report a non-configurable own property as non-existent)
        // if name does not exist, will be a no-op
        // if name is configurable, will delete the property          
        delete this.fixedProps[name];
      } catch (e) {
        // re-throw solely to improve the error message
        throw new TypeError("cannot report existing non-configurable own "+
                            "property '"+ name + "' as a non-existent "+
                            "property");
      }
    }
    
    // if res === true, we don't need to check for extensibility
    // even for a non-extensible proxy that has no own name property,
    // the property may have been inherited
    
    return res;
  },
  
  /**
   * If name denotes a fixed non-configurable, non-writable data property,
   * check its return value against the previously asserted value of the
   * fixed property.
   */
  get: function(rcvr, name) {
    name = String(name);
    // simulate missing derived trap fall-back behavior
    var trap = this.targetHandler.get;
    var res = (trap || TrapDefaults.get).call(this.targetHandler, rcvr, name);
    
    var fixedDesc = Object.getOwnPropertyDescriptor(this.fixedProps, name);
    // check consistency of the returned value
    if (fixedDesc !== undefined) { // getting an existing property
      if (isDataDescriptor(fixedDesc)) { // own data property
        // if name is a fixed non-configurable, non-writable property,
        // this call will throw unless SameValue(res, this.fixedProps[name])
        Object.defineProperty(this.fixedProps, name, {value: res}); 
      } else { // it's an accessor property
        if (fixedDesc.configurable === false && // non-configurable
            fixedDesc.get === undefined &&      // accessor with undefined getter
            res !== undefined) {                // that does not return undefined
          throw new TypeError("must report undefined for non-configurable "+
                              "accessor property '"+name+"' without getter");
        }
      }
    }
    
    return res;
  },
  
  /**
   * If name denotes a fixed non-configurable, non-writable data property,
   * check that the trap rejects the assignment.
   */
  set: function(rcvr, name, val) {
    name = String(name);
    // simulate missing derived trap fall-back behavior
    var trap = this.targetHandler.set;
    var res = (trap || TrapDefaults.set).call(this.targetHandler, rcvr, name, val);
    res = !!res; // coerce to Boolean
         
    // if success is reported, check whether property is truly assignable
    if (res === true) {
      var fixedDesc = Object.getOwnPropertyDescriptor(this.fixedProps, name);
      if (fixedDesc !== undefined) { // setting an existing property
        if (isDataDescriptor(fixedDesc)) { // own data property
          // if name is a fixed non-configurable, non-writable property,
          // this call will throw unless SameValue(val, this.fixedProps[name])
          Object.defineProperty(this.fixedProps, name, {value: val});
        } else { // it's an accessor property
          if (fixedDesc.configurable === false && // non-configurable
              fixedDesc.set === undefined) {      // accessor with undefined setter
            throw new TypeError("setting a property '"+name+"' that has "+
                                " only a getter");
          }
        }
      }
    }
    
    return res;
  },
  
  /**
   * The trap result is normalized.
   * The trap result is not returned directly. Instead:
   *  - create and return a fresh Array,
   *  - of which each element is coerced to String,
   *  - which does not contain duplicates
   *
   * TODO(tvcutsem): strictly speaking, the returned result should
   * at least contain the enumerable non-configurable fixed properties.
   */
  enumerate: function() {
    // simulate missing derived trap fall-back behavior
    var trap = this.targetHandler.enumerate;
    var trapResult = (trap || TrapDefaults.enumerate).call(this.targetHandler);

    // propNames is used as a set of strings
    var propNames = Object.create(null);
    var numProps = +trapResult.length;
    var result = new Array(numProps);
    
    for (var i = 0; i < numProps; i++) {
      var s = String(trapResult[i]);
      if (propNames[s]) {
        throw new TypeError("enumerate trap cannot list a "+
                            "duplicate property '"+s+"'");
      }

      propNames[s] = true;
      result[i] = s;
    }

    return result;
  },
  
  /**
   * Checks whether the trap result does not contain any new properties
   * if the proxy is non-extensible.
   *
   * The trap result is normalized.
   * The trap result is not returned directly. Instead:
   *  - create and return a fresh Array,
   *  - of which each element is coerced to String,
   *  - which does not contain duplicates
   *
   * TODO(tvcutsem): strictly speaking, the returned result should
   * at least contain the enumerable non-configurable fixed properties.
   */
  keys: function() {
    // simulate missing derived trap fall-back behavior
    var trap = this.targetHandler.keys;
    var trapResult = (trap || TrapDefaults.keys).call(this.targetHandler);

    // propNames is used as a set of strings
    var propNames = Object.create(null);
    var numProps = +trapResult.length;
    var result = new Array(numProps);
    
    for (var i = 0; i < numProps; i++) {
     var s = String(trapResult[i]);
     if (propNames[s]) {
       throw new TypeError("keys trap cannot list a "+
                           "duplicate property '"+s+"'");
     }
     if (!this.isExtensible() && !this.isFixed(s)) {
       // non-extensible proxies don't tolerate new own property names
       throw new TypeError("keys trap cannot list a new "+
                           "property '"+s+"' on a non-extensible object");
     }
     
     propNames[s] = true;
     result[i] = s;
    }
    
    return result;
  }
};

// === end of the FixedHandler ===

// In what follows, a 'fixable proxy' is a proxy
// whose handler is a FixedHandler. Such proxies can be made non-extensible,
// sealed or frozen without losing the ability to trap.

// maps fixable proxies to their FixedHandlers
var fixableProxies = new WeakMap();

// patch Object.{preventExtensions,seal,freeze} so that
// they recognize fixable proxies and act accordingly
Object.preventExtensions = function(target) {
  var fixedHandler = fixableProxies.get(target);
  if (fixedHandler !== undefined) {
    fixedHandler.fix('preventExtensions');
    // Note: this sets the fixedProp's [[Extensible]] bit to false
    // thereby also making the proxy non-extensible
    prim_preventExtensions(fixedHandler.fixedProps);
    return target;
  } else {
    return prim_preventExtensions(target);
  }
};
Object.seal = function(target) {
  var fixedHandler = fixableProxies.get(target);
  if (fixedHandler !== undefined) {
    fixedHandler.fix('seal');
    // Note: this makes all of the handler's fixed properties
    // non-configurable. The handler will now enforce the
    // invariants for non-configurability on all own properties.
    prim_seal(fixedHandler.fixedProps);
    return target;
  } else {
    return prim_seal(target);
  }
};
Object.freeze = function(target) {
  var fixedHandler = fixableProxies.get(target);
  if (fixedHandler !== undefined) {
    fixedHandler.fix('freeze');
    // Note: this makes all of the handler's fixed properties
    // non-configurable and non-writable. The handler will now
    // enforce the invariants for non-configurability on all own properties.
    prim_freeze(fixedHandler.fixedProps);
    return target;
  } else {
    return prim_freeze(target);
  }
};
Object.isExtensible = function(target) {
  var fixedHandler = fixableProxies.get(target);
  if (fixedHandler !== undefined) {
    return prim_isExtensible(fixedHandler.fixedProps);
  } else {
    return prim_isExtensible(target);
  }
};
Object.isSealed = function(target) {
  var fixedHandler = fixableProxies.get(target);
  if (fixedHandler !== undefined) {
    return prim_isSealed(fixedHandler.fixedProps);
  } else {
    return prim_isSealed(target);
  }
};
Object.isFrozen = function(target) {
  var fixedHandler = fixableProxies.get(target);
  if (fixedHandler !== undefined) {
    return prim_isFrozen(fixedHandler.fixedProps);
  } else {
    return prim_isFrozen(target);
  }
};
Object.stopTrapping = function(target) {
  var fixedHandler = fixableProxies.get(target);
  if (fixedHandler !== undefined) {
    // replace the FixedHandler by a default Forwarding Handler
    if (fixedHandler instanceof FixedHandler) {
      // call the 'stopTrapping' trap
      var props = fixedHandler.stopTrapping();
      if (props !== undefined) {
        // if that trap returns successfully, the proxy now 'becomes'
        // a simple forwarding proxy to the fixedProps object
        for (var trapName in Handler.prototype) {
          // override all of FixedHandler's traps to instead perform
          // the default forwarding behavior on fixedProps
          fixedHandler[trapName] = Handler.prototype[trapName];
        }
        // 'fixedProps' becomes the 'target'
        fixedHandler.target = fixedHandler.fixedProps;
        // we can now release the targetHandler:
        delete fixedHandler.targetHandler;
        // keep the fixedProps object on fixedHandler such that
        // freeze, seal, preventExtensions, isFrozen, isSealed, isExtensible
        // continue to work
      }
    }
  }
  return target;
};

// ---- Trap Defaults ----

// Adapted from <http://wiki.ecmascript.org/doku.php?id=harmony:proxies>
// with added normalization checks. Call these with |this| bound to the
// required handler
var TrapDefaults = {
  has: function(name) { return !!this.getPropertyDescriptor(name); },
  hasOwn: function(name) { return !!this.getOwnPropertyDescriptor(name); },
  get: function(receiver, name) {
    var desc = this.getPropertyDescriptor(name);
    desc = normalizeAndCompletePropertyDescriptor(desc);
    if (desc === undefined) { return undefined; }
    if ('value' in desc) {
      return desc.value;
    } else {
      if (desc.get === undefined) { return undefined; }
      // Note: assumes original Function.prototype.call
      return desc.get.call(receiver);
    }
  },
  set: function(receiver, name, val) {
    var desc = this.getOwnPropertyDescriptor(name);
    desc = normalizeAndCompletePropertyDescriptor(desc);
    if (desc) {
      if ('writable' in desc) {
        if (desc.writable) {
          this.defineProperty(name, {value: val});
          return true;
        } else {
          return false;
        }
      } else { // accessor
        if (desc.set) {
          // Note: assumes original Function.prototype.call
          desc.set.call(receiver, val);
          return true;
        } else {
          return false;
        }
      }
    }
    desc = this.getPropertyDescriptor(name);
    desc = normalizeAndCompletePropertyDescriptor(desc);
    if (desc) {
      if ('writable' in desc) {
        if (desc.writable) {
          // fall through
        } else {
          return false;
        }
      } else { // accessor
        if (desc.set) {
          // Note: assumes original Function.prototype.call
          desc.set.call(receiver, val);
          return true;
        } else {
          return false;
        }
      }
    }
    this.defineProperty(name, {
      value: val, 
      writable: true, 
      enumerable: true, 
      configurable: true});
    return true;
  },
  enumerate: function() {
    var trapResult = this.getPropertyNames();
    var l = +trapResult.length;
    var result = [];
    for (var i = 0; i < l; i++) {
      var name = String(trapResult[i]);
      var desc = this.getPropertyDescriptor(name);
      desc = normalizeAndCompletePropertyDescriptor(desc);
      if (desc.enumerable) {
        result.push(name);
      }
    }
    return result;
  },
  keys: function() {
    var trapResult = this.getOwnPropertyNames();
    var l = +trapResult.length;
    var result = [];
    for (var i = 0; i < l; i++) {
      var name = String(trapResult[i]);
      var desc = this.getOwnPropertyDescriptor(name);
      desc = normalizeAndCompletePropertyDescriptor(desc);
      if (desc.enumerable) {
        result.push(name);
      }
    }
    return result;
  }
  
}; // end TrapDefaults

if (typeof Proxy === "object") {
  var primCreate = Proxy.create,
      primCreateFunction = Proxy.createFunction;

  Proxy.create = function(handler, proto) {
    var fixedHandler = new FixedHandler(handler);
    var proxy = primCreate(fixedHandler, proto);
    fixableProxies.set(proxy, fixedHandler);
    return proxy;
  };
  Proxy.createFunction = function(handler, call, opt_construct) {
    var fixedHandler = new FixedHandler(handler);
    var proxy = opt_construct !== undefined ?
                 primCreateFunction(fixedHandler, call, opt_construct) :
                 primCreateFunction(fixedHandler, call);
    fixableProxies.set(proxy, fixedHandler);
    return proxy;
  };
} 

})(); // function-as-module pattern