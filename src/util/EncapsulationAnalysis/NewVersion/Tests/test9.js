a = {} // This is an important line

a[0] = function NOTreachable(){}

a[1] = function NOTreachable(){}

attacker = [a[$A$NumNot(1)], function reachable(){}]
