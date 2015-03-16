# What is "Secureable EcmaScript 5"? #

Informally, it is an ES5 implementation in which [initSES.js](http://code.google.com/p/google-caja/source/browse/trunk/src/com/google/caja/ses/) succeeds, and in which that success results in an object-capability safe environment for untrusted code imported through the resulting `eval` or `Function`.

Beyond being simply a conforming ES5 implementation, the additional constraints:
  * All properties on accessible primordial objects (primordial objects other than the global object) must be deleteable. The `initSES.js` script will delete all properties not on its whitelist, where its whitelist (at the time of this writing) includes exactly the global names and path names specified in ES5.
  * Of the objects that survive this step, i.e., those named by that whitelist and those created at runtime, any additional behaviors they may have beyond that specified in ES5 must not imply they provide authority exceeding what their specified behavior by itself would provide.
    * For example, the [global-state behavior](http://code.google.com/p/google-caja/issues/detail?id=528) of `RegExp.prototype.exec` on some browsers, while not violating the ES5 spec, if unconstrained, would cause such an ES5 system to not be classified as a _Secureable ES5 system_. For Secureable ES5, the issue in this case is solvable compatibly with existing practice. These de-facto static properties on the RegExp constructor should be deletable. If these are deleted and then the RegExp constructor is frozen, then RegExp matches should still succeed but without leaking any static mutable state.
  * **What else???**

The result of running this success is a JavaScript environment supporting [draft SES (Secure EcmaScript)](SecureEcmaScript.md).