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

var hop = Object.prototype.hasOwnProperty;

var metaMirandas = {
  handler___: null,
  delete___: function(name) { return delete this[name]; },
  has___: function(name) { return name in this; },
  hasOwn___: function(name) { return hop.call(this, name); },
  get___: function(name) { return this[name]; },
  set___: function(name, val) { this[name] = val; return true; },
  invoke___: function(name, args) { return this[name].apply(this, args); },
  enumerate___: function() {
    var result = [];
    for (var name in this) { result.push(name); }
    return Object.freeze(result);
  },
  fix___: function() {}
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

var OGOP = Object.getOwnProperty;
var OGP = Object.getProperty;
var ODOP = Object.defineProperty;
var OGOPN = Object.getOwnPropertyNames;
var OK = Object.keys;
var OF = Object.freeze;
var OS = Object.seal;
var OP = Object.preventExtensions;
var OPHOP = Object.prototype.hasOwnProperty;
var FPT = Function.prototype.toString;

Object.getOwnProperty = function(obj, name) {
  if (obj.handler___) { return obj.handler___.getOwnProperty(name); }
  return OGOP(obj, name);
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
