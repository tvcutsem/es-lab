function Brand(){
    var flag = false;
    var payload = null;
    
    return {
	seal: function (payloadToSeal){
            function box(){
		flag = true;
		payload = payloadToSeal;
            }
            box.toString = function(){return "(box)";}
            return box;
        },
	unseal: function(box){
            flag = false;
            payload = null;
            try{
                box();
                if (!flag)
		{ throw 'Invalid Box'}
		else{
                    return payload;
		}
            }finally{
                flag = false;
                payload = null;
            }
        }
    }
};
    
var brand = Brand();

var box = brand.seal(function precious(){});

//attacker = [box,brand.seal]

attacker =   {go: function goFunction(){brand.unseal(brand.seal(precious))},
		  unseal: brand.unseal}
