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

  function makeConflictAccessor(name) {
    var accessor = function(var_args) {
      throw new Error("Conflicting property: "+name);
    };
    accessor.isConflict = true;
    Object.freeze(accessor.prototype);
    return Object.freeze(accessor);
  };
  
  function isConflictingProp(pd) {
    return (pd.get && pd.get.isConflict);
  }
  
  function makeConflictingPropDesc(name) {
    var conflict = makeConflictAccessor(name);
    return Object.freeze({
     get: conflict,
     set: conflict,
     enumerable: false,
     configurable: true
    });
  }

  // Note: isSameDesc should return true if both
  // desc1 and desc2 represent a 'required' property
  // (otherwise two composed required properties would be turned into a conflict)
  function isSameDesc(desc1, desc2) {
    return (   desc1.get === desc2.get
            && desc1.set === desc2.set
            && desc1.value === desc2.value // TODO: deal with NaN and -0
            // TODO: do the following attributes really matter?
            && desc1.writable === desc2.writable
            && desc1.enumerable === desc2.enumerable
            && desc1.configurable === desc2.configurable);
  }
  
  /* forAllOwnPropertiesOf(obj, function(name, pd) {
   *   ...  
   * })
   *
   * iterate over all own properties, also non-enumerable ones
   */
  function forAllOwnPropertiesOf(obj, doFun) {
    return Object.getOwnPropertyNames(obj).forEach(function (name) {
      return doFun(name, Object.getOwnPropertyDescriptor(obj, name));
    });
  }
  
  function definePropsAndFreeze(obj, props) {
    Object.defineProperties(obj, props);
    return Object.freeze(obj);
  }
  
  function freezeAndBind(meth, self) {
    if ('prototype' in meth) {
      Object.freeze(meth.prototype);
    }
    return Object.freeze(meth.bind(self)); 
  }

  /* makeSet(['foo', {bar:0}, ...]) => { foo: true, bar: true, ...}
   *
   * makeSet returns an object whose own properties represent a set.
   *
   * Each string in the namesOrObjects array is added to the set, as well
   * as all of the own (enumerable and non-enumerable) properties of any
   * object in the namesOrObjects array.
   *
   * To test whether an element is in the set, perform:
   *   set.hasOwnProperty(element)
   */
  function makeSet(namesOrObjects) {
    var set = {};
    namesOrObjects.forEach(function (nameOrObject) {
      if (typeof nameOrObject === "string") {
        set[nameOrObject] = true;      
      } else { // nameOrObject presumed to be an object
        Object.getOwnPropertyNames(nameOrObject).forEach(function (name) {
          // note: getOwnPropertyNames rather than keys such that we
          // also include the non-enumerable own properties of the object
          set[name] = true;
        });
      }
    });
    return Object.freeze(set);
  }

  // == singleton object to be used as the placeholder for a required property ==
  
  var required = Object.freeze({ comment: 'required trait property' });

  // == The four composition operators ==

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
    var traits = Array.prototype.slice.call(arguments, 0);
    var newTrait = {};
    var properties = {};
    
    traits.forEach(function (trait) {
      forAllOwnPropertiesOf(trait, function (name, pd) {
        if (properties.hasOwnProperty(name) &&
            (properties[name].value !== required)) {
          
          // a non-required property with the same name was previously defined
          // this is not a conflict if pd represents a 'required' property itself:
          if (pd.value === required) {
            return; // skip this property, the required property is now present
          }
            
          if (!isSameDesc(properties[name], pd)) {
            // a distinct, non-required property with the same name
            // was previously defined by another trait => mark as conflicting property
            properties[name] = makeConflictingPropDesc(name); 
          } // else,
          // properties are not in conflict if they refer to the same value
          
        } else {
          properties[name] = pd;
        }
      });
    });
    
    return definePropsAndFreeze(newTrait, properties);
  }

  /* var newTrait = exclude(['name', obj, ...], trait)
   *
   * @param namesOrObjects a list of strings denoting property names or
   *        objects.
   * @param trait any object, but presumably an object used as a trait
   * @returns a new trait with the same own properties as the original trait,
   *          except those properties whose name appears in nameOrObjects
   *          or is an own property of an object that appears in nameOrObjects
   */
  function exclude(namesOrObjects, trait) {
    // note: we could make exclude return a function (trait) { ... }
    // such that it can partially-evaluate its first argument, reusing
    // the created exclusion set on mutiple traits. The downside is that
    // for one-off use, one would need to write: exclude([...])(trait)
    var exclusions = makeSet(namesOrObjects);
    var newTrait = {};
    var properties = {};
    
    forAllOwnPropertiesOf(trait, function (name, pd) {
      if (!exclusions.hasOwnProperty(name)) {
        properties[name] = pd;
      }
    });
    
    return definePropsAndFreeze(newTrait, properties);
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
    var properties = {};
    
    forAllOwnPropertiesOf(trait, function (name, pd) {
      var newName = aliases.hasOwnProperty(name) ? String(aliases[name]) : name;
      properties[newName] = pd;
    });
    
    return definePropsAndFreeze(newTrait, properties);
  }

  /**
   * var obj = object(trait, {extend: proto, failOnConflicts: true, ...})
   *
   * @param trait any Javascript object, but mostly an object presumed
   *              to be a trait.
   * @param options an optional object where
   *
   *        options.extend: denotes the prototype of obj (default: Object.prototype)
   *
   *        options.failOnConflicts: is a boolean indicating whether
   *          the call to object should fail noisily if a conflicting property
   *          remains (default: false).
   *
   *        options.failOnIncomplete: is a boolean indicating whether
   *          the call to object should fail noisily if a required property
   *          is not present in the trait (default: false)
   *
   * @returns a frozen object with the same own properties as trait.
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
    var parent = options.extend || Object.prototype; // 'extends' not allowed :(
    var failOnConflicts = options.failOnConflicts || false;
    var failOnIncomplete = options.failOnIncomplete || true;
    var self = Object.create(parent);
    var properties = {};
  
    forAllOwnPropertiesOf(trait, function (name, pd) {
      if ('value' in pd) { // data property
        // check for remaining 'required' properties
        if (pd.value === required) {
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
        if (isConflictingProp(pd) && failOnConflicts) {
          throw new Error('Remaining conflicting property: '+name);
          // if !failOnConflicts, leave the conflicting property in the composite
        }
        
        if (pd.get) { pd.get = freezeAndBind(pd.get, self); }
        if (pd.set) { pd.set = freezeAndBind(pd.set, self); }
      }
      
      properties[name] = pd;
    });
  
    return definePropsAndFreeze(self, properties);
  }

  // expose the public API of this module
  return {
      object: object,
     compose: compose,
       alias: alias,
     exclude: exclude,
    required: required
  };
  
})();