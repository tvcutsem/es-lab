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
 * Generates datalog constraints for the attacker
 * @Author
 Ankur Taly (ataly@stanford.edu)
 * @arguments
   
 * @provides genDOMConstraints
 * Notes:
- All DOM objects are modelled by a single location.
- All DOM methods are modelled by a single function which just returns a pointer to the summarized DOM node.
- All DOM data properties point to the summarized DOM object.
- All DOM method properties point to the summarize DOM function object.
 */
 this.genDOMConstraints = function genDOMConstraints(cloneFlag, encodeVar, encodeField, encodeLoc,encodeCon, getNextTempVar, getNextAstNumber, astNumberMap, relName, makeConstraint,  functionClones, nClones, maxArity) {
     

     // The followings sets - DOMAttributes and DOMMethods were obtained from http://www.w3.org/TR/DOM-Level-2-Core/core.html
     var DOMAttributes = 
	 {documentElement:1,
	  childNodes:1,
	  firstChild: 1,
	  lastChild:1,
	  nextSibling:1,
	  nodeValue:0,
	  ownerDocument:1,
	  parentNode:1,
	  previousSibling:1};
     // These are attributes whose values could potentially be DOM objects.
     
     var DOMMethods = 
	 {
	  createDocument:1,
	  createAttribute:1,
	  createComment:1,
	  createDocumentFragment:1,
	  createElement:1,
	  createEntityReference:1,
	  createTextNode:1,
	  getElementById:1,
	  getElementsByTagName:1,
	  importNode:1,
	  appendChild:1,
	  cloneNode:1,
	  insertBefore:1,
	  removeChild:1,
	  replaceChild:1	  
	 } ;
     // These are methods that could potentially return DOM objects.

 
     
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
     
   
     function basicDOMFunc(domFuncNum,domObjNum,methName){
	 var constraint;
	 var retConstraints=[];
	 var i;

	 constraint = '#begin '+methName;
	 retConstraints.push(constraint);
	 
	 tempVar = getNextTempVar();
	 
	 constraint = makeConstraint('functionType',[domFuncNum]);
	 retConstraints.push(constraint);
	 
	 
//	 retConstraints.push(makeConstraint('formalArg', [domFuncNum,0,'this_'+methName]));
	// retConstraints.push(makeConstraint('assign',[tempVar, 'this_'+methName]));

	 for (i = 1 ; i <= maxArity+1;i++){
	    retConstraints.push(makeConstraint('formalArg', [domFuncNum,i,'arg_'+methName +'__' + i]));
	 //    retConstraints.push(makeConstraint('assign',[tempVar, 'arg_'+methName+'_'+i]));   
	 }
	 
	 //	 retConstraints.push(makeConstraint('hstoreDotStrong',[domObjNum,'$A$Dom',tempVar]));   

	 constraint = makeConstraint('vPtsTo',[tempVar, domObjNum]);
	 retConstraints.push(constraint);
	 
	 constraint = makeConstraint('formalRet',[domFuncNum,tempVar]);
	 retConstraints.push(constraint);

	 constraint = '#end '+methName;
	 retConstraints.push(constraint);
	 
	 return retConstraints;
     }

     function domConstraints(){
	 var constraint;
	 var retConstraints = [];

	 var domObjNum = getNextAstNumber();
	 encodeLoc(domObjNum);
	 var domFuncNum = getNextAstNumber();
	 encodeLoc(domFuncNum);
	 var domFuncNumClone;
	 var tempVar;
	 var i;

	
	 astNumberMap[domObjNum] = ['IdExpr',{name:'$DOM_DOM_obj'}];
	 astNumberMap[domObjNum].isDOM = 1;
	 astNumberMap[domFuncNum] = ['FunctionDecl',{},['IdPatt',{name:'$DOM_DOM_func'}],['ParamDecl',{}]];
	 astNumberMap[domFuncNum].isDOM = 1;

	 constraint = '#begin DOM_Obj';
	 retConstraints.push(constraint);

	 constraint = makeConstraint('precious',[domObjNum]);
	 retConstraints.push(constraint);
	 constraint = makeConstraint('precious',[domFuncNum]);
	 retConstraints.push(constraint);


	 constraint = makeConstraint('vPtsTo',['document_0_1',domObjNum]);
	 retConstraints.push(constraint);

	 constraint = makeConstraint('storeDot',['window_0_1','document','document_0_1']);
	 retConstraints.push(constraint);
	 
	 // DOM atributes
	
	 for(var p in DOMAttributes){
	     if(DOMAttributes[p] === 1){
		 constraint = makeConstraint('hPtsTo',[domObjNum, p,domObjNum]);
		 retConstraints.push(constraint);}
	 }
	 // DOM methods
	 
	 for(var p in DOMMethods){
	     if(DOMMethods[p] === 1){
		 constraint = makeConstraint('hPtsTo',[domObjNum, p,domFuncNum]);
		 retConstraints.push(constraint);}
	 }

	 retConstraints = retConstraints.concat(basicDOMFunc(domFuncNum, domObjNum,'$DOM_DOM_Func'));

	 //clones
	 if(cloneFlag){
	     for(j = 0 ; j < nClones; j++){
		 domFuncNumClone = getNextAstNumber();
		 astNumberMap[domFuncNumClone] = ['FunctionDecl',{},['IdPatt',{name:'$DOM_DOM_FuncClone'}],['ParamDecl',{}]];
		 astNumberMap[domFuncNumClone].isDOM = 1;

		 encodeLoc(domFuncNumClone);
		 retConstraints.push(makeConstraint('clone',[domFuncNum,j+1,domFuncNumClone]));

		 methName = '$DOM_DOM_FuncClone' +(j+1);
		 retConstraints = retConstraints.concat(basicDOMFunc(domFuncNumClone,domObjNum,methName))
	     }
	 }
	 else{
	     retConstraints.push(relName('clone') +'(' +encodeLoc(domFuncNum) + ',' + 'i' + ',' + encodeLoc(domFuncNum) + ')');
	 }
	 
	 constraint = '#end DOM_Obj';
	 retConstraints.push(constraint);
	 
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

    
     var dConstraints = domConstraints();

     return renderConstraints(dConstraints,0);
 }

 
