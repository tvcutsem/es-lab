// Copyright (C) 2009 Google Inc.
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

'use strict';

/**
 * See http://wiki.commonjs.org/wiki/Modules/ScriptModules for
 * boilerplate explanation.
 */
(function(){function mod(require,exports) {

  /**
   * <tt>element</tt> is assumed to be a valid JSONML term.
   * 
   * <p>A visitor is used for top-down recursive processing, where the
   * visitor is in control of further recursion. To make better use of
   * ES5's higher-order array methods together with bound functions, the
   * <tt>element</tt> to be visited is the last argument.
   */ 
  function visit(visitor, element) {
    var args = element.slice(1);
    if (Array.isArray(args[0])) {
      args = [{}].concat(args);
    }
    var mangle = 'visit' + element[0];
    //return visitor[mangle](...args);
    return visitor[mangle].apply(visitor, args);
  }
  exports.visit = visit;
  
  /**
   * A variation on the visitor pattern where further recursion is
   * suppressed only if the partialVisitor has the named 'visit' method 
   * and that method returns truthy.
   * 
   * <p>Otherwise, visitThrough proceeds to visit the child elements with
   * the same partialVisitor.
   */
  function visitThrough(partialVisitor, element) {
    var args = element.slice(1);
    if (Array.isArray(args[0])) {
      args = [{}].concat(args);
    }
    var mangle = 'visit' + element[0];
    if (mangle in partialVisitor &&
        partialVisitor[mangle].apply(partialVisitor, args)) {
      return;
    }
    args.slice(1).forEach(visitThrough.bind(undefined, partialVisitor));
  }
  exports.visitThrough = visitThrough;
  
  /**
   * <tt>element</tt> is assumed to be a valid JSONML term.
   * 
   * <p>A builder is used for bottom-up recursive processing, where the
   * recursion happens outside the builder. Each call to the builder is
   * given the results of prior build calls on its children. To make
   * better use of ES5's higher-order array methods together with bound
   * functions, the <tt>element</tt> to be processed is the last argument.
   */ 
  function postBuild(builder, element) {
    var attrs = element[1];
    var children;
    if (Array.isArray(attrs)) {
      children = element.slice(1);
      attrs = {};
    } else {
      children = element.slice(2);
    }
    var builtChildren = children.map(postBuild.bind(undefined, builder));
    return builder['build' + element[0]].apply(builder, 
                                               [attrs].concat(builtChildren));
  }
  exports.postBuild = postBuild;
  
  /**
   * Assigns <tt>preOrder:</tt> numbers to a JsonML tree in place.
   * 
   * <p>Assumes that each subtree is unique and unshared, so that it is
   * safe to modify in place. When this might not be the case, the tree
   * should first be copied; for example, by 
   * <tt>JSON.parse(JSON.stringify(tree)</tt>.
   * 
   * <p>Since each resulting node has a <tt>preOrder:</tt> attribute,
   * each node is therefore normalized to have an attributes record.
   * 
   * <p>Returns a record
   * <ul>
   * <li>whose <tt>tree:</tt> is the modified-in-place input tree, 
   * <li>whose <tt>nodes:</tt> is an array of all the elements in tree
   *     indexed by their preOrder number, 
   * <li>and whose <tt>optParents</tt> is an array of the parent
   *     elements of each element in the tree, indexed by the preOrder
   *     number of its immediate children. Since the root of the tree
   *     has no parent, <tt>optParents[0] === null</tt>.
   * </ul>
   */
  function preOrder(tree) {
    var count = 0;
    var nodes = [];
    var optParents = [];
    function recur(optParent, element) {
      if (element.length < 2 || Array.isArray(element[1])) {
        element.splice(1, 0, {});
      }
      element[1].preOrder = count;
      nodes[count] = element;
      optParents[count] = optParent;
      count++;
      element.slice(2).forEach(recur.bind(undefined, element));
    }
    recur(null, tree);
    return {
      tree: tree,
      nodes: nodes,
      optParents: optParents
    };
  }
  exports.preOrder = preOrder;
  
  /**
   * Static generic for <tt>Array.prototype.slice()</tt>.
   * 
   * <p><tt>slice(array, start, end)</tt> acts like
   * <tt>array.slice(start, end)</tt> under the assumption that
   * <tt>array</tt> is an array and has not overridden
   * <tt>Array.prototype.slice()</tt>. 
   * 
   * <p>We export this function from jsonMLWalkers because the visitors
   * being walked will often wish to do, for example,
   * <tt>slice(arguments, 2).forEach(..)</tt> to loop over all arguments
   * starting with arguments[2].
   */
  function slice(arrayLike, start, end) {
    return Array.prototype.slice.call(arrayLike, start, end);
  }
  exports.slice = slice;
  
// See http://wiki.commonjs.org/wiki/Modules/ScriptModules for
// boilerplate explanation.
};require.install?require.install('jsonMLWalkers',mod):mod(require,exports);})();
