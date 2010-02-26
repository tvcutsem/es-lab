/// Copyright (c) 2010 Google Inc. 
/// 
/// Redistribution and use in source and binary forms, with or without modification, are permitted provided
/// that the following conditions are met: 
///    * Redistributions of source code must retain the above copyright notice, this list of conditions and
///      the following disclaimer. 
///    * Redistributions in binary form must reproduce the above copyright notice, this list of conditions and 
///      the following disclaimer in the documentation and/or other materials provided with the distribution.  
///    * Neither the name of Google Inc. nor the names of its contributors may be used to
///      endorse or promote products derived from this software without specific prior written permission.
/// 
/// THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR
/// IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS
/// FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE
/// FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
/// LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
/// INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
/// OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF
/// ADVISED OF THE POSSIBILITY OF SUCH DAMAGE. 
 
ES5Harness.registerTest( {
  id: "handlerthis",
  path: "TestCases/handlerthis.js",

  description: 'this-binding in traps refers to handler',

  test: function testcase() {
    
    var handler = {
    	getOwnPropertyDescriptor: function(name) {
    	  assert('gopd this', this===handler);
    	  return undefined;
    	},
    	getPropertyDescriptor: function(name) {
    	  assert('gpd this', this===handler);
    	  return undefined;
    	},
    	getOwnPropertyNames: function() {
    	  assert('gopn this', this===handler);
    	  return [];
    	},
    	defineProperty: function(name, desc) {
    	  assert('dP this', this===handler);
    	  return {};
    	},
    	'delete': function(name) {
    	  assert('delete this', this===handler);
    	  return true;
    	},
    	fix: function() {
    	  assert('fix this', this===handler);
    	  return undefined; // don't fix this proxy
  	  },
     	has: function(name) {
    	  assert('has this', this===handler);
     	  return false;
     	},
    	hasOwn: function(name) {
    	  assert('hasOwn this', this===handler);
    	  return false;
    	},
    	get: function(receiver, name) {
    	  assert('get this', this===handler);
    	  return undefined;
    	},
    	set: function(receiver, name, val) {
    	  assert('set this', this===handler);
    	  return false;
    	},
    	invoke: function(receiver, name, args) {
    	  assert('invoke this', this===handler);
    	  return undefined;
    	},
    	enumerate: function() {
    	  assert('enumerate this', this===handler);
    	  return [];
    	},
    	enumerateOwn: function() {
    	  assert('enumerateOwn this', this===handler);
    	  return [];
    	}
    };
    
    function triggerTrapsOn(proxy) {
      var result;
      
      result = Object.getOwnPropertyDescriptor(proxy, 'foo');
      assertEq('getOwnPropertyDescriptor result', undefined, result);

      // getPropertyDescriptor
      // FIXME: can't test as long as Object.getPropertyDescriptor is missing  

      // getOwnPropertyNames
      // FIXME: can't test as long as Object.getOwnPropertyNames is missing

      result = Object.defineProperty(proxy, 'foo', {});
      assert('defineProperty result', typeof result === 'object');

      result = delete proxy.foo;
      assertEq('delete result', true, result);

      result = [];
      for (var name in proxy) { result.push(name); }
      assert('enumerate result', result.length === 0);

      result = 'foo' in proxy;
      assertEq('has result', false, result);

      result = ({}).hasOwnProperty.call(proxy, 'foo');
      assertEq('hasOwn result', false, result);

      result = (proxy.foo = 0);
      assertEq('set result', 0, result);

      result = proxy.foo;
      assertEq('get result', undefined, result);

      //  invoke trap no longer exists

      result = Object.keys(proxy);
      assert('enumerateOwn result', result.length === 0);
    }
    
    // test object proxies
    var proxy = Proxy.create(handler);
    triggerTrapsOn(proxy);
    assertEq('fix result', false, Proxy.fix(proxy));
    
    // test function proxies    
    var thisFromCallSite = this;
    funProxy = Proxy.createFunction(handler,
      function callTrap(var_args) {
        assert('this in callTrap is this from callsite',this===thisFromCallSite);
        assert('callTrap args',arguments.length===3);
        return undefined;
      },
      function constructTrap(var_args) {
        assert('this in constructTrap is undefined',this===undefined);
        assert('constructTrap args',arguments.length===3);
        return {};
      });
    
    var result;
    
    // the call below is equivalent to 'proxy.apply(this,[1,2,3])',
    // except that this call would trigger the proxy's "get" trap,
    // which we want to avoid here.
    result = Function.prototype.apply.call(funProxy,this,[1,2,3]);
    assertEq('call result', undefined, result);

    result = new funProxy(1,2,3);
    assert('construct result', typeof result === 'object');

    assertEq('fix result', false, Proxy.fix(funProxy));

    return true;
  },

  precondition: function precond() {
    return typeof Proxy !== "undefined";
  }
});
