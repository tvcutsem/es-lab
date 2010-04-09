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

function makeRevocableRef(target) {
  var enabled = true;
  var baseHandler = makeForwardingHandler(target);
  var metaHandler = Proxy.create({
    get: function(rcvr, name) {
      return function() {
        if (!enabled) { throw new Error("revoked"); }
        return baseHandler[name].apply(baseHandler, arguments);        
      }
    }
  });
  return {
    caretaker: Proxy.create(metaHandler, 
                 Object.getPrototypeOf(target)),
    revoker: {
      revoke: function() { enabled = false; }
    }
  };
};

function assert(b, reason) {
  if (!b) throw new Error('assertion failed: '+reason);
}

var o = { m: function() { return 1; }};
var ref = makeRevocableRef(o);
var r = ref.caretaker;
assert(o.m()===1, 'invoking o.m directly');
assert(r.m()===1, 'invoking o.m through revocable ref');
ref.revoker.revoke();
try {
  r.m();
  assert(false, 'expected r.m to throw revoked exception');
} catch (e) {
  assert(e.message==='revoked', 'r.m throws revoked');
}
print('ok');