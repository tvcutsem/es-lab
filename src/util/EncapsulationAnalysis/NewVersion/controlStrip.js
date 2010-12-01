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

/**
 * Converts an AST in ThreeOp form into one that does not have any control statements
 * @Author 
Ankur Taly (ataly@stanford.edu)
 * @provides controlStripThreeOp
 * Assumes:
   - Input ast has to be in ThreeOp form. 
 
 */
this.controlStripThreeOp =  function controlStripThreeOp(ast) {
 
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
     
     
     function controlStripExpr(expr){
	 // Takes in an expression ast and returns an expression which 
	 // has been appropriately control stripped.
	 var type = expr[0];
	 var retStmts = [];
	 var retExpr;
	 var len = expr.length;
	 var i  = 0;
	 
	 switch(type){
	 case 'NewExpr': case 'ObjectExpr':case 'ArrayExpr':
	     len = expr.length;
	     retExpr = [expr[0],copyAttributes(expr[1])];
	     for (i = 2; i < len; i++){
		 retExpr.push(controlStripExpr(expr[i]));
	     }
	     if(expr.hasOwnProperty('origAst')){
		 retExpr.origAst = expr.origAst;
	     }
	     else{
		 throw 'controlStripExpr : origAst missing';
	     }
	     break;
	 case 'AssignExpr': case 'ConditionalExpr': case 'LogicalOrExpr': 
         case 'LogicalAndExpr': case 'BinaryExpr': case 'MemberExpr':
	 case 'UnaryExpr': case 'TypeofExpr':  
	 case 'DeleteExpr':
	 case 'LiteralExpr': case 'ThisExpr': case 'IdExpr': case 'RegExpExpr': 	     
	 case 'DataProp': 
	 case 'Empty':
	     len = expr.length;
	     retExpr = [expr[0],copyAttributes(expr[1])];
	     for (i = 2; i < len; i++){
		 retExpr.push(controlStripExpr(expr[i]));
	     }
	     break;
	 case 'ConditionalExpr':
	 case 'CountExpr':
	 case 'CallExpr': case 'EvalExpr': case 'GetterProp' : case 'SetterProp':
	     throw 'controlStripExpr - epxression type not supported: ' + type;
	     break; 
	 case 'InvokeExpr':
	     if (expr[3][1].value === 'call'){
		 len = expr.length;
		 retExpr = [expr[0],copyAttributes(expr[1])];
		 for (i = 2; i < len; i++){
		     retExpr.push(controlStripExpr(expr[i]));
		 }
	     }
	     else{
		 throw 'controlStripExpr - invoke expressions should not have any field name other than \"call\"';
	     }	
	     if(expr.hasOwnProperty('origAst')){
		 retExpr.origAst = expr.origAst;
	     }
	     else{
		 throw 'controlStripExpr : origAst missing';
	     }
	     break;
	 case 'FunctionExpr':
	     len = expr.length;
	     retExpr = [expr[0], copyAttributes(expr[1])];
             for(i = 2; i < len; i++){
		 retExpr = retExpr.concat(controlStrip(expr[i]));
             }
	     if(expr.hasOwnProperty('origAst')){
		 retExpr.origAst = expr.origAst;
	     }
	     else{
		 throw 'controlStripExpr : origAst missing';
	     }
	     break;
	 
	 default: 
	     throw 'controlStripExpr - epxression type not supported: ' + type;
	 }
	 return retExpr;
     }
     
     //Strips control statements from programs and statements. Calls threeOpExpr
     // recursively for expressions.
     function controlStrip(ast) {
	 var type = ast[0];
	 var len = ast.length;
	 var retStmts = [];
	 var i = 0;
	 var stmt;
	 switch (type) {
	 case 'Program':  case 'FunctionDecl':
             len = ast.length;
             
	     stmt = [ast[0], copyAttributes(ast[1])];
	     for(i = 2; i < len; i++){
		 //alert("outer " + type + "inner " + ast[i][0]);
		 stmt = stmt.concat(controlStrip(ast[i]));
             }	
	     if(ast.hasOwnProperty('origAst')){
		 stmt.origAst = ast.origAst;
	     }
	     else{
		 throw 'controlStrip : origAst missing';
	     }
	     retStmts = [stmt];
             break;
	 case 'ParamDecl': 
             len = ast.length;
             
	     stmt = [ast[0], copyAttributes(ast[1])];
	     for(i = 2; i < len; i++){
		 //alert("outer " + type + "inner " + ast[i][0]);
		 stmt = stmt.concat(controlStrip(ast[i]));
             }	
	     retStmts = [stmt];
             break;
	 case 'TryStmt':
	     var innerStmt;
	     len = ast.length;
	     
	     stmt = [ast[0], copyAttributes(ast[1])];
	     for (i = 2; i <  len ;i++){

		 if(ast[i][0] === 'BlockStmt'){
		     innerStmt = ['BlockStmt',{}];
		     innerStmt = innerStmt.concat(controlStrip(ast[i]));
		 }
		 else if (ast[i][0] === 'CatchClause'){
		     // CatchClause
		     innerStmt = controlStrip(ast[i]);
		     innerStmt  = innerStmt[0];
		 }
		 else{
		     // EmptyAst;
		     innerStmt = copyAst(ast[i]);
		 }
	
		 stmt.push(innerStmt);
	     }
	     retStmts = [stmt];
	     break;
		 
	 case 'BlockStmt':
	     len = ast.length;
	     retStmts = [];
	     for(i = 2; i < len;i++){
		 retStmts = retStmts.concat(controlStrip(ast[i]));
		 //alert(retStmts);
	     }
	     break;
	 case 'CatchClause':
	     var catchBlock;
	    
	     catchBlock = ['BlockStmt',{}];
	     catchBlock = catchBlock.concat(controlStrip(ast[3]));
	     stmt = copyAst(ast);
	     stmt[3] = catchBlock;
	     if(ast.hasOwnProperty('origAst')){
		 stmt.origAst = ast.origAst;
	     }
	     else{
		 throw 'controlStrip : origAst missing';
	     }
	     retStmts = [stmt];

	     break;
	 case 'LabelledStmt':
	    retStmts = controlStrip(ast[2]);
	     break;
	 case 'VarDecl':
	     retStmts = [copyAst(ast)];
	     break;
	 case 'IdPatt':
	     retStmts = [copyAst(ast)];
	     break;
	 case 'Empty':  		 
	     retStmts = [copyAst(ast)];
	     break;
	 case 'EmptyStmt':
	     // Skipping Empty statements.
	     retStmts = [];
	     break;
	case 'IfStmt':
	     retStmts = [];
	     retStmts = retStmts.concat(controlStrip(ast[3]));
	     retStmts = retStmts.concat(controlStrip(ast[4]));
             break;
	case 'WhileStmt':
	     retStmts = controlStrip(ast[3]);
            break;
	 case 'DoWhileStmt':
	     retStmts = controlStrip(ast[2]);
             break;
	 case 'ForStmt':
	     throw 'controlStrip- Not a valid ast type: ' + type;
             break;
	 case 'ForInStmt':
             retStmts = controlStrip(ast[4]);
             break;
	 case 'ContinueStmt': case 'PrologueDecl':
	     // Skipping continue statements.
             retStmts = [];
	     break;
	 case 'BreakStmt':
	     // Skipping break statement.
	     retStmts = [];
	     break;
	 case 'ReturnStmt': case 'ThrowStmt':
	     stmt = [ast[0], copyAttributes(ast[1])];
	     if (len >= 3){
		 stmt.push(controlStripExpr(ast[2])); 
	     }
	     retStmts = [stmt];
	     	//alert("return " + retStmts);
		break;

	 case 'WithStmt': 
             throw 'controlStrip: WithStmt - allowed in strict mode';
             break;
	 case 'SwitchStmt':
	    throw 'switch statement not allowed in threeOp form';
             break;
	 case 'AssignExpr':
	   //  alert("here");
	     retStmts = [controlStripExpr(ast)];
             break;
	 default:
	     throw 'controlStrip: statement type not supported' + type;
             
	 }
	 return retStmts;
     }
     
     if(ast[0] === 'Program'){
	 return (controlStrip(ast))[0];
     }
     else{
	 throw 'controlStripEcmascript: input ast has to be a program';
     }
 }
 
