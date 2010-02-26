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


// What is the semantics of an operation if the handler does not define a trap method for it?
// The proxy itself will always simply invoke the trap method on the handler.
// If it is missing, it should throw a TypeError.
// Source: http://wiki.ecmascript.org/doku.php?id=harmony:proxies (rev 2/25/10)
ES5Harness.registerTest( {
  id: "missingtrap",
  path: "TestCases/missingtrap.js",

  description: 'triggering a missing handler trap',

  test: function testcase() {
    
    function triggerMissingTrapsOn(proxy) {
      assertThrows('getOwnPropertyDescriptor missing', TypeError, function() {
        Object.getOwnPropertyDescriptor(proxy, 'foo');      
      });

      // getPropertyDescriptor
      // FIXME: can't test as long as Object.getPropertyDescriptor is missing  

      // getOwnPropertyNames
      // FIXME: can't test as long as Object.getOwnPropertyNames is missing

      assertThrows('defineProperty missing', TypeError, function() {
        Object.defineProperty(proxy, 'foo', {});
      });

      assertThrows('delete missing', TypeError, function() {
        delete proxy.foo;
      });

      assertThrows('enumerate missing', TypeError, function() {
        for (var name in proxy) { }
      });

      assertThrows('has missing', TypeError, function() {
        'foo' in proxy;
      });

      assertThrows('hasOwn missing', TypeError, function() {
        ({}).hasOwnProperty.call(proxy, 'foo');
      });

      assertThrows('set missing', TypeError, function() {
        proxy.foo = 0;
      });

      assertThrows('get missing', TypeError, function() {
        proxy.foo;
      });

      //  invoke trap no longer exists

      assertThrows('enumerateOwn missing', TypeError, function() {
        Object.keys(proxy);
      }); 
    }
    
    triggerMissingTrapsOn(Proxy.create({}));
    triggerMissingTrapsOn(Proxy.createFunction({}, function(){}));
    
    return true;
  },

  precondition: function precond() {
    return typeof Proxy !== "undefined";
  }
});
