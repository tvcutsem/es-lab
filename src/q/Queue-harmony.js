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
 * An infinite queue where (promises for) values can be dequeued 
 * before they are enqueued.
 * 
 * <p>Based on a similar example in Flat Concurrent Prolog, perhaps by
 * Ehud (Udi) Shapiro.
 * 
 * @author Mark S. Miller
 */
function Queue() {
  var ends = Q.defer();
  return Object.freeze({
    enqueue: function(elem) {
      var next = Q.defer();
      ends.resolve(Object.freeze({head: elem, tail: next.promise}));
      ends.resolve = next.resolve;
    },
    dequeue: function() {
      var result = Q(ends.promise).head;
      ends.promise = Q(ends.promise).tail;
      return result;
    }
  });
}
