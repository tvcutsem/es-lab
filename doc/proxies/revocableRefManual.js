function makeRevocableRef(target) {
  var enabled = true;
  return {
    caretaker: Proxy.create({
      get: function(rcvr, name) {
        if (!enabled) { throw new Error("revoked"); }
        return target[name];
      },
      has: function(name) {
        if (!enabled) { throw new Error("revoked"); }
        return name in target;      
      }
      // ... and so on for all other traps
    }, Object.getPrototypeOf(target)),
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