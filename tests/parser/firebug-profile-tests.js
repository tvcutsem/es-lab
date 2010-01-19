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

// Uses firebug's profiler to profile the parse time of the ES5 parser
if (typeof console === "undefined") {
  this.console = {
    profile: function(title) {
      print("profiling "+title);
    },
    profileEnd: function() {
      print("end profiling");
    },
    log: function(str) {
      print(str)
    },
    time: function(name) {
      print("ignoring timer: "+name);
    },
    timeEnd: function(name) {}
  }
}

// builds a string expression '[0,1,2,3,...,len]'
function buildArrayExpr(len) {
  var a = new Array(len);
  for (var i = 0; i < len; i++) {
    a[i] = i;
  }
  return "["+a.join(",")+"]";
}

// profiles parse time of expression '[0,1,2,3,...,len]'
function profileArrayExpr(len) {
  var arrExp = buildArrayExpr(len);
  console.profile("profileArrayExpr len = "+len);
  var res = parse(arrExp, 'complete', ['Expression']);
  console.profileEnd();
  return res;
}

// times parse of expression '[0,1,2,3,...,len]'
function timeArrayExpr(len) {
  var arrExp = buildArrayExpr(len);
  console.time("ArrayExpr len = "+len);
  var res = parse(arrExp, 'complete', ['Expression']);
  console.timeEnd("ArrayExpr len = "+len);
  return res;
}

function runSeries(min, max, fun) {
  for (var i = min; i < max ; i++) {
    fun(i);
  }
}

function profileArraySeries(min, max) {
  runSeries(min, max, function(i) {
    profileArrayExpr(i);
  });
};

// builds a program string
// function(x,x,x,...,x) {
//  return [x,x,x,...,x];
//}
function buildFunDecl(len) {
  var a = new Array(len);
  for (var i = 0; i < len; i++) {
    a[i] = "x";
  }
  var args = a.join(",");
  var body = "return "+"["+args+"];";
  return "function f("+args+") {" + body + "}";
}

// profiles parse time of program
// function(x,x,x,...,x) {
//  return [x,x,x,...,x];
//}
function profileFunDecl(len) {
  var funDecl = buildFunDecl(len);
  console.profile("profileFunDecl len = "+len);
  res = parse(funDecl, 'Program', []);
  console.profileEnd();
  return res;  
}

// times parse of program
// function(x,x,x,...,x) {
//  return [x,x,x,...,x];
//}
function timeFunDecl(len) {
  var funDecl = buildFunDecl(len);
  console.time("FunDecl len = "+len);
  res = parse(funDecl, 'Program', []);
  console.timeEnd("FunDecl len = "+len);
  return res;  
}

function profileFunDeclSeries(min, max) {
  return runSeries(min, max, function (i) {
    return profileFunDecl(i);
  });
}

function timePunctuators(i) {
  var expr = "(a && b || c && !d) ? (x++, --y) : (a >> b, a <<<= b)";
  console.time("Punctuator try "+i);
  res = parse(expr, 'ExpressionOnly', []);
  console.timeEnd("Punctuator try "+i);
  return res;
}

function profilePunctuators(numRuns) {
  return runSeries(0,numRuns,function (i) {
    return timePunctuators(i);
  });
}

function timeKeywords(i) {
  var stmts = "var x; if (null) { do {} while (true); } else { return a instanceof b; }";
  console.time("Keywords try "+i);
  res = parse(stmts, 'Program', []);
  console.timeEnd("Keywords try "+i);
  return res;
}

function profileKeywords(numRuns) {
  return runSeries(0,numRuns,function (i) {
    return timeKeywords(i);
  });
}

function timeTest() {
  timeArrayExpr(10);
  timeFunDecl(10);
}