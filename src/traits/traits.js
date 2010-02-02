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

// TODO: trait: turn data props bound to functions into explicit 'methods'

var Traits = (function(){

  // == Ancillary functions ==
  
  // this signals that the current ES implementation supports properties,
  // so probably also accessor properties
  var SUPPORTS_DEFINEPROP = !!Object.defineProperty;

  var call = Function.prototype.call;

  /**
   * An ad hoc version of bind that only binds the 'this' parameter.
   */
  var bindThis = Function.prototype.bind
    ? function(fun, self) { return Function.prototype.bind.call(fun, self); }
    : function(fun, self) {
        function funcBound(var_args) {
          return fun.apply(self, arguments);
        }
        return funcBound;
      };

  var hasOwnProperty = bindThis(call, Object.prototype.hasOwnProperty);
  var slice = bindThis(call, Array.prototype.slice);
    
  // feature testing such that traits.js runs on both ES3 and ES5
  var forEach = Array.prototype.forEach
      ? bindThis(call, Array.prototype.forEach)
      : function(arr, fun) {
          for (var i = 0, len = arr.length; i < len; i++) { fun(arr[i]); }
        };
      
  var freeze = Object.freeze || function(obj) { return obj; };
  var getPrototypeOf = Object.getPrototypeOf || function(obj) { return Object.prototype };
  var getOwnPropertyNames = Object.getOwnPropertyNames ||
      function(obj) {
        var props = [];
        for (var p in obj) { if (hasOwnProperty(obj,p)) { props.push(p); } }
        return props;
      };
  var getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor ||
      function(obj, name) {
        return {
          value: obj[name],
          enumerable: true,
          writable: true,
          configurable: true
        };
      };
  var defineProperty = Object.defineProperty ||
      function(obj, name, pd) {
        obj[name] = pd.value;
      };
  var defineProperties = Object.defineProperties ||
      function(obj, propMap) {
        for (var name in propMap) {
          if (hasOwnProperty(propMap, name)) {
            defineProperty(obj, name, propMap[name]);
          }
        }
      };
  var create = Object.create || 
      function(proto, propMap) {
        var self;
        function dummy() {};
        dummy.prototype = proto || Object.prototype;
        self = new dummy();
        if (propMap) {
          defineProperties(self, propMap);          
        }
        return self;
      };
  
  // end of ES3 - ES5 compatibility functions
  
  function makeConflictAccessor(name) {
    var accessor = function(var_args) {
      throw new Error("Conflicting property: "+name);
    };
    freeze(accessor.prototype);
    return freeze(accessor);
  };

  function makeRequiredPropDesc(name) {
    return freeze({
      value: undefined,
      enumerable: false,
      required: true
    });
  }
  
  function makeConflictingPropDesc(name) {
    var conflict = makeConflictAccessor(name);
    if (SUPPORTS_DEFINEPROP) {
      return freeze({
       get: conflict,
       set: conflict,
       enumerable: false,
       conflict: true
      }); 
    } else {
      return freeze({
        value: conflict,
        enumerable: false,
        conflict: true
      });
    }
  }
  
  /**
   * Are x and y not observably distinguishable?
   */
  function identical(x, y) {
    if (x === y) {
      // 0 === -0, but they are not identical
      return x !== 0 || 1/x === 1/y;
    } else {
      // NaN !== NaN, but they are identical.
      // NaNs are the only non-reflexive value, i.e., if x !== x,
      // then x is a NaN.
      return x !== x && y !== y;
    }
  }

  // Note: isSameDesc should return true if both
  // desc1 and desc2 represent a 'required' property
  // (otherwise two composed required properties would be turned into a conflict)
  function isSameDesc(desc1, desc2) {
    return (   desc1.get === desc2.get
            && desc1.set === desc2.set
            && identical(desc1.value, desc2.value)
            && desc1.enumerable === desc2.enumerable
            && desc1.required === desc2.required
            && desc1.conflict === desc2.conflict);
  }
  
  function freezeAndBind(meth, self) {
    return freeze(bindThis(meth, self)); 
  }

  /* makeSet(['foo', ...]) => { foo: true, ...}
   *
   * makeSet returns an object whose own properties represent a set.
   *
   * Each string in the names array is added to the set.
   *
   * To test whether an element is in the set, perform:
   *   hasOwnProperty(set, element)
   */
  function makeSet(names) {
    var set = {};
    forEach(names, function (name) {
      set[name] = true;
    });
    return freeze(set);
  }

  // == singleton object to be used as the placeholder for a required property ==
  
  var required = freeze({ comment: 'required trait property' });

  // == The public API methods ==

  /**
   * var newTrait = trait({ foo:required, ... })
   *
   * @param object an object record (in principle an object literal)
   * @returns a new trait describing all of the own properties of the object
   *   (both enumerable and non-enumerable)
   * @throws an exception if the object passed to 'trait' has a prototype
   *         other than Object.prototype
   *
   * As a general rule, 'trait' should always be invoked with an
   * object *literal*, since the object merely serves as a record
   * descriptor. Both its identity and its prototype chain are completely ignored.
   * 
   * Data properties bound to function objects in the argument will be flagged
   * as 'method' properties. The prototype of these function objects is frozen.
   * 
   * Data properties bound to the 'required' singleton exported by this module
   * will be marked as 'required' properties.
   *
   * The <tt>trait</tt> function is pure if no other code can witness the
   * side-effects of freezing the prototypes of the methods. If <tt>trait</tt>
   * is invoked with an object literal whose methods are represented as
   * in-place anonymous functions, this should normally be the case.
   */
  function trait(obj) {
    if (getPrototypeOf(obj) !== Object.prototype) {
      throw new Error("trait expects only object records");
    }
    
    var map = {};
    forEach(getOwnPropertyNames(obj), function (name) {
      var pd = getOwnPropertyDescriptor(obj, name);
      if (pd.value === required) {
        pd = makeRequiredPropDesc(name);
      } else if (typeof pd.value === 'function') {
        pd.method = true;
        if ('prototype' in pd.value) {
          freeze(pd.value.prototype);
        }
      }
      map[name] = pd;
    });
    return map;
  }

  /**
   * var newTrait = compose(trait_1, trait_2, ..., trait_N)
   *
   * @param trait_i a trait object
   * @returns a new trait containing the combined own properties of
   *          all the trait_i.
   * 
   * If two or more traits have own properties with the same name, the new
   * trait will contain a 'conflict' property for that name. 'compose' is
   * a commutative and associative operation, and the order of its
   * arguments is not significant.
   *
   * If 'compose' is invoked with < 2 arguments, then:
   *   compose(trait_1) returns a trait equivalent to trait_1
   *   compose() returns an empty trait
   */
  function compose(var_args) {
    var traits = slice(arguments, 0);
    var newTrait = {};
    
    forEach(traits, function (trait) {
      forEach(getOwnPropertyNames(trait), function (name) {
        var pd = trait[name];
        if (hasOwnProperty(newTrait, name) &&
            !newTrait[name].required) {
          
          // a non-required property with the same name was previously defined
          // this is not a conflict if pd represents a 'required' property itself:
          if (pd.required) {
            return; // skip this property, the required property is now present
          }
            
          if (!isSameDesc(newTrait[name], pd)) {
            // a distinct, non-required property with the same name
            // was previously defined by another trait => mark as conflicting property
            newTrait[name] = makeConflictingPropDesc(name); 
          } // else,
          // properties are not in conflict if they refer to the same value
          
        } else {
          newTrait[name] = pd;
        }
      });
    });
    
    return freeze(newTrait);
  }

  /* var newTrait = exclude(['name', ...], trait)
   *
   * @param names a list of strings denoting property names.
   * @param trait a trait some properties of which should be excluded.
   * @returns a new trait with the same own properties as the original trait,
   *          except those properties whose name appears in names
   
   * Note: exclude(A, exclude(B,t)) is equivalent to exclude(A U B, t)
   */
  function exclude(names, trait) {
    var exclusions = makeSet(names);
    var newTrait = {};
    
    // required properties are not excluded but ignored
    forEach(getOwnPropertyNames(trait), function (name) {
      if (!hasOwnProperty(exclusions, name) || trait[name].required) {
        newTrait[name] = trait[name];
      }
    });
    
    return freeze(newTrait);
  }

  /**
   * var newTrait = override(trait_1, trait_2, ..., trait_N)
   *
   * @returns a new trait with all of the combined properties of the argument traits.
   *          In contrast to 'compose', 'override' immediately resolves all conflicts
   *          resulting from this composition by overriding the properties of later
   *          traits. Trait priority is from left to right. I.e. the properties of the
   *          leftmost trait are never overridden.
   *
   *  override is associative:
   *    override(t1,t2,t3) is equivalent to override(t1, override(t2, t3)) or
   *    to override(override(t1, t2), t3)
   *  override is not commutative: override(t1,t2) is not equivalent to override(t2,t1)
   *
   * override() returns an empty trait
   * override(trait_1) returns a trait equivalent to trait_1
   */
  function override(var_args) {
    var traits = slice(arguments, 0);
    var newTrait = {};
    forEach(traits, function (trait) {
      forEach(getOwnPropertyNames(trait), function (name) {
        var pd = trait[name];
        // add this trait's property to the composite trait only if
        // - the trait does not yet have this property
        // - or, the trait does have the property, but it's a required property
        if (!hasOwnProperty(newTrait, name) || newTrait[name].required) {
          newTrait[name] = pd;
        }
      });
    });
    return freeze(newTrait);
  }
  
  /**
   * var newTrait = override(dominantTrait, recessiveTrait)
   *
   * @returns a new trait with all of the properties of dominantTrait
   *          and all of the properties of recessiveTrait not in dominantTrait
   *
   * Note: override is associative:
   *   override(t1, override(t2, t3)) is equivalent to override(override(t1, t2), t3)
   */
  /*function override(frontT, backT) {
    var newTrait = {};
    // first copy all of backT's properties into newTrait
    forEach(getOwnPropertyNames(backT), function (name) {
      newTrait[name] = backT[name];
    });
    // now override all these properties with frontT's properties
    forEach(getOwnPropertyNames(frontT), function (name) {
      var pd = frontT[name];
      // frontT's required property does not override the provided property
      if (!(pd.required && hasOwnProperty(newTrait, name))) {
        newTrait[name] = pd; 
      }      
    });
    
    return freeze(newTrait);
  }*/

  /**
   * var newTrait = alias({ oldName: 'newName', ... }, trait)
   *
   * @param aliases an object whose own properties serve as a mapping from
            old names to new names.
   * @param trait a trait object
   * @returns a new trait with the same own properties as the original trait,
   *          except that all own properties whose name is an own property
   *          of aliases will be renamed to aliases[name]
   *
   * Note: alias(A, alias(B, t)) is equivalent to alias(\n -> A(B(n)), t)
   */
  function alias(aliases, trait) {
    var newTrait = {};
    
    forEach(getOwnPropertyNames(trait), function (name) {
      // required properties are not aliased but ignored
      if (hasOwnProperty(aliases, name) && !trait[name].required) {
        newTrait[aliases[name]] = trait[name];
      } else {
        newTrait[name] = trait[name];
      }
    });
    
    return freeze(newTrait);
  }
  
  /**
   * var newTrait = resolve({ oldName: 'newName', excludeName: undefined, ... }, trait)
   *
   * This is a convenience function combining aliasing and exclusion. It can be implemented
   * as <tt>alias(aliases, exclude(exclusions, trait))</tt> where aliases is the subset of
   * mappings from oldName to newName and exclusions is an array of all the keys that map
   * to undefined (or another falsy value).
   *
   * @param resolutions an object whose own properties serve as a mapping from
            old names to new names, or to undefined if the property should be excluded
   * @param trait a trait object
   * @returns a new trait with the same own properties as the original trait,
   *          except that all own properties whose name is an own property
   *          of resolutions will be renamed to resolutions[name], or will be
   *          excluded from newTrait if resolutions[name] === undefined.
   */
  function resolve(resolutions, trait) {
    var aliases = {};
    var exclusions = [];
    // preprocess aliases and excluded properties
    for (var name in resolutions) {
      if (hasOwnProperty(resolutions, name)) {
        if (resolutions[name]) { // name -> alias
          aliases[name] = resolutions[name];
        } else { // name -> undefined
          exclusions.push(name);
        }
      }
    }
    return alias(aliases, exclude(exclusions, trait));
  }

  /**
   * var obj = build(trait, { extend: proto, ... })
   *
   * @param trait a trait object to be turned into a complete object
   * @param options an optional object where:
   *
   *    options.extend: denotes the prototype of the completed object
   *      (default: Object.prototype)
   *
   *    options.open: is a boolean indicating whether this object
   *      should be considered 'open' or 'closed' (default: false)
   *
   *     'open: true' is for abstract or malleable objects and implies
   *       - no exception is thrown if 'trait' still contains required properties
   *         (the properties are simply dropped from the composite object)
   *       - no exception is thrown if 'trait' still contains conflicting properties
   *         (these properties remain as conflicting properties in the composite object)
   *       - neither the object nor its accessor and method properties are frozen
   *       - the 'this' pseudovariable in all accessors and methods of the object is
   *         left unbound.
   *
   *     'open: false' (default) is for high-integrity or final objects
   *       - an exception is thrown if 'trait' still contains required properties
   *       - an exception is thrown if 'trait' still contains conflicting properties
   *       - the object is and all of its accessor and method properties are frozen
   *       - the 'this' pseudovariable in all accessors and methods of the object is
   *         bound to the composed object.
   *
   * @returns an object with all of the properties described by the trait.
   *
   * @throws 'Missing required property' if {open:false} and
   *         the trait still contains a required property.
   * @throws 'Remaining conflicting property' if {open:false} and
   *         the trait still contains a conflicting property.
   */
  function build(trait, optOptions) {
    var options = optOptions || {};
    var isClosed = !options.open;
    var self = create(options.extend ? options.extend : Object.prototype);
    var properties = {};
  
    if (isClosed) {
      // closed objects
      forEach(getOwnPropertyNames(trait), function (name) {
        var pd = trait[name];
        if (pd.required) { // check for remaining 'required' properties
          throw new Error('Missing required property: '+name);
        } else if (pd.conflict) { // check for remaining conflicting properties
          throw new Error('Remaining conflicting property: '+name);
        } else if ('value' in pd) { // data property
          // freeze all function properties and their prototype
          if (pd.method) { // the property is meant to be used as a method
            // bind 'this' in trait method to the composite object
            properties[name] = {
              value: freezeAndBind(pd.value, self),
              enumerable: pd.enumerable,
              configurable: pd.configurable,
              writable: pd.writable
            };
          } else {
            properties[name] = pd;
          }
        } else { // accessor property
          properties[name] = {
            get: pd.get ? freezeAndBind(pd.get, self) : undefined,
            set: pd.set ? freezeAndBind(pd.set, self) : undefined,
            enumerable: pd.enumerable,
            configurable: pd.configurable,
            writable: pd.writable            
          };
        }
      });

      defineProperties(self, properties);
      return freeze(self); 
    } else {
      // open objects
      forEach(getOwnPropertyNames(trait), function (name) {
        var pd = trait[name];
        if (pd.required) {
          return; // drop missing required property
        }
        // if (pd.conflict) {} // leave conflicting properties in the composite
        properties[name] = pd;
      });

      defineProperties(self, properties);
      return self;
    }
  }

  /** A shorthand for build(trait({...})) */
  function object(record, options) { return build(trait(record), options) }

  /**
   * Tests whether two traits are equivalent. T1 is equivalent to T2 iff
   * both describe the same set of property names and for all property
   * names n, T1[n] is equivalent to T2[n]. Two property descriptors are
   * equivalent if they have the same value, accessors and attributes.
   *
   * @return a boolean indicating whether the two argument traits are equivalent.
   */
  function eqv(trait1, trait2) {
    var names1 = getOwnPropertyNames(trait1);
    var names2 = getOwnPropertyNames(trait2);
    var name;
    if (names1.length !== names2.length) {
      return false;
    }
    for (var i = 0; i < names1.length; i++) {
      name = names1[i];
      if (!isSameDesc(trait1[name], trait2[name])) {
        return false;
      }
    }
    return true;
  }

  // expose the public API of this module
  return {
       trait: trait,
     compose: compose,
     resolve: resolve,
    override: override,
       build: build,
    required: required,
         eqv: eqv,
       alias: alias,   // not essential, cf. resolve
     exclude: exclude, // not essential, cf. resolve
      object: object   // not essential, cf. build + trait
  };
  
})();