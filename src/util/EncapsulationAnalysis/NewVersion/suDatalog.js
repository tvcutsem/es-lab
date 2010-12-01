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
 * Generates datalog constraints for the sealer unsealer object
 * @Author
 Ankur Taly (ataly@stanford.edu)
 * @arguments
     - encode: encoding function (string -> nat)
     - getNextNumber: new number generator ( _ -> nat)
 * @provides genSUConstraints
 * Notes: 
 - TODO: Does NOT support cloning currently
  */
  this.genSUConstraints = function genSUConstraints( encodeVar, encodeField, encodeLoc, getNextTempVar, getNextAstNumber, astNumberMap, relName, makeConstraint,  functionClones, nClones, maxArity) {
     
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
     

     function toPrimitiveConstraints(varName,callerAstNum){

	 var methBody = [];
	 var tempVar;
	 tempVar = getNextTempVar();

	 methBody.push(makeConstraint('loadDot',[tempVar,varName,'toString']));
	 methBody.push(makeConstraint('caller',[callerAstNum,tempVar]));
	 methBody.push(makeConstraint('actualArg',[tempVar,0,varName]));
		       
	 tempVar = getNextTempVar();
	 methBody.push(makeConstraint('loadDot',[tempVar,varName,'valueOf']));
	 methBody.push(makeConstraint('caller',[callerAstNum,tempVar]));
	 methBody.push(makeConstraint('actualArg',[tempVar,0,varName]));
	 return methBody;
     }
  
     function nativeMethConstraints(objName, methName, objAstNum, methAstNum, methConstraints){
	 // methBodyConstraints is an array of constraints corresponding to the method. 
	 var retConstraints = [];
	 var constraint;
	 
	 astNumberMap[methAstNum] = ['FunctionDecl',{},['IdPatt', {name: '$SU_'+objName + '_' + methName}],['ParamDecl',{}]];
	 
	 constraint = makeConstraint('hPtsTo', [objAstNum, methName, methAstNum]);
	 retConstraints.push(constraint);
	 
	 constraint = '#begin ' + objName + '_' + methName;
	 retConstraints.push(constraint);
	 
	 constraint = makeConstraint('functionType',[methAstNum]);
	 retConstraints.push(constraint);
	 
	 constraint = makeConstraint('formalArg',[methAstNum,0,'this' + '_' + objName + '_' + methName]);
	 retConstraints.push(constraint);
	 retConstraints = retConstraints.concat(methConstraints);

	 constraint = '#end ' + objName + '_' + methName;
	 retConstraints.push(constraint);	 
	
	 return retConstraints;
     }



     function genBrandConstraints(){
	 // Brand = function(){$ = {sealer: function(){ }
	 //
	 //
	 var constraint;
	 var retConstraints = [];
	 var boxNum;
	 var suNum;
	 var sealerNum;
	 var unsealerNum;
	 var tempVar;
	 var methBody;
	 var payLoadVar;
	 
	 suNum = getNextAstNumber();
	 astNumberMap[suNum] = ['FunctionDecl',{},['IdPatt', {name:'$SU_SealerUnsealer_0_1'}],['ParamDecl',{}]];
	 encodeLoc(suNum);
	 
	 encodeVar('SealerUnsealer_0_1');
	 
	 constraint = makeConstraint('newFunctionObj',['SealerUnsealer_0_1',suNum]);
	 retConstraints.push(constraint);

	 constraint = "#begin SealerUnSealer_0_1";
	 retConstraints.push(constraint);
	 	 
	 constraint = makeConstraint('formalArg',[suNum,0,'this_'+suNum+'_1']);
	 retConstraints.push(constraint);

	 // create payload variable
	 payloadVar = 'payload_' + suNum + '_1';

	 // create temporary var
	 tempVar = getNextTempVar();
	 
	 // create the sealerUnsealerObj
	 suObjNum = getNextAstNumber();
	 astNumberMap[suObjNum] = ['IdExpr', {name:'$SU_SealerUnsealerObj'}]; 
	 encodeLoc(suObjNum);
	 
	 // assign sealerUnsealerObj to tempVar
	 constraint = makeConstraint('newObj',[tempVar,suObjNum]);
	 retConstraints.push(constraint);

	 //begin Sealer Code
	 sealerNum = getNextAstNumber();
	 encodeLoc(sealerNum);
	 methBody = [];

	 methBody.push(makeConstraint('formalArg',[sealerNum,1,'load_seal']));
	 
	 //begin Box Code
	 boxNum = getNextAstNumber();
	 astNumberMap[boxNum] = ['FunctionDecl',{},['IdPatt', {name:'box_seal'}],['ParamDecl',{}]];
	 encodeLoc(boxNum);
	 
	 methBody.push(makeConstraint('newFunctionObj',['box_seal',boxNum]));

	 methBody.push("#begin box_seal");
	
	 methBody.push( makeConstraint('formalArg',[suNum,0,'this_'+suNum+'_1']));

	 methBody.push( makeConstraint('assign',[payloadVar,'load_seal']));

	 methBody.push(makeConstraint('seal',[boxNum]));
	 
	 methBody.push("#end box_seal");
	 // end Box code
	 
	 methBody.push(makeConstraint('formalRet',[sealerNum,'box_seal']));
	 
	 retConstraints = retConstraints.concat(nativeMethConstraints(tempVar,'seal',suObjNum,sealerNum,methBody));
	 // end Seale code
	 
	 //begin unsealer code
	 unsealerNum = getNextAstNumber();
	 encodeLoc(unsealerNum);
	 methBody = [];

	 methBody.push(makeConstraint('formalArg',[unsealerNum,1,'sealedBox_unseal']));
	 methBody.push(makeConstraint('unseal',[unsealerNum]));
	 methBody.push(makeConstraint('formalRet',[unsealerNum,payloadVar])+' :- '+ makeConstraint('sealVar',['sealedBox_unseal']));
	 
	 retConstraints = retConstraints.concat(nativeMethConstraints(tempVar,'unseal',suObjNum,unsealerNum,methBody));
	 //end unsealer code


	 constraint = makeConstraint('formalRet',[suNum,tempVar]);
	 retConstraints.push(constraint);
	 	 
	 constraint = "#end SealerUnSealer";
	 retConstraints.push(constraint);
	
	 return retConstraints;
     }
     

     function genConstraints(){
	 var retConstraints = [];
	 var constriant;
	 
	 constraint = relName('seal') + '(F) :- ' + relName('calls') + '(F,l), ' +  relName('seal') + '(l)' + ', !'+relName('unseal') + '(F)';
	 retConstraints.push(constraint);
	 
	 constraint = relName('sealVar')+'(x) :- ' + relName('vPtsTo')+'(x,l),' + relName('seal') + '(l)';
	 retConstraints.push(constraint);
	 retConstraints = retConstraints.concat(genBrandConstraints());
	 
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


     var finalConstraints = genConstraints();
   //  console.log("final Constraint list is " + finalConstraints);
     return relName('seal') + '(l:L) output \n' +
	    relName('unseal') + '(l:L) output\n' +
	    relName('sealVar') + '(x:V) output\n' +
	    renderConstraints(finalConstraints,0);
 }

 
