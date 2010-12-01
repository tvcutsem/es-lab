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
 * Generates initial datalog field names with the appropriate domain size.
The domain size is computed using the value of the counter inside the encoder.
 * @Author
 Ankur Taly (ataly@stanford.edu)
 * @arguments
     - getEncoderCount : (_ ->  nat) returns the current count of the encoder.
 * @provides genDatalogFieldNames
 * Assumes:
 */
 this.genGlobalVarConstraints = function genGlobalVarConstraints(toGlobalVar,toGlobalField,encodeVar, encodeField, encodeLoc,encodeCon, getNextTempVar, getNextAstNumber, astNumberMap, relName, makeConstraint) {
 
     function genConstraints(){

	 var i = 0;
	 var retConstraints = [];
	 var len = toGlobalVar.length;

	 
	 for (i = 0 ; i < len; i++){
	     retConstraints.push(makeConstraint('toGlobalVar',[toGlobalVar[i][0],toGlobalVar[i][1]]));
	 }
	 var len = toGlobalField.length;
	 
	 for (i = 0 ; i < len; i++){
	     retConstraints.push(makeConstraint('toGlobalField',[toGlobalField[i][0],toGlobalField[i][1]]));
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
     
     var constraints = genConstraints();

     return renderConstraints(constraints,0);

 }
 
