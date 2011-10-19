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
// http://wiki.ecmascript.org/doku.php?id=strawman:direct_proxies

// This code was tested on tracemonkey / Firefox 7
// The code also loads correctly on v8 --harmony_proxies --harmony_weakmaps (v3.6.5.1)
// but does not work entirely as intended, since v8 proxies don't allow
// proxy handlers to return non-configurable property descriptors

// Language Dependencies:
//  - ECMAScript 5, ES5 strict mode
//  - Harmony Proxies with non-standard support for passing through
//    non-configurable properties
//  - Harmony WeakMaps
// Patches:
//  - Object.{freeze,seal,preventExtensions}
//  - Object.{isFrozen,isSealed,isExtensible}
//  - Object.{getPropertyDescriptor,getPropertyNames}
//  - Proxy.stopTrapping
//  - Proxy.create{Function}
//  - Proxy.for

// Loading this file will automatically patch Proxy.create and
// Proxy.createFunction such that they support direct proxies
// This is done by automatically wrapping all user-defined proxy handlers
// in a SyncHandler that checks and enforces ES5 invariants.

// A direct proxy is a proxy for an existing object called the target object.

// A SyncHandler is a wrapper for a target proxy handler H.
// The SyncHandler forwards all operations to H, but additionally
// performs a number of integrity checks on the results of some traps,
// to make sure H does not violate the ES5 invariants w.r.t. non-configurable
// properties and non-extensible, sealed or frozen objects.

// For each property that H exposes as own, non-configurable
// (e.g. by returning a descriptor from a call to getOwnPropertyDescriptor)
// the SyncHandler defines those properties on the target object.
// When the proxy becomes non-extensible, also configurable own properties
// are checked against the target.
// We will call properties that are defined on the target object
// "fixed properties".

// We will name fixed non-configurable properties "sealed properties".
// We will name fixed non-configurable non-writable properties "frozen
// properties".

// The SyncHandler upholds the following invariants w.r.t. non-configurability:
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

// The SyncHandler upholds the following invariants regarding extensibility:
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
// (An object with non-mutable ancestry is a non-extensible object whose
// [[Prototype]] is either null or an object with non-mutable ancestry.)

// The SyncHandler is compatible with the existing ForwardingHandler.
// Invariant: when a SyncHandler wraps a ForwardingHandler to an
// ES5-compliant object, the SyncHandler will never throw a TypeError.

// ==== Changes in Handler API compared to current Harmony:Proxies ====

// 1. Proxy.create and Proxy.createFunction have both been replaced by
//    a new primitive:
//      Proxy.for(target, handler)
//    This creates a new proxy that derives from the target object:
//    - its typeof type
//    - all internal properties, including:
//      - [[Class]], used in Object.prototype.toString
//      - [[Prototype]], returned by Object.getPrototypeOf
//    Additionally, any trap not defined on handler results in the operation
//    being applied to the target. Hence, all traps are now optional.
//    target may be a function (this replaces Proxy.createFunction)
//    In that case, calling proxy() triggers a handler trap called 'call',
//    while calling new proxy() triggers a handler trap called 'new'
//
// 2. The old 'fix' trap is renamed to the 'protect' trap, because the term
//    'fix' is now ambiguous: we previously used the term "fixing" to refer
//    to a proxy that was no longer trapping. For direct proxies, this becomes
//    totally independent of "protecting" an object using preventExtensions,
//    seal or freeze.
//
// 3. The protect() trap is parameterized with the name of the operation that
//    caused the trap invocation, either one of the Strings 'freeze', 'seal',
//    or 'preventExtensions'. The idea is that a forwarding handler can
//    now easily forward this operation generically by performing:
//    protect: function(op, target) { Object[op](target); return true; }
//    The 'protect' trap takes as an extra argument the 'target' to protect.
//    Rather than returning undefined or a pdmap, the 'protect' trap simply
//    returns a boolean indicating success.
//
// 4. The protect() (formerly known as fix) trap no longer "fixes" the proxy.
//    A protected proxy can remain fully trapping. There is a new
//    Proxy.stopTrapping(obj) operation that can control this aspect of a proxy
//    separately.
//
// 5. All traps now receive an additional, "optional" argument referring to
//    the 'target' object that they're serving.

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

/**
 * A property 'name' is fixed if it is an own property of the target.
 */
function isFixed(name, target) {
  return ({}).hasOwnProperty.call(target, name);
}

// ---- The SyncHandler wrapper around user handlers ----

/**
 * @param target the object wrapped by this proxy.
 * As long as the proxy is extensible, only non-configurable properties
 * are checked against the target. Once the proxy becomes non-extensible,
 * all own properties are checked against the target, including configurable
 * ones.
 *
 * @param handler the handler of the direct proxy. The object emulated by
 * this handler is kept "in sync" with the target object of the direct proxy.
 * In doing so, any violations that the handler makes against the invariants
 * of the target will cause a TypeError to be thrown.
 *
 * Both target and handler must be proper Objects at initialization time.
 * If this.targetHandler is set to 'null', that indicates that the
 * direct proxy has become "fixed" and the handler is "switched off".
 * At that point, the SyncHandler behaves like the default forwarding handler.
 */
function SyncHandler(target, handler) {
  // this is a const reference, this.target should never change
  this.target = target;
  // this is a non-const reference, may be set to null once
  // once set to null, forever remains null
  this.targetHandler = handler;
}

SyncHandler.prototype = {

  /**
   * If getTrap returns undefined, the caller should perform the
   * default forwarding behavior.
   * If getTrap returns normally otherwise, the return value
   * will be a callable trap function with a proper |this|-binding.
   */
  getTrap: function(trapName) {
    if (this.targetHandler === null) {
      // stopTrapping was called on this handler,
      // perform the default forwarding behavior
      return undefined;
    }
    
    var trap = this.targetHandler[trapName];
    
    // if this.targetHandler[trapName] is a getter, and that getter directly or
    // indirectly calls stopTrapping on this proxy, this proxy may now
    // have been "fixed" (in which case this.targetHandler is now null).
    // Therefore, we must recheck the state of the proxy.
    // If the proxy is now fixed, default to the forwarding behavior.
    
    // TODO: could also opt not to recheck, and have the switched-off proxy
    // trap anyway, which should be harmless as far as target invariants
    // are concerned (although real implementations that perform clever
    // tricks upon stopTrapping should tread carefully)
    
    if (trap === undefined || this.targetHandler === null) {
      // either the trap was not defined or
      // stopTrapping was called on this handler,
      // perform the default forwarding behavior
      return undefined;
    }
    
    if (typeof trap !== "function") {
      throw new TypeError(trapName + " trap is not callable: "+trap);
    }
    
    // bind the trap's |this| to this.targetHandler
    // this ensures that, if for any reason targetHandler is set to
    // null later (ie. the proxy is switched off), we retain the proper binding
    return Function.prototype.bind.call(trap, this.targetHandler);
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
    
    var trap = this.getTrap("getOwnPropertyDescriptor");
    if (trap === undefined) {
      return Proxy.forward.getOwnPropertyDescriptor(name, this.target);
    }
    
    name = String(name);
    var desc = trap(name, this.target);
    desc = normalizeAndCompletePropertyDescriptor(desc);
    
    if (desc === undefined) {
      // if name exists and is non-configurable, delete will throw
      //   (can't report a non-configurable own property as non-existent)
      // if name does not exist, will be a no-op
      // if name is configurable, will delete the property      
      try {
        delete this.target[name];
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
    
    if (!Object.isExtensible(this.target)) {
      // if name exists, should be a no-op as per ES5 8.12.9, step 5
      // if name does not exist, will raise an exception
      // as per ES5 8.12.9, step 3
      try {
        Object.defineProperty(this.target, name, {});
      } catch (e) {
        // rethrowing solely to improve error message
        throw new TypeError("cannot report a new own property '"+
                            name + "' on a non-extensible object");
      }
    }

    if (isFixed(name, this.target) || // if 'name' was previously fixed,
        !desc.configurable) { // or is reported as non-configurable
      // check and remember the returned desc
      // will throw if desc is not compatible with fixedDesc, if it exists
      Object.defineProperty(this.target, name, desc);
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
    var trap = this.getTrap("getPropertyDescriptor");
    if (trap === undefined) {
      // default forwarding behavior
      return Proxy.forward.getPropertyDescriptor(name, this.target);
    }
    
    name = String(name);
    // TODO: consider giving getPropertyDescriptor access to the proxy
    // in addition to the handler. getPropertyDescriptor is called instead of
    // 'get' when a proxy is located in the prototype chain. The handler may
    // want to know via which proxy the property was requested.
    var desc = trap(name, this.target);
    desc = normalizeAndCompletePropertyDescriptor(desc);

    if (desc === undefined) {
      // if name exists and is non-configurable, delete will throw
      //   (can't report a non-configurable own property as non-existent)
      // if name does not exist, will be a no-op
      // if name is configurable, will delete the property      
      try {
        delete this.target[name];        
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
    if (isFixed(name, this.target)) {
      // will throw if desc is not compatible with fixedDesc, if it exists
      Object.defineProperty(this.target, name, desc);
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

    var trap = this.getTrap("defineProperty");
    if (trap === undefined) {
      // default forwarding behavior
      return Proxy.forward.defineProperty(name, desc, this.target);
    }

    name = String(name);
    desc = normalizePropertyDescriptor(desc);
    var success = trap(name, desc, this.target);
    success = !!success; // coerce to Boolean


    if (success === true) {
      
      // Note: we could collapse the following two if-tests into a single
      // test. Separating out the cases to improve error reporting.
      
      if (!Object.isExtensible(this.target)) {
        // if name exists, should be a no-op as per ES5 8.12.9, step 5
        // if name does not exist, will raise an exception
        // as per ES5 8.12.9, step 3
        try {
          Object.defineProperty(this.target, name, {});
        } catch (e) {
          // rethrowing solely to improve error message
          throw new TypeError("cannot successfully add a new property '"+
                              name + "' to a non-extensible object");
        }
      }

      if (isFixed(name, this.target) || !desc.configurable) {
        // will throw if desc is not compatible with fixedDesc, if it exists
        Object.defineProperty(this.target, name, desc);
      }
      
    }
    
    return success;
  },
  
  /**
   * The 'operation' argument is one of 'freeze', 'seal' or 'preventExtensions'
   *
   * Check whether all properties returned by the 'protect' trap are compatible
   * with the already fixed properties.
   *
   * Note: the 'protect' trap is (one half of) the old 'fix' trap.
   */
  protect: function(operation) {
    var trap = this.getTrap("protect");
    if (trap === undefined) {
      // default forwarding behavior
      return Proxy.forward.protect(operation, this.target);
    }

    var success = trap(operation, this.target);
    // the caller of protect, Object[operation], will make
    // this.target non-extensible, sealed or frozen
    return !!success;
  },
  
  /**
   * A new fundamental trap, triggered by Object.stopTrapping(aProxy)
   * The other half of the old fix() trap.
   *
   * Returns a success boolean.
   */
  stopTrapping: function() {
    var trap = this.getTrap("stopTrapping");
    if (trap === undefined) {
      // default forwarding behavior
      return Proxy.forward.stopTrapping(this.target);
    }
    
    var success = trap(this.target);
    // the SyncHandler proxy becomes disabled by the caller of
    // the stopTrapping trap, if it returns true
    return !!success; // coerce to Boolean
  },
  
  /**
   * If name denotes a fixed property, check whether handler rejects.
   */
  'delete': function(name) { 
    "use strict";
    var trap = this.getTrap("delete");
    if (trap === undefined) {
      // default forwarding behavior
      return Proxy.forward.delete(name, this.target);
    }
    
    name = String(name);
    var res = trap(name, this.target);
    res = !!res; // coerce to Boolean
    
    if (res === true) {
      //  if name was not previously fixed, this is a no-op
      //  if name is fixed and configurable, delete it from the target
      //  if name is fixed and non-configurable, delete will throw
      try {
        delete this.target[name];
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
   * at least contain the non-configurable properties from this.target,
   * but this might require an unpleasant amount of bookkeeping.
   */
  getOwnPropertyNames: function() {
    var trap = this.getTrap("getOwnPropertyNames");
    if (trap === undefined) {
      // default forwarding behavior
      return Proxy.forward.getOwnPropertyNames(this.target);
    }
    
    var trapResult = trap(this.target);

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
      if (!Object.isExtensible(this.target) && !isFixed(s, this.target)) {
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
   * at least contain the non-configurable properties from this.target
   * but this might require an unpleasant amount of bookkeeping.
   */
  getPropertyNames: function() {
    var trap = this.getTrap("getPropertyNames");
    if (trap === undefined) {
      // default forwarding behavior
      return Proxy.forward.getPropertyNames(this.target);
    }
    
    var trapResult = trap(this.target);
      
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

    var trap = this.getTrap("hasOwn");
    if (trap === undefined) {
      // default forwarding behavior
      return Proxy.forward.hasOwn(name, this.target);
    }

    name = String(name);
    var res = trap(name, this.target);
    res = !!res; // coerce to Boolean
        
    if (res === false) {
      try {
        // if name exists and is non-configurable, delete will throw
        //   (can't report a non-configurable own property as non-existent)
        // if name does not exist, will be a no-op
        // if name is configurable, will delete the property (this also
        // ensures that on a non-extensible proxy it cannot be added later)         
        delete this.target[name];
      } catch (e) {
        // re-throw solely to improve the error message
        throw new TypeError("cannot report existing non-configurable own "+
                            "property '"+name + "' as a non-existent own "+
                            "property");
      }
    } else {
      // res === true, if the proxy is non-extensible,
      // check that name is no new property
      if (!Object.isExtensible(this.target)) {
        // if name exists, should be a no-op as per ES5 8.12.9, step 5
        // if name does not exist, will raise an exception
        // as per ES5 8.12.9, step 3
        try {
          Object.defineProperty(this.target, name, {});
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
    var trap = this.getTrap("has");
    if (trap === undefined) {
      // default forwarding behavior
      return Proxy.forward.has(name, this.target);
    }
    
    name = String(name);
    var res = trap(name, this.target);
    res = !!res; // coerce to Boolean
    
    if (res === false) {
      try {
        // if name exists and is non-configurable, delete will throw
        //   (can't report a non-configurable own property as non-existent)
        // if name does not exist, will be a no-op
        // if name is configurable, will delete the property          
        delete this.target[name];
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
  get: function(proxy, name) {
    var trap = this.getTrap("get");
    if (trap === undefined) {
      // default forwarding behavior
      return Proxy.forward.get(name, this.target, proxy);
    }

    name = String(name);
    var res = trap(name, this.target, proxy);
    
    var fixedDesc = Object.getOwnPropertyDescriptor(this.target, name);
    // check consistency of the returned value
    if (fixedDesc !== undefined) { // getting an existing property
      if (isDataDescriptor(fixedDesc)) { // own data property
        // if name is a fixed non-configurable, non-writable property,
        // this call will throw unless SameValue(res, this.target[name])
        Object.defineProperty(this.target, name, {value: res}); 
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
  set: function(proxy, name, val) {
    var trap = this.getTrap("set");
    if (trap === undefined) {
      // default forwarding behavior
      return Proxy.forward.set(name, val, this.target, proxy);
    }
        
    name = String(name);
    var res = trap(name, val, this.target, proxy);
    res = !!res; // coerce to Boolean
         
    // if success is reported, check whether property is truly assignable
    if (res === true) {
      var fixedDesc = Object.getOwnPropertyDescriptor(this.target, name);
      if (fixedDesc !== undefined) { // setting an existing property
        if (isDataDescriptor(fixedDesc)) { // own data property
          // if name is a fixed non-configurable, non-writable property,
          // this call will throw unless SameValue(val, this.target[name])
          Object.defineProperty(this.target, name, {value: val});
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
    var trap = this.getTrap("enumerate");
    if (trap === undefined) {
      // default forwarding behavior
      return Proxy.forward.enumerate(this.target);
    }
    
    var trapResult = trap(this.target);

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
    var trap = this.getTrap("keys");
    if (trap === undefined) {
      // default forwarding behavior
      return Proxy.forward.keys(this.target);
    }
    
    var trapResult = trap(this.target);

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
     if (!Object.isExtensible(this.target) && !isFixed(s, this.target)) {
       // non-extensible proxies don't tolerate new own property names
       throw new TypeError("keys trap cannot list a new "+
                           "property '"+s+"' on a non-extensible object");
     }
     
     propNames[s] = true;
     result[i] = s;
    }
    
    return result;
  },
  
  /**
   * New trap that reifies [[Call]].
   * If the target is a function, then a call to
   *   proxy(...args)
   * Triggers this trap
   */
  call: function(thisBinding, args, target, proxy) {
    var trap = this.getTrap("call");
    if (trap === undefined) {
      return Proxy.forward.call(thisBinding, args, target, proxy);
    }
    
    if (typeof this.target === "function") {
      return trap(thisBinding, args, target, proxy);
    } else {
      throw new TypeError("call: "+ target + " is not a function");
    }
  },
  
  /**
   * New trap that reifies [[Construct]].
   * If the target is a function, then a call to
   *   new proxy(...args)
   * Triggers this trap
   */
  new: function(args, target, proxy) {
    var trap = this.getTrap("new");
    if (trap === undefined) {
      return Proxy.forward.new(args, target, proxy);
    }
    
    if (typeof this.target === "function") {
      return trap(args, target, proxy);
    } else {
      throw new TypeError("construct: "+ target + " is not a function");
    }
  }
};

// ---- end of the SyncHandler wrapper handler ----

// In what follows, a 'direct proxy' is a proxy
// whose handler is a SyncHandler. Such proxies can be made non-extensible,
// sealed or frozen without losing the ability to trap.

// maps direct proxies to their SyncHandlers
var directProxies = new WeakMap();

// patch Object.{preventExtensions,seal,freeze} so that
// they recognize fixable proxies and act accordingly
Object.preventExtensions = function(subject) {
  var syncHandler = directProxies.get(subject);
  if (syncHandler !== undefined) {
    if (syncHandler.protect('preventExtensions')) {
      // Note: this sets the target's [[Extensible]] bit to false
      // thereby also making the proxy non-extensible
      Object.preventExtensions(syncHandler.target);
      return subject;
    } else {
      throw new TypeError("preventExtensions on "+subject+" rejected");
    }
  } else {
    return prim_preventExtensions(subject);
  }
};
Object.seal = function(subject) {
  var syncHandler = directProxies.get(subject);
  if (syncHandler !== undefined) {
    if (syncHandler.protect('seal')) {
      // Note: this makes all of the target's fixed properties
      // non-configurable. The handler will now enforce the
      // invariants for non-configurability on all own properties.
      Object.seal(syncHandler.target);      
      return subject;
    } else {
      throw new TypeError("seal on "+subject+" rejected");
    }
  } else {
    return prim_seal(subject);
  }
};
Object.freeze = function(subject) {
  var syncHandler = directProxies.get(subject);
  if (syncHandler !== undefined) {
    if (syncHandler.protect('freeze')) {
      // Note: this makes all of the target's fixed properties
      // non-configurable and non-writable. The handler will now
      // enforce the invariants for non-configurability on all own properties.
      Object.freeze(syncHandler.target);
      return subject; 
    } else {
      throw new TypeError("freeze on "+subject+" rejected");
    }
  } else {
    return prim_freeze(subject);
  }
};
Object.isExtensible = function(subject) {
  var syncHandler = directProxies.get(subject);
  if (syncHandler !== undefined) {
    return Object.isExtensible(syncHandler.target);
  } else {
    return prim_isExtensible(subject);
  }
};
Object.isSealed = function(subject) {
  var syncHandler = directProxies.get(subject);
  if (syncHandler !== undefined) {
    return Object.isSealed(syncHandler.target);
  } else {
    return prim_isSealed(subject);
  }
};
Object.isFrozen = function(subject) {
  var syncHandler = directProxies.get(subject);
  if (syncHandler !== undefined) {
    return Object.isFrozen(syncHandler.target);
  } else {
    return prim_isFrozen(subject);
  }
};

if (!Object.getPropertyDescriptor) {
  Object.getPropertyDescriptor = function(subject, name) {
    var syncHandler = directProxies.get(subject);
    if (syncHandler !== undefined) {
      return syncHandler.getPropertyDescriptor(name);
    } else {
      // fallback behavior for regular objects
      var desc = Object.getOwnPropertyDescriptor(subject, name);
      if (desc !== undefined) {
        return desc;
      } else {
        var parent = Object.getPrototypeOf(subject);
        if (parent !== null) {
          return Object.getPropertyDescriptor(parent, name);
        } else {
          return undefined;
        }
      }
    }
  }
}
if (!Object.getPropertyNames) {
  Object.getPropertyNames = function(subject) {
    var syncHandler = directProxies.get(subject);
    if (syncHandler !== undefined) {
      return syncHandler.getPropertyNames(name);
    } else {
      // fallback behavior for regular objects
      var props = Object.getOwnPropertyNames(subject);
      var parent = Object.getPrototypeOf(subject);
      if (parent === null) {
        return props;
      } else {
        // TODO(tvcutsem): remove duplicates from props
        return props.concat(Object.getPropertyNames(parent));
      }
    }
  }
}

/**
 * Proxy.stopTrapping(obj)
 *  - expects an Object, and always returns obj
 *  - if obj is a non-proxy object, this is a no-op
 *  - if obj is a proxy, calls the proxy's new "stopTrapping" trap.
 *
 *    The 'stopTrapping' trap either returns undefined | pdmap.
 *    If the trap returns a pdmap, the proxy henceforth 'becomes'
 *    an object that contains the props in the pdmap.
 *
 *    If the trap returns undefined, Proxy.stopTrapping is a no-op.
 *    (rationale for the no-op behavior: we don't want clients to be
 *     able to figure out whether an object is a proxy by calling
 *     Object.stopTrapping).
 */
Proxy.stopTrapping = function(subject) {
  var syncHandler = directProxies.get(subject);
  if (syncHandler !== undefined) {
    // switch off the SyncHandler, making all traps perform the default
    // behavior instead. This is done by setting the SyncHandler's
    // "targetHandler" property to null.
    if (syncHandler.targetHandler !== null) {
      // call the 'stopTrapping' trap
      var success = syncHandler.stopTrapping();
      if (success) {
        // if that trap returns successfully, the proxy now 'becomes'
        // a simple forwarding proxy to the target object
        syncHandler.targetHandler = null;
      }
      // else, if stopTrapping rejects, fail silently
    }
  } // else, if subject is not a proxy, do nothing
  return subject;
};

// ---- Default Forwarding Handler ----
Proxy.forward = {
  getOwnPropertyDescriptor: function(name, target) {
    return Object.getOwnPropertyDescriptor(target, name);
  },
  getPropertyDescriptor: function(name, target) {
    return Object.getPropertyDescriptor(target, name);
  },
  getOwnPropertyNames: function(target) {
    return Object.getOwnPropertyNames(target);
  },
  getPropertyNames: function(target) {
    return Object.getPropertyNames(target);
  },
  defineProperty: function(name, desc, target) {
    Object.defineProperty(target, name, desc);
    return true;
  },
  delete: function(name, target) {
    return delete target[name];
  },
  protect: function(operation, target) {
    Object[operation](target);
    return true;
  },
  has: function(name, target) {
    return name in target;
  },
  hasOwn: function(name, target) {
    return ({}).hasOwnProperty.call(target, name);
  },
  get: function(name, target, proxy) {
    // Note: if target[name] is an accessor,
    // will invoke that accessor with this === target,
    // not this === proxy
    return target[name];
  },
  set: function(name, value, target, proxy) {
    // FIXME: to reliably forward set, would need to reproduce
    // the built-in [[CanPut]] algorithm. The downside of that
    // is that if target is itself a proxy, it will trigger
    // numerous traps. Better would be to have an
    // Object.setProperty(target, name, val) function.
    target[name] = val;
    // bad behavior when set fails in non-strict mode
    return true;
  },
  enumerate: function(target) {
    var result = [];
    for (var name in target) { result.push(name); };
    return result;
  },
  keys: function(target) {
    return Object.keys(target);
  },
  call: function(receiver, args, target, proxy) {
    // target.apply(receiver, args)
    return Function.prototype.apply.call(target, receiver, args)
  },
  new: function(args, target, proxy) {
    // return new target(...args);
    // FIXME: can't generically forward [[Construct]]
    // if target is itself a proxy, will not trigger its 'new' trap
    var receiver = Object.create(target.prototype);
    var result = Function.prototype.apply.call(target, receiver, args);
    return Object(result) === result ? result : receiver;
  },
  stopTrapping: function(target) {
    return false;
  }
};

if (typeof Proxy === "object") {
  var primCreate = Proxy.create,
      primCreateFunction = Proxy.createFunction;

  Proxy.for = function(target, handler) {
    // check that target is an Object
    if (Object(target) !== target) {
      throw new TypeError("Proxy target must be an Object, given "+target);
    }
    // check that handler is an Object
    if (Object(handler) !== handler) {
      throw new TypeError("Proxy handler must be an Object, given "+handler);
    }
    
    var syncHandler = new SyncHandler(target, handler);
    var proxy;
    if (typeof target === "function") {
      proxy = primCreateFunction(syncHandler, target,
        // call trap
        function() {
          var args = Array.prototype.slice.call(arguments);
          return syncHandler.call(this, args, target, proxy);
        },
        // construct trap
        function() {
          var args = Array.prototype.slice.call(arguments);
          return syncHandler.new(args, target, proxy);
        });
    } else {
      proxy = primCreate(syncHandler, Object.getPrototypeOf(target));
    }
    directProxies.set(proxy, syncHandler);
    return proxy;
  }

  // Proxy.create{Function} can now be expressed in terms of Proxy.for
  Proxy.create = function(handler, proto) {
    return Proxy.for(Object.create(proto), handler);
  };
  Proxy.createFunction = function(handler, call, opt_construct) {
    var extHandler = Object.create(handler);
    extHandler.call = call;
    extHandler.new = opt_construct;
    return Proxy.for(call, extHandler);
  };
} 

})(); // function-as-module pattern