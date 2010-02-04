// Copyright (C) 2010 Google Inc.
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

// See http://code.google.com/p/es-lab/wiki/Traits
// for background on traits and a description of this library

(function(){

  load('../../src/traits/traits.js'); // provides Trait
  load('../unit.js'); // provides makeUnitTest
  
  var unit = makeUnitTest('Traits', false);
  
  var trait = Trait.trait;
  
  // == ancillary functions to compare the structure of two traits ==
  
  function testEqv(trait1, trait2, id) {    
    var names1 = getOwnPropertyNames(trait1);
    var names2 = getOwnPropertyNames(trait2);
    var name;
    if (unit.compare(names1.length, names2.length,
               id+': traits declare same amount of properties')) {
       for (var i = 0; i < names1.length; i++) {
         name = names1[i];
         if (!unit.ok(trait2[name] !== undefined, "trait2 contains "+name)) {
           return false;
         }
         if (!isSameDesc(name, trait1[name], trait2[name], id)) {
           return false;
         }
       }
    }  
  }
  
  function getOwnPropertyNames(obj) {
    var props = [];
    for (var p in obj) { if (Object.prototype.hasOwnProperty.call(obj,p)) { props.push(p); } }
    return props;
  };
  
  function isSameDesc(name, desc1, desc2, id) {
    // for conflicting properties, don't compare values because the conflicting props
    // are never equal
    if (desc1.conflict && desc2.conflict) {
      return true;
    } else {
      return ( unit.compare(desc1.get, desc2.get, id+": "+name+".get")
            && unit.compare(desc1.set, desc2.set, id+": "+name+".set")
            && identical(name, desc1.value, desc2.value, id)
            && unit.compare(desc1.enumerable, desc2.enumerable, id+": "+name+".enumerable")
            && unit.compare(desc1.required, desc2.required, id+": "+name+".required")
            && unit.compare(desc1.conflict, desc2.conflict, id+": "+name+".conflict")); 
    }
  }
  
  function identical(name, x, y, id) {
    if (x === y) {
      // 0 === -0, but they are not identical
      return unit.ok(x !== 0 || 1/x === 1/y, id+": "+name+".value "+x+" equals "+y);
    } else {
      // NaN !== NaN, but they are identical.
      // NaNs are the only non-reflexive value, i.e., if x !== x,
      // then x is a NaN.
      return unit.ok(x !== x && y !== y, id+": "+name+".value "+x+" equals "+y);
    }
  }
  
  function dataP(value) {
    return {
      value: value,
      enumerable: true
    };
  }
  
  function methodP(fun) {
    return {
      value: fun,
      method: true,
      enumerable: true
    };
  }
  
  function accessorP(get, set) {
    return {
      get: get,
      set: set,
      enumerable: true
    };
  }
  
  function requiredP() {
    return {
      value: undefined,
      required: true,
      enumerable: false    
    };
  }
  
  function conflictP(name) {
    var conflict = function(var_args) {
      throw new Error("Conflicting property: "+name);
    };
    if (Object.defineProperty) {
      return {
       get: conflict,
       set: conflict,
       enumerable: false,
       conflict: true
      }; 
    } else {
      return {
        value: conflict,
        enumerable: false,
        conflict: true
      };
    }
  }
  
  // == the unit tests ==
  
  function testMethod() {};
  
  // test eqv
  (function() {
    var T1 = trait({a:0,  b:Trait.required, c:testMethod});
    var T2 = trait({b: Trait.required, a:0, c:testMethod});
    var T3 = trait({a: 0, b:Trait.required, c:testMethod, d:'foo'});
    var T4 = trait({a: 0, b:Trait.required, d:'foo' });
    unit.ok(Trait.eqv(T1,T1), "eqv is reflexive");
    unit.ok(Trait.eqv(T1,T2) , "T1 eqv T2");
    unit.ok(Trait.eqv(T1,T2) && Trait.eqv(T2,T1), "eqv is symmetric");
    unit.ok(!Trait.eqv(T1,T3), "T1 ! eqv T3");
    unit.ok(!Trait.eqv(T1,T4), "T1 ! eqv T4");
  })();
  
  testEqv(trait({}), {}, "empty trait");
  
  testEqv(trait(
          { a: 0,
            b: testMethod }),
          { a: dataP(0),
            b: methodP(testMethod) },
          "simple trait");
  
  testEqv(trait(
          { a: Trait.required,
            b: 1 }),
          { a: requiredP(),
            b: dataP(1) },
          "simple trait with required prop");
  
  testEqv(trait({a: 0, b: 1, c: Trait.required}),
          trait({b: 1, c: Trait.required, a: 0}),
          "ordering of trait properties is irrelevant");
  
  testEqv(Trait.compose(
            trait({ a: 0,
                    b: 1 }),
            trait({ c: 2,
                    d: testMethod })),
          { a: dataP(0),
            b: dataP(1),
            c: dataP(2),
            d: methodP(testMethod) },
          "simple composition");
  
  testEqv(Trait.compose(
            trait({ a: 0,
                    b: 1 }),
            trait({ a: 2,
                    c: testMethod })),
          { a: conflictP('a'),
            b: dataP(1),
            c: methodP(testMethod) },
          "composition with conflict");
  
  testEqv(Trait.compose(
            trait({ a: 0,
                    b: 1 }),
            trait({ a: 0,
                    c: testMethod })),
          { a: dataP(0),
            b: dataP(1),
            c: methodP(testMethod) },
          "composition of identical props does not cause conflict");
  
  testEqv(Trait.compose(
            trait({ a: Trait.required,
                    b: 1 }),
            trait({ a: Trait.required,
                    c: testMethod })),
          { a: requiredP(),
            b: dataP(1),
            c: methodP(testMethod) },
          "composition with identical required props");
  
  testEqv(Trait.compose(
            trait({ a: Trait.required,
                    b: 1 }),
            trait({ a: testMethod })),
          { a: methodP(testMethod),
            b: dataP(1) },
          "composition satisfying a required prop");
  
  testEqv(Trait.compose(
            Trait.compose(trait({ a: 1 }), trait({ a: 2 })),
            trait({ b: 0 })),
          { a: conflictP('a'),
            b: dataP(0) },
          "compose is neutral wrt conflicts");

  testEqv(Trait.compose(
            Trait.compose(trait({ a: 1 }), trait({ a: 2 })),
            trait({ a: Trait.required })),
          { a: conflictP('a') },
          "conflicting prop overrides required prop");

  testEqv(Trait.compose(
            trait({ a: 0, b: 1 }),
            trait({ c: 2, d: testMethod })),
          Trait.compose(
            trait({ c: 2, d: testMethod}),
            trait({ a: 0, b: 1 })),
          "compose is commutative");

  testEqv(Trait.compose(
            trait({ a: 0, b: 1, c: 3, e: Trait.required }),
            trait({ c: 2, d: testMethod })),
          Trait.compose(
            trait({ c: 2, d: testMethod}),
            trait({ a: 0, b: 1, c: 3, e: Trait.required })),
          "compose is commutative, also for required/conflicting props");
            
  testEqv(Trait.compose(
            trait({ a: 0, b: 1, c: 3, d: Trait.required }),
            Trait.compose(
              trait({ c: 3, d: Trait.required }),
              trait({ c: 2, d: testMethod, e: 'foo' }))),
          Trait.compose(
            Trait.compose(
              trait({ a: 0, b: 1, c: 3, d: Trait.required }),
              trait({ c: 3, d: Trait.required })),
            trait({ c: 2, d: testMethod, e: 'foo' })),
          "compose is associative");
  
  testEqv(Trait.compose(
            Trait.compose(trait({ b: 2 }), trait({ a: 1 })),
            Trait.compose(trait({ c: 3 }), trait({ a: 1 })),
            trait({ d: 4 })),
          { a: dataP(1),
            b: dataP(2),
            c: dataP(3),
            d: dataP(4) },
          "diamond import of same prop does not generate conflict");
  
  testEqv(Trait.resolve({},
            trait({ a: 1, b: Trait.required, c: testMethod })),
          { a: dataP(1),
            b: requiredP(),
            c: methodP(testMethod) },
          "resolve with empty resolutions has no effect");
  
  testEqv(Trait.resolve({ a: 'A', c: 'C' },
            trait({ a: 1, b: Trait.required, c: testMethod })),
          { A: dataP(1),
            b: requiredP(),
            C: methodP(testMethod) },
          "resolve: renaming");

  testEqv(Trait.resolve({ a: 'b' },
            trait({ a: 1, b: 2 })),
          { b: conflictP('b') },
          "resolve: renaming to conflicting name causes conflict, ordering 1");
  
  testEqv(Trait.resolve({ a: 'b' },
            trait({ b: 2, a: 1 })),
          { b: conflictP('b') },
          "resolve: renaming to conflicting name causes conflict, ordering 2");
  
  testEqv(Trait.resolve({ a: undefined },
            trait({ a: 1, b: 2 })),
          { b: dataP(2) },
          "resolve: simple exclusion");
  
  testEqv(Trait.resolve({ a: undefined, b: undefined },
            trait({ a: 1, b: 2 })),
          { },
          "resolve: exclusion to empty trait");

  testEqv(Trait.resolve({ a: undefined, b: 'c' },
            trait({ a: 1, b: 2 })),
          { c: dataP(2) },
          "resolve: exclusion and renaming of disjoint props");

  testEqv(Trait.resolve({ a: undefined, b: 'a' },
            trait({ a: 1, b: 2 })),
          { a: dataP(2) },
          "resolve: exclusion and renaming of overlapping props");

  testEqv(Trait.resolve({ a: 'c', b: 'c' },
            trait({ a: 1, b: 2 })),
          { c: conflictP('c') },
          "resolve: renaming to a common alias causes conflict");

  testEqv(Trait.resolve({ a: 'c', d: 'c' },
            trait({ a: 1, b: 2 })),
          { c: dataP(1),
            b: dataP(2) },
          "resolve: renaming of non-existent props has no effect");

  testEqv(Trait.resolve({ b: undefined },
            trait({ a: 1 })),
          { a: dataP(1) },
          "resolve: exclusion of non-existent props has no effect");
            
  testEqv(Trait.resolve({ a: 'c', b: undefined },
            trait({ a: Trait.required, b: Trait.required, c:'foo', d:1 })),
          { a: requiredP(),
            b: requiredP(),
            c: dataP('foo'),
            d: dataP(1) },
          "resolve is neutral w.r.t. required properties");
  
  testEqv(Trait.override(
            trait({a: 1, b: 2 }),
            trait({c: 3, d: testMethod })),
          { a: dataP(1),
            b: dataP(2),
            c: dataP(3),
            d: methodP(testMethod) },
          "override of mutually exclusive traits");

  testEqv(Trait.override(
            trait({a: 1, b: 2 }),
            trait({c: 3, d: testMethod })),
          Trait.compose(
            trait({d: testMethod, c: 3 }),
            trait({b: 2, a: 1 })),
          "override of mutually exclusive traits is compose");
            
  testEqv(Trait.override(
            trait({a: 1, b: 2 }),
            trait({a: 3, c: testMethod })),
          { a: dataP(1),
            b: dataP(2),
            c: methodP(testMethod) },
          "override of overlapping traits");
          
  testEqv(Trait.override(
            trait({a: 1, b: 2 }),
            trait({b: 4, c: 3 }),
            trait({a: 3, c: testMethod, d: 5 })),
          { a: dataP(1),
            b: dataP(2),
            c: dataP(3),
            d: dataP(5) },
          "three-way override of overlapping traits");

  testEqv(Trait.override(
            trait({a: Trait.required, b: 2 }),
            trait({a: 1, c: testMethod })),
          { a: dataP(1),
            b: dataP(2),
            c: methodP(testMethod) },
          "override replaces required properties");
  
  unit.ok(!Trait.eqv(
             Trait.override(
               trait({a: 1, b: 2}),
               trait({a: 3, c: 4})),
             Trait.override(
               trait({a: 3, c: 4}),
               trait({a: 1, b: 2}))),
          "override is not commutative");
  
  testEqv(Trait.override(
            Trait.override(
              trait({a: 1, b: 2}),
              trait({a: 3, c: 4, d: 5})),
            trait({a: 6, c: 7, e: 8})),
          Trait.override(
            trait({a: 1, b: 2}),
            Trait.override(
              trait({a: 3, c: 4, d: 5}),
              trait({a: 6, c: 7, e: 8}))),
          "override is associative");
  
  // create
  var o1 = Trait.create(Object.prototype,
                        trait({a:1, b:function() {return this.a; }}));
  if (Object.getPrototypeOf) {
    unit.compare(Object.prototype, Object.getPrototypeOf(o1), "o1 prototype");
  }
  unit.compare(1, o1.a, 'o1.a');
  unit.compare(1, o1.b(), 'o1.b()');
  unit.compare(2, getOwnPropertyNames(o1).length, 'Object.keys(o1).length === 2');
  
  // create with prototype
  var o2 = Trait.create(Array.prototype, trait({}));
  if (Object.getPrototypeOf) {
    unit.compare(Array.prototype, Object.getPrototypeOf(o2), "o2 prototype");
  }
  
  // - create open:false -
  
  // exception for incomplete required properties
  try {
    Trait.create(Object.prototype,
                 trait({ foo: Trait.required }), {open:false})
    unit.ok(false, 'expected create to complain about missing required props');
  } catch(e) {
    // TODO: test exception string?
  }
  
  // exception for unresolved conflicts
  try {
    Trait.create(Object.prototype,
                 Trait.compose(trait({ a: 0 }), trait({ a: 1 })), {open:false})
    unit.ok(false, 'expected create to complain about unresolved conflicts');
  } catch(e) {
    // TODO: test exception string?
  }
  
  // verify object and methods frozen
  // verify 'this' bound
  
  // - create open:true -
  
  // verify that required properties are dropped
  try {
    var o4 = Trait.create(Object.prototype,
                 trait({ foo: Trait.required }), {open:true});
    unit.ok(!('foo' in o4), 'required property dropped');
  } catch(e) {
    unit.ok(false, 'did not expect create to complain about required props');
  }
  
  // verify that conflicting properties are present
  try {
    var o5 = Trait.create(Object.prototype,
                 Trait.compose(trait({ a: 0 }), trait({ a: 1 })), {open:true});
    unit.ok('a' in o5, 'conflicting property present');
    try {
      (o5.a, o5.a()); // accessor or data prop
      unit.ok(false, 'expected conflicting prop to cause exception');
    } catch (e) {}
  } catch(e) {
    unit.ok(false, 'did not expect create to complain about conflicting props');
  }
  
  // verify that object and methods are not frozen
  // verify 'this' unbound
  
  // TODO: test accessor properties
  
  return unit.testDone();
  
})();