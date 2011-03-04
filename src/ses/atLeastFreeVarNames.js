// Copyright (C) 2010 Google Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview export an "atLeastFreeVarNames" function for internal
 * use by the SES-on-ES5 implementation, which enumerates at least the
 * identifiers which occur freely in a source text string.
 */


/**
 * Calling atLeastFreeVarNames on a {@code programSrc} string
 * argument, the result should include at least all the free variable
 * names of {@code programSrc}.
 *
 * <p>Assuming that programSrc that parses as a strict Program,
 * atLeastFreeVarNames(programSrc) returns a Record whose enumerable
 * own property names must include the names of all the free variables
 * occuring in programSrc. It can include as many other strings as is
 * convenient so long as it includes these. The value of each of these
 * properties should be {@code true}.
 */
var atLeastFreeVarNames;
(function() {
//  "use strict"; // not here because of an unreported Caja bug

  /////////////// KLUDGE SWITCHES ///////////////

  /**
   * Currently we use this to limit the input text to ascii only, in
   * order to simply our identifier gathering. This is only a
   * temporary development hack.
   */
  function LIMIT_SRC(programSrc) {
    if (!((/^[\u0000-\u007f]*$/m).test(programSrc))) {
      throw new Error('Non-ascii texts not yet supported');
    }
  }

  /**
   * This is safe only because of the above LIMIT_SRC
   * To do this right takes quite a lot of unicode machinery. See
   * the "Identifier" production at
   * http://es-lab.googlecode.com/svn/trunk/src/parser/es5parser.ojs
   * which depends on
   * http://es-lab.googlecode.com/svn/trunk/src/parser/unicode.js
   *
   * SECURITY_BUG: TODO: This must still identify possible identifiers
   * that contain {@code \u} encoded characters.
   */
  var SHOULD_MATCH_IDENTIFIER = (/(\w|\$)+/gm);


  //////////////// END KLUDGE SWITCHES ///////////

  atLeastFreeVarNames = function atLeastFreeVarNames(programSrc) {
    programSrc = String(programSrc);
    LIMIT_SRC(programSrc);
    // Now that we've temporarily limited our attention to ascii...
    var result = Object.create(null);
    var a;
    while ((a = SHOULD_MATCH_IDENTIFIER.exec(programSrc))) {
      var name = a[0];
      if (name === 'ident___') {
        // See WeakMap.js
        throw new EvalError('Apparent identifier "ident___" not permitted');
      }
      result[name] = true;
    }
    return result;
  };

})();
