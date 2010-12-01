
  
attacker = (function(global) {
 

  function hasOwnPropertyO(obj, name) {
   
      if ( obj[$A$AdsafeReject(name)] === obj) { return true; }
  }

 
 
    function handleGenericMethod(obj, name, func) {
	  obj[$A$AdsafeReject(name)] = func
  }




  
 
    /// Object

  handleGenericMethod(Object.prototype, 'hasOwnProperty',
                      function hasOwnPropertyHandler(name) {
    return hasOwnPropertyO(this, name);
  });
})();
