a = {} // This is an important line

a[0] = function NOTreachable(){}

a[1] = function reachable(){}

attacker = a[1]

// precious should not be reachable
