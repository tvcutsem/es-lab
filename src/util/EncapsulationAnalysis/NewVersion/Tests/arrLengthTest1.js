var o1 = {};
var o2 = {toString: function(){o1.b = this.foo; return 0;}, foo: function reachable(){}}
var arr = [];

arr.length = o2;

attacker = o1;
