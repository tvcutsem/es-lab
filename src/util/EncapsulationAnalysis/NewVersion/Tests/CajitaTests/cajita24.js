
  Date.prototype.toISOString = function() {
    return Date.prototype.toJSON.call(this);
  };

       Function.prototype.apply___ = Function.prototype.apply;

       Function.prototype.apply = function applyGuard(self, args) {
         if (args && args.CLASS___ === 'Arguments') {
           args = Array.slice(args, 0);
         }
         return this.apply___(self, args);
       };


  Array.slice = function(self, opt_start, opt_end) {
    if (self && typeof self === 'object') {
      if (opt_end === void 0) { opt_end = self.length; }
      return Array.prototype.slice.call(self, opt_start, opt_end);
    } else {
      return [];
    }
  };

  Function.prototype.bind = function(self, var_args) {
    var thisFunc = this;
    var leftArgs = Array.slice(arguments, 1);
    function funcBound(var_args) {
      var args = leftArgs.concat(Array.slice(arguments, 0));
      return thisFunc.apply(self, args);
    }
    return funcBound;
  };
var escape;
var cajita;
var ___;
var safeJSON;
attacker = (function(global) {

  var sharedImports;


  var myNewModuleHandler;

 
  function getNewModuleHandler() {
    return myNewModuleHandler;
  }

 
  function setNewModuleHandler(newModuleHandler) {
    myNewModuleHandler = newModuleHandler;
  }

  
  var obtainNewModule = freeze({
    handle: markFuncFreeze(function handleOnly(newModule){ return newModule; })
  });

  function registerClosureInspector(module) {
      this.CLOSURE_INSPECTOR___.registerCajaModule(module);
  }

  function makeNormalNewModuleHandler() {
      var imports;
      var lastOutcome;
      function getImports() {
	  imports = copy(sharedImports);
	  return imports;
    }
    return freeze({
     
    
      handle: function handle(newModule) {
        registerClosureInspector(newModule);
        var outcome = void 0;
        try {
          var result = newModule.instantiate(___, getImports());
          if (result !== NO_RESULT) {
            outcome = [true, result];
          }
        } catch (ex) {
          outcome = [false, ex];
        }
        lastOutcome = outcome;
        if (outcome) {
          if (outcome[0]) {
            return outcome[1];
          } else {
            throw outcome[1];
          }
        } else {
          return void 0;
        }
      }
    });
  }



  ___ = {
    // Classifying functions
   
      markInnocent: markInnocent
  };

})(this);
