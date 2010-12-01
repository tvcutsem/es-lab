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
                if (!flag){ throw 'Invalid Box'}
                return payload;
            }finally{
                flag = false;
                payload = null;
            }
        }
    }
};
    
    
    attacker = (function Mint(){
	var brand = Brand();
	return function Purse(balance){
            // no enforceNat line.
            function decr(amount){
		balance = balance - amount;
            }
            return {
		getBalance: function(){return balance;},
		makePurse: function(){return Purse(0);},
		getDecr: function(){return brand.seal(decr);},
		deposit: function(amount,src){
                    var box = src.getDecr();
                    var decr = brand.unseal(box);
                    var newBal = balance + amount;
                    decr(amount);
                    balance = newBal;}
            }
        }
    })();
    
    
