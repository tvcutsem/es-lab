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

// element is assumed to be a valid JSONML term

function visit(element, visitor) {
  var args = element.slice(1);
  if (Array.isArray(args[0])) {
    args = [{}].concat(args);
  }
  //return visitor['visit' + element[0]](...args);
  return visitor['visit' + element[0]].apply(visitor, args);
}

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
  return builder['build' + element[0]].apply(builder, [attrs].concat(builtChildren));
}