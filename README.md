# ES-lab: experiments with proposed extensions to JavaScript

 * The core of a Secure ECMAScript (SES) [runtime](https://rawgit.com/tvcutsem/es-lab/master/src/ses/contract.html). Sources at [caja](http://code.google.com/p/google-caja/source/browse/trunk/src/com/google/caja/ses/). (Old sources at [es-lab](http://code.google.com/p/es-lab/source/browse/trunk/src/ses/).)
 * [DirectProxies](http://es-lab.googlecode.com/svn/trunk/src/proxies/DirectProxies.js) a wrapper library that implements the new [Direct Proxy API](http://wiki.ecmascript.org/doku.php?id=harmony:direct_proxies) on top of the older [Harmony Proxies API](http://wiki.ecmascript.org/doku.php?id=harmony:proxies). Tested in Firefox 8.
 * [Membranes](http://code.google.com/p/es-lab/source/browse/trunk/src/membrane.js) to be built on ES-Harmony [Proxies](http://wiki.ecmascript.org/doku.php?id=harmony:proxies) and [WeakMap](http://wiki.ecmascript.org/doku.php?id=harmony:weak_maps)s.
 * [traits.js](https://github.com/traitsjs/traits.js), a traits library for ES5 that is backwards-compatible with ES3 (original [here](http://code.google.com/p/es-lab/wiki/Traits)).
 * An [OMeta-based](http://tinlizzie.org/ometa) [parser](http://es-lab.googlecode.com/svn/trunk/site/esparser/index.html) for Ecmascript 5, written in Javascript, generating a [JsonML](http://jsonml.org)-based JsonMLASTFormat AST.

Ecmascript 5, proxies and traits are discussed in these [talks](http://code.google.com/p/es-lab/wiki/Talks).

### Script Compartments ###

These abstractions compose well. For example, in an SES frame as initialized by initSES.js

```js
    var compartment1 = makeMembrane(cajaVM.eval);
    var eval1 = compartment1.wrapper;
    var gate1 = compartment1.gate;
    var badCode = //... obtain potentially malicious code from somewhere ...
    var result = eval1(badCode);
    //... use result ...
    gate1.revoke();
    //... contents of compartment gone and collectible ...
```

A membrane around an SES `eval` creates a compartment in which one can run potentially malicious code, confident that the resulting potentially malicious objects can interact with the world outside this compartment _only_ as permitted by the objects you provide them. Once the compartment is revoked, not only is all their connectivity severed, it is severed in ways the garbage collector can recognize. Given a good enough collector, these hostile objects cannot even continue to occupy your memory.

On browsers supporting SES and the [Uniform Messaging Policy](http://dev.w3.org/2006/waf/UMP/), we can [mashup](SafeMashups.md) code from multiple origins without the usual vulnerabilities.

# News #

[SES announcement on es-discuss](https://mail.mozilla.org/pipermail/es-discuss/2010-August/011684.html)
