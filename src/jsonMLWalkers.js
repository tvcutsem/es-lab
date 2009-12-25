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

/**
 * element is assumed to be a valid JSONML term.
 * 
 * <p>A visitor is used for top-down recursive processing, where the
 * visitor is in control of further recursion.
 */ 
function visit(element, visitor) {
  var args = element.slice(1);
  if (Array.isArray(args[0])) {
    args = [{}].concat(args);
  }
  //return visitor['visit' + element[0]](...args);
  return visitor['visit' + element[0]].apply(visitor, args);
}

/**
 * element is assumed to be a valid JSONML term.
 * 
 * <p>A builder is used for bottom-up recursive processing, where the
 * recursion happens outside the builder. Each call to the builder is
 * given the results of prior build calls on its children.
 */ 
function postBuild(element, builder) {
  var attrs = element[1];
  var children;
  if (Array.isArray(attrs)) {
    children = element.slice(1);
    attrs = {};
  } else {
    children = element.slice(2);
  }
  var builtChildren = children.map(function (child) {
    return postBuild(child, builder);
  });
  return builder['build' + element[0]].apply(builder, 
                                             [attrs].concat(builtChildren));
}

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
  function recur(element, optParent) {
    if (element.length < 2 || Array.isArray(element[1])) {
      element.splice(1, 0, {});
    }
    element[1].preOrder = count;
    nodes[count] = element;
    optParents[count] = optParent;
    count++;
    for (var i = 2, len = element.length; i < len; i++) {
      recur(element[i], element);
    }
  }
  recur(tree, null);
  return {
    tree: tree,
    nodes: nodes,
    optParents: parents
  };
}
