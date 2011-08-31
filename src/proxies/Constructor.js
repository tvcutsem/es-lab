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

"use strict";

/**
 * A convenience method to create a proper Constructor Function
 * implemented as a function proxy
 */
Proxy.createConstructor = function(handler, callTrap) {
  var proto = new Object();
  var ctor = Proxy.createFunction(
    handler,
    callTrap,
    function() {
      var instance = Object.create(proto);
      var result = callTrap.apply(instance, arguments);
      if (Object(result) === result) {
        return result;
      } else {
        return instance;
      }
    });
  Object.defineProperty(proto, "constructor", {
    value: ctor,
    writable: true,
    enumerable: false,
    configurable: true });
  Object.defineProperty(ctor, "prototype", {
    value: proto,
    writable: true,
    enumerable: false,
    configurable: false });
  Object.defineProperty(ctor, "length", {
    value: callTrap.length,
    writable: false,
    enumerable: false,
    configurable: false });
  return ctor;
}