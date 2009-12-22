 "use strict";

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

/**
 * A "reify eval, absorb apply" style meta-interpreter for ES5.
 * 
 * @see 
 *http://lists.squeakfoundation.org/pipermail/squeak-e/2003-February/000027.html
 */
(
function(){

  function slice(arrayLike, start, end) {
    return Array.prototype.slice.call(arrayLike, start, end);
  }

  function unaryOp(op, x) {
    return ({
         "void": function() { return void x; },
         "+":    function() { return +x; },
         "-":    function() { return -x; },
         "~":    function() { return ~x; },
         "!":    function() { return !x; }
    })[op]();
  }

  function binaryOp(op, x, y) {
    return ({
         "*":          function() { return x * y; },
         "/":          function() { return x / y; },
         "%":          function() { return x % y; },
         "+":          function() { return x + y; },
         "-":          function() { return x - y; },
         "<<":         function() { return x << y; },
         ">>>":        function() { return x >>> y; },
         ">>":         function() { return x >> y; },
         "<":          function() { return x < y; },
         ">":          function() { return x > y; },
         "<=":         function() { return x <= y; },
         ">=":         function() { return x >= y; },
         "instanceof": function() { return x instanceof y; },
         "in":         function() { return x in y; },
         "==":         function() { return x == y; },
         "!=":         function() { return x != y; },
         "===":        function() { return x === y; },
         "!==":        function() { return x !== y; },
         "&":          function() { return x & y; },
         "|":          function() { return x | y; },
         "^":          function() { return x ^ y; },
         ",":          function() { return x, y; }
      })[op]();
  }

  function Evaluator(env) {
    this.env = env;
  }
  Evaluator.prototype = {
    visitThisExpr:    function(atr) { return this.env.getThis(); },
    visitIdExpr:      function(atr) { return this.env.get(atr.name); },
    visitRegExpExpr:  function(atr) { return new RegExp(atr.body, 
                                                        atr.flags); },
    visitLiteralExpr: function(atr) { return atr.value; },
    visitArrayExpr: function(atr, var_args) {
      var args = slice(arguments, 1);
      var result = [];
      args.forEach(function(arg, i) {
        if (arg[0] === 'Empty') {
          // TBD...
        } else {
          result[i] = visit(arg, this);
        }
      });
      return result;
    },
    visitObjectExpr: function(atr, var_args) {
      var args = slice(arguments, 1);
      var result = {};
      var that = this;
      args.forEach(function(arg) {
        return visit(arg, {
          visitDataProp: function(propAtr, propExpr) {
            result[propAtr.name] = visit(propExpr, that);
          },
          visitGetterProp: function(propAtr, propExpr) {
            Object.defineProperty(result, propAtr.name, {
              get: visit(propExpr, that), 
              enumerable: true, 
              configurable: true
            });
          },
          visitSetterProp: function(propAtr, propExpr) {
            Object.defineProperty(result, propAtr.name, {
              set: visit(propExpr, that), 
              enumerable: true, 
              configurable: true
            });
          }
        });
      });
      return result;
    },
    visitMemberExpr: function(atr, baseExpr, propExpr) {
      var base = visit(baseExpr, this);
      var prop = visit(propExpr, this);
      return base[prop];
    },
    visitInvokeExpr: function(atr, baseExpr, propExpr, var_args) {
      var base = visit(baseExpr, this);
      var prop = visit(propExpr, this);
      var that = this;
      var args = slice(arguments, 3).map(function(argExpr) {
        return visit(argExpr, that);
      });
      return Function.prototype.apply.call(base[prop], base, args);
    },
    visitCallExpr: function(atr, baseExpr, var_args) {
      var base = visit(baseExpr, this);
      var that = this;
      var args = slice(arguments, 2).map(function(argExpr) {
        return visit(argExpr, that);
      });
      return Function.prototype.apply.call(base, undefined, args);
    },
    visitNewExpr: function(atr, baseExpr, var_args) {
      var base = visit(baseExpr, this);
      var that = this;
      var args = slice(arguments, 2).map(function(argExpr) {
        return visit(argExpr, that);
      });
      return applyNew(base, args);
    },
    visitCountExpr: function(atr, lValue) {
      var ref = evalRef(lValue, this.env);
      var val = ref.get();
      ({ "++": function() { if (atr.isPrefix) { ++val; } else { val++; } },
         "--": function() { if (atr.isPrefix) { --val; } else { val--; } }
      })[atr.op]();
      ref.set(val);
      return val;
    },
    visitDeleteExpr: function(atr, lValue) {
      var ref = evalRef(lValue, this.env);
      return ref.remove();
    },
    visitTypeofExpr: function(atr, xExpr) {
      var ref = evalRef(lValue, this.env);
      return ref.exists() ? typeof ref.get() : 'undefined';
    },
    visitUnaryExpr: function(atr, xExpr) {
      return unaryOp(atr.op, visit(xExpr, this));
    },
    visitBinaryExpr: function(atr, xExpr, yExpr) {
      return binaryOp(atr.op, visit(xExpr, this), visit(yExpr, this));
    },
    visitLogicalAndExpr: function(atr, xExpr, yExpr) {
      return visit(xExpr, this) && visit(yExpr, this);
    },
    visitLogicalOrExpr: function(atr, xExpr, yExpr) {
      return visit(xExpr, this) || visit(yExpr, this);
    },
    visitConditionalExpr: function(atr, xExpr, yExpr, zExpr) {
      return visit(xExpr, this) ? visit(yExpr, this) : visit(zExpr, this);
    },
    visitAssignExpr: function(atr, lValue, rValue) {
      var ref = evalRef(lValue, this.env);
      var val = visit(rValue, this);
      if (atr.op === '=') {
        ref.set(val);
        return val;
      }
      var op = atr.op.substring(0, atr.op.length -1);
      var result = binaryOp(op, ref.get(), val);
      ref.set(result);
      return result;
    },

    visitBlockStmt: function(atr, var_args) {
      var stmts = slice(arguments, 1);
      var nest = new Evaluator(this.env.nestBlock(atr));
      var result;
      stmts.forEach(function(stmt) { result = visit(stmt, nest); });
      return result;
    },
    visitVarDecl: function(atr, var_args) {
      var patts = slice(arguments, 1);
      var that = this;
      patts.forEach(function(patt){
        visit(patt, {
          visitInitPatt: function(pAtr, lValue, rValue) {
            evalRef(lValue, that.env).set(visit(rValue, that));
          },
          visitIdPatt: function(pAtr) {}
        });
      });
    },
    visitEmptyStmt: function(atr) {},
    visitIfStmt: function(atr, condExpr, thenStmt, elseStmt) {
      if (visit(condExpr, this)) {
        return eval(thenStmt, this.env.nestStmt(thenStmt[1]));
      } else {
        return eval(elseStmt, this.env.nestStmt(elseStmt[1]));
      }
    },
    visitDoWhileStmt: function(atr, bodyStmt, condExpr) {
      return label(this, 'break', function(breaker) {
        do {
          label(breaker, 'continue', function(continuer) {
            visit(bodyStmt, continuer);
          });
        } while (visit(condExpr, breaker));
      });
    },
    visitWhileStmt: function(atr, condExpr, bodyStmt) {
      return label(this, 'break', function(breaker) {
        while (visit(condExpr, breaker)) {
          label(breaker, 'continue', function(continuer) {
            visit(bodyStmt, continuer);
          });
        }
      });
    },
    visitForStmt: function(atr, init, condExpr, incrExpr, bodyStmt) {
      return label(this, 'break', function(breaker) {
        for (visit(init, breaker); 
             visit(condExpr, breaker); 
             visit(incrExpr, breaker)) {
          label(breaker, 'continue', function(continuer) {
            visit(bodyStmt, continuer);
          });
        }
      });
    },
    visitForInStmt: function(atr, lValue, collExpr, bodyStmt) {
      return label(this, 'break', function(breaker) {
        var ref = evalRef(lValue, breaker);
        var coll = visit(collExpr, breaker);
        for (var v in coll) {
          ref.set(v);
          label(breaker, 'continue', function(continuer) {
            visit(bodyStmt, continuer);
          });
        }
      });
    },
    visitContinueStmt: function(atr) {
      var label = atr.label || 'continue';
      escape(env.getLabel(label));
    },
    visitBreakStmt: function(atr) {
      var label = atr.label || 'continue';
      escape(env.getLabel(label));
    },
    visitReturnStmt: function(atr, optExpr) {
      if (optExpr) {
        escape(env.getLabel('return'), visit(optExpr, this));
      } else {
        escape(env.getLabel('return'));
      }
    },
    visitWithStmt: function(atr, headExpr, bodyStmt) {
      var nest = new Evaluator(this.env.nestWith(visit(headExpr, this)));
      return visit(bodyStmt, nest);
    },
    visitSwitchStmt: function(atr, headExpr, var_args) {
      // TBD...
    },
    visitLabelledStatement: function(atr, subStmt) {
      label(this, atr.label, function(labeller) {
        return visit(subStmt, labeller);
      });
    },
    visitThrowStmt: function(atr, errExpr) {
      throw visit(errExpr, this);
    },
    visitTryCatchStmt: function(atr, tryStmt, 
                                errPatt, catchStmt) {
      // TBD...
    },
    visitTryFinallyStmt: function(atr, tryStmt, 
                                  unwindStmt) {
      // TBD...
    },
    visitTryCatchFinallyStmt: function(atr, tryStmt, 
                                       errPatt, catchStmt, 
                                       unwindStmt) {
      // TBD...
    },
    visitdebuggerStmt: function(atr) {
      debugger;
    },

    visitFunctionDecl: function(atr, namePatt, params, var_args) {
      // The declaration itself does nothing by the time it is
      // evaluated in place. Rather, the initialization is hoisted to
      // the beginning of the containing block.
    },
    visitFunctionExpr: function(atr, namePatt, params, var_args) {
      var nestEnv = eval.env.nestFunction(atr);
      var nameRef;
      if (namePatt[0] === 'Empty') {
        nameRef = null;
      } else {
        nameRef = evalRef(namePatt, nestEnv);
      }
      var bodyStmts = slice(arguments, 3);        
      var result = function(var_args) {
        var paramPatts = slice(params, 2);
        var args = slice(arguments, 0);
        paramPatts.forEach(function(paramPatt, i) {
          evalRef(paramPatt, nestEnv).set(args[i]);
        });
        return label(new Evaluator(nestEnv), 'return', function(returner) {
	  bodyStmts.forEach(function(stmt) {
	    visit(stmt, returner);
          });
	});
      };
      if (nameRef) { nameRef.set(result); }
      return result;
    }
  };

  function eval(element, env) {
    return visit(element, new Evaluator(env));
  }

  return eval;
})();
