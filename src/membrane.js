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

function makeMembrane(target) {
  var enabled = true;
  var table = EphemeronTable(true);
  
  function wrap(wrapped) {
    if (wrapped !== Object(wrapped)) {
      // primitives provide only irrevocable knowledge, so don't
      // bother wrapping it.
      return wrapped;
    }
    var caretaker = table.get(target);
    if (caretaker) { return caretaker; }
    
    var targetHandler = handlerMaker(target);
    var revokeHandler = Proxy.create({
      get: function(rcvr, p) {
        if (!enabled) { throw new Error("disabled"); }
        return function() {
          var args = [].slice.call(arguments, 0);
          return wrap(targetHandler[p].apply(targetHandler, args.map(wrap)));
        };
      },
    });
          
    if (typeof target === "function") {
      function aTrap(self, args) {
        return wrap(target.apply(wrap(self), args.map(wrap)));
      }
      function cTrap(args) {
        return wrap(new target(...args.map(wrap)));
      }
      caretaker = Proxy.createFunction(revokeHandler, aTrap, cTrap);
    } else {
      caretaker = Proxy.create(revokeHandler, wrap(Object.getPrototype(wrapped)));
    }
    table.set(target, caretaker);
    return caretaker;
  }
  
  var gate = {
    enable: function() { enabled = true; },
    disable: function() { enabled = false; }
  };
  
  return { wrapper: wrap(target), gate: gate };
}