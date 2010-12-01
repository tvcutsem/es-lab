// Copyright (C) 2010 Google Inc.
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
    - Only the encoding for Concat has HActualEverythingCon in its premise (all others have HActualEverything). This is becuase only concat needs and makes
use of the context argument.
   
*/
      this.genNativeConstraints =  
    function genNativeConstraints(cloneFlag, freezeNativeFlag,  encodeVar, encodeField, encodeLoc, encodeCon, getNextTempVar, getNextAstNumber, astNumberMap, relName, makeConstraint,  functionClones, nClones, maxArity) {
	  
	var dumpNum = encodeVar('$$dump');

	var ruleDef = "";
	
	function genInverseRule(superhead, head,body){
	    
	    var i;
	    var result = "";
	    
	    result = superhead + ' :- ' + 'I' + head;
	    
	    for (i = 0 ; i < body.length; i++){
		result = result + ', ' + body[i];
	    }
	    result = result + '.\n' ;
	 
	    for (i = 0 ; i < body.length; i++){
		if(body[i][0] !== '!'){
		    result = result + 'I' + body[i] + ' :- ' + superhead + '.\n';
		}
	    }
	    result = result.slice(0,-2);
	    return result;
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
	
	/*  function toPrimitiveConstraints(varName,callerAstNum,contextNum){
	      
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
*/	  
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
	



	  function genObjProtoValueOf(astNum,methAstNum,methName,flag,contextNum){
	      var retConstraints = [];
	      var constraint;
	      var methBody = [];
	      var tempVar;
	      var tempAstNum;
	      var em = encodeLoc(methAstNum);
	      var cn = contextNum;

	     
	      methBody.push('VPtsTo(y,l) :- HActualEverything('+em+',1,l,y,G)');

	      ruleDef = ruleDef + 'ROPValueOf(y:V,l:L,G:L)\n';

	      methBody.push(genInverseRule('ROPValueOf(y,l,G)','VPtsTo(y,l)',['HActualEverything('+em+',1,l,y,G)']));

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
	    var cn1,cn2;
	    
	    methBody = [];
	    cn1 = encodeCon(getNextAstNumber());
	    
	    methBody.push('HActualEverythingCon(m,0,l,'+dumpNum+','+em+','+cn1+') :- HActualEverything('+em+',1,l,y,G), HPtsTo(l,'+encodeField('toString')+',m)');
	    cn2 = encodeCon(getNextAstNumber());

	    methBody.push('HActualEverythingCon(m,0,l,'+dumpNum+','+em+','+cn2+') :- HActualEverything('+em+',1,l,y,G), HPtsTo(l,'+encodeField('valueOf')+',m)');
    
	    ruleDef = ruleDef + 'ROPHOP1(y:V,l:L,m:L,G:L)\n';
	    
	    ruleDef = ruleDef + 'ROPHOP2(y:V,l:L,m:L,G:L)\n';
	    

	    methBody.push(genInverseRule('ROPHOP1(y,l,m,G)','HActualEverythingCon(m,0,l,'+dumpNum+','+em+','+cn1+')',[ 'HActualEverything('+em+',1,l,y,G)', 'HPtsTo(l,'+encodeField('toString')+',m)']));
	    
	    methBody.push(genInverseRule('ROPHOP2(y,l,m,G)','HActualEverythingCon(m,0,l,'+dumpNum+','+em+','+cn2+')',['HActualEverything('+em+',1,l,y,G)', 'HPtsTo(l,'+encodeField('valueOf')+',m)']));
	


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
	    var cn1,cn2;

	      
	    methBody = [];
	    cn1 = encodeCon(getNextAstNumber());
	    
	    methBody.push('HActualEverythingCon(m,0,l,'+dumpNum+','+em+','+cn1+') :- HActualEverything('+em+',1,l,y,G), HPtsTo(l,'+encodeField('toString')+',m)');
	    cn2 = encodeCon(getNextAstNumber());

	    methBody.push('HActualEverythingCon(m,0,l,'+dumpNum+','+em+','+cn2+') :- HActualEverything('+em+',1,l,y,G), HPtsTo(l,'+encodeField('valueOf')+',m)');
	    

	    ruleDef = ruleDef + 'ROPPIE1(y:V,l:L,m:L,G:L) \n';

	    
	     ruleDef = ruleDef +'ROPPIE2(y:V,l:L,m:L,G:L)\n';


	    methBody.push(genInverseRule('ROPPIE1(y,l,m,G)','HActualEverythingCon(m,0,l,'+dumpNum+','+em+','+cn1+')',['HActualEverything('+em+',1,l,y,G)', 'HPtsTo(l,'+encodeField('toString')+',m)']));

	    methBody.push(genInverseRule('ROPPIE2(y,l,m,G)','HActualEverythingCon(m,0,l,'+dumpNum+','+em+','+cn2+')',['HActualEverything('+em+',1,l,y,G)', 'HPtsTo(l,'+encodeField('valueOf')+',m)']));




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
	      // methBody.push(makeConstraint('formalArg',[methAstNum,1,'arg_ObjProto_'+methName+'1']));
	       
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
	      retConstraints = retConstraints.concat(genObjProtoToString(astNum,methAstNum,methName,0,1));

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

	    

	      // valueOf
	      methAstNum = getNextAstNumber();
	      encodeLoc(methAstNum);
	      methName = 'valueOf';
	      retConstraints = retConstraints.concat(genObjProtoValueOf(astNum,methAstNum,methName,0,1));

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
	      retConstraints = retConstraints.concat(genObjProtoHasOwnProperty(astNum,methAstNum,methName,0,1));

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
	      retConstraints = retConstraints.concat(genObjProtoPropertyIsEnumerable(astNum,methAstNum,methName,0,1));

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
	      retConstraints = retConstraints.concat(genObjProtoIsPrototypeOf(astNum,methAstNum,methName,0,1));


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
	      var cn1;
	       
	      // call(arg1,...,argn) - imprecise as we are considering arity <= maxArity+1
	      // $ =  this.call(arg1,...,argn); return $.
	    
	      methBody = [];	      
	      
	      cn1 = encodeCon(getNextAstNumber());

	     
	      for(i = 0; i <= maxArity ;i++){
		  methBody.push('HActualEverythingCon(arg'+0+','+i+',arg'+ (i+1)+',x,'+em+','+cn1+') :- HActualEverything('+em+',0,arg' + 0+',x,G), HActualEverything('+em+','+(i+1)+',arg' + (i+1)+',x,G)');
	      }
		// Inverse Rules
	      for(i = 0; i <= maxArity ;i++){
		  ruleDef = ruleDef + 'RFPCall'+i+'(arg'+0+':L,arg'+(i+1)+':L,x:V,G:L)\n';
		  methBody.push(genInverseRule('RFPCall'+i+'(arg'+0+',arg'+(i+1)+',x,G)','HActualEverythingCon(arg'+0+','+i+',arg'+ (i+1)+',x,'+em+','+cn1+')', ['HActualEverything('+em+',0,arg' + 0+',x,G)', 'HActualEverything('+em+','+(i+1)+',arg' + (i+1)+',x,G)']));
	      }


	       retConstraints = retConstraints.concat(nativeMethConstraints('FuncProto',methName,astNum, methAstNum, methBody,flag,contextNum));
	       return retConstraints
	  }
	  
	function genFuncProtoApply(astNum,methAstNum,methName,flag,contextNum){
	    // console.log(contextNum);
	    var retConstraints = [];
	    var constraint;
	    var methBody = [];
	    var tempVar;
	    var tempAstNum;
	    var em = encodeLoc(methAstNum);
	    var cn1;
	    var i;
	       
	    
	    // apply(arg1,arg2)
	    // $1 = arg2[..]; $2 = this.call(arg1,$,...,$); return $2.
	    
	    cn1 = encodeCon(getNextAstNumber());
	    
	    methBody = [];
	    
	    methBody.push('HActualEverythingCon(arg0,'+0+',arg1,x,'+em+','+cn1+') :- HActualEverything('+em+','+0+',arg0,x,G), HActualEverything('+em+','+1+',arg1,x,G)');   
	    for(i = 1; i <= maxArity ;i++){
		  methBody.push('HActualEverythingCon(arg0,'+i+',l,x,'+em+','+cn1+') :- HActualEverything('+em+','+0+',arg0,x,G), HActualEverything('+em+','+2+',arg2,x,G), HPtsTo(arg2,'+encodeField('$A$Num')+',l)');     	
	      }
	    // Inverse Rules

	    ruleDef = ruleDef + 'RFPApply0(arg0:L,arg1:L,x:V,G:L)\n';
	    
	    methBody.push(genInverseRule('RFPApply0(arg'+0+',arg'+1+',x,G)','HActualEverythingCon(arg0,'+0+',arg1,x,'+em+','+cn1+')', ['HActualEverything('+em+','+0+',arg0,x,G)', 'HActualEverything('+em+','+1+',arg1,x,G)']));   
	      for(i = 1; i <= maxArity ;i++){
		  ruleDef = ruleDef + 'RFPApply'+i+'(arg'+0+':L,arg'+2+':L,x:V,l:L,G:L)\n';
		  methBody.push(genInverseRule('RFPApply'+i+'(arg'+0+',arg'+2+',x,l,G)','HActualEverythingCon(arg0,'+i+',l,x,'+em+','+cn1+')', ['HActualEverything('+em+','+0+',arg0,x,G)', 'HActualEverything('+em+','+2+',arg2,x,G)', 'HPtsTo(arg2,'+encodeField('$A$Num')+',l)']));     	
	      }

	    retConstraints = retConstraints.concat(nativeMethConstraints('FuncProto',methName,astNum, methAstNum, methBody,flag,contextNum));
	    return retConstraints
	}
	
	
	function genFuncProtoBind(astNum,methAstNum,methName,flag,contextNum){
	    // console.log(contextNum);
	    var retConstraints = [];
	    var constraint;
	    var methBody = [];
	    var tempVar;
	    var tempAstNum;
	    var em = encodeLoc(methAstNum);
	    var cn1;
	    var i;

	    methBody = [];
	    
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
	      retConstraints = retConstraints.concat(genFuncProtoToString(astNum,methAstNum,methName,0,1));

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
	      retConstraints = retConstraints.concat(genFuncProtoCall(astNum,methAstNum,methName,0,1));

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
	      retConstraints = retConstraints.concat(genFuncProtoApply(astNum,methAstNum,methName,0,1));

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
	     //bind
	       methAstNum = getNextAstNumber();
	      encodeLoc(methAstNum);
	      methName = 'bind';
	      retConstraints = retConstraints.concat(genFuncProtoBind(astNum,methAstNum,methName,0,1));

	      
	       //clones
	       if(cloneFlag){
		  for(j = 0 ; j < nClones; j++){
		      methAstNumClone = getNextAstNumber();
		      encodeLoc(methAstNumClone);
		     retConstraints.push(makeConstraint('clone',[methAstNum,j+1,methAstNumClone]));

		      methName = 'bindClone' +(j+1);
		     retConstraints = retConstraints.concat(genFuncProtoBind(astNum,methAstNumClone,methName,1,j+1));
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
	      var cn1;
	       


	      methBody = [];
	    
	      cn1 = encodeCon(getNextAstNumber());

	      methBody.push('HActualEverythingCon(m,0,l,x,'+em+','+cn1+') :- HActualEverything('+em+',0,l,x,G), HPtsTo(l,'+encodeField('join')+',m)');
                
	      ruleDef = ruleDef + 'RAPToString1(x:V,l:L,m:L,G:L)\n';
	      
	      ruleDef = ruleDef + 'RAPToString2(x:V,l:L,m:L,G:L)\n';

	      methBody.push(genInverseRule('RAPToString1(x,l,m,G)','HActualEverythingCon(m,0,l,x,'+em+','+cn1+')', ['HActualEverything('+em+',0,l,x,G)', 'HPtsTo(l,'+encodeField('join')+',m)']));
                
	      methBody.push(genInverseRule('RAPToString2(x,l,m,G)','HActualEverythingCon(m,0,l,x,'+em+','+cn1+')',['HActualEverything('+em+',0,l,x,G)', 'HPtsTo(l,'+encodeField('join')+',m)']));


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
	    
	    
	    num1 = getNextAstNumber();
	    astNumberMap[num1] = ['IdExpr',{name:methName+'Clone_'+cn+'_retVal'}];
	    methBody.push(makeConstraint('arrayType',[num1]));
	    num1Enc = encodeLoc(num1);
	    
	    for(i = 1; i<= maxArity;i++){
		methBody.push('HStoreDot(k,'+eAnnNum+',m) :- HActualEverythingCon('+em+','+i+',m,x,G,k)');
		methBody.push('HStoreDot(k,'+eAnnNum+',m) :- HActualEverythingCon('+em+','+i+',l,x,G,k),  HPtsTo(l,'+eAnnNum+',m)');
	    }
	    		// Inverse Rules

	    ruleDef = ruleDef + 'RAPConcat1(x:V,m:L,G:L,k:L)\n';
	    methBody.push(genInverseRule('RAPConcat1(x,m,G,k)','VPtsTo(x,k)',['HActualEverythingCon('+em+','+i+',m,x,G,k)']));

	    for(i = 1; i<= maxArity;i++){
		ruleDef = ruleDef + 'RAPConcat'+i+'1(x:V,m:L,G:L,k:L)\n';
		ruleDef = ruleDef + 'RAPConcat'+i+'2(x:V,m:L,G:L,k:L)\n';
		methBody.push(genInverseRule('RAPConcat'+i+'1(x,m,G,k)','HStoreDot(k,'+eAnnNum+',m)', ['HActualEverythingCon('+em+','+i+',m,x,G,k)']));
		methBody.push(genInverseRule('RAPConcat'+i+'2(x,m,G,k)','HStoreDot(k,'+eAnnNum+',m)', ['HActualEverythingCon('+em+','+i+',l,x,G,k)',  'HPtsTo(l,'+eAnnNum+',m)']));
	    }
	    
	    ruleDef = ruleDef + 'RAPConcat'+i+'(x:V,m:L,G:L,k:L)\n';
	    methBody.push(genInverseRule('RAPConcat'+i+'(x,m,G,k)','VPtsTo(x,k)',['HActualEverythingCon('+em+','+i+',m,x,G,k)']));
	    
	    
	   
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
	       var cn1,cn2;
	       var eAnnNum = encodeField('$A$Num');

	       

	       // push(arg1,...,argn)
	 // $1 = this.length; toPrimitive($1); FORALL i: (this[..] = argi);
	 
	       methBody = [];

	       cn1 = encodeCon(getNextAstNumber());

	       methBody.push('HActualEverythingCon(n,0,m,'+dumpNum+','+em+','+cn1+') :- HActualEverything('+em+',0,l,x,G),  HPtsTo(l,'+encodeField('length')+',m), HPtsTo(m,'+encodeField('toString')+',n)');
	       cn2 = encodeCon(getNextAstNumber());

	       methBody.push('HActualEverythingCon(n,0,m,'+dumpNum+','+em+','+cn2+') :- HActualEverything('+em+',0,l,x,G),  HPtsTo(l,'+encodeField('length')+',m), HPtsTo(m,'+encodeField('valueOf')+',n)');

	       for (i = 1; i <= maxArity;i++){
		       methBody.push('HStoreDot(l,'+eAnnNum+',m) :- HActualEverything('+em+',0,l,x,G), HActualEverything('+em+','+i+',m,x,G)');
	       }
		  
		// Inverse Rules

	       ruleDef = ruleDef + 'RAPPush1(x:V,l:L,m:L,n:L,G:L)\n' ;

	       ruleDef = ruleDef + 'RAPPush2(x:V,l:L,m:L,n:L,G:L)\n' ;

	       methBody.push(genInverseRule('RAPPush1(x,l,m,n,G)','HActualEverythingCon(n,0,m,'+dumpNum+','+em+','+cn1+')',['HActualEverything('+em+',0,l,x,G)', 'HPtsTo(l,'+encodeField('length')+',m)', 'HPtsTo(m,'+encodeField('toString')+',n)']));

	       methBody.push(genInverseRule('RAPPush2(x,l,m,n,G)','HActualEverythingCon(n,0,m,'+dumpNum+','+em+','+cn2+')',['HActualEverything('+em+',0,l,x,G)',  'HPtsTo(l,'+encodeField('length')+',m)', 'HPtsTo(m,'+encodeField('valueOf')+',n)']));

	       for (i = 1; i <= maxArity;i++){
		   ruleDef = ruleDef + 'RAPPush3'+i+'(x:V,l:L,m:L,G:L)\n' ;

		   methBody.push(genInverseRule('RAPPush3'+i+'(x,l,m,G)','HStoreDot(l,'+eAnnNum+',m)', ['HActualEverything('+em+',0,l,x,G)', 'HActualEverything('+em+','+i+',m,x,G)']));
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
	       var cn1,cn2,cn3,cn4,cn5,cn6;
	       var eAnnNum = encodeField('$A$Num');

	      
	        // join(arg1)
	 // $1 = this.length; toPrimitive($1); toPrimitive(arg1); $2 = this[..]; toPrimitive($2);

	        methBody = [];
	       	    cn1 = encodeCon(getNextAstNumber());

	       methBody.push('HActualEverythingCon(n,0,m,'+dumpNum+','+em+','+cn1+') :- HActualEverything('+em+',0,l,x,G),  HPtsTo(l,'+encodeField('length')+',m), HPtsTo(m,'+encodeField('toString')+',n)');
	       	    cn2 = encodeCon(getNextAstNumber());

	       methBody.push('HActualEverythingCon(n,0,m,'+dumpNum+','+em+','+cn2+') :- HActualEverything('+em+',0,l,x,G),  HPtsTo(l,'+encodeField('length')+',m), HPtsTo(m,'+encodeField('valueOf')+',n)');
	       	    cn3 = encodeCon(getNextAstNumber());

	       methBody.push('HActualEverythingCon(n,0,l,'+dumpNum+','+em+','+cn3+') :- HActualEverything('+em+',0,l,x,G),  HPtsTo(m,'+encodeField('toString')+',n)');
	       	    cn4 = encodeCon(getNextAstNumber());

	       methBody.push('HActualEverythingCon(n,0,l,'+dumpNum+','+em+','+cn4+') :- HActualEverything('+em+',0,l,x,G),  HPtsTo(m,'+encodeField('valueOf')+',n)');
	       	    cn5 = encodeCon(getNextAstNumber());

	       methBody.push('HActualEverythingCon(n,0,m,'+dumpNum+','+em+','+cn5+') :- HActualEverything('+em+',0,l,x,G),  HPtsTo(l,'+eAnnNum+',m), HPtsTo(m,'+encodeField('toString')+',n)');
	       	    cn6 = encodeCon(getNextAstNumber());

	       methBody.push('HActualEverythingCon(n,0,m,'+dumpNum+','+em+','+cn6+') :- HActualEverything('+em+',0,l,x,G),  HPtsTo(l,'+eAnnNum+',m), HPtsTo(m,'+encodeField('valueOf')+',n)');
	      
	       		// Inverse Rules

	       ruleDef  = ruleDef + 'RAPJoin1(x:V,l:L,m:L,n:L,G:L) \n';
	       ruleDef  = ruleDef + 'RAPJoin2(x:V,l:L,m:L,n:L,G:L) \n';
	       ruleDef  = ruleDef + 'RAPJoin3(x:V,l:L,m:L,n:L,G:L) \n';
	       ruleDef  = ruleDef + 'RAPJoin4(x:V,l:L,m:L,n:L,G:L) \n';
	       ruleDef  = ruleDef + 'RAPJoin5(x:V,l:L,m:L,n:L,G:L) \n';
	       ruleDef  = ruleDef + 'RAPJoin6(x:V,l:L,m:L,n:L,G:L) \n';


	       methBody.push(genInverseRule('RAPJoin1(x,l,m,n,G)','HActualEverythingCon(n,0,m,'+dumpNum+','+em+','+cn1+')', ['HActualEverything('+em+',0,l,x,G)',  'HPtsTo(l,'+encodeField('length')+',m)', 'HPtsTo(m,'+encodeField('toString')+',n)']));
			    
	       methBody.push(genInverseRule('RAPJoin2(x,l,m,n,G)','HActualEverythingCon(n,0,m,'+dumpNum+','+em+','+cn2+')', ['HActualEverything('+em+',0,l,x,G)',  'HPtsTo(l,'+encodeField('length')+',m)', 'HPtsTo(m,'+encodeField('valueOf')+',n)']));
	      
	       methBody.push(genInverseRule('RAPJoin3(x,l,m,n,G)','HActualEverythingCon(n,0,l,'+dumpNum+','+em+','+cn3+')', ['HActualEverything('+em+',0,l,x,G)',  'HPtsTo(m,'+encodeField('toString')+',n)']));
	
	       methBody.push(genInverseRule('RAPJoin4(x,l,m,n,G)','HActualEverythingCon(n,0,l,'+dumpNum+','+em+','+cn4+')', ['HActualEverything('+em+',0,l,x,G)',  'HPtsTo(m,'+encodeField('valueOf')+',n)']));
	
	       methBody.push(genInverseRule('RAPJoin5(x,l,m,n,G)','HActualEverythingCon(n,0,m,'+dumpNum+','+em+','+cn5+')', ['HActualEverything('+em+',0,l,x,G)',  'HPtsTo(l,'+eAnnNum+',m)', 'HPtsTo(m,'+encodeField('toString')+',n)']));

	       methBody.push(genInverseRule('RAPJoin6(x,l,m,n,G)','HActualEverythingCon(n,0,m,'+dumpNum+','+em+','+cn6+')', ['HActualEverything('+em+',0,l,x,G)',  'HPtsTo(l,'+eAnnNum+',m)', 'HPtsTo(m,'+encodeField('valueOf')+',n)']));
	      
	       
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
	      var cn1,cn2;
	      var eAnnNum = encodeField('$A$Num');

	      // pop()
	 // $1 = this.length; toPrimitive($1); $2 = this[..]; return $2;
	      
	      methBody = [];
	      	       	    cn1 = encodeCon(getNextAstNumber());
	      
	      methBody.push('HActualEverythingCon(n,0,m,'+dumpNum+','+em+','+cn1+') :- HActualEverything('+em+',0,l,x,G),  HPtsTo(l,'+encodeField('length')+',m), HPtsTo(m,'+encodeField('toString')+',n)');
	      	       	    cn2 = encodeCon(getNextAstNumber());

	      methBody.push('HActualEverythingCon(n,0,m,'+dumpNum+','+em+','+cn2+') :- HActualEverything('+em+',0,l,x,G),  HPtsTo(l,'+encodeField('length')+',m), HPtsTo(m,'+encodeField('valueOf')+',n)');
	       
	      methBody.push('VPtsTo(x,n) :-  HActualEverything('+em+',0,l,x,G), HPtsTo(l,'+eAnnNum+',n)');

	      		// Inverse Rules

	      ruleDef = ruleDef + 'RAPPop1(x:V,l:L,n:L,m:L,G:L) \n';
	      ruleDef = ruleDef + 'RAPPop2(x:V,l:L,n:L,m:L,G:L) \n';
	      ruleDef = ruleDef + 'RAPPop3(x:V,l:L,n:L,G:L) \n';

	      methBody.push(genInverseRule('RAPPop1(x,l,m,n,G)','HActualEverythingCon(n,0,m,'+dumpNum+','+em+','+cn1+')', ['HActualEverything('+em+',0,l,x,G)',  'HPtsTo(l,'+encodeField('length')+',m)', 'HPtsTo(m,'+encodeField('toString')+',n)']));
					    
	      methBody.push(genInverseRule('RAPPop2(x,l,m,n,G)','HActualEverythingCon(n,0,m,'+dumpNum+','+em+','+cn2+')', ['HActualEverything('+em+',0,l,x,G)',  'HPtsTo(l,'+encodeField('length')+',m)', 'HPtsTo(m,'+encodeField('valueOf')+',n)']));
			    
	      methBody.push(genInverseRule('RAPPop3(x,l,n,G)','VPtsTo(x,n)',  ['HActualEverything('+em+',0,l,x,G)', 'HPtsTo(l,'+eAnnNum+',n)']));

		 
	      
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
	      var cn1,cn2 ;
	      var eAnnNum = encodeField('$A$Num');
	      
	      	        
	 // reverse()
	 // $1 = this.length; toPrimitive($1); return this;
	      
	      methBody = [];
	      	       	    cn1 = encodeCon(getNextAstNumber());

	      methBody.push('HActualEverythingCon(n,0,m,'+dumpNum+','+em+','+cn1+') :- HActualEverything('+em+',0,l,x,G),  HPtsTo(l,'+encodeField('length')+',m), HPtsTo(m,'+encodeField('toString')+',n)');
	      	       	    cn2 = encodeCon(getNextAstNumber());

	      methBody.push('HActualEverythingCon(n,0,m,'+dumpNum+','+em+','+cn2+') :- HActualEverything('+em+',0,l,x,G),  HPtsTo(l,'+encodeField('length')+',m), HPtsTo(m,'+encodeField('valueOf')+',n)');
	        
	      methBody.push('VPtsTo(x,l) :-  HActualEverything('+em+',0,l,x,G)');
		  
		// Inverse Rules

	      ruleDef = ruleDef + 'RAPReverse1(x:V,l:L,n:L,m:L,G:L) \n';
	      ruleDef = ruleDef + 'RAPReverse2(x:V,l:L,n:L,m:L,G:L) \n';
	      ruleDef = ruleDef + 'RAPReverse3(x:V,l:L,G:L) \n';

	      methBody.push(genInverseRule('RAPReverse1(x,l,m,n,G)','HActualEverythingCon(n,0,m,'+dumpNum+','+em+','+cn1+')',['HActualEverything('+em+',0,l,x,G)','HPtsTo(l,'+encodeField('length')+',m)', 'HPtsTo(m,'+encodeField('toString')+',n)']));

	      methBody.push(genInverseRule('RAPReverse2(x,l,m,n,G)','HActualEverythingCon(n,0,m,'+dumpNum+','+em+','+cn2+')',['HActualEverything('+em+',0,l,x,G)','HPtsTo(l,'+encodeField('length')+',m)', 'HPtsTo(m,'+encodeField('valueOf')+',n)']));
	      
	      methBody.push(genInverseRule('RAPReverse3(x,l,G)','VPtsTo(x,l)',['HActualEverything('+em+',0,l,x,G)']));
	      
	      
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
	    var cn1,cn2;
	    var eAnnNum = encodeField('$A$Num');
	    
	    
	    // shift()
	    // $1= this.length; toPrimitive($1); $2 = this[..]; return $2
	    
	    methBody = [];
	    cn1 = encodeCon(getNextAstNumber());
	    
	    methBody.push('HActualEverythingCon(n,0,m,'+dumpNum+','+em+','+cn1+') :- HActualEverything('+em+',0,l,x,G),  HPtsTo(l,'+encodeField('length')+',m), HPtsTo(m,'+encodeField('toString')+',n)');
	    cn2 = encodeCon(getNextAstNumber());
	    
	    methBody.push('HActualEverythingCon(n,0,m,'+dumpNum+','+em+','+cn2+') :- HActualEverything('+em+',0,l,x,G),  HPtsTo(l,'+encodeField('length')+',m), HPtsTo(m,'+encodeField('valueOf')+',n)');
	      
	    methBody.push('VPtsTo(x,n) :-  HActualEverything('+em+',0,l,x,G), HPtsTo(l,'+eAnnNum+',n)');
	    
		// Inverse Rules

	    ruleDef = ruleDef + 'RAPShift1(x:V,l:L,n:L,m:L,G:L) \n';
	    ruleDef = ruleDef + 'RAPShift2(x:V,l:L,n:L,m:L,G:L) \n';
	    ruleDef = ruleDef + 'RAPShift3(x:V,l:L,n:L,G:L) \n';
	    
	    methBody.push(genInverseRule('RAPShift1(x,l,m,n,G)','HActualEverythingCon(n,0,m,'+dumpNum+','+em+','+cn1+')',['HActualEverything('+em+',0,l,x,G)','HPtsTo(l,'+encodeField('length')+',m)', 'HPtsTo(m,'+encodeField('toString')+',n)']));
	    
	    methBody.push(genInverseRule('RAPShift2(x,l,m,n,G)','HActualEverythingCon(n,0,m,'+dumpNum+','+em+','+cn2+')',['HActualEverything('+em+',0,l,x,G)', 'HPtsTo(l,'+encodeField('length')+',m)', 'HPtsTo(m,'+encodeField('valueOf')+',n)']));
	    
	    methBody.push(genInverseRule('RAPShift3(x,l,n,G)','VPtsTo(x,n)',['HActualEverything('+em+',0,l,x,G)', 'HPtsTo(l,'+eAnnNum+',n)']));
	    
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
	    retConstraints = retConstraints.concat(genArrayProtoToString(astNum,methAstNum,methName,0,1));
	    
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
	      retConstraints = retConstraints.concat(genArrayProtoConcat(astNum,methAstNum,methName,0,1));

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
	      retConstraints = retConstraints.concat(genArrayProtoJoin(astNum,methAstNum,methName,0,1));

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
	      retConstraints = retConstraints.concat(genArrayProtoPush(astNum,methAstNum,methName,0,1));

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
	      retConstraints = retConstraints.concat(genArrayProtoPop(astNum,methAstNum,methName,0,1));

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
	      retConstraints = retConstraints.concat(genArrayProtoReverse(astNum,methAstNum,methName,0,1));

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
	      retConstraints = retConstraints.concat(genArrayProtoShift(astNum,methAstNum,methName,0,1));

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
	 var undefinedNum = getNextAstNumber();
	 astNumberMap[undefinedNum] = ['LiteralExpr',{value: 'undefined'}];
	 retConstraints.push(makeConstraint('vPtsTo',['undefined_0_1',undefinedNum]));
	 var objProtoNum = getNextAstNumber();
	 astNumberMap[objProtoNum] = ['IdExpr',{name:'$Native_Object_Prototype'}];
	 encodeLoc(objProtoNum);
	 
	 if(freezeNativeFlag){
	     retConstraints.push(makeConstraint('frozenObjStrong',[objProtoNum]));
	 }
	 constraint = 'Prototype(l,' + encodeLoc(objProtoNum) + ') :-  ObjectType(l)'; 
	 retConstraints.push(constraint);
	 ruleDef = ruleDef  + 'RObjectProto(l:L)\n';
	 constraint = 'RObjectProto(l) :- IPrototype(l,' + encodeLoc(objProtoNum) + '),  ObjectType(l)'; 
	 retConstraints.push(constraint);
	 constraint = 'IObjectType(l) :- RObjectProto(l)';
	 retConstraints.push(constraint);
	 
	 
	 retConstraints = retConstraints.concat(genObjProtoConstraints(objProtoNum));
	 	

	 var functionProtoNum = getNextAstNumber();
	 astNumberMap[functionProtoNum] = ['IdExpr',{name:'$Native_Function_Prototype'}];
	 encodeLoc(functionProtoNum);

	 if(freezeNativeFlag){
	     retConstraints.push(makeConstraint('frozenObjStrong',[functionProtoNum]));
	 }
	 constraint = 'Prototype(l,' + encodeLoc(functionProtoNum) + ') :-  FunctionType(l)'; 
	 retConstraints.push(constraint);
	 ruleDef = ruleDef  + 'RFunctionProto(l:L)\n';
	 constraint = 'RFunctionProto(l) :- IPrototype(l,' + encodeLoc(functionProtoNum) + '),  FunctionType(l)'; 
	 retConstraints.push(constraint);
	 constraint = 'IFunctionType(l) :- RFunctionProto(l)';
	 retConstraints.push(constraint);
	 
	
	 retConstraints = retConstraints.concat(genFuncProtoConstraints(functionProtoNum,objProtoNum));

	 
	 var arrayProtoNum = getNextAstNumber();
	 astNumberMap[arrayProtoNum] = ['IdExpr',{name:'$Native_Array_Prototype'}];
	 encodeLoc(arrayProtoNum);

	 if(freezeNativeFlag){
	     retConstraints.push(makeConstraint('frozenObjStrong',[arrayProtoNum]));
	 }
	 constraint = 'Prototype(l,' + encodeLoc(arrayProtoNum) + ') :-  ArrayType(l)'; 
	 retConstraints.push(constraint);
	 ruleDef = ruleDef  + 'RArrayProto(l:L)\n';
	 constraint = 'RArrayProto(l) :- IPrototype(l,' + encodeLoc(arrayProtoNum) + '),  ArrayType(l)'; 
	 retConstraints.push(constraint);
	 constraint = 'IArrayType(l) :- RArrayProto(l)';
	 retConstraints.push(constraint);

	 retConstraints = retConstraints.concat(genArrayProtoConstraints(arrayProtoNum,objProtoNum));	 
	 

	 var objNum = getNextAstNumber();
	 astNumberMap[objNum] = ['IdExpr',{name:'$Native_Object'}];
	 astNumberMap[objNum].isNative = 1;
	 if(freezeNativeFlag){
	     retConstraints.push(makeConstraint('frozenObjStrong',[objNum]));
	 }
	 retConstraints.push(makeConstraint('prototype',[objNum,functionProtoNum]));
	 retConstraints.push(makeConstraint('hPtsTo',[objNum,'prototype',objProtoNum]));
	 retConstraints.push(makeConstraint('newFunctionObj',['Object_0_1',objNum]));

	 var functionNum = getNextAstNumber();
	 astNumberMap[functionNum] = ['IdExpr',{name:'$Native_Function'}];
	 astNumberMap[objNum].isNative = 1;
	 

	 if(freezeNativeFlag){
	     retConstraints.push(makeConstraint('frozenObjStrong',[functionNum]));
	 }
	 retConstraints.push(makeConstraint('prototype',[functionNum,functionProtoNum]));
	 retConstraints.push(makeConstraint('hPtsTo',[functionNum,'prototype',functionProtoNum]));
	 retConstraints.push(makeConstraint('newFunctionObj',['Function_0_1',functionNum]));

	 var arrayNum = getNextAstNumber();
	 astNumberMap[arrayNum] = ['IdExpr',{name:'$Native_Array'}];
	 astNumberMap[objNum].isNative = 1;

	 
	 if(freezeNativeFlag){
	     retConstraints.push(makeConstraint('frozenObjStrong',[arrayNum]));
	 }
	 retConstraints.push(makeConstraint('prototype',[arrayNum,functionProtoNum]));
	 retConstraints.push(makeConstraint('hPtsTo',[arrayNum,'prototype',arrayProtoNum]));
	 retConstraints.push(makeConstraint('newFunctionObj',['Array_0_1',arrayNum]));

	 
	 retConstraints.push(makeConstraint('hPtsTo',[objProtoNum,'constructor',objNum]));
	 retConstraints.push(makeConstraint('hPtsTo',[functionProtoNum,'constructor',functionNum]));
	 retConstraints.push(makeConstraint('hPtsTo',[arrayProtoNum,'constructor',arrayNum]));
	 
	 

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
   return ruleDef + '\n' + renderConstraints(finalConstraints,0);
    }
