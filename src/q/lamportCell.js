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

function LamportCell(value) {
  // Lamport getters are also EverReporters. When they are known near,
  // they are referred to as getters. Otherwise as reporters.
  // Lamport setters are also EverReactors. When the are known near,
  // they are referred to as setters. Otherwise as reactors.

  var myGen = 0; // how current is 'value' for coordinating with my reactors
  var downReactors = []; // downstream setters
  var optUpReporter = null; // upstream getter
  var reporterGen = 0; // how current is 'value' by optUpReporter's gen number.

  function localInterest() {
    if (optUpReporter) {
      Q(optUpReporter).whenUpdated(setter, reporterGen);
      optUpReporter = null;
    }      
  }

  /** Also an EverReporter */
  function getter() {
    localInterest();
    return value;
  }
  getter.whenUpdated = function(reactor, optLastGen) {
    var lastGen = optLastGen === undefined ? -1 : +optLastGen;
    localInterest();
    if (lastGen < myGen) {
      Q(reactor).reactToUpdate(value, myGen, getter);
    } else {
      reactors.push(reactor);
    }
  };

  /** Also an EverReactor */
  function setter(newValue) {
    setter.reactToUpdate(newValue, 0, null);
  }
  setter.reactToUpdate = function(newValue, newReporterGen, 
				  newOptUpReporter) {
    value = newValue;
    reporterGen = newReporterGen;
    optUpReporter = newOptUpReporter;
    myGen++;
    if (downReactors.length >= 1) {
      downReactors.forEach(function(reactor) {
	Q(reactor).reactToUpdate(value, myGen, getter);
      });
      downReactors = [];
      localInterest();
    }
  };

  return transFreeze({
    get: getter,
    set: setter,
    enumerable: true,
    configurable: false
  });
}

/*
 * L(x).v = 2;
 * // Object.defineProperty(x,'v', LamportCell(2));
 * 
 * L(y).v = 5;
 * 
 * L(y2).v = L(y).v;
 * // Object.defineProperty(y2,'v', Object.getOwnPropertyDescriptor(y,'v');
 * 
 * G(y3).v = G(y).v;
 * // Object.defineProperty(y3,'v', {
 * //   get: Object.getOwnPropertyDescriptor(y,'v').get,
 * //   set: undefined,
 * //   enumerable: false,
 * //   configurable: false
 * // });
 * 
 * G(z).v = whenever([G(x).v, G(y).v],
 *                   function(){ return x.v + y.v; });
 * // Object.defineProperty(z,'v', {
 * //   get: whenever([Object.getOwnPropertyDescriptor(x,'v').get,
 * //                  Object.getOwnPropertyDescriptor(y,'v').get],
 * //                 function(){ return x.v + y.v; }),
 * //   set: undefined,
 * //   enumerable: true,
 * //   configurable: false
 * // });
 */
