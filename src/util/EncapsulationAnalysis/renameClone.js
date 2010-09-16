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
 * renameClone: Clones functions in the AST and then renames all variables
in the new AST so that there is no variable capture (alpha renaming is done by by 
suffixing indices, similar to de bruijin indices).
 * @Author
 Ankur Taly (ataly@stanford.edu)
 * @provides scopeNumberControlStrip
 * Assumes:
   - Input ast has to be in ControlStrip form.  
 */
 this.renameCloneControlStrip =  function renameCloneControlStrip(ast, getNextAstNumber, astNumberMap, functionClones, nClones, maxArity) {
     var retAst;
     var newAst;
     var dupAst;

     function copyVariableMap(obj){
	 var retAttr = {};
	 for (var p in obj){
	     // this function is a little sloppy as it relies on obj to have the shape {x~: {suffix: -- , count: --}}
		 retAttr[p] = copyAttributes(obj[p]);
	 }
	 return retAttr;
     }

     function copyAttributes(attr){
	 var retAttr = {};
	 for (var p in attr){
	     retAttr[p] = attr[p];
	 }
	 return retAttr;
     }
     
    // function copyAst(ast){
//	 var i;  
//	 var retAst =  []; 
//	 var len = ast.length;
//	 retAst.push(ast[0]);
//	 retAst.push(copyAttributes(ast[1]));
//	 for(i = 2; i < len; i++){
//	     retAst.push(copyAst(ast[i]));
//	 }
//	 return retAst;
 //    }

       
     function copyAst(ast){
	 var i;  
	 var retAst =  []; 
	 var len = ast.length;
	 retAst.push(ast[0]);
	 retAst.push(copyAttributes(ast[1]));
	 for(i = 2; i < len; i++){
	     retAst.push(copyAst(ast[i]));
	 }
	 if(ast.hasOwnProperty('num')){
	     retAst.num = ast.num;
	 }
	 if(ast.hasOwnProperty('free')){
	     retAst.free = copyVariableMap(ast.free); 
 	 }
	 if(ast.hasOwnProperty('locals')){
	     retAst.locals = copyVariableMap(ast.locals); 
	 }
	 	 
	 if(ast.hasOwnProperty('origAst')){
	     retAst.origAst = ast.origAst;
	 }
	 return retAst;
     }
     


     function duplicateFunctions(ast){
	 var type = ast[0];
	 var retAst;
	 var len = ast.length;
	 var i;
	 var dupAst;
	 var tempAst1, tempAst2, tempAst;
//	 alert('type is ' + type);
	 switch(type){
	 case 'Program': case 'CatchClause': case 'NewExpr':case 'ObjectExpr':case 'ArrayExpr':
	 case 'InvokeExpr':
	     retAst = [ast[0], copyAttributes(ast[1])];
	     len = ast.length;
	     for(i = 2; i < len; i++){
		 retAst.push(duplicateFunctions(ast[i]));
	     }
	     if(ast.hasOwnProperty('origAst')){
		 retAst.origAst = ast.origAst;
	     }
	     else{
		 throw 'duplicateFunctions - origAst missing';
	     }
	     break;
	 case 'BlockStmt': case 'TryStmt': case 'IdPatt': case 'ParamDecl': case 'ReturnStmt': case 'ThrowStmt':
	 case 'VarDecl': case 'Empty': case 'EmptyStmt': case 'IdExpr': case 'DataProp': case 'LiteralExpr':    
	 case 'AssignExpr': case 'LogicalOrExpr': 
         case 'LogicalAndExpr': case 'BinaryExpr': case 'InvokeExpr':
	 case 'UnaryExpr': case 'TypeofExpr':  case 'DeleteExpr':
	 case 'LiteralExpr': case 'ThisExpr': case 'IdExpr': case 'RegExpExpr': 	     
	 case 'DataProp':  case 'Empty':  case 'NewExpr':case 'ObjectExpr':case 'ArrayExpr':
	 case 'MemberExpr': case 'InvokeExpr': 
	     retAst = [ast[0], copyAttributes(ast[1])];
	     len = ast.length;
	     for(i = 2; i < len; i++){
		 retAst.push(duplicateFunctions(ast[i]));
	     }
	     break;
	 case 'FunctionDecl': 
	     retAst = ['FunctionDeclClone', {}];
	     len = ast.length;
	     tempAst1 = copyAst(ast);
	     dupAst = [ast[0], copyAttributes(ast[1])];
	
	     for(i = 2; i < len; i++){
		 dupAst.push(duplicateFunctions(ast[i]));
	     }
	     retAst.push(dupAst);
	     for(i = 0; i < nClones; i++){
		 tempAst2 = copyAst(tempAst1);
		 tempAst2[2][1].name = tempAst2[2][1].name + '$Clone$' + (i+1);
		 retAst.push(tempAst2);
	     }
	     if(ast.hasOwnProperty('origAst')){
		 retAst.origAst = ast.origAst;
	     }
	     else{
		 throw 'duplicateFunctions - origAst missing';
	     }
	     //alert(retAst);
	     break;
	case 'FunctionExpr':
	     retAst = ['FunctionExprClone', {}];
	     len = ast.length;
	     tempAst1 = copyAst(ast);
	     dupAst = [ast[0], copyAttributes(ast[1])];
	
	     for(i = 2; i < len; i++){
		 dupAst.push(duplicateFunctions(ast[i]));
	     }
	     retAst.push(dupAst);
	     for(i = 0; i < nClones; i++){
		 tempAst2 = copyAst(tempAst1);	
		 if(tempAst2[2][0] != 'Empty'){
		     tempAst2[2][1].name = tempAst2[2][1].name + '$Clone$' + (i+1);
		 }
		 retAst.push(tempAst2);
	     }
	     if(ast.hasOwnProperty('origAst')){
		 retAst.origAst = ast.origAst;
	     }
	     else{
		 throw 'duplicateFunctions - origAst missing';
	     }
	     break;
	 default:
	 throw 'duplicateFunctions - expression type not supported in controlStrip form: ' + type;
	 }
//	 alert('ret is ' +retAst);
	 return retAst;
     }
     
     

     function numberExprHelper(expr, getNextAstNumber){
	 // Takes in an expression ast and adds a number method to any functionExpr or NewExpr nodes in it. 
	 var type = expr[0];
	 var tempExpr;
	 var len = expr.length;
	 var i  = 0;
	 var newNum;
	 
	 switch(type){
	 case 'AssignExpr':  case 'LogicalOrExpr': 
         case 'LogicalAndExpr': case 'BinaryExpr': case 'InvokeExpr':
	 case 'UnaryExpr': case 'TypeofExpr':  case 'DeleteExpr':
	 case 'LiteralExpr': case 'ThisExpr': case 'IdExpr': case 'RegExpExpr': 	     
	 case 'DataProp': case 'FunctionExprClone':
	 case 'Empty': 
	     len = expr.length;
	     for (i = 2; i < len; i++){
		 numberExprHelper(expr[i], getNextAstNumber);
	     }
	     break;
	 case 'FunctionExpr': case 'NewExpr':case 'ObjectExpr':case 'ArrayExpr':
	 case 'MemberExpr': case 'InvokeExpr': 
	     expr.num =  getNextAstNumber();
	    // astNumberMap[expr.num] = expr;
	     len = expr.length;
             for(i = 2; i < len; i++){
		 numberStmtHelper(expr[i], getNextAstNumber);
             }
	     break;
	 default: 
	     throw 'numberExpr - epxression type not supported in controlStrip form: ' + type;
	 }
     }
 

     function numberStmtHelper(ast, getNextAstNumber){
	 var i = 0;
	 var len = ast.length;
	 var newNum;
	 var type = ast[0];
	 var innerType;
	 switch(type){
	 case 'Program': case 'FunctionDecl':  case 'CatchClause': 
	     ast.num = getNextAstNumber();
	   //  astNumberMap[ast.num] = ast;
	     len = ast.length;
	     for(i = 2; i < len ;i++){
		  numberStmtHelper(ast[i], getNextAstNumber); 
	      }
	     break;
	 case 'BlockStmt': case 'TryStmt': case 'IdPatt': case 'ParamDecl':
	 case 'VarDecl': case 'Empty': case 'EmptyStmt': case 'IdExpr': case 'DataProp': case 'LiteralExpr':
	 case 'FunctionDeclClone': 
	     len  = ast.length;
	     for(i = 2; i < len ;i++){
		numberStmtHelper(ast[i], getNextAstNumber); 
	     }
	     break;
	 case 'ReturnStmt': case 'ThrowStmt':
	     len = ast.length;
	     if (len >= 3){
		 numberExprHelper(ast[2], getNextAstNumber);
	     }
	     break;
	 case 'AssignExpr':
	     numberExprHelper(ast, getNextAstNumber);
	     break;
	 default: 
	      throw 'numberStmtHelper - statement type not supported in controlStrip form: ' + type;; 
	     
	 }
     }

     function numberAst(ast, getNextAstNumber){
	 numberStmtHelper(ast, getNextAstNumber);
     }
   
     function setLocalFDNames(ast, names, num){
	 var i = 0, j= 0;
	 var len = ast.length;
	 var innerLen;
	 var innerAst;
	 var cloneAst;
	 var origAst;
	 var innerType;
	 var count  =  1;  
	 for(i=2;i<len;i++){
	     innerAst = ast[i];
	     innerType = innerAst[0];
	     switch(innerType){
	     case 'FunctionDecl':
		 // According to ES5-10.5 we always pick the last function declaration for a particular identifier.
		 if ((names.hasOwnProperty(innerAst[2][1].name)) && (names[innerAst[2][1].name].suffix === num)){
		     names[innerAst[2][1].name].count = names[innerAst[2][1].name].count + 1;
		     innerAst[2][1].name = innerAst[2][1].name + '_' + num +  '_' + names[innerAst[2][1].name].count; 
		     
		 }
		 else{
		     names[innerAst[2][1].name]  =  {suffix: num, count:1};
		     innerAst[2][1].name =   innerAst[2][1].name + '_' + num + '_' + 1;
		 }
		 break;
	     case 'BlockStmt': case 'TryStmt':case 'CatchClause':
	     case 'FunctionDeclClone':
		 // recursively entering block,try and catchClause statements
		 setLocalFDNames(innerAst,names, num);
		 break;
	     default:break;
	     }
	 } 
     }
     
     function setLocalVarNames(ast, names, num){
	 var i = 0;
	 var len = ast.length;
	 var innerLen;
	 var innerAst;
	 var innerType;
	 var count  =  1;  
	 for(i=2;i<len;i++){
	     innerAst = ast[i];
	     innerType = innerAst[0];
     
	     switch(innerType){
	     case 'VarDecl':
		 // According to ES5-10.5 we always pick the first variable declaration.
		 innerLen = innerAst.length;
		 for(j = 2;j < innerLen; j++){
		     if ((names.hasOwnProperty(innerAst[j][1].name)) && (names[innerAst[j][1].name].suffix === num)){
			 innerAst[j][1].name= innerAst[j][1].name + '_' + num +  '_' +  names[innerAst[j][1].name].count ;
		     }
		     else{
			 names[innerAst[j][1].name]  =  {suffix: num, count:1};
			 innerAst[j][1].name = innerAst[j][1].name + '_' + num +  '_' +  names[innerAst[j][1].name].count ;
		     }
		 }
		 break;
	     case 'BlockStmt': case 'TryStmt':case 'CatchClause':
		 // recursively entering block,try and catchClause statements
		     setLocalVarNames(innerAst,names, num);
		 break;
	     default:break;
	     }
	 }
     }
     
     function setLocalNames(ast,names,num){
	 setLocalFDNames(ast,names,num);
	 setLocalVarNames(ast,names,num);
     }
 
     function alphaRenameExpr(expr, globalNames, rootAst){
	 var type = expr[0];
	 var retStmts = [];
	 var retExpr;
	 var len = expr.length;
	 var i  = 0;
	 
	 switch(type){
	 case 'IdExpr':
	     if (globalNames.hasOwnProperty(expr[1].name)){
		 if (globalNames[expr[1].name].suffix >= rootAst.num){
		     // The >= asserts nesting. This means that expr[1].name is an identifier that was declared in a stament that is nested inside rootAst.
		     // and therefore it is local to rootAst.num.
		     //alert("here idexpr " + expr[1].name + " " + globalNames[expr[1].name].suffix + " ");
		     //locals is a property of the rootAst node which contains an object {fi:{suffix: -- , count:--}} where fi are the locals vars
		     rootAst.locals[expr[1].name] = {suffix:globalNames[expr[1].name].suffix, count: globalNames[expr[1].name].count};
		 }
		 else{
		     //locals is a property of the rootAst node which contains an object {fi:{suffix: -- , count:--}} where fi are the locals vars
		     rootAst.free[expr[1].name] = {suffix:globalNames[expr[1].name].suffix, count: globalNames[expr[1].name].count};
		 }
		 expr[1].name  = expr[1].name + '_' + globalNames[expr[1].name].suffix + '_' + globalNames[expr[1].name].count;
	     }
	     else if(expr[1].name[0] === '$'){
		 rootAst.locals[expr[1].name] = {suffix:rootAst.num, count: 1};
		 expr[1].name  = expr[1].name + '_' + rootAst.num + '_' + 1;
	     }
	     else{
		 rootAst.free[expr[1].name] = {suffix:0, count:1};
		 expr[1].name  = expr[1].name + '_' + 0 + '_' + 1;
	     }
	     break;
	 case 'ThisExpr':
	     expr[0] = 'IdExpr';
	     expr[1] = {name: 'this' + '_'+ globalNames['this'].suffix + '_' + globalNames['this'].count};
	     break;
	 case 'FunctionExpr':
	     var newGlobalNames = copyVariableMap(globalNames)
	     alphaRename(expr, newGlobalNames, rootAst);     
	     break;
	 default:
	     // FunctionExprClone case is handled here.
	     len = expr.length;
	     for(i = 2; i < len; i++){
		// alert("are " + expr[i]);
		 alphaRenameExpr(expr[i],globalNames,rootAst);
	     }
	 }
     }

     function alphaRenameStmt(ast, globalNames, rootAst){
	 // rename all identifiers according to the globalNames object. Recursively
	 // calls alphaRenameExpr for expressions.
	 var type = ast[0];
	 var len  = ast.length;
	 var i;
	// alert(ast);
	 switch(type){
	 case 'Program': case 'FunctionDecl': case 'CatchClause':
	     var newGlobalNames = copyVariableMap(globalNames)
	     alphaRename(ast, newGlobalNames, rootAst);
             break;
	 case 'VarDecl': case 'Empty': case 'EmptyStmt':
	     // Skip variable declaration statements.
	     break;
	 case 'ReturnStmt': case 'ThrowStmt':
	     if (len >= 3){
		 alphaRenameExpr(ast[2], globalNames, rootAst);
	     }
	     break;
	 case 'TryStmt': case 'BlockStmt': case 'FunctionDeclClone':
	     len = ast.length;
	     for (i = 2; i < len;i++){
		// alert (i + ' ' + ast[i]);
		// alert(i + ' ' + renderEcmascript(ast[i]));
		 alphaRenameStmt(ast[i], globalNames, rootAst);
		// alert (i + ' ' + ast[i]);

	     }
	     break;
	 case 'AssignExpr':
	     alphaRenameExpr(ast, globalNames, rootAst);
             break;
	 default:
	     throw 'alphaRenameStmt: Not a valid ControlStrip form statement '+ type; 
	 }
     }
     
     
     function alphaRename(ast, globalNames, rootAst){
	 // Takes as input an ast node whose tag causes a new scope to be added and a globalNames
	 // object consisting of name bindings from the outer scope. The 
	 // body of this function creates the appropriate var decl and function decl bindings 
	 // in the globalNames object and then recursively calls alphaRenameStmt in order to
	 // rename the identifiers in all the children nodes.
	 var i = 0;
	 var len = ast.length;
	 var type = ast[0];
	 var innerLen;
	 var paramAst, idAst, catchBlock;
	 ast.locals = [];
	 ast.free = [];
	 switch (type) {
	 case 'Program':
	     setLocalNames(ast,globalNames, ast.num);
	     globalNames['this'] = {suffix:ast.num,count:1};
	     for (i = 2;i <len; i++){
		 alphaRenameStmt(ast[i],globalNames, ast);
	     }
             break;
	 case 'FunctionDecl':
	     paramAst = ast[3];
	     innerLen = paramAst.length;
	     for (i = 2; i < innerLen; i++){
		 if (( globalNames.hasOwnProperty(paramAst[i][1].name)) && (globalNames[paramAst[i][1].name].suffix === ast.num)){
		     globalNames[paramAst[i][1].name].count = globalNames[paramAst[2][1].name].count + 1;
		     paramAst[i][1].name= paramAst[i][1].name + '_' + ast.num +  '_' + globalNames[paramAst[2][1].name].count; 
		 }
		 else{
		    
		     globalNames[paramAst[i][1].name]  =  {suffix: ast.num, count:1};
		     paramAst[i][1].name =   paramAst[i][1].name + '_' + ast.num + '_' + 1;
		 }		 
	     }
	    

	      // Add local var declarations and function declarations into the globalNames object.
	     setLocalNames(ast,globalNames, ast.num);
	   
	     globalNames['arguments'] = {suffix:ast.num, count: 1};
	     globalNames['this'] = {suffix:ast.num, count: 1};  
	     for (i = 4; i <len;i++){
		 // Recursively call alphaRenameStmt on all children nodes.
		 alphaRenameStmt(ast[i],globalNames, ast);
	     }
	     break;
	 case 'FunctionExpr':
	     paramAst = ast[3];
	     idAst = ast[2];
	     if (idAst[0] === 'IdPatt'){
		 globalNames[ast[2][1].name] = {suffix: ast.num,count:1};
		 ast[2][1].name= ast[2][1].name + '_' + ast.num +  '_' + globalNames[ast[2][1].name].count; 
	     }
	     innerLen = paramAst.length;
	     for (i = 2; i < innerLen; i++){
		 if ((globalNames.hasOwnProperty(paramAst[i][1].name)) && (globalNames[paramAst[i][1].name].suffix === ast.num)){
		   //  alert("param " + ast.num);
		     globalNames[paramAst[i][1].name].count = globalNames[paramAst[2][1].name].count + 1;
		     paramAst[i][1].name= paramAst[i][1].name + '_' + ast.num +  '_' + globalNames[paramAst[i][1].name].count; 
		 }
		 else{
		     globalNames[paramAst[i][1].name]  =  {suffix: ast.num, count:1};
		     paramAst[i][1].name =   paramAst[i][1].name + '_' + ast.num + '_' + 1;
		 }	 
	     }
	    // alert("i suffix" + globalNames['i'].suffix);
	     // Add local var declarations and function declarations into the globalNames object.
	     setLocalNames(ast,globalNames, ast.num);
	   
	     globalNames['arguments'] = {suffix:ast.num, count: 1};
	     // Since the top-level input language is ES5 strict, we assume that arguments is immutable and can never occur as lefthandside.
	     globalNames['this'] = {suffix:ast.num, count: 1};  

	     for (i = 4; i <len;i++){
		 // Recursively call alphaRenameStmt on all children nodes.
		 alphaRenameStmt(ast[i],globalNames, ast);
	     }
	     break; 
	 case 'CatchClause':

	    // alert(ast.num +" " + globalNames[ast[2][1].name]);
	     if ((globalNames.hasOwnProperty(ast[2][1].name)) && (globalNames[ast[2][1].name].suffix === ast.num)){
		 globalNames[ast[2][1].name].count = globalNames[ast[2][1].name].count + 1;
		 ast[2][1].name= ast[2][1].name + '_' + ast.num +  '_' + globalNames[ast[2][1].name].count; 
	     }
	     else{
		 globalNames[ast[2][1].name]  =  {suffix: ast.num, count:1};
		 ast[2][1].name =   ast[2][1].name + '_' + ast.num + '_' + 1;
	     }
	     catchBlock = ast[3];
	     innerLen = catchBlock.length;
	     for (i = 2; i < innerLen;i++){
		 // Recursively call alphaRenameStmt on all children nodes.
		 alphaRenameStmt(catchBlock[i],globalNames, rootAst);
	     }
	     break;
	 default:
	     throw 'alphaRename - Not a valid scope introduction node ' + type;
	     break;
	 }
     }

     
     function deduplicateFunctions(ast){
	 var type = ast[0];
	 var retAst;
	 var len = ast.length;
	 var i;
	 var tempAst;
//	 alert('type is' + type);
	 switch(type){
	 case 'Program': case 'CatchClause':  case 'NewExpr':case 'ObjectExpr':case 'ArrayExpr':
	 case 'InvokeExpr':
	      retAst = [ast[0], copyAttributes(ast[1])];
	     len = ast.length
	     if(ast.hasOwnProperty('num')){
		 retAst.num = ast.num;
	     }
	     if(ast.hasOwnProperty('free')){
		 retAst.free = ast.free;
	     }
	     if(ast.hasOwnProperty('locals')){
		 retAst.locals = ast.locals;
	     }
	     len = ast.length;
	     for(i = 2; i < len; i++){
		 retAst.push(deduplicateFunctions(ast[i]));
	     }
	     if(ast.hasOwnProperty('origAst')){
		 retAst.origAst = ast.origAst;
	     }
	     else{
		 throw 'duplicateFunctions - origAst missing';
	     }
	     break;
	 case 'ReturnStmt': case 'ThrowStmt':
	 case 'BlockStmt': case 'TryStmt': case 'IdPatt': case 'ParamDecl':
	 case 'VarDecl': case 'Empty': case 'EmptyStmt': case 'IdExpr': case 'DataProp': case 'LiteralExpr':    
	 case 'AssignExpr': case 'LogicalOrExpr': 
         case 'LogicalAndExpr': case 'BinaryExpr': case 'InvokeExpr':
	 case 'UnaryExpr': case 'TypeofExpr':  case 'DeleteExpr':
	 case 'LiteralExpr': case 'ThisExpr': case 'IdExpr': case 'RegExpExpr': 	     
	 case 'DataProp':  case 'Empty':  case 'NewExpr':case 'ObjectExpr':case 'ArrayExpr':
	 case 'MemberExpr': case 'InvokeExpr': case 'FunctionExpr': case 'FunctionDecl':
	     retAst = [ast[0], copyAttributes(ast[1])];
	     len = ast.length
	     if(ast.hasOwnProperty('num')){
		 retAst.num = ast.num;
	     }
	     if(ast.hasOwnProperty('free')){
		 retAst.free = ast.free;
	     }
	     if(ast.hasOwnProperty('locals')){
		 retAst.locals = ast.locals;
	     }
	     len = ast.length;
	     for(i = 2; i < len; i++){
		 retAst.push(deduplicateFunctions(ast[i]));
	     }
	     break;
	 case 'FunctionExprClone': case 'FunctionDeclClone':
	     retAst = deduplicateFunctions(ast[2]);
	     len = ast.length;
	     if(functionClones.hasOwnProperty(ast[2].num)){
		 throw 'deduplicateFuntions - duplicate ast number found '; 
	     }
	     functionClones[ast[2].num] = [];

	     for (i = 3; i < len; i++){	
		 functionClones[ast[2].num].push(ast[i]);
	     }
	     if(ast.hasOwnProperty('origAst')){
		 retAst.origAst = ast.origAst;
	     }
	     else{
		 throw 'duplicateFunctions - origAst missing';
	     }
	    break;
	 default:
	 throw 'deduplicateFunctions - expression type not supported in controlStrip form: ' + type;
	 }
	 return retAst;
     }
     
     function createAstNumberMapHelper(ast){
	 var num;
	 var retConstraints=[];
	 var len = ast.length;
	 var i;
	 if(ast.hasOwnProperty('num')){
	     num = ast.num;
	     astNumberMap[num] = ast;
	 }
	 for(i = 2; i < len ;i++){
	     createAstNumberMapHelper(ast[i]);
	 }
     }

     function createAstNumberMap(){
	 var p;
	 var retConstraints = [];
	 var num;
	 var i,len;
	 for(p in functionClones){
	     len = functionClones[p].length;
             for (i = 0 ; i < len; i++){
		 createAstNumberMapHelper(functionClones[p][i]);
	     }
	 } 
     }
     

     dupAst = duplicateFunctions(ast); 

     // alert(dupAst);
     numberAst(dupAst, getNextAstNumber);
    // alert(dupAst);
     alphaRename(dupAst, {}, dupAst);
     newAst = deduplicateFunctions(dupAst);
     
     createAstNumberMapHelper(newAst);
     createAstNumberMap();     
     return newAst;
 }
