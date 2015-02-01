
var SPACE_RE = /\s+/;
var NUM_RE = /\d+(?:\.\d+)?(?:[eE]-?\d+)?/;
var IDENT_RE = /[a-zA-Z_\$][\w\$]*/;
var STRING_RE = /\"(?:[^\"]|\\"|\\\\|\\\/|\\b|\\f|\\n|\\r|\\t|\\u[\da-fA-F][\da-fA-F][\da-fA-F][\da-fA-F])*\"/;
var SINGLE_OP = /[\[\]\(\){},;]/;
var MULTI_OP = /[:~@#%&+=*<>.?|\\\-\^\/]+/;
var LINE_COMMENT_RE = /#.*\n/;

var TOKEN_RE_SRC = '(' + [
  SPACE_RE,
  NUM_RE,
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
  var RE = RegExp(tokenReSrc, 'g');

  while (true) {
    var arr = RE.exec(literalPart);
    if (arr === null) { return; }
    var tok = arr[1];
    var actualStart = RE.lastIndex - tok.length;
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
  var numArgs = literalParts.length - 1;
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

//for (t of tokens`foo:~@% &+=*< #&comment**
// >,.?|\-^/[bar(--44,55.3e-4)"baz"]${Object}zip`) {
//  print(JSON.stringify(t));
//}

function JSONT() {
  "use strict";

  var holes = new Set();

  function Hole(n) {
    var tok = Object.freeze({hole: n});
    holes.add(tok);
    return tok;
  }

  function makeJSON(template) {
    return template;
  }

  return tokens`
    start ::= json                => ${makeJSON};
    json ::=
      "[" json**"," "]"           => ${(_1, vals, _2) => vals}
    | "{" pair**"," "}"           => ${(_1, pairs, _2) => {
                                        var rec = {};
                                        for (var [k,v] of pairs) { rec[k] = v; }
                                        return rec; }}
    | (STRING | NUMBER)           => ${JSON.parse}
    | ("true" | "false" | "null") => ${JSON.parse}
    | HOLE                        => ${Hole}
    | "@" HOLE                    => ${(_, n) => Hole(-n)}
    ;

    pair ::= STRING ":" json      => ${(k, _, v) => [k, v]};
  `;
}

// for (t of JSONT()) { print(JSON.stringify(t)); }

function quasiMemo(quasiCurry) {
  var wm = new WeakMap();
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
  if (list.length === 0) { return ['empty']; }
  if (list.length === 1) { return list[0]; }
  return [prefix, ...list];
}

function makeCompile(sexp, context) {
  var rules = new Map();
  rules.set('IDENT', function(...args) {
    return context.eat(IDENT_RE);
  });
  rules.set('NUMBER', function(...args) {
    return context.eat(NUMBER_RE);
  });
  rules.set('STRING', function(...args) {
    return context.eat(STRING_RE);
  });
  rules.set('HOLE', function(...args) {
    return context.eatHole();
  });
  var literals = new Set();
  
  function compile(sexp) {
    var vtable = Object.freeze({
      def: function(name, body) {
        rules.set(name, compile(body));
        return name;
      },
      rule: function(name) {
        return function(...args) {
          return rules.get(name)(...args);
        };
      },
      quote: function(str) {
        literals.add(str);
        return function(...args) {
          return context.eat(str);
        }
      },
      empty: function() {
        return function(...args) {
          return [];
        };
      },
      fail: function() {
        return function(...args) {
          return void 0;
        };
      },
      or: function(...choices) {
        var choicesF = choices.map(choice => compile(choice));
        return function(...args) {
          var pos = context.pos;
          for (var choiceF of choicesF) {
            var result = choiceF(...args);
            if (result !== void 0) { return result; }
            context.pos = pos;
          }
          return void 0;
        };
      },
      act: function(seq, hole) {
        var seqF = compile(seq);
        return function(...args) {
          var vals = seqF(...args);
          if (vals === void 0) { return void 0; }
          return args[hole](...vals);
        };
      },
      seq: function(...terms) {
        var termsF = terms.map(term => compile(term));
        return function(...args) {
          var vals = [];
          for (termF of termsF) {
            var val = termF(...args);
            if (val === void 0) { return void 0; }
            vals.push(val);
          }
          return vals;
        };
      },
      '**': function(patt, sep) {
        var pattF = compile(patt);
        var sepF = compile(sep);
        return function(...args) {
          var vals = [];
          while (true) {
            var pos = context.pos;
            var val = pattF(...args);
            if (val === void 0) {
              context.pos = pos;
              return vals;
            }
            vals.push(val);
            pos = context.pos;
            if (sepF(...args) === void 0) {
              context.pos = pos;
              return vals;
            }
          }
        };
      },
      '++': function(patt, sep) {
        var starF = vtable['**'](patt, sep);
        return function(...args) {
          var vals = starF(...args);
          return vals.length === 0 ? void 0 : vals;
        };
      },
      '?': function(patt) {
        return vtable['**'](patt, ['fail']);
      },
      '*': function(patt) {
        return vtable['**'](patt, ['empty']);
      },
      '+': function(patt) {
        return vtable['++'](patt, ['empty']);
      },


function bnfCurry(codesite1) {
  "use strict";

    

  function bnfRest(...args1) {
    function parserCurry(codesite2) {
      function parserRest(...args2) {
      }
    }
    return quasiMemo(parserCurry);
  }
}

var bnf1 = quasiMemo(bnfCurry);

var bnf = bnf1`
    bnf ::= rule*                 => ${parser};
    rule ::= IDENT "::=" body ";" => ${(n, _1, b, _2) => ['def', n, b]};
    body ::= choice**"|";         => ${list => simple('or', list)};
    choice ::=
      seq
    | seq "=>" HOLE               => ${(s, _, h) => ['act', a, h]};
    seq ::= term*                 => ${list => simple('seq', list)};
    term ::=
      prim ("**"|"++") prim       => ${(patt, q, sep) => [q, patt, sep]}
    | prim ("?"|"*"|"+")          => ${(patt, q) => [q, patt]};
    prim ::=
      IDENT                       => ${id => ['rule', id]}
    | STRING                      => ${str => ['quote', str]}
    | "(" body ")"                => ${(_1, b, _2) => b};
  `;


//for (t of BNFT()) { print(JSON.stringify(t)); }


function bnfParse(tokensIt) {
  "use strict";

  var t = tokensIt.next();
  function next() {
    if (t.done) { return void 0; }
    var result = t.value;
    t = tokensIt.next();
    return result;
  }

  function eat(re) {
    if (t.done) { return void 0; }
    var result = t.value;
    if ((typeof re === 'string' && re === result) ||
        allRE(re).test(result)) {
      return next();
    }
    return void 0;
  }

  function mustEat(re) {
    var result = eat(re);
    if (result === void 0) {
      debugger;
      throw new Error("unexpected: " + (t.done ? 'EOF' : t.value));
    }
    return result;
  }

  function hole() {
    if (typeof t.value === 'number') {
      return ['hole', next()];
    }
    return void 0;
  }

  function bnf() {
    var rules = [];
    while (!t.done) {
      rules.push(rule());
    }
    return ['bnf', ...rules];
  }

  function rule() {
    var id = mustEat(IDENT_RE);
    mustEat(/::=/);
    var bod = body();
    mustEat(/;/);
    return ['def', id, bod];
  }

  function body() {
    var choices = [];
    do {
      choices.push(choice());
    } while (eat(/\|/));
    if (choices.length === 1) { return choices[0]; }
    return ['or', ...choices];
  }

  function choice() {
    var terms = [];
    var trm, h;
    while ((trm = term())) {
      terms.push(trm);
    }
    if (terms.length === 1) {
      terms = terms[0];
    } else {
      terms = ['seq', ...terms];
    }
    if (eat(/=>/)) {
      return ['act', terms, hole()];
    }
    return terms;
  }

  function term() {
    var left = prim();
    var q;
    if ((q = eat(/[?+*]/))) {
      return [q, left];
    }
    if ((q = eat(/\+\+|\*\*/))) {
      var right = prim();
      return [q, left, right];
    }
    return left;
  }

  function prim() {
    var tok;
    if ((tok = eat(IDENT_RE))) {
      return tok;
    }
    if ((tok = eat(STRING_RE))) {
      return tok;
    }
    if (eat(/\(/)) {
      tok = body();
      mustEat(/\)/);
      return tok;
    }
    return void 0;
  }

  return bnf();
}

//JSON.stringify(bnfParse(JSONT()), void 0, ' ');
JSON.stringify(bnfParse(BNFT()), void 0, ' ');
