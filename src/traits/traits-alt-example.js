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

load('traits-alt.js');
load('../../tests/parser/unit.js');

function makeCircleTrait(self, radius) {
  return {
    move: function(dx, dy) {
      return 'moved '+dx+','+dy;
    }
  };
}

function makeAnimationTrait(self, refreshRate) {
  function setTimeout(f,r) { return f(); } // fake setTimeout
  return {
    start: function() {
      return setTimeout(function() { return self.animate(); }, refreshRate);
    },
    stop: function() { print('timer reset'); }
  }
}

function makeParticleTrait(self, radius, moveRate, dx, dy) {
  return compose(
    {trait: {
      animate: function() { return self.move(dx, dy); }
    }},
    {trait: makeCircleTrait(self,radius)},
    {trait: makeAnimationTrait(self, moveRate),
     alias: { start: 'startMoving' },
     exclude: [ 'stop' ]
    });
}

function makeParticleMorph(radius, moveRate, dx, dy) {
   var self = {};
   return use(self, makeParticleTrait(self, radius, moveRate, dx, dy));
}

// this-based version would become:
/*function makeParticleMorph(radius, moveRate, dx, dy) {
   return use({}, makeParticleTrait(radius, moveRate, dx, dy));
}*/

var unit = makeUnitTest('Traits', true);

var m = makeParticleMorph(2.0, 1.0, 1, 1);
unit.compare('moved 1,1', m.startMoving(), 'startMoving returns moved');
unit.ok(!('start' in m), 'start not present in m');
unit.ok(!('stop' in m), 'stop not present in m');
unit.testDone();