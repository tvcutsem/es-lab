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
 * @fileoverview Makes a "compileExprLater" function which acts like
 * "cajaVM.compileExpr", except that it returns a promise for the
 * outcome of attempting to compile the argument expression.
 *
 * //requires ses.ok, ses.securableWrapperSrc, ses.atLeastFreeVarNames,
 * //requires ses.makeCompiledExpr, ses.prepareExpr
 * //provides ses.compileExprLater
 * //provides ses.redeemResolver for its own use
 * @author Mark S. Miller
 * @overrides ses
 * @requires Q, cajaVM, document, URI
 */


/* See
http://webreflection.blogspot.com/2011/08/simulate-script-injection-via-data-uri.html
*/

var ses;

(function(global) {
   "use strict";

   if (ses && !ses.ok()) { return; }

   /**
    * This implementation works and satisfies the semantics, but
    * bottoms out in the built-in, which currently does not work well
    * with the Chrome debugger.
    *
    * <p>Since SES is independent of the hosting environment, we
    * feature test on the global named "document". If it is absent,
    * then we fall back to this implementation which works in any
    * standard ES5 environment.
    */
   function compileExprLaterFallback(exprSrc, opt_mitigateOpts) {
     // Coercing an object to a string may observably run code, so do
     // this now rather than in any later turn.
     exprSrc = ''+exprSrc;

     return Q(cajaVM).send('compileExpr',
                           exprSrc, opt_mitigateOpts);
   }

   if (typeof document === 'undefined') {
     ses.compileExprLater = compileExprLaterFallback;
     return;
   }

   var resolvers = [];
   var lastResolverTicket = -1;

   function getResolverTicket(resolver) {
     ++lastResolverTicket;
     resolvers[lastResolverTicket] = resolver;
     return lastResolverTicket;
   }

   ses.redeemResolver = function(i) {
     var resolver = resolvers[i];
     delete resolvers[i];
     return resolver;
   };

   /**
    * Implements an eventual compileExpr using injected script tags
    */
   function compileLaterInScript(exprSrc, opt_mitigateOpts) {
     var prep = ses.prepareExpr(exprSrc, opt_mitigateOpts);

     var result = Q.defer();
     var resolverTicket = getResolverTicket(result.resolve);

     var scriptSrc = 'ses.redeemResolver(' + resolverTicket + ')(' +
         'Object.freeze(ses.makeCompiledExpr(' + prep.wrapperSrc + ',\n' +
         // Freenames consist solely of identifier characters (\w|\$)+
         // which do not need to be escaped further
         '["' + prep.freeNames.join('", "') + '"], ' +
         JSON.stringify(prep.options) + ')));' + prep.suffixSrc;

     var head = document.getElementsByTagName("head")[0];
     var script = document.createElement("script");
     head.insertBefore(script, head.lastChild);
     // TODO(erights): It seems that on Chrome at least, the injected
     // script actually executes synchronously *now*. Is this
     // generally true? If so, perhaps we can even make synchronous
     // eval debuggable? Is such synchronous eval ok for the use case
     // here, or do we need to postpone this to another turn just in
     // case?
     script.appendChild(document.createTextNode(scriptSrc));

     function deleteScriptNode() { script.parentNode.removeChild(script); }
     Q(result.promise).then(deleteScriptNode, deleteScriptNode).end();
     return result.promise;
   }
   ses.compileExprLater = compileLaterInScript;

 })(this);
