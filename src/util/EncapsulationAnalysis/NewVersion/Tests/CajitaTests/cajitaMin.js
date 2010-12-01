Date.prototype.toISOString=function(){return Date.prototype.toJSON.call(this);};Function.prototype.apply___=Function.prototype.apply;Function.prototype.apply=function applyGuard(self,args){if(args&&args.CLASS___==='Arguments'){args=Array.slice(args,0);}
return this.apply___(self,args);};Array.slice=function(self,opt_start,opt_end){if(self&&typeof self==='object'){if(opt_end===void 0){opt_end=self.length;}
return Array.prototype.slice.call(self,opt_start,opt_end);}else{return[];}};Function.prototype.bind=function(self,var_args){var thisFunc=this;var leftArgs=Array.slice(arguments,1);function funcBound(var_args){var args=leftArgs.concat(Array.slice(arguments,0));return thisFunc.apply(self,args);}
return funcBound;};var escape;var cajita;var ___;var safeJSON;attacker=(function(global){function arrayIndexOf(specimen,i){var len=ToUInt32(this.length);i=ToInt32(i);if(i<0){if((i+=len)<0){i=0;}}
for(;i<len;++i){if(i in this&&identical(this[i],specimen)){return i;}}
return-1;}
Array.prototype.indexOf=arrayIndexOf;function arrayLastIndexOf(specimen,i){var len=ToUInt32(this.length);if(isNaN(i)){i=len-1;}else{i=ToInt32(i);if(i<0){i+=len;if(i<0){return-1;}}else if(i>=len){i=len-1;}}
for(;i>=0;--i){if(i in this&&identical(this[i],specimen)){return i;}}
return-1;}
Array.prototype.lastIndexOf=arrayLastIndexOf;var myOriginalHOP=Object.prototype.hasOwnProperty;var myOriginalToString=Object.prototype.toString;function callFault(var_args){return asFunc(this).apply(USELESS,arguments);}
Object.prototype.CALL___=callFault;function setLogFunc(newLogFunc){myLogFunc=newLogFunc;}
function log(str){myLogFunc(String(str));}
function deprecate(func,badName,advice){var warningNeeded=true;return function(){if(warningNeeded){log('"'+badName+'" is deprecated.\n'+advice);warningNeeded=false;}
return func.apply(USELESS,arguments);};}
var myKeeper={toString:function toString(){return'<Logging Keeper>';},handleRead:function handleRead(obj,name){return void 0;},handleCall:function handleCall(obj,name,args){fail('Not callable: (',debugReference(obj),').',name);},handleSet:function handleSet(obj,name,val){fail('Not writable: (',debugReference(obj),').',name);},handleDelete:function handleDelete(obj,name){fail('Not deletable: (',debugReference(obj),').',name);}};Object.prototype.handleRead___=function handleRead___(name){var handlerName=name+'_getter___';if(this[handlerName]){return this[handlerName]();}
return myKeeper.handleRead(this,name);};Object.prototype.handleCall___=function handleCall___(name,args){var handlerName=name+'_handler___';if(this[handlerName]){return this[handlerName].call(this,args);}
return myKeeper.handleCall(this,name,args);};Object.prototype.handleSet___=function handleSet___(name,val){var handlerName=name+'_setter___';if(this[handlerName]){return this[handlerName](val);}
return myKeeper.handleSet(this,name,val);};Object.prototype.handleDelete___=function handleDelete___(name){var handlerName=name+'_deleter___';if(this[handlerName]){return this[handlerName]();}
return myKeeper.handleDelete(this,name);};function directConstructor(obj){if(obj===null){return void 0;}
if(obj===void 0){return void 0;}
if(typeOf(obj)==='function'){return void 0;}
obj=Object(obj);var result;if(myOriginalHOP.call(obj,'proto___')){var proto=obj.proto___;if(proto===null){return void 0;}
result=proto.constructor;if(result.prototype!==proto||typeOf(result)!=='function'){result=directConstructor(proto);}}else{if(!myOriginalHOP.call(obj,'constructor')){result=obj.constructor;}else{var oldConstr=obj.constructor;if(delete obj.constructor){result=obj.constructor;obj.constructor=oldConstr;}else if(isPrototypical(obj)){log('Guessing the directConstructor of : '+obj);result=Object;}else{return fail('Discovery of direct constructors unsupported when the ','constructor property is not deletable: ',obj,'.constructor === ',oldConstr,'(',obj===global,')');}}
if(typeOf(result)!=='function'||!(obj instanceof result)){fail('Discovery of direct constructors for foreign begotten ','objects not implemented on this platform.\n');}
if(result.prototype.constructor===result){obj.proto___=result.prototype;}}
return result;}
function getFuncCategory(fun){enforceType(fun,'function');if(fun.typeTag___){return fun.typeTag___;}else{return fun;}}
function primFreeze(obj){return obj;}
function freeze(obj){return obj;}
function copy(obj){if(!isJSONContainer(obj)){fail('cajita.copy(obj) applies only to JSON Containers: ',debugReference(obj));}
var result=isArray(obj)?[]:{};forOwnKeys(obj,markFuncFreeze(function(k,v){result[k]=v;}));return result;}
function snapshot(obj){return obj;}
function tamesTo(f,t){var ftype=typeof f;if(!f||(ftype!=='function'&&ftype!=='object')){fail('Unexpected feral primitive: ',f);}
var ttype=typeof t;if(!t||(ttype!=='function'&&ttype!=='object')){fail('Unexpected tame primitive: ',t);}
if(f.TAMED_TWIN___===t&&t.FERAL_TWIN___===f){log('multiply tamed: '+f+', '+t);return;}
if(f.TAMED_TWIN___&&hasOwnProp(f,'TAMED_TWIN___')){fail('Already tames to something: ',f);}
if(t.FERAL_TWIN___&&hasOwnProp(t,'FERAL_TWIN___')){fail('Already untames to something: ',t);}
if(f.FERAL_TWIN___&&hasOwnProp(f,'FERAL_TWIN___')){fail('Already tame: ',f);}
if(t.TAMED_TWIN___&&hasOwnProp(t,'TAMED_TWIN___')){fail('Already feral: ',t);}
f.TAMED_TWIN___=t;t.FERAL_TWIN___=f;}
function tamesToSelf(obj){var otype=typeof obj;if(!obj||(otype!=='function'&&otype!=='object')){fail('Unexpected primitive: ',obj);}
if(obj.TAMED_TWIN___===obj&&obj.FERAL_TWIN___===obj){log('multiply tamed: '+obj);return;}
if(obj.TAMED_TWIN___&&hasOwnProp(obj,'TAMED_TWIN___')){fail('Already tames to something: ',obj);}
if(obj.FERAL_TWIN___&&hasOwnProp(obj,'FERAL_TWIN___')){fail('Already untames to something: ',obj);}
obj.TAMED_TWIN___=obj.FERAL_TWIN___=obj;}
function tame(f){var ftype=typeof f;if(!f||(ftype!=='function'&&ftype!=='object')){return f;}
var t=f.TAMED_TWIN___;if(t&&t.FERAL_TWIN___===f){return t;}
var realFeral=f.FERAL_TWIN___;if(realFeral&&realFeral.TAMED_TWIN___===f){log('Tame-only object from feral side: '+f);return f;}
if(f.AS_TAMED___){t=f.AS_TAMED___();if(t){tamesTo(f,t);}
return t;}
if(isRecord(f)){t=tameRecord(f);if(t){tamesTo(f,t);}
return t;}
return undefined;}
function untame(t){var ttype=typeof t;if(!t||(ttype!=='function'&&ttype!=='object')){return t;}
var f=t.FERAL_TWIN___;if(f&&f.TAMED_TWIN___===t){return f;}
var realTame=t.TAMED_TWIN___;if(realTame&&realTame.FERAL_TWIN___===t){log('Feral-only object from tame side: '+t);return t;}
if(t.AS_FERAL___){f=t.AS_FERAL___();if(f){tamesTo(f,t);}
return f;}
if(isRecord(t)){f=untameRecord(t);if(f){tamesTo(f,t);}
return f;}
return undefined;}
global.AS_TAMED___=function(){fail('global object almost leaked');};global.AS_FERAL___=function(){fail('global object leaked');};function tameRecord(f){var t={};var changed=!isFrozen(f);tamesTo(f,t);try{var keys=ownKeys(f);var len=keys.length;for(var i=0;i<len;i++){var k=keys[i];var fv=f[k];var tv=tame(fv);if(tv===void 0&&fv!==void 0){changed=true;}else{if(fv!==tv&&fv===fv){changed=true;}
t[k]=tv;}}}finally{delete f.TAMED_TWIN___;delete t.FERAL_TWIN___;}
if(changed){return primFreeze(t);}else{return f;}}
function untameRecord(t){var f={};var changed=!isFrozen(t);tamesTo(f,t);try{var keys=ownKeys(t);var len=keys.length;for(var i=0;i<len;i++){var k=keys[i];var tv=t[k];var fv=untame(tv);if(fv===void 0&&tv!==void 0){changed=true;}else{if(tv!==fv&&tv===tv){changed=true;}
f[k]=fv;}}}finally{delete t.FERAL_TWIN___;delete f.TAMED_TWIN___;}
if(changed){return primFreeze(f);}else{return t;}}
Array.prototype.AS_TAMED___=function tameArray(){var f=this;var t=[];var changed=!isFrozen(f);tamesTo(f,t);try{var len=f.length;for(var i=0;i<len;i++){if(i in f){var fv=f[i];var tv=tame(fv);if(fv!==tv&&fv===fv){changed=true;}
t[i]=tv;}else{changed=true;t[i]=void 0;}}}finally{delete f.TAMED_TWIN___;delete t.FERAL_TWIN___;}
if(changed){return primFreeze(t);}else{return f;}};Array.prototype.AS_FERAL___=function untameArray(){var t=this;var f=[];var changed=!isFrozen(t);tamesTo(f,t);try{var len=t.length;for(var i=0;i<len;i++){if(i in t){var tv=t[i];var fv=untame(tv);if(tv!==fv&&tv===tv){changed=true;}
f[i]=fv;}else{changed=true;f[i]=void 0;}}}finally{delete t.FERAL_TWIN___;delete f.TAMED_TWIN___;}
if(changed){return primFreeze(f);}else{return t;}};Function.prototype.AS_TAMED___=function defaultTameFunc(){var f=this;if(isFunc(f)||isCtor(f)){return f;}
return void 0;};Function.prototype.AS_FERAL___=function defaultUntameFunc(){var t=this;if(isFunc(t)||isCtor(t)){return t;}
return void 0;};function stopEscalation(val){return val;}
function tameXo4a(){var xo4aFunc=this;function tameApplyFuncWrapper(self,opt_args){return xo4aFunc.apply(stopEscalation(self),opt_args||[]);}
markFuncFreeze(tameApplyFuncWrapper);function tameCallFuncWrapper(self,var_args){return tameApplyFuncWrapper(self,Array.slice(arguments,1));}
markFuncFreeze(tameCallFuncWrapper);var result=PseudoFunction(tameCallFuncWrapper,tameApplyFuncWrapper);result.length=xo4aFunc.length;result.toString=markFuncFreeze(xo4aFunc.toString.bind(xo4aFunc));return primFreeze(result);}
function tameInnocent(){var feralFunc=this;function tameApplyFuncWrapper(self,opt_args){var feralThis=stopEscalation(untame(self));var feralArgs=untame(opt_args);var feralResult=feralFunc.apply(feralThis,feralArgs||[]);return tame(feralResult);}
markFuncFreeze(tameApplyFuncWrapper);function tameCallFuncWrapper(self,var_args){return tameApplyFuncWrapper(self,Array.slice(arguments,1));}
markFuncFreeze(tameCallFuncWrapper);var result=PseudoFunction(tameCallFuncWrapper,tameApplyFuncWrapper);result.length=feralFunc.length;result.toString=markFuncFreeze(feralFunc.toString.bind(feralFunc));return primFreeze(result);}
function args(original){var result={length:0};pushMethod.apply(result,original);result.CLASS___='Arguments';useGetHandler(result,'callee',poisonArgsCallee);useSetHandler(result,'callee',poisonArgsCallee);useGetHandler(result,'caller',poisonArgsCaller);useSetHandler(result,'caller',poisonArgsCaller);return result;}
var pushMethod=[].push;var PseudoFunctionProto={toString:markFuncFreeze(function(){return'pseudofunction(var_args) {\n    [some code]\n}';}),PFUNC___:true,CLASS___:'Function',AS_FERAL___:function untamePseudoFunction(){var tamePseudoFunc=this;function feralWrapper(var_args){var feralArgs=Array.slice(arguments,0);var tamedSelf=tame(stopEscalation(this));var tamedArgs=tame(feralArgs);var tameResult=callPub(tamePseudoFunc,'apply',[tamedSelf,tamedArgs]);return untame(tameResult);}
return feralWrapper;}};useGetHandler(PseudoFunctionProto,'caller',poisonFuncCaller);useSetHandler(PseudoFunctionProto,'caller',poisonFuncCaller);useGetHandler(PseudoFunctionProto,'arguments',poisonFuncArgs);useSetHandler(PseudoFunctionProto,'arguments',poisonFuncArgs);primFreeze(PseudoFunctionProto);function PseudoFunction(callFunc,opt_applyFunc){callFunc=asFunc(callFunc);var applyFunc;if(opt_applyFunc){applyFunc=asFunc(opt_applyFunc);}else{applyFunc=markFuncFreeze(function applyFun(self,opt_args){var args=[self];if(opt_args!==void 0&&opt_args!==null){args.push.apply(args,opt_args);}
return callFunc.apply(USELESS,args);});}
var result=primBeget(PseudoFunctionProto);result.call=callFunc;result.apply=applyFunc;result.bind=markFuncFreeze(function bindFun(self,var_args){self=stopEscalation(self);var args=[USELESS,self].concat(Array.slice(arguments,1));return markFuncFreeze(callFunc.bind.apply(callFunc,args));});result.length=callFunc.length-1;return result;}
function markCtor(constr,opt_Sup,opt_name){return constr;}
function derive(constr,sup){var proto=constr.prototype;sup=asCtor(sup);if(isFrozen(constr)){fail('Derived constructor already frozen: ',constr);}
if(!(proto instanceof sup)){fail('"'+constr+'" does not derive from "',sup);}
if('__proto__'in proto&&proto.__proto__!==sup.prototype){fail('"'+constr+'" does not derive directly from "',sup);}
if(!isFrozen(proto)){proto.proto___=sup.prototype;}}
function extend(feralCtor,someSuper,opt_name){if(!('function'===typeof feralCtor)){fail('Internal: Feral constructor is not a function');}
someSuper=asCtor(someSuper.prototype.constructor);var noop=function(){};noop.prototype=someSuper.prototype;feralCtor.prototype=new noop();feralCtor.prototype.proto___=someSuper.prototype;var inert=function(){fail('This constructor cannot be called directly');};inert.prototype=feralCtor.prototype;feralCtor.prototype.constructor=inert;markCtor(inert,someSuper,opt_name);tamesTo(feralCtor,inert);return primFreeze(inert);}
function markXo4a(func,opt_name){return func;}
function markInnocent(func,opt_name){return func;}
function markFuncFreeze(fun,opt_name){return fun;}
function asCtorOnly(constr){return constr;}
function asCtor(constr){return constr;}
function asFunc(fun){return fun;}
function toFunc(fun){if(isPseudoFunc(fun)){return markFuncFreeze(function applier(var_args){return callPub(fun,'apply',[USELESS,Array.slice(arguments,0)]);});}
return asFunc(fun);}
function asFirstClass(value){return value;}
function hasOwnPropertyOf(obj,name){if(typeof name==='number'&&name>=0){return hasOwnProp(obj,name);}
name=String(name);if(obj&&obj[name+'_canRead___']===obj){return true;}
return canReadPub(obj,name)&&myOriginalHOP.call(obj,name);}
function readPub(obj,name){if(typeof name==='number'&&name>=0){if(typeof obj==='string'){return obj.charAt(name);}else{return obj[name];}}
name=String(name);if(canReadPub(obj,name)){return obj[name];}
if(obj===null||obj===void 0){throw new TypeError("Can't read "+name+' on '+obj);}
return obj.handleRead___(name);}
function readOwn(obj,name,pumpkin){if(typeof obj!=='object'||!obj){if(typeOf(obj)!=='object'){return pumpkin;}}
if(typeof name==='number'&&name>=0){if(myOriginalHOP.call(obj,name)){return obj[name];}
return pumpkin;}
name=String(name);if(obj[name+'_canRead___']===obj){return obj[name];}
if(!myOriginalHOP.call(obj,name)){return pumpkin;}
if(endsWith__.test(name)){return pumpkin;}
if(name==='toString'){return pumpkin;}
if(!isJSONContainer(obj)){return pumpkin;}
fastpathRead(obj,name);return obj[name];}
function enforceStaticPath(result,permitsUsed){forOwnKeys(permitsUsed,markFuncFreeze(function(name,subPermits){enforce(isFrozen(result),'Assumed frozen: ',result);if(name==='()'){}else{enforce(canReadPub(result,name),'Assumed readable: ',result,'.',name);if(inPub('()',subPermits)){enforce(canCallPub(result,name),'Assumed callable: ',result,'.',name,'()');}
enforceStaticPath(readPub(result,name),subPermits);}}));}
function readImport(module_imports,name,opt_permitsUsed){var pumpkin={};var result=readOwn(module_imports,name,pumpkin);if(result===pumpkin){log('Linkage warning: '+name+' not importable');return void 0;}
if(opt_permitsUsed){enforceStaticPath(result,opt_permitsUsed);}
return result;}
function Token(name){name=String(name);return primFreeze({toString:markFuncFreeze(function tokenToString(){return name;}),throwable___:true});}
markFuncFreeze(Token);var BREAK=Token('BREAK');var NO_RESULT=Token('NO_RESULT');function forOwnKeys(obj,fn){fn=toFunc(fn);var keys=ownKeys(obj);for(var i=0;i<keys.length;i++){if(fn(keys[i],readPub(obj,keys[i]))===BREAK){return;}}}
function forAllKeys(obj,fn){fn=toFunc(fn);var keys=allKeys(obj);for(var i=0;i<keys.length;i++){if(fn(keys[i],readPub(obj,keys[i]))===BREAK){return;}}}
function ownKeys(obj){var result=[];if(isArray(obj)){var len=obj.length;for(var i=0;i<len;i++){result.push(i);}}else{for(var k in obj){if(canEnumOwn(obj,k)){result.push(k);}}
if(obj!==void 0&&obj!==null&&obj.handleEnum___){result=result.concat(obj.handleEnum___(true));}}
return result;}
function allKeys(obj){if(isArray(obj)){return ownKeys(obj);}else{var result=[];for(var k in obj){if(canEnumPub(obj,k)){result.push(k);}}
if(obj!==void 0&&obj!==null&&obj.handleEnum___){result=result.concat(obj.handleEnum___(false));}
return result;}}
function callPub(obj,name,args){name=String(name);if(obj===null||obj===void 0){throw new TypeError("Can't call "+name+' on '+obj);}
if(obj[name+'_canCall___']||canCallPub(obj,name)){return obj[name].apply(obj,args);}
if(obj.handleCall___){return obj.handleCall___(name,args);}
fail('not callable:',debugReference(obj),'.',name);}
function setPub(obj,name,val){if(typeof name==='number'&&name>=0&&obj instanceof Array&&obj.FROZEN___!==obj){return obj[name]=val;}
name=String(name);if(obj===null||obj===void 0){throw new TypeError("Can't set "+name+' on '+obj);}
if(obj[name+'_canSet___']===obj){return obj[name]=val;}else if(canSetPub(obj,name)){fastpathSet(obj,name);return obj[name]=val;}else{return obj.handleSet___(name,val);}}
function setStatic(fun,staticMemberName,staticMemberValue){staticMemberName=''+staticMemberName;if(canSetStatic(fun,staticMemberName)){fun[staticMemberName]=staticMemberValue;fastpathEnum(fun,staticMemberName);fastpathRead(fun,staticMemberName);}else{fun.handleSet___(staticMemberName,staticMemberValue);}}
function deletePub(obj,name){name=String(name);if(obj===null||obj===void 0){throw new TypeError("Can't delete "+name+' on '+obj);}
if(canDeletePub(obj,name)){return deleteFieldEntirely(obj,name);}else{return obj.handleDelete___(name);}}
function deleteFieldEntirely(obj,name){delete obj[name+'_canRead___'];delete obj[name+'_canEnum___'];delete obj[name+'_canCall___'];delete obj[name+'_grantCall___'];delete obj[name+'_grantSet___'];delete obj[name+'_canSet___'];delete obj[name+'_canDelete___'];return(delete obj[name])||(fail('not deleted: ',name),false);}
var USELESS=Token('USELESS');function manifest(ignored){}
function callStackUnsealer(ex){if(ex&&isInstanceOf(ex,Error)){var stackInfo={};var numStackInfoFields=stackInfoFields.length;for(var i=0;i<numStackInfoFields;i++){var k=stackInfoFields[i];if(k in ex){stackInfo[k]=ex[k];}}
if('cajitaStack___'in ex){stackInfo.cajitaStack=ex.cajitaStack___;}
return primFreeze(stackInfo);}
return void 0;}
function tameException(ex){if(ex&&ex.UNCATCHABLE___){throw ex;}
try{switch(typeOf(ex)){case'string':case'number':case'boolean':case'undefined':{return ex;}
case'object':{if(ex===null){return null;}
if(ex.throwable___){return ex;}
if(isInstanceOf(ex,Error)){return primFreeze(ex);}
return''+ex;}
case'function':{var name=''+(ex.name||ex);function inLieuOfThrownFunction(){return'In lieu of thrown function: '+name;};return markFuncFreeze(inLieuOfThrownFunction,name);}
default:{log('Unrecognized exception type: '+(typeOf(ex)));return'Unrecognized exception type: '+(typeOf(ex));}}}catch(_){log('Exception during exception handling.');return'Exception during exception handling.';}}
function primBeget(proto){if(proto===null){fail('Cannot beget from null.');}
if(proto===(void 0)){fail('Cannot beget from undefined.');}
function F(){}
F.prototype=proto;var result=new F();result.proto___=proto;return result;}
function initializeMap(list){var result={};for(var i=0;i<list.length;i+=2){setPub(result,list[i],asFirstClass(list[i+1]));}
return result;}
function useGetHandler(obj,name,getHandler){obj[name+'_getter___']=getHandler;}
function useApplyHandler(obj,name,applyHandler){obj[name+'_handler___']=applyHandler;}
function useCallHandler(obj,name,callHandler){useApplyHandler(obj,name,function callApplier(args){return callHandler.apply(this,args);});}
function useSetHandler(obj,name,setHandler){obj[name+'_setter___']=setHandler;}
function useDeleteHandler(obj,name,deleteHandler){obj[name+'_deleter___']=deleteHandler;}
function handleGenericMethod(obj,name,func){var feral=obj[name];if(!hasOwnProp(obj,name)){feral=func;}else if(hasOwnProp(feral,'TAMED_TWIN___')){feral=func;}
useCallHandler(obj,name,func);var pseudoFunc=tameXo4a.call(func);tamesTo(feral,pseudoFunc);useGetHandler(obj,name,function genericGetter(){return pseudoFunc;});}
function grantTypedMethod(proto,name){var original=proto[name];handleGenericMethod(proto,name,function guardedApplier(var_args){if(!inheritsFrom(this,proto)){fail("Can't call .",name,' on a non ',directConstructor(proto),': ',this);}
return original.apply(this,arguments);});}
function grantMutatingMethod(proto,name){var original=proto[name];handleGenericMethod(proto,name,function nonMutatingApplier(var_args){if(isFrozen(this)){fail("Can't .",name,' a frozen object');}
return original.apply(this,arguments);});}
function grantInnocentMethod(proto,name){var original=proto[name];handleGenericMethod(proto,name,function guardedApplier(var_args){var feralThis=stopEscalation(untame(this));var feralArgs=untame(Array.slice(arguments,0));var feralResult=original.apply(feralThis,feralArgs);return tame(feralResult);});}
function all2(func2,arg1,arg2s){var len=arg2s.length;for(var i=0;i<len;i+=1){func2(arg1,arg2s[i]);}}
all2(grantRead,Math,['E','LN10','LN2','LOG2E','LOG10E','PI','SQRT1_2','SQRT2']);all2(grantFunc,Math,['abs','acos','asin','atan','atan2','ceil','cos','exp','floor','log','max','min','pow','random','round','sin','sqrt','tan']);function grantToString(proto){proto.TOSTRING___=tame(markXo4a(proto.toString,'toString'));}
function makeToStringMethod(toStringValue){function toStringMethod(var_args){var args=Array.slice(arguments,0);if(isFunc(toStringValue)){return toStringValue.apply(this,args);}
var toStringValueApply=readPub(toStringValue,'apply');if(isFunc(toStringValueApply)){return toStringValueApply.call(toStringValue,this,args);}
var result=myOriginalToString.call(this);log('Not correctly printed: '+result);return result;};return toStringMethod;}
function toStringGetter(){if(hasOwnProp(this,'toString')&&typeOf(this.toString)==='function'&&!hasOwnProp(this,'TOSTRING___')){grantToString(this);}
return this.TOSTRING___;}
useGetHandler(Object.prototype,'toString',toStringGetter);useApplyHandler(Object.prototype,'toString',function toStringApplier(args){var toStringValue=toStringGetter.call(this);return makeToStringMethod(toStringValue).apply(this,args);});useSetHandler(Object.prototype,'toString',function toStringSetter(toStringValue){if(isFrozen(this)||!isJSONContainer(this)){return myKeeper.handleSet(this,'toString',toStringValue);}
var firstClassToStringValue=asFirstClass(toStringValue);this.TOSTRING___=firstClassToStringValue;this.toString=makeToStringMethod(firstClassToStringValue);return toStringValue;});useDeleteHandler(Object.prototype,'toString',function toStringDeleter(){if(isFrozen(this)||!isJSONContainer(this)){return myKeeper.handleDelete(this,'toString');}
return(delete this.toString)&&(delete this.TOSTRING___);});markCtor(Object,void 0,'Object');Object.prototype.TOSTRING___=tame(markXo4a(function(){if(this.CLASS___){return'[object '+this.CLASS___+']';}else{return myOriginalToString.call(this);}},'toString'));all2(grantGenericMethod,Object.prototype,['toLocaleString','valueOf','isPrototypeOf']);grantRead(Object.prototype,'length');handleGenericMethod(Object.prototype,'hasOwnProperty',function hasOwnPropertyHandler(name){return hasOwnPropertyOf(this,name);});handleGenericMethod(Object.prototype,'propertyIsEnumerable',function propertyIsEnumerableHandler(name){name=String(name);return canEnumPub(this,name);});useCallHandler(Object,'freeze',markFuncFreeze(freeze));useGetHandler(Object,'freeze',function(){return freeze;});grantToString(Function.prototype);handleGenericMethod(Function.prototype,'apply',function applyHandler(self,opt_args){return toFunc(this).apply(USELESS,opt_args||[]);});handleGenericMethod(Function.prototype,'call',function callHandler(self,var_args){return toFunc(this).apply(USELESS,Array.slice(arguments,1));});handleGenericMethod(Function.prototype,'bind',function bindHandler(self,var_args){var thisFunc=toFunc(this);var leftArgs=Array.slice(arguments,1);function boundHandler(var_args){var args=leftArgs.concat(Array.slice(arguments,0));return thisFunc.apply(USELESS,args);}
return markFuncFreeze(boundHandler);});useGetHandler(Function.prototype,'caller',poisonFuncCaller);useGetHandler(Function.prototype,'arguments',poisonFuncArgs);markCtor(Array,Object,'Array');grantFunc(Array,'slice');grantToString(Array.prototype);all2(grantTypedMethod,Array.prototype,['toLocaleString']);all2(grantGenericMethod,Array.prototype,['concat','join','slice','indexOf','lastIndexOf']);all2(grantMutatingMethod,Array.prototype,['pop','push','reverse','shift','splice','unshift']);handleGenericMethod(Array.prototype,'sort',function sortHandler(comparator){if(isFrozen(this)){fail("Can't sort a frozen array.");}
if(comparator){return Array.prototype.sort.call(this,toFunc(comparator));}else{return Array.prototype.sort.call(this);}});markCtor(String,Object,'String');grantFunc(String,'fromCharCode');grantToString(String.prototype);all2(grantTypedMethod,String.prototype,['indexOf','lastIndexOf']);all2(grantGenericMethod,String.prototype,['charAt','charCodeAt','concat','localeCompare','slice','substr','substring','toLowerCase','toLocaleLowerCase','toUpperCase','toLocaleUpperCase']);handleGenericMethod(String.prototype,'match',function matchHandler(regexp){enforceMatchable(regexp);return this.match(regexp);});handleGenericMethod(String.prototype,'replace',function replaceHandler(searcher,replacement){enforceMatchable(searcher);if(isFunc(replacement)){replacement=asFunc(replacement);}else if(isPseudoFunc(replacement)){replacement=toFunc(replacement);}else{replacement=''+replacement;}
return this.replace(searcher,replacement);});handleGenericMethod(String.prototype,'search',function searchHandler(regexp){enforceMatchable(regexp);return this.search(regexp);});handleGenericMethod(String.prototype,'split',function splitHandler(separator,limit){enforceMatchable(separator);return this.split(separator,limit);});markCtor(Boolean,Object,'Boolean');grantToString(Boolean.prototype);markCtor(Number,Object,'Number');all2(grantRead,Number,['MAX_VALUE','MIN_VALUE','NaN','NEGATIVE_INFINITY','POSITIVE_INFINITY']);grantToString(Number.prototype);all2(grantTypedMethod,Number.prototype,['toLocaleString','toFixed','toExponential','toPrecision']);markCtor(Date,Object,'Date');grantFunc(Date,'parse');grantFunc(Date,'UTC');grantToString(Date.prototype);all2(grantTypedMethod,Date.prototype,['toDateString','toTimeString','toUTCString','toLocaleString','toLocaleDateString','toLocaleTimeString','toISOString','toJSON','getDay','getUTCDay','getTimezoneOffset','getTime','getFullYear','getUTCFullYear','getMonth','getUTCMonth','getDate','getUTCDate','getHours','getUTCHours','getMinutes','getUTCMinutes','getSeconds','getUTCSeconds','getMilliseconds','getUTCMilliseconds']);all2(grantMutatingMethod,Date.prototype,['setTime','setFullYear','setUTCFullYear','setMonth','setUTCMonth','setDate','setUTCDate','setHours','setUTCHours','setMinutes','setUTCMinutes','setSeconds','setUTCSeconds','setMilliseconds','setUTCMilliseconds']);markCtor(RegExp,Object,'RegExp');grantToString(RegExp.prototype);handleGenericMethod(RegExp.prototype,'exec',function execHandler(specimen){if(isFrozen(this)){fail("Can't .exec a frozen RegExp");}
specimen=String(specimen);return this.exec(specimen);});handleGenericMethod(RegExp.prototype,'test',function testHandler(specimen){if(isFrozen(this)){fail("Can't .test a frozen RegExp");}
specimen=String(specimen);return this.test(specimen);});all2(grantRead,RegExp.prototype,['source','global','ignoreCase','multiline','lastIndex']);markCtor(Error,Object,'Error');grantToString(Error.prototype);grantRead(Error.prototype,'name');grantRead(Error.prototype,'message');markCtor(EvalError,Error,'EvalError');markCtor(RangeError,Error,'RangeError');markCtor(ReferenceError,Error,'ReferenceError');markCtor(SyntaxError,Error,'SyntaxError');markCtor(TypeError,Error,'TypeError');markCtor(URIError,Error,'URIError');var sharedImports;var myNewModuleHandler;function getNewModuleHandler(){return myNewModuleHandler;}
function setNewModuleHandler(newModuleHandler){myNewModuleHandler=newModuleHandler;}
var obtainNewModule=freeze({handle:markFuncFreeze(function handleOnly(newModule){return newModule;})});function registerClosureInspector(module){this.CLOSURE_INSPECTOR___.registerCajaModule(module);}
function makeNormalNewModuleHandler(){var imports=void 0;var lastOutcome=void 0;function getImports(){if(!imports){imports=copy(sharedImports);}
return imports;}
return freeze({getImports:markFuncFreeze(getImports),setImports:markFuncFreeze(function setImports(newImports){imports=newImports;}),getLastOutcome:markFuncFreeze(function getLastOutcome(){return lastOutcome;}),getLastValue:markFuncFreeze(function getLastValue(){if(lastOutcome&&lastOutcome[0]){return lastOutcome[1];}else{return void 0;}}),handle:markFuncFreeze(function handle(newModule){registerClosureInspector(newModule);var outcome=void 0;try{var result=newModule.instantiate(___,getImports());if(result!==NO_RESULT){outcome=[true,result];}}catch(ex){outcome=[false,ex];}
lastOutcome=outcome;if(outcome){if(outcome[0]){return outcome[1];}else{throw outcome[1];}}else{return void 0;}}),handleUncaughtException:function handleUncaughtException(exception,onerror,source,lineNum){lastOutcome=[false,exception];var message=tameException(exception);if('object'===typeOf(exception)&&exception!==null){message=String(exception.message||exception.desc||message);}
if(isPseudoFunc(onerror)){onerror=toFunc(onerror);}
var shouldReport=(isFunc(onerror)?onerror.CALL___(message,String(source),String(lineNum)):onerror!==null);if(shouldReport!==false){log(source+':'+lineNum+': '+message);}}});}
function prepareModule(module,load){registerClosureInspector(module);function theModule(imports){var completeImports=copy(sharedImports);completeImports.load=load;var k;for(k in imports){if(hasOwnProp(imports,k)){completeImports[k]=imports[k];}}
return module.instantiate(___,primFreeze(completeImports));}
theModule.FUNC___='theModule';setStatic(theModule,'cajolerName',module.cajolerName);setStatic(theModule,'cajolerVersion',module.cajolerVersion);setStatic(theModule,'cajoledDate',module.cajoledDate);setStatic(theModule,'moduleURL',module.moduleURL);if(!!module.includedModules){setStatic(theModule,'includedModules',___.freeze(module.includedModules));}
return primFreeze(theModule);}
function loadModule(module){freeze(module);markFuncFreeze(module.instantiate);return callPub(myNewModuleHandler,'handle',[module]);}
var registeredImports=[];function getId(imports){enforceType(imports,'object','imports');var id;if('id___'in imports){id=enforceType(imports.id___,'number','id');}else{id=imports.id___=registeredImports.length;}
registeredImports[id]=imports;return id;}
function getImports(id){var result=registeredImports[enforceType(id,'number','id')];if(result===void 0){fail('imports#',id,' unregistered');}
return result;}
function unregister(imports){enforceType(imports,'object','imports');if('id___'in imports){var id=enforceType(imports.id___,'number','id');registeredImports[id]=void 0;}}
function identity(x){return x;}
function callWithEjector(attemptFunc,opt_failFunc){var failFunc=opt_failFunc||identity;var disabled=false;var token=new Token('ejection');token.UNCATCHABLE___=true;var stash=void 0;function ejector(result){if(disabled){cajita.fail('ejector disabled');}else{stash=result;throw token;}}
markFuncFreeze(ejector);try{try{return callPub(attemptFunc,'call',[USELESS,ejector]);}finally{disabled=true;}}catch(e){if(e===token){return callPub(failFunc,'call',[USELESS,stash]);}else{throw e;}}}
function eject(opt_ejector,result){if(opt_ejector){callPub(opt_ejector,'call',[USELESS,result]);fail('Ejector did not exit: ',opt_ejector);}else{fail(result);}}
function makeTrademark(typename,table){typename=String(typename);return primFreeze({toString:markFuncFreeze(function(){return typename+'Mark';}),stamp:primFreeze({toString:markFuncFreeze(function(){return typename+'Stamp';}),mark___:markFuncFreeze(function(obj){table.set(obj,true);return obj;})}),guard:{toString:markFuncFreeze(function(){return typename+'T';}),coerce:markFuncFreeze(function(specimen,opt_ejector){if(table.get(specimen)){return specimen;}
eject(opt_ejector,'Specimen does not have the "'+typename+'" trademark');})}});}
var GuardMark=makeTrademark('Guard',newTable(true));var GuardT=GuardMark.guard;var GuardStamp=GuardMark.stamp;primFreeze(GuardStamp.mark___(GuardT));function Trademark(typename){var result=makeTrademark(typename,newTable(true));primFreeze(GuardStamp.mark___(result.guard));return result;}
markFuncFreeze(Trademark);function guard(g,specimen,opt_ejector){g=GuardT.coerce(g);return g.coerce(specimen,opt_ejector);}
function passesGuard(g,specimen){g=GuardT.coerce(g);return callWithEjector(markFuncFreeze(function(opt_ejector){g.coerce(specimen,opt_ejector);return true;}),markFuncFreeze(function(ignored){return false;}));}
function stamp(stamps,record){if(!isRecord(record)){fail('Can only stamp records: ',record);}
if(isFrozen(record)){fail("Can't stamp frozen objects: ",record);}
var numStamps=stamps.length>>>0;for(var i=0;i<numStamps;i++){if(!('mark___'in stamps[i])){fail("Can't stamp with a non-stamp: ",stamps[i]);}}
for(var i=0;i<numStamps;i++){stamps[i].mark___(record);}
return freeze(record);}
function makeSealerUnsealerPair(){var table=newTable(true);var undefinedStandin={};function seal(payload){if(payload===void 0){payload=undefinedStandin;}
var box=Token('(box)');table.set(box,payload);return box;}
function unseal(box){var payload=table.get(box);if(payload===void 0){fail('Sealer/Unsealer mismatch');}else if(payload===undefinedStandin){return void 0;}else{return payload;}}
return freeze({seal:markFuncFreeze(seal),unseal:markFuncFreeze(unseal)});}
function construct(ctor,args){return ctor;}
var magicCount=0;var MAGIC_NUM=Math.random();var MAGIC_TOKEN=Token('MAGIC_TOKEN_FOR:'+MAGIC_NUM);var MAGIC_NAME='_index;'+MAGIC_NUM+';';function newTable(opt_useKeyLifetime,opt_expectedSize){magicCount++;var myMagicIndexName=MAGIC_NAME+magicCount+'___';function setOnKey(key,value){var ktype=typeof key;if(!key||(ktype!=='function'&&ktype!=='object')){fail("Can't use key lifetime on primitive keys: ",key);}
var list=key[myMagicIndexName];if(!list||list[0]!==key){key[myMagicIndexName]=[key,MAGIC_TOKEN,value];}else{var i;for(i=1;i<list.length;i+=2){if(list[i]===MAGIC_TOKEN){break;}}
list[i]=MAGIC_TOKEN;list[i+1]=value;}}
function getOnKey(key){var ktype=typeof key;if(!key||(ktype!=='function'&&ktype!=='object')){fail("Can't use key lifetime on primitive keys: ",key);}
var list=key[myMagicIndexName];if(!list||list[0]!==key){return void 0;}else{for(var i=1;i<list.length;i+=2){if(list[i]===MAGIC_TOKEN){return list[i+1];}}
return void 0;}}
if(opt_useKeyLifetime){return primFreeze({set:markFuncFreeze(setOnKey),get:markFuncFreeze(getOnKey)});}
var myValues=[];function setOnTable(key,value){var index;switch(typeof key){case'object':case'function':{if(null===key){myValues.prim_null=value;return;}
index=getOnKey(key);if(value===void 0){if(index===void 0){return;}else{setOnKey(key,void 0);}}else{if(index===void 0){index=myValues.length;setOnKey(key,index);}}
break;}
case'string':{index='str_'+key;break;}
default:{index='prim_'+key;break;}}
if(value===void 0){delete myValues[index];}else{myValues[index]=value;}}
function getOnTable(key){switch(typeof key){case'object':case'function':{if(null===key){return myValues.prim_null;}
var index=getOnKey(key);if(void 0===index){return void 0;}
return myValues[index];}
case'string':{return myValues['str_'+key];}
default:{return myValues['prim_'+key];}}}
return primFreeze({set:markFuncFreeze(setOnTable),get:markFuncFreeze(getOnTable)});}
function getSuperCtor(func){enforceType(func,'function');if(isCtor(func)||isFunc(func)){var result=directConstructor(func.prototype);if(isCtor(result)||isFunc(result)){return result;}}
return void 0;}
var attribute=new RegExp('^([\\s\\S]*)_(?:canRead|canCall|getter|handler)___$');function getOwnPropertyNames(obj){var result=[];var seen={};var implicit=isJSONContainer(obj);for(var k in obj){if(hasOwnProp(obj,k)){if(implicit&&!endsWith__.test(k)){if(!myOriginalHOP.call(seen,k)){seen[k]=true;result.push(k);}}else{var match=attribute.exec(k);if(match!==null){var base=match[1];if(!myOriginalHOP.call(seen,base)){seen[base]=true;result.push(base);}}}}}
return result;}
function getProtoPropertyNames(func){enforceType(func,'function');return getOwnPropertyNames(func.prototype);}
function getProtoPropertyValue(func,name){return asFirstClass(readPub(func.prototype,name));}
function beget(parent){if(!isRecord(parent)){fail('Can only beget() records: ',parent);}
var result=primBeget(parent);result.RECORD___=result;return result;}
var goodJSON={};goodJSON.parse=jsonParseOk(global.JSON)?global.JSON.parse:json_sans_eval.parse;goodJSON.stringify=jsonStringifyOk(global.JSON)?global.JSON.stringify:json_sans_eval.stringify;safeJSON=primFreeze({CLASS___:'JSON',parse:markFuncFreeze(function(text,opt_reviver){var reviver=void 0;if(opt_reviver){opt_reviver=toFunc(opt_reviver);reviver=function(key,value){return opt_reviver.apply(this,arguments);};}
return goodJSON.parse(json_sans_eval.checkSyntax(text,function(key){return(key!=='valueOf'&&key!=='toString'&&!endsWith__.test(key));}),reviver);}),stringify:markFuncFreeze(function(obj,opt_replacer,opt_space){switch(typeof opt_space){case'number':case'string':case'undefined':break;default:throw new TypeError('space must be a number or string');}
var replacer;if(opt_replacer){opt_replacer=toFunc(opt_replacer);replacer=function(key,value){if(!canReadPub(this,key)){return void 0;}
return opt_replacer.apply(this,arguments);};}else{replacer=function(key,value){return(canReadPub(this,key))?value:void 0;};}
return goodJSON.stringify(obj,replacer,opt_space);})});cajita={log:log,fail:fail,enforce:enforce,enforceType:enforceType,directConstructor:directConstructor,getFuncCategory:getFuncCategory,isDirectInstanceOf:isDirectInstanceOf,isInstanceOf:isInstanceOf,isRecord:isRecord,isArray:isArray,isJSONContainer:isJSONContainer,freeze:freeze,isFrozen:isFrozen,copy:copy,snapshot:snapshot,canReadPub:canReadPub,readPub:readPub,hasOwnPropertyOf:hasOwnPropertyOf,readOwn:readOwn,canEnumPub:canEnumPub,canEnumOwn:canEnumOwn,canInnocentEnum:canInnocentEnum,BREAK:BREAK,allKeys:allKeys,forAllKeys:forAllKeys,ownKeys:ownKeys,forOwnKeys:forOwnKeys,canCallPub:canCallPub,callPub:callPub,canSetPub:canSetPub,setPub:setPub,canDeletePub:canDeletePub,deletePub:deletePub,Token:Token,identical:identical,newTable:newTable,identity:identity,callWithEjector:callWithEjector,eject:eject,GuardT:GuardT,Trademark:Trademark,guard:guard,passesGuard:passesGuard,stamp:stamp,makeSealerUnsealerPair:makeSealerUnsealerPair,USELESS:USELESS,manifest:manifest,args:args,construct:construct,inheritsFrom:inheritsFrom,getSuperCtor:getSuperCtor,getOwnPropertyNames:getOwnPropertyNames,getProtoPropertyNames:getProtoPropertyNames,getProtoPropertyValue:getProtoPropertyValue,beget:beget,PseudoFunctionProto:PseudoFunctionProto,PseudoFunction:PseudoFunction,isPseudoFunc:isPseudoFunc,enforceNat:deprecate(enforceNat,'___.enforceNat','Use (x === x >>> 0) instead as a UInt32 test')};forOwnKeys(cajita,markFuncFreeze(function(k,v){switch(typeOf(v)){case'object':{if(v!==null){primFreeze(v);}
break;}
case'function':{markFuncFreeze(v);break;}}}));sharedImports={cajita:cajita,'null':null,'false':false,'true':true,'NaN':NaN,'Infinity':Infinity,'undefined':void 0,parseInt:markFuncFreeze(parseInt),parseFloat:markFuncFreeze(parseFloat),isNaN:markFuncFreeze(isNaN),isFinite:markFuncFreeze(isFinite),decodeURI:markFuncFreeze(decodeURI),decodeURIComponent:markFuncFreeze(decodeURIComponent),encodeURI:markFuncFreeze(encodeURI),encodeURIComponent:markFuncFreeze(encodeURIComponent),escape:escape?markFuncFreeze(escape):(void 0),Math:Math,JSON:safeJSON,Object:Object,Array:Array,String:String,Boolean:Boolean,Number:Number,Date:Date,RegExp:RegExp,Error:Error,EvalError:EvalError,RangeError:RangeError,ReferenceError:ReferenceError,SyntaxError:SyntaxError,TypeError:TypeError,URIError:URIError};forOwnKeys(sharedImports,markFuncFreeze(function(k,v){switch(typeOf(v)){case'object':{if(v!==null){primFreeze(v);}
break;}
case'function':{primFreeze(v);break;}}}));primFreeze(sharedImports);___={getLogFunc:getLogFunc,setLogFunc:setLogFunc,primFreeze:primFreeze,canRead:canRead,grantRead:grantRead,canEnum:canEnum,grantEnum:grantEnum,canCall:canCall,canSet:canSet,grantSet:grantSet,canDelete:canDelete,grantDelete:grantDelete,readImport:readImport,isCtor:isCtor,isFunc:isFunc,markCtor:markCtor,extend:extend,markFuncFreeze:markFuncFreeze,markXo4a:markXo4a,markInnocent:markInnocent,asFunc:asFunc,toFunc:toFunc,inPub:inPub,canSetStatic:canSetStatic,setStatic:setStatic,typeOf:typeOf,hasOwnProp:hasOwnProp,deleteFieldEntirely:deleteFieldEntirely,tameException:tameException,primBeget:primBeget,callStackUnsealer:callStackUnsealer,RegExp:RegExp,GuardStamp:GuardStamp,asFirstClass:asFirstClass,initializeMap:initializeMap,iM:initializeMap,useGetHandler:useGetHandler,useSetHandler:useSetHandler,grantFunc:grantFunc,grantGenericMethod:grantGenericMethod,handleGenericMethod:handleGenericMethod,grantTypedMethod:grantTypedMethod,grantMutatingMethod:grantMutatingMethod,grantInnocentMethod:grantInnocentMethod,enforceMatchable:enforceMatchable,all2:all2,tamesTo:tamesTo,tamesToSelf:tamesToSelf,tame:tame,untame:untame,getNewModuleHandler:getNewModuleHandler,setNewModuleHandler:setNewModuleHandler,obtainNewModule:obtainNewModule,makeNormalNewModuleHandler:makeNormalNewModuleHandler,loadModule:loadModule,prepareModule:prepareModule,NO_RESULT:NO_RESULT,getId:getId,getImports:getImports,unregister:unregister,grantEnumOnly:deprecate(grantEnum,'___.grantEnumOnly','Use ___.grantEnum instead.'),grantCall:deprecate(grantGenericMethod,'___.grantCall','Choose a method tamer (e.g., ___.grantFunc,'+'___.grantGenericMethod,etc) according to the '+'safety properties of calling and reading the '+'method.'),grantGeneric:deprecate(grantGenericMethod,'___.grantGeneric','Use ___.grantGenericMethod instead.'),useApplyHandler:deprecate(useApplyHandler,'___.useApplyHandler','Use ___.handleGenericMethod instead.'),useCallHandler:deprecate(useCallHandler,'___.useCallHandler','Use ___.handleGenericMethod instead.'),handleGeneric:deprecate(useCallHandler,'___.handleGeneric','Use ___.handleGenericMethod instead.'),grantTypedGeneric:deprecate(useCallHandler,'___.grantTypedGeneric','Use ___.grantTypedMethod instead.'),grantMutator:deprecate(useCallHandler,'___.grantMutator','Use ___.grantMutatingMethod instead.'),useDeleteHandler:deprecate(useDeleteHandler,'___.useDeleteHandler','Refactor to avoid needing to handle '+'deletions.'),isXo4aFunc:deprecate(isXo4aFunc,'___.isXo4aFunc','Refactor to avoid needing to dynamically test '+'whether a function is marked exophoric.'),xo4a:deprecate(markXo4a,'___.xo4a','Consider refactoring to avoid needing to explicitly '+'mark a function as exophoric. Use one of the exophoric '+'method tamers (e.g., ___.grantGenericMethod) instead.'+'Otherwise, use ___.markXo4a instead.'),ctor:deprecate(markCtor,'___.ctor','Use ___.markCtor instead.'),func:deprecate(markFuncFreeze,'___.func','___.func should not be called '+'from manually written code.'),frozenFunc:deprecate(markFuncFreeze,'___.frozenFunc','Use ___.markFuncFreeze instead.'),markFuncOnly:deprecate(markFuncFreeze,'___.markFuncOnly','___.markFuncOnly should not be called '+'from manually written code.'),sharedImports:sharedImports};forOwnKeys(cajita,markFuncFreeze(function(k,v){if(k in ___){fail('internal: initialization conflict: ',k);}
if(typeOf(v)==='function'){grantFunc(cajita,k);}
___[k]=v;}));setNewModuleHandler(makeNormalNewModuleHandler());})(this);
