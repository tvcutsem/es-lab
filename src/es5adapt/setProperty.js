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
 * The Original Code is an experiment with new semantics for ES5 [[Put]].
 *
 * The Initial Developer of the Original Code is
 * Tom Van Cutsem, Vrije Universiteit Brussel.
 * Portions created by the Initial Developer are Copyright (C) 2011
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *
 */

// Auxiliary predictates and definitions

// assumes 'desc' is a proper property descriptor
function isAccessorDescriptor(desc) {
  return desc !== undefined && 'set' in desc;
}
// assumes 'desc' is a proper property descriptor
function isDataDescriptor(desc) {
  return desc !== undefined && 'writable' in desc;
}
Object.getPropertyDescriptor = function(subject, name) {
  var pd = Object.getOwnPropertyDescriptor(subject, name);
  var proto = Object.getPrototypeOf(subject);
  while (pd === undefined && proto !== null) {
    pd = Object.getOwnPropertyDescriptor(proto, name);
    proto = Object.getPrototypeOf(proto);
  }
  return pd;
};

// Proposed alternative to ES5 [[Put]]:
//  Object.setProperty ( R, P, V, O )
//    Return the result of calling the built-in [[SetP]] method of O
//    passing R, P and V as arguments.
// The below function implements the built-in [[SetP]] algorithm of Objects.
//
// @param receiver the object on which the assignment is initially performed
// @param parent the receiver or one of its prototypes, which we need to check
// for shadowed accessor or non-writable data properties
Object.setProperty = function(receiver, name, value, parent) {
  parent = parent || receiver; // start lookup in receiver

  // first, check whether parent has a non-writable property shadowing
  // name on receiver
  var ownDesc = Object.getOwnPropertyDescriptor(parent, name);
  if (isDataDescriptor(ownDesc)) {
    if (!ownDesc.writable) return false;
  }
  if (isAccessorDescriptor(ownDesc)) {
    if(ownDesc.set === undefined) return false;
    ownDesc.set.call(receiver, value);
    return true;
  }
  // name is undefined or a writable data property in parent,
  // search parent's prototype
  var proto = Object.getPrototypeOf(parent);
  if (proto === null) {
    // parent was the last prototype, now we know that 'name' is not shadowed
    // by an accessor or a non-writable data property, so we can update or
    // add the property to the initial receiver object
    var receiverDesc = Object.getOwnPropertyDescriptor(receiver, name);
    if (isAccessorDescriptor(receiverDesc)) {
      if(receiverDesc.set === undefined) return false;
      receiverDesc.set.call(receiver, value);
      return true;
    }
    if (isDataDescriptor(receiverDesc)) {
      if (!receiverDesc.writable) return false;
      Object.defineProperty(receiver, name, {value: value});
      return true;
    }
    // property doesn't exist yet on the receiver, add it
    if (!Object.isExtensible(receiver)) return false;
    Object.defineProperty(receiver, name,
      { value: value,
        writable: true,
        enumerable: true,
        configurable: true });
    return true;
  } else {
    // continue the search in parent's prototype
    return Object.setProperty(receiver, name, value, proto);
  }
}

// current ES5 [[Put]] semantics
Object.setPropertyES5 = function(receiver, name, val) {
  var desc = Object.getOwnPropertyDescriptor(receiver, name);
  var setter;
  if (desc) {
    if ('writable' in desc) {
      if (desc.writable) {
        Object.defineProperty(receiver, name, {value: val});
        return true;
      } else {
        return false;
      }
    } else { // accessor
      setter = desc.set;
      if (setter) {
        setter.call(receiver, val); // assumes Function.prototype.call
        return true;
      } else {
        return false;
      }
    }
  }
  desc = Object.getPropertyDescriptor(receiver, name);
  if (desc) {
    if ('writable' in desc) {
      if (desc.writable) {
        // fall through
      } else {
        return false;
      }
    } else { // accessor
      var setter = desc.set;
      if (setter) {
        setter.call(receiver, val); // assumes Function.prototype.call
        return true;
      } else {
        return false;
      }
    }
  }
  if (!Object.isExtensible(receiver)) return false;
  Object.defineProperty(receiver, name, {
    value: val, 
    writable: true, 
    enumerable: true, 
    configurable: true});
  return true;
};

// generates a series of tests to check whether the above definitions
// return equivalent results. Also tests whether the above definitions
// are both equivalent to the built-in [[Put]] algorithm of this JS engine
function runTests() {
  var child = null;
  var parent = null;
  var name = 'x';
  var val = 0;
  
  /**
   * Sets up the property 'name = val' on child and/or parent, depending
   * on the 'place' parameter.
   *
   * @param place one of "own", "inherited", "both" or "none"
   * @param writability a boolean indicating whether the property is writable
   * @param type one of "data" or "accessor"
   * @param extensibility a boolean indicating whether child is extensible
   */
  function setup(place, writability, type, extensibility) {
    parent = Object.create(null);
    child = Object.create(parent);
    
    var propdesc = {
      enumerable: true,
      configurable: true    
    };

    if (type === 'data') {
      propdesc.value =  val;
      propdesc.writable = writability;
    } else {
      var name_slot = val;
      propdesc.get =  function() { return name_slot; },
      propdesc.set = writability ? function(nv) {
        if (this !== child) {
          print("! receiver in accessor does not match");
        }
        name_slot = nv;
      } : undefined;
    }

    if (place !== 'none') {
      if (place === 'own' || place === 'both') {
        Object.defineProperty(child, name, propdesc);
      }
      if (place === 'inherited' || place === 'both') {
        Object.defineProperty(parent, name, propdesc);
      }    
    }

    if (!extensibility) {
      Object.preventExtensions(child);
    }
  }

  ['inherited', 'own', 'both', 'none'].forEach(function (place) {
    [true, false].forEach(function (writability) {
      ['data', 'accessor'].forEach(function (type) {
        [true, false].forEach(function (extensibility) {
        
          setup(place, writability, type, extensibility);
          var oldSetPropertyResult = Object.setPropertyES5(child, name, val+1);
          var oldPropValueResult = child[name];
          
          setup(place, writability, type, extensibility);
          var newSetPropertyResult = Object.setProperty(child, name, val+1);
          var newPropValueResult = child[name];

          setup(place, writability, type, extensibility);
          try {
            child[name] = val+1;
          } catch(e) {
            print("! exception setting child[name]: "+e);
          }
          var builtinPropValueResult = child[name];
          
          print("{exists: "+place+", writable: "+writability+
                ", type: "+type+ ", extensible: "+extensibility+"} "+
                " => ES5: " + oldPropValueResult +
                ", ES.next: " + newPropValueResult +
                ", this browser: " + builtinPropValueResult);
          if (oldSetPropertyResult !== newSetPropertyResult) {
            print("! setProperty results don't match. ES5: " +
                  oldSetPropertyResult + " ES.next: " + newSetPropertyResult);
          }
          if (oldPropValueResult !== newPropValueResult ||
              oldPropValueResult !== builtinPropValueResult ||
              newPropValueResult !== builtinPropValueResult) {
            print("! new values for x don't match. ES5: " + oldPropValueResult +
                  ", ES.next: " + newPropValueResult +
                  ", this browser: " + builtinPropValueResult);
          }
        })
      })
    })
  });
}

// when headless, automatically run the tests
if (typeof window === "undefined") {
  runTests(); 
}