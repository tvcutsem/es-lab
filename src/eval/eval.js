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

var IS_THIS_SHADOWED = false;

function isBuiltinEval(eval) {
  // Must be non-strict or couldn't use "eval" as a parameter name.
  var IS_THIS_SHADOWED = {};
  return IS_THIS_SHADOWED === eval('IS_THIS_SHADOWED');
}

/**
 * A "reify eval, absorb apply" style meta-interpreter for ES5.
 * 
 * @see 
 *http://lists.squeakfoundation.org/pipermail/squeak-e/2003-February/000027.html
 */
(
function(){
  "use strict";

  /////////////// general purpose utilities //////////////////

  /**
   * Assuming <tt>obj</tt> is an object written in the normal
   * objects-as-closures style, this convenience method will freeze
   * the object, all the enumerable methods of that object, and all
   * the <tt>prototype</tt>s of those methods.
   * 
   * <p>For example, a defensive <tt>Point</tt> constructor can be
   * written as <tt>
   *   function Point(x, y) {
   *     return object({
   *       toString: function() { return '&lt;' + x + ',' + y + '&gt;'; },
   *       getX: function() { return x; },
   *       getY: function() { return y; }
   *     });
   *   }
   *   Object.freeze(Point.prototype);
   *   Object.freeze(Point);
   * </tt>
   */
  function object(obj) {
    for (var name in obj) {
      var meth = obj[name];
      if (typeof meth === 'function') {
        if ('prototype' in meth) {
          Object.freeze(meth.prototype);
        }
        Object.freeze(meth);
      }
    }
    return Object.freeze(obj);
  }

  /**
   * Static generic for <tt>Array.prototype.slice()</tt>.
   * 
   * <p><tt>slice(array, start, end)</tt> acts like
   * <tt>array.slice(start, end)</tt> under the assumption that
   * <tt>array</tt> is an array and has not overridden
   * <tt>Array.prototype.slice()</tt>. 
   */
  function slice(arrayLike, start, end) {
    return Array.prototype.slice.call(arrayLike, start, end);
  }

  /**
   * Static generic for <tt>Function.prototype.apply()</tt>.
   * 
   * <p><tt>apply(func, thisArg, args)</tt> acts like
   * <tt>func.apply(thisArg, args)</tt> under the assumption that
   * <tt>func</tt> is a function and has not overridden
   * <tt>Function.prototype.apply()</tt>.
   */
  function apply(func, thisArg, args) {
    return Function.prototype.apply.call(func, thisArg, args);
  }

  /**
   * Adapted from Mike Samuel's "triangle of hackery" to emulate
   * <tt>new ctor(...args)</tt>.
   * 
   * <p>The normal pattern for doing variable arity construction -- an
   * <tt>var result = Object.create(ctor.prototype);</tt> followed by
   * an <tt>apply(ctor, result, args);</tt> -- doesn't work on
   * built-in constructors, especially <tt>Date</tt>. The triangle of
   * hackery switches on the arity of <tt>args</tt> and manually
   * performs a <tt>new</tt> for each arity from zero to
   * twelve. Arrays aside, since the ES5-specified (and therefore the
   * whitelisted) built in constructors have no case exceeding arity
   * twelve, beyond that, if <tt>ctor !== Array</tt>, we fall back on
   * the normal pattern, which should now be correct for non-built in
   * constructors.
   * 
   * <p>Note that the this hackery fails in the following edge cases:
   * <ul>
   * <li><tt>ctor</tt> is a non-Array built-in constructor (say
   *     <tt>Date</tt>), but is called with more than twelve
   *     arguments. Additional arguments should be ignored without
   *     effect. Instead, it will cause the triangle of hackery to
   *     fall back on the normal pattern which will fail for some
   *     built-in constructors. 
   * <li><tt>ctor</tt> is a built-in Array constructor from a foreign
   *     frame and called with more than twelve arguments. 
   * </ul>
   */
  function applyNew(ctor, args) {
    switch (args.length) {
      case 0:  return new ctor();
      case 1:  return new ctor(args[0]);
      case 2:  return new ctor(args[0], args[1]);
      case 3:  return new ctor(args[0], args[1], args[2]);
      case 4:  return new ctor(args[0], args[1], args[2], args[3]);
      case 5:  return new ctor(args[0], args[1], args[2], args[3], args[4]);
      case 6:  return new ctor(args[0], args[1], args[2], args[3], args[4],
                               args[5]);
      case 7:  return new ctor(args[0], args[1], args[2], args[3], args[4],
                               args[5], args[6]);
      case 8:  return new ctor(args[0], args[1], args[2], args[3], args[4],
                               args[5], args[6], args[7]);
      case 9:  return new ctor(args[0], args[1], args[2], args[3], args[4],
                               args[5], args[6], args[7], args[8]);
      case 10: return new ctor(args[0], args[1], args[2], args[3], args[4],
                               args[5], args[6], args[7], args[8], args[9]);
      case 11: return new ctor(args[0], args[1], args[2], args[3], args[4],
                               args[5], args[6], args[7], args[8], args[9],
                               args[10]);
      case 12: return new ctor(args[0], args[1], args[2], args[3], args[4],
                               args[5], args[6], args[7], args[8], args[9],
                               args[10], args[11]);
      default: {
        if (ctor === Array) {
          // The above test fails if ctor is the Array constructor
          // from a foreign frame.
          return ctor.apply(undefined, args);
        }
        var result = Object.create(ctor.prototype);
        apply(ctor, result, args);
        return result;
      }
    }
  }

  /////////////// meta interpreter support //////////////////

  function parseAndVerifyProgram(src) {
    // TBD
  }

  function unaryOp(op, x) {
    return object({
         "void": function() { return void x; },
         "+":    function() { return +x; },
         "-":    function() { return -x; },
         "~":    function() { return ~x; },
         "!":    function() { return !x; }
    })[op]();
  }

  function binaryOp(op, x, y) {
    return object({
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

  /////////////// Naming Environment //////////////////

  // Nested scope chain is absorbed into the prototype inheritance
  // chain of the 'rep' object.
  function Environment(rep, thisArg) {
    this.rep = rep;
    this.thisArg = thisArg;
  }
  Environment.prototype = object({
    get: function(varName) {
      return this.rep['var$' + varName];
    },
    set: function(varName, newVal) {
      var mangle = 'var$' + varName;
      var desc = Object.getOwnPropertyDescriptor(this.rep, mangle);
      if (desc && desc.writable) {
        this.rep[mangle] = newVal;
        return true;
      } else {
        return false;
      }
    },
    getThis: function() {
      return this.thisArg;
    },
    getLabel: function(labelName) {
      return this.rep['label$' + labelName];
    },

    nestFunction: function(atr, statements) {

    },
    nestThis: function(atr, newThisArg) {
      return new Environment(this.rep, newThisArg);
    },
    nestLabel: function(atr, labelName, ejector) {
      var newRep = Object.create(this.rep);
      newRep['label$' + labelName] = ejector;
      return new Environment(newRep, this.thisArg);
    },
    nestBlock: function(atr, statements) {

    },
    nestStmt: function(atr) {

    },
    nestWith: function(atr, obj) {

    },
    nestCatch: function(atr, varName) {

    },
    nestProgram: function(atr, statements) {
      
    }
  });

  /////////////// meta interpreter //////////////////

  function Evaluator(env) {
    this.env = env;
  }
  Evaluator.prototype = object({
    visitThisExpr:    function(atr) { return this.env.getThis(); },
    visitIdExpr:      function(atr) { return this.env.get(atr.name); },
    visitRegExpExpr:  function(atr) { return new RegExp(atr.body, 
                                                        atr.flags); },
    visitLiteralExpr: function(atr) { return atr.value; },
    visitArrayExpr: function(atr, var_args) {
      var result = [];
      slice(arguments, 1).forEach(function(arg, i) {
        if (arg[0] === 'Empty') {
          // TBD...
        } else {
          result[i] = visit(this, arg);
        }
      });
      return result;
    },
    visitObjectExpr: function(atr, var_args) {
      var result = {};
      var that = this;
      slice(arguments, 1).forEach(function(arg) {
        return visit(object({
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
        }), arg);
      });
      return result;
    },
    visitMemberExpr: function(atr, baseExpr, propExpr) {
      var base = visit(this, baseExpr);
      var prop = visit(this, propExpr);
      return base[prop];
    },
    visitInvokeExpr: function(atr, baseExpr, propExpr, var_args) {
      var base = visit(this, baseExpr);
      var prop = visit(this, propExpr);
      var meth = base[prop];
      var that = this;
      var args = slice(arguments, 3).map(function(argExpr) {
        return visit(that, argExpr);
      });
      return Function.prototype.apply.call(meth, base, args);
    },
    visitCallExpr: function(atr, baseExpr, var_args) {
      var base = visit(this, baseExpr);
      var that = this;
      var args = slice(arguments, 2).map(function(argExpr) {
        return visit(that, argExpr);
      });
      return Function.prototype.apply.call(base, undefined, args);
    },
    visitNewExpr: function(atr, baseExpr, var_args) {
      var base = visit(this, baseExpr);
      var that = this;
      var args = slice(arguments, 2).map(function(argExpr) {
        return visit(that, argExpr);
      });
      return applyNew(base, args);
    },
    visitEvalExpr: function(atr, var_args) {
      var evalFun = this.env.get("eval");
      var args = slice(arguments, 1).map(function(argExpr) {
        return visit(that, argExpr);
      });
      if (isBuiltinEval(evalFun)) {
        var program = parseAndVerifyProgram(args[0]);
        metaEval(program, this.env.nestProgram(atr, program.slice(2)));
      } else {
        return Function.prototype.apply.call(evalFun, undefined, args);
      }
    },
    visitCountExpr: function(atr, lValue) {
      var ref = evalRef(lValue, this.env);
      var val = ref.get();
      var result = object({ 
        "++": function() { return atr.isPrefix ? ++val : val++; },
        "--": function() { return atr.isPrefix ? --val : val--; }
      })[atr.op]();
      ref.set(val);
      return result;
    },
    visitDeleteExpr: function(atr, xExpr) {
      var optRef = evalRef(xExpr, this.env);
      return optRef ? optRef.remove() : true;
    },
    visitTypeofExpr: function(atr, xExpr) {
      var optRef = evalRef(xExpr, this.env);
      if (optRef) {
        if (optRef.exists()) {
          return typeof optRef.get();
        } else {
          return 'undefined';
        }
      } else {
        return typeof visit(this, xExpr);
      }
    },
    visitUnaryExpr: function(atr, xExpr) {
      return unaryOp(atr.op, visit(this, xExpr));
    },
    visitBinaryExpr: function(atr, xExpr, yExpr) {
      return binaryOp(atr.op, visit(this, xExpr), visit(this, yExpr));
    },
    visitLogicalAndExpr: function(atr, xExpr, yExpr) {
      return visit(this, xExpr) && visit(this, yExpr);
    },
    visitLogicalOrExpr: function(atr, xExpr, yExpr) {
      return visit(this, xExpr) || visit(this, yExpr);
    },
    visitConditionalExpr: function(atr, xExpr, yExpr, zExpr) {
      return visit(this, xExpr) ? visit(this, yExpr) : visit(this, zExpr);
    },
    visitAssignExpr: function(atr, lValue, aExpr) {
      var ref = evalRef(lValue, this.env);
      var val = visit(this, aExpr);
      if (atr.op === '=') {
        ref.set(val);
        return val;
      }
      var op = (/^(.*)=$/).exec(op)[1];
      var result = binaryOp(op, ref.get(), val);
      ref.set(result);
      return result;
    },

    visitBlockStmt: function(atr, var_args) {
      var stmts = slice(arguments, 1);
      var nest = new Evaluator(this.env.nestBlock(atr, stmts));
      var result;
      stmts.forEach(function(stmt) { result = visit(nest, stmt); });
      return result;
    },
    visitVarDecl: function(atr, var_args) {
      var patts = slice(arguments, 1);
      var that = this;
      patts.forEach(function(patt){
        visit(object({
          visitInitPatt: function(pAtr, idPatt, expr) {
            that.env.set(idPatt.name, visit(expr, that));
          },
          visitIdPatt: function(pAtr) {}
        }), patt);
      });
    },
    visitEmptyStmt: function(atr) {},
    visitIfStmt: function(atr, condExpr, thenStmt, elseStmt) {
      if (visit(condExpr, this)) {
        return metaEval(thenStmt, this.env.nestStmt(thenStmt[1]));
      } else {
        return metaEval(elseStmt, this.env.nestStmt(elseStmt[1]));
      }
    },
    visitDoWhileStmt: function(atr, bodyStmt, condExpr) {
      return this.label('break', function(breaker) {
        do {
          breaker.label('continue', function(continuer) {
            visit(continuer, bodyStmt);
          });
        } while (visit(breaker, condExpr));
      });
    },
    visitWhileStmt: function(atr, condExpr, bodyStmt) {
      return this.label('break', function(breaker) {
        while (visit(breaker, condExpr)) {
          breaker.label('continue', function(continuer) {
            visit(continuer, bodyStmt);
          });
        }
      });
    },
    visitForStmt: function(atr, init, condExpr, incrExpr, bodyStmt) {
      return this.label('break', function(breaker) {
        for (visit(breaker, init); 
             visit(breaker, condExpr); 
             visit(breaker, incrExpr)) {
          breaker.label('continue', function(continuer) {
            visit(continuer, bodyStmt);
          });
        }
      });
    },
    visitForInStmt: function(atr, lValue, collExpr, bodyStmt) {
      return this.label('break', function(breaker) {
        var ref = evalRef(lValue, breaker);
        var coll = visit(breaker, collExpr);
        for (var v in coll) {
          ref.set(v);
          breaker.label('continue', function(continuer) {
            visit(continuer, bodyStmt);
          });
        }
      });
    },
    visitContinueStmt: function(atr) {
      var label = atr.label || 'continue';
      escape(this.env.getLabel(label));
    },
    visitBreakStmt: function(atr) {
      var label = atr.label || 'break';
      escape(this.env.getLabel(label));
    },
    visitReturnStmt: function(atr, optExpr) {
      if (optExpr) {
        escape(this.env.getLabel('return'), visit(this, optExpr));
      } else {
        escape(this.env.getLabel('return'));
      }
    },
    visitWithStmt: function(atr, headExpr, bodyStmt) {
      var nest = new Evaluator(this.env.nestWith(atr, visit(this, headExpr)));
      return visit(nest, bodyStmt);
    },
    visitSwitchStmt: function(atr, headExpr, var_args) {
      // TBD...
    },
    visitLabelledStatement: function(atr, subStmt) {
      this.label(atr.label, function(labeller) {
        return visit(labeller, subStmt);
      });
    },
    visitThrowStmt: function(atr, errExpr) {
      throw visit(this, errExpr);
    },
    visitTryStmt: function(atr, tryStmt, optCatchClause, unwindStmt) {
      try {
        return visit(this, tryStmt);
      } catch (e) {
        if (optCatchClause[0] === 'Empty') {
          throw e;
        } else {
          var errPatt = optCatchClause[2];
          var catchStmt = optCatchClause[3];
          return metaEval(catchStmt, this.env.nestCatch(catchStmt[1], errPatt.name));
        }
      } finally {
        if (unwindStmt) {
          visit(this, unwindStmt);
        }
      }
    },
    visitDebuggerStmt: function(atr) {
      debugger;
    },

    visitFunctionDecl: function(atr, namePatt, params, var_args) {
      // The declaration itself does nothing by the time it is
      // evaluated in place. Rather, the initialization is hoisted to
      // the beginning of the containing block.
    },
    visitFunctionExpr: function(atr, namePatt, params, var_args) {
      var bodyStmts = slice(arguments, 3);        
      var nestEnv = this.env.nestFunction(atr, bodyStmts);
      var nameRef;
      if (namePatt[0] === 'Empty') {
        nameRef = null;
      } else {
        nameRef = evalRef(namePatt, nestEnv);
      }
      var result = function(var_args) {
	      var funcEnv = nestEnv.nestThis(atr, this);
        var paramPatts = slice(params, 2);
        var args = slice(arguments, 0);
        paramPatts.forEach(function(paramPatt, i) {
          evalRef(paramPatt, funcEnv).set(args[i]);
        });
        return new Evaluator(funcEnv).label('return', function(returner) {
          bodyStmts.forEach(function(stmt) {
            visit(returner, stmt);
          });
        });
      };
      if (nameRef) { nameRef.set(result); }
      return result;
    },
    visitPrologueDecl: function(atr) {
      return atr.value; // prologue declarations are interpreted as string literals
    }
  });
  Object.freeze(Evaluator.prototype);
  Object.freeze(Evaluator);

  function metaEval(element, env) {
    return visit(new Evaluator(env), element);
  }

  function evalRef(expr, env) {
    return visit(object({
      visitIdExpr: function(atr) {
        return object({
          get:    function()       { return env.get(atr.name); },
          set:    function(newVal) { return env.set(atr.name, newVal); },
          remove: function()       { return env.remove(atr.name); },
          exists: function()       { return env.exists(atr.name); }          
        });
      },
      visitMemberExpr: function(atr, baseExpr, propExpr) {
        var base = metaEval(baseExpr, env);
        var prop = metaEval(propExpr, env);
        return object({
          get:    function()       { return base[prop]; },
          set:    function(newVal) { base[prop] = val; return true; },
          remove: function()       { return delete base[prop]; },
          exists: function()       { return prop in base; }          
        });
      },
      doesNotVisit: function(element) { return false; }
    }), expr);
  }

  return Object.freeze(metaEval);
})();
