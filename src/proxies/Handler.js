// Copyright (C) 2010-2011 Software Languages Lab, Vrije Universiteit Brussel
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
 * The Original Code is a default forwarding handler for Harmony Proxies.
 *
 * The Initial Developer of the Original Code is
 * Tom Van Cutsem, Vrije Universiteit Brussel.
 * Portions created by the Initial Developer are Copyright (C) 2011
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *
 */

// A no-op forwarding Proxy Handler
// based on the draft version for standardization:
// http://wiki.ecmascript.org/doku.php?id=harmony:proxy_defaulthandler
// http://wiki.ecmascript.org/doku.php?id=strawman:derived_traps_forwarding_handler

// BaseHandler (implements fundamental traps by forwarding to target)
//    ^
//    |
//  Handler (implements derived traps by forwarding to target)

// BaseHandler only implements the fundamental traps, by forwarding
// the intercepted operation to its target.
function BaseHandler(target) {
  this.target = target;
}

// begin BaseHandler.prototype

// Object.getOwnPropertyDescriptor(proxy, name) -> pd | undefined
BaseHandler.prototype.getOwnPropertyDescriptor = function(name) {
  var desc = Object.getOwnPropertyDescriptor(this.target, name);
  if (desc !== undefined) { desc.configurable = true; }
  return desc;
}

// Object.getOwnPropertyNames(proxy) -> [ string ]
BaseHandler.prototype.getOwnPropertyNames = function() {
  return Object.getOwnPropertyNames(this.target);
}

// Object.defineProperty(proxy, name, pd) -> undefined
BaseHandler.prototype.defineProperty = function(name, desc) {
  Object.defineProperty(this.target, name, desc);
  return desc;
}

// delete proxy[name] -> boolean
BaseHandler.prototype['delete'] = function(name) {
  return delete this.target[name];
}

// Object.{freeze|seal|preventExtensions}(proxy) -> proxy
BaseHandler.prototype.fix = function() {
  // As long as target is not frozen, the proxy won't allow itself to be fixed
  if (!Object.isFrozen(this.target))
    return undefined;
  var props = {};
  var handler = this;
  Object.getOwnPropertyNames(this.target).forEach(function (name) {
    var desc = Object.getOwnPropertyDescriptor(handler.target, name);
    // turn descriptor into a trapping accessor property
    props[name] = {
              get: function( ) { return handler.get(this, name); },
              set: function(v) { return handler.set(this, name, v); },
       enumerable: desc.enumerable,
     configurable: desc.configurable
    };
  });
  return props;
}

// Object.getPropertyDescriptor(proxy, name) -> pd | undefined
// TODO(tvcutsem): move to Handler.prototype if this trap becomes derived
// see http://wiki.ecmascript.org/doku.php?id=strawman:proxy_derived_traps
BaseHandler.prototype.getPropertyDescriptor = function(name) {
  // Note: this function does not exist in ES5
  // var desc = Object.getPropertyDescriptor(this.target, name);
  // fall back on manual prototype-chain-walk:
  var desc = Object.getOwnPropertyDescriptor(this.target, name);
  var parent = Object.getPrototypeOf(this.target);
  while (desc === undefined && parent !== null) {
    desc = Object.getOwnPropertyDescriptor(parent, name);
    parent = Object.getPrototypeOf(parent);
  }
  if (desc !== undefined) { desc.configurable = true; }
  return desc;
}
  
// Object.getPropertyNames(proxy) -> [ string ]
// TODO(tvcutsem): move to Handler.prototype if this trap becomes derived
// see http://wiki.ecmascript.org/doku.php?id=strawman:proxy_derived_traps
BaseHandler.prototype.getPropertyNames = function() {
  // Note: this function does not exist in ES5
  // return Object.getPropertyNames(this.target);
  // fall back on manual prototype-chain-walk:
  var props = Object.getOwnPropertyNames(this.target);
  var parent = Object.getPrototypeOf(this.target);
  while (parent !== null) {
    props = props.concat(Object.getOwnPropertyNames(parent));
    parent = Object.getPrototypeOf(parent);
  }
  // TODO(tvcutsem): remove duplicates from props
  // sketch:
  //   var aggregate = Object.create(null);
  //   for (var p in props) { aggregate[p] = true; }
  //   return Object.getOwnPropertyNames(aggregate);
  return props;
}

// end BaseHandler.prototype

// Handler inherits from BaseHandler, adds all derived traps
function Handler(target) {
  BaseHandler.call(this, target);
}

// begin Handler.prototype

Handler.prototype = Object.create(BaseHandler.prototype);

// name in proxy -> boolean
Handler.prototype.has = function(name) {
  return name in this.target;
}

// ({}).hasOwnProperty.call(proxy, name) -> boolean
Handler.prototype.hasOwn = function(name) {
  return ({}).hasOwnProperty.call(this.target, name);
}

// proxy[name] -> any
Handler.prototype.get = function(receiver, name) {
  return this.target[name];
}

// proxy[name] = val -> val
Handler.prototype.set = function(receiver, name, val) {
  this.target[name] = val;
  // bad behavior when set fails in non-strict mode
  return true;
}

// for (var name in Object.create(proxy)) { ... }
Handler.prototype.enumerate = function() {
  var result = [];
  for (var name in this.target) { result.push(name); };
  return result;
}
  
// for (var name in proxy) { ... }
// Note: non-standard trap
Handler.prototype.iterate = function() {
  var props = this.enumerate();
  var i = 0;
  return {
    next: function() {
      if (i === props.length) throw StopIteration;
      return props[i++];
    }
  };
}

// Object.keys(proxy) -> [ string ]
Handler.prototype.keys = function() {
  return Object.keys(this.target);
}

// end Handler.prototype

// monkey-patch global Proxy if Proxy.Handler is not yet present
if (typeof Proxy === "object" && !Proxy.Handler) {
  Proxy.BaseHandler = BaseHandler;
  Proxy.Handler = Handler;
}