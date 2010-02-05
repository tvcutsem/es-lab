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


/**
 * Just trying out some ideas -- not yet ready for discussion.
 */


'use strict';

// originals
var O = {};
O.getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
O.getOwnPropertyNames = Object.getOwnPropertyNames;
O.defineProperty = Object.defineProperty;
O.seal = Object.seal;
O.freeze = Object.freeze;
O.preventExtensions = Object.preventExtensions;
O.keys = Object.keys;
O.prototype_hasOwnProperty = Object.prototype.hasOwnProperty;
O.prototype_propertyIsEnumerable = Object.prototype.propertyIsEnumerable;
var F = {};
F.prototype_toString = Function.prototype.toString;

Object.getPropertyDescriptor = function(obj, name) {
  while (obj !== null) {
    var result = Object.getOwnPropertyDescriptor(obj, name);
    if (result) { return result; }
    obj = Object.getPrototypeOf(obj);
  }
  return undefined;
};
O.getPropertyDescriptor = Object.getPropertyDescriptor;

Object.defineProperties = function(obj, pmap) {
  for (var name in pmap) {
    Object.defineProperty(obj, name, pmap[name]);
  }
};
O.defineProperties = Object.defineProperties;

var endsWith__ = (/__$/);

function Name(name) {
  name = String(name);
  if (endsWith__.test(name)) {
    throw new TypeError('Must not end in double underbar: ' + name);
  }
  return name;
}

function nameOk(name) {
  return !endsWith__.test(name);
}

var metaMirandas = {
  handler___: null,

  getOwnProperty___: function(name) {
    return O.getOwnPropertyDescriptor(this, Name(name));
  },
  getProperty___: function(name) {
    return O.getPropertyDescriptor(this, Name(name));
  },
  defineOwnProperty___: function(name, desc) {
    return O.defineProperty(this, Name(name), desc);
  },
  delete___: function(name) { 
    return delete this[Name(name)]; 
  },
  getOwnPropertyNames___: function() { 
    return O.getOwnPropertyNames(this).filter(nameOk); 
  },
  enumerate___: function() {
    var result = this.enumerateOwn___();
    var optParent = Object.getPrototypeOf(this);
    if (optParent) {
      result.push.apply(result, optParent.enumerate___());
    }
    return result;
  },
  fix___: function() { return undefined; },

  has___: function(name) {
    name = Name(name);
    if (this.hasOwn__(name)) {
      return true;
    }
    var optParent = Object.getPrototypeOf(this);
    if (optParent) {
      return optParent.has__(name);
    }
    return false;
  },
  hasOwn___: function(name) { 
    return O.prototype_hasOwnProperty.call(this, Name(name)); 
  },
  get___: function(name) {
    return this[Name(name)]; 
  },
  set___: function(name, val) { 
    this[Name(name)] = val; return true; 
  },
  invoke___: function(name, args) { 
    return this[Name(name)].apply(this, args); 
  },
  enumerateOwn___: function() {
    return O.keys(this).filter(nameOk);
  }  
};

Object.keys(metaMirandas).forEach(function(name) {
  Object.defineProperty(Object.prototype, name, {
    value: freezeMember(metaMirandas[name])
  });
});

function makeProxy(handler, proxy) {
  var members = {
    handler___: handler,
    delete___: function(name) { return !!handler.delete(name); },
    has___: function(name) { return !!handler.has(name); },
    hasOwn___: function(name) { return !!handler.hasOwn(name); },
    get___: function(name) { return handler.get(this, name); },
    set___: function(name, val) { return !!handler.set(this, name, val); },
    invoke___: function(name, args) {return handler.invoke(this, name, args);},
    enumerate___: function() { return handler.enumerate(); },
    fix___: function() {
      var optDesc = handler.fix();
      if (!optDesc) { throw new Error('proxy not ready for fixing'); }
      Object.keys(members).forEach(function(name) {
        delete proxy[name];
      });
      Object.defineProperties(proxy, optDesc);
    }
  };
  Object.keys(members).forEach(function(name) {
    Object.defineProperty(proxy, name, {
      value: freezeMember(members[name]),
      configurable: true
    });
  });
  return proxy;
}

var Proxy = {
  create: function(handler, parent) {
    return makeProxy(handler, Object.create(parent));
  },
  createFunction: function(handler, callTrap, constructTrap) {
    function funProxy() {
      var args = slice(arguments, 0);
      if (calledAsConstructor(this, funProxy)) {
        return construct(constructTrap, args);
      } else {
        return Function.prototype.apply.call(callTrap, this, args);
      }
    }
    funProxy.toString___ = function() {
      return Function.prototype.toString.call(callTrap);
    };
    Object.defineProperty(funProxy, 'prototype', {
      get: function() { return handler.get(funProxy, 'prototype'); },
      set: function(val) { handler.set(funProxy, 'prototype', val); },
      configurable: true
    });
    return makeProxy(handler, funProxy);
  }
};

/// Monkey patch primordials

Object.getOwnProperty = function(obj, name) {
  if (obj.handler___) { return obj.handler___.getOwnProperty(name); }
  return O.getOwnProperty(obj, name);
};

// ...

// Rewriting rules

/*
 * js`delete $=obj[$=name]` => js`$obj.delete___($name)`
 * js`$=name in $=obj` => js`($=t = $name, $obj.has___($t))`
 * js`$=obj[$=name]` => js`$obj.get___($name)`
 * js`$=obj[$=name] = $val` => js`($obj.set___($=t = $val), $t)`
 * js`$=obj[$=name](...$=args)` => js`$obj.invoke___($name, $args)`
 * js`for($=v in $obj) $body` 
 * => js`{$=t1 = $obj.enumerate___(); 
 *        $=t2 = $t1.length;
 *        for ($=t3 = 0; $t3 < $t2; $t3++) {
 *          $v = $t1[$t3];
 *          $body;}}`
 */
