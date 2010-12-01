var a = {}
var b = {toString: function(){a.foo = this.foo}, foo:function reachable(){}}
c[b];

attacker = a

