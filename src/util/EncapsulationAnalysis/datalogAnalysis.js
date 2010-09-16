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
 * Generates datalog constraints for an ast in scopeNumber form.
 * @author ataly@stanford.edu
 * @arguments
     - ast: ast structure in scopeNumber form.
     - contextNum: 0 denotes encoding for original program, >0 indicates encoding for the clone labelled with that number.
    -  
 * @provides genConstraintsScopeNum
 * Assumes:
- Annotations : $A$All, $A$Num, $A$AdsafeReject and an annotationObj.

- NOTES
- There is an annotation constraint for every property name mentioned explicitly in the program.
 
 */
 this.genConstraintsScopeNumber = function genConstraintsScopeNumber(ast, contextNum,annotationsObj,  encodeVar, encodeField, encodeLoc, getNextTempVar, getNextAstNumber, astNumberMap, relName, makeConstraint,  functionClones, nClones, maxArity) {
     
    
     function annotate(s,retConstraints){
	// console.log(s);
	 if(Number(s) == s){
	     retConstraints.push(makeConstraint('annotation',[s,'$A$Num']));
	     return '$A$Num';
	 }
	 else if(s.charAt(0) === '_'){
	  //   console.log(makeConstraint('annotation',[s,'$A$AdsafeReject']));
	     retConstraints.push(makeConstraint('annotation',[s,'$A$AdsafeReject']));
	     return '$A$AdsafeReject';
	 }
	 else if(annotationsObj.hasOwnProperty('$A$'+s)){
	     // constraints for this case are added by annotations2.js
	     return annotationsObj['$A$'+s];
	 }

	 else{
	     // constraints for this case are added by annotations2.js
	     return '$A$All';
	 }
     }
  
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
     
  


 


     function throwVars(stmt){
	 // Takes in a statement Ast and returns an array of identifier names 
	 // which are thrown (and are not caught by any catch block).
	 var type = stmt[0];
	 var throwVarsList = [];
	 var i = 0; 
	 var len = stmt.length;
	 switch(type){
	 case 'FunctionDecl': case 'VarDecl': case 'ReturnStmt': case 'AssignExpr':
	 case 'EmptyStmt' : case 'Empty': case 'IdPatt': case 'DataProp': case 'LiteralExpr': case 'IdExpr':
	 case 'Program': case 'FunctionExpr':
	     break;
	 case 'ThrowStmt':
	     if (stmt[2][0] === 'IdExpr'){
		 throwVarsList.push(stmt[2][1].name);
	     }
	     break;
	 case 'BlockStmt': case 'CatchClause':
	     len = stmt.length;
	     for(i = 2 ; i < len ; i++){
		 throwVarsList = throwVarsList.concat(throwVars(stmt[i]));
	     }
	     break;
	 case 'TryStmt':
	     if(stmt[3][0] === 'Empty'){
		// No Catch - should be try finally - pick up throw from both try and finally
		 throwVarsList = throwVars(stmt[2]);
		 throwVarsList = throwVarsList.concat(throwVars(stmt[4]));
	     }
	     else{
		 // Pick up throws only from catch and finally blocks.
		 len = stmt.length;
		 for (i = 3 ; i < len; i++){
		     throwVarsList = throwVarsList.concat(throwVars(stmt[i]));
		 }
	     }
	     break;
	 default:
	     throw 'throwVars - not a valid stmt ' + stmt;
	     break;
	 }
	 return throwVarsList;
     }


     function genConstraintsExpr(expr,outerNum){
	 var i = 0;
	 
	 var lhsExpr = expr[2];
	 var rhsExpr = expr[3];
	 var len = rhsExpr.length;
	 var lhsType = lhsExpr[0];
	 var rhsType = rhsExpr[0];
	 var num;
	 var retConstraints = [];
	 var constraint;
	 var throwVarsList =[];
	 var throwVarLen;
	 var catchVar;
	 var tempVar, tempVarPrim;
	 if(lhsType === 'IdExpr' && rhsType === 'LiteralExpr'){
	     return retConstraints;
	 }
	 else if(lhsType === 'IdExpr' && rhsType === 'BinaryExpr'){
	     return retConstraints;
	 }
	 else if(lhsType === 'IdExpr' && rhsType === 'UnaryExpr'){
	     return retConstraints;
	 }
	 else if(lhsType === 'IdExpr' && rhsType === 'LogicalAndExpr'){
	     return retConstraints;
	 }
	 else if(lhsType === 'IdExpr' && rhsType === 'LogicalOrExpr'){
	     return retConstraints;
	 }
	 else if(lhsType === 'IdExpr' && rhsType === 'TypeofExpr'){
	     return retConstraints;
	 }
	 else if(lhsType === 'IdExpr' && rhsType === 'DeleteExpr'){
	     return retConstraints;
	 }
	 else if(lhsType === 'IdExpr' && rhsType === 'RegExpExpr'){
	     return retConstraints;
	 }
	 else if(lhsType === 'IdExpr' && rhsType === 'IdExpr'){
	     constraint = makeConstraint('assign', [lhsExpr[1].name, rhsExpr[1].name]);
	     retConstraints.push(constraint);
	 }
	 else if(lhsType === 'IdExpr' && rhsType === 'MemberExpr'){
	     if(rhsExpr[2][0] === 'LiteralExpr'){
		 // Case: x = 3[..] 
		 // We first create a new object, assign it to a temporary and then
		 // create a load constraint between the left handside and the temporary.
		 tempVar = getNextTempVar();
		 num = rhsExpr.num;
		 constraint = makeConstraint('newObj',[tempVar,num]);
		 retConstraints.push(constraint);
		 if(rhsExpr[3][0] === 'LiteralExpr'){
		     annotate(rhsExpr[3][1].value,retConstraints); // THis is done to add an annotation constraint for the value being read.
		     constraint = makeConstraint('lhsExpr', [loadDot[1].name, tempVar, rhsExpr[3][1].value]);
		     retConstraints.push(constraint);
		 }
		 else if(rhsExpr[1].hasOwnProperty('annotation')){
		     constraint = makeConstraint('loadDot', [lhsExpr[1].name, tempVar, rhsExpr[1].annotation]);
		     retConstraints.push(constraint);
		 }
		 else{
		     // Converting index identifier to a primitive value.
		     tempVarPrim = getNextTempVar();
		     retConstraints.push(makeConstraint('loadDot',[tempVarPrim,rhsExpr[3][1].name,'toString']));
		     retConstraints.push(makeConstraint('caller',[outerNum,tempVarPrim]));
		     retConstraints.push(makeConstraint('actualArg',[tempVarPrim,0,rhsExpr[3][1].name]));
		     
		     tempVarPrim = getNextTempVar();
		     retConstraints.push(makeConstraint('loadDot',[tempVarPrim,rhsExpr[3][1].name,'valueOf']));
		     retConstraints.push(makeConstraint('caller',[outerNum,tempVarPrim]));
		     retConstraints.push(makeConstraint('actualArg',[tempVarPrim,0,rhsExpr[3][1].name]));

		     constraint = makeConstraint('loadDot', [lhsExpr[1].name, tempVar, '$A$All']);
		    retConstraints.push(constraint); 
		 }
	     }
	     else{
		 //Case: x = y[..] or x = y.<..>
		  if(rhsExpr[3][0] === 'LiteralExpr'){
		      annotate(rhsExpr[3][1].value,retConstraints);
		      constraint = makeConstraint('loadDot', [lhsExpr[1].name, rhsExpr[2][1].name, rhsExpr[3][1].value]);
		      retConstraints.push(constraint);
		  }
		 else if(rhsExpr[1].hasOwnProperty('annotation')){
		     constraint = makeConstraint('loadDot', [lhsExpr[1].name, rhsExpr[2][1].name, rhsExpr[1].annotation]);
		     retConstraints.push(constraint);
		 }
		 else{
		     tempVarPrim = getNextTempVar();
		     retConstraints.push(makeConstraint('loadDot',[tempVarPrim,rhsExpr[3][1].name,'toString']));
		     retConstraints.push(makeConstraint('caller',[outerNum,tempVarPrim]));
		     retConstraints.push(makeConstraint('actualArg',[tempVarPrim,0,rhsExpr[3][1].name]));
		     
		     tempVarPrim = getNextTempVar();
		     retConstraints.push(makeConstraint('loadDot',[tempVarPrim,rhsExpr[3][1].name,'valueOf']));
		     retConstraints.push(makeConstraint('caller',[outerNum,tempVarPrim]));
		     retConstraints.push(makeConstraint('actualArg',[tempVarPrim,0,rhsExpr[3][1].name]));

		     constraint = makeConstraint('loadDot', [lhsExpr[1].name, rhsExpr[2][1].name, '$A$All']);
		     retConstraints.push(constraint); 
		 }
	     }    
	 }
	 else if(lhsType === 'MemberExpr' && rhsType === 'IdExpr'){
	     if(lhsExpr[2][0] === 'LiteralExpr'){
		 // Case: 3[..] = x 
		 // We first create a new object, assign it to a temporary and then
		 // create a load constraint between the left handside and the temporary.
		 tempVar = getNextTempVar();
		 num = lhsExpr.num;
		 constraint = makeConstraint('newObj',[tempVar,num]);
		 retConstraints.push(constraint);
		 if(lhsExpr[3][0] === 'LiteralExpr'){
		     constraint = makeConstraint('storeDot', [tempVar, lhsExpr[3][1].value, rhsExpr[1].name]);
		     retConstraints.push(constraint);
		     annotate(lhsExpr[3][1].value, retConstraints);
		   //  constraint = makeConstraint('storeDot', [tempVar, annotate(lhsExpr[3][1].value, retConstraints), rhsExpr[1].name]);
		    // retConstraints.push(constraint);
		 }
		 else if(lhsExpr[1].hasOwnProperty('annotation')){
		      constraint = makeConstraint('storeDot', [ tempVar, lhsExpr[1].annotation,rhsExpr[1].name]);
		     retConstraints.push(constraint);
		 }
		 else{
		     tempVarPrim = getNextTempVar();
		     retConstraints.push(makeConstraint('loadDot',[tempVarPrim,lhsExpr[3][1].name,'toString']));
		     retConstraints.push(makeConstraint('caller',[outerNum,tempVarPrim]));
		     retConstraints.push(makeConstraint('actualArg',[tempVarPrim,0,lhsExpr[3][1].name]));
		     
		     tempVarPrim = getNextTempVar();
		     retConstraints.push(makeConstraint('loadDot',[tempVarPrim,lhsExpr[3][1].name,'valueOf']));
		     retConstraints.push(makeConstraint('caller',[outerNum,tempVarPrim]));
		     retConstraints.push(makeConstraint('actualArg',[tempVarPrim,0,lhsExpr[3][1].name]));

		      constraint = makeConstraint('storeDot', [ tempVar, '$A$All',rhsExpr[1].name]);
		     retConstraints.push(constraint);
		 }
	     }
	     else{
		 // Case: x[..] = y or x.<..> = y

		 if(lhsExpr[3][0] === 'LiteralExpr'){
		     constraint = makeConstraint('storeDot', [lhsExpr[2][1].name, lhsExpr[3][1].value, rhsExpr[1].name]);
		     retConstraints.push(constraint);
		     annotate(lhsExpr[3][1].value, retConstraints);
		   //  constraint = makeConstraint('storeDot', [lhsExpr[2][1].name, annotate(lhsExpr[3][1].value, retConstraints), rhsExpr[1].name]);
		    // retConstraints.push(constraint);
		 }
		 else if(lhsExpr[1].hasOwnProperty('annotation')){
		      constraint = makeConstraint('storeDot', [ lhsExpr[2][1].name, lhsExpr[1].annotation,rhsExpr[1].name]);
		     retConstraints.push(constraint);
		 }
		 else{
		     tempVarPrim = getNextTempVar();
		     retConstraints.push(makeConstraint('loadDot',[tempVarPrim,lhsExpr[3][1].name,'toString']));
		     retConstraints.push(makeConstraint('caller',[outerNum,tempVarPrim]));
		     retConstraints.push(makeConstraint('actualArg',[tempVarPrim,0,lhsExpr[3][1].name]));
		     
		     tempVarPrim = getNextTempVar();
		     retConstraints.push(makeConstraint('loadDot',[tempVarPrim,lhsExpr[3][1].name,'valueOf']));
		     retConstraints.push(makeConstraint('caller',[outerNum,tempVarPrim]));
		     retConstraints.push(makeConstraint('actualArg',[tempVarPrim,0,lhsExpr[3][1].name]));
		     
		     constraint = makeConstraint('storeDot', [ lhsExpr[2][1].name, '$A$All',rhsExpr[1].name]);
		     retConstraints.push(constraint);
		 }
	     }    
	 }
	 else if(lhsType === 'IdExpr' && rhsType === 'ObjectExpr'){
	     num = rhsExpr.num;
	     constraint = makeConstraint('newObj', [lhsExpr[1].name, num]);
	     retConstraints.push(constraint);
	     len = rhsExpr.length;
	     tempVar = getNextTempVar();
	     constraint = makeConstraint('vPtsTo', [tempVar, num]);
	     retConstraints.push(constraint);
	     for (i = 2; i < len;i++){
		 if(rhsExpr[i][0] === 'DataProp'){
		     if (rhsExpr[i][2][0] === 'IdExpr'){
			 constraint = makeConstraint('storeDot', [tempVar, rhsExpr[i][1].name,rhsExpr[i][2][1].name]);
			 retConstraints.push(constraint);
			 annotate(rhsExpr[i][1].name, retConstraints);
		//	 constraint = makeConstraint('hstoreDot', [num, annotate(rhsExpr[i][1].name, retConstraints),rhsExpr[i][2][1].name]);
		//	 retConstraints.push(constraint);
		     }
		 }
		 else{
		     throw 'getConstraintsExpr - setter/getter props not allowed ' +rhsExpr[i][0];
		 }
	     }
	 }
	 else if(lhsType === 'IdExpr' && rhsType === 'ArrayExpr'){
	     num = rhsExpr.num;
	     constraint = makeConstraint('newArrayObj', [lhsExpr[1].name, num]);
	     retConstraints.push(constraint);
	     len = rhsExpr.length;
	     tempVar = getNextTempVar();
	     constraint = makeConstraint('vPtsTo', [tempVar, num]);
	     retConstraints.push(constraint);
	     for (i = 2; i < len;i++){
		 if (rhsExpr[i][0] === 'IdExpr'){
		     constraint = makeConstraint('storeDot', [tempVar,'$A$Num',rhsExpr[i][1].name]);
		     retConstraints.push(constraint);
		 }
	     }
	 }
	 else if(lhsType === 'IdExpr' && rhsType === 'InvokeExpr'){
	     num = rhsExpr.num;
	     len = rhsExpr.length;
	     if (rhsExpr[2][0] === 'IdExpr'){
		 
		 var argumentsNum = getNextAstNumber();
		 astNumberMap[argumentsNum] = ['IdExpr', {name:'argumentsArray'}]; // Arguments array does not have a prototype currently.
		 tempVar = getNextTempVar();
		 constraint = makeConstraint('vPtsTo', [tempVar, argumentsNum]);
		 retConstraints.push(constraint);
		 if(contextNum > 0){
		     constraint = makeConstraint('callerCon',[outerNum,rhsExpr[2][1].name,contextNum]);
		     retConstraints.push(constraint);
		     for(i = 4 ; i < len ; i++){
			 if (rhsExpr[i][0] === 'IdExpr'){
			     constraint  = makeConstraint('actualArgCon',[rhsExpr[2][1].name,i-4,rhsExpr[i][1].name,contextNum]);
			     retConstraints.push(constraint);
			     constraint = makeConstraint('storeDot',[tempVar,'$A$Num',rhsExpr[i][1].name]);
			     retConstraints.push(constraint);
			 }
		     }
		     constraint = makeConstraint('actualArgArgumentsCon',[rhsExpr[2][1].name,argumentsNum,contextNum]);
		     retConstraints.push(constraint);
		     
		     
		     constraint = makeConstraint('actualRetCon',[rhsExpr[2][1].name,lhsExpr[1].name,contextNum]);
		     retConstraints.push(constraint);
		 }
		 else{
		     constraint = makeConstraint('caller',[outerNum,rhsExpr[2][1].name,contextNum]);
		     retConstraints.push(constraint);
		      tempVar = getNextTempVar();
		     constraint = makeConstraint('vPtsTo', [tempVar, argumentsNum]);
		     retConstraints.push(constraint);
		     for(i = 4 ; i < len ; i++){
			 if (rhsExpr[i][0] === 'IdExpr'){
			     constraint  = makeConstraint('actualArg',[rhsExpr[2][1].name,i-4,rhsExpr[i][1].name]);
			     retConstraints.push(constraint);
			     constraint = makeConstraint('storeDot',[tempVar,'$A$Num', rhsExpr[i][1].name]);
			     retConstraints.push(constraint);
			 }
		     }
		     constraint = makeConstraint('actualArgArguments',[rhsExpr[2][1].name,argumentsNum]);
		     retConstraints.push(constraint);
		     
		     
		     constraint = makeConstraint('actualRet',[rhsExpr[2][1].name,lhsExpr[1].name]);
		     retConstraints.push(constraint);
		 
		 }		
	     }
	     else{
		 // TypeError as the base of the invoke expression is a literal and not an object.
		 throw 'genConstraintsExpr - invoke expr expects idExpr as base type '+ rhsType;
	     }
	 }
	 else if(lhsType === 'IdExpr' && rhsType === 'NewExpr'){
	     num = rhsExpr.num;
	     len = rhsExpr.length;
	     if (rhsExpr[2][0] === 'IdExpr'){
		 
		 var argumentsNum = getNextAstNumber();
		 astNumberMap[argumentsNum] = ['IdExpr', {name:'argumentsArray'}];
		 tempVar = getNextTempVar();
		 constraint = makeConstraint('vPtsTo', [tempVar, argumentsNum]);
		 retConstraints.push(constraint);
		 
		 if(contextNum >0){
		     constraint = makeConstraint('instance',[lhsExpr[1].name,num,rhsExpr[2][1].name,contextNum]);
		     retConstraints.push(constraint);
		     
		     constraint = makeConstraint('callerCon',[outerNum,rhsExpr[2][1].name,contextNum]);
		     retConstraints.push(constraint);
		     
		     constraint  = makeConstraint('actualArgCon',[rhsExpr[2][1].name,0,lhsExpr[1].name,contextNum]);
		     retConstraints.push(constraint);
		     
		     for(i = 3 ; i < len ; i++){
			 if (rhsExpr[i][0] === 'IdExpr'){
			     constraint  = makeConstraint('actualArgCon',[rhsExpr[2][1].name,i-2,rhsExpr[i][1].name,contextNum]);
			     retConstraints.push(constraint);
			     
			     constraint = makeConstraint('storeDot',[tempVar,'$A$Num',rhsExpr[i][1].name]);
			     retConstraints.push(constraint);
			 }
		     }
		     
		     constraint = makeConstraint('actualArgArgumentsCon',[rhsExpr[2][1].name,argumentsNum,contextNum]);
		     retConstraints.push(constraint);
		     
		     constraint = makeConstraint('actualRetCon',[rhsExpr[2][1].name,lhsExpr[1].name,contextNum]);
		     retConstraints.push(constraint);
		 }
		 else{
		     constraint = makeConstraint('instance',[lhsExpr[1].name,num,rhsExpr[2][1].name]);
		     retConstraints.push(constraint);
		     
		     constraint = makeConstraint('caller',[outerNum,rhsExpr[2][1].name]);
		     retConstraints.push(constraint);
		     
		     constraint  = makeConstraint('actualArg',[rhsExpr[2][1].name,0,lhsExpr[1].name]);
		     retConstraints.push(constraint);
		     
		     for(i = 3 ; i < len ; i++){
			 if (rhsExpr[i][0] === 'IdExpr'){
			     constraint  = makeConstraint('actualArg',[rhsExpr[2][1].name,i-2,rhsExpr[i][1].name]);
			     retConstraints.push(constraint);
			     
			     constraint = makeConstraint('storeDot',[tempVar,'$A$Num',rhsExpr[i][1].name]);
			     retConstraints.push(constraint);
			 }
		     }
		     
		     constraint = makeConstraint('actualArgArguments',[rhsExpr[2][1].name,argumentsNum]);
		     retConstraints.push(constraint);
		     
		     constraint = makeConstraint('actualRet',[rhsExpr[2][1].name,lhsExpr[1].name]);
		     retConstraints.push(constraint);
		     
		 }
	     }
	     else{
		 // Base of the invoke expression cannot be a literal -> will amount to a type error at runtime.
		 throw 'genConstraintsExpr - invokenew expr expects idExpr as base type '+ rhsType;
	     }
	 }
	 else if(lhsType === 'IdExpr' && rhsType === 'FunctionExpr'){
	     var id = "";
	     num = rhsExpr.num;
	     
	     len = rhsExpr.length;
	     if (rhsExpr[2][0] != 'Empty'){
		 // named function expression
		 id = rhsExpr[2][1].name;
		 // Adding a marker in the constraints list in order to indicate beginning of a function.
		 constraint = makeConstraint('newFunctionObj',[id,num]);
		 retConstraints.push(constraint);
	     }
	     constraint = makeConstraint('newFunctionObj',[lhsExpr[1].name,num]);
	     retConstraints.push(constraint);
	     
	     retConstraints.push('#begin ' + id);

	     constraint = makeConstraint('formalArg',[num,0,'this_'+num+'_1']);
	     retConstraints.push(constraint);

	     constraint = makeConstraint('formalArgArguments',[num,'arguments_'+num+'_1']);
	     retConstraints.push(constraint);
	     
	     var paramAst = rhsExpr[3];
	     var paramLen = paramAst.length;
	     for(i = 2 ; i < paramLen; i++){
		 constraint = makeConstraint('formalArg',[num,i-1,paramAst[i][1].name]); 
		 retConstraints.push(constraint);
	     }
	     for(i=4;i<len;i++){
		 throwVarsList = throwVarsList.concat(throwVars(rhsExpr[i]));
		 retConstraints = retConstraints.concat(genConstraints(rhsExpr[i],num));
	     }
	     
	     throwVarLen = throwVarsList.length;
	     for (i = 0; i < throwVarLen; i++){
		 constraint = makeConstraint('fThrow', [num,throwVarsList[i]]);
		 retConstraints.push(constraint);
	     }
	     retConstraints.push('#end ' + id);
	 }
	 else{
	     throw 'genConstraintsExpr - not a valid assignExpr ' + lhsType + ' ' + rhsType;
	 }
	 return retConstraints;
     }
     
     function genConstraints(ast, outerNum){
	 // Given an Ast and a scope number, generates all constraints 
	 // other than throw constraints for the current scope..
	 var i = 0;
	 var len = ast.length;
	 var type = ast[0];
	 var num;
	 var retConstraints = [];
	 var constraint;
	 var throwVarsList =[];
	 var throwVarLen;
	 var catchVar;
	
	 switch (type) {
	 case 'Program': case 'BlockStmt': case 'CatchClause':
	     for (i = 2;i <len; i++){
		 retConstraints = retConstraints.concat(genConstraints(ast[i],outerNum));
	     }
             break;
	 case 'FunctionDecl':
	     num = ast.num;
	     var id = ast[2][1].name;
	   // Adding a marker in the constraints list in order to indicate beginning of a function.
	     
	     
	     constraint = makeConstraint('newFunctionObj',[id,num]);
	     retConstraints.push(constraint);
	     
	     
	     retConstraints.push('#begin ' + id);
	     constraint = makeConstraint('formalArg',[num,0,'this_'+num+'_1']);
	     retConstraints.push(constraint);
	     
	     constraint = makeConstraint('formalArgArguments',[num,'arguments_'+num+'_1']);	     
	     retConstraints.push(constraint);
	     
	     var paramAst = ast[3];
	     var paramLen = paramAst.length;
	     for(i = 2 ; i < paramLen; i++){
		 constraint = makeConstraint('formalArg',[num,i-1,paramAst[i][1].name]); 
		 retConstraints.push(constraint);
	     }
	     
	     for(i=4;i<len;i++){
		 throwVarsList = throwVarsList.concat(throwVars(ast[i]));
		 retConstraints = retConstraints.concat(genConstraints(ast[i],num));
	     }
	     throwVarLen = throwVarsList.length;
	     for (i = 0; i < throwVarLen; i++){
		 constraint = makeConstraint('fThrow', [num,throwVarsList[i]]);
		 retConstraints.push(constraint);
	     }
	     retConstraints.push('#end ' + id);
	     break;
	     
	 case 'FunctionExpr':
	     var id = "";
	     num = ast.num;
	     
	     len = ast.length;
	     if (ast[2][0] != 'Empty'){
		 // named function expression
		 id = ast[2][1].name;
		 // Adding a marker in the constraints list in order to indicate beginning of a function.
		 constraint = makeConstraint('newFunctionObj',[id,num]);
		 retConstraints.push(constraint);
	     }
	     constraint = makeConstraint('functionType',[num]);
	     retConstraints.push(constraint);
	     
	     retConstraints.push('#begin ' + id);

	     constraint = makeConstraint('formalArg',[num,0,'this_'+num+'_1']);
	     retConstraints.push(constraint);

	     constraint = makeConstraint('formalArgArguments',[num,'arguments_'+num+'_1']);
	     retConstraints.push(constraint);
	     
	     var paramAst = ast[3];
	     var paramLen = paramAst.length;
	     for(i = 2 ; i < paramLen; i++){
		 constraint = makeConstraint('formalArg',[num,i-1,paramAst[i][1].name]); 
		 retConstraints.push(constraint);
	     }
	     for(i=4;i<len;i++){
		 throwVarsList = throwVarsList.concat(throwVars(ast[i]));
		 retConstraints = retConstraints.concat(genConstraints(ast[i],num));
	     }
	     
	     throwVarLen = throwVarsList.length;
	     for (i = 0; i < throwVarLen; i++){
		 constraint = makeConstraint('fThrow', [num,throwVarsList[i]]);
		 retConstraints.push(constraint);
	     }
	     retConstraints.push('#end ' + id);
	     
	     
	 case 'VarDecl': case 'Empty': case 'EmptyStmt': case 'ThrowStmt': case 'IdPatt':
	     break;
	 case 'ReturnStmt':
	     len = ast.length;
	     if(len >= 3){
		 if (ast[2][0] === 'IdExpr'){
		     constraint = makeConstraint('formalRet', [outerNum,ast[2][1].name]);
		     retConstraints.push(constraint);
		 }
	     }
	     break;
	 case 'TryStmt':
	     if(ast[3][0] !== 'Empty'){
		 // Catch statement exists;
		 catchVar  = ast[3][2][1].name;
		 // Extract all the uncaught throws from the try block.
		 throwVarsList = throwVars(ast[2]);

		 throwVarLen = throwVarsList.length;
		 // Assign each of the uncaught throws from the try block to the catch variable.
		 for (i = 0; i < throwVarLen; i++){
		     constraint = makeConstraint('assign',[catchVar, throwVarsList[i]]);
		     retConstraints.push(constraint);
		 }
		 constraint = makeConstraint('catchVar', [outerNum, catchVar]);
		 retConstraints.push(constraint);
	     }
	     len = ast.length;
	     for (i = 2; i < len; i++){
		 retConstraints = retConstraints.concat(genConstraints(ast[i],outerNum));
	     }
	     break;
	 case 'AssignExpr':
	     retConstraints = genConstraintsExpr(ast,outerNum);
	     break
	 default:
	     throw 'genConstraints - Not a valid statement node ' + type;
	     break;
	 }
	 return retConstraints;
     }

     function indentSpace(indent){
	 var i = 0; 
	 var result = "";
	 for(i = 0; i < indent; i++){
	     result = result + ' ';
	 }
	 return result;
     }

     function renderConstraints(constraintList, initIndent){
	 var i = 0; 
	 var len = constraintList.length;
	 var result = "";
	 var indent = initIndent;
	 for(i = 0; i < len;i++){
	     if((constraintList[i]).split(' ')[0] === '#begin'){
		 //TAKE SUBSTRING HERE.
		 result = result + indentSpace(indent)+ constraintList[i] + '.' + '\n'; 
		 indent = indent + 4;
		 
	     }
	     else if((constraintList[i]).split(' ')[0] === '#end'){
		 indent = indent - 4;
		 result = result + indentSpace(indent)+ constraintList[i] + '.' + '\n'; 
		 
	     }
	     else{
	     result = result + indentSpace(indent)+ constraintList[i] + '.' + '\n'; 
	     }
	 }

	 return result;
     }

    
     var finalConstraints = genConstraints(ast,ast.num);

     var throwVarsList = throwVars(ast);
     var throwVarLen = throwVarsList.length;
     for (i = 0; i < throwVarLen; i++){
	 constraint = makeConstraint('fThrow', [ast.num,throwVarsList[i]]);
	 finalConstraints.push(constraint);
     }

   //  console.log("final Constraint list is " + finalConstraints);
     return renderConstraints(finalConstraints,0);
 }

 
