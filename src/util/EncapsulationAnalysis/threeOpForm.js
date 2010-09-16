// Copyright (C) 2010 Google Inc.
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

/*
 * Converts an AST to its threeOp form.
 * Author: Ankur Taly
 * Email: ataly@stanford.edu

 * Assumes:
   - Code does not make use of setters/getters and eval. 
   - Default case block in a switch statement always occurs at the end (if at all it occurs).
  * Nodes:
    - Adds origAst property on Program, FuncDecl, CatchClause, FunctionExpr, NewExpr, ObjExpr, 
    ArrayExpr, InvokeExpr nodes.
 * @requires JSON
 */
 this.threeOpEcmascript =  function threeOpEcmascript(ast, getNextTempVar) {

//    var tempVarName = "$";
 //   var tempVarCount = 1;

//  function getNextTempVar(){
  //      var ret = tempVarName + tempVarCount;
     //   tempVarCount = tempVarCount + 1;
  //      return ret;
     //  }
     function getTempVarDecl(){
	 var i;
	 var tempVar;
	 var ret = ['VarDecl',{}];
	 for(i = 1 ; i < tempVarCount; i++){
             tempVar = tempVarName + i;
             ret.push(['IdPatt',{name:tempVar}]);
	 }
	 return ret;
     }
     function copyAttributes(attr){
	 var retAttr = {};
	 for (var p in attr){
	     retAttr[p] = attr[p];
	 }
	 return retAttr;
     }
     
     function copyAst(ast){
	 var i;  
	 var retAst =  []; 
	 var len = ast.length;
	 retAst.push(ast[0]);
	 retAst.push(copyAttributes(ast[1]));
	 for(i = 2; i < len; i++){
	     retAst.push(copyAst(ast[i]));
	 }
	 if(ast.hasOwnProperty('origAst')){
	     retAst.origAst = ast.origAst;
	 }
	 return retAst;
     }
     
     function makeBasicLhsExpr(lhsExpr){
	 var i;
	 var newStmts = handleLhsExpr(lhsExpr, ['IdExpr',{name:'undefined'}]);
	 var len = newStmts.length;
	 var lastStmt = newStmts[len - 1];
	 
	 newStmts = newStmts.splice(0,len-1);
	 if((lastStmt[0] === 'AssignExpr') && (lastStmt[3][1].name === "undefined")){
	     return [newStmts,lastStmt[2]];
	 }
	 else{
	     throw 'makeBasicLhsExpr - Unexpected stmt ' + lastStmt[0] + ' ' + lastStmt[3][1].name; 
	 }
     }
     
     function handleLhsExpr(lhsExpr, basicRhsExpr){
	 var i = 0 ;
	 var type = lhsExpr[0];
	 var retStmts = [];
	 var exprStmt;
	 var expr;
	 
	 switch(type){
	 case 'IdExpr':
	     retStmts = [];
	     exprStmt = ['AssignExpr', {op: '='}, copyAst(lhsExpr), copyAst(basicRhsExpr)];
	     retStmts.push(exprStmt);
	     break;
	 case 'MemberExpr':
	     var operand1 = lhsExpr[2];
	     var operand2 = lhsExpr[3];
	     var tempVar1;
	     var tempVar2;
	     if((operand2[0] === "CallExpr")){
		 if ((operand2[2][1].name.slice(0,3) === "$A$")){
		     attr = copyAttributes(lhsExpr[1]);
		     attr.annotation = operand2[2][1].name;
		     expr = [lhsExpr[0],attr];
		 }
	     }
	     else{
		 expr = [lhsExpr[0],copyAttributes(lhsExpr[1])];
	     }
	     retStmts = [];
	     
	     if((operand1[0] === 'LiteralExpr') || (operand1[0] === 'IdExpr')){
		 expr.push(copyAst(operand1));
	     }
      else{
	  tempVar1 = getNextTempVar();
	  retStmts = retStmts.concat(handleRhsExpr(['IdExpr', {name:tempVar1}], operand1));
	  expr.push(['IdExpr', {name:tempVar1}]);
      }
      if((operand2[0] === 'LiteralExpr') || (operand2[0] === 'IdExpr')){
	  expr.push(copyAst(operand2));
      }
      else{
	  tempVar2 = getNextTempVar();
	  retStmts = retStmts.concat(handleRhsExpr(['IdExpr', {name:tempVar2}], operand2));
	  expr.push(['IdExpr', {name:tempVar2}]);
      }
      exprStmt = ['AssignExpr', {op:'='}, expr, copyAst(basicRhsExpr)];
      retStmts.push(exprStmt);
      break;
  default: 'throw: handleLhsExpr: Not really a left handside ' + type;  
  }
  return retStmts;
}



function handleRhsExpr(basicLhsExpr, rhsExpr){
  // Takes a left variable name (say x) and an ast for an expression(e) and 
  // returns an array of statement asts which amount to x = e in threeOp form.
  var type = rhsExpr[0];
  var retStmts = []
  var exprStmt;
  var i = 0;
  var len;
  var expr;

  switch(type){
    case 'AssignExpr':
      var operand1 = rhsExpr[2];
      var operand2 = rhsExpr[3];
      var op = rhsExpr[1].op;
      var temp;
      var basicLhsExpr1;
      var newStmts = [];

      retStmts = [];
      if (op === '='){
	  newStmts = makeBasicLhsExpr(operand1);
	  basicLhsExpr1 = newStmts[1];
	  newStmts = newStmts[0];
	  retStmts = retStmts.concat(newStmts);
	  retStmts = retStmts.concat(handleRhsExpr(basicLhsExpr, operand2)); 
	  retStmts = retStmts.concat(handleRhsExpr(basicLhsExpr1, basicLhsExpr));

	  // Every basicLhsExpr is also a basicRhsExpr
      }
      else{
	  var binop = op.slice(0, op.length-1); //Extracting operator op from a compound aassignment of the form op=
	  var binaryExpr = ['BinaryExpr', {op:binop}, copyAst(operand1), copyAst(operand2)];
	  temp = handleRhsExpr(basicLhsExpr, ['AssignExpr', {op:"="}, operand1, binaryExpr])  ;
	  retStmts = retStmts.concat(handleRhsExpr(basicLhsExpr, ['AssignExpr', {op:"="}, operand1, binaryExpr]));
      }
      break;
    case 'ConditionalExpr':
      var operand1 = rhsExpr[2];
      var operand2 = rhsExpr[3];
      var operand3 = rhsExpr[4];
      var ifBlock = ['BlockStmt', {}];
      var elseBlock = ['BlockStmt', {}];
      var tempVar;

      retStmts = [];

      tempVar = getNextTempVar();
      retStmts = retStmts.concat(handleRhsExpr(['IdExpr', {name:tempVar}], operand1))

      ifBlock = ifBlock.concat(handleRhsExpr(basicLhsExpr, operand2));
      elseBlock = elseBlock.concat(handleRhsExpr(basicLhsExpr, operand3));

      retStmts.push(['IfStmt', {}, ['IdExpr', {name: tempVar}], ifBlock, elseBlock]);
      break;
  case 'LogicalOrExpr': case 'LogicalAndExpr': case 'BinaryExpr':
      var operand1 = rhsExpr[2];
      var operand2 = rhsExpr[3];
      var tempVar1;
      var tempVar2;

      expr = [rhsExpr[0],copyAttributes(rhsExpr[1])];
      retStmts = [];

      if((operand1[0] === 'LiteralExpr') || (operand1[0] === 'IdExpr')){
	  expr.push(copyAst(operand1));
      }
      else{
	  tempVar1 = getNextTempVar();
	  retStmts = retStmts.concat(handleRhsExpr(['IdExpr', {name:tempVar1}], operand1));
	  expr.push(['IdExpr', {name:tempVar1}]);
      }
      if((operand2[0] === 'LiteralExpr') || (operand2[0] === 'IdExpr')){
	  expr.push(copyAst(operand2));
      }
      else{
	  tempVar2 = getNextTempVar();
	  retStmts = retStmts.concat(handleRhsExpr(['IdExpr', {name:tempVar2}], operand2));
	  expr.push(['IdExpr', {name:tempVar2}]);
      }
      exprStmt = ['AssignExpr', {op:'='}, copyAst(basicLhsExpr),expr];
      retStmts.push(exprStmt);
      break;
  case 'MemberExpr':
      var operand1 = rhsExpr[2];
      var operand2 = rhsExpr[3];
      var tempVar1;
      var tempVar2;
      var attr;
      if((operand2[0] === "CallExpr")){
	  if((operand2[2][1].name.slice(0,3) === "$A$")){
	      attr = copyAttributes(rhsExpr[1]);
	      attr.annotation = operand2[2][1].name;
	      expr = [rhsExpr[0],attr];
	  }
      }
      else{
	  expr = [rhsExpr[0],copyAttributes(rhsExpr[1])];
      }
      retStmts = [];

      if((operand1[0] === 'LiteralExpr') || (operand1[0] === 'IdExpr')){
	  expr.push(copyAst(operand1));
      }
      else{
	  tempVar1 = getNextTempVar();
	  retStmts = retStmts.concat(handleRhsExpr(['IdExpr', {name:tempVar1}], operand1));
	  expr.push(['IdExpr', {name:tempVar1}]);
      }
      if((operand2[0] === 'LiteralExpr') || (operand2[0] === 'IdExpr')){
	  expr.push(copyAst(operand2));
      }
      else{
	  tempVar2 = getNextTempVar();
	  retStmts = retStmts.concat(handleRhsExpr(['IdExpr', {name:tempVar2}], operand2));
	  expr.push(['IdExpr', {name:tempVar2}]);
      }
      exprStmt = ['AssignExpr', {op:'='}, copyAst(basicLhsExpr),expr];
      retStmts.push(exprStmt);
      break;
    case 'UnaryExpr': case 'TypeofExpr':  
      var operand = rhsExpr[2];
      var tempVar;

      retStmts = [];
      expr = [rhsExpr[0], copyAttributes(rhsExpr[1])];

      if((operand[0] === 'LiteralExpr') || (operand[0] === 'IdExpr')){
	  expr.push(copyAst(operand));
      }
      else{
	  tempVar = getNextTempVar();
	retStmts = retStmts.concat(handleRhsExpr(['IdExpr', {name:tempVar}], operand));
	  expr.push(['IdExpr', {name:tempVar}]); 	  
      }
      exprStmt = ['AssignExpr', {op:'='}, copyAst(basicLhsExpr),expr];
      retStmts.push(exprStmt);
      break;
  case 'DeleteExpr':
       var operand = rhsExpr[2];
      var tempVar;
      var basicLhsExpr1;
      var newStmts;

      retStmts = [];
      expr = [rhsExpr[0], copyAttributes(rhsExpr[1])];

      if((operand[0] === 'LiteralExpr') || (operand[0] === 'IdExpr')){
	  expr.push(copyAst(operand));
      }
      else{
	  newStmts = makeBasicLhsExpr(operand);
	  basicLhsExpr1 = newStmts[1];
	  newStmts = newStmts[0];
	  retStmts = retStmts.concat(newStmts);
	  expr.push(basicLhsExpr1); 	  
      }
      exprStmt = ['AssignExpr', {op:'='}, copyAst(basicLhsExpr),expr];
      retStmts.push(exprStmt);
      break;
  case 'CountExpr':
      var attr = rhsExpr[1];
      var operand = rhsExpr[2];
      var tempVar;
      retstmts = [];

      tempVar = getNextTempVar();
      retStmts = retStmts.concat(handleRhsExpr(['IdExpr', {name:tempVar}], operand));
      retStmts = retStmts.concat(handleLhsExpr(operand, ['BinaryExpr', {op:attr.op[0]},['IdExpr',{name:tempVar}],['LiteralExpr',{type:"number", value:1}]]));	       	      
      if (attr.isPrefix === true){
	  exprStmt = ['AssignExpr',{op: '='},copyAst(basicLhsExpr),  ['BinaryExpr', {op:attr.op[0]},['IdExpr',{name:tempVar}],['LiteralExpr',{type:"number", value:1}]]];	       	      
      }
      else{
	  exprStmt = ['AssignExpr',{op:'='},copyAst(basicLhsExpr),['IdExpr',{name:tempVar}]];	       	  
      }
      retStmts.push(exprStmt);		      
      break;
  case 'CallExpr':
      var tempVar;
      var basicLhsExpr1;
      var newStmts=[];
      var tempAst;

      expr = ['InvokeExpr', copyAttributes(rhsExpr[1])];
      retStmts = [];
      len = rhsExpr.length;
       i = 2;
      if ((rhsExpr[2][0] === "LiteralExpr") || (rhsExpr[2][0] === 'IdExpr')){
	  // Case: id(<args>) or <literal>(<args>);

	  // Push rhsExpr[2] as the  callee node and undefined as the this value on the InvokeExpr ast.
	  expr.push(copyAst(rhsExpr[2]));
	  expr.push(['LiteralExpr',{type:'string',value:'call'}]);
	  expr.push(['IdExpr',{name:'undefined'}]);
      }
      else if (rhsExpr[2][0] === 'MemberExpr'){
	  // Case <memberExpr>(<args>);

	  // Create a basic lefthandside for the memberExpr.
	  tempAst = copyAst(rhsExpr[2]);
	  tempAst[3][0] = "LiteralExpr";
	  newStmts = makeBasicLhsExpr(tempAst);
	  basicLhsExpr1 = newStmts[1];
	  newStmts = newStmts[0];
	  retStmts = retStmts.concat(newStmts);

	  // Create a new temporary tempVar and assign the basic lefthandside created above to it 
	  // (note a basic lefthandside can always be used as righthandside)

	  tempVar = getNextTempVar();
	  retStmts = retStmts.concat(handleRhsExpr(['IdExpr',{name:tempVar}], basicLhsExpr1));

	  // Push tempVar as the callee and the base of the basic lefthandside as the this value on the invoke expression.
	  expr.push(['IdExpr',{name:tempVar}]);
	  expr.push(['LiteralExpr',{type:'string',value:'call'}]);
	  expr.push(basicLhsExpr1[2]);
	  
      }
      else{
	  // Case <expr>(<args>)

	  // Create a temporary and evaluate the expression <expr> into it.
	  tempVar = getNextTempVar();
	  retStmts = retStmts.concat(handleRhsExpr(['IdExpr',{name:tempVar}], rhsExpr[2 ]));

	  // Push rhsExpr[2] as the  callee node and undefined as the this value on the InvokeExpr ast.
	  expr.push(['IdExpr',{name:tempVar}]); 
	  expr.push(['LiteralExpr',{type:'string',value:'call'}]);
	  expr.push(['IdExpr',{name:'undefined'}]); 
      }
      // Evaluate the arguments into temporaries and push the temporaries on the invoke expression.
      for (i = 3; i < len; i++){
	   if ((rhsExpr[i][0] === "LiteralExpr") || (rhsExpr[i][0] === 'IdExpr')){
	      expr.push(copyAst(rhsExpr[i]));
	  }
	  else{
	      tempVar = getNextTempVar();
	      retStmts = retStmts.concat(handleRhsExpr(['IdExpr',{name:tempVar}], rhsExpr[i]));
	      expr.push(['IdExpr',{name:tempVar}]); 
	  }
      }
      expr.origAst = rhsExpr;
      exprStmt = ['AssignExpr', {op:'='}, copyAst(basicLhsExpr), expr]; 
      retStmts.push(exprStmt);
      break;
  case 'InvokeExpr':
      var tempVar;
      var basicLhsExpr1;
      var newStmts=[];

      expr = ['InvokeExpr', copyAttributes(rhsExpr[1])];
      retStmts = [];
      len = rhsExpr.length;

      // Take the first two children of the InvokeExpr node and 
      // and create a member expression using the two.
      // Convert the member expression into a basic lefthandside which is stored in basicLhsExpr1.
      newStmts = makeBasicLhsExpr(['MemberExpr',{},rhsExpr[2],rhsExpr[3]]);
      basicLhsExpr1 = newStmts[1];
      newStmts = newStmts[0];
      retStmts = retStmts.concat(newStmts);

      // Create a temporary tempVar and evaluate basicLhsExpr1 into it.
      tempVar = getNextTempVar();
      retStmts = retStmts.concat(handleRhsExpr(['IdExpr',{name:tempVar}], basicLhsExpr1));

      // Push tempVar as the callee and first child of basicLhsExpr1 as the this, onto the invoke expression expr.
      expr.push(['IdExpr',{name:tempVar}]);
      expr.push(['LiteralExpr',{type:'string',value:'call'}]);
      expr.push(basicLhsExpr1[2]);

      // Evaluate all arguments into a temporary and push the temporary on the invoke expression expr.
      for (i = 4; i < len; i++){
	   if ((rhsExpr[i][0] === "LiteralExpr") || (rhsExpr[i][0] === 'IdExpr')){
	      expr.push(copyAst(rhsExpr[i]));
	  }
	  else{
	      tempVar = getNextTempVar();
	      retStmts = retStmts.concat(handleRhsExpr(['IdExpr',{name:tempVar}], rhsExpr[i]));
	      expr.push(['IdExpr',{name:tempVar}]); 
	  }
      }
      expr.origAst = rhsExpr;
      exprStmt = ['AssignExpr', {op:'='}, copyAst(basicLhsExpr), expr]; 
      retStmts.push(exprStmt);
      break;
  case 'NewExpr':
      var tempVarConst;
      var tempVarProto;
      var tempVarThis;
      var tempVarRes;
      var tempVar;
      var tempVarObjectCheck;
      var tempVarBexp;
      var bexp;
      retStmts = [];
      len = rhsExpr.length;

       // create a temporary tempVarConst and evaluate <memberExpr> into it
      tempVarConst = getNextTempVar();
      retStmts = retStmts.concat(handleRhsExpr(['IdExpr',{name:tempVarConst}], rhsExpr[2]));

      // Create a temporary tempVarThis and evaluate the expression Object.create(tempVarConst.prototype) into it.
     // tempVarProto = getNextTempVar();
     // retStmts  = retStmts.concat(handleRhsExpr(['IdExpr', {name:tempVarProto}], ['MemberExpr',{}, ['IdExpr', {name:tempVarConst}], ['IdExpr',{name:'prototype'}]]));
    //  tempVarThis = getNextTempVar();
     // retStmts.push(['AssignExpr',{op:'='},['IdExpr',{name:tempVarThis}],['InvokeExpr',{},['IdExpr',{name:'Object'}],['LiteralExpr',{type:'string',value:'create'}],['IdExpr',{name:tempVarProto}]]]);

      // Create an ast for the expression tempVarConst.call(tempVarThis, <args>);
    //  expr = ['InvokeExpr',{}];
    //  expr.push(['IdExpr',{name:tempVarConst}]);
    //  expr.push(['LiteralExpr',{type:'string',value:'call'}]);
    //  expr.push(['IdExpr',{name:tempVarThis}]);

      expr = ['NewExpr',copyAttributes(rhsExpr[1])];
      expr.push(['IdExpr',{name:tempVarConst}]);

      for (i = 3; i < len; i++){
	  if ((rhsExpr[i][0] === "LiteralExpr") || (rhsExpr[i][0] === 'IdExpr')){
	      expr.push(copyAst(rhsExpr[i]));
	      }
	  else{
	      tempVar = getNextTempVar();
	      retStmts = retStmts.concat(handleRhsExpr(['IdExpr',{name:tempVar}], rhsExpr[i]));
	      expr.push(['IdExpr',{name:tempVar}]); 
	  }
      } 
      expr.origAst = rhsExpr;
      exprStmt = ['AssignExpr', {op:'='}, copyAst(basicLhsExpr), expr];

      // Create a temporary tempVarRes and set the expression to it
      //  tempVarRes = getNextTempVar();
     //  exprStmt = ['AssignExpr', {op:'='}, ['IdExpr',{name:tempVarRes}], expr]; 
     //  retStmts.push(exprStmt);

      // Create a temporary tempVarTypeof and evaluate the expression 'Object(tempVarRes)' into it.
    //  tempVarObjectCheck = getNextTempVar();
    //  retStmts.push(['AssignExpr',{op:'='},['IdExpr',{name:tempVarObjectCheck}], ['InvokeExpr',{},['IdExpr',{name:'Object'}], ['LiteralExpr',{type:'string',value:'call'}],['IdExpr',{name:tempVarRes}]]]);

      // Create a temporary tempVarBexp and evaluate the expression 'tempVarTypeof === "Object"' into it.
    //  tempVarBexp = getNextTempVar();
    //  retStmts = retStmts.concat(handleRhsExpr(['IdExpr',{name:tempVarBexp}], ['BinaryExpr',{op:'==='},['IdExpr',{name:tempVarObjectCheck}],['IdExpr',{name:tempVarRes}]]));

      // Create an if stament - 'if (tempVarBexp){<assign tempVarRes to basicLhsExpr>}else{<assign tempVarThis to basicLhsExpr>}
    //  exprStmt = ['IfStmt',{}];
    //  exprStmt.push(['IdExpr',{name:tempVarBexp}]);
      //  exprStmt.push(['AssignExpr', {op:'='}, copyAst(basicLhsExpr),['IdExpr',{name:tempVarRes}]]);
      //  exprStmt.push(['AssignExpr', {op:'='}, copyAst(basicLhsExpr),['IdExpr',{name:tempVarThis}]]);


      retStmts.push(exprStmt);

      break;
  case 'EvalExpr': 	

      throw 'Eval not supported';
      break;
  case 'ArrayExpr': 
      var tempVar;

      expr = [rhsExpr[0], copyAttributes(rhsExpr[1])];
      retStmts = [];

      len = rhsExpr.length;
      for (i = 2; i < len; i++){
	  if ((rhsExpr[i][0] === "LiteralExpr") || (rhsExpr[i][0] === 'IdExpr')){
	      expr.push(copyAst(rhsExpr[i]));
	  }
	  else{
	      tempVar = getNextTempVar();
	      retStmts = retStmts.concat(handleRhsExpr(['IdExpr',{name:tempVar}], rhsExpr[i]));
	      expr.push(['IdExpr',{name:tempVar}]); 
	  }
      }
      expr.origAst = rhsExpr;
      
      exprStmt = ['AssignExpr', {op:'='}, copyAst(basicLhsExpr), expr]; 
      retStmts.push(exprStmt);		  
      break;
  case 'FunctionExpr':
      var funcExpr = [rhsExpr[0], copyAttributes(rhsExpr[1])];
      var i = 0;
      retStmts = [];
      len = rhsExpr.length;
      for(i = 2; i < len; i++){
	  funcExpr.push(threeOp(rhsExpr[i]));
      }
      funcExpr.origAst = rhsExpr;

      exprStmt = ['AssignExpr', {op:'='}, copyAst(basicLhsExpr), funcExpr]; 
      retStmts.push(exprStmt);
      break;
  case 'LiteralExpr': case 'ThisExpr': case 'IdExpr': case 'RegExpExpr': 
      retStmts = [];

      exprStmt = ['AssignExpr', {op:'='}, copyAst(basicLhsExpr), copyAst(rhsExpr)];
      retStmts.push(exprStmt);
      break;
    case 'ObjectExpr':
      var tempVar;
      var dataExpr;

      expr = [rhsExpr[0],copyAttributes(rhsExpr[1])];
      retStmts = [];
      len = rhsExpr.length;

      for (i = 2; i < len; i++){
	  var innerType = rhsExpr[i][0]
	  switch(innerType){
	    case 'DataProp':  
	      tempVar = getNextTempVar();
	      dataExpr = rhsExpr[i][2]; 
	      if ((dataExpr[0] === 'IdExpr')|| (dataExpr[0]==='LiteralExpr')) {
		  expr.push(copyAst(rhsExpr[i]));
	      }
	      else{

		  retStmts = retStmts.concat(handleRhsExpr(['IdExpr',{name:tempVar}], dataExpr));
		  expr.push(['DataProp',{name:rhsExpr[i][1].name},['IdExpr',{name:tempVar}]]);
	      }
	      break;
	    case 'GetterProp':
	      expr.push(copyAst(rhsExpr[i]));
	      break;
	    case 'SetterProp':
	      expr.push(copyAst(rhsExprt[i]));
	      break;
	    default: 
	      throw 'threeOpExpr-ObjectExpr: Not a valid PropertyAssignment '+innerType;
	  }
      }
      expr.origAst = rhsExpr;

      exprStmt = ['AssignExpr', {op:'='}, copyAst(basicLhsExpr), expr]; 
      retStmts.push(exprStmt);
      break;
    case 'Empty':
      retStmts = [];

      exprStmt = ['AssignExpr', {op:'='}, copyAst(basicLhsExpr), ['IdExpr', {name:'undefined'}]];
      retStmts.push(exprStmt); 
      break;
    default: throw 'threeOpExpr: Not an expression '+ type;
  }
  return retStmts;
}

//Converts programs (and statements) to threeOp form. Calls threeOpExpr
// recursively for expressions.
function threeOp(ast) {
 var type = ast[0];
 var len = ast.length;
 var retAst = [];
 var i = 0;
   var stmt;
   var newStmts = [];

 switch (type) {
 case 'Program':   case 'CatchClause': case 'FunctionDecl': 
     len = ast.length;
     var retAst = [ast[0], copyAttributes(ast[1])];
     
     for(i = 2; i < len; i++){
	 retAst.push(threeOp(ast[i]));
     }	
     retAst.origAst = ast;
     break;     
 case 'ParamDecl':  case 'BlockStmt': case 'TryStmt': case 'LabelledStmt': case 'PrologueDecl':
     len = ast.length;
     var retAst = [ast[0], copyAttributes(ast[1])];
        
         for(i = 2; i < len; i++){
	   retAst.push(threeOp(ast[i]));
         }	
         break;
       // Replace all InitPatt from a VarDecl with the corresponding IdPatt and add 
       // appropriate statement after the VarDecl to handle the InitPatt.
     case 'VarDecl':
	 var varStmt  = ["VarDecl",copyAttributes(ast[1])];
	 var idPatt, rhsExpr;
         
         newStmts = [];
         retAst = ["BlockStmt",{}]; 	 
	 for (i = 2; i < len; i++) {
	   innerType = ast[i][0];
	   switch(innerType){
	     case 'InitPatt':
	       idPattAst = ast[i][2]; 
	       rhsExpr = ast[i][3];
	       varStmt.push(copyAst(idPattAst));
	       newStmts = newStmts.concat(handleRhsExpr(['IdExpr', {name:idPattAst[1].name}], rhsExpr));
	       break;
	     case 'IdPatt':
	       idPattAst = ast[i];
	       varStmt.push(copyAst(idPattAst));
	       break;
	     default: throw 'threeOp: VarDecl invalid child ast' + innerType;
	   }
	 }
	  retAst.push(varStmt);
	  retAst = retAst.concat(newStmts);
	                 break;
      case 'IdPatt':
	 retAst = copyAst(ast);
	 break;
     case 'Empty': case 'EmptyStmt': 		 
	 retAst = copyAst(ast);
	 break;
      case 'IfStmt':
         var tempVar;
         var expr = ast[2];
         var ifStmt = ast[3];
         var elseStmt = ast[4];
         newStmts = [];
         stmt = [ast[0], copyAttributes(ast[1])];
         retAst = ["BlockStmt", {}];

         tempVar = getNextTempVar();
         newStmts = handleRhsExpr(['IdExpr', {name:tempVar}],expr);
         
         stmt.push(['IdExpr', {name:tempVar}]);
         
        
         stmt.push(threeOp(ifStmt));
    
        
         stmt.push(threeOp(elseStmt));
         
         retAst = retAst.concat(newStmts);
         
         retAst.push(stmt);
         
         break;
     case 'WhileStmt':
         var tempVar;
         var expr = ast[2];
         var loopStmt = ast[3];
         var newLoopStmt = ["BlockStmt", {}];
         newStmts = [];
         stmt = [ast[0], copyAttributes(ast[1])];
         retAst = ["BlockStmt", {}];

         tempVar = getNextTempVar();
         newStmts = handleRhsExpr(['IdExpr', {name:tempVar}],expr);

         newLoopStmt.push(threeOp(loopStmt));
         newLoopStmt = newLoopStmt.concat(newStmts);
         stmt.push(['IdExpr',{name:tempVar}]);
         stmt.push(newLoopStmt);
         
         retAst = retAst.concat(newStmts);
         retAst.push(stmt);
       
         break;
     case 'DoWhileStmt':
         var tempVar;
         var expr = ast[3];
         var loopStmt = ast[2];
         var newLoopStmt = ["BlockStmt", {}];

         newStmts = [];
         retAst = [ast[0], copyAttributes(ast[1])];
        
         tempVar = getNextTempVar();
         newStmts = handleRhsExpr(['IdExpr', {name:tempVar}],expr);

         newLoopStmt.push(threeOp(loopStmt));
         newLoopStmt = newLoopStmt.concat(newStmts);
         retAst.push(newLoopStmt);
         retAst.push(['IdExpr',{name:tempVar}]);
      
         break;
     case 'ForStmt':
         var initExpr = ast[2];
         var condExpr = ast[3];
         var updateExpr = ast[4];
         var loopStmt = ast[5];
         var newLoopStmt = ['BlockStmt', {}];
         
         retAst = ['BlockStmt', {}];

         newLoopStmt.push(copyAst(loopStmt));
         if(updateExpr[0] !== "Empty"){
             newLoopStmt.push(copyAst(updateExpr));
         }
         stmt = ['WhileStmt', {}, copyAst(condExpr), newLoopStmt];
         
         if(initExpr[0] !== "Empty"){
             retAst.push(copyAst(initExpr));
         }
         retAst.push(stmt);
         
	 retAst = threeOp(retAst);
         break;
     case 'ForInStmt':
        var lhsVar = ast[2];
        var objExpr = ast[3];
        var loopStmt = ast[4];
        var newLoopStmt = ['BlockStmt', {}];
        var tempVar;
        var newStmts1 = [];
        var newStmts2 = [];
        var patt;
        var id;
        var basicLhsExpr; 
 
        retAst = ['BlockStmt',{}];
        stmt = ['ForInStmt',{}];
        newLoopStmt.push(threeOp(loopStmt));
        tempVar = getNextTempVar();
        newStmts1 = handleRhsExpr(['IdExpr', {name:tempVar}], objExpr);
 

        if (lhsVar[0] === 'VarDecl'){
            patt = lhsVar[2];
            if(patt[0] === 'InitPatt'){
               id = patt[2][1].name;
            }
            else{
               id = patt[1].name;
            }
            retAst.push(threeOp(lhsVar));
            retAst = retAst.concat(newStmts1);
            stmt.push(['IdExpr',{name:id}]);
            stmt.push(['IdExpr',{name:tempVar}]);
            newLoopStmt = newLoopStmt.concat(newStmts1);
            stmt.push(newLoopStmt);
            retAst.push(stmt);
         }
         else{
             newStmts2 = makeBasicLhsExpr(lhsVar);
             basicLhsExpr = newStmts2[1];
             newStmts2 = newStmts2[0];
             
             retAst = retAst.concat(newStmts2);
             retAst = retAst.concat(newStmts1);
             stmt.push(basicLhsExpr);
             stmt.push(['IdExpr',{name:tempVar}]);
             newLoopStmt = newLoopStmt.concat(newStmts2);
             newLoopStmt = newLoopStmt.concat(newStmts1);
             stmt.push(newLoopStmt);
             retAst.push(stmt);
         }
        break;
     case 'ContinueStmt':
        retAst = copyAst(ast);
	break;
     case 'BreakStmt':
        retAst = copyAst(ast);
	break;
     case 'ReturnStmt': case 'ThrowStmt':
         var expr;
         var tempVar;
         var newStmts = [];
        len = ast.length;
         if(len === 2){
             retAst = copyAst(ast);
         }
         else{
             retAst = ['BlockStmt',{}];
             stmt = [ast[0], copyAttributes(ast[1])];
             expr = ast[2];
             if((expr[0] === 'IdExpr') || (expr[0] === 'LiteralExpr')){
                 stmt.push(copyAst(expr));
              
             }
             else{
                 tempVar = getNextTempVar();
                 newStmts = handleRhsExpr(['IdExpr',{name:tempVar}], expr);
                 stmt.push(['IdExpr',{name:tempVar}]);
                 retAst = retAst.concat(newStmts);
             }
             
                 retAst.push(stmt);
         }
        break;
     case 'WithStmt': 
        throw 'threeOp:WithStmt - Not allowed in strict mode';
        break;
     case 'SwitchStmt':
         var switchExpr = ast[2];
         var switchIdExpr;
         var newStmts1 = [];
         var tempVar ;
         var caseClause;
         var caseBlock;
         var newCaseClause;
         var newCaseBlock;
         var doWhileStmt;
         var loopStmt;
         var caseLen = 0;
         retAst = ['BlockStmt',{}];
         doWhileStmt= ['DoWhileStmt',{}];
         loopStmt = ['BlockStmt',{}];

         tempVar = getNextTempVar();
         newStmts = handleRhsExpr(['IdExpr',{name:tempVar}],switchExpr);
         retAst = retAst.concat(newStmts);

         switchIdExpr = ['IdExpr',{name:tempVar}];
         
         len = ast.length;
         
         for (i = 3; i < len; i++){
             caseClause = copyAst(ast[i]);
             caseLen = caseClause.length;
             
             if (caseClause[0] === 'Case'){
                 
                 caseBlock = caseClause.splice(3,caseLen);
                 
                 newCaseBlock = ['BlockStmt',{}].concat(caseBlock);
                 
                 newCaseClause = ['IfStmt',{},['BinaryExpr',{op:"==="},switchIdExpr, ast[i][2]],newCaseBlock,["EmptyStmt"]];
             }
             else{
                 //Default Case
                 if (i !== len-1){ throw 'threeOp:SwitchStmt - Default has to be the last case';}

                 caseBlock = caseClause.splice(2,caseLen);
                 
                 newCaseBlock = ['BlockStmt',{}].concat(caseBlock);
                 newCaseClause = ['IfStmt',{},['LiteralExpr',{type: "boolean", value: true}],newCaseBlock, ["EmptyStmt"]];
             }
             
             loopStmt.push(threeOp(newCaseClause));
             
         }
         doWhileStmt.push(loopStmt);
         
         doWhileStmt.push(['LiteralExpr',{type:"boolean", value:false}]);
         
         retAst.push(doWhileStmt);
         break;
     default:
	var typeLen = type.length;
        
        newStmts = []; 
        retAst = ["BlockStmt",{}]; 
	if(type.slice(typeLen-4, typeLen) === 'Expr'){
           tempVar = getNextTempVar();
           newStmts = handleRhsExpr(['IdExpr', {name:tempVar}],ast);
           retAst =  retAst.concat(newStmts);
        }
        else{
            throw 'threeOp: Not a valid statement type ' + type;
        }
     }
     return retAst;
   }
    return threeOp(ast);
}
     
