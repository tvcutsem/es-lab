
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
 * Generates initial datalog rules and relations
 * @Author
 Ankur Taly (ataly@stanford.edu)
 * @arguments
   -
 * @provides genDatalogRules
 * Assumes:
 */
 this.genDatalogRules = function genDatalogRules(encodeVar, encodeField, encodeLoc,encodeCon, getNextTempVar, getNextAstNumber, astNumberMap, relName, makeConstraint, functionClones, nClones, maxArity) {
 
     
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
     
  
     function genConstraints(){
	 var prototypeNum =  encodeField('prototype');

	// var annNum = encodeField('$A$Num');
	 
	// var annNative = encodeField('$A$Native');
	 
	// var annDom = encodeField('$A$Dom');
	 
	// var annAdsafeReject = encodeField('$A$AdsafeReject');
	 
	// var annRemaining = encodeField('$A$Remaining');
	 
	 var annAll = encodeField('$A$All');
	 
	 
	 
	var constraint = 

	  "### Relations \n" +
	 
	 "Assign(x:V,y:V) input \n" +
	 
	 "LoadDot(x:V,y:V,f:F) input \n" +
	 	 
//	 " StoreDotStrong(x:V,f:F,y:V) input \n" +

	 " StoreDot(x:V,f:F,y:V) input \n" +

	 " StoreDotWeak(x:V,f:F,y:V) input \n" +

//	 "HStoreDotStrong(l:L,f:V,y:L) input \n" +
	     
	 "HStoreDot(l:L,f:F,y:L) input \n" +
	 
//	 "HStoreDotWeak(l:L,f:F,y:L) input \n" +
	 
	 " ActualArg(f:V,i:I,x:V) input \n" +
	 
	 " ActualRet(f:V,y:V) input  \n" +
	     
	 " ActualArgArguments(f:V, l:L) input  \n" +
	     
	 "Caller(l:L,x:V) input \n" +
   
	 
	 " FThrow(l:L,x:V) input  \n" +
	 
	 " FormalArg(l:L, i:I, x:V) input \n" +
	 
	 " FormalArgArguments(G:L, x:V) input  \n" +
	 
	 
	  "FormalRet(l:L,x:V) input  \n" +
	 
	 " NewObj(x:V,l:L) input \n" +
	 
	 " NewFunctionObj(x:V, l:L) input \n" +
	 
	 " NewArrayObj(x:V, l:L) input \n" +
	 
	 " NewPrimObj(x:V, l:L) input \n" +

	 " Instance(x:V,l:L,y:V) input \n" +
	 
	  "CatchVar(l:L, x:V) input \n" +
	 
	 
	 " ActualArgCon(f:V,i:I,x:V,k:L) input \n" +
	 
	 " ActualRetCon(f:V,y:V,k:L) input  \n" +
	     
	 "CallerCon(l:L,x:V,k:L) input \n" +

	 " ActualArgArgumentsCon(f:V, l:L, k:L) input  \n" +
    
         " Clone(F:L,i:I,G:L) input \n" +
	     
	 " Dup(F:L) input \n" +
	     
 	 " Annotation(f:F,g:F) input \n" +
	     
	 " Complement(f:F,g:F) input \n" +
	     
	 " IsAnnotationTag(f:F) input \n" +
	     
	 " CallClonedIn(k:L) input \n" +

	 " ToGlobalVar(f:F,x:V) input \n" +

	 " ToGlobalField(x:V,f:F) input \n" +

 
	 " ### DERIVED RELATIONS \n" +
	 
	  "VPtsTo(x:V,l:L) output \n" +
	 
	 " HPtsTo(l:L,f:F,m:L) output \n" +
	 
	 " FPtsTo(f:V,l:L) output \n" +

	 " Prototype(l:L,m:L) output \n" +
	 
	  "HActualArg(l:L, i:I, m:L) output \n" +
	 
	 " HActualRet(l:L, y:V) output \n" +
	 
	  "HCaller(l:L,m:L) output \n" +
	     
	 " HActualEverything(l:L,i:I,m:L,x:V,G:L) output \n" +
	 
	 " HActualEverythingCon(l:L,i:I,m:L,x:V,G:L,k:L) output \n" +
	     
	 " FunctionType(l:L) output \n" +
	 
	 " ArrayType(l:L) output \n" +
	 
	 " ObjectType(l:L) output \n" +

	 " PrimType(l:L) output \n" +
	     
	 " FrozenObjStrong(F:L) output \n" +
	     
	 " FrozenObjWeak(F:L) output \n" +

	 " Precious(F:L) output \n" +

	 " CallClonedOut(k:L) outputtuples \n" + 




	 
	 " ### RULES \n" +
	 
	  "VPtsTo(x,l) :- NewObj(x,l).\n" +
	 
	  "VPtsTo(x,l) :- NewFunctionObj(x,l).\n" +
	 
	 " VPtsTo(x,l) :- NewArrayObj(x,l).\n" +
	 
	 " VPtsTo(x,l) :- NewPrimObj(x,l).\n" +
	 
	 " FunctionType(l) :- NewFunctionObj(x,l).\n" +

	 " ArrayType(l) :- NewArrayObj(x,l).\n" +
	 
	  "ObjectType(l) :- NewObj(x,l).\n" +

	 "PrimType(l) :- NewPrimObj(x,l).\n" +

	 " VPtsTo(x,l) :- Instance(x,l,y).\n" +
	 
	 " VPtsTo(x,l) :- VPtsTo(y,l), Assign(x,y).\n" +
	 
	  "VPtsTo(x,m) :- LoadDot(x,y,f), HPtsTo(l,f,m), VPtsTo(y,l).\n" +
	 
	 "VPtsTo(x,n) :- LoadDot(x,y,f),Prototype(l,m), HPtsTo(m,f,n), VPtsTo(y,l).\n" +


	 "HPtsTo(l,f,m) :- StoreDot(x,f,y), VPtsTo(x,l), VPtsTo(y,m), !FrozenObjStrong(l).\n" +

	 "HPtsTo(l,f,m) :- StoreDotWeak(x,f,y), VPtsTo(x,l), VPtsTo(y,m), !FrozenObjWeak(l).\n" +
	 
	 
	 " HPtsTo(l,f,m) :- HStoreDot(l,f,m).\n" +

//	 " HPtsTo(l,f,m) :- HStoreDotWeak(l,f,m),  !FrozenObjWeak(l).\n" +
	     
	 " Prototype(l,n) :- Prototype(l,m), Prototype(m,n). \n" +

	 " FrozenObjWeak(l) :- FrozenObjStrong(l). \n" +
	 

	 //BEGIN ANNOTATION RULES
	 "Annotation(f,"+annAll+").\n" +
	     
	
	     
        // Store on Annotated-Box implies store on individual elements which have that anntation.
	 
	 "HPtsTo(l,g,m):- HPtsTo(l,f,m), Annotation(f,g), !IsAnnotationTag(f). \n"+
	     
	 "HPtsTo(l,h,m):- HPtsTo(l,f,m), Complement(g,h), !Annotation(f,g), !IsAnnotationTag(f). \n"+
	     
	 "StoreDot(x,f,y):- StoreDot(x,g,y), Annotation(f,g), !IsAnnotationTag(f). \n"+
	     
	 "StoreDot(x,f,y):- StoreDot(x,h,y), Complement(g,h), !Annotation(f,g), !IsAnnotationTag(f). \n"+	     

	 "StoreDotWeak(x,f,y):- StoreDotWeak(x,g,y), Annotation(f,g), !IsAnnotationTag(f). \n"+
	     
	 "StoreDotWeak(x,f,y):- StoreDotWeak(x,h,y),!Annotation(f,g), Complement(g,h), !IsAnnotationTag(f). \n"+
	     
	     
	     
	 "HStoreDot(x,f,y):- HStoreDot(x,g,y), Annotation(f,g), !IsAnnotationTag(f). \n"+
	     
	 "HStoreDot(x,f,y):- HStoreDot(x,h,y), Complement(g,h), !Annotation(f,g), !IsAnnotationTag(f). \n"+
	     
//	 "HStoreDotWeak(x,f,y):- HStoreDotWeak(x,g,y), Annotation(f,g), !IsAnnotationTag(f). \n"+
	     
//	 "HStoreDotWeak(x,f,y):- HStoreDotWeak(x,h,y),!Annotation(f,g), Complement(g,h), !IsAnnotationTag(f). \n"+
	    

	 // END ANNOTATION RULES
	 
	 // BEGIN FUNCTION CALL RULES
	 	 
	 "FPtsTo(x,l) :- FunctionType(l), VPtsTo(x,l). \n" +
	     
	 "HActualEverythingCon(l,i,m,x,G,k) :- ActualArgCon(f,i,y,k), FPtsTo(f,l), VPtsTo(y,m), ActualRetCon(f,x,k), CallerCon(G,f,k). \n" +
	   

	 
	 "HActualEverything(n,i,m,x,G) :- HActualEverythingCon(l,i,m,x,G,k), CallClonedIn(k), Clone(l,1,n). \n " +
	     
	 "HActualEverything(l,i,m,x,G) :- HActualEverythingCon(l,i,m,x,G,k), CallClonedIn(k), Dup(l). \n " +

	 "HActualEverything(l,i,m,x,G) :- HActualEverythingCon(l,i,m,x,G,k), !CallClonedIn(k). \n " +

	  "HActualArg(l,i,m) :- HActualEverything(l,i,m,x,G). \n " +
	     
	 "HActualRet(l,x) :- HActualEverything(l,i,m,x,G). \n " +
	     
	 "HCaller(G,l)  :- HActualEverything(l,i,m,x,G). \n" +


	 " VPtsTo(x,m) :- HCaller(G,l), HActualArg(l,i,m), FormalArg(l,i,x). \n" +
	     
	 " Assign(y,x) :- HCaller(G,l), HActualRet(l,y), FormalRet(l,x). \n" +
	     
	 
	 " Assign(x,y) :- CatchVar(G,x), FThrow(G,y). \n" + 
	 
	 " FThrow(G,x) :- HCaller(G,l), FThrow(l,x). \n" +

// END FUNCTION CALL RULES	 
	 
	 " Precious(l) :- Precious(n), HPtsTo(l," + encodeField('$A$AdsafeRejectNot') + ",n). \n" + 

	 " Prototype(l,n) :- Instance(x,l,y), VPtsTo(y,m), HPtsTo(m," + prototypeNum + ",n). \n" +
	 
	 " Prototype(l,q) :- Instance(x,l,y), VPtsTo(y,m), Prototype(m,n), HPtsTo(n," + prototypeNum + ",q). \n" +
	     
// We dont use HActualEverything below in order make sure that attacker call site are never signaled as ones that should be cloned.
	     
	 " CallClonedOut(k) :- ActualArgCon(f,i,y,k), VPtsTo(y,m), Precious(m). \n"
	     
	 return constraint;
     }
     
     return genConstraints();
 }

/* 
	 
	 genInverseRule("NewObj(x,l)",["VPtsTo(x,l)"]) +
	 
	 genInverseRule("NewFunctionObj(x,l)",["VPtsTo(x,l)"]) +
	 
	 genInverseRule( "VPtsTo(x,l)", ["NewArrayObj(x,l)"]) +
	 
	genInverseRule( " FunctionType(l)", [ "NewFunctionObj(x,l) " ]) +

	genInverseRule( " ArrayType(l)", [ "NewArrayObj(x,l) " ]) +
	 
	 genInverseRule( "ObjectType(l)", [ "NewObj(x,l) " ]) +

	genInverseRule( " VPtsTo(x,l)", [ "Instance(x,l,y) " ]) +
	 
	 genInverseRule( " VPtsTo(x,l)", [ "VPtsTo(y,l)", "Assign(x,y) " ]) +
	 
	 genInverseRule(  "VPtsTo(x,m)", [ "LoadDot(x,y,f)", "HPtsTo(l,f,m)", "VPtsTo(y,l) " ]) +
	 
	 genInverseRule( "VPtsTo(x,n)", [ "LoadDot(x,y,f)", "Prototype(l,m)", "HPtsTo(m,f,n)", "VPtsTo(y,l) " ]) +

	 genInverseRule( "HPtsTo(l,f,m)", [ "StoreDot(x,f,y)", "VPtsTo(x,l)", "VPtsTo(y,m) " ]) +

	 genInverseRule( "HPtsTo(l,f,m)", [ "StoreDotWeak(x,f,y)", "VPtsTo(x,l)", "VPtsTo(y,m)", "!FrozenObjWeak(l) " ]) +
	 
	genInverseRule( " HPtsTo(l,f,m)", [ "HStoreDot(l,f,m) " ]) +

	 genInverseRule( " HPtsTo(l,f,m)", [ "HStoreDotWeak(l,f,m)", " !FrozenObjWeak(l) " ]) +
	     
	 genInverseRule( " Prototype(l,n)", [ "Prototype(l,m)", "Prototype(m,n) " ]) +

	genInverseRule( " FrozenObjWeak(l)", [ "FrozenObjStrong(l) " ]) +
	 
//	 genInverseRule("Annotation(f,"+annAll+")",[]) +

	genInverseRule( "HPtsTo(l,g,m)", [ " HPtsTo(l,f,m)", "Annotation(f,g)", "!IsAnnotationTag(f) "]) +
	     
	 genInverseRule( "HPtsTo(l,h,m)", [ " HPtsTo(l,f,m)", "Complement(g,h)", "!Annotation(f,g)", "!IsAnnotationTag(f) "]) +
	     
	 genInverseRule("StoreDot(x,f,y)", [ " StoreDot(x,g,y)", "Annotation(f,g)", "!IsAnnotationTag(f) "]) +
	     
	 genInverseRule( "StoreDot(x,f,y)", [ " StoreDot(x,h,y)", "Complement(g,h)", "!Annotation(f,g)", "!IsAnnotationTag(f) "]) +	     

	 genInverseRule( "StoreDotWeak(x,f,y)", [ " StoreDotWeak(x,g,y)", "Annotation(f,g)", "!IsAnnotationTag(f) "]) +
	     
	 genInverseRule( "StoreDotWeak(x,f,y)", [ " StoreDotWeak(x,h,y)" , "!Annotation(f,g)", "Complement(g,h)", "!IsAnnotationTag(f) "]) +
	     
	     
	 genInverseRule("HStoreDot(x,f,y)", [ " HStoreDot(x,g,y)" ,"Annotation(f,g)", "!IsAnnotationTag(f) "]) +
	     
	 genInverseRule( "HStoreDot(x,f,y)", [ " HStoreDot(x,h,y)", "Complement(g,h)", "!Annotation(f,g)", "!IsAnnotationTag(f) "]) +
	     
	 genInverseRule("HStoreDotWeak(x,f,y)", [ " HStoreDotWeak(x,g,y)", "Annotation(f,g)", "!IsAnnotationTag(f) "]) +
	     
	 genInverseRule( "HStoreDotWeak(x,f,y)", [ " HStoreDotWeak(x,h,y)", "!Annotation(f,g)", "Complement(g,h)", "!IsAnnotationTag(f) "]) +
	 	 
	 genInverseRule("FPtsTo(x,l)", [ "FunctionType(l)", "VPtsTo(x,l) " ]) +
	     
	 genInverseRule( "HActualEverythingCon(l,i,m,x,G,k)", [ "ActualArgCon(f,i,y,k)", "FPtsTo(f,l)", "VPtsTo(y,m)", "ActualRetCon(f,x,k)", "CallerCon(G,f,k) " ]) +
	   

	 
	 genInverseRule( "HActualEverything(n,i,m,x,G)", [ "HActualEverythingCon(l,i,m,x,G,k)", "CallClonedIn(k)", "Clone(l,1,n)  " ]) +
	     
	 genInverseRule( "HActualEverything(l,i,m,x,G)", [ "HActualEverythingCon(l,i,m,x,G,k)", "CallClonedIn(k)", "Dup(l)  " ]) +

	 genInverseRule( "HActualEverything(l,i,m,x,G)", [ "HActualEverythingCon(l,i,m,x,G,k)", "!CallClonedIn(k)" ]) +

	genInverseRule(  "HActualArg(l,i,m)", [ "HActualEverything(l,i,m,x,G)" ]) +
	     
	genInverseRule( "HActualRet(l,x)", [ "HActualEverything(l,i,m,x,G)" ]) +
	     
	genInverseRule( "HCaller(G,l) ", [ "HActualEverything(l,i,m,x,G)" ]) +


	 genInverseRule( " VPtsTo(x,m)", [ "HCaller(G,l)", "HActualArg(l,i,m)", "FormalArg(l,i,x) " ]) +
	     
	 genInverseRule( " Assign(y,x)", [ "HCaller(G,l)", "HActualRet(l,y)", "FormalRet(l,x) " ]) +
	     
	 
	 genInverseRule( " Assign(x,y)", [ "HCaller(G,l)", "CatchVar(G,x)", "FThrow(l,y) " ]) + 
	 
	 genInverseRule( " FThrow(G,x)" , ["HCaller(G,l)", "FThrow(l,x) " ]) +

// END FUNCTION CALL RULES	 
	 
	 genInverseRule( " Precious(l)", [ "Precious(n)", "HPtsTo(l," + encodeField('$A$AdsafeRejectNot') + ",n)" ]) + 

	 genInverseRule( " Prototype(l,n)", [ "Instance(x,l,y)", "VPtsTo(y,m)", "HPtsTo(m," + prototypeNum + ",n)" ]) +
	 
	 genInverseRule( " Prototype(l,q)", [ "Instance(x,l,y)", "VPtsTo(y,m)", "Prototype(m,n)", "HPtsTo(n,"+ prototypeNum +",q)" ]) +
	     
	 genInverseRule( " CallTarget(f,l)", [ "Caller(G,f)", "FPtsTo(f,l) " ]) +

// We dont use HActualEverything below in order make sure that attacker call site are never signaled as ones that should be cloned.
	     
	 genInverseRule( " CallClonedOut(k)", [ "ActualArgCon(f,i,y,k)", "VPtsTo(y,m)", "Precious(m)" ]) +
	     
	 genInverseRule( " Calls(F,H)", [ "Caller(F,g)", "CallTarget(g,H)"]) ;

*/