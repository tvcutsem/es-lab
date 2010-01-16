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

// An example to test trait composition, from the paper:
// "Adding State and Visibility Control to Traits using Lexical Nesting"
//   (Van Cutsem et. al, ECOOP 2009)
//   http://prog.vub.ac.be/Publications/2009/vub-prog-tr-09-04.pdf

// This version does not make use of the explicit 'self' parameter,
// reusing Javascript's implicit 'this' variable instead

load('traits.js');
load('../../tests/parser/unit.js');

function makeCircleTrait(radius) {
  return {
    move: function(dx, dy) {
      return 'moved '+dx+','+dy;
    }
  };
}

function makeAnimationTrait(refreshRate) {
  function setTimeout(f,r) { return f(); } // fake setTimeout
  return {
    start: function() {
      var that = this;
      return setTimeout(function() { return that.animate(); }, refreshRate);
    },
    stop: function() { print('timer reset'); }
  }
}

function makeParticleTrait(radius, moveRate, dx, dy) {
   var resultTrait = {
     animate: function() { return this.move(dx, dy); }
   };
   compose(resultTrait, makeCircleTrait(radius));
   compose(resultTrait, makeAnimationTrait(moveRate), {
     alias: { start: 'startMoving' },
     exclude: [ 'stop' ]
   });
   return resultTrait;
}

function makeParticleMorph(radius, moveRate, dx, dy) {
   var self = {};
   use(self, makeParticleTrait(radius, moveRate, dx, dy));
   return object(self);
}

var unit = makeUnitTest('Traits using this', true);

var m = makeParticleMorph(2.0, 1.0, 1, 1);
unit.compare('moved 1,1', m.startMoving(), 'startMoving returns moved');
unit.ok(!('start' in m), 'start not present in m');
unit.ok(!('stop' in m), 'stop not present in m');
unit.testDone();