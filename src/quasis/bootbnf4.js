
var SPACE_RE = /\s+/;
var NUMBER_RE = /\d+(?:\.\d+)?(?:[eE]-?\d+)?/;
var IDENT_RE = /[a-zA-Z_\$][\w\$]*/;
var STRING_RE = /\"(?:[^\"]|\\"|\\\\|\\\/|\\b|\\f|\\n|\\r|\\t|\\u[\da-fA-F][\da-fA-F][\da-fA-F][\da-fA-F])*\"/;
var SINGLE_OP = /[\[\]\(\){},;]/;
var MULTI_OP = /[:~@#%&+=*<>.?|\\\-\^\/]+/;
var LINE_COMMENT_RE = /#.*\n/;

var TOKEN_RE_SRC = '(' + [
  SPACE_RE,
  NUMBER_RE,
  IDENT_RE,
  STRING_RE,
  SINGLE_OP,
  MULTI_OP,
  LINE_COMMENT_RE
].map(re => re.source).join('|') + ')';

function allRE(re) {
  return RegExp('^' + re.source + '$', re.flags);
}

function* tokensGen1(literalPart, tokenReSrc) {
  "use strict";

  var expectedIndex = 0;
  const RE = RegExp(tokenReSrc, 'g');

  while (true) {
    const arr = RE.exec(literalPart);
    if (arr === null) { return; }
    const tok = arr[1];
    const actualStart = RE.lastIndex - tok.length;
    if (expectedIndex !== actualStart) {
      throw new Error(`unexpected ${expectedIndex}:${actualStart}:
  "${literalPart.slice(expectedIndex,actualStart)}"`);
    }
    expectedIndex = RE.lastIndex;
    if (allRE(SPACE_RE).test(tok)) {
      continue;
    }
    if (allRE(LINE_COMMENT_RE).test(tok)) {
      continue;
    }
    yield tok;
  }
  return 'EOF';
}

function* tokensGen(literalParts) {
  "use strict";
  const numArgs = literalParts.length - 1;
  for (var i = 0; i < numArgs; i++) {
    yield* tokensGen1(literalParts[i], TOKEN_RE_SRC);
    yield i;
  }
  yield* tokensGen1(literalParts[numArgs], TOKEN_RE_SRC);
}

function tokens(codesite, ...args) {
  "use strict";
  return tokensGen(codesite.raw);
}

function quasiMemo(quasiCurry) {
  const wm = new WeakMap();
  return function(codesite, ...args) {
    var quasiRest = wm.get(codesite);
    if (!quasiRest) {
      quasiRest = quasiCurry(codesite);
      wm.set(codesite, quasiRest);
    }
    return quasiRest(...args);
  }
}


function simple(prefix, list) {
  "use strict";
  if (list.length === 0) { return ['empty']; }
  if (list.length === 1) { return list[0]; }
  return [prefix, ...list];
}

function indent(str, newnewline) {
  return str.replace(/\n/g, newnewline);
}

function compile(sexp, numArgs) {
  "use strict";

  const paramSrcs = [];
  for (var i = 0; i < numArgs; i++) {
    paramSrcs.push(`act_${i}`)
  }

  const literals = new Set();

  const vars = [];
  function nextVar(name) {
    const result = `v${vars.length}_${name}`;
    vars.push(result);
    return result;
  }
  function takeVarsSrc() {
    const result = vars.length === 0 ? '' : 
`var ${vars.join(', ')};
`;
    vars.length = 0;
    return result;
  }

  function peval(sexp) {
    const vtable = Object.freeze({
      bnf: function(...rules) {
        const startSrc = peval(rules[0][1]);
        // The following line also initializes literals
        const rulesSrc = rules.map(peval).join('');

        const literalsSrc = `[${[...literals].join(', ')}]`;
        return (
`function(${paramSrcs.join(', ')}) {
  "use strict";
  return function(codesite) {
    const context = Context(codesite, ${literalsSrc});
    const fail = context.fail;
    ${indent(rulesSrc,`
    `)}return ${startSrc};
  };
}
`);
      },
      def: function(name, body) {
        // The following line also initializes vars
        const bodySrc = peval(body);
        return (
`function rule_${name}() {
  ${indent(takeVarsSrc(),`
  `)}return ${indent(bodySrc,`
  `)};
}
`);
      },
      empty: function() {
        return `[]`;
      },
      fail: function() {
        return `fail`;
      },
      or: function(...choices) {
        const posSrc = nextVar('pos');
        const resultSrc = nextVar('result');
        const choicesSrc = choices.map(peval).map(cSrc =>
`if (fail !== (${resultSrc} = ${indent(cSrc,`
               `)})) { return ${resultSrc}; }
context.reset(${posSrc});
`).join('');

        return (
`(() => {
  ${posSrc} = context.pos;
  ${indent(choicesSrc,`
  `)}return fail;
}())`);
      },
      act: function(terms, hole) {
        const posSrc = nextVar('pos');
        const resultSrc = nextVar('result');
        const valsSrc = nextVar('vals');
        const termsSrc = vtable.seq(...terms);
        return (
`(() => {
  ${posSrc} = context.pos;
  if (fail === (${valsSrc} = ${indent(termsSrc,`
                `)})) { return fail; }
  if (fail === (${resultSrc} = ${paramSrcs[hole]}(...${valsSrc}))) {
    context.reset(${posSrc});
  }
  return ${resultSrc};
}())`);
      },
      seq: function(...terms) {
        const posSrc = nextVar('pos');
        const resultSrc = nextVar('result');
        const valsSrc = nextVar('vals');
        const termsSrc = terms.map(peval).map(termSrc =>
`${resultSrc};
if (fail === (${resultSrc} = ${indent(termSrc,`
              `)})) { return context.reset(${posSrc}); }
${valsSrc}.push(${resultSrc});
`).join('');

        return (
`(() => {
  ${valsSrc} = [];
  ${posSrc} = context.pos;
  ${indent(termsSrc,`
  `)}return ${valsSrc};
}())`);
      },
      '**': function(patt, sep) {
        const posSrc = nextVar('pos');
        const resultSrc = nextVar('result');
        const valsSrc = nextVar('vals');
        const pattSrc = peval(patt);
        const sepSrc = peval(sep);
        return (
`(() => {
  ${valsSrc} = [];
  ${posSrc} = context.pos;
  while (true) {
    ${resultSrc};
    if (fail === (${resultSrc} = ${indent(pattSrc,`
                  `)})) {
      // after first iteration, backtrack to before the separator
      context.reset(${posSrc});
      return ${valsSrc};
    }
    ${valsSrc}.push(${resultSrc});
    ${posSrc} = context.pos;
    if (fail === (${indent(sepSrc,`
                  `)})) {
      context.reset(${posSrc});
      return ${valsSrc};
    }
  }
}())`);
      },
      '++': function(patt, sep) {
        const resultSrc = nextVar('result');
        const starSrc = vtable['**'](patt, sep);
        return (
`((${resultSrc} = ${indent(starSrc,`
    `)}
  ).length === 0 ? fail : ${resultSrc})`);
      },
      '?': function(patt) {
        return vtable['**'](patt, ['fail']);
      },
      '*': function(patt) {
        return vtable['**'](patt, ['empty']);
      },
      '+': function(patt) {
        return vtable['++'](patt, ['empty']);
      }
    });

    if (typeof sexp === 'string') {
      if (allRE(IDENT_RE).test(sexp)) {
        return `rule_${sexp}()`;
      }
      if (allRE(STRING_RE).test(sexp)) {
        literals.add(sexp);
        return `context.eat(${sexp})`;
      }
      throw new Error('unexpected: ' + sexp);
    }        
    return vtable[sexp[0]](...sexp.slice(1));
  }

  return peval(sexp);
}

compile(['bnf', 
         ['def','f',['++','x','","']],
         ['def','x',['act',['x','y'], 1]]],
        3);
