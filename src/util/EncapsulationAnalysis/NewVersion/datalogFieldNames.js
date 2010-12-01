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
 this.genDatalogFieldNames = function genDatalogFieldNames(getEncoderVarCount, getEncoderLocCount, getEncoderFieldCount, getEncodeConCount) {

     var numVar = getEncoderVarCount() + 1;
     var numLoc = getEncoderLocCount() + 1;
     var numField = getEncoderFieldCount() + 1;
//     var numCon = getEncoderConCount() + 1;
     var constraint =
	 '.basedir "Results" \n' + 
	 "L " + numLoc + " name.map \n" +
	 "F " + numField + " name.map \n" +
         "V " + numVar + " name.map \n" +
//	 "C " + numCon + " name.map \n"  + 
	 "I 100 name.map \n";1 
     
     return constraint;
 }

 
