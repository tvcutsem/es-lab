# Safe Mashups #

Currently, to mashup with library code provided by `https://example.org/badCode.js`, one might say `<script src="https://example.org/badCode.js">`, leaving oneself fully vulnerable to `example.org`. Instead, if
  * the browser supports [SES](SecureEcmaScript.md), either directly or by running [these scripts](http://code.google.com/p/google-caja/source/browse/trunk/src/com/google/caja/ses/) on a [secureable ES5](SecureableES5.md) implementation,
  * the `badCode.js` library is SES compatible, and
  * the browser supports the [Uniform Messaging Policy](http://dev.w3.org/2006/waf/UMP/),

then the library's server could serve `badCode.js` with an `Access-Control-Allow-Origin:*` header, for example, by putting

```
    <FilesMatch "\.js$">
      Header set Access-Control-Allow-Origin "*"
    </FilesMatch>
```

in a root `.htaccess` file. Adding this header is a good idea for all resources that parse as JavaScript anyway, as should be the case for all `*.js` files and for all JSONP services, since these resources are already not protected by the Same Origin Policy. For these resources, adding this header _cannot_ result in any loss of security.

Then a web page could obtain and use this library by doing

```
    var xhr = new UniformRequest();
    xhr.open("GET", "https://example.org/badCode.js");
    xhr.onreadystatechange = function() {
      if (this.readyState === 4 && this.status === 200 && this.responseXML) {
        var badCode = this.responseXML;
        var result = eval(badCode);
        // ... use result ...
      } else {//...
      }
    };
    xhr.send();
```

By this pattern, the badCode might still lock up your page with an infinite loop. Beyond that, its only ability to affect your world is according to the objects you make accessible to `result`. The API of good SES libraries should demand only objects that provide it least authority, enabling that library's users to understand and bound the risks involved in using that library.

Of course, this applies to other forms of mashups besides libraries per se, such as gadgets, analytics, etc... In that case, if the browser further supports
  * [Proxies](http://wiki.ecmascript.org/doku.php?id=harmony:proxies)
  * [WeakMap](http://wiki.ecmascript.org/doku.php?id=harmony:weak_maps)s
then a gadget can be imported within a [Membrane](http://code.google.com/p/es-lab/source/browse/trunk/src/membrane.js) by using, for example, the `eval1` from the [compartment pattern](http://code.google.com/p/es-lab/) instead of `eval` above. The presence of that gadget on the page can then be revoked at will, after which it will no longer even be able to occupy memory.