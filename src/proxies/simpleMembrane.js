// Copyright (C) 2012 Software Languages Lab, Vrije Universiteit Brussel
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
 * The Original Code is an implementation of membranes using direct proxies.
 *
 * The Initial Developer of the Original Code is
 * Tom Van Cutsem, Vrije Universiteit Brussel.
 * Portions created by the Initial Developer are Copyright (C) 2012
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *
 */
load("DirectProxies.js");

// strategies for membranes & invariant enforcement:
// - no special action taken: membrane proxies are always extensible,
//   cannot expose non-configurable property descriptors across membrane
// Re. non-extensibility:
// - have membrane proxies inherit the [[Extensible]] flag of
//   their target object:
//   - at creation time
//     (may become inconsistent later: target non-extensible, proxy remains extensible)
//   - sync before each access
// Re. non-configurability:
// - have membrane proxies turn all exposed configurable:false descriptors
//   into configurable:true => avoids TypeErrors, but invariants can't
//   pass through the membrane.
//   Likewise, O.defineProperty(proxy,name,{configurable:false}) always fails.
// - have membrane proxies store all exposed configurable:false descriptors
//   on fakeTarget before exposing. Eagerly copy all such descriptors if
//   target is or becomes non-extensible.
//   The stored descriptors should be wrapped (or at least for data properties
//   the value attribute should be wrapped)
//   Likewise, O.defineProperty(proxy,name,{configurable:false}) defines
//   a wrapped value on fakeTarget, unwrapped value on real target.

function isPrimitive(obj) {
  return Object(obj) !== obj;  
}

/**
 * A simple membrane:
 *  - does not unwrap when a wrapped object crosses the membrane in the opposite
 *    direction.
 *  - does not preserve object identity along both sides of the membrane:
 *    an object can have more than one wrapped version.
 *  - does not allow observing non-configurability on wrapped objects.
 *  - does not allow (re)defining non-configurable properties on wrapped objects.
 *  - does not allow observing whether a property is 'own' on non-extensible objects.
 *    The last three points are due to the invariant enforcement mechanism of
 *    direct proxies.
 */
function makeSimpleMembrane(initTarget) {
  var enabled = true;
  function wrap(target) {
   //primitives provide only irrevocable knowledge, no need to wrap them
   if (isPrimitive(target)) { return target; }
   var baseHandler = Proxy({}, {
     get: function(ignoreTarget, trapName) {
       if (!enabled) {throw new Error("revoked");}
       return function(fakeTarget/*, ...args*/) {
         var args = Array.prototype.slice.call(arguments, 1);
         try {
           // return wrap(Reflect[trapName](target, ...args.map(wrap)));
           return wrap(
             Reflect[trapName].apply(Reflect,
                                     [target].concat(args.map(wrap))));
         } catch (e) {
           //print(trapName + " caught "+e);
           // TODO: why does this code throw StopIteration?
           // TODO: if StopIteration needs special treatment, are there
           // other such 'standard' exceptions that should be passed
           // through the membrane unmodified?
           if (e instanceof StopIteration) { throw e; }
           throw wrap(e);
         }
       }
     }
   });

   // can't use real target, which would expose unwrapped proto
   var fakeTarget = (typeof target === "function") ?
     function() {} :
     Object.create(wrap(Object.getPrototypeOf(target)));
     
   // TODO: should fakeTarget inherit target's [[Extensible]]
   // attribute? If yes, the following code is not sufficient:
   // the target may become non-extensible at a later point in time
   if (!Object.isExtensible(target)) {
     Object.preventExtensions(fakeTarget);
   }
  
   return Proxy(fakeTarget, baseHandler);
  }
  return {
   wrapper: wrap(initTarget),
   revoke: function() { enabled = false; }
  };
}

// === Unit tests ===

function assert(b, reason) {
  if (!b) throw new Error('assertion failed: '+reason);
}
function assertThrows(reason, msg, f) {
  try {
    f();
    throw new Error('assertThrows: no exception raised: '+reason);
  } catch(e) {
    if (e.message !== msg) {
      throw e;
    }
  }
}

var TESTS = {}; // unit test functions stored in here

// test simple transitive wrapping
// test whether primitives make it through unwrapped
TESTS.testSimpleMembrane = function() {
  // membrane works for configurable properties
  var wetA = {x:1};
  var wetB = {y:wetA};
  var membrane = makeSimpleMembrane(wetB);
  var dryB = membrane.wrapper;
  var dryA = dryB.y;
  assert(wetA !== dryA, 'wetA !== dryA');
  assert(wetB !== dryB, 'wetB !== dryB');
  assert(wetA.x === 1, 'wetA.x === 1');
  assert(dryA.x === 1, 'dryA.x === 1');
  membrane.revoke();
  assert(wetA.x === 1, 'wetA.x === 1 after revoke');
  assert(wetB.y === wetA, 'wetB.y === wetA after revoke');
  assertThrows('dryA.x', "revoked", function() { dryA.x });
  assertThrows('dryB.y', "revoked", function() { dryB.y });
}

// test whether functions are wrapped
TESTS.testFunctionSimpleMembrane = function() {
  var wetA = function(x) { return x; };
  var membrane = makeSimpleMembrane(wetA);
  var dryA = membrane.wrapper;

  assert(wetA !== dryA, 'wetA !== dryA');
  assert(wetA(1) === 1, 'wetA(1) === 1');
  assert(dryA(1) === 1, 'dryA(1) === 1');

  membrane.revoke();
  assert(wetA(1) === 1, 'wetA(1) === 1 after revoke');
  assertThrows('dryA(1) after revoke', "revoked", function() { dryA(1) });
}

// test whether values returned from wrapped methods are wrapped
TESTS.testReturnSimpleMembrane = function() {
  var wetA = { x: 42 };
  var wetB = {
    m: function() { return wetA; }
  };
  var membrane = makeSimpleMembrane(wetB);
  assert(wetA.x === 42, 'wetA.x === 42');
  assert(wetB.m().x === 42, 'wetB.m().x === 42');
  
  var dryB = membrane.wrapper;
  var dryA = dryB.m();
  
  assert(wetA !== dryA, 'wetA !== dryA');
  assert(wetB !== dryB, 'wetB !== dryB');
  
  assert(dryA.x === 42, 'dryA.x === 42');

  membrane.revoke();
  
  assertThrows('dryA.x', "revoked", function() { dryA.x });
  assertThrows('dryB.m()', "revoked", function() { dryB.m() });  
}

// test whether the prototype is also wrapped
TESTS.testProtoSimpleMembrane = function() {
  var wetA = { x: 42 };
  var wetB = Object.create(wetA);

  assert(Object.getPrototypeOf(wetB) === wetA,
         'Object.getPrototypeOf(wetB) === wetA');
  
  var membrane = makeSimpleMembrane(wetB);
  var dryB = membrane.wrapper;
  var dryA = Object.getPrototypeOf(dryB);

  assert(wetA !== dryA, 'wetA !== dryA');
  assert(wetB !== dryB, 'wetB !== dryB');

  assert(dryA.x === 42, 'dryA.x === 42');
  membrane.revoke();
  assertThrows('dryA.x', "revoked", function() { dryA.x });
}

// test whether typeof results are unchanged when
// crossing a membrane
TESTS.testTypeOfSimpleMembrane = function() {
  var wetA = {
    obj: {},
    arr: [],
    fun: function(){},
    nbr: 1,
    str: "x",
    nul: null,
    udf: undefined,
    bln: true,
    rex: /x/,
    dat: new Date()
  };
  var membrane = makeSimpleMembrane(wetA);
  var dryA = membrane.wrapper;
  
  Object.keys(wetA).forEach(function (name) {
    assert(typeof wetA[name] === typeof dryA[name],
           'typeof wetA['+name+'] === typeof dryA['+name+']');
  });
};

// test that simple membrane does not allow observation of
// non-configurability of wrapped properties
TESTS.testNonConfigSimpleMembrane = function() {
  var wetA = Object.create(null, {
    x: { value: 1,
         writable: true,
         enumerable: true,
         configurable: false }
  });
  
  assert(wetA.x === 1, 'wetA.x === 1');
  assert(!Object.getOwnPropertyDescriptor(wetA,'x').configurable,
         'wetA.x is non-configurable');
  
  var membrane = makeSimpleMembrane(wetA);
  var dryA = membrane.wrapper;
  
  // perhaps surprisingly, just reading out the property value works,
  // since no code has yet observed that 'x' is a non-configurable
  // own property.
  assert(dryA.x === 1, 'dryA.x === 1');
  
  assertThrows('observing x as non-configurable',
               "cannot report a non-configurable descriptor "+
                 "for non-existent property 'x'",
               function() { Object.getOwnPropertyDescriptor(dryA,'x') });
  assert(dryA.x === 1, 'dryA.x === 1');
};

// test that a simple membrane cannot expose own properties on
// non-extensible objects  
TESTS.testNonExtSimpleMembrane = function() {
  var wetA = Object.preventExtensions({x:1});
  assert(!Object.isExtensible(wetA), 'wetA is non-extensible');
  
  var membrane = makeSimpleMembrane(wetA);
  var dryA = membrane.wrapper;
  
  assert(dryA.x === 1, 'dryA.x === 1');
  
  assert(!Object.isExtensible(dryA), 'dryA is also non-extensible');

  assertThrows('observing dryA.x as an own property descriptor',
               "cannot report a new own property 'x' on a non-extensible object",
               function() { Object.getOwnPropertyDescriptor(dryA,'x'); });

  assertThrows('observing dryA.x as an own property',
               "cannot report a new own property 'x' on a non-extensible object",
               function() { Reflect.hasOwn(dryA,'x'); });
};

// test assignment into a simple membrane
TESTS.testAssignSimpleMembrane = function() {
  var wetA = {x:1};
  assert(wetA.x === 1, 'wetA.x === 1');
  
  var membrane = makeSimpleMembrane(wetA);
  var dryA = membrane.wrapper;
  
  Object.defineProperty(dryA,'y',
    { value:2,
      writable:true,
      enumerable:true,
      configurable:true });
  assert(dryA.y === 2, 'dryA.y === 2');

  assert(dryA.x === 1, 'dryA.x === 1');
  assert(dryA.x = 2, 'dryA.x = 2');
  assert(dryA.x === 2, 'dryA.x === 2');
  
  membrane.revoke();
  
  assertThrows("dryA.x = 3", "revoked", function() { dryA.x = 3; });
};

// test that a simple membrane does not preserve object identity
TESTS.testIdentitySimpleMembrane = function() {
  var wetA = {};
  var wetB = {x:wetA};
  var membrane = makeSimpleMembrane(wetB);
  var dryB = membrane.wrapper;
  
  var dryA1 = dryB.x;
  var dryA2 = dryB.x;
  // a proper identity-preserving membrane would fix this:
  assert(dryA1 !== dryA2, 'dryA1 !== dryA2');
};

// test that a simple membrane wraps twice when crossing the
// boundary twice, instead of unwrapping
TESTS.testCrossingSimpleMembrane = function() {
  var wetA = {};
  var inWetA = null;
  var wetB = {out:wetA, in: function(x) { inWetA = x; return x; }};
  var membrane = makeSimpleMembrane(wetB);
  var dryB = membrane.wrapper;
  
  var dryA = dryB.out;
  var outWetA = dryB.in(dryA);
  
  // a proper identity-preserving membrane would fix this:
  assert(wetA !== inWetA, 'wetA !== inWetA');
  assert(wetA !== outWetA, 'wetA !== outWetA');
};

// simple test driver loop
Object.getOwnPropertyNames(TESTS).forEach(function (name) {
  print(name);
  TESTS[name]();
  print("ok");  
});