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
    if ('prototype' in meth) {
      freeze(meth.prototype);
    }
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

  /* var newTrait = trait({ foo:required, ... })
   *
   * @param object any object, mostly specified using an object literal
   * @returns a new trait describing all of the own properties of the object
   *   (both enumerable and non-enumerable)
   *
   * As a general rule, 'trait' should always be invoked with an
   * object *literal*, since the object merely serves as a record
   * descriptor. Both its identity and its prototype chain are completely ignored.
   */
  function trait(obj) {
    var map = {};
    forEach(getOwnPropertyNames(obj), function (name) {
      var pd = getOwnPropertyDescriptor(obj, name);
      if (pd.value === required) {
        pd = makeRequiredPropDesc(name);
      }
      map[name] = pd;
    });
    return map;
  }

  /* var newTrait = compose(trait_1, trait_2, ..., trait_N)
   *
   * @param trait_i any object, but presumably an object used as a trait
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
   *   compose() returns a trait equivalent to Object.freeze({})
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
  
  function override(frontT, backT) {
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
  }

  /* var newTrait = alias({ oldName: 'newName', ... }, trait)
   *
   * @param aliases an object whose own properties serve as a mapping from
            old names to new names.
   * @param trait any object, but presumably an object used as a trait
   * @returns a new trait with the same own properties as the original trait,
   *          except that all own properties whose name is an own property
   *          of aliases will be renamed to aliases[name]
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
   * var obj = object(trait, { failOnConflicts: true, ... })
   *
   * @param trait a trait object to be turned into a complete object
   * @param options an optional object where
   *
   *        options.failOnConflicts: is a boolean indicating whether
   *          the call to object should fail noisily if a conflicting property
   *          remains (default: false).
   *
   *        options.failOnIncomplete: is a boolean indicating whether
   *          the call to object should fail noisily if a required property
   *          is not present in the trait (default: false)
   *
   * @returns a frozen object having all of the properties of the trait.
   *          All methods or accessors defined on the result are frozen
   *          and their 'this' value is bound to obj.
   *
   * @throws 'Missing required property' if {failOnIncomplete:true} and
   *         the trait still contains a required property.
   * @throws 'Remaining conflicting property' if {failOnConflicts:true} and
   *         the trait still contains a conflicting property.
   */
  function object(trait, optOptions) {
    var options = optOptions || {};
    var failOnConflicts = options.failOnConflicts || false;
    var failOnIncomplete = options.failOnIncomplete || true;
    var self = {};
    var properties = {};
  
    forEach(getOwnPropertyNames(trait), function (name) {
      var pd = trait[name];
      if ('value' in pd) { // data property
        // check for remaining 'required' properties
        if (pd.required) {
          if (failOnIncomplete) {
            throw new Error('Missing required property: '+name);
          } else {
            return; // drop missing required property
          }
        }
        
        // freeze all function properties and their prototype
        if (typeof pd.value === 'function') {
          // bind 'this' in trait method to the composite object
          pd.value = freezeAndBind(pd.value, self);
        }
      } else { // accessor property
        
        // check for remaining conflicting properties
        if (pd.conflict && failOnConflicts) {
          throw new Error('Remaining conflicting property: '+name);
          // if !failOnConflicts, leave the conflicting property in the composite
        }
        
        if (pd.get) { pd.get = freezeAndBind(pd.get, self); }
        if (pd.set) { pd.set = freezeAndBind(pd.set, self); }
      }
      
      properties[name] = pd;
    });
  
    defineProperties(self, properties);
    return freeze(self);
  }

  // expose the public API of this module
  return {
       trait: trait,
      object: object,
     compose: compose,
       alias: alias,
     exclude: exclude,
    override: override,
    required: required
  };
  
})();