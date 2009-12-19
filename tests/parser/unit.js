// Copyright (C) 2009 Google Inc.
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

// @author tomvc

// minimal unit testing framework with same API as FireUnit 

// if verbose set to true, print both passed and failed tests
// if verbose set to false, print only failed tests
this.makeUnitTest = function(name, verbose) {
  var passed = 0;
  var total = 0;
  
  function test(bool, message, failmsg) {
    total++;
    var msg = ((bool) ? (passed++, "pass: ") : "fail: ") + message
                + (failmsg ? " ("+failmsg+")" : "");
    if (verbose || !bool) { print(msg) };
  };
  
  return {
    ok : function(bool, message) {
      test(bool, message); 
    },
    compare: function(expected, actual, message) {
      test(expected === actual, message, "expected: "+expected+", got: "+actual);
    },
    reCompare: function(regexp, actual, message) {
      test(typeof actual === "string" && actual.match(regexp)!==undefined,
           message,
           "string "+actual+" did not match "+regexp);
    },
    testDone : function() {
      print("["+name+" done. Passed: "+passed+" Failed: "+(total-passed)
            +" Total: "+total+"]");
    }
  };
};