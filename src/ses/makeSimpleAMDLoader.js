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
 * @fileoverview Makes a loader for a simple subset of the
 * Asynchronous Module Loader (AMD) API
 * https://github.com/amdjs/amdjs-api/wiki/AMD . Based on
 * http://wiki.ecmascript.org/doku.php?id=strawman:concurrency#amd_loader_lite
 *
 * @author Mark S. Miller
 * //provides makeSimpleAMDLoader
 * @requires Q, StringMap, cajaVM, this
 */


(function(global){
   "use strict";

   var bind = Function.prototype.bind;
   // See
   // http://wiki.ecmascript.org/doku.php?id=conventions:safe_meta_programming
   var uncurryThis = bind.bind(bind.call);

   var applyFn = uncurryThis(bind.apply);
   var mapFn = uncurryThis([].map);

   var def;
   if (typeof cajaVM !== 'undefined') {
     def = cajaVM.def;
   } else {
     // Don't bother being properly defensive when run outside of Caja
     // or SES.
     def = Object.freeze;
   }

   var defineNotCalledP = Q.reject(new Error('define not called'));

   /**
    * Makes a loader for a simple subset of the Asynchronous Module
    * Loader (AMD) API.
    *
    * <p>Terminology: When we say a function "reveals" a value X, we
    * means that it either immediately returns an X or it immediately
    * returns a promise that it eventually fulfills with an X. Unless
    * stated otherwise, we implicitly elide the error conditions from
    * such statements. The more explicit statement append: "or it
    * throws, or it does not terminate, or it breaks the returned
    * promise, or it never resolves the returned promise."
    *
    * <p>The provided "fetch" function should be a function from a
    * module name string to revealing the source string for that
    * module. This source string is assumed to be in (our simple
    * subset of) AMD format. When run under Caja/SES, the module
    * source is executed in a scope consisting of only the whitelisted
    * globals and the "define" function from our subset of the AMD
    * API. Our "define" function always takes exactly two arguments: A
    * "dependencies" array of module name strings, and a factory
    * function. The factory function should have one parameter for
    * accepting each module instance corresponding to each of these
    * module names. Whatever the factory function reveals is taken to
    * be the instance of this module.
    *
    * <p>Note that in this subset, a module's source does not get to
    * state (or even know) its own module name. Rather, this naming is
    * only according to the mapping provided by the "fetch" function.
    *
    * <p>The opt_moduleMap, if provided, should be a mapping from
    * module names to module instances. To endow a subsystem with the
    * ability to import connections to the outside world, provide an
    * opt_moduleMap already initialized with some pre-existing
    * name-to-instance associations.
    */
   function makeSimpleAMDLoader(fetch, opt_moduleMap) {
     var moduleMap = opt_moduleMap || StringMap();

     var loader;

     function rawLoad(id) {
       return Q(fetch(id)).when(function(src) {
         var result = defineNotCalledP;
         function define(deps, factory) {
           result = Q.all(mapFn(deps, loader)).when(function(imports) {
             return applyFn(factory, void 0, imports);
           });
         }
         define.amd = { lite: true, caja: true };
         def(define);

         Function('define', src)(define);
         return result;
       });
     }
     return loader = Q.memoize(rawLoad, moduleMap);
   }

   global.makeSimpleAMDLoader = def(makeSimpleAMDLoader);

 })(this);
