Object.isPrimitive = function(o) {
  //return o !== Object(o);
  var t = typeof o;
  return !o || t === 'string' || t === 'number' || t === 'boolean';
}

function makeForwardingHandler(obj) {
  return {
  	getOwnPropertyDescriptor: function(name) {
  	    var desc = Object.getOwnPropertyDescriptor(obj);
  	    // a trapping proxy's properties must always be configurable
  	    desc.configurable = true;
  	    return desc;
  	},
  	getPropertyDescriptor: function(name) {
  	    var desc = Object.getPropertyDescriptor(obj); // assumed
  	    // a trapping proxy's properties must always be configurable
  	    desc.configurable = true;
  	    return desc;
  	},
  	getOwnPropertyNames: function() {
  	    return Object.getOwnPropertyNames(obj);
  	},
  	defineProperty: function(name, desc) {
  	    return Object.defineProperty(obj, name, desc);
  	},
  	'delete': function(name) { return delete obj[name]; },
  	fix: function() {
	    // As long as obj is not frozen, the proxy won't allow itself to be fixed
	    // if (!Object.isFrozen(obj)) [not implemented in SpiderMonkey]
	    //     return undefined;
	    // return Object.getOwnProperties(obj); // assumed [not implemented in SpiderMonkey]
	    var props = {};
	    for (x in obj)
		    props[x] = Object.getOwnPropertyDescriptor(obj, x);
	    return props;
  	},
   	has: function(name) { return name in obj; },
  	hasOwn: function(name) { return ({}).hasOwnProperty.call(obj, name); },
  	get: function(receiver, name) { return obj[name]; },
  	set: function(receiver, name, val) { obj[name] = val; return true; }, // bad behavior when set fails in non-strict mode
  	enumerate: function() {
  	    var result = [];
  	    for (name in obj) { result.push(name); };
  	    return result;
  	},
  	enumerateOwn: function() { return Object.keys(obj); }
  };
};

function toArray(arrayLike) {
  return Array.prototype.slice.call(arrayLike, 0);
}

function makeMembrane(target) {
  var enabled = true;
  
  function wrap(wrapped) {
    if (Object.isPrimitive(wrapped)) {
      // primitives provide only irrevocable knowledge
      return wrapped; // so don't bother wrapping them
    }
    
    function wrapCall(fun, theThis, args) {
      if (!enabled) { throw new Error("revoked"); }
      try {
        return wrap(fun.apply(theThis, args.map(wrap)));
      } catch (e) {
        throw wrap(e);
      }
    }
 
    var baseHandler = makeForwardingHandler(wrapped);
    var metaHandler = Proxy.create({
      get: function(rcvr, name) {
        return function() {
          return wrapCall(baseHandler[name], baseHandler, toArray(arguments));
        };
      }
    });
    
    if (typeof wrapped === "function") {
      return Proxy.createFunction(metaHandler, function() {
        return wrapCall(wrapped, wrap(this), toArray(arguments));
      });
    } else {
      return Proxy.create(metaHandler, 
                          wrap(Object.getPrototypeOf(wrapped)));
    }
  }

  return {
    wrapper: wrap(target),
    gate: {
      revoke: function() { enabled = false; }
    }
  };
};

function assert(b, reason) {
  if (!b) throw new Error('assertion failed: '+reason);
}

var res = { x: 42 };
var o = {
  m: function() {
    return res;
  }
};
var ref = makeMembrane(o);
var r = ref.wrapper;
assert(o.m().x === 42, 'invoking o.m directly');
var wrappedres = r.m();
assert(wrappedres !== res, 'wrappedres is wrapped');
assert(wrappedres.x === 42, 'invoking .x through membrane');

ref.gate.revoke();
try {
  wrappedres.x;
  assert(false, 'expected r.m to throw revoked exception');
} catch (e) {
  assert(e.message==='revoked', 'r.m throws revoked');
}

print('ok');