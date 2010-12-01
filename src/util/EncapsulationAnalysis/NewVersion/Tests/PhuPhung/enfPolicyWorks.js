(function(){
  
    var enforcePolicy = function(pointcut, Policy) {
			var source = (typeof (pointcut.target.__proto__) != 'undefined') ? pointcut.target.__proto__ : pointcut.target;

        var method = pointcut.method
        var original = source1[method];
        original.apply = Function.prototype.apply;
        Policy.apply = Function.prototype.apply;            		         
        var aspect = function() {
			var invocation = { object: this, args: arguments };
            var args = arguments;
            return Policy.apply(invocation.object, 
            				    [{ arguments: invocation.args, 
            					   method: method, 
            				       proceed: function(){ return original.apply(invocation.object, invocation.args);}
           				     }
           				    
           					    ]);
    }
        source[$A$AdsafeRejectNot(method)] = aspect;
         return aspect;                
    };
	
	function policyLog(){};
 


var policylog = function(s) {
        if (_debug) {
            document.writeln(s+"<br>");            
        }
    };



 var   HTMLBodyElement = {}
    HTMLBodyElement.appendChild = function precious1(){};
attacker = enforcePolicy({target : HTMLBodyElement , method: 'appendChild'},
			   function(invocation){
            		  document.writeln('<br>document.body.appendChild is wrapped<br>');
					  var node = invocation.arguments[0];
				
					  newnode = invocation.proceed(); 					
					  //newnode.src ='http://chalmers.se';
				
					  enforceWindow(newnode.contentWindow);  
            		  return newnode;
            	   }
			);
			
    document = {};
document.createElement = function precious2(){}
attacker = enforcePolicy({target : document , method: 'createElement' },
		   function(invocation){
		   	 var tagName = invocation.arguments[0];
			 if(tagName=="iframe"){
			 	policylog("creating a dynamic iframe is wrapped");
			 }	   	
			 ifrm = invocation.proceed();
			 ifrmWindow = ifrm.contentWindow; 
		       policylog("ifrmWindow ="+ifrmWindow);

			 return ifrm;
		   }
			);



})()
