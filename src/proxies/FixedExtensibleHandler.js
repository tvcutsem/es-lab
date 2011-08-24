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

"use strict";

// ----------------------------------------------------------------------------
// this is a prototype implementation of
// http://wiki.ecmascript.org/doku.php?id=strawman:fixed_properties

// A FixedHandler can be used to wrap an existing proxy handler H.
// The FixedHandler forwards all operations to H, but additionally
// performs a number of integrity checks on the results of some traps,
// to make sure H does not violate the ES5 invariants w.r.t. non-configurable
// properties and non-extensible, sealed or frozen objects.

// For each own or inherited non-configurable property that H exposes
// (e.g. by returning a descriptor from a call to getOwnPropertyDescriptor)
// the FixedHandler keeps a record of that property's attributes
// (it does so by defining these properties on a non-proxy "fixedProps"
//  object)

// We will name such previously exposed, non-configurable properties
// "fixed properties"

// The FixedHandler upholds the following invariants w.r.t. non-configurability:
// - getOwnPropertyDescriptor cannot report fixed properties as non-existent
// - getOwnPropertyDescriptor cannot report incompatible changes to the
//   attributes of a fixed property (e.g. reporting a non-configurable
//   property as configurable, or reporting a non-configurable, non-writable
//   property as writable)
// - getPropertyDescriptor: same constraints as for getOwnPropertyDescriptor
// - defineProperty cannot make incompatible changes to the attributes of
//   fixed properties
// - defineProperty cannot reject compatible changes made to the attributes of
//   fixed properties
// - properties returned by the fix() trap are merged with fixed properties,
//   ensuring no incompatible changes can be made when calling freeze, seal,
//   preventExtensions
// - delete cannot report a successful deletion of a fixed property
// - hasOwn cannot report a fixed property as non-existent
// - has cannot report a fixed property as non-existent
// - get cannot report inconsistent values for non-writable fixed data
//   properties
// - set cannot report a successful assignment for non-writable fixed data
//   properties

// Violation of any of these invariants by H will result in TypeError being
// thrown.

// Additionally, once Object.preventExtensions, Object.seal or Object.freeze
// is invoked on the proxy, the handler is queried for all of its own
// properties. Any property name that is not reported is henceforth
// treated as a 'new' property.

// The FixedHandler upholds the following invariants regarding extensibility:
// - getOwnPropertyDescriptor cannot report new properties as existent
//   (it must report them as non-existent by returning undefined)
// - defineProperty cannot successfully add a new property (it must reject)
// - getOwnPropertyNames cannot list new properties
// - hasOwn cannot report true for new properties (it must report false)
// - keys cannot list new properties

// The FixedHandler is compatible with the existing ForwardingHandler.
// When a FixedHandler wraps a ForwardingHandler to an ES5-compliant object,
// the FixedHandler will never throw a TypeError.

// This FixedHandler hints at possible new designs for fixing proxies:
// A) The fix() trap could be replaced by dedicated
//    freeze, seal, preventExtensions traps. This allows the ForwardingHandler
//    to forward all operations to its target. Alternatively,
//    fix() could be parameterized with the names of the operations,
//    enabling generic forwarding of the operation.
// B) The fix() trap does not necessarily need to return either
//    a property descriptor map | undefined
//    We could query a handler for its alleged own props via
//    getOwnPropertyDescriptor + getOwnPropertyNames
//    The fix() trap (or the 3 dedicated traps) could still
//    return false or throw an exception to avoid fixing.
//    This would simplify the API for developers.

// ----------------------------------------------------------------------------

// From http://wiki.ecmascript.org/doku.php?id=harmony:egal
if (!Object.is) {
  Object.defineProperty(Object, 'is', {
    value: function(x, y) {
      if (x === y) {
        // 0 === -0, but they are not identical
        return x !== 0 || 1 / x === 1 / y;
      }

      // NaN !== NaN, but they are identical.
      // NaNs are the only non-reflexive value, i.e., if x !== x,
      // then x is a NaN.
      // isNaN is broken: it converts its argument to number, so
      // isNaN("foo") => true
      return x !== x && y !== y;
    },
    configurable: true,
    enumerable: false,
    writable: true
  }); 
}

function FixedHandler(targetHandler) {
  this.targetHandler = targetHandler;
  this.fixedProps = Object.create(null);
  // could also use Object.isExtensible(this.fixedProps) instead
  this.isExtensible = true;
}

FixedHandler.prototype = {
  
  // === fundamental traps ===
  
  // if name denotes a fixed own property, check for incompatible changes
  getOwnPropertyDescriptor: function(name) {
    var desc = this.targetHandler.getOwnPropertyDescriptor(name);
    var fixedDesc = Object.getOwnPropertyDescriptor(this.fixedProps, name);
    
    // TODO(tvcutsem): desc = NormalizeAndCompletePropertyDescriptor(desc)
    
    if (desc === undefined) {
      // targetHandler says it doesn't have a 'name' property
      // verify that claim
      if (fixedDesc === undefined) {
        // ok, 'name' is not one of the fixed properties
        return undefined;
      } else {
        // 'name' was fixed
        // if it's a non-configurable property, it cannot be reported as
        // non-existent
        if (!fixedDesc.configurable) {
          throw new TypeError("cannot report non-configurable property "+name+
                              " as non-existent"); 
        } else {
          // 'name' is configurable and appears to have been deleted
          // from the targetHandler
          delete this.fixedProps[name];
          return undefined;
        }
      }
    }
    
    // at this point, we know (desc !== undefined), i.e.
    // targetHandler reports 'name' as an existing property
    
    if (!this.isExtensible && fixedDesc === undefined) {
      // if the proxy is non-extensible and
      // has no previous record of a 'name' property
      throw new TypeError("cannot report a new property "+name+
                          " on a non-extensible proxy");
    }
    
    // if targetHandler reports 'name' as a non-configurable property
    // or 'name' was previously fixed, check and remember the returned desc
    if (fixedDesc !== undefined || !desc.configurable) {
      // will throw if desc is not compatible with fixedDesc, if it exists
      Object.defineProperty(this.fixedProps, name, desc);
    }
    
    return desc;
  },
  
  // if name denotes a fixed own or inherited property,
  // check for incompatible changes
  getPropertyDescriptor: function(name) {
    var desc = this.targetHandler.getPropertyDescriptor(name);
    var fixedDesc = Object.getOwnPropertyDescriptor(this.fixedProps, name);
    
    // TODO(tvcutsem): desc = NormalizeAndCompletePropertyDescriptor(desc);
    
    if (desc === undefined) {
      // targetHandler says it doesn't have a 'name' property
      // verify that claim
      if (fixedDesc === undefined) {
        // ok, 'name' is not one of the fixed properties
        return undefined;
      } else {
        // 'name' was fixed
        // if it's a non-configurable property, it cannot be reported as
        // non-existent
        if (!fixedDesc.configurable) {
          throw new TypeError("cannot report non-configurable property "+name+
                              " as non-existent"); 
        } else {
          // 'name' is configurable and appears to have been deleted
          // from the targetHandler
          delete this.fixedProps[name];
          return undefined;
        }
      }
    }
    
    // at this point, we know (desc !== undefined), i.e.
    // targetHandler reports 'name' as an existing property
    
    // even if proxy is non-extensible and does not define 'name',
    // [[GetProperty]] may return a descriptor ('name' may have been
    // defined on a non-extensible [[Prototype]])
    
    // if targetHandler reports 'name' as a non-configurable property
    // or 'name' was previously fixed, check and remember the returned desc
    if (fixedDesc !== undefined || !desc.configurable) {
      // will throw if desc is not compatible with fixedDesc, if it exists
      Object.defineProperty(this.fixedProps, name, desc);
    }
    
    return desc;
  },
  
  defineProperty: function(name, desc) {
    var fixedDesc = Object.getOwnPropertyDescriptor(this.fixedProps, name);
    // TODO(tvcutsem): desc = NormalizePropertyDescriptor(desc);
    var success = this.targetHandler.defineProperty(name, desc);
    success = !!success; // coerce to Boolean
    
    if (fixedDesc === undefined && // trying to define a new property,
        !this.isExtensible &&      // on a non-extensible proxy,
        success !== false) {       // which is not reported as a failure
      throw new TypeError("Cannot successfully add a new property "+name+
                          " to a non-extensible object");
    }

    if (fixedDesc !== undefined || !desc.configurable) {
      // will throw if desc is not compatible with fixedDesc, if it exists
      Object.defineProperty(this.fixedProps, name, desc);
      if (success !== true) {
        // TODO(tvcutsem): not sure whether this check is actually necessary
        throw new TypeError("Cannot reject a valid change to non-configurable"+
                            " property "+name);
      }
    }
    return success;
  },
  
  // merges properties returned by fix() with the already fixed properties
  fix: function(operation) {

    // TODO(tvcutsem): as an alternative to introducing a fix() trap,
    // the proxy implementation could also simply query the handler for
    // all of its alleged own properties via the getOwnPropertyNames and 
    // getOwnPropertyDescriptor traps.
    
    // The fix() trap would still be called to give the targetHandler
    // a chance to forward the operation, and to reject the operation,
    // e.g. by returning a special value or throwing an exception itself
    
    // query targetHandler for all properties it wants to see fixed
    //var handler = this;
    //var props = Object.create(null);
    //this.targetHandler.getOwnPropertyNames().forEach(function (name) {
    //  props[name] = handler.targetHandler.getOwnPropertyDescriptor(name);
    //});
    
    // the fix() trap should only be called on an extensible proxy
    // fixing a non-extensible proxy should have no effect 
    if (this.isExtensible) {
      
      // guard against recursive fixing
      if (this.fixing) {
        throw new TypeError("Cannot recursively call the fix() trap "+
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
      
      // set the proxy to non-extensible
      this.isExtensible = false;
    }
  },
  
  // if name denotes a fixed property, check whether handler rejects
  'delete': function(name) { 
    var res = this.targetHandler['delete'](name);
    res = !!res; // coerce to Boolean
    var desc = Object.getOwnPropertyDescriptor(this.fixedProps, name);
    
    if (desc !== undefined && // trying to delete a fixed,
        !desc.configurable && // non-configurable property,
        res !== false) {      // which is not reported as a failure
      throw new TypeError("property "+name+" is non-configurable "+
                          "and cannot be deleted");
    }
    
    return res;
  },
  
  getOwnPropertyNames: function() {
    // TODO(tvcutsem): strictly speaking, the returned result should
    // at least contain the non-configurable properties from this.fixedProps
    
    var trapResult = this.targetHandler.getOwnPropertyNames();
    
    // do not return trapResult directly, instead:
    //  - create and return a fresh Array,
    //  - of which each element is coerced to String,
    //  - which does not contain duplicates,
    //  - and, for non-extensible proxies, which does not
    //    contain any new properties
    
    // propNames is used as a set of strings
    var propNames = Object.create(null);
    var numProps = trapResult.length;
    var result = new Array(numProps);
    for (var i = 0; i < numProps; i++) {
      var s = String(trapResult[i]);
      if (propNames[s]) {
        throw new TypeError("getOwnPropertyNames cannot list a "+
                            "duplicate property "+name);
      }
      if (!this.isExtensible && this.fixedProps[s] === undefined) {
        // non-extensible proxies don't tolerate new own property names
        throw new TypeError("getOwnPropertyNames cannot list a new "+
                            "property "+name+" on a non-extensible object");
      }
      
      propNames[s] = true;
      result[i] = s;
    }
    
    return result;
  },
  
  getPropertyNames: function() {
    // TODO(tvcutsem): strictly speaking, the returned result should
    // at least contain the non-configurable properties from this.fixedProps
    
    var trapResult = this.targetHandler.getPropertyNames();
    
    // do not return trapResult directly, instead:
    //  - create and return a fresh Array,
    //  - of which each element is coerced to String,
    //  - which does not contain duplicates
    
    // propNames is used as a set of strings
    var propNames = Object.create(null);
    var numProps = trapResult.length;
    var result = new Array(numProps);
    for (var i = 0; i < numProps; i++) {
      var s = String(trapResult[i]);
      if (propNames[s]) {
        throw new TypeError("getPropertyNames cannot list a "+
                            "duplicate property "+name);
      }
      propNames[s] = true;
      result[i] = s;
    }
    return result;
  },
  
  // === derived traps ===
  
  // if name denotes a fixed property, check whether answer is true
  hasOwn: function(name) {
    // simulate missing derived trap fall-back behavior
    var res = this.targetHandler.hasOwn ?
                this.targetHandler.hasOwn(name) :
                TrapDefaults.hasOwn.call(this.targetHandler, name);
    res = !!res; // coerce to Boolean
    
    var desc = Object.getOwnPropertyDescriptor(this.fixedProps, name);
    
    if (desc !== undefined && // name is an existing,
        !desc.configurable && // non-configurable property,
        res !== true) {       // which is not reported as existent
      throw new TypeError("Cannot report existing non-configurable property "+
                          name + " as a non-existent own property");
    }
    
    if (desc === undefined && // name is a new property,
        !this.isExtensible && // on a non-extensible proxy, 
        res !== false) {      // which is not reported as non-existent
      throw new TypeError("Cannot report a new own property "+
                          name + " on a non-extensible object");          
    }
    
    return res;
  },
  
  // if name denotes a fixed property, check whether answer is true
  has: function(name) {
    // simulate missing derived trap fall-back behavior
    var res = this.targetHandler.has ?
                this.targetHandler.has(name) :
                TrapDefaults.has.call(this.targetHandler, name);
    res = !!res; // coerce to Boolean
    
    var desc = Object.getOwnPropertyDescriptor(this.fixedProps, name);
    if (desc !== undefined && // name is an existing,
        !desc.configurable && // non-configurable property,
        res !== true) {       // which is not reported as existent
      throw new TypeError("Cannot report existing non-configurable property "+
                          name + " as a non-existent property");
    }
    return res;
  },
  
  // if name denotes a fixed non-configurable, non-writable data property,
  // check its return value against the previously asserted value of the
  // fixed property
  get: function(rcvr, name) {
    // simulate missing derived trap fall-back behavior
    var res = this.targetHandler.get ?
                this.targetHandler.get(rcvr, name) :
                TrapDefaults.get.call(this.targetHandler, rcvr, name);
    
    var desc = Object.getOwnPropertyDescriptor(this.fixedProps, name);
    var expectedRes;
    if (desc !== undefined &&          // getting an existing,
        !desc.configurable &&          // non-configurable,
        desc.writable === false &&     // non-writable data property,
        !Object.is(desc.value, res)) { // yet whose value has changed
      throw new TypeError("Inconsistent value reported for "+
                          "non-configurable property "+name+
                          ", expected: "+desc.value + " but got: "+res);
    }
    return res;
  },
  
  // if name denotes a fixed, non-configurable, non-writable data property,
  // check that 'set' reports the assignment as failed
  set: function(rcvr, name, val) {
    // simulate missing derived trap fall-back behavior
    var res = this.targetHandler.set ?
                this.targetHandler.set(rcvr, name, val) :
                TrapDefaults.set.call(this.targetHandler, rcvr, name, val);
    res = !!res; // coerce to Boolean         
    var desc = Object.getOwnPropertyDescriptor(this.fixedProps, name);
    if (desc !== undefined &&      // setting an existing,
        !desc.configurable &&      // non-configurable,
        desc.writable === false && // non-writable data property,
        res !== false) {           // which is not reported as a failure
          throw new TypeError("Cannot report successful assignment for " +
                              "non-configurable, non-writable data property "+
                              name);
        }
      }
    }
    
    return res;
  },
  
  enumerate: function() {
    // simulate missing derived trap fall-back behavior
    var trapResult = this.targetHandler.enumerate ?
                       this.targetHandler.enumerate() :
                       TrapDefaults.enumerate.call(this.targetHandler);
             
    // do not return trapResult directly, instead:
    //  - create and return a fresh Array,
    //  - of which each element is coerced to String,
    //  - which does not contain duplicates

    // propNames is used as a set of strings
    var propNames = Object.create(null);
    var numProps = trapResult.length;
    var result = new Array(numProps);
    for (var i = 0; i < numProps; i++) {
      var s = String(trapResult[i]);
      if (propNames[s]) {
        throw new TypeError("enumerate trap cannot list a "+
                            "duplicate property "+name);
      }

      propNames[s] = true;
      result[i] = s;
    }

    return result;
  },
  
  keys: function() {
    // simulate missing derived trap fall-back behavior
    var trapResult = this.targetHandler.keys ?
                       this.targetHandler.keys() :
                       TrapDefaults.keys.call(this.targetHandler);
    
    // do not return trapResult directly, instead:
    //  - create and return a fresh Array,
    //  - of which each element is coerced to String,
    //  - which does not contain duplicates
    //  - and, for non-extensible proxies, which does not
    //    contain any new properties

    // propNames is used as a set of strings
    var propNames = Object.create(null);
    var numProps = trapResult.length;
    var result = new Array(numProps);
    for (var i = 0; i < numProps; i++) {
     var s = String(trapResult[i]);
     if (propNames[s]) {
       throw new TypeError("keys trap cannot list a "+
                           "duplicate property "+name);
     }
     
     if (!this.isExtensible && this.fixedProps[s] === undefined) {
       // non-extensible proxies don't tolerate new own property names
       throw new TypeError("keys trap cannot list a new "+
                           "property "+name+" on a non-extensible object");
     }
     
     propNames[s] = true;
     result[i] = s;
    }
    
    return result;
  }
};

// maps proxies to their FixedHandlers
var fixableProxies = new WeakMap();

// store a reference to the real ES5 primitives before patching them
var prim_preventExtensions = Object.preventExtensions,
    prim_seal = Object.seal,
    prim_freeze = Object.freeze;

// patch Object.{preventExtensions,seal,freeze} so that
// they recognize fixable proxies and act accordingly
Object.preventExtensions = function(target) {
  var fixedHandler = fixableProxies.get(target);
  if (fixedHandler !== undefined) {
    fixedHandler.fix('preventExtensions');
    // Note: making this.fixedProps non-extensible is not strictly necessary,
    // since we model extensibility separately via this.isExtensible. Still,
    // if this implementation erroneously adds new fixed properties, making
    // this.fixedProps non-extensible will expose such bugs
    Object.preventExtensions(fixedHandler.fixedProps);
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
    Object.seal(fixedHandler.fixedProps);
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
    Object.freeze(fixedHandler.fixedProps);
    return target;
  } else {
    return prim_freeze(target);
  }
};

// Trap defaults, from http://wiki.ecmascript.org/doku.php?id=harmony:proxies
// call with |this| bound to the required handler
var TrapDefaults = {
  has: function(name) { return !!this.getPropertyDescriptor(name); },
  hasOwn: function(name) { return !!this.getOwnPropertyDescriptor(name); },
  get: function(receiver, name) {
    var desc = this.getPropertyDescriptor(name);
    if (desc === undefined) { return undefined; }
    if ('value' in desc) {
      return desc.value;
    } else {
      if (desc.get === undefined) { return undefined; }
      return desc.get.call(receiver);
    }
  },
  set: function(receiver, name, val) {
    var desc = this.getOwnPropertyDescriptor(name);
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
          desc.set.call(receiver, val);
          return true;
        } else {
          return false;
        }
      }
    }
    desc = this.getPropertyDescriptor(name);
    if (desc) {
      if ('writable' in desc) {
        if (desc.writable) {
          // fall through
        } else {
          return false;
        }
      } else { // accessor
        if (desc.set) {
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
    return this.getPropertyNames().filter(
      function (name) { return this.getPropertyDescriptor(name).enumerable }.bind(this));
  },
  keys: function() {
    return this.getOwnPropertyNames().filter(
      function (name) { return this.getOwnPropertyDescriptor(name).enumerable }.bind(this));
  }
  
}; // end TrapDefaults

FixedHandler.installAsDefault = function() {
  if (typeof Proxy === "object") {
    var primCreate = Proxy.create,
        primCreateFunction = Proxy.createFunction;

    Proxy.create = function(handler, proto) {
      var fixedHandler = new FixedHandler(handler);
      var proxy = primCreate(fixedHandler, proto);
      fixableProxies.set(proxy, fixedHandler);
      return proxy;
    };
    Proxy.createFunction = function(handler, call, construct) {
      var fixedHandler = new FixedHandler(handler);
      var proxy = primCreateFunction(fixedHandler, call, construct);
      fixableProxies.set(proxy, fixedHandler);
      return proxy;
    };
  } 
};