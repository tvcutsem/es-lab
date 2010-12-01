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

/*
This is the root module which calls all other modules.
*/

var Mparser = require('../../../../site/esparser/bundle.js');
var Mrender = require('../../render.js');
var MthreeOp = require('./threeOpForm.js');
var McontrolStrip = require('./controlStrip.js');
var MscopeNumber = require('./scopeNumbering.js');
var MrenameClone = require('./renameClone.js');
var MdAnalysis = require('./datalogAnalysis.js');
var MdRules = require('./datalogRules.js');
var MdField = require('./datalogFieldNames.js');
var MdNative = require('./nativeDatalog.js');
var MdGlobalVar = require('./globalVarDatalog.js');
var MdPrecious = require('./preciousDatalog.js');
var MdAttacker = require('./attackerDatalog.js');
var MdDOM = require('./domDatalog.js');
//var MdSu = require('./suDatalog.js');
var MdAnnotationsAdsafe = require('./annotationsAdsafe.js');
var fs = require('fs')




 var functionClones; 
 // will be used as both a collection of ast numbers of functions present in 
 //code and also as mapping from ast numbers to their appropriate clone sets.
 var maxArity = 3;
 var nClones = 1; 
 var encodeVar, encodeLoc, encodeField ;
 var decodeVar, decodeLoc, decodeField ;
 var getNextTempVar ;
 var getNextAstNumber ;
 var astNumberMap ;
 var dupAstNum;
 var getEncoderLocCount; 
 var getEncoderVarCount;
 var getEncoderFieldCount;
 var toGlobalVar = [];
 var toGlobalField = [];
var  annotationsObj = MdAnnotationsAdsafe.annotationsObj;
  
 function makeEncoderDecoderVar(){
     var strToNum = {};
     var numToStr = {};
     
     var count = 1;
     
     function encode(s){
	 // console.log(numToStr);
	 // console.log(strToNum);

	 var temp = '_$_' + s;

	 if (strToNum.hasOwnProperty(temp)){
	     // console.log(strToNum[temp]);
	     return strToNum[temp];
             }
         else{
	     if(s.search('_0_') >= 0){
		 var t = s.search('_0_');
		 toGlobalField.push([s,s.slice(0,t)]);
		 toGlobalVar.push([s.slice(0,t),s]);
	     }
             strToNum[temp] = count;
             numToStr[count] = s;
             count = count +1;
	     //  console.log(strToNum[temp]);
             return strToNum[temp];
         }
     }
     function decode(n){
	 // console.log(numToStr);
	 // console.log(strToNum);
	 // console.log(numToStr);
         if (numToStr.hasOwnProperty(n)){
             return numToStr[n];
         }
         else{
             throw 'decode - not an encoded number ' + n;
         }
     }
     
     function getEncoderCount(){
	 return count;
     }
     
     return [encode,decode, getEncoderCount];
 }
 

 function makeEncoderDecoderField(){
     var strToNum = {};
     var numToStr = {};
     
     var count = 1;
     
     function encode(s){
	 // console.log(numToStr);
	 // console.log(strToNum);
	 var temp = '_$_' + s;
	 if (strToNum.hasOwnProperty(temp)){
	     // console.log(strToNum[temp]);
	     return strToNum[temp];
             }
         else{
	     toGlobalVar.push([s,s+'_0_1']);
	     toGlobalField.push([s+'_0_1',s]);
             strToNum[temp] = count;
             numToStr[count] = s;
             count = count +1;
	     //  console.log(strToNum[temp]);
	    // console.log('toGlobalVar Field = ' + s +  ' ' + s+'_0_1' +  ' ' + strToNum[temp]);
             return strToNum[temp];
         }
     }
     function decode(n){
	 // console.log(numToStr);
	 // console.log(strToNum);
	 // console.log(numToStr);
         if (numToStr.hasOwnProperty(n)){
             return numToStr[n];
         }
         else{
             throw 'decode - not an encoded number ' + n;
         }
     }
     
     function getEncoderCount(){
	 return count;
     }
     
     return [encode,decode, getEncoderCount];
 }

function makeEncoderDecoderLoc(){
     var strToNum = {};
     var numToStr = {};
     
     var count = 1;
     
     function encode(s){
	 // console.log(numToStr);
	 // console.log(strToNum);
	
	 var temp = '_$_' + s;
	 if (strToNum.hasOwnProperty(temp)){
	     // console.log(strToNum[temp]);
	     return strToNum[temp];
         }
         else{
	     
             strToNum[temp] = count;
             numToStr[count] = s;
             count = count +1;
	     //  console.log(strToNum[temp]);
             return strToNum[temp];
         }
	 
     }
     function decode(n){
	 // console.log(numToStr);
	 // console.log(strToNum);
	 // console.log(numToStr);
         if (numToStr.hasOwnProperty(n)){
             return numToStr[n];
         }
         else{
             throw 'decode - not an encoded number ' + n;
         }
     }
     
     function getEncoderCount(){
	 return count;
     }
     
     return [encode,decode, getEncoderCount];
 }
 
 
function makeEncoderDecoderCon(){
     var strToNum = {};
     var numToStr = {};
     
     var count = 1;
     
     function encode(s){
	 // console.log(numToStr);
	 // console.log(strToNum);
	
	 var temp = '_$_' + s;
	 if (strToNum.hasOwnProperty(temp)){
	     // console.log(strToNum[temp]);
	     return strToNum[temp];
         }
         else{
	     
             strToNum[temp] = count;
             numToStr[count] = s;
             count = count +1;
	     //  console.log(strToNum[temp]);
             return strToNum[temp];
         }
	 
     }
     function decode(n){
	 // console.log(numToStr);
	 // console.log(strToNum);
	 // console.log(numToStr);
         if (numToStr.hasOwnProperty(n)){
             return numToStr[n];
         }
         else{
             throw 'decode - not an encoded number ' + n;
         }
     }
     
     function getEncoderCount(){
	 return count;
     }
     
     return [encode,decode, getEncoderCount];
 }
 
 function relName(rel){
     switch(rel){
     case 'assign':
	 return 'Assign' ;

     case 'storeDotStrong':
	 return 'StoreDotStrong';
     case 'storeDot':
	 return 'StoreDot';
     case 'storeDotWeak':
	 return 'StoreDotWeak';
	 
     case 'storeBoxStrong':
	 return 'StoreBoxStrong';
     case 'storeBox':
	 return 'StoreBox';
     case 'storeBoxWeak':
	 return 'StoreBoxWeak';

     case 'hstoreDotStrong':
	 return 'HStoreDotStrong';
     case 'hstoreDot':
	 return 'HStoreDot';
     case 'hstoreDotWeak':
	 return 'HStoreDotWeak';
	 
     case 'hstoreBoxStrong':
	 return 'HStoreBoxStrong';
     case 'hstoreBox':
	 return 'HStoreBox';
     case 'hstoreBoxWeak':
	 return 'HStoreBoxWeak';
     case 'loadDot':
	 return 'LoadDot';
     case 'loadBox':
	 return 'LoadBox';
     case 'actualArg':
	 return 'ActualArg';
     case 'actualRet':
	 return 'ActualRet';
     case 'caller':
	 return 'Caller';
     case 'callerCon':
	 return 'CallerCon';
     case 'actualArgArguments':
	 return 'ActualArgArguments';
     case 'actualArgArgumentsCon':
	 return 'ActualArgArgumentsCon';
     case 'actualArgCon':
	 return 'ActualArgCon';
     case 'actualRetCon':
	 return 'ActualRetCon';
     case 'fThrow':
	 return 'FThrow';
     case 'formalArg':
	 return 'FormalArg';
     case 'formalRet':
	     return 'FormalRet';
     case 'prototype':
	 return 'Prototype';
     case 'newObj':
	 return 'NewObj';
     case 'newFunctionObj':
	 return 'NewFunctionObj';
     case 'newArrayObj':
	 return 'NewArrayObj';
     case 'newPrimObj':
	 return 'NewPrimObj';
     case 'instance':
	 return 'Instance';
     case 'catchVar':
	 return 'CatchVar';
     case 'newObjNoProto':
	 return 'NewObjNoProto';
     case 'aPtsTo':
	 return 'APtsTo';
     case 'vPtsTo':
	 return 'VPtsTo';
     case 'hPtsTo':
	 return 'HPtsTo';
     case 'fPtsTo':
	 return 'FPtsTo';
     case 'callTarget':
	 return 'CallTarget';
     case 'hCaller':
	 return 'HCaller';
     case 'hActualArg':
	 return 'HActualArg';
     case 'hActualRet':
	 return 'HActualRet'; 
     case 'hActualArguments':
	 return 'HActualArguments';
     case 'hCallerCon':
	 return 'HCallerCon';
     case 'hActualArgCon':
	 return 'HActualArgCon';
     case 'hActualRetCon':
	 return 'HActualRetCon'; 
     case 'hActualArgumentsCon':
	 return 'HActualArgumentsCon';
     case 'actualArgAll':
	 return 'ActualArgAll'; 
     case 'actualArgAllCon':
	 return 'ActualArgAllCon'; 
     case 'formalArgArguments': 
	 return 'FormalArgArguments';
     case 'objectType':
	 return 'ObjectType';
     case 'functionType':
	 return 'FunctionType';
     case 'arrayType':
	 return 'ArrayType';
     case 'primType':
	 return 'PrimType';
     case 'seal':
	 return 'Seal';
     case 'unseal':
	 return 'Unseal';
     case 'sealVar':
	 return 'SealVar';
     case 'calls':
	 return 'Calls';
     case 'prototype':
	 return 'Prototype';
     case 'clone':
	 return 'Clone';
     case 'dup':
	 return 'Dup';
     case 'aActualPtsTo':
	 return 'AActualPtsTo';
     case 'frozenObjStrong':
	 return 'FrozenObjStrong';
     case 'frozenObjWeak':
	 return 'FrozenObjWeak';
     case 'disallowed':
	 return 'Disallowed';
     case 'annotation':
	 return 'Annotation';
     case 'isAnnotationTag':
	 return 'IsAnnotationTag';
     case 'complement':
	 return 'Complement';
     case 'hActualEverything':
	 return 'HActualEverything';
     case 'hActualEverythingCon':
	 return 'HActualEverythingCon';
     case 'precious':
	 return 'Precious';
     case 'callClonedIn':
	 return 'CallClonedIn';
     case 'callClonedOut':
	 return 'CallClonedOut';
     case 'toGlobalVar':
	 return 'ToGlobalVar';
     case 'toGlobalField':
	 return 'ToGlobalField';
	 
     default:
	 throw 'relName - not a valid relation name ' + rel; 
     }
 }
 
 function makeConstraint(rel, args){
     var len = 0;
     var i = 0;
     var retConstraint = "";
     switch(rel){
     case 'assign':
	 retConstraint = relName(rel) +"(";
	 retConstraint = retConstraint + encodeVar(args[0]) +', ';
	 retConstraint = retConstraint + encodeVar(args[1]);
	 retConstraint = retConstraint +")";
	 break;
     case 'storeDot':case 'storeDotStrong':case 'storeDotWeak':
	 retConstraint = relName(rel) +"(";
	 retConstraint = retConstraint + encodeVar(args[0]) +', ';
	 retConstraint = retConstraint + encodeField(args[1]) + ', ';
	 retConstraint = retConstraint + encodeVar(args[2]);
	 retConstraint = retConstraint +")";
	 break;
     case 'storeBox':case 'storeBoxStrong':case 'storeBoxWeak':
	 retConstraint = relName(rel) +"(";
	 retConstraint = retConstraint + encodeVar(args[0]) +', ';
	 retConstraint = retConstraint + encodeVar(args[1]);
	 retConstraint = retConstraint +")";
	 break;
	
     case 'hstoreDot':case 'hstoreDotStrong':case 'hstoreDotWeak':
	 retConstraint = relName(rel) +"(";
	 retConstraint = retConstraint + encodeLoc(args[0]) +', ';
	 retConstraint = retConstraint + encodeField(args[1]) +', ';
	 retConstraint = retConstraint + encodeLoc(args[2]);
	 retConstraint = retConstraint +")";
	 break;
	
     case 'hstoreBox': case 'hstoreBoxStrong': case 'hstoreBoxWeak':
	 retConstraint = relName(rel) +"(";
	 retConstraint = retConstraint + encodeLoc(args[0]) +', ';
	 retConstraint = retConstraint + encodeVar(args[1]);
	 retConstraint = retConstraint  +")";
	 break;
	 
     case 'loadDot':
 	 retConstraint = relName(rel) +"(";
	 retConstraint = retConstraint + encodeVar(args[0]) +', ';
	 retConstraint = retConstraint + encodeVar(args[1]) +', ';
	 retConstraint = retConstraint + encodeField(args[2]);
	 retConstraint = retConstraint  +")";
	 break;
     case 'loadBox':
	 retConstraint = relName(rel) +"(";
	 retConstraint = retConstraint + encodeVar(args[0]) +', ';
	 retConstraint = retConstraint + encodeVar(args[1]);
	 retConstraint = retConstraint  +")";
	 break;
	 
	     
     case 'actualArg':
	 retConstraint = relName(rel) +"(";
	 retConstraint = retConstraint + encodeVar(args[0]) +', ';
	 retConstraint = retConstraint + args[1] +', ';
	 retConstraint = retConstraint + encodeVar(args[2]);
	 retConstraint =  retConstraint +")";
	
	 break;
      case 'actualArgCon':
	 retConstraint = relName(rel) +"(";
	 retConstraint = retConstraint + encodeVar(args[0]) +', ';
	 retConstraint = retConstraint + args[1] +', ';
	 retConstraint = retConstraint + encodeVar(args[2]) +', ';
	 retConstraint = retConstraint + encodeCon(args[3]);
	 retConstraint =  retConstraint  +")";
	 break;
     case 'actualRet':
	 retConstraint = relName(rel) +"(";
	 retConstraint = retConstraint + encodeVar(args[0]) +', ';
	 retConstraint = retConstraint + encodeVar(args[1]);
	 retConstraint =  retConstraint  +")";
	 break;
	 
     case 'actualRetCon':
	 retConstraint = relName(rel) +"(";
	 retConstraint = retConstraint + encodeVar(args[0]) +', ';
	 retConstraint = retConstraint + encodeVar(args[1]) +', ';
	 retConstraint = retConstraint + encodeCon(args[2]);
	 retConstraint =  retConstraint  +")";
	 break;
	   
     case 'fThrow':
	 retConstraint = relName(rel) +"(";
	 retConstraint = retConstraint + encodeLoc(args[0]) +', ';
	 retConstraint = retConstraint + encodeVar(args[1]);
	 retConstraint =  retConstraint + ")";
	 break;
	 
     case 'formalArg':
	 retConstraint = relName(rel) +"(";
	 retConstraint = retConstraint + encodeLoc(args[0]) +', ';
	 retConstraint = retConstraint + args[1] +', ';
	 retConstraint = retConstraint + encodeVar(args[2]);
	 retConstraint =  retConstraint +")";
	 break;
     case 'formalRet':
	 retConstraint = relName(rel) +"(";
	 retConstraint = retConstraint + encodeLoc(args[0]) +', ';
	 retConstraint = retConstraint + encodeVar(args[1]);
	 retConstraint =retConstraint  +")";
	 break;
	 
     case 'newObj': case 'newFunctionObj': case 'newArrayObj': case 'newPrimObj':
	  retConstraint = relName(rel) +"(";
	 retConstraint = retConstraint + encodeVar(args[0]) +', ';
	 retConstraint = retConstraint + encodeLoc(args[1]);
	 retConstraint = retConstraint +")";
	 break;
	
     case 'caller':
	 retConstraint = relName(rel) +"(";
	 retConstraint = retConstraint + encodeLoc(args[0]) +', ';
	 retConstraint = retConstraint + encodeVar(args[1]);
	 retConstraint = retConstraint +")";
	 break;
     case 'calls':
	 retConstraint = relName(rel) +"(";
	 retConstraint = retConstraint + encodeLoc(args[0]) +', ';
	 retConstraint = retConstraint + encodeLoc(args[1]);
	 retConstraint = retConstraint +")";
	 break;
     case 'callerCon':
	 retConstraint = relName(rel) +"(";
	 retConstraint = retConstraint + encodeLoc(args[0]) +', ';
	 retConstraint = retConstraint + encodeVar(args[1]) +', ';
	 retConstraint = retConstraint + encodeCon(args[2]);
	 retConstraint = retConstraint +")";
	 break;
     case 'functionType': case 'objectType' : case 'arrayType': case 'primType': case 'frozenObjWeak': case 'frozenObjStrong':
	 retConstraint = relName(rel) +"(";
	 retConstraint = retConstraint + encodeLoc(args[0]);
	 retConstraint = retConstraint +")";
	 break;
	
     case 'instance':
	 retConstraint = relName(rel) +"(";
	 retConstraint = retConstraint + encodeVar(args[0]) +', ';
	 retConstraint = retConstraint + encodeLoc(args[1]) +', ';
	 retConstraint = retConstraint + encodeVar(args[2]);
	 retConstraint = retConstraint +")";
	 break;
	 
     case 'catchVar':
	 retConstraint = relName(rel) +"(";
	 retConstraint = retConstraint + encodeLoc(args[0]) +', ';
	 retConstraint = retConstraint + encodeVar(args[1]);
	 retConstraint = retConstraint +")";
	 break;
	
     case 'aPtsTo':  case 'aActualPtsTo':
	 retConstraint = relName(rel) +"(";
	 retConstraint = retConstraint + encodeLoc(args[0]);
	 retConstraint = retConstraint +")";
	 break;

     case 'vPtsTo':
	  retConstraint = relName(rel) +"(";
	 retConstraint = retConstraint + encodeVar(args[0]) +', ';
	 retConstraint = retConstraint + encodeLoc(args[1]);
	 retConstraint = retConstraint +")";
	 break;
	 
     case 'hPtsTo':
	  retConstraint = relName(rel) +"(";
	 retConstraint = retConstraint + encodeLoc(args[0]) +', ';
	 retConstraint = retConstraint + encodeField(args[1]) +', ';
	 retConstraint = retConstraint + encodeLoc(args[2]);
	 retConstraint = retConstraint +")";
	 break;
	
     case 'fPtsTo':
	  retConstraint = relName(rel) +"(";
	 retConstraint = retConstraint + encodeVar(args[0]) +', ';
	 retConstraint = retConstraint + encodeLoc(args[1]);
	 retConstraint = retConstraint +")";
	 break;
	
     case 'callTarget':
	  retConstraint = relName(rel) +"(";
	 retConstraint = retConstraint + encodeVar(args[0]) +', ';
	 retConstraint = retConstraint + encodeLoc(args[1]);
	 retConstraint = retConstraint +")";
	 break;

     case 'hCaller':
	  retConstraint = relName(rel) +"(";
	 retConstraint = retConstraint + encodeLoc(args[0]) +', ';
	 retConstraint = retConstraint + encodeLoc(args[1]);
	 retConstraint =retConstraint  +")";
	 break;

     case 'hActualArg':
	  retConstraint = relName(rel) +"(";
	 retConstraint = retConstraint + encodeLoc(args[0]) +', ';
	 retConstraint = retConstraint + args[1] +', ';
	 retConstraint = retConstraint + encodeLoc(args[2]);
	 retConstraint = retConstraint +")";
	 break;
	
     case 'hActualRet':
	 retConstraint = relName(rel) +"(";
	 retConstraint = retConstraint + encodeLoc(args[0]) +', ';
	 retConstraint = retConstraint + encodeVar(args[1]);
	 retConstraint = retConstraint +")";
	 break;
     case 'hActualArgArguments':
	 retConstraint = relName(rel) +"(";
	 retConstraint = retConstraint + encodeLoc(args[0]) +', ';
	 retConstraint = retConstraint + encodeLoc(args[1]);
	 retConstraint = retConstraint +")";
	 break;
     case 'hActualArgAll':
	 retConstraint = relName(rel) +"(";
	 retConstraint = retConstraint + encodeLoc(args[0]) +', ';
	 retConstraint = retConstraint + encodeLoc(args[1]);
	 retConstraint = retConstraint +")";
	 break;	 

     case 'hCallerCon':
	  retConstraint = relName(rel) +"(";
	 retConstraint = retConstraint + encodeLoc(args[0]) +', ';
	 retConstraint = retConstraint + encodeLoc(args[1]) + ', ';
	 retConstraint = retConstraint + encodeCon(args[2]);

	 retConstraint =retConstraint  +")";
	 break;

     case 'hActualArgCon':
	  retConstraint = relName(rel) +"(";
	 retConstraint = retConstraint + encodeLoc(args[0]) +', ';
	 retConstraint = retConstraint + args[1] +', ';
	 retConstraint = retConstraint + encodeLoc(args[2])+ ', ';
	 retConstraint = retConstraint + encodeCon(args[3]);
	 retConstraint = retConstraint +")";
	 break;
	
     case 'hActualRetCon':
	 retConstraint = relName(rel) +"(";
	 retConstraint = retConstraint + encodeLoc(args[0]) +', ';
	 retConstraint = retConstraint + encodeVar(args[1])+ ', ';
	 retConstraint = retConstraint + encodeCon(args[2]);
	 retConstraint = retConstraint +")";
	 break;
     case 'hActualArgArgumentsCon':
	 retConstraint = relName(rel) +"(";
	 retConstraint = retConstraint + encodeLoc(args[0]) +', ';
	 retConstraint = retConstraint + encodeLoc(args[1])+ ', ';
	 retConstraint = retConstraint + encodeCon(args[2]);
	 retConstraint = retConstraint +")";
	 break;
     case 'hActualArgAllCon':
	 retConstraint = relName(rel) +"(";
	 retConstraint = retConstraint + encodeLoc(args[0]) +', ';
	 retConstraint = retConstraint + encodeLoc(args[1])+ ', ';
	 retConstraint = retConstraint + encodeCon(args[2]);
	 retConstraint = retConstraint +")";
	 break;	 
	
     case 'formalArgArguments': 
	 retConstraint = relName(rel) +"(";
	 retConstraint = retConstraint + encodeLoc(args[0]) +', ';
	 retConstraint = retConstraint + encodeVar(args[1]);
	 retConstraint = retConstraint +")";
	 break;
     case 'actualArgArguments':
	 retConstraint = relName(rel) +"(";
	 retConstraint = retConstraint + encodeVar(args[0]) +', ';
	 retConstraint = retConstraint + encodeLoc(args[1]);
	 retConstraint = retConstraint +")";
	 break;
	
    case 'actualArgArgumentsCon':
	  retConstraint = relName(rel) +"(";
	 retConstraint = retConstraint + encodeVar(args[0]) +', ';
	 retConstraint = retConstraint + encodeLoc(args[1]) +', ';
	 retConstraint = retConstraint + encodeCon(args[2]);
	 retConstraint = retConstraint +")";
	 break;

     case 'actualArgAll':
	 retConstraint = relName(rel) +"(";
	 retConstraint = retConstraint + encodeVar(args[0]) +', ';
	 retConstraint = retConstraint + encodeVar(args[1]);
	 retConstraint = retConstraint +")";
	 break;
	
     case 'actualArgAllCon':
	  retConstraint = relName(rel) +"(";
	 retConstraint = retConstraint + encodeVar(args[0]) +', ';
	 retConstraint = retConstraint + encodeVar(args[1]) +', ';
	 retConstraint = retConstraint + encodeCon(args[2]);
	 retConstraint = retConstraint +")";
	 break;
	
     case 'seal': case 'unseal': 
	 retConstraint = relName(rel) +"(";
	 retConstraint = retConstraint + encodeLoc(args[0]);
	 retConstraint = retConstraint +")";
	 break;
     case 'sealVar':
	 retConstraint = relName(rel) +"(";
	 retConstraint = retConstraint + encodeVar(args[0]);
	 retConstraint = retConstraint +")";
	 break;
	
     case 'prototype':
	 retConstraint = relName(rel) +"(";
	 retConstraint = retConstraint + encodeLoc(args[0]) +', ';
	 retConstraint = retConstraint + encodeLoc(args[1]);
	 retConstraint = retConstraint +")";
	 break;
	
     case 'clone':
	  retConstraint = relName(rel) +"(";
	 retConstraint = retConstraint + encodeLoc(args[0]) +', ';
	 retConstraint = retConstraint + args[1] +', ';
	 retConstraint = retConstraint + encodeLoc(args[2]);
	 retConstraint = retConstraint +")";
	 break;
	
     case 'dup':
	 retConstraint = relName(rel) +"(";
	 retConstraint = retConstraint + encodeLoc(args[0]);
	 retConstraint = retConstraint +")";
	 break;
     case 'disallowed':
	  retConstraint = relName(rel) +"(";
	 retConstraint = retConstraint + encodeField(args[0]);
	 retConstraint = retConstraint +")";
	 break;
     case 'annotation':
	 retConstraint = relName(rel) +"(";
	 retConstraint = retConstraint + encodeField(args[0]) + ' , ' ;
	 retConstraint = retConstraint + encodeField(args[1]);
	 retConstraint = retConstraint +")";
	 break;
     case 'isAnnotationTag':
	 retConstraint = relName(rel) +"(";
	 retConstraint = retConstraint + encodeField(args[0]);
	 retConstraint = retConstraint +")";
	 break;
     case 'complement':
	 retConstraint = relName(rel) +"(";
	 retConstraint = retConstraint + encodeField(args[0]) + ' , ';
	 retConstraint = retConstraint + encodeField(args[1]);
	 retConstraint = retConstraint +")";
	 break;
     case 'precious':
	 retConstraint = relName(rel) + "(";
	 retConstraint = retConstraint + encodeLoc(args[0]);
	 retConstraint = retConstraint + ")";
	 break;
     case 'callClonedIn':
	 retConstraint = relName(rel) + "(";
	 retConstraint = retConstraint + encodeCon(args[0]);
	 retConstraint = retConstraint + ")";
	 break;
     case 'callClonedOut':
	 retConstraint = relName(rel) + "(";
	 retConstraint = retConstraint + encodeCon(args[0]);
	 retConstraint = retConstraint + ")";
	 break;
     case 'toGlobalVar':
	 retConstraint = relName(rel) + "(";
	 retConstraint = retConstraint + encodeField(args[0]) + ' , ';
	 retConstraint = retConstraint + encodeVar(args[1]);
	 retConstraint = retConstraint + ")";
	 break;
     case 'toGlobalField':
	 retConstraint = relName(rel) + "(";
	 retConstraint = retConstraint + encodeVar(args[0]) + ' , ';
	 retConstraint = retConstraint + encodeField(args[1]);
	 retConstraint = retConstraint + ")";
	 break;

     default:   throw 'makeConstraint - not a valid relation name ' + rel; 
     }
    
     return retConstraint;
 }
 
 function makeGetNextTempVar(){
     var tempVarName = "$$";
     var tempVarCount = 1;
     
     function getNextTempVar(){
         var ret = tempVarName + tempVarCount;
	 tempVarCount = tempVarCount + 1;
         return ret;
     }
     return getNextTempVar;
 }
 
 function numberMaker(){
     var nextNum = 0;
     
     return function(){
	 var oldNum = nextNum
	 nextNum = nextNum + 1;
	 return oldNum;
     }
 }
 
 function initDatalogAnalysis(){     
     encoderDecoderVar = makeEncoderDecoderVar();
     encodeVar = encoderDecoderVar[0];
     decodeVar = encoderDecoderVar[1];
     getEncoderVarCount = encoderDecoderVar[2];

     encoderDecoderField = makeEncoderDecoderField();
     encodeField = encoderDecoderField[0];
     decodeField = encoderDecoderField[1];
     getEncoderFieldCount = encoderDecoderField[2];

 //    encodeField = encodeVar;
  //   decodeField = decodeVar;
  //   getEncoderFieldCount = getEncoderVarCount;


     encoderDecoderLoc = makeEncoderDecoderLoc();
     encodeLoc = encoderDecoderLoc[0];
     decodeLoc = encoderDecoderLoc[1];
     getEncoderLocCount = encoderDecoderLoc[2];

  //   encoderDecoderCon = makeEncoderDecoderCon();
  //   encodeCon = encoderDecoderCon[0];
  //   decodeCon = encoderDecoderCon[1];
  //   getEncoderConCount = encoderDecoderCon[2];

     encodeCon = encodeLoc;
     decodeCon = decodeLoc;
     getEncoderConCount = getEncoderLocCount;

     getNextTempVar = makeGetNextTempVar();
     getNextAstNumber = numberMaker();
     astNumberMap = {}; 
     functionClones = {};
     dupAstNum ={};
     toGlobalVar = [];
     toGlobalField = [];
 } 


Object.prototype.toString = 
    function(){
        var res;
        res = "{";
        for (p in this){
            res = res + p + ": "+  this[p] + ","; 
        }
        if(res[res.length-1] === ","){
            res = res.slice(0,res.length-1);
        }
        res = res + "}";
        return res;
    }
    
    Array.prototype.toString = 
    function(){
        var res;
        var len = this.length;
        var i = 0;
        res = "[";
        for (i =0; i < len; i++){
            res = res + this[i].toString() + ","; 
        }
	if(res[res.length-1] === ","){
               res = res.slice(0,res.length-1);
        }		 
        res = res + "]";
        return res;
    }
    
    function copyArray(inArr){
	// Note that this is a shallow copy !
	var outArr = [];
	var i = 0;
	for (i = 0; i < inArr.length;i++){
	    outArr.push(inArr[i]);
	}
	return outArr;
    }
    
    
    function renderThreeOpAst(text){
	var ast = Mparser.ES5Parser.matchAll(text, 'Program', [], function () {});
	var threeOpAst = MthreeOp.threeOpEcmascript(ast, getNextTempVar)
	return threeOpAst;
    }
    function renderControlStripAst(text){
	var controlStripAst = McontrolStrip.controlStripThreeOp(renderThreeOpAst(text))
	return controlStripAst;
    }
    
    function renderScopeNumberAst(text){
	var scopeNumberAst = scopeNumberControlStrip(renderControlStripAst(text),getNextAstNumber, astNumberMap)
	return scopeNumberAst;
    }
    
    function renderRenameCloneAst(text){
	var renameCloneAst = renameCloneControlStrip(renderControlStripAst(text),getNextAstNumber, astNumberMap)
	return renameCloneAst;
    }
   
   function renderDatalog(text,freezeProtoFlag, cloneNativeFlag, cloneDOMFlag,cloneUserFlag, callSiteConstraints, attackerFlag){ 
       initDatalogAnalysis();
       var i;
       var toBeCloned;
       var ast, threeOpAst, controlStripAst, scopeNumberAst, renameCloneAst;
       var result = "";
       Mparser.ES5Parser.generatePositionInfo = true;
       ast = Mparser.ES5Parser.matchAll(text, 'Program', [], function () {});
       console.log('Parsing done');
       threeOpAst = MthreeOp.threeOpEcmascript(ast, getNextTempVar);
       console.log('ThreeOp Conversion done');
       controlStripAst = McontrolStrip.controlStripThreeOp(renderThreeOpAst(text));
       console.log('ControlStrip conversion done');
       renameCloneAst = MrenameClone.renameCloneControlStrip(controlStripAst,getNextAstNumber, astNumberMap, functionClones, nClones, maxArity); 
       console.log('Scope Numbering done');
   /*    if(cloneUserFlag === 2){
	   toBeCloned = functionClones;
      }
       else if(cloneUserFlag === 1){
    	   toBeCloned = {};
	   for(i = 0 ; i< aPointsTo.length;i++){
	       //TODO : Handle Sealer and Unsealer case here (just like isDOM)
	       if((aPointsTo[i][0][0] === 'F') && (aPointsTo[i].isDOM !== 1)){
		   toBeCloned[aPointsTo[i].num] = 1;
	       }
	   }
       }
       else{
	   toBeCloned = {};
       }
*/
       if(cloneUserFlag === 1){
	      toBeCloned = functionClones;
       }
       else{
	   toBeCloned = {};
       }

       var datalogRules = MdRules.genDatalogRules( encodeVar, encodeField, encodeLoc,encodeCon, getNextTempVar, getNextAstNumber, astNumberMap, relName, makeConstraint, functionClones, nClones, maxArity );
       var nativeConstraints = MdNative.genNativeConstraints(cloneNativeFlag,freezeProtoFlag, encodeVar, encodeField, encodeLoc, encodeCon, getNextTempVar, getNextAstNumber, astNumberMap, relName, makeConstraint, functionClones, nClones, maxArity);			 
       var domConstraints = MdDOM.genDOMConstraints(cloneDOMFlag,encodeVar, encodeField, encodeLoc, encodeCon, getNextTempVar, getNextAstNumber, astNumberMap, relName, makeConstraint, functionClones, nClones, maxArity);
       var preciousConstraints = MdPrecious.genPreciousConstraints(encodeVar, encodeField, encodeLoc,encodeCon);
       var codeConstraints = MdAnalysis.genConstraintsScopeNumber(renameCloneAst,annotationsObj,encodeVar, encodeField, encodeLoc,encodeCon, getNextTempVar, getNextAstNumber, astNumberMap, relName, makeConstraint, functionClones, nClones, maxArity);	
       var annotationConstraints = MdAnnotationsAdsafe.genAnnotationConstraints(renameCloneAst,annotationsObj,encodeVar, encodeField, encodeLoc,encodeCon, getNextTempVar, getNextAstNumber, astNumberMap, relName, makeConstraint, functionClones, nClones, maxArity);	
       var attackerConstraints = MdAttacker.genAttackerConstraints(MdAnalysis.genConstraintsScopeNumber,annotationsObj, toBeCloned, encodeVar, encodeField, encodeLoc,encodeCon, getNextTempVar, getNextAstNumber, astNumberMap, relName, makeConstraint, functionClones, nClones, maxArity); 
       var globalVarConstraints = MdGlobalVar.genGlobalVarConstraints(copyArray(toGlobalVar),copyArray(toGlobalField),encodeVar, encodeField, encodeLoc,encodeCon, getNextTempVar, getNextAstNumber, astNumberMap, relName, makeConstraint);
       var datalogFieldNames = MdField.genDatalogFieldNames(getEncoderVarCount, getEncoderLocCount, getEncoderFieldCount,getEncoderConCount);			 

       result = result + datalogFieldNames + '\n';
       result = result + datalogRules + '\n';
       result = result + nativeConstraints +'\n';
       result = result + domConstraints+ '\n';
       result = result + callSiteConstraints + '\n';
       result = result + annotationConstraints + '\n';
       result = result + preciousConstraints + '\n';
       result = result + codeConstraints+ '\n';
       result = result + globalVarConstraints+ '\n';
       result = result + attackerConstraints;
       return result;
   }

   function genCallSiteConstraints(text){
       var stmts = text.split('\n');
       var i = 1;
       var words = [];
       var wordsLen =0;
       var len = stmts.length;
       var result = " " ;
       for(i = 1; i < len; i++){
	   words = stmts[i].split(' ');
	   wordsLen = words.length;
	   for(j = 0; j < wordsLen; j++){
	       if((words[j][0] === '0') || (words[j][0] === '1') || (words[j][0] === '2') || (words[j][0] === '3') || (words[j][0] === '4') || (words[j][0] === '5') || (words[j][0] === '6') || (words[j][0] === '7') || (words[j][0] === '8') || (words[j][0] === '9') ){
		   result = result  + relName('callClonedIn') + "(" + words[j] + "). \n";
	       }
	   }
       }
       return result;
   }
   
   var aPointsTo = [];
   function renderAttackerPointsTo(text){
	var stmts = text.split('\n');
	var i = 1;
	var words = [];
	var wordsLen =0;
        var sentence;
	var j=0;
	var flag =1;
	var len = stmts.length;
	var result = '';
        var name = '';
        var code = '';
	
        aPointsTo = [];
	for(i = 1; i < len; i++){
	    words = stmts[i].split(' ');
	    wordsLen = words.length;
	    for(j = 0; j < wordsLen; j++){
		if((words[j][0] === '0') || (words[j][0] === '1') || (words[j][0] === '2') || (words[j][0] === '3') || (words[j][0] === '4') || (words[j][0] === '5') || (words[j][0] === '6') || (words[j][0] === '7') || (words[j][0] === '8') || (words[j][0] === '9') ){
		    //console.log(words[j]);
		    if ((astNumberMap[decodeLoc(words[j])] != undefined)){
			if((astNumberMap[decodeLoc(words[j])].isAttacker === 1)){
			}
			else if(astNumberMap[decodeLoc(words[j])].isNative === 1){
			}
			else{	
			    aPointsTo.push(astNumberMap[decodeLoc(words[j])]);
			}
		    }
		}	 
	    }
	}
       result = result + '(NOTES: \n';
       result = result + '(1) We map all functions to the corresponding declaration sites. Multiple instances of the same declaration site are shown as the same function \n';
       result = result + '(2) Native prototype functions and attacker created functions are not shown \n';
       result = result + ')\n\n';
       result = result + 'Functions and DOM objects that the attacker can potentially hold are: \n\n';
  
       len = aPointsTo.length;
       var count = 0;
       for(i = 0 ; i < len;i++){
	  // console.log(i + ' '+ aPointsTo[i]);
	   if((aPointsTo[i][0][0] === 'F') || (aPointsTo[i].isDOM ===1)){
	       if(aPointsTo[i].hasOwnProperty('origAst')){
		   
		   if((aPointsTo[i].origAst)[1].hasOwnProperty('startLine')){
		       result = result + 'Line No: ' + (aPointsTo[i].origAst)[1].startLine + '---' + Mrender.renderEcmascript(aPointsTo[i].origAst) + '\n\n'; 
		   }
		   else{
		       result = result + Mrender.renderEcmascript(aPointsTo[i].origAst) + '\n\n'; 
		   }
	       }
	       else{
		   if((aPointsTo[i])[1].hasOwnProperty('startLine')){		       
		       result = result + 'Line No: ' + (aPointsTo[i])[1].startLine + '---' + Mrender.renderEcmascript(aPointsTo[i]) + '\n\n'; 
		   }
		   else{
		       result = result + Mrender.renderEcmascript(aPointsTo[i]) + '\n\n'; 
		   }
		   
	       }
	       count = count + 1;
	   }
       }
       result = result + 'Total number of functions = ' + count;
       return result;
   }

   
   function basicAnalyzer(inputFileName, outputFileName, cloneNativeFlag, cloneDOMFlag, cloneUserFlag, callSiteConstraints, state){
       var source = fs.readFileSync(inputFileName,'ascii');
       
       var datalogCode;
       if(state === 1){
	   datalogCode = renderDatalog(source,freezeProtoFlag,cloneNativeFlag,cloneDOMFlag,cloneUserFlag,callSiteConstraints,0); // attackerFlag = 0, 
       }
       else{
	   var datalogCode = fs.readFileSync('./BddbddbAnalyzer/output.datalog','ascii');
	   datalogCode = datalogCode + '\n' + callSiteConstraints;
	 //  datalogCode = renderDatalog(source,freezeProtoFlag,cloneNativeFlag,cloneDOMFlag,cloneUserFlag,callSiteConstraints,1); // attackerFlag = 1, 
       }
       fs.writeFileSync('./BddbddbAnalyzer/output.datalog',datalogCode,encoding='ascii');
       console.log('Datalog code written');
       var sys   = require('sys');
       var exec  = require('child_process').exec;
       var child;
   
       child = exec('java -Xmx1024m -cp ./BddbddbAnalyzer/: net.sf.bddbddb.Solver ' + './BddbddbAnalyzer/output.datalog >./BddbddbAnalyzer/outputBuffer', 
		    { encoding: 'utf8'
		      , timeout: 0
		      , maxBuffer: 2000*1024
		      , killSignal: 'SIGKILL'
		      , cwd: null
		      , env: null
		    },
		    function (error, stdout, stderr) {
			if (error !== null) {
			    //  sys.print('stdout: ' + stdout);
			    sys.print('stderr: ' + stderr);
			    console.log('exec error: ' + error);
			}
			else{
			  if(state === 1){
			      var callClonedOutSource =  fs.readFileSync('./BddbddbAnalyzer/Results/callClonedOut.tuples','ascii');
			      var callSiteConstraintsNew = genCallSiteConstraints(callClonedOutSource);
			      console.log('Basic Analyzer: Phase 1 completed');
			      return basicAnalyzer(inputFileName, outputFileName, cloneNativeFlag, cloneDOMFlag,0, callSiteConstraintsNew,2);
			  }
			    else{ 

				var aPointsToSource =  fs.readFileSync('./BddbddbAnalyzer/Results/AActualPtsTo.tuples','ascii');
				var aPointsToResult = renderAttackerPointsTo(aPointsToSource);
				console.log(aPointsToResult);
				fs.writeFileSync(outputFileName,aPointsToResult,encoding='ascii');   
		
			      return aPointsToResult;
			    }
			}
		    });
   }
   
   var processArgs = process.argv;
   var inputFileName;
   var outputFileName;
   var freezeProtoFlag = 1; // Do not turn this flag off as it might lead to bugs.
   var cloneNativeFlag, cloneDOMFlag, cloneUserFlag;
   
   inputFileName = processArgs[2];
   outputFileName = processArgs[3];
   cloneNativeFlag = 0;
   cloneDOMFlag = 0; 
   cloneUserFlag = 0;
   var i;
   for(i = 4; i < processArgs.length;i++){
       switch(processArgs[i]){
       case '-cloneNative':
	  // cloneNativeFlag = 1;
	   console.log('1CFA is implemented for Native functions (more precise than cloning)');
	   break;
       case '-cloneDom':
	   cloneDomFlag = 1;
	   break;
       case '-cloneUserReachable':
	   cloneUserFlag = 2;
	   break;   
       case '-cloneUserAll':
	   cloneUserFlag = 1;
	   break;   
       }
   }
 /*
   function analyze(inputFileName, outputFileName, cloneNativeFlag, cloneDOMFlag,cloneUserFlag, state){
       var source = fs.readFileSync(inputFileName,'ascii');

       var datalogCode;
       if(state === 1){
	   // First run the context insensitive analysis
	   datalogCode = renderDatalog(source,freezeProtoFlag,cloneNativeFlag,cloneDOMFlag,0);
       }
       else{
	   datalogCode = renderDatalog(source,freezeProtoFlag,cloneNativeFlag,cloneDOMFlag,cloneUserFlag);
       }
       // console.log(datalogCode);
       fs.writeFileSync('./BddbddbAnalyzer/output.datalog',datalogCode,encoding='ascii');
       
       
       var sys   = require('sys');
       var exec  = require('child_process').exec;
       var child;
       
       child = exec('java -Xmx1024m -cp ./BddbddbAnalyzer/: net.sf.bddbddb.Solver ' + './BddbddbAnalyzer/output.datalog', 
		    { encoding: 'utf8'
		      , timeout: 0
		      , maxBuffer: 200000*1024
		      , killSignal: 'SIGKILL'
		      , cwd: null
		      , env: null
		    },
		    function (error, stdout, stderr) {
			if (error !== null) {
			  //  sys.print('stdout: ' + stdout);
			    sys.print('stderr: ' + stderr);
			    console.log('exec error: ' + error);
			}
			else{
			    var aPointsToSource =  fs.readFileSync('./BddbddbAnalyzer/Results/AActualPtsTo.tuples','ascii');
			    var aPointsToResult = renderAttackerPointsTo(aPointsToSource);
			    if(state === 1){
				console.log('Phase 1 completed');
				 analyze(inputFileName, outputFileName, cloneNativeFlag, cloneDOMFlag,cloneUserFlag, 2)
			    }
			    else{
				console.log(aPointsToResult);
				fs.writeFileSync(outputFileName,aPointsToResult,encoding='ascii');   
			    }
			}
		    });
   }
*/
  
  var result = basicAnalyzer(inputFileName, outputFileName, cloneNativeFlag, cloneDOMFlag, 0, "", 1);

