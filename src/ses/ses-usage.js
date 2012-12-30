// To start SES under nodejs
// Adapted from https://gist.github.com/3669482

// Running the following command in a directory with the SES sources
//    $ node ses-usage.js
// Should print something like
//     Max Severity: Safe spec violation(1).
//     414 Apparently fine
//     24 Deleted
//     1 Skipped
//     Max Severity: Safe spec violation(1).
//     initSES succeeded.
//    hi

var FS = require("fs");
var VM = require("vm");

var source = FS.readFileSync("logger.js") +
     FS.readFileSync("repairES5.js") +
     FS.readFileSync("WeakMap.js") +
     FS.readFileSync("debug.js") +
     FS.readFileSync("StringMap.js") +
     FS.readFileSync("whitelist.js") +
     FS.readFileSync("atLeastFreeVarNames.js") +
     FS.readFileSync("startSES.js") +
     FS.readFileSync("ejectorsGuardsTrademarks.js") +
     FS.readFileSync("hookupSESPlus.js");

var script = new VM.Script(source);
script.runInThisContext();

var f = cajaVM.compileExpr("console.log('hi')");
f({console: console});
