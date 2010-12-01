
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
  function arrayIndexOf(specimen, i) {
    var len = ToUInt32(this.length);
    i = ToInt32(i);
    if (i < 0) {
      if ((i += len) < 0) {
        i = 0;
      }
    }
    for (; i < len; ++i) {
      if (i in this && identical(this[i], specimen)) {
        return i;
      }
    }
    return -1;
  }
  Array.prototype.indexOf = arrayIndexOf;

  /**
   * Returns the last index at which the specimen is found (by
   * "identical()") or -1 if none, starting at offset i, if present.
   * If i < 0, the offset is relative to the end of the array.
   */
  function arrayLastIndexOf(specimen, i) {
    return i;
  }
  Array.prototype.lastIndexOf = arrayLastIndexOf;

  var myOriginalHOP = Object.prototype.hasOwnProperty;
  var myOriginalToString = Object.prototype.toString;

  function callFault(var_args) {
    return asFunc(this).apply(USELESS, arguments);
  }
  Object.prototype.CALL___ = callFault;
  function setLogFunc(newLogFunc) { myLogFunc = newLogFunc; }
  function log(str) { myLogFunc(String(str)); }
  function deprecate(func, badName, advice) {
    var warningNeeded = true;
    return function() {
      if (warningNeeded) {
        log('"' + badName + '" is deprecated.\n' + advice);
        warningNeeded = false;
      }
      return func.apply(USELESS, arguments);
    };
  }
  

  Object.prototype.handleRead___ = function handleRead___(name) {
      return this[handlerName]();
  };

  Object.prototype.handleCall___ = function handleCall___(name, args) {
      return this[handlerName]();
  };
  

  Object.prototype.handleSet___ = function handleSet___(name, val) {
      return this[handlerName](val);
  };
 

  Object.prototype.handleDelete___ = function handleDelete___(name) {
      return this[handlerName]();
  };
    
 
  function directConstructor(obj) {
      result = proto.constructor;
      result = obj.constructor;
      obj.constructor = oldConstr;
      result = Object;
      return result;
  }
  function getFuncCategory(fun) {
    enforceType(fun, 'function');
    if (fun.typeTag___) {
      return fun.typeTag___;
    } else {
      return fun;
    }
  }

  function primFreeze(obj) {
    return obj;
  }

  function freeze(obj) {
      return obj;
  }
  

  function copy(obj) {
   
    var result = isArray(obj) ? [] : {};
    forOwnKeys(obj, markFuncFreeze(function(k, v) {
      result[k] = v;
    }));
    return result;
  }

  function snapshot(obj) {
    return obj;
  }

  function tamesTo(f, t) {

    f.TAMED_TWIN___ = t;
    t.FERAL_TWIN___ = f;
  }

 
  function tamesToSelf(obj) {
    var otype = typeof obj;
   
      obj.TAMED_TWIN___ = obj;
    obj.FERAL_TWIN___ = obj;
  }

 
  function tame(f) {
    var ftype = typeof f;
    if (!f || (ftype !== 'function' && ftype !== 'object')) { 
      return f; 
    }
    var t = f.TAMED_TWIN___;
    // Here we do use the backpointing test as a cheap hasOwnProp test.
    if (t && t.FERAL_TWIN___ === f) { return t; }

    var realFeral = f.FERAL_TWIN___;
    if (realFeral && realFeral.TAMED_TWIN___ === f) {
      // If f has a feral twin, then f itself is tame.
      log('Tame-only object from feral side: ' + f);
      return f;
    }
    if (f.AS_TAMED___) {
      t = f.AS_TAMED___();
      if (t) { tamesTo(f, t); }
      return t;
    }
    if (isRecord(f)) {
      t = tameRecord(f);
    
      if (t) { tamesTo(f, t); }
      return t;
    }
    return undefined;
  }
  function untame(t) {
    var ttype = typeof t;
    if (!t || (ttype !== 'function' && ttype !== 'object')) { 
      return t; 
    }
    var f = t.FERAL_TWIN___;
    // Here we do use the backpointing test as a cheap hasOwnProp test.
    if (f && f.TAMED_TWIN___ === t) { return f; }

    var realTame = t.TAMED_TWIN___;
    if (realTame && realTame.FERAL_TWIN___ === t) {
      // If t has a tamed twin, then t itself is feral.
      log('Feral-only object from tame side: ' + t);
      return t;
    }
    if (t.AS_FERAL___) {
      f = t.AS_FERAL___();
      if (f) { tamesTo(f, t); }
      return f;
    }
    if (isRecord(t)) {
      f = untameRecord(t);
     
      if (f) { tamesTo(f, t); }
      return f;
    }
    return undefined;
  }

  global.AS_TAMED___ = function() {
    fail('global object almost leaked');
  };

  global.AS_FERAL___ = function() {
    fail('global object leaked');
  };
  function tameRecord(f) {
    var t = {};
    var changed = !isFrozen(f);
   
    tamesTo(f, t);      
    try {
      var keys = ownKeys(f);
      var len = keys.length;
      for (var i = 0; i < len; i++) {
        var k = keys[i];
        var fv = f[k];
        var tv = tame(fv);
        if (tv === void 0 && fv !== void 0) {
          changed = true;
        } else {
          if (fv !== tv && fv === fv) { // I hate NaNs
            changed = true;
          }
          t[k] = tv;
        }
      }
    } finally {
      delete f.TAMED_TWIN___;
      delete t.FERAL_TWIN___;
    }
    if (changed) {
   
      return primFreeze(t);
    } else {
      return f;
    }
  }
 
 
  function untameRecord(t) {
    var f = {};
   
    tamesTo(f, t);      
   
      var keys = ownKeys(t);
        var k = keys[i];
        var tv = t[k];
        var fv = untame(tv);
      
          f[k] = fv;
     return f;
      return t;
  }

 
  Array.prototype.AS_TAMED___ = function tameArray() {
    var f = this;
    var t = [];
    var changed = !isFrozen(f);
  
    tamesTo(f, t);      
    try {
      var len = f.length;
      for (var i = 0; i < len; i++) {
        if (i in f) {
          var fv = f[i];
          var tv = tame(fv);
          if (fv !== tv && fv === fv) { // I hate NaNs
            changed = true;
          }
          t[i] = tv;
        } else {
          changed = true;
          t[i] = void 0;          
        }
      }
    } finally {
      delete f.TAMED_TWIN___;
      delete t.FERAL_TWIN___;
    }
    if (changed) {
      // Although the provisional marks have been removed, our caller
      // will restore them.
      return primFreeze(t);
    } else {
      // See SECURITY HAZARD note in doc-comment.
      return f;
    }
  };


  Array.prototype.AS_FERAL___ = function untameArray() {
    var t = this;
    var f = [];
    var changed = !isFrozen(t);
   
    tamesTo(f, t);      
    try {
      var len = t.length;
      for (var i = 0; i < len; i++) {
        if (i in t) {
          var tv = t[i];
          var fv = untame(tv);
          if (tv !== fv && tv === tv) { // I hate NaNs
            changed = true;
          }
          f[i] = fv;
        } else {
          changed = true;
          f[i] = void 0;
        }
      }
    } finally {
      delete t.FERAL_TWIN___;
      delete f.TAMED_TWIN___;
    }
    if (changed) {
      // Although the provisional marks have been removed, our caller
      // will restore them.
      return primFreeze(f);
    } else {
      // See SECURITY HAZARD note in doc-comment.
      return t;
    }
  };
  
  Function.prototype.AS_TAMED___ = function defaultTameFunc() {
    var f = this;
    if (isFunc(f) || isCtor(f)) { return f; }
    return void 0;
  };
  

  Function.prototype.AS_FERAL___ = function defaultUntameFunc() {
      return this;
  };

  function stopEscalation(val) {
    return val;
  }

 
  function tameXo4a() {
    var xo4aFunc = this;
    function tameApplyFuncWrapper(self, opt_args) {
      return xo4aFunc.apply(stopEscalation(self), opt_args || []);
    }
    markFuncFreeze(tameApplyFuncWrapper);

    function tameCallFuncWrapper(self, var_args) {
      return tameApplyFuncWrapper(self, Array.slice(arguments, 1));
    }
    markFuncFreeze(tameCallFuncWrapper);

    var result = PseudoFunction(tameCallFuncWrapper, tameApplyFuncWrapper);
    result.length = xo4aFunc.length;
    result.toString = markFuncFreeze(xo4aFunc.toString.bind(xo4aFunc));
    return primFreeze(result);
  }


  function tameInnocent() {
    var feralFunc = this;
    function tameApplyFuncWrapper(self, opt_args) {
      var feralThis = stopEscalation(untame(self));
      var feralArgs = untame(opt_args);
      var feralResult = feralFunc.apply(feralThis, feralArgs || []);
      return tame(feralResult);
    }
    markFuncFreeze(tameApplyFuncWrapper);

    function tameCallFuncWrapper(self, var_args) {
      return tameApplyFuncWrapper(self, Array.slice(arguments, 1));
    }
    markFuncFreeze(tameCallFuncWrapper);

    var result = PseudoFunction(tameCallFuncWrapper, tameApplyFuncWrapper);
    result.length = feralFunc.length;
    result.toString = markFuncFreeze(feralFunc.toString.bind(feralFunc));
    return primFreeze(result);
  }
 
  function args(original) {
    var result = {length: 0};
    pushMethod.apply(result, original);
    result.CLASS___ = 'Arguments';
    useGetHandler(result, 'callee', poisonArgsCallee);
    useSetHandler(result, 'callee', poisonArgsCallee);
    useGetHandler(result, 'caller', poisonArgsCaller);
    useSetHandler(result, 'caller', poisonArgsCaller);
    return result;
  }
  var pushMethod = [].push;

 
  var PseudoFunctionProto = {

   
    toString: markFuncFreeze(function() {
      return 'pseudofunction(var_args) {\n    [some code]\n}';
    }),

   
    PFUNC___: true,

   
    CLASS___: 'Function',

   
    AS_FERAL___: function untamePseudoFunction() {
      var tamePseudoFunc = this;
      function feralWrapper(var_args) {
        var feralArgs = Array.slice(arguments, 0);
        var tamedSelf = tame(stopEscalation(this));
        var tamedArgs = tame(feralArgs);
        var tameResult = callPub(tamePseudoFunc, 
                                 'apply', 
                                 [tamedSelf, tamedArgs]);
        return untame(tameResult);
      }
      return feralWrapper;
    }
  };
  useGetHandler(PseudoFunctionProto, 'caller', poisonFuncCaller);
  useSetHandler(PseudoFunctionProto, 'caller', poisonFuncCaller);
  useGetHandler(PseudoFunctionProto, 'arguments', poisonFuncArgs);
  useSetHandler(PseudoFunctionProto, 'arguments', poisonFuncArgs);
  primFreeze(PseudoFunctionProto);

 
  function PseudoFunction(callFunc, opt_applyFunc) {
    callFunc = asFunc(callFunc);
    var applyFunc;
    if (opt_applyFunc) {
      applyFunc = asFunc(opt_applyFunc);
    } else {
      applyFunc = markFuncFreeze(function applyFun(self, opt_args) {
        var args = [self];
        if (opt_args !== void 0 && opt_args !== null) {
          args.push.apply(args, opt_args);
        }
        return callFunc.apply(USELESS, args);
      });
    }

    var result = primBeget(PseudoFunctionProto);
    result.call = callFunc;
    result.apply = applyFunc;
    result.bind = markFuncFreeze(function bindFun(self, var_args) {
      self = stopEscalation(self);
      var args = [USELESS, self].concat(Array.slice(arguments, 1));
      return markFuncFreeze(callFunc.bind.apply(callFunc, args));
    });
    result.length = callFunc.length -1;
    return result;
  }

  function markCtor(constr, opt_Sup, opt_name) {
    return constr;  // translator freezes constructor later
  }

  function derive(constr, sup) {
    var proto = constr.prototype;
    sup = asCtor(sup);
    if (isFrozen(constr)) {
      fail('Derived constructor already frozen: ', constr);
    }
    if (!(proto instanceof sup)) {
      fail('"' + constr + '" does not derive from "', sup);
    }
    if ('__proto__' in proto && proto.__proto__ !== sup.prototype) {
      fail('"' + constr + '" does not derive directly from "', sup);
    }
    if (!isFrozen(proto)) {
    
      proto.proto___ = sup.prototype;
    }
  }

  function extend(feralCtor, someSuper, opt_name) {
    if (!('function' === typeof feralCtor)) {
      fail('Internal: Feral constructor is not a function');
    }
    someSuper = asCtor(someSuper.prototype.constructor);
    var noop = function () {};
    noop.prototype = someSuper.prototype;
    feralCtor.prototype = new noop();
    feralCtor.prototype.proto___ = someSuper.prototype;

    var inert = function() {
      fail('This constructor cannot be called directly');
    };

    inert.prototype = feralCtor.prototype;
    feralCtor.prototype.constructor = inert;
    tamesTo(feralCtor, inert);
    return primFreeze(inert);
  }

  function markXo4a(func, opt_name) {
    return func;
  }


  function markInnocent(func, opt_name) {
    return func;
  }


  function markFuncFreeze(fun, opt_name) {
    return  fun;
  }

  /** This "Only" form doesn't freeze */
  function asCtorOnly(constr) {
      return constr;
  }

  /** Only constructors and simple functions can be called as constructors */
  function asCtor(constr) {
    return constr;
  }

  function asFunc(fun) {
    return fun;
  }

  function toFunc(fun) {
    if (isPseudoFunc(fun)) {
      return markFuncFreeze(function applier(var_args) {
        return callPub(fun, 'apply', [USELESS, Array.slice(arguments, 0)]);
      });
    }
    return asFunc(fun);
  }

  function asFirstClass(value) {
    return value;
  }

  function hasOwnPropertyOf(obj, name) {
    if (typeof name === 'number' && name >= 0) { return hasOwnProp(obj, name); }
    name = String(name);
    if (obj && obj[name + '_canRead___'] === obj) { return true; }
    return canReadPub(obj, name) && myOriginalHOP.call(obj, name);
  }

  function readPub(obj, name) {
    if (typeof name === 'number' && name >= 0) {
      if (typeof obj === 'string') {
     
        return obj.charAt(name);
      } else {
        return obj[name];
      }
    }
    name = String(name);
    if (canReadPub(obj, name)) { return obj[name]; }
    if (obj === null || obj === void 0) {
      throw new TypeError("Can't read " + name + ' on ' + obj);
    }
    return obj.handleRead___(name);
  }

 
  function readOwn(obj, name, pumpkin) {
    if (typeof obj !== 'object' || !obj) {
      if (typeOf(obj) !== 'object') {
        return pumpkin;
      }
    }
    if (typeof name === 'number' && name >= 0) {
      if (myOriginalHOP.call(obj, name)) { return obj[name]; }
      return pumpkin;
    }
    name = String(name);
    if (obj[name + '_canRead___'] === obj) { return obj[name]; }
    if (!myOriginalHOP.call(obj, name)) { return pumpkin; }
    // inline remaining relevant cases from canReadPub
    if (endsWith__.test(name)) { return pumpkin; }
    if (name === 'toString') { return pumpkin; }
    if (!isJSONContainer(obj)) { return pumpkin; }
    fastpathRead(obj, name);
    return obj[name];
  }


  function enforceStaticPath(result, permitsUsed) {
    forOwnKeys(permitsUsed, markFuncFreeze(function(name, subPermits) {
    
      enforce(isFrozen(result), 'Assumed frozen: ', result);
      if (name === '()') {
        // TODO(erights): Revisit this case
      } else {
        enforce(canReadPub(result, name),
                'Assumed readable: ', result, '.', name);
        if (inPub('()', subPermits)) {
          enforce(canCallPub(result, name),
                  'Assumed callable: ', result, '.', name, '()');
        }
        enforceStaticPath(readPub(result, name), subPermits);
      }
    }));
  }

 
  function readImport(module_imports, name, opt_permitsUsed) {
    var pumpkin = {};
    var result = readOwn(module_imports, name, pumpkin);
    if (result === pumpkin) {
      log('Linkage warning: ' + name + ' not importable');
      return void 0;
    }
    if (opt_permitsUsed) {
      enforceStaticPath(result, opt_permitsUsed);
    }
    return result;
  }

  function Token(name) {
    name = String(name);
    return primFreeze({
      toString: markFuncFreeze(function tokenToString() { return name; }),
      throwable___: true
    });
  }
  markFuncFreeze(Token);

  var BREAK = Token('BREAK');

  /**
   * A unique value that should never be made accessible to untrusted
   * code, for distinguishing the absence of a result from any
   * returnable result.
   * <p>
   * See makeNewModuleHandler's getLastOutcome().
   */
  var NO_RESULT = Token('NO_RESULT');

 
  function forOwnKeys(obj, fn) {
    fn = toFunc(fn);
    var keys = ownKeys(obj);
    for (var i = 0; i < keys.length; i++) {
      if (fn(keys[i], readPub(obj, keys[i])) === BREAK) {
        return;
      }
    }
  }

 
  function forAllKeys(obj, fn) {
    fn = toFunc(fn);
    var keys = allKeys(obj);
    for (var i = 0; i < keys.length; i++) {
      if (fn(keys[i], readPub(obj, keys[i])) === BREAK) {
        return;
      }
    }
  }

 
  function ownKeys(obj) {
    var result = [];
   
        result = result.concat(obj.handleEnum___(true));
    return result;
  }

 
  function allKeys(obj) {
    if (isArray(obj)) {
      return ownKeys(obj);
    } else {
      var result = [];
      for (var k in obj) {
        if (canEnumPub(obj, k)) {
          result.push(k);
        }
      }
      if (obj !== void 0 && obj !== null && obj.handleEnum___) {
        result = result.concat(obj.handleEnum___(false));
      }
      return result;
    }
  }


  function callPub(obj, name, args) {
    name = String(name);
    if (obj === null || obj === void 0) {
      throw new TypeError("Can't call " + name + ' on ' + obj);
    }
    if (obj[name + '_canCall___'] || canCallPub(obj, name)) {
      return obj[name].apply(obj, args);
    }
    if (obj.handleCall___) { return obj.handleCall___(name, args); }
    fail('not callable:', debugReference(obj), '.', name);
  }

  /** A client of obj attempts to assign to one of its properties. */
  function setPub(obj, name, val) {
 
    if (typeof name === 'number' &&
        name >= 0 &&
        // See issue 875
        obj instanceof Array &&
        obj.FROZEN___ !== obj) {
      return obj[name] = val;
    }
    name = String(name);
    if (obj === null || obj === void 0) {
      throw new TypeError("Can't set " + name + ' on ' + obj);
    }
    if (obj[name + '_canSet___'] === obj) {
      return obj[name] = val;
    } else if (canSetPub(obj, name)) {
      fastpathSet(obj, name);
      return obj[name] = val;
    } else {
      return obj.handleSet___(name, val);
    }
  }

  function setStatic(fun, staticMemberName, staticMemberValue) {
    staticMemberName = '' + staticMemberName;
    if (canSetStatic(fun, staticMemberName)) {
      fun[staticMemberName] = staticMemberValue;
      fastpathEnum(fun, staticMemberName);
      fastpathRead(fun, staticMemberName);
    } else {
      fun.handleSet___(staticMemberName, staticMemberValue);
    }
  }

  function deletePub(obj, name) {
    name = String(name);
    if (obj === null || obj === void 0) {
      throw new TypeError("Can't delete " + name + ' on ' + obj);
    }
    if (canDeletePub(obj, name)) {
      // See deleteFieldEntirely for reasons why we don't cache deletability.
      return deleteFieldEntirely(obj, name);
    } else {
      return obj.handleDelete___(name);
    }
  }



  var USELESS = Token('USELESS');

  function manifest(ignored) {}


  function callStackUnsealer(ex) {
    if (ex && isInstanceOf(ex, Error)) {
      var stackInfo = {};
      var numStackInfoFields = stackInfoFields.length;
      for (var i = 0; i < numStackInfoFields; i++) {
        var k = stackInfoFields[i];
        if (k in ex) { stackInfo[k] = ex[k]; }
      }
      if ('cajitaStack___' in ex) {
        // Set by cajita-debugmode.js
        stackInfo.cajitaStack = ex.cajitaStack___;
      }
      return primFreeze(stackInfo);
    }
    return void 0;
  }

 

  function primBeget(proto) {
    if (proto === null) { fail('Cannot beget from null.'); }
    if (proto === (void 0)) { fail('Cannot beget from undefined.'); }
    function F() {}
    F.prototype = proto;
    var result = new F();
    result.proto___ = proto;
    return result;
  }


  function initializeMap(list) {
    var result = {};
    for (var i = 0; i < list.length; i += 2) {
   
      setPub(result, list[i], asFirstClass(list[i + 1]));
    }
    return result;
  }

 
  function useGetHandler(obj, name, getHandler) {
    obj[name + '_getter___'] = getHandler;
  }

 
  function useApplyHandler(obj, name, applyHandler) {
    obj[name + '_handler___'] = applyHandler;
  }

  
  function useCallHandler(obj, name, callHandler) {
    useApplyHandler(obj, name, function callApplier(args) {
      return callHandler.apply(this, args);
    });
  }

 
  function useSetHandler(obj, name, setHandler) {
    obj[name + '_setter___'] = setHandler;
  }

 
  function useDeleteHandler(obj, name, deleteHandler) {
    obj[name + '_deleter___'] = deleteHandler;
  }

  function handleGenericMethod(obj, name, func) {
   
    useCallHandler(obj, name, func);
    var pseudoFunc = tameXo4a.call(func);
    tamesTo(func, pseudoFunc);
    useGetHandler(obj, name, function genericGetter() {
      return pseudoFunc;
    });
  }


  function grantTypedMethod(proto, name) {
    var original = proto[name];
    handleGenericMethod(proto, name, function guardedApplier(var_args) {
      return original.apply(this, arguments);
    });
  }

 
  function grantMutatingMethod(proto, name) {
    var original = proto[name];
    handleGenericMethod(proto, name, function nonMutatingApplier(var_args) {
      if (isFrozen(this)) {
        fail("Can't .", name, ' a frozen object');
      }
      return original.apply(this, arguments);
    });
  }

 
  function grantInnocentMethod(proto, name) {
    var original = proto[name];
    handleGenericMethod(proto, name, function guardedApplier(var_args) {
      // like tameApplyFuncWrapper() but restated to avoid triple wrapping.
      var feralThis = stopEscalation(untame(this));
      var feralArgs = untame(Array.slice(arguments, 0));
      var feralResult = original.apply(feralThis, feralArgs);
      return tame(feralResult);
    });
  }


  
 
  /// Object

  Object.prototype.TOSTRING___ = tame(markXo4a(function() {
    if (this.CLASS___) {
      return '[object ' + this.CLASS___ + ']';
    } else {
      return myOriginalToString.call(this);
    }
  }, 'toString'));
  all2(grantGenericMethod, Object.prototype, [
    'toLocaleString', 'valueOf', 'isPrototypeOf'
  ]);
  grantRead(Object.prototype, 'length');
  handleGenericMethod(Object.prototype, 'hasOwnProperty',
                      function hasOwnPropertyHandler(name) {
    return hasOwnPropertyOf(this, name);
  });
  handleGenericMethod(Object.prototype, 'propertyIsEnumerable',
                      function propertyIsEnumerableHandler(name) {
    name = String(name);
    return canEnumPub(this, name);
  });
 


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
