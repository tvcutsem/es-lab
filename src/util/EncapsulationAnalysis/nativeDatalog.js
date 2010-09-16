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
 * Generates datalog constraints for the native objects and also for 'nClones' number of clones
   for each native function object.
 * @Author
 Ankur Taly (ataly@stanford.edu)
 * @arguments
    
 * @provides genNativeConstraints
 * Notes: 
    - Throws on native errors like TypeError, ReferenceError are not encoded.
    - The encoding of native objects is along the lines of CFA2 and tries to keep the argument return matching as precise as possible.

   
*/
      this.genNativeConstraints =  
    function genNativeConstraints(cloneFlag, freezeNativeFlag,  encodeVar, encodeField, encodeLoc, getNextTempVar, getNextAstNumber, astNumberMap, relName, makeConstraint,  functionClones, nClones, maxArity) {
	  
	var dumpNum = encodeVar('$$dump');
	
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
     
	  function toPrimitiveConstraints(varName,callerAstNum,contextNum){
	      
	      var methBody = [];
	      var tempVar;
	      tempVar = getNextTempVar();
	      
	      methBody.push(makeConstraint('loadDot',[tempVar,varName,'toString']));
    
	      if(!contextNum){
		  methBody.push(makeConstraint('caller',[callerAstNum,tempVar]));
		  methBody.push(makeConstraint('actualArg',[tempVar,0,varName]));
	      }
	      else{
		  methBody.push(makeConstraint('callerCon',[callerAstNum,tempVar, contextNum]));
		  methBody.push(makeConstraint('actualArgCon',[tempVar,0,varName,contextNum]));
	      }
	      
	      tempVar = getNextTempVar();
	      methBody.push(makeConstraint('loadDot',[tempVar,varName,'valueOf']));
	      
	      if(!contextNum){
		  methBody.push(makeConstraint('caller',[callerAstNum,tempVar]));
		  methBody.push(makeConstraint('actualArg',[tempVar,0,varName]));
	      }
	      else{
		  methBody.push(makeConstraint('callerCon',[callerAstNum,tempVar,contextNum]));
		  methBody.push(makeConstraint('actualArgCon',[tempVar,0,varName,contextNum]));
	      }
	      return methBody;
	  }
	  
	  function nativeMethConstraints(objName, methName, objAstNum, methAstNum, methConstraints,flag,contextNum){
	      // objAstNum is the astNumber of the base object and methAstNum is the astNum of the method being created.
	      // methBodyConstraints is an array of constraints corresponding to the method. 
	      // flag is true only while constructing clone methods.

	      var retConstraints = [];
	      var constraint;
	      
	      astNumberMap[methAstNum] = ['FunctionDecl',{},['IdPatt', {name: '$Native_' + objName + '_' + methName}],['ParamDecl',{}]];
	      astNumberMap[methAstNum].isNative = 1;

	      if(!flag){
		  constraint = makeConstraint('hPtsTo', [objAstNum, methName, methAstNum]);
		  retConstraints.push(constraint);
	      }
	      constraint = '#begin ' + objName + '_' + methName;
	      retConstraints.push(constraint);
	      
	      constraint = makeConstraint('functionType',[methAstNum]);
	      retConstraints.push(constraint);
	      
	      if(freezeNativeFlag){
		  retConstraints.push(makeConstraint('frozenObjStrong',[methAstNum]));
	      }
	      constraint = makeConstraint('formalArg',[methAstNum,0,'this' + '_' + objName + '_' + methName]);
	      retConstraints.push(constraint);
	      retConstraints = retConstraints.concat(methConstraints);
	      
	      constraint = '#end ' + objName + '_' + methName;
	      retConstraints.push(constraint);	 
	      
	      return retConstraints;
	  }
	  
	
	  
// BEGIN NEW OBJPROTO CONSTRAINTS
	  function genObjProtoToString(astNum,methAstNum,methName,flag,contextNum){
	      var retConstraints = [];
	      var constraint;
	      var methBody = [];
	      var tempVar;
	      var tempAstNum;

	      methBody = [];
	      retConstraints = retConstraints.concat(nativeMethConstraints('ObjProto','toString',astNum, methAstNum, methBody,flag,contextNum));
	      return retConstraints;
	  }
	

	  function genObjProtoToLocaleString(astNum,methAstNum,methName,flag,contextNum){
              var retConstraints = [];
              var constraint;
              var methBody = [];
              var tempVar;
              var tempAstNum;
	      var em = encodeLoc(methAstNum);
	      var cn = contextNum;
              methBody = [];
	      if(!contextNum){
                  methBody.push('HActualArg(m,0,l) :- HActualArg('+em+',1,l), HCaller(G,'+em+'),  HPtsTo(l,'+encodeField('toString')+',m)');
                  methBody.push('HCaller('+em+',m) :- HActualArg('+em+',1,l), HCaller(G,'+em+'), HPtsTo(l,'+encodeField('toString')+',m)');
               }
               else{
                   methBody.push('HActualArgCon(m,0,l,'+cn+') :- HActualArg('+em+',1,x), HCaller(G,'+em+'), HPtsTo(l,'+encodeField('toString')+',m)');
                   methBody.push('HCallerCon('+em+',m,'+cn+') :- HActualArg('+em+',1,x), HCaller(G,'+em+'), HPtsTo(l,'+encodeField('toString')+',m)');
               }
	
              retConstraints = retConstraints.concat(nativeMethConstraints('ObjProto',methName,astNum, methAstNum, methBody,flag,contextNum));
              return retConstraints;
          }


	  function genObjProtoValueOf(astNum,methAstNum,methName,flag,contextNum){
	      var retConstraints = [];
	      var constraint;
	      var methBody = [];
	      var tempVar;
	      var tempAstNum;
	      var em = encodeLoc(methAstNum);
	      var cn = contextNum;

	      methBody = [];
	      if(!contextNum){
		  methBody.push('VPtsTo(y,l) :- HActualEverything('+em+',1,l,y,G)');
	      }
	      else{
		  methBody.push('VPtsTo(y,l) :- HActualEverything('+em+',1,l,y,G)');
	      }
	      retConstraints = retConstraints.concat(nativeMethConstraints('ObjProto',methName,astNum, methAstNum, methBody,flag,contextNum));
	      return retConstraints;
	  }

    
	   function genObjProtoHasOwnProperty(astNum,methAstNum,methName,flag,contextNum){
	        var retConstraints = [];
	       var constraint;
	       var methBody = [];
	       var tempVar;
	       var tempAstNum;
	        var em = encodeLoc(methAstNum);
	      var cn = contextNum;
	       
	       
	        methBody = [];
	       if(!contextNum){
		   methBody.push('HActualArg(m,0,l) :- HActualArg('+em+',1,l), HCaller(G,'+em+'), HPtsTo(l,'+encodeField('toString')+',m)');
		   methBody.push('HCaller('+em+',m) :- HActualArg('+em+',1,l), HCaller(G,'+em+'), HPtsTo(l,'+encodeField('toString')+',m)');
	           methBody.push('HActualArg(m,0,l) :- HActualArg('+em+',1,l), HCaller(G,'+em+'), HPtsTo(l,'+encodeField('valueOf')+',m)');
                   methBody.push('HCaller('+em+',m) :- HActualArg('+em+',1,l), HCaller(G,'+em+'), HPtsTo(l,'+encodeField('valueOf')+',m)');
	       }
	       else{
		   methBody.push('HActualArgCon(m,0,l,'+cn+') :- HActualArg('+em+',1,l), HCaller(G,'+em+'), HPtsTo(l,'+encodeField('toString')+',m)');
		   methBody.push('HCallerCon('+em+',m,'+cn+') :- HActualArg('+em+',1,l), HCaller(G,'+em+'), HPtsTo(l,'+encodeField('toString')+',m)');
	           methBody.push('HActualArgCon(m,0,l,'+cn+') :- HActualArg('+em+',1,l), HCaller(G,'+em+'), HPtsTo(l,'+encodeField('valueOf')+',m)');
                   methBody.push('HCallerCon('+em+',m,'+cn+') :- HActualArg('+em+',1,l), HCaller(G,'+em+'), HPtsTo(l,'+encodeField('valueOf')+',m)');
	       }
	       retConstraints = retConstraints.concat(nativeMethConstraints('ObjProto',methName,astNum, methAstNum, methBody,flag,contextNum));
	       return retConstraints;
	  }

	  function genObjProtoPropertyIsEnumerable(astNum,methAstNum,methName,flag,contextNum){
	       var retConstraints = [];
	       var constraint;
	       var methBody = [];
	       var tempVar;
	       var tempAstNum;
	       var em = encodeLoc(methAstNum);
	      var cn = contextNum;

	      
	      methBody = [];
	      if(!contextNum){
		  methBody.push('HActualArg(m,0,l) :- HActualArg('+em+',1,l), HCaller(G,'+em+'), HPtsTo(l,'+encodeField('toString')+',m)');
		  methBody.push('HCaller('+em+',m) :- HActualArg('+em+',1,l), HCaller(G,'+em+'), HPtsTo(l,'+encodeField('toString')+',m)');
	           methBody.push('HActualArg(m,0,l) :- HActualArg('+em+',1,l), HCaller(G,'+em+'), HPtsTo(l,'+encodeField('valueOf')+',m)');
                  methBody.push('HCaller('+em+',m) :- HActualArg('+em+',1,l), HCaller(G,'+em+'), HPtsTo(l,'+encodeField('valueOf')+',m)');
	      }
	      else{
		  methBody.push('HActualArgCon(m,0,l,'+cn+') :- HActualArg('+em+',1,l), HCaller(G,'+em+'), HPtsTo(l,'+encodeField('toString')+',m)');
		  methBody.push('HCallerCon('+em+',m,'+cn+') :- HActualArg('+em+',1,l), HCaller(G,'+em+'), HPtsTo(l,'+encodeField('toString')+',m)');
	          methBody.push('HActualArgCon(m,0,l,'+cn+') :- HActualArg('+em+',1,l), HCaller(G,'+em+'), HPtsTo(l,'+encodeField('valueOf')+',m)');
                  methBody.push('HCallerCon('+em+',m,'+cn+') :- HActualArg('+em+',1,l), HCaller(G,'+em+'), HPtsTo(l,'+encodeField('valueOf')+',m)');
		  
	       }
	       retConstraints = retConstraints.concat(nativeMethConstraints('ObjProto',methName,astNum, methAstNum, methBody,flag,contextNum));
	       return retConstraints
	   }

	   function genObjProtoIsPrototypeOf(astNum,methAstNum,methName,flag,contextNum){
	       var retConstraints = [];
	       var constraint;
	       var methBody = [];
	       var tempVar;
	       var tempAstNum;
	       
	       methBody = [];
	       methBody.push(makeConstraint('formalArg',[methAstNum,1,'arg_ObjProto_'+methName+'1']));
	       
	       retConstraints = retConstraints.concat(nativeMethConstraints('ObjProto',methName,astNum, methAstNum, methBody,flag,contextNum));
	       return retConstraints;
	   }
    
// END NEW OBJPROTO CONSTRAINTS 




    
	  function genObjProtoConstraints(astNum){
	      var retConstraints = [];
	      var constraint;
	      var astNum ;
	      var methAstNum;
	      var methAstNumClone;
	      var methBody;
	      var tempVar;
	      var methName;
	      var i,j;
	      
	      constraint = "#begin ObjectPrototype";
	      retConstraints.push(constraint);
	     
	      
	      // toString
	      methAstNum = getNextAstNumber();
	      encodeLoc(methAstNum);
	      methName = 'toString';
	      retConstraints = retConstraints.concat(genObjProtoToString(astNum,methAstNum,methName));

	      //clones
	       if(cloneFlag){
		  for(j = 0 ; j < nClones; j++){
		      methAstNumClone = getNextAstNumber();
		      encodeLoc(methAstNumClone);
		      methName = 'toStringClone' +(j+1);
		      retConstraints.push(makeConstraint('clone',[methAstNum,j+1,methAstNumClone]));
		      retConstraints = retConstraints.concat(genObjProtoToString(astNum,methAstNumClone,methName,1,j+1));
		  }
	       }
	      else{
		  retConstraints.push(relName('clone') +'(' +encodeLoc(methAstNum) + ',' + 'i' + ',' + encodeLoc(methAstNum) + ')');
	      }

	       // toLocaleString
	      methAstNum = getNextAstNumber();
	      encodeLoc(methAstNum);
	      methName = 'toLocaleString';
	      retConstraints = retConstraints.concat(genObjProtoToLocaleString(astNum,methAstNum,methName));

	      //clones
	       if(cloneFlag){
		  for(j = 0 ; j < nClones; j++){
		      methAstNumClone = getNextAstNumber();
		      encodeLoc(methAstNumClone);
		      retConstraints.push(makeConstraint('clone',[methAstNum,j+1,methAstNumClone]));
		      
		      methName = 'toLocaleStringClone' +(j+1);
		      retConstraints = retConstraints.concat(genObjProtoToLocaleString(astNum,methAstNumClone,methName,1,j+1));
		  }
	       }
	      else{
		  retConstraints.push(relName('clone') +'(' +encodeLoc(methAstNum) + ',' + 'i' + ',' + encodeLoc(methAstNum) + ')');
	      }

	      // valueOf
	      methAstNum = getNextAstNumber();
	      encodeLoc(methAstNum);
	      methName = 'valueOf';
	      retConstraints = retConstraints.concat(genObjProtoValueOf(astNum,methAstNum,methName));

	      //clones
	       if(cloneFlag){
		  for(j = 0 ; j < nClones; j++){
		      methAstNumClone = getNextAstNumber();
		      encodeLoc(methAstNumClone);
		      		      retConstraints.push(makeConstraint('clone',[methAstNum,j+1,methAstNumClone]));

		      methName = 'valueOfClone' +(j+1);
		      retConstraints = retConstraints.concat(genObjProtoValueOf(astNum,methAstNumClone,methName,1,j+1));
		  }
	       }
	      else{
		  retConstraints.push(relName('clone') +'(' +encodeLoc(methAstNum) + ',' + 'i' + ',' + encodeLoc(methAstNum) + ')');
	      }


	       // hasOwnProperty
	      methAstNum = getNextAstNumber();
	      encodeLoc(methAstNum);
	      methName = 'hasOwnProperty';
	      retConstraints = retConstraints.concat(genObjProtoHasOwnProperty(astNum,methAstNum,methName));

	      //clones
	       if(cloneFlag){
		  for(j = 0 ; j < nClones; j++){
		      methAstNumClone = getNextAstNumber();
		      encodeLoc(methAstNumClone);
		      methName = 'hasOwnPropertyClone' +(j+1);
		      retConstraints.push(makeConstraint('clone',[methAstNum,j+1,methAstNumClone]));
		      retConstraints = retConstraints.concat(genObjProtoHasOwnProperty(astNum,methAstNumClone,methName,1,j+1));
		  }
	       }
	      else{
		  retConstraints.push(relName('clone') +'(' +encodeLoc(methAstNum) + ',' + 'i' + ',' + encodeLoc(methAstNum) + ')');
	      }



	       // propertyIsEnumerable
	      methAstNum = getNextAstNumber();
	      encodeLoc(methAstNum);
	      methName = 'propertyIsEnumerable';
	      retConstraints = retConstraints.concat(genObjProtoPropertyIsEnumerable(astNum,methAstNum,methName));

	      //clones
	       if(cloneFlag){
		  for(j = 0 ; j < nClones; j++){
		      methAstNumClone = getNextAstNumber();
		      encodeLoc(methAstNumClone);
		      methName = 'propertyIsEnumerableClone' +(j+1);
		      retConstraints.push(makeConstraint('clone',[methAstNum,j+1,methAstNumClone]));
		      retConstraints = retConstraints.concat(genObjProtoPropertyIsEnumerable(astNum,methAstNumClone,methName,1,j+1));
		  }
	       }
	      else{
		  retConstraints.push(relName('clone') +'(' +encodeLoc(methAstNum) + ',' + 'i' + ',' + encodeLoc(methAstNum) + ')');
	      }
	      

	      // isPrototypeOf
	      methAstNum = getNextAstNumber();
	      encodeLoc(methAstNum);
	      methName = 'isPrototypeOf';
	      retConstraints = retConstraints.concat(genObjProtoIsPrototypeOf(astNum,methAstNum,methName));


	      //clones
	       if(cloneFlag){
		  for(j = 0 ; j < nClones; j++){
		      methAstNumClone = getNextAstNumber();
		      encodeLoc(methAstNumClone);
		      		      retConstraints.push(makeConstraint('clone',[methAstNum,j+1,methAstNumClone]));

		      methName = 'isPrototypeOfClone' +(j+1);
		      retConstraints = retConstraints.concat(genObjProtoIsPrototypeOf(astNum,methAstNumClone,methName,1,j+1));
		  }
	       }
	      else{
		  retConstraints.push(relName('clone') +'(' +encodeLoc(methAstNum) + ',' + 'i' + ',' + encodeLoc(methAstNum) + ')');
	      }

	      // end
	      
	      constraint = '#end ObjectPrototype';;
	      retConstraints.push(constraint);
	      
	      return retConstraints;
	  }
    
	   function genFuncProtoToString(astNum,methAstNum,methName,flag,contextNum){
	       var retConstraints = [];
	       var constraint;
	       var methBody = [];
	       var tempVar;
	       var tempAstNum;
	       var methAstNumClone;
	       var methAstNum;
	       methBody = [];
	       
	       retConstraints = retConstraints.concat(nativeMethConstraints('FuncProto',methName,astNum, methAstNum, methBody,flag,contextNum));
	       return retConstraints
	   }
	  
    	  function genFuncProtoCall(astNum,methAstNum,methName,flag,contextNum){
	      var retConstraints = [];
	      var constraint;
	      var methBody = [];
	      var tempVar;
	      var tempAstNum;
	      var i;
	      var em = encodeLoc(methAstNum);
	      var cn = contextNum;
	       
	      
	       
	      
	      // call(arg1,...,argn) - imprecise as we are considering arity <= maxArity+1
	      // $ =  this.call(arg1,...,argn); return $.
	    
	      methBody = [];	      
	       
	       if(!contextNum){
		   for(i = 0; i <= maxArity ;i++){
		       methBody.push('HActualArg(arg'+0+','+i+',arg'+ (i+1)+') :- HActualArg('+em+','+0+',arg' + 0+'), HActualArg('+em+','+(i+1)+',arg' + (i+1)+'), HCaller(G,'+em+')');   
		   }
	     	   methBody.push('HCaller('+em+ ',arg'+0+')  :- HActualArg('+em+','+0+',arg' + 0 + '), HCaller(G,'+em+')');   
		   methBody.push('HActualRet(arg'+0+',x)  :- HActualArg('+em+','+0+',arg' + 0 + '), HActualRet('+em+',x), HCaller(G,'+em+')');   
	      }
	      else{

		   for(i = 0; i <= maxArity ;i++){
		       methBody.push('HActualArgCon(arg'+0+','+i+',arg'+ (i+1)+','+cn+') :- HActualArg('+em+','+0+',arg' + 0+'), HActualArg('+em+','+(i+1)+',arg' + (i+1)+'), HCaller(G,'+em+')');   
		   }
	     	  methBody.push('HCallerCon('+em+ ',arg'+0+','+cn+')  :- HActualArg('+em+','+0+',arg' + 0 + '), HCaller(G,'+em+')');   
		  methBody.push('HActualRetCon(arg'+0+',x,'+cn+')  :- HActualArg('+em+','+0+',arg' + 0 + '), HActualRet('+em+',x), HCaller(G,'+em+')'); 
	      }
		
	       
	       retConstraints = retConstraints.concat(nativeMethConstraints('FuncProto',methName,astNum, methAstNum, methBody,flag,contextNum));
	       return retConstraints
	  }
	  
	  function genFuncProtoApply(astNum,methAstNum,methName,flag,contextNum){
	      var retConstraints = [];
	       var constraint;
	       var methBody = [];
	       var tempVar;
	       var tempAstNum;
	          var em = encodeLoc(methAstNum);
	      var cn = contextNum;
	       
	       
	      // apply(arg1,arg2)
	      // $1 = arg2[..]; $2 = this.call(arg1,$,...,$); return $2.
	      
	  
	      methBody = [];
	       if(!contextNum){
		   methBody.push('HActualArg(arg'+0+','+0+',arg'+(1)+') :- HActualArg('+em+','+0+',arg' + 0+'), HActualArg('+em+','+(1)+',arg' + (1)+'), HCaller(G,'+em+')');   
		   methBody.push('HActualArgAll(arg'+0+',arg'+ (2)+') :- HActualArg('+em+','+0+',arg' + 0+'), HActualArg('+em+','+(2)+',arg' + (2)+'), HCaller(G,'+em+')');   
     		   methBody.push('HCaller('+encodeLoc(methAstNum)+ ',arg'+0+')  :- HActualArg('+em+','+0+',arg' + 0 + '), HCaller(G,'+em+')');   
		   methBody.push('HActualRet(arg'+0+',x)  :- HActualArg('+em+','+0+',arg' + 0 + '), HActualRet('+em+',x), HCaller(G,'+em+')');   
	      }
	      else{
		  methBody.push('HActualArgCon(arg'+0+','+0+',arg'+(1)+','+cn+') :- HActualArg('+em+','+0+',arg' + 0+'), HActualArg('+em+','+(1)+',arg' + (1)+'), HCaller(G,'+em+')');   
		  methBody.push('HActualArgAllCon(arg'+0+',arg'+ (2)+','+cn+') :- HActualArg('+em+','+0+',arg' + 0+'), HActualArg('+em+','+(2)+',arg' + (2)+'), HCaller(G,'+em+')');   
     		  methBody.push('HCallerCon('+encodeLoc(methAstNum)+ ',arg'+0+','+cn+')  :- HActualArg('+em+','+0+',arg' + 0 + '), HCaller(G,'+em+')');   
		  methBody.push('HActualRetCon(arg'+0+',x,'+cn+')  :- HActualArg('+em+','+0+',arg' + 0 + '), HActualRet('+em+',x), HCaller(G,'+em+')');   
	      }

	      retConstraints = retConstraints.concat(nativeMethConstraints('FuncProto',methName,astNum, methAstNum, methBody,flag,contextNum));
	      return retConstraints
	  }
	  

	  

	  function genFuncProtoConstraints(astNum,objProtoNum){
	      var retConstraints = [];
	      var constraint;
	      var astNum ;
	      var methAstNum,methAstNumClone;
	      var tempVar1, tempVar2;
	      var i,j;
	      
	      constraint = "#begin FunctionPrototype";
	      retConstraints.push(constraint);
	      retConstraints.push(makeConstraint('prototype',[astNum,objProtoNum]));

	
	      // toString
	      methAstNum = getNextAstNumber();
	      encodeLoc(methAstNum);
	      methName = 'toString';
	      retConstraints = retConstraints.concat(genFuncProtoToString(astNum,methAstNum,methName));

	      //clones
	       if(cloneFlag){
		  for(j = 0 ; j < nClones; j++){
		      methAstNumClone = getNextAstNumber();
		      encodeLoc(methAstNumClone);
		      retConstraints.push(makeConstraint('clone',[methAstNum,j+1,methAstNumClone]));

		      methName = 'toStringClone' +(j+1);
		      retConstraints = retConstraints.concat(genFuncProtoToString(astNum,methAstNumClone,methName,1,j+1));
		  }
	       }
	      else{
		  retConstraints.push(relName('clone') +'(' +encodeLoc(methAstNum) + ',' + 'i' + ',' + encodeLoc(methAstNum) + ')');
	      }

	       // call
	      methAstNum = getNextAstNumber();
	      encodeLoc(methAstNum);
	      methName = 'call';
	      retConstraints = retConstraints.concat(genFuncProtoCall(astNum,methAstNum,methName));

	      //clones
	      if(cloneFlag){
		  for(j = 0 ; j < nClones; j++){
		      methAstNumClone = getNextAstNumber();
		      encodeLoc(methAstNumClone);
		      		      retConstraints.push(makeConstraint('clone',[methAstNum,j+1,methAstNumClone]));

		      methName = 'callClone' +(j+1);
		      retConstraints = retConstraints.concat(genFuncProtoCall(astNum,methAstNumClone,methName,1,j+1));
		  }
	       }
	      else{
		  retConstraints.push(relName('clone') +'(' +encodeLoc(methAstNum) + ',' + 'i' + ',' + encodeLoc(methAstNum) + ')');
	      }

	      // apply
	      methAstNum = getNextAstNumber();
	      encodeLoc(methAstNum);
	      methName = 'apply';
	      retConstraints = retConstraints.concat(genFuncProtoApply(astNum,methAstNum,methName));

	      //clones
	       if(cloneFlag){
		  for(j = 0 ; j < nClones; j++){
		      methAstNumClone = getNextAstNumber();
		      encodeLoc(methAstNumClone);
		     retConstraints.push(makeConstraint('clone',[methAstNum,j+1,methAstNumClone]));

		      methName = 'applyClone' +(j+1);
		     retConstraints = retConstraints.concat(genFuncProtoApply(astNum,methAstNumClone,methName,1,j+1));
		  }
	       }
	      else{
		  retConstraints.push(relName('clone') +'(' +encodeLoc(methAstNum) + ',' + 'i' + ',' + encodeLoc(methAstNum) + ')');
	      }
	     
	      // end
	  
	      constraint = '#end FunctionPrototype';;
	      retConstraints.push(constraint);
	      
	      return retConstraints;
	  }
	  


	  
	  
	  function genArrayProtoToString(astNum,methAstNum,methName,flag,contextNum){
	      // toString
	      // $1 = this.join; $2 = $1(this); return $2. 
	      var retConstraints = [];
	      var constraint;
	      var methBody = [];
	      var tempVar, tempVar1, tempVar2;
	      var tempAstNum;
	      var em = encodeLoc(methAstNum);
	      var cn = contextNum;
	       


	      methBody = [];
	     
	       if(!contextNum){
                   methBody.push('HActualArg(m,0,l) :- HActualArg('+em+',0,l), HCaller(G,'+em+'), HPtsTo(l,'+encodeField('join')+',m)');
                   methBody.push('HCaller(m,l) :- HActualArg('+em+',0,l), HCaller(G,'+em+'), HPtsTo(l,'+encodeField('join')+',m)');
		   methBody.push('HActualRet(m,x) :- HActualRet('+em+',x), HActualArg('+em+',0,l), HCaller(G,'+em+'), HPtsTo(l,'+encodeField('join')+',m)');

               }
              else{

		  methBody.push('HActualArgCon(m,0,l,'+cn+') :- HActualArg('+em+',0,l), HCaller(G,'+em+'), HPtsTo(l,'+encodeField('join')+',m)');
                   methBody.push('HCallerCon(m,l,'+cn+') :- HActualArg('+em+',0,l), HCaller(G,'+em+'), HPtsTo(l,'+encodeField('join')+',m)');
		   methBody.push('HActualRetCon(m,x,'+cn+') :- HActualRet('+em+',x), HActualArg('+em+',0,l), HCaller(G,'+em+'), HPtsTo(l,'+encodeField('join')+',m)');
               }

	      retConstraints = retConstraints.concat(nativeMethConstraints('ArrayProto',methName,astNum, methAstNum, methBody,flag,contextNum));
	      return retConstraints
	  }
	  
	  function genArrayProtoConcat(astNum,methAstNum,methName,flag,contextNum){
	      var retConstraints = [];
	      var constraint;
	      var methBody = [];
	      var tempVar;
	      var tempAstNum;
	      var num1,num2;   
	      var i;
	      var em = encodeLoc(methAstNum);
	      var cn = contextNum;
	      var eAnnNum = encodeField('$A$Num');
	      var num1Enc;
 
	        // concat(arg1,..argn)
	       // A = []; FORALL i: ($ = arg_i[..]; A[..] = $; A[..] = arg_i); return A;
	       methBody = [];
	      
	      if(!contextNum){
		  num1 = getNextAstNumber();
		  astNumberMap[num1] = ['IdExpr',{name:methName+'Clone_' +cn+ '_retVal'}];
		  methBody.push(makeConstraint('arrayType',[num1]));
		  num1Enc = encodeLoc(num1);
		  
		   for(i = 1; i<= maxArity;i++){
		       methBody.push('HStoreDot('+num1Enc+','+eAnnNum+',m) :- HActualArg('+em+','+i+',m), HCaller(G,'+em+')');
		       methBody.push('HStoreDot('+num1Enc+','+eAnnNum+',m) :- HActualArg('+em+','+i+',l), HCaller(G,'+em+'), HPtsTo(l,'+eAnnNum+',m)');
		   }
		  
		  methBody.push('VPtsTo(x,'+num1Enc+') :- HActualRet('+em+',x)');
	      }
	      else{
		  num1 = getNextAstNumber();
		  astNumberMap[num1] = ['IdExpr',{name:methName+'Clone_'+cn+'_retVal'}];
		  methBody.push(makeConstraint('arrayType',[num1]));
		  num1Enc = encodeLoc(num1);

		   for(i = 1; i<= maxArity;i++){
		       methBody.push('HStoreDot('+num1Enc+','+eAnnNum+',m) :- HActualArg('+em+','+i+',m), HCaller(G,'+em+')');
		       methBody.push('HStoreDot('+num1Enc+','+eAnnNum+',m) :- HActualArg('+em+','+i+',l), HCaller(G,'+em+'), HPtsTo(l,'+eAnnNum+',m)');
		   }
		  
		  methBody.push('VPtsTo(x,'+num1Enc+') :- HActualRet('+em+',x)');
		  
	      }
	      
	       retConstraints = retConstraints.concat(nativeMethConstraints('ArrayProto',methName,astNum, methAstNum, methBody,flag,contextNum));
	       return retConstraints
	  }
	 

	   function genArrayProtoPush(astNum,methAstNum,methName,flag,contextNum){
	      var retConstraints = [];
	      var constraint;
	      var methBody = [];
	      var tempVar;
	      var tempAstNum;
	       var i;
	       var em = encodeLoc(methAstNum);
	      var cn = contextNum;
	       var eAnnNum = encodeField('$A$Num');

	       

	       // push(arg1,...,argn)
	 // $1 = this.length; toPrimitive($1); FORALL i: (this[..] = argi);
	 
	       methBody = [];

	       if(!contextNum){
		   methBody.push('HActualArg(n,0,m) :- HActualEverything('+em+',0,l,'+dumpNum+',G),  HPtsTo(l,'+encodeField('length')+',m), HPtsTo(m,'+encodeField('toString')+',n)');
		   methBody.push('HCaller('+em+',n) :- HActualEverything('+em+',0,l,'+dumpNum+',G), HPtsTo(l,'+encodeField('length')+',m), HPtsTo(m,'+encodeField('toString')+',n)');
		   methBody.push('HActualArg(n,0,m) :- HActualEverything('+em+',0,l,'+dumpNum+',G), HPtsTo(l,'+encodeField('length')+',m), HPtsTo(m,'+encodeField('valueOf')+',n)');
		   methBody.push('HCaller('+em+',n) :- HActualEverything('+em+',0,l,'+dumpNum+',G), HPtsTo(l,'+encodeField('length')+',m), HPtsTo(m,'+encodeField('valueOf')+',n)');
		   
		   for (i = 1; i <= maxArity;i++){
		       methBody.push('HStoreDot(l,'+eAnnNum+',m) :- HActualEverything('+em+',0,l,'+dumpNum+',G), HActualEverything('+em+','+i+',m,'+dumpNum+',G)');
		   }
	       }
	       else{
		   methBody.push('HActualArgCon(n,0,m,'+cn+') :- HActualEverything('+em+',0,l,'+dumpNum+',G),  HPtsTo(l,'+encodeField('length')+',m), HPtsTo(m,'+encodeField('toString')+',n)');
		   methBody.push('HCallerCon('+em+',n,'+cn+') :- HActualEverything('+em+',0,l,'+dumpNum+',G), HPtsTo(l,'+encodeField('length')+',m), HPtsTo(m,'+encodeField('toString')+',n)');
		   methBody.push('HActualArgCon(n,0,m,'+cn+') :- HActualEverything('+em+',0,l,'+dumpNum+',G), HPtsTo(l,'+encodeField('length')+',m), HPtsTo(m,'+encodeField('valueOf')+',n)');
		   methBody.push('HCallerCon('+em+',n,'+cn+') :- HActualEverything('+em+',0,l,'+dumpNum+',G), HPtsTo(l,'+encodeField('length')+',m), HPtsTo(m,'+encodeField('valueOf')+',n)');
		   
		   for (i = 1; i <= maxArity;i++){
		       methBody.push('HStoreDot(l,'+eAnnNum+',m) :- HActualEverything('+em+',0,l,'+dumpNum+',G), HActualEverything('+em+','+i+',m,'+dumpNum+',G)');
		   }
		  
	       }

	      retConstraints = retConstraints.concat(nativeMethConstraints('ArrayProto',methName,astNum, methAstNum, methBody,flag,contextNum));
	      return retConstraints
	   }

	   function genArrayProtoJoin(astNum,methAstNum,methName,flag,contextNum){
	      var retConstraints = [];
	      var constraint;
	      var methBody = [];
	      var tempVar;
	      var tempAstNum;
	       var em = encodeLoc(methAstNum);
	       var cn = contextNum;
	       var eAnnNum = encodeField('$A$Num');

	      
	        // join(arg1)
	 // $1 = this.length; toPrimitive($1); toPrimitive(arg1); $2 = this[..]; toPrimitive($2);
	 
	        methBody = [];
	       if(!contextNum){
		   methBody.push('HActualArg(n,0,m) :- HActualArg('+em+',0,l), HCaller(G,'+em+'), HPtsTo(l,'+encodeField('length')+',m), HPtsTo(m,'+encodeField('toString')+',n)');
		   methBody.push('HCaller('+em+',n) :- HActualArg('+em+',0,l), HCaller(G,'+em+'), HPtsTo(l,'+encodeField('length')+',m), HPtsTo(m,'+encodeField('toString')+',n)');
		   methBody.push('HActualArg(n,0,m) :- HActualArg('+em+',0,l), HCaller(G,'+em+'), HPtsTo(l,'+encodeField('length')+',m), HPtsTo(m,'+encodeField('valueOf')+',n)');
		   methBody.push('HCaller('+em+',n) :- HActualArg('+em+',0,l), HCaller(G,'+em+'), HPtsTo(l,'+encodeField('length')+',m), HPtsTo(m,'+encodeField('valueOf')+',n)');
		   
		   methBody.push('HActualArg(n,0,l) :- HActualArg('+em+',1,l), HCaller(G,'+em+'),  HPtsTo(l,'+encodeField('toString')+',n)');
		   methBody.push('HCaller('+em+',n) :- HActualArg('+em+',1,l), HCaller(G,'+em+'),  HPtsTo(l,'+encodeField('toString')+',n)');
		   methBody.push('HActualArg(n,0,l) :- HActualArg('+em+',1,l), HCaller(G,'+em+'),  HPtsTo(l,'+encodeField('valueOf')+',n)');
		   methBody.push('HCaller('+em+',n) :- HActualArg('+em+',1,l), HCaller(G,'+em+'),  HPtsTo(l,'+encodeField('valueOf')+',n)');
		   
		   methBody.push('HActualArg(n,0,m) :- HActualArg('+em+',0,l), HCaller(G,'+em+'), HPtsTo(l,'+eAnnNum+',m), HPtsTo(m,'+encodeField('toString')+',n)');
		   methBody.push('HCaller('+em+',n) :- HActualArg('+em+',0,l), HCaller(G,'+em+'), HPtsTo(l,'+eAnnNum+',m), HPtsTo(m,'+encodeField('toString')+',n)');
		   methBody.push('HActualArg(n,0,m) :- HActualArg('+em+',0,l), HCaller(G,'+em+'), HPtsTo(l,'+eAnnNum+',m), HPtsTo(m,'+encodeField('valueOf')+',n)');
		   methBody.push('HCaller('+em+',n) :- HActualArg('+em+',0,l), HCaller(G,'+em+'), HPtsTo(l,'+eAnnNum+',m), HPtsTo(m,'+encodeField('valueOf')+',n)');
		   
		   
	       }
	       else{
		   methBody.push('HActualArgCon(n,0,m,'+cn+') :- HActualArg('+em+',0,l), HCaller(G,'+em+'), HPtsTo(l,'+encodeField('length')+',m), HPtsTo(m,'+encodeField('toString')+',n)');
		   methBody.push('HCallerCon('+em+',n,'+cn+') :- HActualArg('+em+',0,l), HCaller(G,'+em+'), HPtsTo(l,'+encodeField('length')+',m), HPtsTo(m,'+encodeField('toString')+',n)');
		   methBody.push('HActualArgCon(n,0,m,'+cn+') :- HActualArg('+em+',0,l), HCaller(G,'+em+'), HPtsTo(l,'+encodeField('length')+',m), HPtsTo(m,'+encodeField('valueOf')+',n)');
		   methBody.push('HCallerCon('+em+',n,'+cn+') :- HActualArg('+em+',0,l), HCaller(G,'+em+'), HPtsTo(l,'+encodeField('length')+',m), HPtsTo(m,'+encodeField('valueOf')+',n)');
		   
		   methBody.push('HActualArgCon(n,0,l,'+cn+') :- HActualArg('+em+',1,l), HCaller(G,'+em+'),  HPtsTo(l,'+encodeField('toString')+',n)');
		   methBody.push('HCallerCon('+em+',n,'+cn+') :- HActualArg('+em+',1,l), HCaller(G,'+em+'),  HPtsTo(l,'+encodeField('toString')+',n)');
		   methBody.push('HActualArgCon(n,0,l,'+cn+') :- HActualArg('+em+',1,l), HCaller(G,'+em+'),  HPtsTo(l,'+encodeField('valueOf')+',n)');
		   methBody.push('HCallerCon('+em+',n,'+cn+') :- HActualArg('+em+',1,l), HCaller(G,'+em+'),  HPtsTo(l,'+encodeField('valueOf')+',n)');
		   
		   methBody.push('HActualArgCon(n,0,m,'+cn+') :- HActualArg('+em+',0,l), HCaller(G,'+em+'), HPtsTo(l,'+eAnnNum+',m), HPtsTo(m,'+encodeField('toString')+',n)');
		   methBody.push('HCallerCon('+em+',n,'+cn+') :- HActualArg('+em+',0,l), HCaller(G,'+em+'), HPtsTo(l,'+eAnnNum+',m), HPtsTo(m,'+encodeField('toString')+',n)');
		   methBody.push('HActualArgCon(n,0,m,'+cn+') :- HActualArg('+em+',0,l), HCaller(G,'+em+'), HPtsTo(l,'+eAnnNum+',m), HPtsTo(m,'+encodeField('valueOf')+',n)');
		   methBody.push('HCallerCon('+em+',n,'+cn+') :- HActualArg('+em+',0,l), HCaller(G,'+em+'), HPtsTo(l,'+eAnnNum+',m), HPtsTo(m,'+encodeField('valueOf')+',n)');
	       }

	       retConstraints = retConstraints.concat(nativeMethConstraints('ArrayProto',methName,astNum, methAstNum, methBody,flag,contextNum));
	      return retConstraints
	   }

	  function genArrayProtoPop(astNum,methAstNum,methName,flag,contextNum){
	      var retConstraints = [];
	      var constraint;
	      var methBody = [];
	      var tempVar;
	      var tempAstNum;
	      var em = encodeLoc(methAstNum);
	      var cn = contextNum;
	      var eAnnNum = encodeField('$A$Num');

	      // pop()
	 // $1 = this.length; toPrimitive($1); $2 = this[..]; return $2;
	       
	        methBody = [];
	      if(!contextNum){
		   methBody.push('HActualArg(n,0,m) :- HActualArg('+em+',0,l), HCaller(G,'+em+'), HPtsTo(l,'+encodeField('length')+',m), HPtsTo(m,'+encodeField('toString')+',n)');
		   methBody.push('HCaller('+em+',n) :- HActualArg('+em+',0,l), HCaller(G,'+em+'), HPtsTo(l,'+encodeField('length')+',m), HPtsTo(m,'+encodeField('toString')+',n)');
		   methBody.push('HActualArg(n,0,m) :- HActualArg('+em+',0,l), HCaller(G,'+em+'), HPtsTo(l,'+encodeField('length')+',m), HPtsTo(m,'+encodeField('valueOf')+',n)');
		   methBody.push('HCaller('+em+',n) :- HActualArg('+em+',0,l), HCaller(G,'+em+'), HPtsTo(l,'+encodeField('length')+',m), HPtsTo(m,'+encodeField('valueOf')+',n)');
		  
		  methBody.push('VPtsTo(x,n) :-  HActualEverything('+em+',0,l,x,G), HPtsTo(l,'+eAnnNum+',n)');

	      }
	      else{
		  methBody.push('HActualArgCon(n,0,m,'+cn+') :- HActualArg('+em+',0,l), HCaller(G,'+em+'), HPtsTo(l,'+encodeField('length')+',m), HPtsTo(m,'+encodeField('toString')+',n)');
		   methBody.push('HCallerCon('+em+',n,'+cn+') :- HActualArg('+em+',0,l), HCaller(G,'+em+'), HPtsTo(l,'+encodeField('length')+',m), HPtsTo(m,'+encodeField('toString')+',n)');
		   methBody.push('HActualArgCon(n,0,m,'+cn+') :- HActualArg('+em+',0,l), HCaller(G,'+em+'), HPtsTo(l,'+encodeField('length')+',m), HPtsTo(m,'+encodeField('valueOf')+',n)');
		   methBody.push('HCallerCon('+em+',n,'+cn+') :- HActualArg('+em+',0,l), HCaller(G,'+em+'), HPtsTo(l,'+encodeField('length')+',m), HPtsTo(m,'+encodeField('valueOf')+',n)');
		  
		  methBody.push('VPtsTo(x,n) :-  HActualEverything('+em+',0,l,x,G), HPtsTo(l,'+eAnnNum+',n)');

		 
	      }
	       retConstraints = retConstraints.concat(nativeMethConstraints('ArrayProto',methName,astNum, methAstNum, methBody,flag,contextNum));
	       return retConstraints
	  }
	  
	  
	  function genArrayProtoReverse(astNum,methAstNum,methName,flag,contextNum){
	      var retConstraints = [];
	      var constraint;
	      var methBody = [];
	      var tempVar;
	      var tempAstNum;
	      var em = encodeLoc(methAstNum);
	      var cn = contextNum;
	      var eAnnNum = encodeField('$A$Num');
	      
	      	        
	 // reverse()
	 // $1 = this.length; toPrimitive($1); return this;
	      
	    
	      
	       if(!contextNum){
		   methBody.push('HActualArg(n,0,m) :- HActualArg('+em+',0,l), HCaller(G,'+em+'), HPtsTo(l,'+encodeField('length')+',m), HPtsTo(m,'+encodeField('toString')+',n)');
		   methBody.push('HCaller('+em+',n) :- HActualArg('+em+',0,l), HCaller(G,'+em+'), HPtsTo(l,'+encodeField('length')+',m), HPtsTo(m,'+encodeField('toString')+',n)');
		   methBody.push('HActualArg(n,0,m) :- HActualArg('+em+',0,l), HCaller(G,'+em+'), HPtsTo(l,'+encodeField('length')+',m), HPtsTo(m,'+encodeField('valueOf')+',n)');
		   methBody.push('HCaller('+em+',n) :- HActualArg('+em+',0,l), HCaller(G,'+em+'), HPtsTo(l,'+encodeField('length')+',m), HPtsTo(m,'+encodeField('valueOf')+',n)');
		  
		   methBody.push('VPtsTo(x,l) :-  HActualEverything('+em+',0,l,x,G)');

	      }
	      else{
		  methBody.push('HActualArgCon(n,0,m,'+cn+') :- HActualArg('+em+',0,l), HCaller(G,'+em+'), HPtsTo(l,'+encodeField('length')+',m), HPtsTo(m,'+encodeField('toString')+',n)');
		   methBody.push('HCallerCon('+em+',n,'+cn+') :- HActualArg('+em+',0,l), HCaller(G,'+em+'), HPtsTo(l,'+encodeField('length')+',m), HPtsTo(m,'+encodeField('toString')+',n)');
		   methBody.push('HActualArgCon(n,0,m,'+cn+') :- HActualArg('+em+',0,l), HCaller(G,'+em+'), HPtsTo(l,'+encodeField('length')+',m), HPtsTo(m,'+encodeField('valueOf')+',n)');
		   methBody.push('HCallerCon('+em+',n,'+cn+') :- HActualArg('+em+',0,l), HCaller(G,'+em+'), HPtsTo(l,'+encodeField('length')+',m), HPtsTo(m,'+encodeField('valueOf')+',n)');
		  
		   methBody.push('VPtsTo(x,l) :-  HActualEverything('+em+',0,l,x,G)');
		  
	      }	      
	      retConstraints = retConstraints.concat(nativeMethConstraints('ArrayProto',methName,astNum, methAstNum, methBody,flag,contextNum));
	      return retConstraints
	  }
	  
	  function genArrayProtoShift(astNum,methAstNum,methName,flag,contextNum){
	       var retConstraints = [];
	       var constraint;
	       var methBody = [];
	       var tempVar;
	       var tempAstNum;
	       var em = encodeLoc(methAstNum);
	       var cn = contextNum;
	       var eAnnNum = encodeField('$A$Num');
	       
	      
	 // shift()
	 // $1= this.length; toPrimitive($1); $2 = this[..]; return $2

	      methBody = [];
	      if(!contextNum){
		  methBody.push('HActualArg(n,0,m) :- HActualArg('+em+',0,l), HCaller(G,'+em+'), HPtsTo(l,'+encodeField('length')+',m), HPtsTo(m,'+encodeField('toString')+',n)');
		  methBody.push('HCaller('+em+',n) :- HActualArg('+em+',0,l), HCaller(G,'+em+'), HPtsTo(l,'+encodeField('length')+',m), HPtsTo(m,'+encodeField('toString')+',n)');
		  methBody.push('HActualArg(n,0,m) :- HActualArg('+em+',0,l), HCaller(G,'+em+'), HPtsTo(l,'+encodeField('length')+',m), HPtsTo(m,'+encodeField('valueOf')+',n)');
		  methBody.push('HCaller('+em+',n) :- HActualArg('+em+',0,l), HCaller(G,'+em+'), HPtsTo(l,'+encodeField('length')+',m), HPtsTo(m,'+encodeField('valueOf')+',n)');
		  
		  methBody.push('VPtsTo(x,n) :- HActualEverything('+em+',0,l,x,G), HPtsTo(l,'+eAnnNum+',n)');
		  
	      }
	      else{
		   methBody.push('HActualArgCon(n,0,m,'+cn+') :- HActualArg('+em+',0,l), HCaller(G,'+em+'), HPtsTo(l,'+encodeField('length')+',m), HPtsTo(m,'+encodeField('toString')+',n)');
		  methBody.push('HCallerCon('+em+',n,'+cn+') :- HActualArg('+em+',0,l), HCaller(G,'+em+'), HPtsTo(l,'+encodeField('length')+',m), HPtsTo(m,'+encodeField('toString')+',n)');
		  methBody.push('HActualArgCon(n,0,m,'+cn+') :- HActualArg('+em+',0,l), HCaller(G,'+em+'), HPtsTo(l,'+encodeField('length')+',m), HPtsTo(m,'+encodeField('valueOf')+',n)');
		  methBody.push('HCallerCon('+em+',n,'+cn+') :- HActualArg('+em+',0,l), HCaller(G,'+em+'), HPtsTo(l,'+encodeField('length')+',m), HPtsTo(m,'+encodeField('valueOf')+',n)');
		  
		  methBody.push('VPtsTo(x,n) :- HActualEverything('+em+',0,l,x,G), HPtsTo(l,'+eAnnNum+',n)');
	      }
	      
	      retConstraints = retConstraints.concat(nativeMethConstraints('ArrayProto',methName,astNum, methAstNum, methBody,flag,contextNum));
	      return retConstraints
	  }
	  
	  

	  function genArrayProtoConstraints(astNum,objProtoNum){
	      var retConstraints = [];
	      var constraint;
	      var astNum,num1,num2,num3 ;
	      var argNum;
	      var methAstNum,methAstNumClone;
	      var methBody;
	      var tempVar, tempVar1, tempVar2, tempVar3;
	      var i,j;
	      
	      constraint = "#begin ArrayPrototype";
	      retConstraints.push(constraint);
	      
	      retConstraints.push(makeConstraint('prototype',[astNum,objProtoNum]));
	   

	      // toString

	      methAstNum = getNextAstNumber();
	      encodeLoc(methAstNum);
	      methName = 'toString';
	      retConstraints = retConstraints.concat(genArrayProtoToString(astNum,methAstNum,methName));

	      //clones
	       if(cloneFlag){
		  for(j = 0 ; j < nClones; j++){
		      methAstNumClone = getNextAstNumber();
		      encodeLoc(methAstNumClone);
		      retConstraints.push(makeConstraint('clone',[methAstNum,j+1,methAstNumClone]));

		      methName = 'toStringClone' +(j+1);
		      retConstraints = retConstraints.concat(genArrayProtoToString(astNum,methAstNumClone,methName,1,j+1));
		  }
	       }
	      else{
		  retConstraints.push(relName('clone') +'(' +encodeLoc(methAstNum) + ',' + 'i' + ',' + encodeLoc(methAstNum) + ')');
	      }

	       
	      // concat
	      methAstNum = getNextAstNumber();
	      encodeLoc(methAstNum);
	      methName = 'concat';
	      retConstraints = retConstraints.concat(genArrayProtoConcat(astNum,methAstNum,methName));

	      //clones
	       if(cloneFlag){
		  for(j = 0 ; j < nClones; j++){
		      methAstNumClone = getNextAstNumber();
		      encodeLoc(methAstNumClone);
		      retConstraints.push(makeConstraint('clone',[methAstNum,j+1,methAstNumClone]));

		      methName = 'concatClone' +(j+1);
		      retConstraints = retConstraints.concat(genArrayProtoConcat(astNum,methAstNumClone,methName,1,j+1));
		  }
	       }
	      else{
		  retConstraints.push(relName('clone') +'(' +encodeLoc(methAstNum) + ',' + 'i' + ',' + encodeLoc(methAstNum) + ')');
	      }
   
	       // join

	      methAstNum = getNextAstNumber();
	      encodeLoc(methAstNum);
	      methName = 'join';
	      retConstraints = retConstraints.concat(genArrayProtoJoin(astNum,methAstNum,methName));

	      //clones
	       if(cloneFlag){
		  for(j = 0 ; j < nClones; j++){
		      methAstNumClone = getNextAstNumber();
		      encodeLoc(methAstNumClone);
		      retConstraints.push(makeConstraint('clone',[methAstNum,j+1,methAstNumClone]));

		      methName = 'joinClone' +(j+1);
		      retConstraints = retConstraints.concat(genArrayProtoJoin(astNum,methAstNumClone,methName,1,j+1));
		  }
	       }
	      else{
		  retConstraints.push(relName('clone') +'(' +encodeLoc(methAstNum) + ',' + 'i' + ',' + encodeLoc(methAstNum) + ')');
	      }

	        // push

	      methAstNum = getNextAstNumber();
	      encodeLoc(methAstNum);
	      methName = 'push';
	      retConstraints = retConstraints.concat(genArrayProtoPush(astNum,methAstNum,methName));

	      //clones
	       if(cloneFlag){
		  for(j = 0 ; j < nClones; j++){
		      methAstNumClone = getNextAstNumber();
		      encodeLoc(methAstNumClone);
		      retConstraints.push(makeConstraint('clone',[methAstNum,j+1,methAstNumClone]));

		      methName = 'pushClone' +(j+1);
		      retConstraints = retConstraints.concat(genArrayProtoPush(astNum,methAstNumClone,methName,1,j+1));
		  }
	       }
	      else{
		  retConstraints.push(relName('clone') +'(' +encodeLoc(methAstNum) + ',' + 'i' + ',' + encodeLoc(methAstNum) + ')');
	      }
	      
	        // pop

	      methAstNum = getNextAstNumber();
	      encodeLoc(methAstNum);
	      methName = 'pop';
	      retConstraints = retConstraints.concat(genArrayProtoPop(astNum,methAstNum,methName));

	      //clones
	       if(cloneFlag){
		  for(j = 0 ; j < nClones; j++){
		      methAstNumClone = getNextAstNumber();
		      encodeLoc(methAstNumClone);
		      retConstraints.push(makeConstraint('clone',[methAstNum,j+1,methAstNumClone]));

		      methName = 'popClone' +(j+1);
		      retConstraints = retConstraints.concat(genArrayProtoPop(astNum,methAstNumClone,methName,1,j+1));
		  }
	       }
	      else{
		  retConstraints.push(relName('clone') +'(' +encodeLoc(methAstNum) + ',' + 'i' + ',' + encodeLoc(methAstNum) + ')');
	      }

	      
	       // reverse

	      methAstNum = getNextAstNumber();
	      encodeLoc(methAstNum);
	      methName = 'reverse';
	      retConstraints = retConstraints.concat(genArrayProtoReverse(astNum,methAstNum,methName));

	      //clones
	       if(cloneFlag){
		  for(j = 0 ; j < nClones; j++){
		      methAstNumClone = getNextAstNumber();
		      encodeLoc(methAstNumClone);
		      retConstraints.push(makeConstraint('clone',[methAstNum,j+1,methAstNumClone]));

		      methName = 'reverseClone' +(j+1);
		      retConstraints = retConstraints.concat(genArrayProtoReverse(astNum,methAstNumClone,methName,1,j+1));
		  }
	       }
	      else{
		  retConstraints.push(relName('clone') +'(' +encodeLoc(methAstNum) + ',' + 'i' + ',' + encodeLoc(methAstNum) + ')');
	      }
	      
	       // shift

	      methAstNum = getNextAstNumber();
	      encodeLoc(methAstNum);
	      methName = 'shift';
	      retConstraints = retConstraints.concat(genArrayProtoShift(astNum,methAstNum,methName));

	      //clones
	       if(cloneFlag){
		  for(j = 0 ; j < nClones; j++){
		      methAstNumClone = getNextAstNumber();
		      encodeLoc(methAstNumClone);
		      retConstraints.push(makeConstraint('clone',[methAstNum,j+1,methAstNumClone]));

		      methName = 'shiftClone' +(j+1);
		      retConstraints = retConstraints.concat(genArrayProtoShift(astNum,methAstNumClone,methName,1,j+1));
		  }
	       }
	      else{
		  retConstraints.push(relName('clone') +'(' +encodeLoc(methAstNum) + ',' + 'i' + ',' + encodeLoc(methAstNum) + ')');
	      }


/*
*/

	 constraint = '#end ArrayPrototype';
	 retConstraints.push(constraint);

	 return retConstraints;
	  }
	    
     
     

     function genConstraints(){
	 var retConstraints = [];

	 var objProtoNum = getNextAstNumber();
	 astNumberMap[objProtoNum] = ['IdExpr',{name:'$Native_Object_Prototype'}];
	 encodeLoc(objProtoNum);
	 
	 if(freezeNativeFlag){
	     retConstraints.push(makeConstraint('frozenObjStrong',[objProtoNum]));
	 }
	 constraint = relName('prototype') + '(l,' + encodeLoc(objProtoNum) + ') :- ' + relName('objectType') + '(l)'; 
	 retConstraints.push(constraint);
	 
	 retConstraints = retConstraints.concat(genObjProtoConstraints(objProtoNum));
	 	

	 var functionProtoNum = getNextAstNumber();
	 astNumberMap[functionProtoNum] = ['IdExpr',{name:'$Native_Function_Prototype'}];
	 encodeLoc(functionProtoNum);

	 if(freezeNativeFlag){
	     retConstraints.push(makeConstraint('frozenObjStrong',[functionProtoNum]));
	 }
	 constraint = relName('prototype') + '(l,' + encodeLoc(functionProtoNum) + ') :- ' + relName('functionType') + '(l)'; 
	 retConstraints.push(constraint);
	 
	 retConstraints = retConstraints.concat(genFuncProtoConstraints(functionProtoNum,objProtoNum));

	 
	 var arrayProtoNum = getNextAstNumber();
	 astNumberMap[arrayProtoNum] = ['IdExpr',{name:'$Native_Array_Prototype'}];
	 encodeLoc(arrayProtoNum);

	 if(freezeNativeFlag){
	     retConstraints.push(makeConstraint('frozenObjStrong',[arrayProtoNum]));
	 }
	 constraint = relName('prototype') + '(l,' + encodeLoc(arrayProtoNum) + ') :- ' + relName('arrayType') + '(l)'; 
	 retConstraints.push(constraint);
	 
	 retConstraints = retConstraints.concat(genArrayProtoConstraints(arrayProtoNum,objProtoNum));	 
	 

	 var objNum = getNextAstNumber();
	 astNumberMap[objNum] = ['IdExpr',{name:'$Native_Object'}];
	 
	 if(freezeNativeFlag){
	     retConstraints.push(makeConstraint('frozenObjStrong',[objNum]));
	 }
	 retConstraints.push(makeConstraint('prototype',[objNum,functionProtoNum]));
	 retConstraints.push(makeConstraint('hPtsTo',[objNum,'prototype',objProtoNum]));
	 retConstraints.push(makeConstraint('newFunctionObj',['Object_0_1',objNum]));

	 var functionNum = getNextAstNumber();
	 astNumberMap[functionNum] = ['IdExpr',{name:'$Native_Function'}];
	 
	 if(freezeNativeFlag){
	     retConstraints.push(makeConstraint('frozenObjStrong',[functionNum]));
	 }
	 retConstraints.push(makeConstraint('prototype',[functionNum,functionProtoNum]));
	 retConstraints.push(makeConstraint('hPtsTo',[functionNum,'prototype',functionProtoNum]));
	 retConstraints.push(makeConstraint('newFunctionObj',['Function_0_1',functionNum]));

	 var arrayNum = getNextAstNumber();
	 astNumberMap[arrayNum] = ['IdExpr',{name:'$Native_Array'}];
	 
	 if(freezeNativeFlag){
	     retConstraints.push(makeConstraint('frozenObjStrong',[arrayNum]));
	 }
	 retConstraints.push(makeConstraint('prototype',[arrayNum,functionProtoNum]));
	 retConstraints.push(makeConstraint('hPtsTo',[arrayNum,'prototype',arrayProtoNum]));
	 retConstraints.push(makeConstraint('newFunctionObj',['Array_0_1',arrayNum]));

	 
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
     return renderConstraints(finalConstraints,0);
      }
