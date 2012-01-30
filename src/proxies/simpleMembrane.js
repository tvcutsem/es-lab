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

/**
 * This code showcases three types of membranes using direct proxies:
 *
 * - invariant-containing membranes:
 *   - don't allow observation of non-configurable props across membrane
 *   - don't allow definition of new non-configurable props across membrane
 *   - no storage overhead
 *
 * - invariant-relaxing membranes:
 *   - expose non-configurable props as configurable across membrane
 *   - don't allow definition of new non-configurable props across membrane
 *   - no storage overhead
 *
 * - invariant-preserving membranes:
 *   - properly expose non-configurable props as non-configurable across membrane
 *   - allow definition of new non-configurable props across membrane
 *   - membrane wrappers store all exposed non-configurable properties
 *
 * Re. non-extensibility, the membrane proxies always appear as extensible,
 * unless their target is non-extensible when it passes the membrane.
 * Neither of the above 3 implementations does yet allow the wrapper to
 * be made non-extensible at a later point in time. Also, when the wrapper
 * is non-extensible, clients will fail to observe whether a property is "own".
 *
 * In addition, all three implementations are currently what we call "simple"
 * membranes, in that the membrane:
 *  - does not unwrap when a wrapped object crosses the membrane in the opposite
 *    direction.
 *  - does not preserve object identity along both sides of the membrane:
 *    an object can have more than one wrapped version.
 */
 
/**
 * The following TypeErrors can occur when crossing an invariant-containing membrane:
 * TODO(tvcutsem): write unit test for each of these
 * wrapper = the membrane proxy/dummy target
 * target = the real (not the dummy) membraned target object
 * 
 * getOwnPropertyDescriptor
 *   - if wrapper is non-extensible and exposed descriptor defined on target:
 *     cannot report a new own property on a non-extensible object
 *   - if exposed descriptor is non-configurable:
 *     cannot report a non-configurable descriptor for non-existent property
 * defineProperty
 *   - if wrapper is non-extensible and property successfully updated on target:
 *     cannot successfully add a new property to a non-extensible object
 *     Note: assuming target is well-behaved, this will only occur when updating
 *           non-configurable, writable target props to non-configurable, non-writable
 *           or when the update was a no-op
 *   - if descriptor is non-configurable and successfully updated on target:
 *     cannot successfully define a non-configurable descriptor for non-existent property
 * freeze, seal, preventExtensions
 *   - if wrapper is extensible and target is successfully frozen/sealed/made non-extensible:
 *     can't report non-frozen/non-sealed/extensible object as frozen/sealed/non-extensible
 * delete
 *   - membrane can't violate any invariants
 * getOwnPropertyNames
 *   - if wrapper is non-extensible and target has own properties:
 *     getOwnPropertyNames cannot list a new property on a non-extensible object
 * hasOwn
 *   - if wrapper is non-extensible and own property exists on target:
 *     cannot report a new own property on a non-extensible object
 * has
 *   - membrane can't violate any invariants
 * get
 *   - membrane can't violate any invariants
 * set
 *   - membrane can't violate any invariants
 * enumerate
 *   - membrane can't violate any invariants
 * iterate
 *   - membrane can't violate any invariants
 * keys
 *   - if wrapper is non-extensible and target has own enumerable properties:
 *     keys trap cannot list a new property on a non-extensible object
 * apply
 *   - membrane can't violate any invariants
 * construct
 *   - membrane can't violate any invariants
 *
 * Generally speaking:
 *   - if wrapper is non-extensible, can't observe "ownness" of properties
 *   - can't observe non-configurability or define/update non-configurable properties
 */

function isPrimitive(obj) {
  return Object(obj) !== obj;  
}

/**
 * A simple invariant-containing membrane:
 *
 *  - does not allow observing non-configurability on wrapped objects.
 *  - does not allow (re)defining non-configurable properties on wrapped objects.
 *  - does not allow observing whether a property is 'own' on non-extensible objects.
 *  (these restrictions are all due to the invariant enforcement mechanism of
 *   direct proxies)
 */
function makeInvariantContainingMembrane(initTarget) {
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
           // in ES6: return wrap(Reflect[trapName](target, ...args.map(wrap)));
           return wrap(
             Reflect[trapName].apply(Reflect,
                                     [target].concat(args.map(wrap))));
         } catch (e) {
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
   // the target may be extensible now, but may become
   // non-extensible at a later point in time
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

/**
 * A simple invariant-relaxing membrane:
 *
 *  - exposes all non-configurable properties as configurable ones
 *  - does not allow (re)defining non-configurable properties on wrapped objects.
 *  - does not allow observing whether a property is 'own' on non-extensible objects.
 */
function makeInvariantRelaxingMembrane(initTarget) {
  var enabled = true;
  function wrap(target) {
   //primitives provide only irrevocable knowledge, no need to wrap them
   if (isPrimitive(target)) { return target; }
   
   var baseHandler = new Reflect.VirtualHandler();
   baseHandler.getOwnPropertyDescriptor = function(fakeTgt, name) {
     if (!enabled) {throw new Error("revoked");}
     var desc = Reflect.getOwnPropertyDescriptor(target, name);
     if (desc !== undefined) {
       desc.configurable = true; // can't expose non-configurable props
       if ('value' in desc) { desc.value = wrap(desc.value); }
       if ('get' in desc) { desc.get = wrap(desc.get); }
       if ('set' in desc) { desc.set = wrap(desc.set); }
     }
     return desc;
   };
   baseHandler.defineProperty = function(fakeTgt, name, desc) {
     if (!enabled) {throw new Error("revoked");}
     if (!desc.configurable) {
       return false; // can't define non-configurable props
     }
     if ('value' in desc) { desc.value = wrap(desc.value); }
     if ('get' in desc) { desc.get = wrap(desc.get); }
     if ('set' in desc) { desc.set = wrap(desc.set); }
     return wrap(Reflect.defineProperty(target, name, desc));
   };
   baseHandler.preventExtensions = function(fakeTgt) {
     if (!enabled) {throw new Error("revoked");}
     return false; // can't make the object non-extensible across the membrane
   };
   baseHandler.deleteProperty = function(fakeTgt, name) {
     if (!enabled) {throw new Error("revoked");}
     return wrap(Reflect.deleteProperty(target, name));
   };
   baseHandler.getOwnPropertyNames = function(fakeTgt) {
     if (!enabled) {throw new Error("revoked");}
     return wrap(Reflect.getOwnPropertyNames(target));
   };
   baseHandler.apply = function(fakeTgt, receiver, args) {
     if (!enabled) {throw new Error("revoked");}
     try {
       // in ES6: return wrap(Reflect[trapName](target, ...args.map(wrap)));
       return wrap(Reflect.apply(target, wrap(receiver), args.map(wrap)));
     } catch (e) {
       if (e instanceof StopIteration) { throw e; } // FIXME
       throw wrap(e);
     }
   };

   // can't use real target, which would expose unwrapped proto
   var fakeTarget = (typeof target === "function") ?
     function() {} :
     Object.create(wrap(Object.getPrototypeOf(target)));
     
   // TODO: should fakeTarget inherit target's [[Extensible]]
   // attribute? If yes, the following code is not sufficient:
   // the target may be extensible now, but may become
   // non-extensible at a later point in time
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

/**
 * A simple invariant-preserving membrane:
 *
 *  - correctly exposes non-configurable properties
 *  - allows (re)defining non-configurable properties on wrapped objects.
 */
function makeInvariantPreservingMembrane(initTarget) {
  var enabled = true;
  
  function wrapDescriptor(desc) {
    var wrappedDesc = {
      enumerable:   desc.enumerable,
      configurable: desc.configurable
    };
    if ('value'    in desc) { wrappedDesc.value    = wrap(desc.value); }
    if ('writable' in desc) { wrappedDesc.writable = desc.writable; }
    if ('get'      in desc) { wrappedDesc.get      = wrap(desc.get); }
    if ('set'      in desc) { wrappedDesc.set      = wrap(desc.set); }
    return wrappedDesc;
  }
  
  function wrap(target) {
   //primitives provide only irrevocable knowledge, no need to wrap them
   if (isPrimitive(target)) { return target; }
   
   var baseHandler = new Reflect.VirtualHandler();
   baseHandler.getOwnPropertyDescriptor = function(fixedProps, name) {
     if (!enabled) {throw new Error("revoked");}
     var desc = Reflect.getOwnPropertyDescriptor(target, name);
     if (desc !== undefined) {
       var wrappedDesc = wrapDescriptor(desc);
       if (!desc.configurable) {
         // TODO: what if fixedProps already contains a property
         // for 'name'? wrappedDesc will not be compatible
         // since simple membranes don't preserve identity of wrapped objects
         Object.defineProperty(fixedProps, name, wrappedDesc);
       }
       return wrappedDesc;
     }
     return undefined;
   };
   baseHandler.defineProperty = function(fixedProps, name, desc) {
     if (!enabled) {throw new Error("revoked");}
     var success = Reflect.defineProperty(target, name, wrapDescriptor(desc));
     if (success && !desc.configurable) {
       Object.defineProperty(fixedProps, name, desc);
     }
     return success;
   };
   baseHandler.preventExtensions = function(fixedProps) {
     if (!enabled) {throw new Error("revoked");}
     // TODO: if we allow preventing extensions across the membrane,
     // the wrapper could query Object.getOwnPropertyNames(target),
     // install those props in fixedProps, then call preventExtensions
     // on both fixedProps and the target
     return false; // can't make the object non-extensible across the membrane
   };
   baseHandler.deleteProperty = function(fixedProps, name) {
     if (!enabled) {throw new Error("revoked");}
     return wrap(Reflect.deleteProperty(target, name));
   };
   baseHandler.getOwnPropertyNames = function(fixedProps) {
     if (!enabled) {throw new Error("revoked");}
     return wrap(Reflect.getOwnPropertyNames(target));
   };
   baseHandler.apply = function(fixedProps, receiver, args) {
     if (!enabled) {throw new Error("revoked");}
     try {
       // in ES6: return wrap(Reflect[trapName](target, ...args.map(wrap)));
       return wrap(Reflect.apply(target, wrap(receiver), args.map(wrap)));
     } catch (e) {
       if (e instanceof StopIteration) { throw e; } // FIXME
       throw wrap(e);
     }
   };

   // can't use real target, which would expose unwrapped proto
   // store all non-configurable properties on this fake target,
   // which we now name the "fixedProps" object
   var fixedProps = (typeof target === "function") ?
     function() {} :
     Object.create(wrap(Object.getPrototypeOf(target)));
     
   // TODO: should fakeTarget inherit target's [[Extensible]]
   // attribute? If yes, the following code is not sufficient:
   // the target may be extensible now, but may become
   // non-extensible at a later point in time
   if (!Object.isExtensible(target)) {
     Object.preventExtensions(fixedProps);
   }
  
   return Proxy(fixedProps, baseHandler);
  }
  return {
   wrapper: wrap(initTarget),
   revoke: function() { enabled = false; }
  };
}

// ========= Unit tests =========

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

var TESTS = Object.create(null); // unit test functions stored in here

// each unit test is a function(membraneMaker, membraneType)
// where membraneMaker is a function to construct an initial membrane
// and membraneType is one of 'containing', 'relaxing', 'preserving'
var M_CONTAINING = "containing";
var M_RELAXING   = "relaxing";
var M_PRESERVING = "preserving";

// test simple transitive wrapping
// test whether primitives make it through unwrapped
TESTS.testTransitiveWrapping = function(makeMembrane, membraneType) {
  // membrane works for configurable properties
  var wetA = {x:1};
  var wetB = {y:wetA};
  var membrane = makeMembrane(wetB);
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
TESTS.testFunctionWrapping = function(makeMembrane, membraneType) {
  var wetA = function(x) { return x; };
  var membrane = makeMembrane(wetA);
  var dryA = membrane.wrapper;

  assert(wetA !== dryA, 'wetA !== dryA');
  assert(wetA(1) === 1, 'wetA(1) === 1');
  assert(dryA(1) === 1, 'dryA(1) === 1');

  membrane.revoke();
  assert(wetA(1) === 1, 'wetA(1) === 1 after revoke');
  assertThrows('dryA(1) after revoke', "revoked", function() { dryA(1) });
}

// test whether values returned from wrapped methods are wrapped
TESTS.testReturnWrapping = function(makeMembrane, membraneType) {
  var wetA = { x: 42 };
  var wetB = {
    m: function() { return wetA; }
  };
  var membrane = makeMembrane(wetB);
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
TESTS.testProtoWrapping = function(makeMembrane, membraneType) {
  var wetA = { x: 42 };
  var wetB = Object.create(wetA);

  assert(Object.getPrototypeOf(wetB) === wetA,
         'Object.getPrototypeOf(wetB) === wetA');
  
  var membrane = makeMembrane(wetB);
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
TESTS.testTypeOf = function(makeMembrane, membraneType) {
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
  var membrane = makeMembrane(wetA);
  var dryA = membrane.wrapper;
  
  Object.keys(wetA).forEach(function (name) {
    assert(typeof wetA[name] === typeof dryA[name],
           'typeof wetA['+name+'] === typeof dryA['+name+']');
  });
};

// test observation of non-configurability of wrapped properties
TESTS.testNonConfigurableObservation = function(makeMembrane, membraneType) {
  var wetA = Object.create(null, {
    x: { value: 1,
         writable: true,
         enumerable: true,
         configurable: false }
  });
  
  assert(wetA.x === 1, 'wetA.x === 1');
  assert(!Object.getOwnPropertyDescriptor(wetA,'x').configurable,
         'wetA.x is non-configurable');
  
  var membrane = makeMembrane(wetA);
  var dryA = membrane.wrapper;
  
  // perhaps surprisingly, just reading out the property value works,
  // since no code has yet observed that 'x' is a non-configurable
  // own property.
  assert(dryA.x === 1, 'dryA.x === 1');
  
  switch (membraneType) {
    // containing membranes throw when observing non-configurable props
    case M_CONTAINING:
      assertThrows('observing x as non-configurable',
                   "cannot report a non-configurable descriptor "+
                   "for non-existent property 'x'",
                   function() { Object.getOwnPropertyDescriptor(dryA,'x') });
      break;
    // relaxing membranes expose a non-configurable prop as configurable
    case M_RELAXING:
      var relaxedDesc = Object.getOwnPropertyDescriptor(dryA,'x');
      assert(relaxedDesc.configurable, 'relaxedDesc.configurable is true');
      assert(relaxedDesc.value === 1, relaxedDesc.value === 1);
      assert(relaxedDesc.enumerable, 'relaxedDesc.enumerable is true');
      assert(relaxedDesc.writable, 'relaxedDesc.writable is true');
      break;
    // preserving membranes expose a non-configurable prop as non-configurable
    case M_PRESERVING:
      var exactDesc = Object.getOwnPropertyDescriptor(dryA,'x');
      assert(!exactDesc.configurable, 'exactDesc.configurable is false');
      assert(exactDesc.value === 1, exactDesc.value === 1);
      assert(exactDesc.enumerable, 'exactDesc.enumerable is true');
      assert(exactDesc.writable, 'exactDesc.writable is true');
      break;
    default:
      throw new Error("Illegal membrane type: "+membraneType);
  }

  assert(dryA.x === 1, 'dryA.x === 1');
};

// test that a membrane cannot expose own properties on non-extensible objects  
TESTS.testNonExtensibleOwnProps = function(makeMembrane, membraneType) {
  var wetA = Object.preventExtensions({x:1});
  assert(!Object.isExtensible(wetA), 'wetA is non-extensible');
  
  var membrane = makeMembrane(wetA);
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

// test assignment into a membrane
TESTS.testAssignment = function(makeMembrane, membraneType) {
  var wetA = {x:1};
  assert(wetA.x === 1, 'wetA.x === 1');
  
  var membrane = makeMembrane(wetA);
  var dryA = membrane.wrapper;
  
  Object.defineProperty(dryA,'y',
    { value:2,
      writable:true,
      enumerable:true,
      configurable:true });
  assert(dryA.y === 2, 'dryA.y === 2');

  assert(dryA.x === 1, 'dryA.x === 1');
  dryA.x = 2;
  assert(dryA.x === 2, 'dryA.x === 2');
  
  membrane.revoke();
  
  assertThrows("dryA.x = 3", "revoked", function() { dryA.x = 3; });
};

// test definition of a new non-configurable property on a membrane
TESTS.testNonConfigurableDefinition = function(makeMembrane, membraneType) {
  var wetA = {};  
  var membrane = makeMembrane(wetA);
  var dryA = membrane.wrapper;
  
  function defineProp() {
    Object.defineProperty(dryA,'x',
      { value:1,
        writable:true,
        enumerable:true,
        configurable:false });
  }
  
  switch (membraneType) {
    // containing membranes throw when defining non-configurable props
    case M_CONTAINING:
      assertThrows('defining non-config prop on containing membrane',
                   "cannot successfully define a non-configurable descriptor "+
                   "for non-existent property 'x'",
                   function() { defineProp(); });
      break;
    // relaxing membranes reject definition of non-configurable props
    case M_RELAXING:
      defineProp();
      assert(dryA.x === undefined, 'dryA.x === undefined');
      assert(wetA.x === undefined, 'wetA.x === undefined');
      break;
    // preserving membranes allow definition of non-configurable props
    case M_PRESERVING:
      defineProp();
      assert(dryA.x === 1, 'dryA.x === 1');
      assert(wetA.x === 1, 'wetA.x === 1');
      break;
    default:
      throw new Error("Illegal membrane type: "+membraneType);
  }
};

// test that a simple membrane does not preserve object identity
TESTS.testIdentitySimpleMembrane = function(makeMembrane, membraneType) {
  var wetA = {};
  var wetB = {x:wetA};
  var membrane = makeMembrane(wetB);
  var dryB = membrane.wrapper;
  
  var dryA1 = dryB.x;
  var dryA2 = dryB.x;
  // a proper identity-preserving membrane would fix this:
  assert(dryA1 !== dryA2, 'dryA1 !== dryA2');
};

// test that a simple membrane wraps twice when crossing the
// boundary twice, instead of unwrapping
TESTS.testCrossingSimpleMembrane = function(makeMembrane, membraneType) {
  var wetA = {};
  var inWetA = null;
  var wetB = {out:wetA, in: function(x) { inWetA = x; return x; }};
  var membrane = makeMembrane(wetB);
  var dryB = membrane.wrapper;
  
  var dryA = dryB.out;
  var outWetA = dryB.in(dryA);
  
  // a proper identity-preserving membrane would fix this:
  assert(wetA !== inWetA, 'wetA !== inWetA');
  assert(wetA !== outWetA, 'wetA !== outWetA');
};

var MEMBRANES = Object.create(null);
MEMBRANES[M_CONTAINING] = makeInvariantContainingMembrane;
MEMBRANES[M_RELAXING]   = makeInvariantRelaxingMembrane;
MEMBRANES[M_PRESERVING] = makeInvariantPreservingMembrane;

// simple test driver loop
function runTests() {
  for (var membraneType in MEMBRANES) {
    print(">> " + membraneType);
    for (var testName in TESTS) {
      print(testName + ", " + membraneType);
      TESTS[testName](MEMBRANES[membraneType], membraneType);
      print("ok");      
    }
    print(">> " + membraneType + " ok");
  }
}

runTests();

print("done");