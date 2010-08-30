var whitelist = {
  "cajaVM": {                        // Caja support
    "log": true,
    "compile": true,
    "protect": true
  },
  "Q": {                             // Dr. SES support
    "get": true,
    "post": true,
    "when": true,
    "near": true,
    "def": true
  },
  "WeakMap": true,                   // ES-Harmony proposal
  "Proxy": {                         // ES-Harmony proposal
    "create": true,
    "createFunction": true
  },
  "Object": {
    "getPropertyDescriptor": true,   // ES-Harmony proposal
    "getPropertyNames": true,        // ES-Harmony proposal
    "eq": true,                      // ES-Harmony strawman
    "prototype": {
      "constructor": "*",
      "toString": "*",
      "toLocaleString": "*",
      "valueOf": true,
      "hasOwnProperty": true,
      "isPrototypeOf": true,
      "propertyIsEnumerable": true
    },
    "getPrototypeOf": true,
    "getOwnPropertyDescriptor": true,
    "getOwnPropertyNames": true,
    "create": true,
    "defineProperty": true,
    "defineProperties": true,
    "seal": true,
    "freeze": true,
    "preventExtensions": true,
    "isSealed": true,
    "isFrozen": true,
    "isExtensible": true,
    "keys": true
  },
  "NaN": true,
  "Infinity": true,
  "undefined": true,
  "eval": true,
  "parseInt": true,
  "parseFloat": true,
  "isNaN": true,
  "isFinite": true,
  "decodeURI": true,
  "decodeURIComponent": true,
  "encodeURI": true,
  "encodeURIComponent": true,
  "Function": {
    "prototype": {
      "apply": true,
      "call": true,
      "bind": true,
      "prototype": "*",
      "length": "*",
      "caller": "skip",    // when not poison, could be fatal
      "arguments": "skip", // when not poison, could be fatal
      "arity": "skip",     // non-std, deprecated in favor of length
      "name": "skip"       // non-std
    }
  },
  "Array": {
    "prototype": {
      "concat": true,
      "join": true,
      "pop": true,
      "push": true,
      "reverse": true,
      "shift": true,
      "slice": true,
      "sort": true,
      "splice": true,
      "unshift": true,
      "indexOf": true,
      "lastIndexOf": true,
      "every": true,
      "some": true,
      "forEach": true,
      "map": true,
      "filter": true,
      "reduce": true,
      "reduceRight": true,
      "length": "skip"       // can't be redefined on Mozilla
    },
    "isArray": true
  },
  "String": {
    "prototype": {
      "valueOf": true,
      "charAt": true,
      "charCodeAt": true,
      "concat": true,
      "indexOf": true,
      "lastIndexOf": true,
      "localeCompare": true,
      "match": true,
      "replace": true,
      "search": true,
      "slice": true,
      "split": true,
      "substring": true,
      "toLowerCase": true,
      "toLocaleLowerCase": true,
      "toUpperCase": true,
      "toLocaleUpperCase": true,
      "trim": true,
      "length": "skip"           // can't be redefined on Mozilla
    },
    "fromCharCode": true
  },
  "Boolean": {
    "prototype": {
      "valueOf": true
    }
  },
  "Number": {
    "prototype": {
      "valueOf": true,
      "toFixed": true,
      "toExponential": true,
      "toPrecision": true
    },
    "MAX_VALUE": true,
    "MIN_VALUE": true,
    "NaN": true,
    "NEGATIVE_INFINITY": true,
    "POSITIVE_INFINITY": true
  },
  "Math": {
    "E": true,
    "LN10": true,
    "LN2": true,
    "LOG2E": true,
    "LOG10E": true,
    "PI": true,
    "SQRT1_2": true,
    "SQRT2": true,

    "abs": true,
    "acos": true,
    "asin": true,
    "atan": true,
    "atan2": true,
    "ceil": true,
    "cos": true,
    "exp": true,
    "floor": true,
    "log": true,
    "max": true,
    "min": true,
    "pow": true,
    "random": true, // questionable
    "round": true,
    "sin": true,
    "sqrt": true,
    "tan": true
  },
  "Date": {        // no-arg Date constructor is questionable
    "prototype": {
      "toDateString": true,
      //...
      "getTime": true,
      //...
      "getDate": true,
      //...
      "toUTCString": true,
      "toISOString": true,
      "toJSON": true
    },
    "parse": true,
    "UTC": true,
    "now": true    // questionable
  },
  "RegExp": {
    "prototype": {
      "exec": true,
      "test": true,
      "source": "skip",
      "global": "skip",
      "ignoreCase": "skip",
      "multiline": "skip",
      "lastIndex": "skip",
      "sticky": "skip"       // non-std
    }
  },
  "Error": {
    "prototype": {
      "name": "*",
      "message": "*"
    }
  },
  "EvalError": {
    "prototype": true
  },
  "RangeError": {
    "prototype": true
  },
  "ReferenceError": {
    "prototype": true
  },
  "SyntaxError": {
    "prototype": true
  },
  "TypeError": {
    "prototype": true
  },
  "URIError": {
    "prototype": true
  },
  "JSON": {
    "parse": true,
    "stringify": true
  }
};
