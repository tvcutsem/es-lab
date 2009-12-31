/**
 * Converts an AST back to its textual form.
 * @author mikesamuel@gmail.com
 * @provides renderEcmascript
 * @requires JSON
 */
function renderEcmascript(ast) {
  var STMT_END = new String('}');
  var FN_EXPR_START = new String('function ');
  var OBJ_LIT_START = new String('{');
  var PRECEDENCE_1 = { IdExpr: true, ThisExpr: true, LiteralExpr: true,
                       MemberExpr: true, ObjectExpr: true };
  var OP_BY_TYPE = { TypeofExpr: 'typeof', DeleteExpr: 'delete' };
  var out = [];
  function parenthesize(ast, parens) {
    if (parens) { out.push('('); }
    render(ast);
    if (parens) { out.push(')'); }
  }

  function renderStmt(ast) {
    var i = out.length;
    render(ast);
    if (out[i] === FN_EXPR_START || out[i] === OBJ_LIT_START) {
      out.splice(i, 0, '(');
      out.push(')');
    }
  }

  function endStatement() {
    var n = out.length;
    if (n) {
      var last = out[n - 1];
      if (last === STMT_END || last === ';') { return; }
    }
    out[n] = ';';
  }

  function render(ast) {
    var type = ast[0];
    switch (type) {
      case 'Program':
        for (var i = 2, n = ast.length; i < n; ++i) {
          if (i > 2) { endStatement(); }
          renderStmt(ast[i]);
        }
        break;
      case 'BlockStmt':
        out.push('{');
        for (var i = 2, n = ast.length; i < n; ++i) {
          if (i > 2) { endStatement(); }
          renderStmt(ast[i]);
        }
        out.push(STMT_END);
        break;
      case 'IdExpr': case 'IdPatt': out.push(ast[1].name); break;
      case 'ThisExpr': out.push('this'); break;
      case 'LiteralExpr': out.push(JSON.stringify(ast[1].value)); break;
      case 'VarDecl':
        out.push('var ');
        for (var i = 2, n = ast.length; i < n; ++i) {
          if (i !== 2) { out.push(','); }
          render(ast[i]);
        }
        break;
      case 'InitPatt':
        render(ast[2]);
        out.push('=');
        render(ast[3]);
        break;
      case 'NewExpr':
        out.push('new ');
        // $fall-through$
      case 'CallExpr':
        parenthesize(ast[2], PRECEDENCE_1[ast[2][0]] !== true);
        out.push('(');
        for (var i = 3, n = ast.length; i < n; ++i) {
          if (i !== 3) { out.push(','); }
          render(ast[i]);
        }
        out.push(')');
        break;
      case 'InvokeExpr':
        var fakeCall = ['CallExpr', ast[1], ['MemberExpr', {}, ast[2], ast[3]]];
        fakeCall.push.apply(fakeCall, ast.slice(4));
        render(fakeCall);
        break;
      case 'ObjectExpr':
        out.push(OBJ_LIT_START);
        for (var i = 2, n = ast.length; i < n; ++i) {
          if (i !== 2) { out.push(','); }
          render(ast[i]);
        }
        out.push('}');
        break;
      case 'ArrayExpr':
        out.push('[');
        for (var i = 2, n = ast.length; i < n; ++i) {
          if (i !== 2) { out.push(','); }
          render(ast[i]);
        }
        out.push(']');
        break;
      case 'RegExpExpr':
        out.push('(/', ast[1].body, '/', ast[1].flags || '', ')');
        break;
      case 'DataProp':
        out.push(JSON.stringify(ast[1].name), ':');
        render(ast[2]);
        break;
      case 'GetterProp':
      case 'SetterProp':
        out.push(type === 'GetterProp' ? 'get ' : 'set ',
                 JSON.stringify(ast[1].name));
        render(ast[2][3]);
        out.push('{');
        for (var i = 4, n = ast[2].length; i < n; ++i) {
          if (i !== 4) { endStatement(); }
          renderStmt(ast[2][i]);
        }
        out.push(STMT_END);
        break;
      case 'FunctionDecl': case 'FunctionExpr':
        var isExpr = type === 'FunctionExpr';
        if (isExpr) {  // See renderStmt
          out.push(FN_EXPR_START);
        } else {
          out.push('function ');
        }
        render(ast[2]);
        render(ast[3]);
        out.push('{');
        for (var i = 4, n = ast.length; i < n; ++i) {
          if (i !== 4) { endStatement(); }
          render(ast[i]);
        }
        out.push(isExpr ? '}' : STMT_END);
        break;
      case 'ParamDecl':
        out.push('(');
        for (var i = 2, n = ast.length; i < n; ++i) {
          if (i !== 2) { out.push(','); }
          render(ast[i]);
        }
        out.push(')');
        break;
      case 'Empty': break;
      case 'EmptyStmt': out.push(';'); break;
      case 'BreakStmt':
        out.push('break');
        if (ast[1].label) {
          out.push(' ', ast[1].label);
        }
        break;
      case 'ContinueStmt':
        out.push('continue');
        if (ast[1].label) {
          out.push(' ', ast[1].label);
        }
        break;
      case 'ReturnStmt':
        out.push('return');
        if (ast.length > 2) {
          out.push(' ');
          render(ast[2]);
        }
        break;
      case 'ThrowStmt':
        out.push('throw ');
        render(ast[2]);
        break;
      case 'UnaryExpr': case 'TypeofExpr': case 'DeleteExpr':
        var op = ast[1].op || OP_BY_TYPE[type];
        out.push(op);
        if (/\w$/.test(op)) { out.push(' '); }
        parenthesize(ast[2], PRECEDENCE_1[ast[2][0]] !== true);
        break;
      case 'AssignExpr': case 'BinaryExpr': case 'MemberExpr':
        var symbol = type === 'MemberExpr' ? '[' : ast[1].op;
        // Always parenthesize comma ops since it's used in many other contexts.
        if (symbol === ',') { out.push('('); }
        var leftType = ast[2][0], rightType = ast[3][0];
        // Parenthesize the left argument of a div operator to make sure it's
        // interpreted as a division.
        parenthesize(
            ast[2], /^\//.test(symbol) || PRECEDENCE_1[leftType] !== true);
        if (/\w/.test(symbol)) {
          out.push(' ', symbol, ' ');
        } else {
          out.push(symbol);
        }
        parenthesize(ast[3], PRECEDENCE_1[rightType] !== true);
        if (symbol === ',') { out.push(')'); }
        else if (symbol === '[') { out.push(']'); }
        break;
      case 'CountExpr':
        var isPrefix = ast[1].isPrefix;
        if (isPrefix) { out.push(ast[1].op); }
        parenthesize(ast[2], PRECEDENCE_1[ast[2][0]] !== true);
        if (!isPrefix) { out.push(ast[1].op); }
        break;
      case 'IfStmt':
        out.push('if ');
        parenthesize(ast[2], true);
        // TODO: hanging else
        renderStmt(ast[3]);
        endStatement();
        if (ast[4][0] !== 'EmptyStmt') {
          out.push('else ');
          renderStmt(ast[4]);
          endStatement();
        }
        break;
      case 'LabelledStmt':
        out.push(ast[1].label, ':');
        renderStmt(ast[2]);
        break;
      case 'ForStmt':
        out.push('for (');
        render(ast[2]);
        out.push(';');
        render(ast[3]);
        out.push(';');
        render(ast[4]);
        out.push(')');
        renderStmt(ast[5]);
        break;
      case 'ForInStmt':
        out.push('for (');
        render(ast[2]);
        out.push(' in ');
        render(ast[3]);
        out.push(')');
        renderStmt(ast[4]);
        break;
      case 'DoWhileStmt':
        out.push('do ');
        renderStmt(ast[2]);
        out.push(' while (');
        render(ast[3]);
        out.push(')');
        break;
      case 'WhileStmt':
        out.push('while (');
        render(ast[2]);
        out.push(')');
        renderStmt(ast[3]);
        break;
      case 'TryCatchFinallyStmt':
      case 'TryCatchStmt':
        out.push('try ');
        renderStmt(ast[2]);
        out.push(' catch (');
        render(ast[3]);
        out.push(')');
        renderStmt(ast[4]);
        if (ast.length > 5) {
          out.push(' finally ');
          renderStmt(ast[5]);
        }
        break;
      case 'TryFinallyStmt':
        out.push('try ');
        renderStmt(ast[2]);
        out.push(' finally ');
        renderStmt(ast[3]);
        break;
      case 'SwitchStmt':
        out.push('switch (');
        renderStmt(ast[2]);
        out.push('){');
        for (var i = 3, n = ast.length; i < n; ++i) {
          render(ast[i]);
        }
        out.push(STMT_END);
        break;
      case 'Case':
        out.push('case ');
        renderStmt(ast[2]);
        out.push(':');
        for (var i = 3, n = ast.length; i < n; ++i) {
          render(ast[i]);
          endStatement();
        }
        break;
      case 'DefaultCase':
        out.push('default:');
        for (var i = 2, n = ast.length; i < n; ++i) {
          render(ast[i]);
          endStatement();
        }
        break;
      case 'WithStmt':
        out.push('with(');
        render(ast[2]);
        out.push(')');
        renderStmt(ast[3]);
        break;
      default: throw 'rendering not implemented ' + type;
    }
  }
  renderStmt(ast);
  return out.join('');
}