/**
 * Produces an ES syntax tree by invoking an untrusted macro handler and
 * rewriting the result to preserve hygiene.
 *
 * <p>
 * This code seeks to preserve the following security property:
 * <blockquote>
 *     A quasi handler can cause code to be evaluated but can only bind
 *     to identifiers in the macro scope that appears in a substitution.
 *     A quasi handler can raise exceptions as a side effect, but cannot
 *     jump to any labels defined in surrounding code not mentioned
 *     in a substitution and cannot cause a return from the containing
 *     function.
 * </blockquote>
 *
 * <p>
 * This code relies on other modules to function correctly to preserve
 * its security properties.  Specifically, <ol>
 * <li>It relies on {@code Object.freeze} to preserve the integrity of
 *     capabilities, and so cannot preserve its security properties on
 *     versions of EcmaScript < 5.  This could be corrected by passing
 *     a copy of capabilities to the handler, and replacing that copy
 *     with the original post alpha-rename.
 * <li>It relies on "freevars.js" to not undercount free identifiers.
 *     "freevars.js" is known to be incorrect around "with" blocks
 *     but not in a way that undercounts.
 * <li>It relies on "alpharename.js" to copy the parse tree, and to
 *     correctly distinguish read contexts from write contexts when
 *     exempting capabilities from renaming.  It does not rely on it
 *     to function correctly otherwise.
 * <li>It relies on ES5Parser to make the same token-boundary decisions as
 *     the built-in interpreter's parser.  This can be corrected by
 *     returning the parse tree directly instead of returning the rendered
 *     version.  It does not rely on ES5Parser to correctly parse the
 *     output of renderEcmascript given a well-formed parse tree.
 * <li>It relies on ES5Parser to correctly parse substitutions that
 *     express user intent.  Substitutions are from the user, and so
 *     are trusted unlike the output from the quasi handler so this does not
 *     contradict the previous bullet point.
 * </ol>
 *
 * @param qfnName the name of the quasi-handler in the scope in which the
 *   quasi appears.
 * @param qfn the quasi-handler.  This is untrusted code that is called to
 *   expand the macro into an EcmaScript AST.
 * @param literalPortions an array of strings of raw macro text.  These convey
 *   information but not authority.
 * @param substitutions an array of strings of raw substitution text.
 *   These are expressions in the macro author's scope that the macro author
 *   intends to make available to the quasi-handler.
 * @see <a href=
 *  "http://wiki.ecmascript.org/doku.php?id=strawman:quasis-alt#hygienic_macros"
 *  >strawman</a>
 * @provides hygienicMacro
 * @requires JSON, set_union, EMPTY_SET, renderEcmascript, ES5Parser,
 *   alphaRename, free_names, free_labels
 * @author mikesamuel@gmail.com
 */
function hygienicMacro(qfnName, qfn, literalPortions, substitutions) {
  if (typeof qfnName !== 'string') { throw new Error('qfnName: ' + qfnName); }
  if (typeof qfn !== 'function') { throw new Error('qfn: ' + qfn); }

  // Parse substitutions and generate a list of read and write capabilities
  // to grant to qfn.
  var readCaps = [ ['IdExpr', { name: qfnName } ] ];
  var writeCaps = [];
  for (var i = 0, n = substitutions.length; i < n; ++i) {
    var sub = '' + substitutions[i];
    var isWritable = false;
    if (sub.substring(0, 2) === '(=') {
      isWritable = true;
      sub = '( ' + sub.substring(2);
    }
    var prod;  // In what context do we parse?
    if (!isWritable && /^\s*let\s/.test(sub)) {
      prod = 'LetDecl';
      sub = sub.replace(/^\(|\)$/g, ' ');
    } else {
      // Since the input must start and end with parentheses by the
      // QuasiSubstitution grammar, this will parse as '(' Expression ')'.
      prod = 'PrimaryExpression';
    }
    // We rely on deepFreeze to ensure that ocap expresses macro author intent.
    var ocap = deepFreeze(ES5Parser.matchAll(sub, prod, [], function () {}));
    if (!ocap) {
      throw new Error('Failed to parse substitution "' + sub + '"');
    }
    readCaps.push(ocap);
    if (isWritable) { writeCaps.push(ocap); }
  }

  // Pass literal portions as string literals so there is a place
  // to embed source position info and other details.
  var literals = [];
  for (var i = 0, n = literalPortions.length; i < n; ++i) {
    literals[i] = deepFreeze(
        ['LiteralExpr', { type: 'string', value: literalPortions[i] }]);
  }

  // Untrusted: may not be JSON.
  var expandedQuasi = qfn(deepFreeze(arrayCopy(literals)),
                          deepFreeze(arrayCopy(readCaps)));

  // Create a namer that will not introduce any names that conflict
  // with identifiers used in caps.
  var namer = (function () {
    var freeCaps = EMPTY_SET;  // All free names in the substitutions.
    for (var i = 0, n = readCaps.length; i < n; ++i) {
      var ocap = readCaps[i];
      freeCaps = set_union(
          freeCaps, set_union(free_names(ocap), free_labels(ocap)));
    }
    var freeCapMap = {};
    for (var i = freeCaps.length; --i >= 0;) {
      freeCapMap[freeCaps[i]] = true;
    }
    var nameCounter = 0;
    return function () {
      var name;
      do {
        name = '$' + nameCounter;
        if (nameCounter === ++nameCounter) { throw 'overflow'; }
      } while (name in freeCapMap);
      return name;
    };
  })();

  // The renamer copies the tree, so this output is guaranteed valid JSON
  // without sharp edges such as getters/setters that camoflage bad data.
  // It is not guaranteed to be a well-formed parse tree.
  var hygienicQuasi = alphaRename(expandedQuasi, namer, readCaps, writeCaps);
  // We do not rely on the alpha renamer to function correctly to preserve
  // security properties, but do rely on it return valid JSON given valid
  // JSON, and do rely on it to not allow a writeCap where only a readCap
  // is allowed.

  // Check that the alpha renamed result has no free variables besides those
  // in capabilities.
  var freeNamesInQuasi = free_names(hygienicQuasi, readCaps);
  if (freeNamesInQuasi.length !== 0) {
    throw new Error('Free variables ' + freeNamesInQuasi);
  }
  var freeLabelsInQuasi = free_labels(hygienicQuasi, readCaps);
  if (freeLabelsInQuasi.length !== 0) {
    throw new Error('Free labels ' + freeLabelsInQuasi);
  }
  // Now we know that the AST is valid JSON without booby-traps, has no free
  // variables outside nodes parsed from user-provided substitutions, and
  // has had generated identifiers renamed to preserve hygiene.
  // We still cannot trust that the AST is well-formed.  We do a render and
  // reparse followed by a structural similarity check to enforce
  // well-formedness.
  return requireWellFormedAst(hygienicQuasi);

  function requireWellFormedAst(ast) {
    var src = renderEcmascript(ast);
    var prog = ES5Parser.matchAll(src, 'Program', [], function () {});
    if (!prog) {
      throw new Error('Malformed parse tree rendered to "' + src + '"');
    }
    requireStructuralSimilarity(ast, prog);
    return src;

    function requireStructuralSimilarity(a, b, swapped) {
      while (a.length === 3 && (a[0] === 'BlockStmt' || a[0] === 'Program')) {
        a = a[2];
      }
      while (b.length === 3 && (b[0] === 'BlockStmt' || b[0] === 'Program')) {
        b = b[2];
      }
      var n = a.length;
      if (a[0] === b[0] && n === b.length
          && (n === 1 || (a[1].name === b[1].name
                          && a[1].label === b[1].label
                          && a[1].op === b[1].op
                          && a[1].value === b[1].value))) {
        for (var i = 2; i < n; ++i) {
          requireStructuralSimilarity(a[i], b[i], swapped);
        }
        return;
      }
      var t;
      if (a[0] > b[0]) {
        t = a;
        a = b;
        b = t;
        n = a.length;
        swapped = !swapped;
      }
      // There are two ways to represent a.b(...)
      if (a[0] === 'CallExpr' && b[0] === 'InvokeExpr'
          && a[2][0] === 'MemberExpr' && n + 1 === b.length) {
        requireStructuralSimilarity(a[2][2], b[2]);
        requireStructuralSimilarity(a[2][3], b[3]);
        for (var i = 3; i < n; ++i) {
          requireStructuralSimilarity(a[i], b[i + 1], swapped);
        }
        return;
      }
      // Swap back before composing the error message so that we can distinguish
      // the expected from the actual.
      if (swapped) {
        t = a;
        a = b;
        b = t;
      }
      throw new Error('Malformed parse tree ' + JSON.stringify(a)
                      + ' produced {{ ' + renderEcmascript(a) + ' }} but cannot'
                      + ' reconcile with {{ ' + renderEcmascript(b) + ' }}');
    }
  }

  function deepFreeze(jsonObj) {
    if (typeof jsonObj !== 'object' || !jsonObj) { return; }
    Object.freeze(jsonObj);
    for (var i = 0, n = jsonObj.length || 0; i < n; ++i) {
      deepFreeze(jsonObj[i]);
    }
    // We could descend into named properties of objects, but this would
    // increase the risk of inf. loops and the alpha renamer is careful not
    // to copy non-primitive properties of JSON AST attribute maps.
    return jsonObj;
  }

  function arrayCopy(arr) {
    var out = [];
    for (var i = arr.length; --i >= 0;) { out[i] = arr[i]; }
    return out;
  }
}
