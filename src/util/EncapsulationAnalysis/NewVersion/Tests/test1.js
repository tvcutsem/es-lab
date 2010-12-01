a = {};

a['1'] = function NOTReachable(){};

a['getElementById'] = function reachable(){};

attacker = a[$A$NumNot(b)]; 
