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
 * The Original Code is a series of unit tests for the
 * prototype implementation of the fixed Harmony Proxies strawman.
 *
 * The Initial Developer of the Original Code is
 * Tom Van Cutsem, Vrije Universiteit Brussel.
 * Portions created by the Initial Developer are Copyright (C) 2011
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *
 */

// once this file is loaded, Proxy.create{Function} is patched to
// support fixed trapping proxies
load('FixedTrappingProxy.js');
load('Handler.js');

function assert(b, msg) {
  print((b ? 'success: ' : 'fail: ') + msg);
}

function assertThrows(message, fn) {
  try {
    fn();
    print('fail: expected exception, but succeeded. Message was: '+message);
  } catch(e) {
    assert(e.message === message, "assertThrows: "+e.message);
  }
}

// the 'main' function
function test() {
  var emulatedProps,
      emulatedProto,
      success,
      brokenProxy,
      result;
  
  try {
    testTrapEvenWhenFrozen();
    testForwardingHandler();
    testStopTrapping();
    
    for (var testName in TESTS) {
      emulatedProps = {};
      emulatedProto = {};
      success = {};
      brokenProxy = createEmulatedObject(emulatedProps, emulatedProto, success);
      print('>>> '+testName);
      TESTS[testName](brokenProxy, emulatedProps, emulatedProto, success);
    }
  } catch (e) {
    print('fail: unexpected exception: '+ e);
  }
}

/**
 * This function returns a proxy that will emulate the properties stored
 * in emulatedProps (a mapping from names to property descriptors).
 * The intent is that the test suite can freely modify the emulatedProps,
 * in order to provoke erroneous behavior on the returned proxy.
 *
 * The proxy will inherit from emulatedProto, also a mapping from
 * property names to property descriptors.
 *
 * success is a mapping from names to booleans. The test suite should
 * use it to indicate what the return value should be for the
 * 'defineProperty', 'set' and 'delete' traps.
 */
function createEmulatedObject(emulatedProps, emulatedProto, success) {
  return Proxy.create({
    getOwnPropertyDescriptor: function(name) {
      return emulatedProps[name];
    },
    getPropertyDescriptor: function(name) {
      var desc = emulatedProps[name];
      if (desc) return desc;
      return emulatedProto[name];
    },
    defineProperty: function(name, desc) {
      emulatedProps[name] = desc;
      return success[name];
    },
    fix: function() { return emulatedProps; },
    delete: function(name) {
      delete emulatedProps[name];
      return success[name];
    },
    getOwnPropertyNames: function() {
      return Object.keys(emulatedProps);
    },
    getPropertyNames: function() {
      return Object.keys(emulatedProps).concat(Object.keys(emulatedProto));
    },
    set: function(rcvr, name) {
      return success[name];
    }
  }, emulatedProto);
}

/**
 * The methods of this object are unit tests that each detect a particular
 * invariant violation.
 */
var TESTS = Object.create(null);

TESTS.testNonConfigurableExists =
  function(brokenProxy, emulatedProps, emulatedProto, success) {
    emulatedProps.x = {value:1,configurable:false};
    var result = Object.getOwnPropertyDescriptor(brokenProxy, 'x');
    assert(result.value === 1 && result.configurable === false,
           'x was observed as non-configurable');
    delete emulatedProps.x;
    assertThrows("cannot report non-configurable property 'x' as non-existent",
      function() { Object.getOwnPropertyDescriptor(brokenProxy, 'x'); });
  };
  
TESTS.testNonConfigurableRedefinition =
  function(brokenProxy, emulatedProps, emulatedProto, success) {
    emulatedProps.x = {value:1,configurable:false};
    var result = Object.getOwnPropertyDescriptor(brokenProxy, 'x');
    assert(result.value === 1 && result.configurable === false,
           'x was observed as non-configurable');
    emulatedProps.x = {value:1,configurable:true}
    assertThrows("can't redefine non-configurable property 'x'",
      function() { Object.getOwnPropertyDescriptor(brokenProxy, 'x'); });
  };
  
TESTS.testInheritedNonConfigurableRedefinition =
  function(brokenProxy, emulatedProps, emulatedProto, success) {
    // FIXME: can't test getPropertyDescriptor invariants until
    // Object.getPropertyDescriptor is defined
  };
  
TESTS.testNonExtensibleReportNoNewProps =
  function(brokenProxy, emulatedProps, emulatedProto, success) {
    emulatedProps.x = {value:1,configurable:false};
    var result = Object.getOwnPropertyDescriptor(brokenProxy, 'x');
    assert(result.value === 1 && result.configurable === false,
           'x was observed as non-configurable');
    Object.preventExtensions(brokenProxy);
    emulatedProps.y = {value:2,configurable:true};
    assertThrows("cannot report a new own property 'y' on a non-extensible object",
      function() { Object.getOwnPropertyDescriptor(brokenProxy, 'y'); });
  };
  
TESTS.testNonExtensibleDefineNoNewProps =
  function(brokenProxy, emulatedProps, emulatedProto, success) {
    emulatedProps.x = {value:1,writable:true,configurable:true};
    Object.preventExtensions(brokenProxy);
    // should still be possible to update 'x'
    success.x = true;
    Object.defineProperty(brokenProxy,'x',{
      value: 2,
      writable: true,
      enumerable: true,
      configurable: true
    });
    var result = Object.getOwnPropertyDescriptor(brokenProxy, 'x');
    assert(result.value === 2, 'x was updated');
    // should not be possible to add a new property 'y'
    assertThrows("cannot successfully add a new property 'y' to a "+
                 "non-extensible object",
      function() {
        success.y = true;
        Object.defineProperty(brokenProxy, 'y', {value:3});
      });
  };
  
TESTS.testNonConfigurableMergeOnFix =
  function(brokenProxy, emulatedProps, emulatedProto, success) {
    emulatedProps.x = {value:1,configurable:false};
    var result = Object.getOwnPropertyDescriptor(brokenProxy, 'x');
    assert(result.value === 1 && result.configurable === false,
           'x was observed as non-configurable');
    emulatedProps.x = {value:1,configurable:true};
    // fixing the proxy will merge all reported properties returned
    // by the fix() trap with existing properties
    assertThrows("can't redefine non-configurable property 'x'",
      function() { Object.preventExtensions(brokenProxy); });
  };
  
TESTS.testNonConfigurableNoDelete =
  function(brokenProxy, emulatedProps, emulatedProto, success) {
    emulatedProps.x = {value:1, configurable:false};
    var result = Object.getOwnPropertyDescriptor(brokenProxy, 'x');
    assert(result.value === 1 && result.configurable === false,
           'x was observed as non-configurable');
    assertThrows("property 'x' is non-configurable and can't be deleted",
      function() {
        success.x = true;
        delete brokenProxy.x;      
      });
  };
  
TESTS.testGOPNCannotListNewProperties =
  function(brokenProxy, emulatedProps, emulatedProto, success) {
    emulatedProps.x = {value:1, configurable:false};
    Object.preventExtensions(brokenProxy);
    emulatedProps.y = {value:2, configurable:true};
    assertThrows("getOwnPropertyNames cannot list a new property "+
                 "'y' on a non-extensible object",
      function() {
        Object.getOwnPropertyNames(brokenProxy);  
      });
  };

TESTS.testNonConfigurableMustBeReportedByHasOwn =
  function(brokenProxy, emulatedProps, emulatedProto, success) {
    emulatedProps.x = {value:1, configurable:false};
    var result = Object.getOwnPropertyDescriptor(brokenProxy, 'x');
    assert(result.value === 1 && result.configurable === false,
           'x was observed as non-configurable');
    delete emulatedProps.x;
    assertThrows("cannot report existing non-configurable own property "+
                 "'x' as a non-existent own property",
      function() {
        Object.prototype.hasOwnProperty.call(brokenProxy, 'x');  
      });
  };
  
TESTS.testNewPropertyCantBeReportedByHasOwn =
  function(brokenProxy, emulatedProps, emulatedProto, success) {
    emulatedProps.x = {value:1, configurable:false};
    Object.preventExtensions(brokenProxy);
    emulatedProps.y = {value:2, configurable:true};
    assertThrows("cannot report a new own property 'y' "+
                 "on a non-extensible object",
      function() {
        Object.prototype.hasOwnProperty.call(brokenProxy, 'y');  
      });
  };

TESTS.testNonConfigurableMustBeReportedByHas =
  function(brokenProxy, emulatedProps, emulatedProto, success) {
    emulatedProps.x = {value:1, configurable:false};
    var result = Object.getOwnPropertyDescriptor(brokenProxy, 'x');
    assert(result.value === 1 && result.configurable === false,
           'x was observed as non-configurable');
    delete emulatedProps.x;
    assertThrows("cannot report existing non-configurable own property "+
                 "'x' as a non-existent property",
      function() {
        'x' in brokenProxy;
      });
  };

TESTS.testNonConfigurableNonWritableHasStableValue =
  function(brokenProxy, emulatedProps, emulatedProto, success) {
    emulatedProps.x = {value:1, writable:false,configurable:false};
    var result = Object.getOwnPropertyDescriptor(brokenProxy, 'x');
    assert(result.value === 1 && result.configurable === false,
           'x was observed as non-configurable');
    emulatedProps.x = {value:2, writable:false,configurable:false};
    assertThrows("can't redefine non-configurable property 'x'",
      function() {
        brokenProxy.x;
      });
  };
  
TESTS.testNonConfigurableNonWritableCantBeAssigned =
  function(brokenProxy, emulatedProps, emulatedProto, success) {
    emulatedProps.x = {value:1, writable:false,configurable:false};
    var result = Object.getOwnPropertyDescriptor(brokenProxy, 'x');
    assert(result.value === 1 && result.configurable === false,
           'x was observed as non-configurable');
    assertThrows("can't redefine non-configurable property 'x'",
      function() {
        success.x = true;
        brokenProxy.x = 2;
      });
  };
  
TESTS.testKeysCannotListNewProperties =
  function(brokenProxy, emulatedProps, emulatedProto, success) {
    emulatedProps.x = {value:1, enumerable:true, configurable:false};
    Object.preventExtensions(brokenProxy);
    emulatedProps.y = {value:2, enumerable:true, configurable:true};
    assertThrows("keys trap cannot list a new property "+
                 "'y' on a non-extensible object",
      function() {
        Object.keys(brokenProxy);  
      });
  };

/**
 * Test that a proxy can keep on trapping even after
 * it has been frozen.
 */
function testTrapEvenWhenFrozen() {
  var target = {};
  var forwarder = new Proxy.Handler(target);
  var proxy = Proxy.create(forwarder);
  assert(proxy.x === undefined, 'proxy.x === undefined');

  Object.defineProperty(proxy,'x',
    { value:1,
      configurable:false });
  assert(target.x === 1, 'target.x === 1');
  assert(proxy.x === 1, 'proxy.x === 1');

  assertThrows("can't redefine non-configurable property 'x'",
    function() {
      Object.defineProperty(proxy,'x',{configurable:false,value:2});
    });

  assert(proxy.x === 1, "proxy.x === 1");
  
  forwarder.fix = function() { return {x: {value:1} }; }
  Object.freeze(proxy);
  assert(Object.isFrozen(proxy), "proxy is frozen");
  
  var wasIntercepted = false;
  forwarder.get = function(rcvr,name) {
    wasIntercepted = true;
    return target[name];
  };
  assert(proxy.x === 1, "proxy.x === 1 after freeze");
  assert(wasIntercepted, "proxy.x was intercepted even after freeze");
}

/**
 * This function tests whether wrapping a forwarding handler
 * in a FixedHandler does not raise any unexpected TypeErrors.
 */
function testForwardingHandler() {
  var result;
  
  var proto = { inherited: 3 };
  var target = Object.create(proto);
  Object.defineProperty(target, 'wcdp', {
    // writable, configurable data property (wcdp)
    value: 1,
    writable: true,
    enumerable: true,
    configurable: true
  });
  Object.defineProperty(target, 'nwncdp', {
    // non-writable, non-configurable data property (nwncdp)
    value: 2,
    writable: false,
    enumerable: false,
    configurable: false
  });
  
  var proxy = Proxy.create(
    new Proxy.Handler(target), proto);

  
  result = Object.getOwnPropertyDescriptor(proxy, 'non-existent-prop');
  assert(result === undefined,
         'FWD: non-existent prop is undefined');

  result = Object.getOwnPropertyDescriptor(proxy, 'wcdp');
  assert(result !== undefined, 'FWD: wcdp is not undefined');
  assert(result.value === 1,
         'FWD: wcdp value is correct');
  result = Object.getOwnPropertyDescriptor(proxy, 'nwncdp');
  assert(result !== undefined, 'FWD: nwncdp is not undefined');
  assert(result.value === 2,
         'FWD: nwncdp value is correct');
  // now, the nwncdp value should be stored in the fixed props,
  // try accessing nwncdp again
  result = Object.getOwnPropertyDescriptor(proxy, 'nwncdp');
  assert(result !== undefined, 'FWD: nwncdp is still not undefined');
  assert(result.value === 2,
         'FWD: nwncdp value is still correct');

  // getPropertyDescriptor
  // FIXME: can't test as long as Object.getPropertyDescriptor is missing  

  result = Object.getOwnPropertyNames(proxy);
  assert(result.length === 2,
         'FWD: getOwnPropertyNames returned correct #names');

  // make a compatible change to wcdp by making it non-enumerable
  Object.defineProperty(proxy, 'wcdp',
    {value:1,writable:true,enumerable:false,configurable:true});
  result = Object.getOwnPropertyDescriptor(proxy, 'wcdp');
  assert(result.enumerable === false,
         'FWD: wcdp enumerable is correct');
  
  // define a new writable, non-configurable data property
  Object.defineProperty(proxy, 'wncdp',
    {value:3,
     writable:true,
     enumerable:true,
     configurable:false});
  result = Object.getOwnPropertyDescriptor(proxy, 'wncdp');
  assert(result.configurable === false,
         'FWD: wncdp configurable is correct');
  
  // delete wcdp
  result = delete proxy.wcdp;
  assert(result === true,
         'FWD: wcdp deleted');
  result = Object.getOwnPropertyDescriptor(proxy, 'wcdp');
  assert(result === undefined,
         'FWD: wcdp is non-existent');      
         
  result = [];
  // enumerates wncdp, inherited
  for (var name in proxy) { result.push(name); }
  assert(result.length === 2,
         'FWD: enumerate returned correct #names');
  
  result = 'non-existent' in proxy;
  assert(result === false,
         'FWD: ! non-existent in proxy');
  result = 'nwncdp' in proxy;
  assert(result === true,
         'FWD: nwncdp in proxy');
  result = 'inherited' in proxy;
  assert(result === true,
         'FWD: inherited in proxy');
                
  result = ({}).hasOwnProperty.call(proxy, 'inherited');
  assert(result === false,
         'FWD: inherited is not an own property of proxy');
  result = ({}).hasOwnProperty.call(proxy, 'nwncdp');
  assert(result === true,
         'FWD: nwncdp is an own property of proxy');
 
  assert(proxy.nwncdp === 2,
         'FWD: proxy.nwncdp has correct value');
  try { proxy.nwncdp = 42; } catch(e) {} // may throw in strict-mode
  assert(proxy.nwncdp === 2,
         'FWD: proxy.nwncdp still has correct value');
  
  result = Object.keys(proxy); // wncdp 
  assert(result.length === 1,
         'FWD: keys returned correct #names');
}

function testStopTrapping() {
  var proxy = Proxy.create({
    getOwnPropertyDescriptor: function(name) {
      return { value: 42, configurable: true }
    },
    stopTrapping: function() {
      return { x: {value:1, configurable: false} };
    }
  });
  
  // while proxy is trapping, it knows all properties:
  assert(42 === Object.getOwnPropertyDescriptor(proxy, "x").value,
         'stopTrapping: proxy knows x');
  assert(42 === Object.getOwnPropertyDescriptor(proxy, "y").value,
         'stopTrapping: proxy knows y');

  // stop trapping
  assert(proxy === Object.stopTrapping(proxy),
         'stopTrapping returns the proxy');
  
  // now, proxy only knows 'x'
  var desc = Object.getOwnPropertyDescriptor(proxy, "x");
  assert(1 === desc.value && false === desc.configurable,
         'stopTrapping: proxy knows a non-configurable x');
  assert(undefined === Object.getOwnPropertyDescriptor(proxy, "y"),
         'stopTrapping: proxy no longer knows y');
  
  // stopTrapping is a no-op for objects
  var obj = {};
  assert(obj === Object.stopTrapping(obj),
         'stopTrapping is a no-op for non-proxy objects');
}

if (typeof window === "undefined") {
  test();
}