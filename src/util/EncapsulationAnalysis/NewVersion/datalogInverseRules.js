
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
	 return result;
     }
  
     function genConstraints(){
	 var prototypeNum =  encodeField('prototype');
	 
	 var annAll = encodeField('$A$All');
	 	 
	 
	var constraint = 
	     
	 "### Relations \n" +
	 
	 "Assign(x:V,y:V) input \n" +
	 
	 "LoadDot(x:V,y:V,f:F) input \n" +
	 	 
	 " StoreDot(x:V,f:F,y:V) input \n" +

	 " StoreDotWeak(x:V,f:F,y:V) input \n" +
	     
	 "HStoreDot(l:L,f:F,y:L) input \n" +
	 
//	 "HStoreDotWeak(l:L,f:F,y:L) input \n" +
	 
	 " ActualArg(f:V,i:I,x:V) input \n" +
	 
	 " ActualRet(f:V,y:V) input  \n" +
	     
	 " ActualArgArguments(f:V, l:L) input  \n" +
	     
	 "Caller(l:L,x:V) input \n" +
   	 	 
	 " FormalArg(l:L, i:I, x:V) input \n" +
	 
	 " FormalArgArguments(G:L, x:V) input  \n" +
	 	 
	  "FormalRet(l:L,x:V) input  \n" +
	 
	 " NewObj(x:V,l:L) input \n" +
	 
	 " NewFunctionObj(x:V, l:L) input \n" +
	 
	 " NewArrayObj(x:V, l:L) input \n" +
	 	 
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
	     
	 " Precious(F:L) input \n" +    

	 " ### DERIVED RELATIONS \n" +
	 
	  "VPtsTo(x:V,l:L) output \n" +
	 
	 " HPtsTo(l:L,f:F,m:L) output \n" +
	 
	 " FPtsTo(f:V,l:L) output \n" +
	     
	 " FThrow(l:L,x:V) output  \n" +
	     
	 " Prototype(l:L,m:L) output \n" +
	 
	  "HActualArg(l:L, i:I, m:L) output \n" +
	 
	 " HActualRet(l:L, y:V) output \n" +
	 
	  "HCaller(l:L,m:L) output \n" +
	     
	 " HActualEverything(l:L,i:I,m:L,x:V,G:L) output \n" +
	 
	 " HActualEverythingCon(l:L,i:I,m:L,x:V,G:L,k:L) output \n" +
	 
	 " FunctionType(l:L) output \n" +
	 
	 " ArrayType(l:L) output \n" +
	 
	 " ObjectType(l:L) output \n" +
	 	     
	 " FrozenObjStrong(F:L) output \n" +
	     
	 " FrozenObjWeak(F:L) output \n" +

	 " CallClonedOut(k:L) output \n" + 


	 " ############################################ RULES \n" +
	 
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


	 "HPtsTo(l,f,m) :- StoreDot(x,f,y), VPtsTo(x,l), VPtsTo(y,m).\n" +

	 "HPtsTo(l,f,m) :- StoreDotWeak(x,f,y), VPtsTo(x,l), VPtsTo(y,m), !FrozenObjWeak(l).\n" +
	 
	 
	 " HPtsTo(l,f,m) :- HStoreDot(l,f,m).\n" +

//	 " HPtsTo(l,f,m) :- HStoreDotWeak(l,f,m),  !FrozenObjWeak(l).\n" +
	     
	 " Prototype(l,n) :- Prototype(l,m), Prototype(m,n). \n" +

	 " FrozenObjWeak(l) :- FrozenObjStrong(l). \n" +
	 

	 //BEGIN ANNOTATION RULES 

	 "Annotation(f,"+annAll+").\n" +
	    	 
	 "HPtsTo(l,g,m):- HPtsTo(l,f,m), Annotation(f,g), !IsAnnotationTag(f). \n"+
	     
	 "HPtsTo(l,h,m):- HPtsTo(l,f,m), Complement(g,h), !Annotation(f,g), !IsAnnotationTag(f). \n"+
	     
	 "StoreDot(x,f,y):- StoreDot(x,g,y), Annotation(f,g), !IsAnnotationTag(f). \n"+
	     
	 "StoreDot(x,f,y):- StoreDot(x,h,y), Complement(g,h), !Annotation(f,g), !IsAnnotationTag(f). \n"+	     

	 "StoreDotWeak(x,f,y):- StoreDotWeak(x,g,y), Annotation(f,g), !IsAnnotationTag(f). \n"+
	     
	 "StoreDotWeak(x,f,y):- StoreDotWeak(x,h,y),!Annotation(f,g), Complement(g,h), !IsAnnotationTag(f). \n"+
	     
	 "HStoreDot(l,f,m):- HStoreDot(l,g,m), Annotation(f,g), !IsAnnotationTag(f). \n"+
	     
	 "HStoreDot(l,f,m):- HStoreDot(l,h,m), Complement(g,h), !Annotation(f,g), !IsAnnotationTag(f). \n"+
	     
//	 "HStoreDotWeak(l,f,m):- HStoreDotWeak(l,g,m), Annotation(f,g), !IsAnnotationTag(f). \n"+
	     
//	 "HStoreDotWeak(l,f,m):- HStoreDotWeak(l,h,m),!Annotation(f,g), Complement(g,h), !IsAnnotationTag(f). \n"+
 
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
	 
	 " Assign(x,y) :- HCaller(G,l), CatchVar(G,x), FThrow(l,y). \n" + 
	 
	 " FThrow(G,x) :- HCaller(G,l), FThrow(l,x). \n" +

// END FUNCTION CALL RULES	 
	 
	 " Prototype(l,n) :- Instance(x,l,y), VPtsTo(y,m), HPtsTo(m," + prototypeNum + ",n). \n" +
	 
	 " Prototype(l,q) :- Instance(x,l,y), VPtsTo(y,m), Prototype(m,n), HPtsTo(n," + prototypeNum + ",q). \n" +
	     
// We dont use HActualEverything below in order make sure that attacker call site are never signaled as ones that should be cloned.
	     
	 " CallClonedOut(k) :- ActualArgCon(f,i,y,k), VPtsTo(y,m), Precious(m). \n" +
	     	 

	  "####################################### TARGET INPUT RELATIONS \n" +
	 
	 "IAssign(x:V,y:V) output \n" +
	 
	 "ILoadDot(x:V,y:V,f:F) output \n" +
	 	 

	 "IStoreDot(x:V,f:F,y:V) output \n" +

	 "IStoreDotWeak(x:V,f:F,y:V) output \n" +
	     
	 "IHStoreDot(l:L,f:F,y:L) output \n" +
	 
//	 "IHStoreDotWeak(l:L,f:F,y:L) output \n" +
	 
	 "IActualArg(f:V,i:I,x:V) output \n" +
	 
	 "IActualRet(f:V,y:V) output  \n" +
	     
	 "IActualArgArguments(f:V, l:L) output  \n" +
	     
	 "ICaller(l:L,x:V) output \n" +
   
	 
	 "IFThrow(l:L,x:V) output  \n" +
	 
	 "IFormalArg(l:L, i:I, x:V) output \n" +
	 
	 "IFormalArgArguments(G:L, x:V) output  \n" +
	 
	 
	  "IFormalRet(l:L,x:V) output  \n" +
	 
	 "INewObj(x:V,l:L) output \n" +
	 
	 "INewFunctionObj(x:V, l:L) output \n" +
	 
	 "INewArrayObj(x:V, l:L) output \n" +
	  
	 "IInstance(x:V,l:L,y:V) output \n" +
	 
	  "ICatchVar(l:L, x:V) output \n" +
	 
	 
	 "IActualArgCon(f:V,i:I,x:V,k:L) output \n" +
	 
	 "IActualRetCon(f:V,y:V,k:L) output  \n" +
	     
	 "ICallerCon(l:L,x:V,k:L) output \n" +

	 "IActualArgArgumentsCon(f:V, l:L, k:L) output  \n" +
    
         "IClone(F:L,i:I,G:L) output \n" +
	     
	 "IDup(F:L) output \n" +
	     
 	 "IAnnotation(f:F,g:F) output \n" +
	     
	 "IComplement(f:F,g:F) output \n" +
	    
	 "IIsAnnotationTag(f:F) output \n" +
	     
	 "ICallClonedIn(k:L) output \n" +
	 
	  "IVPtsTo(x:V,l:L) output \n" +
	 
	 "IHPtsTo(l:L,f:F,m:L) output \n" +
	 
	 "IFPtsTo(f:V,l:L) output \n" +

	 "IPrototype(l:L,m:L) output \n" +
	  
	 "IHActualArg(l:L, i:I, m:L) output \n" +
	 
	 "IHActualRet(l:L, y:V) output \n" +
	 
	 "IHCaller(l:L,m:L) output \n" +
	     
	 "IHActualEverything(l:L,i:I,m:L,x:V,G:L) output \n" +
	     
	 "IHActualEverythingCon(l:L,i:I,m:L,x:V,G:L,k:L) output \n" +
	     
	 "IFunctionType(l:L) output \n" + 
	     
	 "IArrayType(l:L) output \n" +
	     
	 "IObjectType(l:L) output \n" +
	 	     
	 " IFrozenObjStrong(F:L) output \n" +
	     
	 " IFrozenObjWeak(F:L) input \n" +
	     
	 " IPrecious(F:L) output \n" +
	     
	 " ICallClonedOut(k:L) input \n"  +
      
	 " R1(x:V,l:L) output \n" +
	     
	 " R2(x:V,l:L) output \n" +
	     
	 " R3(x:V,l:L) output \n" +

 	 " R4(x:V,l:L) output \n" +

         " R5(x:V,l:L) output \n" +
	     
	 "R6(x:V,l:L) output \n" +
	 
	 "R7(x:V,y:V,l:L) output \n" +
	     
	 "R8(x:V,y:V,l:L) output \n"+
	     
	 "R9(x:V,y:V,f:F,l:L,m:L) output \n"+
	     
	 "R10(x:V,y:V,f:F,l:L,m:L,n:L) output \n"+
	 
	 "R11(x:V,y:V,f:F,l:L,m:L) output \n" +

	 "R12(x:V,y:V,f:F,l:L,m:L) output \n"+

	 "R13(l:L,f:F,m:L) output \n"+

//	 "R14(l:L,f:F,m:L) output \n"+

	 "R15(l:L,m:L,n:L) output \n"+

	 "R16(l:L) output \n"+

	 "R17(f:F,g:F,l:L,m:L) output \n" +

	 "R18(f:F,g:F,h:F,l:L,m:L) output \n" +

	 "R19(x:V,y:V,f:F,g:F) output \n" +

	 "R20(x:V,y:V,f:F,g:F,h:F) output \n" +

	 "R21(x:V,y:V,f:F,g:F) output \n"  +

	 "R22(x:V,y:V,f:F,g:F,h:F) output \n" +

	 "R23(l:L,m:L,f:F,g:F,h:F) output \n"+
 
	 "R24(l:L,m:L,f:F,g:F,h:F) output \n" +

//	 "R25(l:L,m:L,f:F,g:F) output \n" +

//	 "R26(l:L,m:L,f:F,g:F,h:F) output \n" +

	 "R27(x:V,l:L) output \n" +
	     
	 "R28(x:V,y:V,f:V,l:L,m:L,k:L,G:L,i:I) output \n" +

	 "R29(x:V,l:L,m:L,n:L,k:L,G:L,i:I) output \n"+

	 "R30(x:V,l:L,m:L,k:L,G:L,i:I) output \n"+

	 "R31(x:V,l:L,m:L,k:L,G:L,i:I) output \n"+

	 "R32(x:V,l:L,m:L,G:L,i:I) output \n"+

	 "R33(x:V,l:L,m:L,G:L,i:I) output \n" +

	 "R34(x:V,l:L,m:L,G:L,i:I) output \n" +

	 "R35(x:V,l:L,m:L,G:L,i:I) output \n" +

	 "R36(x:V,y:V,l:L,G:L) output \n"  +

	 "R37(x:V,y:V,l:L,G:L) output \n"  +

	 "R38(x:V,l:L,G:L) output \n" +

	 "R39(l:L,n:L) output \n"+

	 "R40(x:V,y:V,l:L,m:L,n:L) output \n" +

	 "R41(x:V,y:V,l:L,m:L,n:L,q:L) output \n" +

	 "R43(y:V,f:V,m:L,k:L,i:I) output \n" +

	
	"######################################################### RULES \n"+
	 
	 genInverseRule("R1(x,l)","NewObj(x,l)",["VPtsTo(x,l)"]) +
	 
	 genInverseRule("R2(x,l)","NewFunctionObj(x,l)",["VPtsTo(x,l)"]) +
	 
	 genInverseRule("R3(x,l)","VPtsTo(x,l)", ["NewArrayObj(x,l)"]) +
	 
	genInverseRule("R4(x,l)","FunctionType(l)", ["NewFunctionObj(x,l)"]) +

	genInverseRule("R5(x,l)","ArrayType(l)", ["NewArrayObj(x,l)"]) +
	 
	 genInverseRule("R6(x,l)","ObjectType(l)", ["NewObj(x,l)"]) +

	 genInverseRule("R7(x,y,l)","VPtsTo(x,l)", ["Instance(x,l,y)"]) +
	 
	 genInverseRule("R8(x,y,l)","VPtsTo(x,l)", ["VPtsTo(y,l)","Assign(x,y)"]) +
	 
	 genInverseRule("R9(x,y,f,l,m)","VPtsTo(x,m)", ["LoadDot(x,y,f)","HPtsTo(l,f,m)","VPtsTo(y,l)"]) +
	 
	 genInverseRule("R10(x,y,f,l,m,n)","VPtsTo(x,n)", ["LoadDot(x,y,f)","Prototype(l,m)","HPtsTo(m,f,n)","VPtsTo(y,l)"]) +

	 genInverseRule("R11(x,y,f,l,m)","HPtsTo(l,f,m)", ["StoreDot(x,f,y)","VPtsTo(x,l)","VPtsTo(y,m)"]) +

	 genInverseRule("R12(x,y,f,l,m)","HPtsTo(l,f,m)", ["StoreDotWeak(x,f,y)","VPtsTo(x,l)","VPtsTo(y,m)","!FrozenObjWeak(l)"]) +
	 
	 genInverseRule("R13(l,f,m)","HPtsTo(l,f,m)", ["HStoreDot(l,f,m)"]) +

//	 genInverseRule("R14(l,f,m)","HPtsTo(l,f,m)", ["HStoreDotWeak(l,f,m)","!FrozenObjWeak(l)"]) +
	     
	 genInverseRule("R15(l,m,n)","Prototype(l,n)", ["Prototype(l,m)","Prototype(m,n)"]) +

	genInverseRule("R16(l)","FrozenObjWeak(l)", ["FrozenObjStrong(l)"]) +
	 
//	 genInverseRule("Annotation(f,"+annAll+")",[]) +

	 genInverseRule("R17(f,g,l,m)","HPtsTo(l,g,m)", ["HPtsTo(l,f,m)","Annotation(f,g)","!IsAnnotationTag(f)"]) +
	     
	 genInverseRule("R18(f,g,h,l,m)","HPtsTo(l,h,m)", ["HPtsTo(l,f,m)","Complement(g,h)","!Annotation(f,g)","!IsAnnotationTag(f)"]) +
	     
	 genInverseRule("R19(x,y,f,g)","StoreDot(x,f,y)", ["StoreDot(x,g,y)","Annotation(f,g)","!IsAnnotationTag(f)"]) +
	     
	 genInverseRule("R20(x,y,f,g,h)","StoreDot(x,f,y)", ["StoreDot(x,h,y)","Complement(g,h)","!Annotation(f,g)","!IsAnnotationTag(f)"]) +	     

	 genInverseRule("R21(x,y,f,g)","StoreDotWeak(x,f,y)", ["StoreDotWeak(x,g,y)","Annotation(f,g)","!IsAnnotationTag(f)"]) +
	     
	 genInverseRule("R22(x,y,f,g,h)","StoreDotWeak(x,f,y)", ["StoreDotWeak(x,h,y)","!Annotation(f,g)","Complement(g,h)","!IsAnnotationTag(f)"]) +
	     
	 genInverseRule("R23(l,m,f,g,h)","HStoreDot(l,f,m)", ["HStoreDot(l,g,m)","Annotation(f,g)","!IsAnnotationTag(f)"]) +
	     
	 genInverseRule("R24(l,m,f,g,h)","HStoreDot(l,f,m)", ["HStoreDot(l,h,m)","Complement(g,h)","!Annotation(f,g)","!IsAnnotationTag(f)"]) +
	     
//	 genInverseRule("R25(l,m,f,g)","HStoreDotWeak(l,f,m)", ["HStoreDotWeak(l,g,m)","Annotation(f,g)","!IsAnnotationTag(f)"]) +
	     
//	 genInverseRule("R26(l,m,f,g,h)","HStoreDotWeak(l,f,m)", ["HStoreDotWeak(l,h,m)","!Annotation(f,g)","Complement(g,h)","!IsAnnotationTag(f)"]) +
	 	 
	 genInverseRule("R27(x,l)","FPtsTo(x,l)", ["FunctionType(l)","VPtsTo(x,l)"]) +
	     
	 genInverseRule("R28(x,y,f,l,m,k,G,i)","HActualEverythingCon(l,i,m,x,G,k)", ["ActualArgCon(f,i,y,k)","FPtsTo(f,l)","VPtsTo(y,m)","ActualRetCon(f,x,k)","CallerCon(G,f,k)"]) +
	     // f:V here
	 genInverseRule("R29(x,l,m,n,k,G,i)","HActualEverything(n,i,m,x,G)", ["HActualEverythingCon(l,i,m,x,G,k)","CallClonedIn(k)","Clone(l,1,n) "]) +
	     
	 genInverseRule("R30(x,l,m,k,G,i)","HActualEverything(l,i,m,x,G)", ["HActualEverythingCon(l,i,m,x,G,k)","CallClonedIn(k)","Dup(l) "]) +

	 genInverseRule("R31(x,l,m,k,G,i)","HActualEverything(l,i,m,x,G)", ["HActualEverythingCon(l,i,m,x,G,k)","!CallClonedIn(k)"]) +

	 genInverseRule("R32(x,l,m,G,i)", "HActualArg(l,i,m)", ["HActualEverything(l,i,m,x,G)"]) +
	     
	genInverseRule("R33(x,l,m,G,i)","HActualRet(l,x)", ["HActualEverything(l,i,m,x,G)"]) +
	     
	genInverseRule("R34(x,l,m,G,i)","HCaller(G,l)", ["HActualEverything(l,i,m,x,G)"]) +

	 genInverseRule("R35(x,l,m,G,i)","VPtsTo(x,m)", ["HCaller(G,l)","HActualArg(l,i,m)","FormalArg(l,i,x)"]) +
	     
	 genInverseRule("R36(x,y,l,G)","Assign(y,x)", ["HCaller(G,l)","HActualRet(l,y)","FormalRet(l,x)"]) +
	     	 
	 genInverseRule("R37(x,y,l,G)","Assign(x,y)", ["HCaller(G,l)","CatchVar(G,x)","FThrow(l,y)"]) + 
	 
	 genInverseRule("R38(x,l,G)","FThrow(G,x)", ["HCaller(G,l)","FThrow(l,x)"]) +
	 
	 genInverseRule("R40(x,y,l,m,n)","Prototype(l,n)", ["Instance(x,l,y)","VPtsTo(y,m)","HPtsTo(m,"+ prototypeNum +",n)"]) +
	 
	 genInverseRule("R41(x,y,l,m,n,q)","Prototype(l,q)", ["Instance(x,l,y)","VPtsTo(y,m)","Prototype(m,n)","HPtsTo(n,"+ prototypeNum +",q)"]) +
	     
	 genInverseRule("R43(y,f,m,k,i)","CallClonedOut(k)", ["ActualArgCon(f,i,y,k)","VPtsTo(y,m)","Precious(m)"]);
	 // f:V here

	 return constraint;
     }
     
     return genConstraints();
 }

 
