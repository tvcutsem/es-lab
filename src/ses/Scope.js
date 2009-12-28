// Copyright (C) 2009 Google Inc.
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

'use strict';

/**
 * See http://wiki.commonjs.org/wiki/Modules/ScriptModules for
 * boilerplate explanation.
 */
(function(){function mod(require,exports) {


  function Scope(analysis, outerAtr, varRep, useRep, labelRep) {
    var self = Object.freeze({
      defineVar: function(atr) { 
        varRep.set(atr.name, atr);
      },
      defineLetName: function(atr) {
	useRep.set(atr.name, atr);
      },
      defineConst: function(atr) { 
        varRep.set(atr.name, atr);
        atr.const = true;
      },

      nestBlock: function(atr) {
        return Scope(analysis, atr, varRep, useRep.nest(), labelRep);
      },
      nestLabel: function(atr, labelName) {
        var nestLabelRep = labelRep.nest();
        nestLabelRep.set(labelName, atr);
        return Scope(analysis, ast, varRep, useRep, nestLabelRep);
      },
      nestLoop: function(atr) {
        return self.nestLabel(atr, 'break').nestLabel(atr, 'continue');
      },
      nestProgram: function(atr) {
        var nestUseRep = useRep.nest();
        var nestLabelRep = Stringmap();
        return Scope(analysis, atr, nestUseRep, nestUseRep, nestLabelRep);
      },
      nestFunction: function(atr) {
        var nestUseRep = useRep.nest();
        var nestLabelRep = Stringmap();
        return Scope(analysis, atr, nestUseRep, nestUseRep, nestLabelRep);
      },
      nestCatch: function(atr) {
        var nestUseRep = useRep.nest();
        nestUseRep.set(atr.name, atr);
        return Scope(analysis, atr, useRep, nestUseRep, labelRep);
      },
      
      usesThis: function(atr) {},
      usesName: function(atr) {},
      assignsName: function(atr) {
        var name = atr.name;
        if (name === 'eval' || name === 'arguments') {
          throw new SyntaxError("Strict code can't assign: " + name);
        }
      },
      usesLabel: function(atr, labelName) {
        
      }
    });
    if (outerAtr.preOrder) {
      analysis.scopes[outerAtr.preOrder] = self;
    }
    return self;
  };
  Scope.top = function(analysis, whiteNames) {
    var varRep = {};
    whiteNames.forEach(function(name) {
      
    });
    return Scope(analysis, {}, varRep, varRep, labelRep);
  };

  exports.Scope = Scope;

// See http://wiki.commonjs.org/wiki/Modules/ScriptModules for
// boilerplate explanation.
};require.install?require.install('Scope',mod):mod(require,exports);})();
