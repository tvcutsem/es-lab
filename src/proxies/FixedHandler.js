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
// properties.

// For each own or inherited non-configurable property that H exposes
// (e.g. by returning a descriptor from a call to getOwnPropertyDescriptor)
// the FixedHandler keeps a record of that property's attributes
// (it does so by defining these properties on a non-proxy "fixedProps"
//  object)

// We will name such previously exposed, non-configurable properties
// "fixed properties"

// The FixedHandler upholds the following invariants:
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

// The FixedHandler is compatible with the existing ForwardingHandler.
// When a FixedHandler wraps a ForwardingHandler to an ES5-compliant object,
// the FixedHandler will never throw a TypeError.
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
}

FixedHandler.prototype = {
  
  // === fundamental traps ===
  
  // if name denotes a fixed own property, check for incompatible changes
  getOwnPropertyDescriptor: function(name) {
    var desc = this.targetHandler.getOwnPropertyDescriptor(name);
    var fixedDesc = Object.getOwnPropertyDescriptor(this.fixedProps, name);
    if (desc === undefined) {
      if (fixedDesc === undefined) {
        return undefined;
      } else {
        throw new TypeError("cannot report non-configurable property "+name+
                            " as non-existent");
      }
    }
    if (fixedDesc !== undefined || !desc.configurable) {
      // will throw if desc is not compatible with fixedDesc, if it exists
      Object.defineProperty(this.fixedProps, name, desc);
    }
    return desc;
  },
  
  // if name denotes a fixed own or inherited property, check for incompatible changes
  getPropertyDescriptor: function(name) {
    var desc = this.targetHandler.getPropertyDescriptor(name);
    var fixedDesc = Object.getOwnPropertyDescriptor(this.fixedProps, name);
    if (desc === undefined) {
      if (fixedDesc === undefined) {
        return undefined;
      } else {
        throw new TypeError("Cannot report non-configurable property "+name+
                            "as non-existent");
      }
    }
    if (fixedDesc !== undefined || !desc.configurable) {
      // will throw if desc is not compatible with the fixed property, if it exists
      Object.defineProperty(this.fixedProps, name, desc);
    }
    return desc;
  },
  
  defineProperty: function(name, desc) {
    var success = this.targetHandler.defineProperty(name, desc);
    var fixedDesc = Object.getOwnPropertyDescriptor(this.fixedProps, name);

    if (fixedDesc !== undefined || !desc.configurable) {
      // will throw if desc is not compatible with fixedDesc, if it exists
      Object.defineProperty(this.fixedProps, name, desc);
      if (success !== true) {
        // TODO(tvcutsem): not sure whether this check is actually necessary
        throw new TypeError("Cannot reject a valid change to non-configurable property "+
                            name);
      }
    }
    return success;
  },
  
  // merges properties returned by fix() with the fixed properties
  fix: function() {
    var props = this.targetHandler.fix();
    if (props === undefined) { return undefined; }
    
    // will throw if any of the props returned already exist in
    // fixedProps and are incompatible with existing attributes
    Object.defineProperties(this.fixedProps, props);

    // now turn this.fixedProps into a property descriptor map
    var fixed = Object.create(null);
    Object.getOwnPropertyNames(this.fixedProps).forEach(function (name) {
      fixed[name] = Object.getOwnPropertyDescriptor(this.fixedProps, name);
    }).bind(this);

    return fixed;
  },
  
  // if name denotes a fixed property, check whether handler rejects
  'delete': function(name) { 
    var res = this.targetHandler['delete'](name);
    res = !!res; // coerce to Boolean
    if (name in this.fixedProps && res !== false) {
      throw new TypeError(
        "property "+name+" is non-configurable and can't be deleted");
    }
    return res;
  },
  
  // unmodified
  getOwnPropertyNames: function() {
    return this.targetHandler.getOwnPropertyNames();
  },
  
  // unmodified
  getPropertyNames: function() {
    return this.targetHandler.getPropertyNames();
  },
  
  // === derived traps ===
  
  // if name denotes a fixed property, check whether answer is true
  hasOwn: function(name) {
    // simulate missing derived trap fall-back behavior
    var res = this.targetHandler.hasOwn ?
                this.targetHandler.hasOwn(name) :
                TrapDefaults.hasOwn.call(this.targetHandler, name);
    res = !!res; // coerce to Boolean
    if (name in this.fixedProps && res !== true) {
      throw new TypeError("Cannot report existing non-configurable property "+
                          name + " as a non-existent own property");
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
    if (name in this.fixedProps && res !== true) {
      throw new TypeError("Cannot report existing non-configurable property "+
                          name + " as a non-existent property");
    }
    return res;
  },
  
  // if name denotes a fixed non-configurable, non-writable data property,
  // check its return value against the previously asserted value of the fixed property
  get: function(rcvr, name) {
    // simulate missing derived trap fall-back behavior
    var res = this.targetHandler.get ?
                this.targetHandler.get(rcvr, name) :
                TrapDefaults.get.call(this.targetHandler, rcvr, name);
    
    var desc = Object.getOwnPropertyDescriptor(this.fixedProps, name);
    var expectedRes;
    if (desc !== undefined) {
      if ('value' in desc && !desc.writable) {
        if (!Object.is(desc.value, res)) {
          throw new TypeError("Inconsistent value reported for non-configurable property "
                              +name+", expected: "+desc.value + " but got: "+res);
        }
      }
    }
    return res;
  },
  
  // if name denotes a fixed, non-configurable, non-writable data property,
  // check that 'set' reports the assignment as unsuccessful
  set: function(rcvr, name, val) {
    // simulate missing derived trap fall-back behavior
    var res = this.targetHandler.set ?
                this.targetHandler.set(rcvr, name, val) :
                TrapDefaults.set.call(this.targetHandler, rcvr, name, val);
    res = !!res; // coerce to Boolean         
    var desc = Object.getOwnPropertyDescriptor(this.fixedProps, name);
    if (desc !== undefined) {
      if ('writable' in desc) {
        if (!desc.writable && res !== false) {
            throw new TypeError("Cannot report successful assignment for " +
                                "non-configurable, non-writable data property " + name);
        }
      }
    }
    
    return res;
  },
  
  // unmodified
  enumerate: function() {
    // simulate missing derived trap fall-back behavior
    return this.targetHandler.enumerate ?
             this.targetHandler.enumerate() :
             TrapDefaults.enumerate.call(this.targetHandler);
  },
  
  // unmodified
  keys: function() {
    // simulate missing derived trap fall-back behavior
    return this.targetHandler.keys ?
             this.targetHandler.keys() :
             TrapDefaults.keys.call(this.targetHandler);
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
      return primCreate(new FixedHandler(handler), proto);
    };
    Proxy.createFunction = function(handler, call, construct) {
      return primCreateFunction(new FixedHandler(handler), call, construct);
    };
  } 
};