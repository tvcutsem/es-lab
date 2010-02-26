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
  id: "enumeration",
  path: "TestCases/enumeration.js",

  description: 'side-effects during enumeration on proxies',

  test: function testcase() {
    
    // iterate applies fun to each property in obj,
    // and returns an array of all visited properties
    function iterate(obj, fun) {
      var result = [];
      for (var p in obj) {
        result.push(p);
        fun(p);
      }
      return result;
    }

    // deletion during iteration
    var obj = {a:0,b:1,c:2};
    var objResult = iterate(obj, function(name) {
      delete obj.b;
    });
    
    var proxy = Proxy.create({
      keys: ['a', 'b', 'c'],
      'delete': function(name) {
        var index = ({a:0,b:1,c:2})[name];
        return delete this.keys[name];
      },
      enumerate: function() { return keys; }
    }, Object.prototype);
    var proxyResult = iterate(proxy, function(name) {
      delete proxy.b;
    });
    
    assert('deletion during iteration', sameStructure(objResult, proxyResult));
    
    // TODO: addition during iteration
    
    // TODO: handler changing the array returned by enumerate during the iteration
    
  },

  precondition: function precond() {
    return typeof Proxy !== "undefined";
  }
});
