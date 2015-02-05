
(function() {
  "use strict";
  
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
  
  function* tokensGen1(literalPart, re) {
    "use strict";
  
    var expectedIndex = 0;
    re.lastIndex = 0;
  
    while (true) {
      const arr = re.exec(literalPart);
      if (arr === null) { return; }
      const tok = arr[1];
      const actualStart = re.lastIndex - tok.length;
      if (expectedIndex !== actualStart) {
        throw new Error(`unexpected ${expectedIndex}:${actualStart}:
    "${literalPart.slice(expectedIndex,actualStart)}"`);
      }
      expectedIndex = re.lastIndex;
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
  
  function* tokensGen(rawTemplate, tokenTypes) {
    "use strict";
    // TODO(erights): Calculate re using tokenTypes
    const re = RegExp(TOKEN_RE_SRC, 'g');
    const numSubsts = rawTemplate.length - 1;
    for (var i = 0; i < numSubsts; i++) {
      yield* tokensGen1(rawTemplate[i], re);
      yield i;
    }
    yield* tokensGen1(rawTemplate[numSubsts], re);
  }
  
  function Scanner(rawTemplate, tokenTypes) {
    "use strict";
    var fail = Object.freeze({toString: () => 'fail'});
    var toks = [...tokensGen(rawTemplate, tokenTypes)];
  
    var pos = 0;
  
    const scanner = Object.freeze({
      get pos() { return pos; },
      set pos(oldPos) {
        if (oldPos < pos - 1) { debugger; }
        pos = oldPos;
      },
  
      try: function(thunk) {
        var oldPos = pos;
        var result = thunk();
        if (fail === result) {
          pos = oldPos;
        }
        return result;
      },
  
      fail: fail,
  
      eat: function(patt) {
        if (pos >= toks.length) { return fail; }
        var result = toks[pos];
        if ((typeof patt === 'string' && patt === result) ||
            (typeof result === 'string' && allRE(patt).test(result))) {
          return toks[pos++];
        }
        return fail;
      },
      eatNUMBER: function() { return scanner.eat(NUMBER_RE); },
      eatSTRING: function() { return scanner.eat(STRING_RE); },
      eatIDENT: function() { return scanner.eat(IDENT_RE); },
      eatHOLE: function() {
        if (pos >= toks.length) { return fail; }
        if (typeof toks[pos] === 'number') {
          return toks[pos++];
        }
        return fail;
      },
      eatEOF: function() { return pos >= toks.length ? 'EOF' : fail; }
    });
    return scanner;
  }
  
  
  function quasiMemo(quasiCurry) {
    const wm = new WeakMap();
    return function(template, ...substs) {
      var quasiRest = wm.get(template);
      if (!quasiRest) {
        quasiRest = quasiCurry(template);
        wm.set(template, quasiRest);
      }
      if (typeof quasiRest !== 'function') {
        throw new Error(`${typeof quasiRest}: ${quasiRest}`);
      }
      return quasiRest(...substs);
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
  
  function compile(sexp) {
    "use strict";
  
    var numSubsts = 0;
    const tokenTypes = new Set();
  
    var alphaCount = 0;
    // TODO(erights): Use lexical "let" once FF supports it.
    const vars = ['var value = fail'];
    function nextVar(prefix) {
      const result = `${prefix}_${alphaCount++}`;
      vars.push(result);
      return result;
    }
    function takeVarsSrc() {
      const result = `${vars.join(', ')};`;
      vars.length = 1;
      return result;
    }
    function nextLabel(prefix) {
      return `${prefix}_${alphaCount++}`;
    }
  
  
    function peval(sexp) {
      const vtable = Object.freeze({
        bnf: function(...rules) {
          // The following line also initializes tokenTypes and numSubsts
          const rulesSrc = rules.map(peval).join('');
  
          const paramSrcs = [];
          for (var i = 0; i < numSubsts; i++) {
            paramSrcs.push(`act_${i}`)
          }
          const tokenTypesSrc = 
                `[${[...tokenTypes].map(tt => JSON.stringify(tt)).join(', ')}]`;
          return (
`(function(${paramSrcs.join(', ')}) {
  "use strict";
  return function(template) {
    const scanner = Scanner(template.raw, ${tokenTypesSrc});
    const fail = scanner.fail;
    ${indent(rulesSrc,`
    `)}
    return rule_${rules[0][1]}();
  };
})
`);
        },
        def: function(name, body) {
          // The following line also initializes vars
          const bodySrc = peval(body);
          return (
`function rule_${name}() {
  ${takeVarsSrc()}
  ${indent(bodySrc,`
  `)}
  return value;
}
`);
        },
        empty: function() {
          return `value = [];`;
        },
        fail: function() {
          return `value = fail;`;
        },
        or: function(...choices) {
          const labelSrc = nextLabel('or');
          const choicesSrc = choices.map(peval).map(cSrc =>
`${cSrc}
if (value !== fail) break ${labelSrc};`).join('\n');

        return (
`${labelSrc}: {
  ${indent(choicesSrc,`
  `)}
}`);
        },
        seq: function(...terms) {
          const posSrc = nextVar('pos');
          const labelSrc = nextLabel('seq');
          const sSrc = nextVar('s');
          const vSrc = nextVar('v');
          const termsSrc = terms.map(peval).map(termSrc =>
`${termSrc}
if (value === fail) break ${labelSrc};
${sSrc}.push(value);`).join('\n');
  
          return (
`${sSrc} = [];
${vSrc} = fail;
${posSrc} = scanner.pos;
${labelSrc}: {
  ${indent(termsSrc,`
  `)}
  ${vSrc} = ${sSrc};
}
if ((value = ${vSrc}) === fail) scanner.pos = ${posSrc};`);
        },
        act: function(terms, hole) {
          numSubsts = Math.max(numSubsts, hole + 1);
          const termsSrc = vtable.seq(...terms);
          return (
`${termsSrc}
if (value !== fail) value = act_${hole}(...value);`);
        },
        '**': function(patt, sep) {
          const posSrc = nextVar('pos');
          const sSrc = nextVar('s');
          const pattSrc = peval(patt);
          const sepSrc = peval(sep);
          return (
// after first iteration, backtrack to before the separator
`${sSrc} = [];
${posSrc} = scanner.pos;
while (true) {
  ${indent(pattSrc,`
  `)}
  if (value === fail) {
    scanner.pos = ${posSrc};
    break;
  }
  ${sSrc}.push(value);
  ${posSrc} = scanner.pos;
  ${indent(sepSrc,`
  `)}
  if (value === fail) break;
}
value = ${sSrc};`);
        },
        '++': function(patt, sep) {
          const starSrc = vtable['**'](patt, sep);
          return (
`${starSrc}
if (value.length === 0) value = fail;`);
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
          switch (sexp) {
            case 'NUMBER': {
              tokenTypes.add(sexp);
              return `value = scanner.eatNUMBER();`;
            }
            case 'STRING': {
              tokenTypes.add(sexp);
              return `value = scanner.eatSTRING();`;
            }
            case 'IDENT': {
              tokenTypes.add(sexp);
              return `value = scanner.eatIDENT();`;
            }
            case 'HOLE': {
              return `value = scanner.eatHOLE();`;
            }
            case 'EOF': {
              return `value = scanner.eatEOF();`;
            }
            default: {
              // If it isn't a bnf keyword, assume it is a rule name.
              return `value = rule_${sexp}();`;
            }
          }
        }
        if (allRE(STRING_RE).test(sexp)) {
          tokenTypes.add(sexp);
          return `value = scanner.eat(${sexp});`;
        }
        throw new Error('unexpected: ' + sexp);
      }        
      return vtable[sexp[0]](...sexp.slice(1));
    }
  
    return peval(sexp);
  }
  
  var arithRules = [
   ['def','start',['act',['expr','EOF'],0]],
   ['def','expr',['or',['act',['term','"+"','expr'],1],
                  'term']],
   ['def','term',['or',['act',['NUMBER'],2],
                  ['act',['HOLE'],3],
                  ['act',['"("','expr','")"'],4]]]];
  
  
  var arithActions = [
    (v,_) => v,
    (a,_,b) => (...substs) => a(...substs) + b(...substs),
    n => (...substs) => JSON.parse(n),
    (h) => (...substs) => substs[h],
    (_1,v,_2) => v];

  // TODO(erights): really confine
  function confine(expr, env) {
    var names = Object.getOwnPropertyNames(env);
    var closedFuncSrc = 
`(function(${names.join(',')}) {
  "use strict";
  return ${expr};
})`
    var closedFunc = (1,eval)(closedFuncSrc);
    return closedFunc(...names.map(n => env[n]));
  }
  
  function metaCompile(baseRules) {
    var baseAST = ['bnf', ...baseRules];
    var baseSrc = compile(baseAST);
    var baseParser = confine(baseSrc, {
      Scanner: Scanner
    });
    return function(...baseActions) {
      var baseCurry = baseParser(...baseActions);
      return quasiMemo(baseCurry);
    };
  }
  
  var arith = metaCompile(arithRules)(...arithActions);
  
  if (84 !== arith`1 + (2 + ${33} + ${44}) + 4`) {
    throw Error('arith template handler did not work');
  }
  
  
  
  var bnfRules = [
   ['def','bnf',['act',[['*','rule'],'EOF'], 0]],
   ['def','rule',['act',['IDENT','"::="','body','";"'], 1]],
   ['def','body',['act',[['**','choice','"|"']], 2]],
   ['def','choice',['or',['act',[['*','term'],'"=>"','HOLE'], 3],
                    'seq']],
   ['def','seq',['act',[['*','term']], 4]],
   ['def','term',['or',['act',['prim',['or','"**"','"++"'],'prim'], 5],
                  ['act',['prim',['or','"?"','"*"','"+"']], 6],
                  'prim']],
   ['def','prim',['or','IDENT',
                  'STRING',
                  ['act',['"("','body','")"'], 7]]]];
  
  var bnfActions = [
    metaCompile,
    (n, _1, b, _2) => ['def', n, b],
    list => simple('or', list),
    (s, _, h) => ['act', s, h],
    list => simple('seq', list),
    (patt, q, sep) => [q, patt, sep],
    (patt, q) => [q, patt],
    (_1, b, _2) => b
  ];
  
  var bnf = metaCompile(bnfRules)(...bnfActions);
  
  
  var arith1 = bnf`
    start ::= expr EOF     => ${arithActions[0]};
    expr ::= 
      term "+" expr        => ${arithActions[1]}
    | term;
    term ::=
      NUMBER               => ${arithActions[2]}
    | HOLE                 => ${arithActions[3]}
    | "(" expr ")"         => ${arithActions[4]};
   `;
  
  if (84 !== arith1`1 + (2 + ${33} + ${44}) + 4`) {
    throw Error('arith1 template handler did not work');
  }
  
  
  var bnf1 = bnf`
    bnf ::= rule* EOF                 => ${bnfActions[0]};
    rule ::= IDENT "::=" body ";"     => ${bnfActions[1]};
    body ::= choice ** "|"            => ${bnfActions[2]};
    choice ::=
      term* "=>" HOLE                 => ${bnfActions[3]}
    | seq;
    seq ::= term*                     => ${bnfActions[4]};
    term ::= 
      prim ("**" | "++") prim         => ${bnfActions[5]}
    | prim ("?" | "*" | "+")          => ${bnfActions[6]}
    | prim;
    prim ::=
      IDENT
    | STRING
    | "(" body ")"                    => ${bnfActions[7]};
  `;
  
  var arith2 = bnf1`
    start ::= expr EOF     => ${arithActions[0]};
    expr ::= 
      term "+" expr        => ${arithActions[1]}
    | term;
    term ::=
      NUMBER               => ${arithActions[2]}
    | HOLE                 => ${arithActions[3]}
    | "(" expr ")"         => ${arithActions[4]};
   `;
  
  if (84 !== arith2`1 + (2 + ${33} + ${44}) + 4`) {
    throw Error('arith2 template handler did not work');
  }
}());
