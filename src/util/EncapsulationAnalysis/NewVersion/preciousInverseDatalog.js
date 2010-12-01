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
 this.genPreciousConstraints = function genDatalogFieldNames(encodeVar, encodeField, encodeLoc,encodeCon) {
 
     var constraint = "	  Precious(l) :- Precious(m), HPtsTo(l," + encodeField('$A$AdsafeRejectNot') + ",m). \n";   
     
     constraint = constraint + 'RPrecious(l:L,m:L) \n' +
	 
     'RPrecious(l,m) :- IPrecious(l), Precious(m), HPtsTo(l," + encodeField('$A$AdsafeRejectNot') + ",m). \n' +

     'Precious(m)  :- RPrecious(l,m) .\n' +

     'HPtsTo(l," + encodeField('$A$AdsafeRejectNot') + ",m) :- RPrecious(l,m) .\n' 
     
     return constraint;

 }

 
