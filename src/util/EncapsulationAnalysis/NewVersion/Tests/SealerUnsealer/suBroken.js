function Brand() {
    var flag = false;
    var squirrel = null;
    
    return	 {
	seal: function(payload) {
	    return function box() {
		squirrel = payload;
		flag = true;
	    }
	    box.toString = function() {
		return "(box)";
	    }
	},
	unseal: function(box) {
	    flag = false; 
	    squirrel = null;
	    box();
	    if (!flag) {
		throw 'Invalid Box';
	    }
	    return squirrel;
	}
    };
}

    
    
var brand = Brand();

function precious(){}

    attacker =   {go: function goFunction(){brand.unseal(brand.seal(precious))},
		  unseal: brand.unseal}


