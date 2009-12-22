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

// Modified OMeta Startup script based on third_party/ometa/ometa-rhino.js
// @author tomvc
load("third_party/ometa/lib.js")
load("third_party/ometa/ometa-base.js")
load("third_party/ometa/parser.js")
load("third_party/ometa/bs-js-compiler.js")
load("third_party/ometa/bs-ometa-compiler.js")
load("third_party/ometa/bs-ometa-optimizer.js")
load("third_party/ometa/bs-ometa-js-compiler.js")

alert = print;

OMetaLib = {
  translateCode: function(s) {
    var translationError = function(m, i) { alert("Translation error - please tell Alex about this!"); throw fail },
        tree             = BSOMetaJSParser.matchAll(s, "topLevel", undefined, function(m, i) { throw fail.delegated({errorPos: i}) })
    return BSOMetaJSTranslator.match(tree, "trans", undefined, translationError)
  },

  ometa: function(s) { return eval(this.translateCode(s)) },
  
  compile: function(inputFile) {
    print(this.translateCode(read(inputFile)));
  }
}