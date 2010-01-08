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

// The unit tests assume a unit testing framework with the following API
// (based on FireUnit):
/*
var unit = {
  ok : function(boolean, message) { ... }
  compare: function(expected, actual, message) { ... }
  reCompare: function(regexp, actual, message) { ... }
  testDone : function() { ... }
}
*/

function report(msg) {
  $('msgpane').innerHTML = $('msgpane').innerHTML + "<br>" + msg;
}
	
function lex(input, rule, args) {
  args = args || [];
  return LexicalGrammar.matchAll(input, rule, args, function(parser, idx) {
	if (!idx || idx < 0) idx = input.length - 1;
	var spaces = new Array(input.length);
	spaces[idx] = "^";
	return "failed to match: '" +input[idx] + "' in " +
	  input.slice(0,idx) + "_" + input[idx] + "_" + input.slice(idx+1);
  });
}

function parse(input, rule, args) {
  args = args || [];
  return ES5Parser.matchAll(input, rule, args, function(parser, idx) {
	if (!idx || idx < 0) idx = input.length - 1;
	var spaces = new Array(input.length);
	spaces[idx] = "^";
	return "failed to match: '" +input[idx] + "' in " +
	  input.slice(0,idx) + "_" + input[idx] + "_" + input.slice(idx+1);
  });
}

function ensureNoMatch(input, rule, args) {
  unit.reCompare(/^failed to match:.*/,
		   parse(input,rule,args), "Input should not match: "+input);
}

function lexerTestSuite() {
  function checkLiteral(type, value, input) {
	  var token = lex(input, 'Literal', []);
	  unit.ok(typeof(token) == "object", "parsing '"+input+"': "+token);
	  unit.compare(type, token.type, "token type for '"+input+"' is "+type);
	  unit.compare(value, token.value, "token value for '"+input+"' is "+value);
  };
  
  function checkIdentifier(expected, input) {
	  var id = lex(input, 'Identifier', []);
	  unit.compare(expected, id, "identifier name for '"+input+"' is "+id);
  };
  
  function checkKeyword(input) {
	  var output = lex(input, 'scanKeyword', []);
	  unit.compare(input, output, "keyword: '"+input+"'");
  };
  
  function checkPunct(input) {
	  var output = lex(input, 'scanPunctuator', []);
	  unit.compare(input, output, "punctuator: '"+input+"'");
  };
  
  function ensureNoMatch(input, rule, args) {
	  unit.reCompare(/^failed to match:.*/,
				   lex(input,rule,args), "Input should not match: "+input);
  };
		  
  unit.compare("foo!@#^&$1234", lex('//foo!@#^&$1234\nbar','Comment') , "single-line comment" );
  unit.compare(" abcd!@#@$* { } && null", lex('/* abcd!@#@$* { } && null*/', 'Comment'), "multi-line comment");
  unit.compare("foo\nbar", lex('/*foo\nbar*/', 'Comment'), "multi-line comment with newlines");
  unit.compare("x*x", lex('/*x*x*/', 'Comment'), "multi-line comment with *");
			  
  checkIdentifier("x", "x");
  checkIdentifier("_x", "_x");
  checkIdentifier("xyz", "xyz");
  checkIdentifier("$x", "$x");
  checkIdentifier("x$", "x$");
  checkIdentifier("_", "_");
  checkIdentifier("x5", "x5");	  
  checkIdentifier("x_y", "x_y");	  
  checkIdentifier("x", "x+5");	  
  checkIdentifier("x", "x y");	  
  checkIdentifier("xyz123", "xyz123");	  
  checkIdentifier("x1y1z1", "x1y1z1");	  
  
  ensureNoMatch("while",'Identifier',[]);
  checkKeyword("while");
  checkKeyword("class");
  unit.compare("class", lex("class", 'FutureReservedWord',[true]),
			   "class keyword in strict mode");
  unit.compare("implements", lex("implements", 'FutureReservedWord', [true]),
			   "implements keyword in strict mode");
  ensureNoMatch("implements",'FutureReservedWord',[false]);
  
  checkPunct("(");
  checkPunct("!");
  checkPunct("-");
  checkPunct("/");
  ensureNoMatch("/",'InputElementRegExp',[]);
  checkPunct("++");
  
  checkLiteral("number", 5, "5");
  checkLiteral("number", 5.5, "5.5");
  checkLiteral("number", 0, "0");
  checkLiteral("number", 0.0, "0.0");
  checkLiteral("number", 0.001, "0.001");
  checkLiteral("number", 1.e2, "1.e2");
  checkLiteral("number", 1.e-2, "1.e-2");
  checkLiteral("number", 1.E2, "1.E2");
  checkLiteral("number", 1.E-2, "1.E-2");
  checkLiteral("number", .5, ".5");
  checkLiteral("number", .5e3, ".5e3");
  checkLiteral("number", .5e-3, ".5e-3");
  checkLiteral("number", 0.5e3, "0.5e3");	  
  checkLiteral("number", 55, "55");	  
  checkLiteral("number", 123, "123");	  
  checkLiteral("number", 55.55, "55.55");	  
  checkLiteral("number", 55.55e10, "55.55e10");
  checkLiteral("number", 123.456, "123.456");
  checkLiteral("number", 12, "12 3");
  checkLiteral("number", 1, "1+e");
  checkLiteral("number", 1, "1a");	  
  checkLiteral("number", 0x01, "0x01");	  
  checkLiteral("number", 0XCAFE, "0XCAFE");	  
  checkLiteral("number", 0x12345678, "0x12345678");	  
  checkLiteral("number", 0x1234ABCD, "0x1234ABCD");	  
  checkLiteral("number", 0x0001, "0x0001"); 

  ensureNoMatch("0x", 'HexIntegerLiteral' , []);
  
  // Note: ES5 no longer supports octal mode by default
  // so numeric literals beginning with leading 0's are not octal numbers!
  checkLiteral("number", 0, "05");
  
  checkLiteral("string", "foo", "\"foo\"");
  checkLiteral("string", "foo", "\'foo\'");
  checkLiteral("string", "x", "\"x\"");
  checkLiteral("string", "", "\'\'");
  checkLiteral("string", "foo\tbar", "\"foo\\tbar\"");
  checkLiteral("string", "!@#$%^&*()_+{}[]", "\"!@#$%^&*()_+{}[]\"");
  checkLiteral("string", "/*test*/", "\"/*test*/\"");
  checkLiteral("string", "//test", "\"//test\"");
  checkLiteral("string", "\\", "\"\\\\\"");
  checkLiteral("string", "\u0001", "\"\\u0001\"");
  checkLiteral("string", "\uFEFF", "\"\\uFEFF\"");
  checkLiteral("string", "\u10002", "\"\\u10002\"");
  checkLiteral("string", "\x55", "\"\\x55\"");
  checkLiteral("string", "\x55a", "\"\\x55a\"");
  checkLiteral("string", "a\\nb", "\"a\\\\nb\"");

  checkLiteral("boolean", true, "true");
  checkLiteral("boolean", false, "false");
  
  checkLiteral("null", null, "null", 'Literal');
  
  (function () {
	var input = "/abc[a-z]*def/g";
	var token = lex(input, 'RegularExpressionLiteral', []);
	unit.ok(typeof(token) == "object", "parsing '"+input+"': "+token);
	unit.compare("regexp", token.type, "token type for '"+input+"' is regexp");
	unit.compare("abc[a-z]*def", token.value.body, "regexp body for '"+input+"'");
	unit.compare("g", token.value.flags, "regexp flags for '"+input+"'");
  })();

  unit.testDone();
};

// walks two asts and checks whether they are equal
// checks are performed via the 'unit' object
// @returns undefined
function compareAsts(expected, actual, test) {
    unit.compare(expected.nodeType(), actual.nodeType(), test+": type names match");
    compareAttributes(expected.attributes(), actual.attributes(), test);
    var expectedChildren = expected.children();
    var actualChildren = actual.children();
    if (expectedChildren.length === actualChildren.length) {
      for (var i = 0; i < expectedChildren.length; i++) {
        compareAsts(expectedChildren[i], actualChildren[i], test);
      }
    } else {
      // this test will signal the failure
      unit.compare(expectedChildren.length, actualChildren.length, test+": !== # of children ");
    }
}
  
// semantics is that actual contains at minimum the properties of expected
// @returns undefined
function compareAttributes(expected, actual, test) {
    for (var attrName in expected) {
      if (expected.hasOwnProperty(attrName)) {
        if (actual.hasOwnProperty(attrName)) {
          unit.compare(expected[attrName], actual[attrName], test+": matching attribute "+attrName);
        } else {
          unit.ok(false, test+": missing attribute "+attrName);
        }
      }
    }
}
  
function testRule(source, rule, args, jsonAst) {
    var expectedAst = toAst(jsonAst);
    var ast = parse(source, rule, args);
    if (typeof ast == "string")
      return unit.ok(false, ast); // ast contains error message
    compareAsts(expectedAst, ast, source); 
}
  
function toAst(jsonAst) {
  if (jsonAst.length < 2) {
    return mixinASTMethods([ jsonAst[0] ]);
  } else {
    var children = new Array(jsonAst.length - 2);
    for (var i = 0; i < children.length; i++) {
      children[i] = toAst(jsonAst[i+2]);
    }
    return mixinASTMethods([jsonAst[0], jsonAst[1]].concat(children));
  }
}

function testExpression(source, ast) {
  testRule(source, 'complete', ['Expression'], ast);
}
function testStatement(source, ast) {
  testRule(source, 'complete', ['Statement'], ast);
}
function testSourceElement(source, ast) {
  testRule(source, 'complete', ['SourceElement'], ast);
}
function testProgram(source, ast) {
  testRule(source, 'Program', [], ast);
}

function Expr(str) { return parse(str,'Expression',[]); }
function Stmt(str) { return parse(str,'Statement',[]); }
function SrcE(str) { return parse(str,'SourceElement',[]); }

function parserTestSuite() {
  
  // This
  testExpression("this", [ "ThisExpr", {} ]);

  // Identifiers
  testExpression("x", [ "IdExpr", { name : "x" } ]);
  
  // Literals
  testExpression("10",    [ "LiteralExpr", { type: "number",  value: 10 } ]);
  testExpression("'foo'", [ "LiteralExpr", { type: "string",  value: "foo" } ]);
  testExpression('"foo"', [ "LiteralExpr", { type: "string",  value: "foo" } ]);
  testExpression("true",  [ "LiteralExpr", { type: "boolean", value: true } ]);
  testExpression("false", [ "LiteralExpr", { type: "boolean", value: false } ]);
  testExpression("null",  [ "LiteralExpr", { type: "null",    value: null } ]);
  
  // Regular Expression 'literals'
  testExpression("/foo(.*)/g", [ "RegExpExpr", { body: "foo(.*)", flags: "g" } ]);

  // Array 'Literals'
  testExpression("[]", [ "ArrayExpr", {} ]);
  testExpression("[   ]", [ "ArrayExpr", {} ]);
  testExpression("[1]", [ "ArrayExpr", {}, Expr("1") ]);
  testExpression("[1,2]", [ "ArrayExpr", {}, Expr("1"), Expr("2") ]);
  testExpression("[1,2,,]", [ "ArrayExpr", {}, Expr("1"), Expr("2"), ["Empty"] ]);
  testExpression("[1,2,3]", [ "ArrayExpr", {}, Expr("1"), Expr("2"), Expr("3") ]);
  testExpression("[1,2,3,,,]", [ "ArrayExpr", {}, Expr("1"), Expr("2"), Expr("3"),
                                                  ["Empty"],["Empty"] ]);

  // Object 'Literals'
  testExpression("{}", [ "ObjectExpr", {} ]);
  testExpression("{x:5}", [ "ObjectExpr", {},
                            ["DataProp", { name: "x" }, Expr("5") ] ]);
  testExpression("{x:5,y:6}", [ "ObjectExpr", {},
                                ["DataProp", { name: "x" }, Expr("5") ],
                                ["DataProp", { name: "y" }, Expr("6") ] ]);
  testExpression("{x:5,}", [ "ObjectExpr", {},
                             ["DataProp", { name: "x" }, Expr("5") ] ]);
  
  testExpression("{ get x() {42;} }", ["ObjectExpr", {},
                   [ "GetterProp", {name:"x"},
                     ["FunctionExpr", {},
                        ["Empty"],
                        ["ParamDecl",{}],
                        Stmt("42;") ] ] ]);
  testExpression("{ set y(a) {1;} }", ["ObjectExpr", {},
                   [ "SetterProp", {name:"y"},
                     ["FunctionExpr", {},
                        ["Empty"],
                        ["ParamDecl",{},["IdPatt", {name:"a"}]],
                        Stmt("1;") ] ] ]);
  
  // MemberExpressions
  testExpression("o.m", [ "MemberExpr", {},
                          [ "IdExpr", {name:"o"} ],
                          [ "LiteralExpr",{type: "string", value: "m"} ] ]);
  testExpression("o['m']", [ "MemberExpr", {},
                             [ "IdExpr", {name:"o"} ],
                             [ "LiteralExpr",{type: "string", value: "m"} ] ]);
  testExpression("o['n']['m']", [ "MemberExpr", {},
                                  [ "MemberExpr", {}, [ "IdExpr", {name:"o"} ],
                                                      [ "LiteralExpr",{type:"string",value: "n"}]],
                                  [ "LiteralExpr",{type: "string", value: "m"} ] ]);
  testExpression("o.n.m", [ "MemberExpr", {},
                                  [ "MemberExpr", {}, [ "IdExpr", {name:"o"} ],
                                                      [ "LiteralExpr",{type:"string",value: "n"}]],
                                  [ "LiteralExpr",{type:"string", value: "m"} ] ]);	  

  // CallExpressions and InvokeExpressions
  testExpression("f()", [ "CallExpr",{},["IdExpr",{name:"f"}] ]);
  testExpression("f(x)", [ "CallExpr",{},["IdExpr",{name:"f"}], Expr("x") ]);
  testExpression("f(x,y)", [ "CallExpr",{},["IdExpr",{name:"f"}], Expr("x"), Expr("y") ]);
  testExpression("o.m()", [ "InvokeExpr",{},["IdExpr",{name:"o"}], Expr("'m'") ]);
  testExpression("o['m']()", [ "InvokeExpr",{},["IdExpr",{name:"o"}], Expr("'m'") ]);
  testExpression("o.m(x)", [ "InvokeExpr",{},["IdExpr",{name:"o"}], Expr("'m'"), Expr("x") ]);
  testExpression("o['m'](x)", [ "InvokeExpr",{},["IdExpr",{name:"o"}], Expr("'m'"), Expr("x") ]);
  testExpression("o.m(x,y)", [ "InvokeExpr",{},["IdExpr",{name:"o"}],
                               Expr("'m'"), Expr("x"), Expr("y") ]);
  testExpression("o['m'](x,y)", [ "InvokeExpr",{},["IdExpr",{name:"o"}],
                                  Expr("'m'"), Expr("x"), Expr("y") ]);

  testExpression("f(x)(y)", [ "CallExpr", {},
                             [ "CallExpr",{}, Expr("f"), Expr("x") ],
                             Expr("y") ]);

  // EvalExpressions (identify possible uses of a 'direct call' to eval)
  testExpression("eval('x')", ["EvalExpr", {}, Expr("'x'") ]);
  testExpression("(eval)('x')", ["EvalExpr", {}, Expr("'x'") ]);
  testExpression("(1,eval)('x')",
                 ["CallExpr", {},
                   ["BinaryExpr", {op:","}, Expr("1"), Expr("eval") ],
                   Expr("'x'") ]);

  // NewExpressions
  testExpression("new f()", [ "NewExpr", {}, ["IdExpr", { name: "f" } ] ]);
  testExpression("new o", [ "NewExpr", {}, Expr("o") ]);
  testExpression("new o.m", [ "NewExpr", {}, [ "MemberExpr", {}, Expr("o"), Expr("'m'") ] ]);
  testExpression("new o.m(x)", [ "NewExpr", {},
                                 [ "MemberExpr", {}, Expr("o"), Expr("'m'") ], Expr("x") ]);
  testExpression("new o.m(x,y)", [ "NewExpr", {},
                                   [ "MemberExpr", {}, Expr("o"), Expr("'m'") ],
                                   Expr("x"), Expr("y") ]);

  // pre- and postfix increment and decrement (CountExpr)
  testExpression("++x", [ "CountExpr", { isPrefix: true,  op: "++" }, Expr("x") ]);
  testExpression("x++", [ "CountExpr", { isPrefix: false, op: "++" }, Expr("x") ]);
  testExpression("--x", [ "CountExpr", { isPrefix: true,  op: "--" }, Expr("x") ]);
  testExpression("x--", [ "CountExpr", { isPrefix: false, op: "--" }, Expr("x") ]);

  // spaces before ++ allowed
  testExpression("x  ++", [ "CountExpr", { isPrefix: false, op: "++" }, Expr("x") ]);
  // comments before ++ allowed
  testExpression("x /* comment*/ ++", [ "CountExpr", { isPrefix: false, op: "++" }, Expr("x") ]);
  // no newlines before ++ allowed
  ensureNoMatch("x\n++", 'complete', ['Expression']);
  
  // delete
  testExpression("delete x", [ "DeleteExpr",{           }, Expr("x") ]);
  
  // Unary Expressions
  testExpression("void x",   [ "UnaryExpr", {op:"void"  }, Expr("x") ]);
  testExpression("+ x",      [ "UnaryExpr", {op:"+"     }, Expr("x") ]);
  testExpression("-x",       [ "UnaryExpr", {op:"-"     }, Expr("x") ]);
  testExpression("~x",       [ "UnaryExpr", {op:"~"     }, Expr("x") ]);
  testExpression("!x",       [ "UnaryExpr", {op:"!"     }, Expr("x") ]);

  // precedence of postfix and unary operators
  testExpression("new Date++", // (new Date)++
                 [ "CountExpr", {isPrefix:false,op:"++"}, [ "NewExpr", {}, Expr("Date") ]]);
  testExpression("+x++", // +(x++)
                 [ "UnaryExpr", {op:"+"}, ["CountExpr", {isPrefix:false,op:"++"}, Expr("x") ] ]);

  // typeof
  testExpression("typeof x", [ "TypeofExpr",{           }, Expr("x") ]);

  // Expression Expressions
  testExpression("1 * 2",  [ "BinaryExpr", {op: "*"  }, Expr("1"), Expr("2") ]);
  testExpression("1 / 2",  [ "BinaryExpr", {op: "/"  }, Expr("1"), Expr("2") ]);
  testExpression("1 % 2",  [ "BinaryExpr", {op: "%"  }, Expr("1"), Expr("2") ]);
  testExpression("1 + 2",  [ "BinaryExpr", {op: "+"  }, Expr("1"), Expr("2") ]);
  testExpression("1 - 2",  [ "BinaryExpr", {op: "-"  }, Expr("1"), Expr("2") ]);
  testExpression("1 << 2", [ "BinaryExpr", {op: "<<" }, Expr("1"), Expr("2") ]);
  testExpression("1 >>> 2",[ "BinaryExpr", {op: ">>>"}, Expr("1"), Expr("2") ]);
  testExpression("1 >> 2", [ "BinaryExpr", {op: ">>" }, Expr("1"), Expr("2") ]);

  // test precedence
  testExpression("1 * 2 + 3", // * precedes +
                 [ "BinaryExpr", {op:"+"}, Expr("1 * 2"), Expr("3") ]);
  testExpression("(1 + 2) * 3", // now + precedes *
			     [ "BinaryExpr", {op:"*"}, Expr("1 + 2"), Expr("3") ]);
  testExpression("1 * (2 + 3)", // now + precedes *
				 [ "BinaryExpr", {op:"*"}, Expr("1"), Expr("2 + 3") ]);			

  testExpression("x < y",  [ "BinaryExpr", {op: "<"  }, Expr("x"), Expr("y") ]);
  testExpression("x > y",  [ "BinaryExpr", {op: ">"  }, Expr("x"), Expr("y") ]);
  testExpression("x <= y", [ "BinaryExpr", {op: "<=" }, Expr("x"), Expr("y") ]);
  testExpression("x >= y", [ "BinaryExpr", {op: ">=" }, Expr("x"), Expr("y") ]);
  testExpression("x instanceof y", [ "BinaryExpr", {op: "instanceof" }, Expr("x"), Expr("y") ]);
  testExpression("x in y", [ "BinaryExpr", {op: "in" }, Expr("x"), Expr("y") ]);

  testExpression("x & y", [ "BinaryExpr", {op: "&" }, Expr("x"), Expr("y") ]);
  testExpression("x ^ y", [ "BinaryExpr", {op: "^" }, Expr("x"), Expr("y") ]);
  testExpression("x | y", [ "BinaryExpr", {op: "|" }, Expr("x"), Expr("y") ]);

  // test precedence
  testExpression("x + y < z", // + precedes <
                 [ "BinaryExpr", {op:"<"}, Expr("x + y"), Expr("z") ]);

  testExpression("x < y + z", // + precedes <
                 [ "BinaryExpr", {op:"<"}, Expr("x"), Expr("y + z") ]);

  // test left-associativity
  testExpression("x + y + z", [ "BinaryExpr", {op:"+"},
                                [ "BinaryExpr", {op:"+"}, Expr("x"), Expr("y") ],
                                Expr("z") ]);

  // test precedence
  testExpression("x & y | z", // & precedes |
                 [ "BinaryExpr", {op: "|" }, Expr("x & y"), Expr("z") ]);

  // logical operators
  testExpression("x && y", [ "LogicalAndExpr", {}, Expr("x"), Expr("y") ]);
  testExpression("x || y", [ "LogicalOrExpr", {}, Expr("x"), Expr("y") ]);

  // test precedence
  testExpression("x && y || z", // && precedes ||
                 [ "LogicalOrExpr", {}, Expr("x && y"), Expr("z") ]);
  testExpression("x || y && z", // && precedes ||
			     [ "LogicalOrExpr", {}, Expr("x"), Expr("y && z") ]);

  // conditional operator
  testExpression("x < y ? z : w",
                 [ "ConditionalExpr", {}, Expr("x < y"), Expr("z"), Expr("w") ]);
 
  // assignment
  testExpression("x >>>= y", [ "AssignExpr", {op: ">>>="}, Expr("x"), Expr("y") ]);
  testExpression("x <<= y",  [ "AssignExpr", {op: "<<=" }, Expr("x"), Expr("y") ]);
  testExpression("x = y",    [ "AssignExpr", {op: "="   }, Expr("x"), Expr("y") ]);
  testExpression("x += y",   [ "AssignExpr", {op: "+="  }, Expr("x"), Expr("y") ]);
  
  testExpression("x /= y",   [ "AssignExpr", {op: "/="  }, Expr("x"), Expr("y") ]);

  // comma operator
  testExpression("x , y", [ "BinaryExpr", {op: ","}, Expr("x"), Expr("y") ]);

  // statements
  
  // blocks
  testStatement("{}", ["BlockStmt", {}]);
  testStatement("{x;}", ["BlockStmt", {}, Stmt("x;") ]);
  testStatement("{x;y;}", ["BlockStmt", {}, Stmt("x;"), Stmt("y;") ]);

  // variable declarations
  testStatement("var x;", [ "VarDecl", {}, ["IdPatt", {name: "x"}] ]);
  testStatement("var x,y;", [ "VarDecl", {}, ["IdPatt", {name: "x"}], ["IdPatt", {name:"y"}] ]);
  testStatement("var x=1,y=2;", [ "VarDecl", {}, ["InitPatt", {}, ["IdPatt", {name: "x"}], Expr("1") ],
         									     ["InitPatt", {}, ["IdPatt", {name: "y"}], Expr("2") ] ]);
  testStatement("var x,y=2;", [ "VarDecl", {}, ["IdPatt", {name: "x"} ],
											   ["InitPatt", {}, ["IdPatt", {name: "y"}], Expr("2") ] ]);
  ensureNoMatch("var;", 'Statement', []);

  // empty statement
  testStatement(";", ["EmptyStmt", {}]);
  testStatement("\n;", ["EmptyStmt", {}]);
  
  // expression statements
  testStatement("x;", [ "IdExpr", {name:"x"} ]);
  testStatement("5;", [ "LiteralExpr", {type:"number", value: 5}]);
  testStatement("1 + 2;", [ "BinaryExpr", {op:"+"}, Expr("1"), Expr("2")]);

  // if statements
  testStatement("if (c) x; else y;", [ "IfStmt",{}, Expr("c"), Stmt("x;"), Stmt("y;") ]);
  testStatement("if (c) x;", [ "IfStmt",{}, Expr("c"), Stmt("x;"), ["EmptyStmt", {}] ]);
  testStatement("if (c) {} else {}", [ "IfStmt",{}, Expr("c"), Stmt("{}"), Stmt("{}") ]);
  testStatement("if (c1) if (c2) s1; else s2;", [ "IfStmt",{}, Expr("c1"),
                                                 [ "IfStmt", {}, Expr("c2"), Stmt("s1"), Stmt("s2") ],
                                                 [ "EmptyStmt", {}] ]);
  
  // do-while statement
  testStatement("do s; while (e);", [ "DoWhileStmt", {}, Stmt("s;"), Expr("e") ]);
 
  // while statement
  testStatement("while (e) s;", [ "WhileStmt",{}, Expr("e"), Stmt("s;") ]);
  
  // for statements
  testStatement("for (;;) ;", [ "ForStmt", {}, ["Empty"], ["Empty"], ["Empty"],
                              ["EmptyStmt",{}] ]);
  testStatement("for (;c;x++) x;", [ "ForStmt", {}, ["Empty"], Expr("c"), Expr("x++"),
                                   Stmt("x;") ]);
  testStatement("for (i;i<10;i++) {}", [ "ForStmt", {}, Expr("i"), Expr("i<10"), Expr("i++"),
                                       Stmt("{}") ]);
  testStatement("for (var i=0;i<len;i++) {}",
                [ "ForStmt", {}, [ "VarDecl",{}, ["InitPatt", {}, ["IdPatt",{name:"i"}], Expr("0")] ],
                                 Expr("i<len"), Expr("i++"), Stmt("{}") ]);
  testStatement("for (var i=0,j=0;;) {}",
                [ "ForStmt", {}, [ "VarDecl",{}, ["InitPatt", {}, ["IdPatt",{name:"i"}], Expr("0")],
                                                 ["InitPatt", {}, ["IdPatt",{name:"j"}], Expr("0")] ],
                                 ["Empty"] , ["Empty"], Stmt("{}") ]);
  ensureNoMatch("for (x in b; c; u) {}", 'Statement', []); // 'in' not allowed in initialization

  // TODO: problem, parser does not accept nested 'in' expressions
  //testStatement("for ((x in b); c; u) {}", [ "ForStmt", {}, Expr("(x in b)"), Expr("c"), Expr("u"),
  //                                       Stmt("{}") ]);

  // for-in statement without variable declaration
  testStatement("for (x in a) ;", [ "ForInStmt",{}, Expr("x"), Expr("a"), Stmt(";") ]);
  
  // for-in statement with variable declaration
  testStatement("for (var x in a) {}",
                [ "ForInStmt",{}, ["VarDecl",{},["IdPatt",{name:"x"}]],
                                  Expr("a"), Stmt("{}") ]);
  testStatement("for (var x = 5 in a) {}",
                [ "ForInStmt",{}, ["VarDecl",{},["InitPatt",{}, ["IdPatt",{name:"x"}], Expr("5") ]],
							      Expr("a"), Stmt("{}") ]);
  
  // this should parse as for (var x = a in (b in c)) {} and not as
  // for (var x = (a in b) in c) {}
  testStatement("for (var x = a in b in c) {}",
                [ "ForInStmt",{}, ["VarDecl",{},["InitPatt",{}, ["IdPatt",{name:"x"}], Expr("a") ]],
				                  Expr("b in c"), Stmt("{}") ]);
 
  // break, continue and return statements
  testStatement("continue;", ["ContinueStmt", {}]);
  testStatement("continue label;", ["ContinueStmt",{label:"label"}]);
  testStatement("break;", ["BreakStmt",{}]);
  testStatement("break label;", ["BreakStmt",{label:"label"}]);
  testStatement("continue /* a comment */ ;", ["ContinueStmt",{}]);
  testStatement("continue\n", ["ContinueStmt", {}]);
  testStatement("return;", ["ReturnStmt", {}]);
  testStatement("return 0;", ["ReturnStmt",{}, Expr("0")]);
  testStatement("return 0 + \n 1;", ["ReturnStmt",{}, Expr("0 + \n 1")]);

  // with statement
  testStatement("with (e) s;", ["WithStmt", {}, Expr("e"), Stmt("s;") ]);
  
  // switch statements
  testStatement("switch (e) { case x: s; }",
                ["SwitchStmt",{}, Expr("e"),
                  ["Case", {}, Expr("x"), Stmt("s;") ] ]);
  testStatement("switch (e) { case x: s1;s2; default: s3; case y: s4; }",
                ["SwitchStmt",{}, Expr("e"),
                  ["Case", {}, Expr("x"), Stmt("s1;"), Stmt("s2;") ],
                  ["DefaultCase", {}, Stmt("s3;") ],
                  ["Case", {}, Expr("y"), Stmt("s4;") ] ]);
  testStatement("switch (e) { default: s1; case x: s2; case y: s3; }",
                ["SwitchStmt",{}, Expr("e"),
                  ["DefaultCase", {}, Stmt("s1;") ],
                  ["Case", {}, Expr("x"), Stmt("s2;") ],
                  ["Case", {}, Expr("y"), Stmt("s3;") ] ]);
  testStatement("switch (e) { default: s; }",
                ["SwitchStmt",{}, Expr("e"),
                  ["DefaultCase", {}, Stmt("s;") ] ]),
  testStatement("switch (e) { case x: s1; case y: s2; }",
                ["SwitchStmt",{}, Expr("e"),
                  ["Case", {}, Expr("x"), Stmt("s1;") ],
                  ["Case", {}, Expr("y"), Stmt("s2;") ] ]);

  // labelled statements
  testStatement("foo : x;", ["LabelledStmt",{label:"foo"}, Stmt("x;")]);
  
  // throw statements
  testStatement("throw x;", ["ThrowStmt",{}, Expr("x")]);
  testStatement("throw x\n", ["ThrowStmt",{}, Expr("x")]);
  ensureNoMatch("throw\n", 'Statement', []);
  ensureNoMatch("throw\n;", 'Statement', []);
  ensureNoMatch("throw;", 'Statement', []);
 
  // try-catch statements
  testStatement("try { s1; } catch (e) { s2; }",
                ["TryCatchStmt",{},
                  ["BlockStmt",{},Stmt("s1;")],
                  ["IdPatt",{name:"e"}],
                  ["BlockStmt",{},Stmt("s2;")] ]);
  testStatement("try { s1; } finally { s2; }",
                ["TryFinallyStmt",{},
                  ["BlockStmt",{},Stmt("s1;")],
                  ["BlockStmt",{},Stmt("s2;")] ]); 
  testStatement("try { s1; } catch (e) { s2; } finally { s3; }",
                ["TryCatchFinallyStmt",{},
                  ["BlockStmt",{},Stmt("s1;")],
                  ["IdPatt",{name:"e"}],
                  ["BlockStmt",{},Stmt("s2;")],
                  ["BlockStmt",{},Stmt("s3;")] ]);
  
  // debugger statement
  testStatement("debugger;", ["DebuggerStmt",{}]);

  // function declaration
  testSourceElement("function f(x) { e; return x; }",
                    [ "FunctionDecl", {}, ["IdPatt",{name:"f"}], ["ParamDecl",{},["IdPatt",{name:"x"}]],
                      Stmt("e;"), Stmt("return x;") ]);
  testSourceElement("function f() { x; y; }",
                    [ "FunctionDecl", {}, ["IdPatt",{name:"f"}], ["ParamDecl",{}],
                      Stmt("x;"), Stmt("y;") ]);
  testSourceElement("function f(x,y) { var z; return x; }",
                    [ "FunctionDecl", {}, ["IdPatt",{name:"f"}],
                      ["ParamDecl",{},["IdPatt",{name:"x"}], ["IdPatt",{name:"y"}]],
                      Stmt("var z;"), Stmt("return x;") ]);
  // function name is not optional for function declarations
  ensureNoMatch("function (x) { }", 'Statement', []);
  
  // function expression
  testExpression("function f(x) { return x; }",
                 [ "FunctionExpr", {}, ["IdPatt",{name:"f"}], ["ParamDecl",{},["IdPatt",{name:"x"}]],
                 Stmt("return x;") ]);
  testStatement("(function empty() {})",
                [ "FunctionExpr", {}, ["IdPatt",{name:"empty"}], ["ParamDecl",{}] ]);
  testStatement("(function f(x,y) { var z; return x; })",
                [ "FunctionExpr", {}, ["IdPatt",{name:"f"}],
                  ["ParamDecl",{},["IdPatt",{name:"x"}], ["IdPatt",{name:"y"}]],
                  Stmt("var z;"), Stmt("return x;") ]);
  testStatement("(function (x) { })",
                [ "FunctionExpr", { }, ["Empty"],
                  ["ParamDecl",{},["IdPatt",{name:"x"}]] ]);
  
  // program
  testProgram("", ["Program",{}]);
  testProgram("x", ["Program", {}, SrcE("x")]);
  testProgram("var x; function f(){} null",
              ["Program",{}, SrcE("var x;"), SrcE("function f(){}"), SrcE("null") ]);
  testProgram(";;", // 2 empty statements
              ["Program",{}, ["EmptyStmt",{}], ["EmptyStmt", {}]]);
  testProgram("{ x; y; z; }",
              ["Program", {}, ["BlockStmt",{}, SrcE("x;"), SrcE("y;"), SrcE("z;") ] ]);

  // test nested function declarations
  testProgram("function f() { function g() { }}",
              ["Program", {}, ["FunctionDecl", {},
                ["IdPatt", {name:"f"}],
                ["ParamDecl",{}],
                SrcE("function g() { }") ]]);

  // test whether comments at end of program are allowed
  testProgram("x;\n/*foo*/\n   ", ["Program",{},SrcE("x;")]);

  // automatic semicolon insertion

  // parsed as 'continue; foo;'
  testProgram("continue \n foo;", ["Program",{}, ["ContinueStmt",{}], Stmt("foo;") ]);
  // parsed as 'break; foo;'
  testProgram("break \n foo;", ["Program",{}, ["BreakStmt",{}], Stmt("foo;") ]);
  // parsed as 'return; foo;'
  testProgram("return\nfoo;", ["Program",{}, ["ReturnStmt",{}], Stmt("foo;") ]);

  testSourceElement("function f() { s }", // semicolon inserted after s
      [ "FunctionDecl", {}, ["IdPatt",{name:"f"}], ["ParamDecl",{}], SrcE("s")]);
  testSourceElement("function f() { return }", // semicolon inserted after return
      [ "FunctionDecl", {}, ["IdPatt",{name:"f"}], ["ParamDecl",{}], ["ReturnStmt",{}]]);

  // Directive Prologues
  testProgram('"use strict"; \'bla\'\n foo',
              ["Program", {},
                ["PrologueDecl", { "value": "use strict","directive":"use strict" } ],
                ["PrologueDecl", { "value": "bla", "directive":"bla" } ],
                ["IdExpr", { "name":"foo" } ] ]);
  testExpression('function() { "use strict"; \'bla\'\n foo }',
              ["FunctionExpr", {},
                ["Empty"],
                ["ParamDecl",{}],
                ["PrologueDecl", { "value":"use strict","directive":"use strict" } ],
                ["PrologueDecl", { "value":"bla","directive":"bla" } ],
                ["IdExpr", { "name":"foo" } ] ]);
  testProgram('"use\\ strict";',
              ["Program", {},
                ["PrologueDecl", { value: "use strict", directive:"use\\ strict" } ] ]);
  testProgram('foo; "use strict";',
              ["Program", {},
                  ["IdExpr", {"name":"foo"} ],
                  ["LiteralExpr",
                    {type:"string",
                     value:"use strict"} ] ]);

  // examples from the spec (sec 7.9.2)
  testProgram("{ 1 \n 2 } 3", // semicolon inserted after 1,2 and 3
     [ "Program", {}, ["BlockStmt", {}, Stmt("1"), Stmt("2") ], Stmt("3") ]);

  ensureNoMatch("for (a; b\n)", 'Program', []);

  testProgram("return\na + b", // semicolon inserted after return
     [ "Program", {}, ["ReturnStmt",{}], ["BinaryExpr",{op:"+"},Expr("a"),Expr("b") ] ]);

  testProgram("a = b \n ++c", // semicolon inserted after a = b
     [ "Program", {}, ["AssignExpr",{op:"="}, Expr("a"), Expr("b") ],
                      ["CountExpr", {isPrefix:true,op:"++"}, Expr("c") ] ]);

  // according to section 7.4, multilinecomments with newlines embedded
  // effectively count as line terminators
  testProgram("return /* \n */ 5;",
     ["Program", {}, ["ReturnStmt",{}] , Stmt("5;")]);

  testProgram("/*/**/", ["Program", {}]);
  testExpression("j / [a/*]/; [ /**/ ]",
                 [ "BinaryExpr", {}, Expr("j"), Expr("[a]") ]);
  testExpression("j\n/[a/*]/; [ /**/ ]",
                 [ "BinaryExpr", {}, Expr("j"), Expr("[a]") ]);

  ensureNoMatch("if (a > b)\nelse c = d", 'Program', []);
  
  return unit.testDone();
};