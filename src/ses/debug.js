// Copyright (C) 2011 Google Inc.
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
 * @fileoverview
 *
 * //provides ses.UnsafeError
 * @author Mark S. Miller
 * @requires WeakMap
 * @overrides Error, ses, debugModule
 */

var Error;
var ses;

(function debugModule() {
   "use strict";


   /**
    * Save away the original Error constructor as ses.UnsafeError and
    * make it otheriwse unreachable. Replace it with a reachable
    * wrapping constructor with the same standard behavior.
    *
    * <p>When followed by the rest of SES initialization, the
    * UnsafeError we save off here is exempt from whitelist-based
    * extra property removal and primordial freezing. Thus, we can
    * use any platform specific APIs defined on Error for privileged
    * debugging operations, unless explicitly turned off below.
    */
   var UnsafeError = Error;
   ses.UnsafeError = Error;
   function FakeError(message) {
     return UnsafeError(message);
   }
   FakeError.prototype = UnsafeError.prototype;
   FakeError.prototype.constructor = FakeError;

   Error = FakeError;

   var stacks = WeakMap(); // error -> sst
   ses.getStack = function getStack(err) { return stacks.get(err); };

   if ('captureStackTrace' in UnsafeError) {
     // Assuming http://code.google.com/p/v8/wiki/JavaScriptStackTraceApi

     UnsafeError.prepareStackTrace = function(err, sst) {
       stacks.set(err, sst);
       return void 0;
     };

     var unsafeCaptureStackTrace = UnsafeError.captureStackTrace;

     // TODO(erights): This seems to be write only. Can this be made
     // safe enough to expose to untrusted code?
     UnsafeError.captureStackTrace = function(obj, opt_MyError) {
       var wasFrozen = Object.isFrozen(obj);
       var stackDesc = Object.getOwnPropertyDescriptor(obj, 'stack');
       try {
         var result = unsafeCaptureStackTrace(obj, opt_MyError);
         var ignore = obj.stack;
         return result;
       } finally {
         if (wasFrozen && !Object.isFrozen(obj)) {
           if (stackDesc) {
             Object.defineProperty(obj, 'stack', stackDesc);
           } else {
             delete obj.stack;
           }
           Object.freeze(obj);
         }
       }
     };
   }

 })();