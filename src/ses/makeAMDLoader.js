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
 * @author Mark S. Miller, based on earlier designs by Tyler Close,
 * Kris Kowal, and Kevin Reid.
 * @requires Q
 * @provides makeQ
 */


(function(global){
   "use strict";

   var bind = Function.prototype.bind;
   // See
   // http://wiki.ecmascript.org/doku.php?id=conventions:safe_meta_programming
   var uncurryThis = bind.bind(bind.call);

   var applyFn = uncurryThis(bind.apply);
   var mapFn = uncurryThis([].map);


   /**
    *
    */
   function makeAMDLoader(fetch) {
     var loader;
     function define(deps, factory) {
       return Q.all(mapFn(deps, loader)).when(function(imports) {
         return applyFn(factory, void 0, imports);
       });
     }
     define.amd = {lite: true};

     function rawLoad(id) {
       return Q(fetch(id)).when(function(src) {
         return Function('define',
                         'return (' + src + '\n);')(define);
       });
     }
     return loader = Q.memoize(rawLoad, StringMap);
   }

   global.makeAMDLoader = makeAMDLoader;

 })(this);
