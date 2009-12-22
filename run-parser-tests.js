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

load("load-ometa.js")
load("src/parser/es5parser.js")
load("third_party/json2.js");
load("tests/parser/unit.js");
load("tests/parser/parsertests.js");

// instead of loading the entire Prototype library...
Array.prototype.each = function(fun) {
  for (var i = 0; i < this.length; i++) {
    fun(this[i]);
  };
  return undefined;
};

// switch second argument to 'true' if you want to see passing tests as well as failing tests
var lextest = makeUnitTest("Lexer", false);
this.unit = lextest;
this.lexerTestSuite();

var parsetest = makeUnitTest("Parser", false);
this.unit = parsetest;
this.parserTestSuite();
