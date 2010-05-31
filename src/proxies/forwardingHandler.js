// Copyright (C) 2010 Software Languages Lab, Vrije Universiteit Brussel
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

// A no-op forwarding Proxy Handler
// @author Tom Van Cutsem


function ForwardingHandler(target) {
  this.target = target;
}

ForwardingHandler.prototype = {
  // Object.getOwnPropertyDescriptor(proxy, name) -> pd | undefined
  getOwnPropertyDescriptor: function(name) {
    var desc = Object.getOwnPropertyDescriptor(this.target);
    desc.configurable = true;
    return desc;
  },

  // Object.getOwnPropertyNames(proxy) -> [ string ]
  getOwnPropertyNames: function() {
    return Object.getOwnPropertyNames(this.target);
  },
  
  // Object.defineProperty(proxy, name, pd) -> undefined
  defineProperty: function(name, desc) {
    return Object.defineProperty(this.target, name, desc);
  },

  // delete proxy[name] -> boolean
  'delete': function(name) { return delete this.target[name]; },

  // Object.{freeze|seal|preventExtensions}(proxy) -> proxy
  fix: function() {
    // As long as target is not frozen, the proxy won't allow itself to be fixed
    // if (!Object.isFrozen(this.target)) // FIXME: not yet implemented
    //     return undefined;
    // return Object.getOwnProperties(this.target); // FIXME: not yet implemented
    var props = {};
    for (var name in this.target) {
	    props[x] = Object.getOwnPropertyDescriptor(this.target, name);
    }
    return props;
  },

  // name in proxy -> boolean
  has: function(name) { return name in this.target; },

  // ({}).hasOwnProperty.call(proxy, name) -> boolean
  hasOwn: function(name) { return ({}).hasOwnProperty.call(this.target, name); },

  // proxy[name] -> any
  get: function(receiver, name) { return this.target[name]; },

  // proxy[name] = val -> val
  set: function(receiver, name, val) {
    this.target[name] = val;
    // bad behavior when set fails in non-strict mode
    return true;
  },

  // for (var name in Object.create(proxy)) { ... }
  enumerate: function() {
    var result = [];
    for (name in this.target) { result.push(name); };
    return result;
  },
  
  // for (var name in proxy) { ... }
  iterate: function() {
    var props = this.enumerate();
    var i = 0;
    return {
      next: function() {
        if (i === props.length) throw StopIteration;
        return props[i++];
      }
    };
  },

  // Object.keys(proxy) -> [ string ]
  enumerateOwn: function() { return Object.keys(this.target); },
  keys: function() { return Object.keys(this.target); }
};

Proxy.wrap = function(obj) {
  var handler = new ForwardingHandler(obj);
  if (typeof obj === "object") {
    return Proxy.create(handler, Object.getPrototypeOf(obj));
  } else if (typeof obj === "function") {
    return Proxy.createFunction(handler, obj);
  } else {
    throw "Can only wrap objects or functions, given: "+(typeof obj);
  }
}