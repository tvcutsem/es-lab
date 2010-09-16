
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
 this.genDatalogRules = function genDatalogRules(encodeVar, encodeField, encodeLoc, getNextTempVar, getNextAstNumber, astNumberMap, relName, makeConstraint, functionClones, nClones, maxArity) {
 
     
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
	 
	// " LoadBox(x:V,y:V) input \n" +
	 
	 " StoreDotStrong(x:V,f:F,y:V) input \n" +

	 " StoreDot(x:V,f:F,y:V) input \n" +

	 " StoreDotWeak(x:V,f:F,y:V) input \n" +

	 "HStoreDotStrong(l:L,f:F,y:L) input \n" +
	     
	 "HStoreDot(l:L,f:F,y:L) input \n" +
	 
	 "HStoreDotWeak(l:L,f:F,y:L) input \n" +
	 
	// " StoreBoxStrong(x:V,y:V) input \n" +
	 
	// " StoreBox(x:V,y:V) input \n" +
	     
	// " StoreBoxWeak(x:V,y:V) input \n" +

	// " HStoreBoxStrong(l:L,y:V) input \n" +

	// " HStoreBox(l:L,y:V) input \n" +
	     
	// " HStoreBoxWeak(l:L,y:V) input \n" +
	 
	 " ActualArg(f:V,i:I,x:V) input \n" +
	 
	 " ActualRet(f:V,y:V) input  \n" +
	 
	 " FThrow(l:L,x:V) input  \n" +
	 
	 " FormalArg(l:L, i:I, x:V) input \n" +
	 
	 " FormalArgArguments(G:L, x:V) input  \n" +
	 
	 " ActualArgArguments(f:V, l:L) input  \n" +
	 
	  "FormalRet(l:L,x:V) input  \n" +
	 
	 " NewObj(x:V,l:L) input \n" +
	 
	 " NewFunctionObj(x:V, l:L) input \n" +
	 
	 " NewArrayObj(x:V, l:L) input \n" +
	 
	  "Caller(l:L,x:V) input \n" +
	 
	 " Instance(x:V,l:L,y:V) input \n" +
	 
	  "CatchVar(l:L, x:V) input \n" +
	 
	 " ActualArgAll(f:V,x:V) input \n" +
	 
	 " ActualArgCon(f:V,i:I,x:V,k:I) input \n" +
	 
	 " ActualRetCon(f:V,y:V,k:I) input  \n" +
	     
	 "CallerCon(l:L,x:V,k:I) input \n" +


	 " ActualArgArgumentsCon(f:V, l:L, k:I) input  \n" +

	 " ActualArgAllCon(f:V,x:V,k:I) input \n" +
    
         " Clone(F:L,k:I,G:L) input \n" +
	     
	 " Dup(F:L) input \n" +
	     
 	 " Annotation(f:F,g:F) input \n" +
	     
	 " Complement(f:F,g:F) input \n" +

	 " IsAnnotationTag(f:F) input \n" +
   
 
	 " ### DERIVED RELATIONS \n" +
	 
	  "VPtsTo(x:V,l:L) output \n" +
	 
	 " HPtsTo(l:L,f:F,m:L) output \n" +
	 
	 " FPtsTo(f:V,l:L) output \n" +

	 " Prototype(l:L,m:L) output \n" +
	 
	 " CallTarget(f:V, l:L) output \n" +


	 
	  "HActualArg(l:L, i:I, m:L) output \n" +
	 
	 " HActualRet(l:L, y:V) output \n" +
	 
	  "HCaller(l:L,m:L) output \n" +

	 " HActualArgArguments(f:L, l:L) output  \n" +

	 " HActualArgAll(l:L,m:L) output \n" +
	     
	 " HActualEverything(l:L,i:I,m:L,x:V,G:L) output \n" +

	 
	 " HActualEverythingCon(l:L,i:I,m:L,x:V,G:L,k:I) output \n" +


	 " HActualArgAllCon(l:L,m:L,k:I) output \n" +
	     
	 "HActualArgCon(f:L,i:I,x:L,k:I) output \n" +
	 
	 "HActualRetCon(f:L,y:V,k:I) output  \n" +
	     
	 "HCallerCon(l:L,x:L,k:I) output \n" +
	     
	 "HActualArgArgumentsCon(f:L, l:L, k:I) output  \n" +


	 
	 " FunctionType(l:L) output \n" +
	 
	 " ArrayType(l:L) output \n" +
	 
	 " ObjectType(l:L) output \n" +
	 
	  "Calls(F:L,G:L) output \n" +
	     
	 " FrozenObjStrong(F:L) output \n" +
	     
	 " FrozenObjWeak(F:L) output \n" +

	 
	 " ### RULES \n" +
	 
	  "VPtsTo(x,l) :- NewObj(x,l).\n" +
	 
	  "VPtsTo(x,l) :- NewFunctionObj(x,l).\n" +
	 
	 " VPtsTo(x,l) :- NewArrayObj(x,l).\n" +
	 
	 " FunctionType(l) :- NewFunctionObj(x,l).\n" +

	 " ArrayType(l) :- NewArrayObj(x,l).\n" +
	 
	  "ObjectType(l) :- NewObj(x,l).\n" +

	 " VPtsTo(x,l) :- Instance(x,l,y).\n" +
	 
	 " VPtsTo(x,l) :- VPtsTo(y,l), Assign(x,y).\n" +
	 
	  "VPtsTo(x,m) :- LoadDot(x,y,f), HPtsTo(l,f,m), VPtsTo(y,l).\n" +
	 
	 "VPtsTo(x,n) :- LoadDot(x,y,f),Prototype(l,m), HPtsTo(m,f,n), VPtsTo(y,l).\n" +

	 "HPtsTo(l,f,m) :- StoreDotStrong(x,f,y), VPtsTo(x,l), VPtsTo(y,m).\n" +

	 "HPtsTo(l,f,m) :- StoreDot(x,f,y), VPtsTo(x,l), VPtsTo(y,m), !FrozenObjStrong(l).\n" +

	 "HPtsTo(l,f,m) :- StoreDotWeak(x,f,y), VPtsTo(x,l), VPtsTo(y,m), !FrozenObjWeak(l).\n" +
	 
	 " HPtsTo(l,f,m) :- HStoreDotStrong(l,f,m).\n" +    
	 
	 " HPtsTo(l,f,m) :- HStoreDot(l,f,m), !FrozenObjStrong(l).\n" +

	 " HPtsTo(l,f,m) :- HStoreDotWeak(l,f,m),  !FrozenObjWeak(l).\n" +
	     
	 " Prototype(l,n) :- Prototype(l,m), Prototype(m,n). \n" +

	 " FrozenObjWeak(l) :- FrozenObjStrong(l). \n" +
	 
	// " StoreDotStrong(x,f, y) :- StoreBoxStrong(x,y). \n" +

	// " StoreDot(x,f, y) :- StoreBox(x,y). \n" +
	     
	// " StoreDotWeak(x,f, y) :- StoreBoxWeak(x,y). \n" +

	// " HStoreDotStrong(l,f,y) :- HStoreBoxStrong(l,y). \n" +

	// " HStoreDot(l,f,y) :- HStoreBox(l,y). \n" +
	     
 	// " HStoreDotWeak(l,f,y) :- HStoreBoxWeak(l,y). \n" +

	// " LoadDot(x,y,f) :- LoadBox(x,y). \n" +

	 //BEGIN ANNOTATION RULES
	 "Annotation(f,"+annAll+").\n" +
	     
	
	     
        // Store on Annotated-Box implies store on individual elements which have that anntation.
	 
	 "HPtsTo(l,g,m):- HPtsTo(l,f,m), Annotation(f,g), !IsAnnotationTag(f). \n"+
	     
	 "HPtsTo(l,h,m):- HPtsTo(l,f,m), Complement(g,h), !Annotation(f,g), !IsAnnotationTag(f). \n"+
	     
	 "StoreDot(x,f,y):- StoreDot(x,g,y), Annotation(f,g), !IsAnnotationTag(f). \n"+
	     
	 "StoreDot(x,f,y):- StoreDot(x,h,y), Complement(g,h), !Annotation(f,g), !IsAnnotationTag(f). \n"+	     

	 "StoreDotWeak(x,f,y):- StoreDotWeak(x,g,y), Annotation(f,g), !IsAnnotationTag(f). \n"+
	     
	 "StoreDotWeak(x,f,y):- StoreDotWeak(x,h,y),!Annotation(f,g), Complement(g,h), !IsAnnotationTag(f). \n"+
	     
	 "StoreDotStrong(x,f,y):- StoreDotStrong(x,g,y), Annotation(f,g), !IsAnnotationTag(f). \n"+
	     
	 "StoreDotStrong(x, f,y):- StoreDotStrong(x,h,y),!Annotation(f,g), Complement(g,h), !IsAnnotationTag(f). \n"+
	     
	 "HStoreDot(x,f,y):- HStoreDot(x,g,y), Annotation(f,g), !IsAnnotationTag(f). \n"+
	     
	 "HStoreDot(x,f,y):- HStoreDot(x,h,y), Complement(g,h), !Annotation(f,g), !IsAnnotationTag(f). \n"+
	     
	 "HStoreDotWeak(x,f,y):- HStoreDotWeak(x,g,y), Annotation(f,g), !IsAnnotationTag(f). \n"+
	     
	 "HStoreDotWeak(x,f,y):- HStoreDotWeak(x,h,y),!Annotation(f,g), Complement(g,h), !IsAnnotationTag(f). \n"+
	     
	 "HStoreDotStrong(x,f,y):- HStoreDotStrong(x,g,y), Annotation(f,g), !IsAnnotationTag(f). \n"+
	     
	 "HStoreDotStrong(x,f,y):- HStoreDotStrong(x,h,y),!Annotation(f,g), Complement(g,h), !IsAnnotationTag(f). \n"+
	  
	 
	 
	 /*
	     
         "HPtsTo(l,f,m):- StoreDot(x,g,y),!FrozenObjStrong(l),  VPtsTo(x,l), VPtsTo(y,m), Annotation(f,g), !IsAnnotationTag(f). \n"+
	     
	 "HPtsTo(l,f,m):- StoreDot(x,h,y), !FrozenObjStrong(l), VPtsTo(x,l), VPtsTo(y,m), Complement(g,h), !Annotation(f,g), !IsAnnotationTag(f). \n"+
	    
	 "HPtsTo(l,f,m):- StoreDotWeak(x,g,y), !FrozenObjWeak(l), VPtsTo(x,l), VPtsTo(y,m), Annotation(f,g), !IsAnnotationTag(f). \n"+
	     
	 "HPtsTo(l,f,m):- StoreDotWeak(x,h,y), !FrozenObjWeak(l), VPtsTo(x,l), VPtsTo(y,m), Complement(g,h), !Annotation(f,g), !IsAnnotationTag(f). \n"+
	    
	 "HPtsTo(l,f,m):- StoreDotStrong(x,g,y), VPtsTo(x,l), VPtsTo(y,m), Annotation(f,g), !IsAnnotationTag(f). \n"+
	     
	 "HPtsTo(l,f,m):- StoreDotStrong(x,h,y),  VPtsTo(x,l), VPtsTo(y,m), Complement(g,h), !Annotation(f,g), !IsAnnotationTag(f). \n"+
	    
	 "HPtsTo(l,f,m):- HStoreDot(l,g,y),!FrozenObjStrong(l),  VPtsTo(y,m), Annotation(f,g), !IsAnnotationTag(f). \n"+
	     
	 "HPtsTo(l,f,m):- HStoreDot(l,h,y), !FrozenObjStrong(l),  VPtsTo(y,m), Complement(g,h), !Annotation(f,g), !IsAnnotationTag(f). \n"+
	    
	 "HPtsTo(l,f,m):- HStoreDotWeak(l,g,y), !FrozenObjWeak(l),VPtsTo(y,m), Annotation(f,g), !IsAnnotationTag(f). \n"+
	     
	 "HPtsTo(l,f,m):- HStoreDotWeak(l,h,y), !FrozenObjWeak(l),  VPtsTo(y,m), Complement(g,h), !Annotation(f,g), !IsAnnotationTag(f). \n"+
	    
	 "HPtsTo(l,f,m):- HStoreDotStrong(l,g,y),  VPtsTo(y,m), Annotation(f,g), !IsAnnotationTag(f). \n"+
	     
	 "HPtsTo(l,f,m):- HStoreDotStrong(l,h,y),   VPtsTo(y,m), Complement(g,h), !Annotation(f,g), !IsAnnotationTag(f). \n"+
	    
	 // Add rules for Weak and Strong and also HStoreDot
	


	 // Store on Annotated-Box implies store on individual elements which have that anntation.

	 "StoreDot(x,g,y):- StoreDot(x,f,y), Annotation(f,g), !IsAnnotationTag(f). \n"+
	     
	 "StoreDot(x,h,y):- StoreDot(x,f,y), Complement(g,h), !Annotation(f,g), !IsAnnotationTag(f). \n"+
	     
	 "StoreDotWeak(x,g,y):- StoreDotWeak(x,f,y), Annotation(f,g), !IsAnnotationTag(f). \n"+
	     
	 "StoreDotWeak(x,h,y):- StoreDotWeak(x,f,y),!Annotation(f,g), Complement(g,h), !IsAnnotationTag(f). \n"+
	     
	 "StoreDotStrong(x,g,y):- StoreDotStrong(x,f,y), Annotation(f,g), !IsAnnotationTag(f). \n"+
	     
	 "StoreDotStrong(x,h,y):- StoreDotStrong(x,f,y),!Annotation(f,g), Complement(g,h), !IsAnnotationTag(f). \n"+
	     
	 "HStoreDot(x,g,y):- HStoreDot(x,f,y), Annotation(f,g), !IsAnnotationTag(f). \n"+
	     
	 "HStoreDot(x,h,y):- HStoreDot(x,f,y), Complement(g,h), !Annotation(f,g), !IsAnnotationTag(f). \n"+
	     
	 "HStoreDotWeak(x,g,y):- HStoreDotWeak(x,f,y), Annotation(f,g), !IsAnnotationTag(f). \n"+
	     
	 "HStoreDotWeak(x,h,y):- HStoreDotWeak(x,f,y),!Annotation(f,g), Complement(g,h), !IsAnnotationTag(f). \n"+
	     
	 "HStoreDotStrong(x,g,y):- HStoreDotStrong(x,f,y), Annotation(f,g), !IsAnnotationTag(f). \n"+
	     
	 "HStoreDotStrong(x,h,y):- HStoreDotStrong(x,f,y),!Annotation(f,g), Complement(g,h), !IsAnnotationTag(f). \n"+
	     
	 // Store on individual elements implies store on the corresponding annotation

	  "StoreDot(x,f,y):- StoreDot(x,g,y), Annotation(f,g), !IsAnnotationTag(f). \n"+
	     
	 "StoreDot(x,f,y):- StoreDot(x,h,y), Complement(g,h), !Annotation(f,g), !IsAnnotationTag(f). \n"+
	     
	 "StoreDotWeak(x,f,y):- StoreDotWeak(x,g,y), Annotation(f,g), !IsAnnotationTag(f). \n"+
	     
	 "StoreDotWeak(x,f,y):- StoreDotWeak(x,h,y),!Annotation(f,g), Complement(g,h), !IsAnnotationTag(f). \n"+
	     
	 "StoreDotStrong(x,f,y):- StoreDotStrong(x,g,y), Annotation(f,g), !IsAnnotationTag(f). \n"+
	     
	 "StoreDotStrong(x, f,y):- StoreDotStrong(x,h,y),!Annotation(f,g), Complement(g,h), !IsAnnotationTag(f). \n"+
	     
	 "HStoreDot(x,f,y):- HStoreDot(x,g,y), Annotation(f,g), !IsAnnotationTag(f). \n"+
	     
	 "HStoreDot(x,f,y):- HStoreDot(x,h,y), Complement(g,h), !Annotation(f,g), !IsAnnotationTag(f). \n"+
	     
	 "HStoreDotWeak(x,f,y):- HStoreDotWeak(x,g,y), Annotation(f,g), !IsAnnotationTag(f). \n"+
	     
	 "HStoreDotWeak(x,f,y):- HStoreDotWeak(x,h,y),!Annotation(f,g), Complement(g,h), !IsAnnotationTag(f). \n"+
	     
	 "HStoreDotStrong(x,f,y):- HStoreDotStrong(x,g,y), Annotation(f,g), !IsAnnotationTag(f). \n"+
	     
	 "HStoreDotStrong(x,f,y):- HStoreDotStrong(x,h,y),!Annotation(f,g), Complement(g,h), !IsAnnotationTag(f). \n"+
	     
	 // Making HPtsTo track annotations

	 "HPtsTo(l,f,m):- HPtsTo(l,g,m), Annotation(f,g), !IsAnnotationTag(f). \n"+
	     
	 "HPtsTo(l,f,m):- HPtsTo(l,h,m), Complement(g,h), !Annotation(f,g), !IsAnnotationTag(f). \n"+
	 
	 "HPtsTo(l,g,m):- HPtsTo(l,f,m), Annotation(f,g), !IsAnnotationTag(f). \n"+
	     
	 "HPtsTo(l,h,m):- HPtsTo(l,f,m), Complement(g,h), !Annotation(f,g), !IsAnnotationTag(f). \n"+
*/
	 

	 

	 // END ANNOTATION RULES
	 
	 // BEGIN FUNCTION CALL RULES
	 	 
	 "FPtsTo(x,l) :- FunctionType(l), VPtsTo(x,l). \n" +
	     
	 "HActualArg(l,i,m) :- ActualArg(f,i,x), FPtsTo(f,l), VPtsTo(x,m). \n " +
	     
	 "HActualRet(l,x) :- ActualRet(f,x), FPtsTo(f,l). \n " +
	     
	 "HCaller(l,m)  :- Caller(l,f), FPtsTo(f,m). \n" +

	 "HActualArgAll(l,m) :- ActualArgAll(f,x), FPtsTo(f,l), VPtsTo(x,m). \n" +

	 "HActualArgArguments(F,l) :- ActualArgArguments(f,l), FPtsTo(f,F). \n" +

	 "HActualEverything(l,i,m,x,G) :- ActualArg(f,i,y), FPtsTo(f,l), VPtsTo(y,m), ActualRet(f,x), Caller(G,f). \n" +
	 
	 "HActualArgCon(l,i,m,k) :- ActualArgCon(f,i,x,k), FPtsTo(f,l), VPtsTo(x,m). \n " +
	     
	 "HActualRetCon(l,x,k) :- ActualRetCon(f,x,k), FPtsTo(f,l). \n " +
	     
	 "HCallerCon(l,m,k)  :- CallerCon(l,f,k), FPtsTo(f,m). \n" +
	     
	 "HActualArgAllCon(l,m,k) :- ActualArgAllCon(f,x,k), FPtsTo(f,l), VPtsTo(x,m). \n" +    
	 
	 "HActualArgArgumentsCon(F,l,k) :- ActualArgArgumentsCon(f,l,k), FPtsTo(f,F). \n" +
	     
	 "HActualEverythingCon(l,i,m,x,G,k) :- ActualArgCon(f,i,y,k), FPtsTo(f,l), VPtsTo(y,m), ActualRetCon(f,x,k), CallerCon(G,f,k). \n" +

	 


	 " VPtsTo(x,m) :- HCaller(G,l), HActualArg(l,i,m), FormalArg(l,i,x). \n" +
	     
	 " Assign(y,x) :- HCaller(G,l), HActualRet(l,y), FormalRet(l,x). \n" +
	     
	 " VPtsTo(x,m) :- HActualArgArguments(l,m), FormalArgArguments(l,x). \n"+
	 
	 " Assign(x,y) :- HCaller(G,l), CatchVar(G,x), FThrow(l,y). \n" + 
	 
	 " FThrow(G,x) :- HCaller(G,l), FThrow(l,x). \n" +
	 
	
	 "HActualArg(n,i,m) :- HActualArgCon(l,i,m,k), Clone(l,k,n). \n" +
	   
	 "HActualArg(l,i,m) :- HActualArgCon(l,i,m,k), Dup(l). \n" +

	 "HActualRet(n,x) :- HActualRetCon(l,x,k), Clone(l,k,n). \n" +
	   
	 "HActualRet(l,x) :- HActualRetCon(l,x,k), Dup(l). \n" +

	 "HCaller(G,n) :- HCallerCon(G,l,k), Clone(l,k,n). \n" +
	   
	 "HCaller(G,l) :- HCallerCon(G,l,k), Dup(l). \n" +

	 
	 

//	 " VPtsTo(x,l) :- HCallerCon(G,F,k), HActualArgCon(F,i,l,k),  Clone(F,k,H), FormalArg(H,i,x). \n" +
	     
//	 " Assign(y,x) :- HCallerCon(G,F,k), HActualRetCon(F,y,k), Clone(F,k,H), FormalRet(H,x). \n" +
	 
//	 " VPtsTo(x,l) :- HActualArgArgumentsCon(F,l,k),  Clone(F,k,H), FormalArgArguments(H,x). \n"+
	 
//	 " FThrow(G,x) :- HCallerCon(G,F,k),  Clone(F,k,H), FThrow(H,x). \n" +
	 
//	 " Assign(x,y) :- HCallerCon(G,F,k), CatchVar(G,x), Clone(F,k,H), FThrow(H,y). \n" + 

// CHECK THE RULES BELOW
//	 " VPtsTo(x,l) :- HCallerCon(G,F,k), HActualArgCon(F,i,l,k), Dup(F), FormalArg(F,i,x). \n" +
	 
//	 " Assign(y,x) :- HCallerCon(G,f,k), HActualRetCon(F,y,k),  Dup(F), FormalRet(F,x). \n" +
	 
//	 " VPtsTo(x,l) :- HActualArgArgumentsCon(f,l,k),  Dup(F), FormalArgArguments(F,x). \n"+
	 
//	 " FThrow(G,x) :- HCallerCon(G,F,k),  Dup(F), FThrow(F,x). \n" +
	 
//	 " Assign(x,y) :- HCallerCon(G,F,k), CatchVar(G,x), Dup(F), FThrow(F,y). \n" + 

	 
//	 " Assign(x,y) :- Caller(G,f), ActualArg(f,i,y), FPtsTo(f,F), FormalArg(F,i,x). \n" +
	 
//	  "Assign(y,x) :- Caller(G,f), ActualRet(f,y), FPtsTo(f,F), FormalRet(F,x). \n" +
	 
//	 " VPtsTo(x,l) :- ActualArgArguments(f,l), FPtsTo(f,G), FormalArgArguments(G,x). \n"+

//	 " Assign(x,y) :- Caller(G,f), CatchVar(G,x), FPtsTo(f,F), FThrow(F,y). \n" + 

//	 " FThrow(G,x) :- Caller(G,f), FPtsTo(f,F), FThrow(F,x). \n" +


//	 " Assign(x,y) :- CallerCon(G,f,k), ActualArgCon(f,i,y,k), FPtsTo(f,F), Clone(F,k,H), FormalArg(H,i,x). \n" +
	     
//	 " Assign(y,x) :- CallerCon(G,f,k), ActualRetCon(f,y,k), FPtsTo(f,F), Clone(F,k,H), FormalRet(H,x). \n" +
	 
//	 " VPtsTo(x,l) :- ActualArgArgumentsCon(f,l,k), FPtsTo(f,F), Clone(F,k,H), FormalArgArguments(H,x). \n"+
	 
//	 " FThrow(G,x) :- CallerCon(G,f,k), FPtsTo(f,F), Clone(F,k,H), FThrow(H,x). \n" +
	 
//	 " Assign(x,y) :- CallerCon(G,f,k), CatchVar(G,x), FPtsTo(f,F), Clone(F,k,H), FThrow(H,y). \n" + 

// CHECK THE RULES BELOW
//	 " Assign(x,y) :- CallerCon(G,f,k), ActualArgCon(f,i,y,k), FPtsTo(f,F), Dup(F), FormalArg(F,i,x). \n" +
	 
//	 "Assign(y,x) :- CallerCon(G,f,k), ActualRetCon(f,y,k), FPtsTo(f,F), Dup(F), FormalRet(F,x). \n" +
	 
//	 " VPtsTo(x,l) :- ActualArgArgumentsCon(f,l,k), FPtsTo(f,F), Dup(F), FormalArgArguments(F,x). \n"+
	 
//	 " FThrow(G,x) :- CallerCon(G,f,k), FPtsTo(f,F), Dup(F), FThrow(F,x). \n" +
	 
//	 " Assign(x,y) :- CallerCon(G,f,k), CatchVar(G,x), FPtsTo(f,F), Dup(F), FThrow(F,y). \n" + 


// END FUNCTION CALL RULES	 
	 
	 " Prototype(l,n) :- Instance(x,l,y), VPtsTo(y,m), HPtsTo(m," + prototypeNum + ",n). \n" +
	 
	 " Prototype(l,q) :- Instance(x,l,y), VPtsTo(y,m), Prototype(m,n), HPtsTo(n," + prototypeNum + ",q). \n" +
	     
	 " CallTarget(f,l) :- Caller(G,f), FPtsTo(f,l). \n" +
	     	
	 "ActualArg(f,j,y) :- ActualArgAll(f,x), LoadDot(y,x,$A$Num). \n" +
	     
	 "ActualArgCon(f,j,y,k) :- ActualArgAllCon(f,x,k), LoadDot(y,x,$A$Num). \n" +
	     
	 "Calls(F,H) :- Caller(F,g), CallTarget(g,H). \n" ;
	 return constraint;
     }
     
     return genConstraints();
 }

 
