
    var enforcePolicy = function(pointcut, Policy) {
        //var source = (typeof (pointcut.target.prototype) != 'undefined') ? pointcut.target.prototype : pointcut.target;
	var source = (typeof (pointcut.target.__proto__) != 'undefined') ? pointcut.target.__proto__ : pointcut.target;
        var method = pointcut.method
        var original = source[method];
        original.apply = Function.prototype.apply;
        Policy.apply = Function.prototype.apply;            		         
        detach(pointcut.types);
        var aspect = function() {
            var types = pointcut.types;
            var typedargs = arguments;
            var overlayedargs = arguments;
            if (types != null) {
			   	policylog("<br>typing");
				typedargs = checkTypes(types, arguments);
            }else {
            	policylog("<br>No type");
            }
			var invocation = { object: this, args: typedargs };
            var args = arguments;
            return Policy.apply(invocation.object, 
            				    [{ arguments: invocation.args, 
            					   method: method, 
            					   proceed: function() { 
           						      return original.apply(invocation.object, overlay(invocation.args, args)); 
           						   } 
           						 }
           					    ]);
         };
         source[method] = aspect;
         return aspect;                
    };
	
    var detach = function(object) {
        if (object != undefined)
            object.__proto__ = null;
        for (var x in object)
            if (typeof object[x] === 'object' && object[x] != null)
                detach(object[x]);
    }    
   
   var o = {p: function precious(){}} 			

enforcePolicy({target : document , method: 'createElement', types: ['string']/* , types: [{src:'string', tagName:'string'}]*/ },
		   function(invocation){
		   	 var tagName = invocation.arguments[0];
			 if(tagName=="iframe"){
			 	policylog("creating a dynamic iframe is wrapped");
			 }	   	
			 //createElementPolicy(invocation);
			 ifrm = invocation.proceed();
			 ifrmWindow = ifrm.contentWindow; 
			 policylog("ifrmWindow ="+ifrmWindow);
			 //enforcePolicy({target : ifrmWindow , method: 'alert'},
			   //function(invocation){
					 // alertPolicy(invocation);} 
			 //);
			 return ifrm;
		   }
);
//oldWrapper({target : document , method: 'createElement'},
	//		   function(invocation){
		//			 createElementPolicy(invocation);}
			//);			
			 
