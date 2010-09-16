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
 * Generates the annotation constraints
 * @Author
 Ankur Taly (ataly@stanford.edu)x
 * @arguments
   -
 * @provides genAnnotationConstraints
 * Assumes:
 */


this.genAnnotationConstraints =  function genAnnotationConstraints(ast, contextNum,annotationsObj,  encodeVar, encodeField, encodeLoc, getNextTempVar, getNextAstNumber, astNumberMap, relName, makeConstraint,  functionClones, nClones, maxArity) {
     

   
    function genConstraints(){
	var retConstraints = [];

	// Initialization Annotation constraints -important when we have no dot statement in the program (ie all statement make use of [])

	for(p in annotationsObj){
	    retConstraints.push(makeConstraint('annotation',[p.slice(3),annotationsObj[p]]));    
	}
	
	retConstraints.push(makeConstraint('annotation',['0','$A$Num']));
	retConstraints.push(makeConstraint('annotation',['___nodes___','$A$AdsafeReject']));



	// Complement constraints 
	
	retConstraints.push(makeConstraint('complement',['$A$Num','$A$NumNot'])); 
	retConstraints.push(makeConstraint('complement',['$A$Native','$A$NativeNot']));    
	retConstraints.push(makeConstraint('complement',['$A$Dom','$A$DomNot']));    
	retConstraints.push(makeConstraint('complement',['$A$AdsafeReject','$A$AdsafeRejectNot']));   
 	retConstraints.push(makeConstraint('complement',['$A$AdsafeSelector','$A$AdsafeSelectorNot']));    	
	
	// Subtyping constraints
	retConstraints.push(makeConstraint('annotation',['$A$Num','$A$Num'])); 
	retConstraints.push(makeConstraint('annotation',['$A$Native','$A$Native']));    
	retConstraints.push(makeConstraint('annotation',['$A$Dom','$A$Dom']));    
	retConstraints.push(makeConstraint('annotation',['$A$AdsafeReject','$A$AdsafeReject']));    
	retConstraints.push(makeConstraint('annotation',['$A$AdsafeSelector','$A$AdsafeSelector']));    	
	
	// isAnnotationTag constraints.
	retConstraints.push(makeConstraint('isAnnotationTag',['$A$Num'])); 
	retConstraints.push(makeConstraint('isAnnotationTag',['$A$Native']));    
	retConstraints.push(makeConstraint('isAnnotationTag',['$A$Dom']));    
	retConstraints.push(makeConstraint('isAnnotationTag',['$A$AdsafeReject']));
	retConstraints.push(makeConstraint('isAnnotationTag',['$A$AdsafeSelector']));
	retConstraints.push(makeConstraint('isAnnotationTag',['$A$NumNot'])); 
	retConstraints.push(makeConstraint('isAnnotationTag',['$A$NativeNot']));    
	retConstraints.push(makeConstraint('isAnnotationTag',['$A$DomNot']));    
	retConstraints.push(makeConstraint('isAnnotationTag',['$A$AdsafeRejectNot']));
    	retConstraints.push(makeConstraint('isAnnotationTag',['$A$All']));
	retConstraints.push(makeConstraint('isAnnotationTag',['$A$AdsafeSelectorNot']));
	
	

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
    
    var annotationConstraints = genConstraints();
    
    return renderConstraints(annotationConstraints,0);
}
