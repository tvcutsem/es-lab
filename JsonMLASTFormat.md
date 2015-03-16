## Table of Contents ##



### Parser Playground ###

[ES5 Parser Playground](http://es-lab.googlecode.com/svn/trunk/site/esparser/index.html)

### AST Format ###

Abstract syntax trees (ASTs) are generated in [JsonML](http://jsonml.org) format and are of the form:

```
 [ "Type",
   { attr1 : val1, attr2: val2, ... },
   childNode1,
   childNode2,
   ... ]
```

For an overview of all the different kinds of AST nodes, see the [test-suite](http://code.google.com/p/es-lab/source/browse/trunk/tests/parser/parsertests.js) for the parser or the [summary](#Visitor_Protocol_Summary.md) below.

### Types ###

By convention, the last 4 letters of "Type" represent a subtype:
| Expressions | `*Expr` |
|:------------|:--------|
| Statements | `*Stmt` |
| Declarations | `*Decl` |
| Property definitions | `*Prop` |
| Patterns | `*Patt` |
| Case | DefaultCase | `*Case` (only within a `SwitchStmt`) |
| Catch clause | `CatchClause` (only within a `TryStmt`) |
| Empty marker | `Empty` (for elisions in Array-literals, omitted parts of a for-statement, the name of an anonymous function expression and the catch-clause of a try-finally statement) |
| Program | `Program` (the goal production of the Grammar) |

All use-occurrences of variables appear as `IdExpr` nodes. All defining occurrences of variables appear as `IdPatt` nodes.

### Mandatory Attributes ###

The `key:value` attributes of the AST format are used by some nodes:

| `type: string` | in `LiteralExpr` to denote type of literal |
|:---------------|:-------------------------------------------|
| `value: primitive-value`| in `LiteralExpr` to denote value of parsed literal, in `PrologueDecl` to denote the literal string value of the directive |
| `name: string` | in `IdPatt`, `IdExpr`, and `*Prop` to denote the name of a variable or property|
| `label: string` | in `ContinueStmt`, `BreakStmt` and `LabelledStmt` to denote label name |
| `op: string` | in `UnaryExpr`, `BinaryExpr`, `CountExpr` and `AssignExpr` to denote operator punctuator |
| `isPrefix: boolean` | in `CountExpr` to denote pre- or postfix operator |
| `body: string` | in `RegExpExpr` to denote body of a regexp |
| `flags: string` | in `RegExpExpr` to denote flags of a regexp |
| `directive: string` | in `PrologueDecl` to denote the source contents of a directive prologue |

### Optional Attributes ###

Language processors are allowed to add additional, optional, attributes. Some useful attributes that could be supported for most AST nodes:

#### Verification and scoping Attributes ####

Added during verification and scope analysis:

| `strict: boolean` | whether this AST occurs in strict code |
|:------------------|:---------------------------------------|
| `preOrder: number` | uniquely identify this node within its overall AST |
| `definition: number` | On an `IdExpr`, records the `preOrder:` number of the `IdPatt`, if any, of the corresponding definition. |
| `scope: number` | On an `IdPatt`, records the `preOrder:` of the containing node in which this definition is in scope. |
| `const: true` | On an `IdPatt`, records whether the declared variable is assignable |

Because of the limits of JsonML, some of the results of scope analysis cannot conveniently be represented within the AST itself, such as a list of free variable references. Rather, the preOrder numbers assigned here can be used as an index into a side table containing the results of scope analysis.

The `definition:` attribute of an `IdExpr` is `-1` if this `IdExpr` is a free occurrence, or `NaN` if static scoping is ambiguous. A static scoping ambiguity cannot appear in a strict `Program`, but it can appear in a strict function within a non-strict `Program`.

In ES5, the only `IdPatt` for which `const: true` should appear is the name of a named `FunctionExpr`.

#### Debugging Attributes ####

To be captured during parsing, for supporting both live and post-mortem source level debugging:

| `source: string` | identifies the source from which the AST was parsed |
|:-----------------|:----------------------------------------------------|
| `startLine: number` | line number indicating start of span |
| `startColumn: number` | column number indicating start of span |
| `endLine: number` | line number indicating end of span |
| `endColumn: number` | column number indicating end of span |

The `source:` string should serve much the same purpose as does Java's fully qualified path name. It identifies where the source is to be found relative to some root, so that debugging log records together with a source tree are relocatable. We postpone specifying the form of this string awaiting accepted module and package proposals.

Line counts start at 1. Column counts start at 0. If `startLine:` is included but `endLine:` is omitted, then `endLine:` defaults to `startLine:`. If `startColumn:` is omitted, then `startColumn:` defaults to 0. If `endColumn:` is omitted, `endColumn:` defaults to the last column of `endLine:`.

#### Additional Optional Parsing Attributes ####

| `comment: string` | last comment appearing before this AST node |
|:------------------|:--------------------------------------------|

Some tools process directives buried in comments. Most often, such directives are in the last comment prior to the AST node they apply to. For more general capture of all comments, it is not clear how to represent that adequately in an abstract syntax tree structure, as opposed to a concrete parse tree structure, since some structural information is lost. Perhaps also in a side table indexed by `preOrder:`

### Visitor Protocol Summary ###

Protocol of a [visitor that walks these ASTs](http://code.google.com/p/es-lab/source/browse/trunk/src/jsonMLWalkers.js).
Arguments named `opt*` in the first column below may refer to `[Empty]` AST nodes.
Arguments suffixed with `?` in the first column below may be absent in the AST.

| `visitThisExpr({})` | `this` |
|:--------------------|:-------|
| `visitIdExpr({name})` | `name` |
| `visitRegExpExpr({body, flags})` | `/body/flags` |
| `visitLiteralExpr({type, value})` | `'value'` |
| `visitArrayExpr({}, ...optElementExprs)` | `[..]` |
| --> ` visitEmpty({})` | `,,` |
| `visitObjectExpr({}, ...props)` | `({..})` |
| --> ` visitDataProp({name}, valueExpr)` | `name: value` |
| --> ` visitGetterProp({name}, funcExpr)` | `get name(){..}` |
| --> ` visitSetterProp({name}, funcExpr)`     | `set name(v){..}` |
| `visitMemberExpr({}, baseExpr, propExpr)` | `base[prop]` |
| `visitInvokeExpr({}, baseExpr, propExpr, ...argExprs)` | `base[prop](...args)` |
| `visitCallExpr({}, baseExpr, ...argExprs)` | `base(...args)` |
| `visitNewExpr({}, baseExpr, ...argExprs)` | `new base(...args)` |
| `visitTypeofExpr({}, xExpr)` | `typeof x` |
| `visitUnaryExpr({op}, xExpr)` | `op x` |
| `visitBinaryExpr({op}, xExpr, yExpr)` | `x op y` |
| `visitLogicalAndExpr({}, xExpr, yExpr)` | `x && y` |
| `visitLogicalOrExpr({}, xExpr, yExpr)` | `x |` `| y`|
| `visitConditionalExpr({}, xExpr, yExpr, zExpr)` | `x ? y : z` |
| `visitAssignExpr({op}, lValue, rExpr)` | `lValue op r` |
| `visitCountExpr({op, isPrefix}, lValue)` | `((++|--)lValue | lValue(++|--))` |
| `visitDeleteExpr({}, lValue)` | `delete lValue` |

| `visitProgram({}, ...parts)` | `..prologue; ..stmts` |
|:-----------------------------|:----------------------|
| --> ` visitPrologueDecl({value, directive})` | `'directive';` |
| `visitEvalExpr({}, ...argExpr)` | `eval(...args)` |
| `visitFunctionExpr({}, optIdPatt, paramDecl, ...parts)` | `(function optId(...params) {..prologue; ..stmts})` |
| `visitFunctionDecl({}, idPatt, paramDecl, ...parts)` | `function id(...params) {..prologue; ..stmts}` |
| --> ` visitParamDecl({}, ...idPatts)` | `(...params)` |
| `visitVarDecl({}, ...varPatts)` | `var ..` |
| --> ` visitInitPatt({}, idPatt, initExpr)` | `id = init` |
| --> ` visitIdPatt({name})` | `name` |

| `visitBlockStmt({}, ...stmts)` | `{..}` |
|:-------------------------------|:-------|
| `visitEmptyStmt({})` | `;` |
| `visitIfStmt({}, condExpr, thenStmt, elseStmt)` | `if (cond) {t} else {e}` |
| `visitDoWhileStmt({}, bodyStmt, condExpr)` | `do body while (cond)` |
| `visitWhileStmt({}, condExpr, bodyStmt)` | `while (cond) body` |
| `visitForStmt({}, optInitPart, optCondExpr, optIncrExpr, bodyStmt)` | `for (optInit; optCond; optIncr) body` |
| `visitForInStmt({}, lValue, collExpr, bodyStmt)` | `for (lValue in coll) body` |
| `visitContinueStmt({label?})` | `continue optLabel` |
| `visitBreakStmt({label?})` | `break optLabel` |
| `visitReturnStmt({}, expr?)` | `return expr` |
| `visitWithStmt({}, headExpr, bodyStmt)` | `with (head) {body}` |
| `visitSwitchStmt({}, headExpr, ...cases)` | `switch (head) {..}` |
| --> ` visitCase({}, headExpr, ...stmts)` | `case head: ..stmts` |
| --> ` visitDefaultCase({}, ...stmts)` | `default: ..stmts` |
| `visitLabelledStatement({label}, bodyStmt)` | `label: body` |
| `visitThrowStmt({}, errExpr)` | `throw err` |
| `visitTryStmt({}, tStmt, optCatchClause, fStmt?)` | `try {t} catch (err) {c} finally {f}` |
| --> ` visitCatchClause({}, idPatt, cStmt)` | `catch(id) { c }` |
| `visitDebuggerStmt({})` | `debugger` |