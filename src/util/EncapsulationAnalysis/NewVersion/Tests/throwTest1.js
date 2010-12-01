function f(g){
try{
	g();
}
catch(x){
	x(function reachable(){});
}
}

attacker = f;
