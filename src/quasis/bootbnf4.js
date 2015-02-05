
(function() {
  "use strict";
  
  var SPACE_RE = /\s+/;
  var NUMBER_RE = /\d+(?:\.\d+)?(?:[eE]-?\d+)?/;
  var STRING_RE = /\"(?:[^\"]|\\"|\\\\|\\\/|\\b|\\f|\\n|\\r|\\t|\\u[\da-fA-F][\da-fA-F][\da-fA-F][\da-fA-F])*\"/;
  var IDENT_RE = /[a-zA-Z_\$][\w\$]*/;
  var SINGLE_OP = /[\[\]\(\){},;]/;
  var MULTI_OP = /[:~@#%&+=*<>.?|\\\-\^\/]+/;
  var LINE_COMMENT_RE = /#.*\n/;
  
  var TOKEN_RE_SRC = '(' + [
    SPACE_RE,
    NUMBER_RE,
    STRING_RE,
    IDENT_RE,
    SINGLE_OP,
    MULTI_OP,
    LINE_COMMENT_RE
  ].map(re => re.source).join('|') + ')';
  
  function allRE(re) {
    return RegExp('^' + re.source + '$', re.flags);
  }
  
  function* tokensGen1(literalPart, re) {
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
  }
  
  function* tokensGen(rawTemplate, re) {
    const numSubs = rawTemplate.length - 1;
    for (var i = 0; i < numSubs; i++) {
      yield* tokensGen1(rawTemplate[i], re);
      yield i;
    }
    yield* tokensGen1(rawTemplate[numSubs], re);
  }
  
  function Scanner(rawTemplate, tokenTypeList) {
    // TODO(erights): Calculate re using tokenTypeList
    const tokenTypes = new Set(tokenTypeList);
    const re = RegExp(TOKEN_RE_SRC, 'g');
    var toks = [...tokensGen(rawTemplate, re)];
  
    const fail = Object.freeze({toString: () => 'fail'});
    const eof = Object.freeze({toString: () => 'eof'});
    var pos = 0;
  
    const scanner = Object.freeze({
      get pos() { return pos; },
      set pos(oldPos) { pos = oldPos; },
  
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
      eatIDENT: function() { 
        if (pos >= toks.length) { return fail; }
        var result = toks[pos];
        // It's an identifier if it matches IDENT_RE and it's not a keyword
        if (allRE(IDENT_RE).test(result) &&
            !tokenTypes.has(JSON.stringify(result))) {
          return toks[pos++];
        }
        return fail;
      },
      eatHOLE: function() {
        if (pos >= toks.length) { return fail; }
        if (typeof toks[pos] === 'number') {
          return toks[pos++];
        }
        return fail;
      },
      eatEOF: function() { return pos >= toks.length ? eof : fail; }
    });
    return scanner;
  }
  
  
  function quasiMemo(quasiCurry) {
    const wm = new WeakMap();
    return function(template, ...subs) {
      var quasiRest = wm.get(template);
      if (!quasiRest) {
        quasiRest = quasiCurry(template);
        wm.set(template, quasiRest);
      }
      if (typeof quasiRest !== 'function') {
        throw new Error(`${typeof quasiRest}: ${quasiRest}`);
      }
      return quasiRest(...subs);
    }
  }
  
  
  function simple(prefix, list) {
    if (list.length === 0) { return ['empty']; }
    if (list.length === 1) { return list[0]; }
    return [prefix, ...list];
  }
  
  function indent(str, newnewline) {
    return str.replace(/\n/g, newnewline);
  }
  
  function compile(sexp) {
    var numSubs = 0;
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
          // The following line also initializes tokenTypes and numSubs
          const rulesSrc = rules.map(peval).join('');
  
          const paramSrcs = [];
          for (var i = 0; i < numSubs; i++) {
            paramSrcs.push(`act_${i}`)
          }
          const tokenTypeListSrc = 
                `[${[...tokenTypes].map(tt => JSON.stringify(tt)).join(', ')}]`;
          return (
`(function(${paramSrcs.join(', ')}) {
  return function(template) {
    const scanner = Scanner(template.raw, ${tokenTypeListSrc});
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
          numSubs = Math.max(numSubs, hole + 1);
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
        if (allRE(STRING_RE).test(sexp)) {
          tokenTypes.add(sexp);
          return `value = scanner.eat(${sexp});`;
        }
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
        throw new Error('unexpected: ' + sexp);
      }        
      return vtable[sexp[0]](...sexp.slice(1));
    }
  
    return peval(sexp);
  }
  
  function doArith(bnf) {
    return bnf`
      start ::= expr EOF  ${(v,_) => v};
      expr ::= 
        term "+" expr     ${(a,_,b) => (...subs) => a(...subs) + b(...subs)}
      | term;
      term ::=
        NUMBER            ${n => (..._) => JSON.parse(n)}
      | HOLE              ${(h) => (...subs) => subs[h]}
      | "(" expr ")"      ${(_,v,_2) => v};
     `;
  }

  function testArith(arith, left, right, answer) {
    if (arith`1 + (2 + ${left} + ${right}) + 4` !== answer) {
      throw Error('arith template handler did not work');
    }
  };


  var arithRules = [
   ['def','start',['act',['expr','EOF'],0]],
   ['def','expr',['or',['act',['term','"+"','expr'],1],
                  'term']],
   ['def','term',['or',['act',['NUMBER'],2],
                  ['act',['HOLE'],3],
                  ['act',['"("','expr','")"'],4]]]];
  
  
  var arithActions = doArith((_, ...actions) => actions);

  // TODO(erights): really confine
  function confine(expr, env) {
debugger;
    var names = Object.getOwnPropertyNames(env);
    var closedFuncSrc = 
`(function(${names.join(',')}) {
  "use strict";
  return ${expr};
})`
    var closedFunc = (1,eval)(closedFuncSrc);
    return closedFunc(...names.map(n => env[n]));
  }
  
  function metaCompile(baseRules, _=void 0) {
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
  
  testArith(arith, 33, 44, 84);

  function doBnf(bnf) {
    return bnf`
      bnf ::= rule+ EOF              ${metaCompile};
      rule ::= IDENT "::=" body ";"  ${(name,_,body,_2) => ['def', name, body]};
      body ::= choice ** "|"         ${list => simple('or', list)};
      choice ::=
        term* HOLE                   ${(list,hole) => ['act', list, hole]}
      | seq;
      seq ::= term*                  ${list => simple('seq', list)};
      term ::= 
        prim ("**" | "++") prim      ${(patt,q,sep) => [q, patt, sep]}
      | prim ("?" | "*" | "+")       ${(patt,q) => [q, patt]}
      | prim;
      prim ::=
        STRING | IDENT
      | "NUMBER" | "STRING" | "IDENT" | "HOLE" | "EOF"
      | "(" body ")"                 ${(_,b,_2) => b};
    `;
  }    
  
  var bnfRules = [
   ['def','bnf',['act',[['+','rule'],'EOF'], 0]],
   ['def','rule',['act',['IDENT','"::="','body','";"'], 1]],
   ['def','body',['act',[['**','choice','"|"']], 2]],
   ['def','choice',['or',['act',[['*','term'],'HOLE'], 3],
                    'seq']],
   ['def','seq',['act',[['*','term']], 4]],
   ['def','term',['or',['act',['prim',['or','"**"','"++"'],'prim'], 5],
                  ['act',['prim',['or','"?"','"*"','"+"']], 6],
                  'prim']],
   ['def','prim',['or','STRING','IDENT',
                  '"NUMBER"','"STRING"','"IDENT"','"HOLE"','"EOF"',
                  ['act',['"("','body','")"'], 7]]]];
  
  var bnfActions = doBnf((_, ...actions) => actions);
  
  var bnf = metaCompile(bnfRules)(...bnfActions);
  
  testArith(doArith(bnf), 33, 44, 84);
  
  testArith(doArith(doBnf(bnf)), 33, 44, 84);

}());
