# How does draft SES (Secure EcmaScript) differ from ES5? #

In a frame of a [secureable ES5](SecureableES5.md) in which [initSES.js](http://code.google.com/p/google-caja/source/browse/trunk/src/com/google/caja/ses/) has been run, either prior to other scripts or in cooperation with other scripts, the resulting "language" as seen by that frame's new `eval` and `Function` bindings differs from full ES5 in the following ways:
  1. All properties of accessible primordials not defined by the ES5 spec are absent, even if the browser originally provided them.
  1. All accessible primordials (all primordials other than the global object) are frozen.
  1. The ES5-defined properties of the global object are frozen, though the global object is not frozen as a whole and its other properties are not perturbed. The global variables defined by the ES5 spec are thus effectively `const`.
  1. All calls to `eval` are calls to the SES _indirect eval function_. SES does not have a _direct eval operator_.
  1. All code is only in the strict subset of ES5, whether it so declares or not.
  1. The top level binding of `this` in an evaled Program is not the global object, but rather a frozen root object containing just the globals defined in the ES5 spec.
  1. Only the global variables defined by the ES5 spec are addressable as free variables.
  1. Any top level `var` or `function` declarations in an evaled Program are visible throughout that one Program, but not to other Programs nor to the global object.

By analogy with Operating systems, let's call code imported through `eval` or `Function` _user code_, and code run directly in the frame, not through `eval` or `Function`, _privileged code_. The first four restrictions above apply to privileged code in that frame as well. However, since privileged code is able to address the real global object and its host-defined properties, it still has access to the authority the browser provides to JavaScript executing in that frame. It is therefore in a position to subdivide this authority, and hand out the resulting attenuated authority to imported user code, on a least authority basis, by providing objects (such as DOM wrappers) whose behavior represents this attenuated authority.

As driven by the realization that it was possible to achieve the above restrictions on upcoming ES5 implementations (assuming they are [secureable](SecureableES5.md)), and with the goal of defining an SES that is minimally different from ES5, these seem like a good candidate list for the defining differences between SES and ES5. However, this currently has only the status of a strawman to be proposed to the EcmaScript committee.