/**
 * @fileoverview
 * Functions that analyze scoping of identifiers in an EcmaScript parse tree.
 * For a detailed discussion, see the
 * <a href="http://wiki.ecmascript.org/doku.php?id=strawman:free-vars">spec</a>.
 * @provides let_scoped_decls var_scoped_decls required_names required_labels
 *   free_names free_labels
 * @requires EMPTY_SET set_union set_difference set_singleton
 * @author mikesamuel@gmail.com
 */

var let_scoped_decls, var_scoped_decls, required_names, required_labels,
    free_names, free_labels;

(function () {

let_scoped_decls = function (ast) {
  var names;
  switch (ast[0]) {
    case 'BlockStmt': case 'Program':
    case 'ConstDecl': case 'LetDecl':
      names = EMPTY_SET;
      for (var i = 2, n = ast.length; i < n; ++i) {
        names = set_union(names, let_scoped_decls(ast[i]));
      }
      break;
    case 'ForInStmt': case 'ForStmt': case 'FunctionDecl': case 'InitPatt':
      names = let_scoped_decls(ast[2]);
      break;
    case 'IdPatt':
      names = set_singleton(ast[1].name);
      break;
    default:
      names = EMPTY_SET;
      break;
  }
  return names;
};

var_scoped_decls = function (ast) {
  var names;
  switch (ast[0]) {
    case 'ConstDecl': case 'LetDecl':
    case 'FunctionDecl': case 'FunctionExpr':
      names = EMPTY_SET;
      break;
    case 'IdPatt':
      names = set_singleton(ast[1].name);
      break;
    case 'TryCatchStmt': case 'TryCatchFinallyStmt':
      names = EMPTY_SET;
      for (var i = 2, n = ast.length; i < n; ++i) {
        if (i === 3) { continue; }
        names = set_union(names, var_scoped_decls(ast[i]));
      }
      break;
    default:
      names = EMPTY_SET;
      for (var i = 2, n = ast.length; i < n; ++i) {
        names = set_union(names, var_scoped_decls(ast[i]));
      }
      break;
  }
  return names;
};

var ARGUMENTS = set_singleton('arguments');
var THIS = set_singleton('this');
var DEFAULT_LABEL = set_singleton('default');
var LOOP_DEFAULTS = set_union(DEFAULT_LABEL, set_singleton('continue default'));
var IMPLIED_BY_FN = set_union(ARGUMENTS, THIS);
var RETURN = set_singleton('return');

required_names = function (ast, opt_exclusions) {
  if (opt_exclusions && opt_exclusions.indexOf(ast) >= 0) { return EMPTY_SET; }
  var names;
  switch (ast[0]) {
    case 'IdExpr': names = set_singleton(ast[1].name); break;
    case 'ThisExpr': names = THIS; break;
    case 'FunctionDecl': case 'FunctionExpr':
      var nameOrEmpty = ast[2];
      var formals = ast[3];
      names = EMPTY_SET;
      // Function body
      for (var i = 4, n = ast.length; i < n; ++i) {
        names = set_union(names, required_names(ast[i], opt_exclusions));
      }
      names = set_difference(names, IMPLIED_BY_FN);
      var decls = EMPTY_SET;
      for (var i = 4, n = ast.length; i < n; ++i) {
        decls = set_union(decls, var_scoped_decls(ast[i]));
        decls = set_union(decls, let_scoped_decls(ast[i]));
      }
      if ('IdPatt' === nameOrEmpty[0]) {
        decls = set_union(decls, set_singleton(nameOrEmpty[1].name));
      }
      for (var i = 2, n = formals.length; i < n; ++i) {
        decls = set_union(decls, formals[i][1].name);
      }
      names = set_difference(names, decls);
      break;
    case 'TryCatchStmt': case 'TryCatchFinallyStmt':
      // children are 2: try-body, 3: ex-name, 4: catch-body, 5: finally-body
      names = set_union(
          required_names(ast[2], opt_exclusions),
          set_difference(required_names(ast[4], opt_exclusions),
                         set_singleton(ast[3][1].name)));
      if (ast.length > 5) {  // has finally clause
        names = set_union(names, required_names(ast[5], opt_exclusions));
      }
      break;
    default:
      names = EMPTY_SET;
      for (var i = 2, n = ast.length; i < n; ++i) {
        names = set_union(names, required_names(ast[i], opt_exclusions));
      }
      break;
  }
  return set_difference(names, let_scoped_decls(ast));
};

function required_labels_recurse(ast) {
  var labels = EMPTY_SET;
  for (var i = 2, n = ast.length; i < n; ++i) {
    labels = set_union(labels, required_labels(ast[i]));
  }
  return labels;
}

free_labels = required_labels = function (ast) {
  var labels;
  switch (ast[0]) {
    case 'BreakStmt':
      labels = set_singleton(ast[1].label || 'default');
      break;
    case 'ContinueStmt':
      labels = set_singleton('continue ' + (ast[1].label || 'default'));
      break;
    case 'ReturnStmt':
      labels = RETURN;
      break;
    case 'ForStmt':
    case 'ForInStmt':
    case 'WhileStmt':
    case 'DoWhileStmt':
      labels = required_labels_recurse(ast);
      labels = set_difference(labels, LOOP_DEFAULTS);
      break;
    case 'LabelledStmt':
      labels = required_labels(ast[2]);
      var label;
      switch (ast[2][0]) {
        case 'ForStmt':
        case 'ForInStmt':
        case 'WhileStmt':
        case 'DoWhileStmt':
          label = ast[1].label;
          labels = set_difference(
              labels,
              set_union(set_singleton(label),
                        set_singleton('continue ' + label)));
          break;
        default:
          label = ast[1].label;
          labels = set_difference(labels, set_singleton(label));
          break;
      }
      break;
    case 'SwitchStmt':
      labels = required_labels_recurse(ast);
      labels = set_difference(labels, DEFAULT_LABEL);
      break;
    case 'FunctionDecl': case 'FunctionExpr':
      labels = EMPTY_SET;
      break;
    default:
      labels = required_labels_recurse(ast);
      break;
  }
  return labels;
};

free_names = function (ast, opt_exclusions) {
  return set_union(
      required_names(ast, opt_exclusions),
      set_union(let_scoped_decls(ast), var_scoped_decls(ast)));
};

})();
