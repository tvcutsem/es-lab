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

// An example to the traits.js library, from the paper:
// "Adding State and Visibility Control to Traits using Lexical Nesting"
//   (Van Cutsem et. al, ECOOP 2009)
//   http://prog.vub.ac.be/Publications/2009/vub-prog-tr-09-04.pdf

load('traits.js');
load('../../tests/unit.js');

var T = Traits;

// fake setTimeout
function setTimeout(f,r) { return f(); }

function makeCircleTrait(radius) {
  return T.trait({
    move: function(dx, dy) {
      return 'moved '+dx+','+dy;
    }
  });
}

function makeAnimationTrait(refreshRate) {
  return T.trait({
    animate: T.required, // to be provided by my composite
    start: function() {
      var that = this;
      return setTimeout(function() { return that.animate(); }, refreshRate);
    },
    stop: function() { print('timer reset'); }
  });
}

function makeParticleTrait(radius, moveRate, dx, dy) {
   return T.compose(
     T.trait({ animate: function() { return this.move(dx, dy); } }),
     T.alias({ start: 'startMoving' },
             T.exclude(['stop'], makeAnimationTrait(moveRate))));
}

function makeParticleMorph(radius, moveRate, dx, dy) {
   return T.build(T.override(makeParticleTrait(radius, moveRate, dx, dy),
                             makeCircleTrait(radius))); // prioritized composition
}

/*
// TODO: document super pattern
function makeParticleMorph(radius, moveRate, dx, dy) {
   var superT = makeCircleTrait(radius);
   return T.object(override(makeParticleTrait(object(superT), radius, moveRate, dx, dy),
                            superT)); // prioritized composition
}
*/
var unit = makeUnitTest('Traits', true);

var m = makeParticleMorph(2.0, 1.0, 1, 1);
unit.compare('moved 1,1', m.startMoving(), 'startMoving returns moved');
unit.ok(!('start' in m), 'start not present in m');
unit.ok(!('stop' in m), 'stop not present in m');
unit.compare('moved 2,3', m.move(2,3));
unit.testDone();