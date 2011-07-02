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


// this is a prototype implementation of
// http://wiki.ecmascript.org/doku.php?id=strawman:fixed_properties

function FixedHandler(targetHandler) {
  this.targetHandler = targetHandler;
  this.fixedProps = Object.create(null);
}

FixedHandler.prototype = {
  
  // === fundamental traps ===
  
  // if name denotes a fixed property, return the fixed descriptor
  getOwnPropertyDescriptor: function(name) {
    var desc = this.targetHandler.getOwnPropertyDescriptor(name);
    var fixedDesc = Object.getOwnPropertyDescriptor(this.fixedProps, name);
    if (desc === undefined) {
      if (fixedDesc === undefined) {
        return undefined;
      } else {
        throw new TypeError("cannot report non-configurable property as non-existent: "+name);
      }
    }
    if (fixedDesc !== undefined || desc.configurable === false) {
      // will throw if desc is not compatible with fixedDesc, if it exists
      Object.defineProperty(this.fixedProps, name, desc);
    }
    return desc;
  },
  
  // if name denotes a fixed property, return the fixed descriptor
  // TODO(tvcutsem): getPropertyDescriptor is broken for fixed properties,
  // as it will fix inherited non-configurable properties in the proxy
  getPropertyDescriptor: function(name) {
    var desc = this.targetHandler.getPropertyDescriptor(name);
    var fixedDesc = Object.getOwnPropertyDescriptor(this.fixedProps, name);
    if (desc === undefined) {
      if (fixedDesc === undefined) {
        return undefined;
      } else {
        throw new TypeError("cannot report non-configurable property as non-existent: "+name);
      }
    }
    if (fixedDesc !== undefined || desc.configurable === false) {
      // will throw if desc is not compatible with fixedDesc, if it exists
      Object.defineProperty(this.fixedProps, name, desc);
    }
    return desc;
  },
  
  defineProperty: function(name, desc) {
    var newDesc = this.targetHandler.defineProperty(name, desc);
    var fixedDesc = Object.getOwnPropertyDescriptor(this.fixedProps, name);

    if (fixedDesc !== undefined || newDesc.configurable === false) {
      // will throw if newDesc is not compatible with fixedDesc, if it exists
      Object.defineProperty(this.fixedProps, name, newDesc);
    }
    return newDesc;
  },
  
  // merges properties returned by fix() with the fixed properties
  fix: function() {
    var props = this.targetHandler.fix();
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
  
  // if name denotes a fixed property, rejects
  'delete': function(name) { 
    if (name in this.fixedProps) {
      throw new TypeError(
        "property "+name+" is non-configurable and can't be deleted");
    }
    return this.targetHandler['delete'](name);
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
  
  // if name denotes a fixed property, returns true
  hasOwn: function(name) {
    if (name in this.fixedProps) {
      return true;
    }
    // simulate missing derived trap fall-back behavior
    return this.targetHandler.hasOwn ?
             this.targetHandler.hasOwn(name) :
             TrapDefaults.hasOwn.call(this.targetHandler, name);
  },
  
  // if name denotes a fixed property, returns true
  has: function(name) {
    if (name in this.fixedProps) {
      return true;
    }
    // simulate missing derived trap fall-back behavior
    return this.targetHandler.has ?
             this.targetHandler.has(name) :
             TrapDefaults.has.call(this.targetHandler, name);
  },
  
  // if name denotes a fixed property, access it directly
  // as per the default 'get' trap behavior
  // Note: this.fixedProps is not leaked as the |this| value of accessors
  get: function(rcvr, name) {
    var desc = Object.getOwnPropertyDescriptor(this.fixedProps, name);
    if (desc !== undefined) {
      if ('value' in desc) {
        return desc.value;
      } else {
        if (desc.get === undefined) { return undefined; }
        return desc.get.call(rcvr);
      }
    }
    // simulate missing derived trap fall-back behavior
    return this.targetHandler.get ?
             this.targetHandler.get(rcvr, name) :
             TrapDefaults.get.call(this.targetHandler, rcvr, name);
  },
  
  // if name denotes a fixed property, set it directly
  // as per the default 'set' trap behavior
  // Note: this.fixedProps is not leaked as the |this| value of accessors
  set: function(rcvr, name, val) {
    var desc = Object.getOwnPropertyDescriptor(this.fixedProps, name);
    if (desc !== undefined) {
      if ('writable' in desc) { // fixed data property
        if (desc.writable) {
          desc.value = val;
          Object.defineProperty(this.fixedProps, name, desc);
          return true;
        } else {
          return false;
        }
      } else { // fixed accessor property
        if (desc.set) {
          desc.set.call(rcvr, val);
          return true;
        } else {
          return false;
        }
      }
    }
    // simulate missing derived trap fall-back behavior
    return this.targetHandler.set ?
             this.targetHandler.set(rcvr, name, val) :
             TrapDefaults.set.call(this.targetHandler, rcvr, name, val);
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
          desc.value = val;
          this.defineProperty(name, desc);
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