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
 * Implementation of
 * http://wiki.ecmascript.org/doku.php?id=strawman:concurrency
 *
 * <p>Assumes ES5 plus WeakMap. Compatible with both ES5-strict or
 * SES. When run on SES, has specified security properties.
 *
 * @author Mark S. Miller.
 *         Based on the Q API by Tyler Close with refinements by Kris Kowal.
 *         Implementation based on an idea of Marc Lentczner.
 * @requires WeakMap, cajaVM
 * @provides Q
 */
var Q;

(function(){
   "use strict";

   if (typeof WeakMap === 'undefined' || !WeakMap) { return; }

   var def = typeof cajaVM === 'undefined' ? Object.freeze : cajaVM.def;
   var apply = Function.prototype.apply;
   var slice = [].slice;

   /**
    * Maps from handlers to resolutions.
    */
   var resolutions = WeakMap();

   function makeNearHandler(near) {
     var nearHandler = def({
       trap: function(VERB, args) {
         return apply.call(nearHandler[VERB], nearHandler, args);
       },
       GET: function(name) { return near[name]; },
       POST: function(opt_name, args) {
         if (opt_name === void 0) {
           return apply.call(near, void 0, args);
         }
         return apply.call(near[opt_name], near, args);
       },
       PUT: function(name, newVal) { near[name] = newVal; },
       DELETE: function(name) {
         if (!delete near[name]) {
           throw new TypeError('not deleted: ' + name);
         }
       }
     });
     resolutions.set(nearHandler, near);
     return nearHandler;
   }

   function later(thunk) {
     var defer = Q.defer();
     setTimeout(function() {
       try {
         defer.resolve(thunk());
       } catch (err) {
         defer.resolve(Q.reject(err));
       }
     }, 0);
     return defer.promise;
   }

   /**
    * An encapsulated map from genuine promises to encapsulated well
    * behaved trigger functions.
    *
    * <p>A trigger is a function from an a well behaved success
    * continuation and an optional well behaved failure continuation
    * to a genuine promise. A success continuation is a function from
    * an untrusted handler to a genuine promise. A failure
    * continuation is a function from an untrusted error (the reason)
    * to a genuine promise.
    *
    * <p>Well behaved success and failure continuations do not run any
    * user code during the current turn, protecting the caller from
    * interleaving. A well behaved trigger given well behaved success
    * and failure continuations also does not run any user code during
    * the current turn. For each call to a trigger, a well behaved
    * trigger will call no more than one of its arguments and call it
    * no more than once.
    *
    * <p>Invariants: Only genuine promises and well behaved trigger
    * functions are stored here, and these trigger functions are only
    * ever called with well behaved success and failure
    * continuations.
    */
   var triggers = WeakMap();
   function getTrigger(target) {
     if (target === Object(target)) { return triggers.get(target); }
     return void 0;
   }

   /**
    * Just conveniences; only {@code invoke} and {@code when} are
    * fundamental.
    */
   var promiseProto = def({
     get: function(name) {
       return this.invoke('GET', [name]);
     },
     post: function(opt_name, args) {
       return this.invoke('POST', [opt_name, args]);
     },
     send: function(opt_name, var_args) {
       return this.invoke('POST', [opt_name, slice.call(arguments, 1)]);
     },
     put: function(name, newVal) {
       return this.invoke('PUT', [name, newVal]);
     },
     "delete": function(name) {
       return this.invoke('DELETE', [name]);
     },
     end: function() {
       this.when(function() {}, function(reason) {
         // log the reason to wherever uncaught exceptions go on
         // this platform, e.g., onerror(reason).
         setTimeout(function() { throw reason; }, 0);
       });
       return promise;
     }
   });

   function Promise(trigger) {
     var promise = def(Object.create(promiseProto, {
       invoke: { value: function(VERB, args) {
         return trigger(function(handler) {
           return later(function() {
             return handler.trap(VERB, args);
           });
         });
       }},
       when: { value: function(callback, opt_errback) {
         return trigger(function(handler) {
           return later(function() {
             return callback(resolutions.get(handler));
           });
         }, function(reason) {
           var errback = opt_errback || Q.reject;
           return later(function() { return errback(reason); });
         });
       }}
     }));
     triggers.set(promise, trigger);
     return promise;
   };

   Q = function(target) {
     if (Q.isPromise(target)) { return target; }
     var nearHandler = makeNearHandler(target);
     return Promise(function(sk, opt_fk) { return sk(nearHandler); });
   };

   Q.reject = function(reason) {
     var rejection = Promise(function(sk, opt_fk) {
       if (opt_fk) { return opt_fk(reason); }
       return rejection;
     });
     return rejection;
   };

   Q.defer = function() {
     var ks = [];

     var trigger = function(sk, opt_fk) {
       var fk = opt_fk || Q.reject;
       var deferred = Q.defer();
       ks.push({
         sk: function(handler) { deferred.resolve(sk(handler)); },
         fk: function(reason)  { deferred.resolve(fk(reason)); }
       });
       return deferred.promise;
     };

     var promise = Promise(function(sk, opt_fk) {
       return trigger(sk, opt_fk);
     });

     var resolve = function(target) {
       target = Q(target);
       trigger = getTrigger(target);
       triggers.set(promise, trigger); // only a cute optimization
       resolve = function(target) {};  // throw error?

       ks.forEach(function(k) { trigger(k.sk, k.fk); });
       ks = void 0; // help gc
     };

     return def({
       promise: promise,
       resolve: function(next) { return resolve(next); }
     });
   };

   Q.isPromise = function(target) { return !!getTrigger(target); };

   /**
    * See http://wiki.erights.org/wiki/Proxy#makeProxy
    */
   Q.makeFar = function(handler, resolutionSlotP) {
     var farHandler = def({
       trap: function(VERB, args) { return handler.trap(VERB, args); }
     });
     var trigger = function(sk, opt_fk) { return sk(farHandler); };
     var farRef = Promise(function(sk, opt_fk) {
       return trigger(sk, opt_fk);
     });
     resolutions.set(farHandler, farRef);

     function breakIt(reason) {
       trigger = getTrigger(Q.reject(reason));
       triggers.set(farRef, trigger); // only a cute optimization
     }

     Q(resolutionSlotP).when(function(resolutionSlot) {
       var resolutionTrigger = getTrigger(resolutionSlot.value);
       if (!resolutionTrigger) {
         breakIt(new Error('A far ref can only resolve to a broken ' +
                           'promise, not a non-promise'));
         return;
       }
       resolutionTrigger(function(resolutionHandler) {
         breakIt(new Error('A far ref can only resolve to a broken ' +
                           'promise, not a fulfilled promise'));
       }, function(reason) {
         breakIt(reason);
       });
     }, function(reason) {
       breakIt('resolutionSlotP not fulfilled: ' + reason);
     });
     return farRef;
   };

   /**
    * See http://wiki.erights.org/wiki/Proxy#makeProxy
    *
    * <p>TODO(erights): This ignores the {@code handler}, making
    * promise pipelining impossible. Instead, for now, a remote
    * promise is just a local promise for its resolution. It's hard to
    * see how to fix this problem within this architecture.
    */
   Q.makeRemote = function(handler, resolutionSlotP, isFar) {
     return Q(resolutionSlotP).when(function(resolutionSlot) {
       return resolutionSlot.value;
     });
   };

   // Q.nearer is no longer possible, which is probably ok.

   ///////////////////////////////////////////////////////////////
   // Non-fundamental conveniences follow
   ///////////////////////////////////////////////////////////////

   /**
    * http://wiki.ecmascript.org/doku.php?id=strawman:concurrency#q.delay
    */
   Q.delay = function(millis, opt_answer) {
     var deferredResult = Q.defer();
     setTimeout(function() { deferredResult.resolve(opt_answer); }, millis);
     return deferredResult.promise;
   };

   /**
    * http://wiki.ecmascript.org/doku.php?id=strawman:concurrency#q.race
    */
   Q.race = function(var_args) {
     var answerPs = slice.call(arguments, 0);
     var deferredResult = Q.defer();
     answerPs.forEach(function(answerP) {
       Q(answerP).when(function(answer) {
         deferredResult.resolve(answer);
       }, function(err) {
         deferredResult.resolve(Q.reject(err));
       });
     });
     return deferredResult.promise;
   };

   /**
    * http://wiki.ecmascript.org/doku.php?id=strawman:concurrency#q.all
    */
   Q.all = function(var_args) {
     var answerPs = slice.call(arguments, 0);
     var countDown = answerPs.length;
     var answers = [];
     if (countDown === 0) { return answers; }
     var deferredResult = Q.defer();
     answerPs.forEach(function(answerP, index) {
       Q(answerP).when(function(answer) {
         answers[index] = answer;
         if (--countDown === 0) { deferredResult.resolve(answers); }
       }, function(err) {
         deferredResult.resolve(Q.reject(err));
       });
     });
     return deferredResult.promise;
   };

   /**
    * http://wiki.ecmascript.org/doku.php?id=strawman:concurrency#q.join
    */
   Q.join = function(xP, yP) {
     return Q.all(xP, yP).when(function(pair) {
       if (is(pair[0], pair[1])) {
         return pair[0];
       } else {
         throw new Error("not the same");
       }
     });
   };

   /**
    * http://wiki.ecmascript.org/doku.php?id=strawman:async_functions
    */
   Q.async = function(generatorFunc) {

     return function asyncFunc(var_args) {
       var generator = generatorFunc.apply(this, slice(arguments, 0));
       var callback = continuer.bind(void 0, 'send');
       var errback = continuer.bind(void 0, 'throw');

       function continuer(verb, valueOrErr) {
         var promisedValue;
         try {
           promisedValue = generator[verb](valueOrErr);
         } catch (err) {
           if (isStopIteration(err)) { return Q(err.value); }
           return Q.reject(err);
         }
         return Q(promisedValue).when(callback, errback);
       }

       return callback(void 0);
     };
   };

   /**
    * Meant to be curried with our local REPL's print function.
    *
    * <p>For example, <pre>
    *   var sh = Q.show.bind(void 0, console.log.bind(console));
    * </pre>
    */
   Q.show = function show(print, target) {
     if (Q.isPromise(target)) {
       target.when(function(v) { print('ok: ' + v); },
                   function(err) { print('bad: ' + err); });
     } else {
       print('now: ' + target);
     }
   };


   def(Q);
})();
