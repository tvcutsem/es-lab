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
 * The Original Code is an implementation of "__noSuchMethod__" on top of
 * direct proxies.
 *
 * The Initial Developer of the Original Code is
 * Tom Van Cutsem, Vrije Universiteit Brussel.
 * Portions created by the Initial Developer are Copyright (C) 2011
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *
 */

// once this file is loaded, Proxy.create{Function} is patched to
// support direct proxies
load('DirectProxies.js');

function assert(b, msg) {
  print((b ? 'success: ' : 'fail: ') + msg);
}

function assertThrows(message, fn) {
  try {
    fn();
    print('fail: expected exception, but succeeded. Message was: '+message);
  } catch(e) {
    assert(e.message === message, "assertThrows: "+e.message);
  }
}

//var root = Proxy(Object.create(null), {
// ...  
//});
//root.noSuchMethod = function(name, args) {
//  throw new TypeError(name + " is not a function");
//};
//Object.prototype.__proto__ = root;


Object.prototype.noSuchMethod = function(name, args) {
  throw new TypeError(name + " is not a function");
};
MethodSink = Proxy({}, {
  has: function(target, name) { return true; },
  get: function(target, name, receiver) {
    if (name in Object.prototype) {
      return Object.prototype[name];
    }
    return function() {
      var args = Array.prototype.slice.call(arguments);
      return receiver.noSuchMethod(name, args);
    }
  }
});

// the 'main' function
function test() {
  var empty = Object.create(MethodSink);
  empty.noSuchMethod = function(name, args) {
    // print('noSuchMethod: '+name+ ' ' + args.join(","));
    return name;
  };
  assert(empty.foo() === 'foo', 'empty.foo');
  assert(empty.bar() === 'bar', 'empty.bar');
  empty.foo = 1;
  assert(empty.foo === 1, 'empty.foo after assignment');
  var nonempty = {foo:1};
  nonempty.__proto__ = MethodSink;
  nonempty.noSuchMethod = function(name, args) {
    // print('noSuchMethod: '+name+ ' ' + args.join(","));
    return name;
  };
  assert(nonempty.foo === 1, 'nonempty.foo');
  assert(nonempty.bar() === 'bar', 'nonempty.bar');
  assert(empty.toString === Object.prototype.toString, 'inherited toString');
  
  var obj = Object.create(MethodSink);
  assert(obj.noSuchMethod === Object.prototype.noSuchMethod, 'inherited noSuchMethod');
  assertThrows('foo is not a function', function() { obj.foo() });
  print("OK");
}

if (typeof window === "undefined") {
  test();
}