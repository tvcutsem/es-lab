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

'use strict';

/**
 * See http://wiki.commonjs.org/wiki/Modules/ScriptModules for
 * boilerplate explanation.
 */
(function(){function mod(require,exports) {

  var w = require('../jsonMLWalkers');
  var Scope = require('Scope').Scope;

  function StringMap(rep) {
    rep = rep || {};
    return Object.freeze({
      get: function(name) { return rep['$' + name]; },
      set: function(name, val) { rep['$' + name] = val; },
      nest: function() { return StringMap(Object.create(rep)); }
    });
  }

  /**
   * This verification <i>assumes</i> that <tt>ast</tt> results from a
   * valid parse by an ES5 validating parser, which verifies that all
   * the context-free grammatical constraints are met.
   * 
   * <p>This verifier must therefore additionally verify:
   * <ul>
   * <li>The absence of context-dependent early ES5 errors.
   * <li>The absence of early (static) violations of ES5-strict
   *     restrictions.
   * <li>The absence of any free variable references other than to
   *     names that appear as own properties on the
   *     <tt>whitelist</tt>. 
   * </ul>
   */
  function verifySES(ast, whitelist) {

    // Normalizes JsonML. Assigns preOrder:. Accumulates nodes: and
    // optParents: into analysis record.
    var analysis = w.preOrder(ast);

    // Mark all nodes as strict.
    analysis.nodes.forEach(function(node) { node[1].strict = true; });
    
    // Catch simple context-dependent violations of ES5-strict.
    visitThrough(es5StrictPass1Visitor, analysis.tree);

    analysis.scopes = []; // Records each node's Scope object by preOrder:
    analysis.freeIdExprs = []; // Records all free IdExprs
    var topScope = Scope.top(analysis, whitelist.keys());
    var topScopeDefsVisitor = new ScopeDefsVisitor(topScope);    
    visitThrough(topScopeDefsVisitor, analysis.tree);
    if (!scopes[0]) { scopes[0] = topScope; }

    var scopeUsesVisitor = new ScopeUsesVisitor(analysis);
    visitThrough(scopeUsesVisitor, analysis.tree);

    if (analysis.freeIdExprs.length >= 1) {
      var freeNames = freeIdExprs.map(function(node) { return node[1].name; });
      var plural = freeNames.length === 1 ? '' : 's';
      throw new EvalError('Non-whitelisted free variable' + plural +
                          ': ' + freeName.join(','));
    }
  }
  exports.verifySES = verifySES;

  /**
   * Extra words reserved only in strict mode. All other reserved
   * words we assume to have already been caught by a validating parser.
   */
  var es5StrictReserved = StringMap();
  [ 'implements', 'interface', 'let', 'package',
    'private', 'protected', 'public', 'static', 'yield'
  ].forEach(function(word) { es5StrictReserved.set(word, true); });


  /**
   * Catch simple context-dependent violations of ES5-strict.
   */
  var es5StrictPass1Visitor = Object.freeze({
    visitIdExpr: function(atr) {
      if (es5StrictReserved.get(atr.name) {
        throw new SyntaxError('reserved in strict code: ' + atr.name);
      }
    },
    visitObjectExpr: function(atr, var_props) {
      var propNames = StringMap();
      w.slice(arguments, 1).forEach(function(prop) {
        var propName = prop[1].name;
        var propType = prop[0];
        var oldType = propNames.get(propName);
        if (oldType) {
          if (propType === 'GetterProp' && oldType === 'SetterProp') {
            propType = 'AccessorProp';
          } else if (propType === 'SetterProp' && oldType === 'GetterProp') {
            propType = 'AccessorProp';
          } else {
            throw new SyntaxError('Conflicting defs of property: ' + propName);
          }
        }
        propNames.set(propName, propType);
      });
    },
    visitDeleteExpr: function(atr, lValue) {
      if (lValue[0] === 'IdExpr') {
        throw new SyntaxError("Strict code can't delete a variable: " + 
                              lValue[1].name);
      }
    },
    visitParamDecl: function(atr, var_idPatts) {
      var paramNames = StringMap();
      slice(arguments, 1).forEach(function(idPatt) {
        var name = isPatt[1].name;
        if (paramNames.get(name)) { 
          throw new SyntaxError('Param name conflict: ' + name);
        }
        paramNames.set(name, true);
      });
    },
    visitIdPatt: function(atr) {
      if (es5StrictReserved.get(atr.name)) {
        throw new SyntaxError('Reserved in strict code: ' + atr.name);
      }
      if (atr.name === 'eval' || atr.name === 'arguments') {
        throw new SyntaxError("Strict code can't redefine: " + atr.name);
      }
    },
    visitWithStmt: function(atr, headExpr, bodyStmt) {
      throw new SyntaxError("Strict code can't use 'with'.");
    }
  });

  function ScopeDefsVisitor(Scope) {
    this.scope = scope;
  }
  function subScopeFunc(scope) {
    return visitThrough.bind(undefined, new ScopeDefsVisitor(scope));
  }
  ScopeDefsVisitor.prototype = Object.freeze({
    visitProgram: function(atr, var_parts) {
      var scope2 = this.scope.nestProgram(atr);
      slice(arguments, 1).forEach(subScopeFunc(scope2));
      return true;
    },
    visitFunctionExpr: function(atr, optIdExpr, paramDecl, var_parts) {
      var scope2 = this.scope.nestFunction(atr);
      if (optIdExpr[0] !== 'Empty') { scope2.defineConst(atr); }
      slice(arguments, 2).forEach(subScopeFunc(scope2));
      return true;
    },
    visitFunctionDecl: function(atr, idExpr, paramDecl, var_parts) {
      this.scope.defineLet(atr);
      var scope2 = this.scope.nestFunction(atr);
      slice(arguments, 2).forEach(subScopeFunc(scope2));
      return true;
    },
    visitIdPatt: function(atr) {
      this.scope.defineVar(atr);
      return true;
    },
    visitBlockStmt: function(atr, var_stmt) {
      var scope2 = this.scope.nestBlock(atr);
      slice(arguments, 1).forEach(subScopeFunc(scope2));
      return true;
    },
    visitDoWhileStmt: function(atr, bodyStmt, condExpr) {
      var scope2 = this.scope.nestLoop(atr);
      subScopeFunc(scope2)(bodyStmt);
      visitThrough(this, condExpr);
      return true;
    },
    visitWhileStmt: function(atr, condExpr, bodyStmt) {
      visitThrough(this, condExpr);
      var scope2 = this.scope.nestLoop(atr);
      subScopeFunc(scope2)(bodyStmt);
      return true;
    },
    visitForStmt: function(atr, optInitPart, optCondExpr, optIncrExpr,
                           bodyStmt) {
      visitThrough(this, optInitPart);
      visitThrough(this, optCondExpr);
      visitThrough(this, optIncrExpr);
      var scope2 = this.scope.nestLoop(atr);
      subScopeFunc(scope2)(bodyStmt);
      return true;
    },
    visitForInStmt: function(atr, lValue, collExpr, bodyStmt) {
      visitThrough(this, lValue);
      visitThrough(this, collExpr);
      var scope2 = this.scope.nestLoop(atr);
      subScopeFunc(scope2)(bodyStmt);
      return true;
    },
    visitSwitchStmt: function(atr, headExpr, var_cases) {
      visitThough(this, headExpr);
      var scope2 = this.scope.nestLabel(atr, 'break');
      slice(arguments, 2).forEach(subScopeFunc(scope2));
      return true;
    },
    visitLabelledStmt: function(atr, bodyStmt) {
      var scope2 = this.scope.nestLabel(atr, atr.label);
      subScopeExpr(scope2)(bodyStmt);
      return true;
    },
    visitTryStmt: function(atr, tStmt, catchClause, fStmt) {
      visitThrough(this, tStmt);
      if (catchClause[0] === 'CatchClause') {
        var errPatt = catchClause[2];
        var cStmt = catchClause[3];
        var scope2 = this.scope.nestCatch(catchClause[1]);
        if (errPatt[0] === 'IdPatt') { scope2.defineLetName(errPatt[1]); };
        subScopeFunc(scope2)(cStmt);
      }
      if (fStmt) { visitThrough(this, fStmt); }
      return true;
    }
  });

  function ScopeUsesVisitor(analysis) {
    function scope(atr) {
      var i = atr.preOrder;
      while (true) {
        var scope = scopes[i];
        if (scope) { return scope; }
        var parent = optParents[i];
        if (!parent) { return null; }
        i = parent[1].preOrder;
      }
    }
    function assigns(lValue) {
      if (lValue[0] === 'IdExpr') {
        var atr = lValue[1];
        scope(atr).assignsName(atr);
      } else if (lValue[0] !== 'MemberExpr') {
        throw new SyntaxError('Invalid LeftHandSide expression: ' + lValue[0]);
      }
    }
    return Object.freeze({
      // xxx what about visitEvalExpr? (uses 'eval')?
      visitThisExpr: function(atr) { scope(atr).usesThis(atr); },
      visitIdExpr: function(atr) { scope(atr).usesName(atr); },
      visitAssignExpr: function(atr, lValue, rExpr) { assigns(lValue); },
      visitCountExpr: function(atr, lValue) { assigns(lvalue); },
      visitForInStmt: function(atr, lValue, collExpr, bodyStmt) {
        if (lValue[0] !== 'VarDecl') { assigns(lValue); }
      },
      visitContinueStmt: function(atr) { 
        scope(atr).usesLabel(atr, atr.label || 'continue');
      },
      visitBreakStmt: function(atr) { 
        scope(atr).usesLabel(atr, atr.label || 'break');
      },
      visitReturnStmt: function(atr, optExpr) { 
        scope(atr).usesLabel(atr, 'return');
      }
    });
  }

// See http://wiki.commonjs.org/wiki/Modules/ScriptModules for
// boilerplate explanation.
};require.install?require.install('verifySES',mod):mod(require,exports);})();
