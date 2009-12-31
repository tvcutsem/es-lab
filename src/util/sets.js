/**
 * @fileoverview
 * Set operations that operate on sorted homogenous arrays of either
 * numbers or strings, sorted according to <.  NaN cannot be a member
 * of a set.
 *
 * Sets are immutable on ES5 and later.  Mutating sets on earlier
 * versions can lead to unpredictable behavior.
 *
 * @author mikesamuel@gmail.com
 * @provides set_union, set_singleton, set_difference, EMPTY_SET
 * @overrides Object
 */

// This code will work on ES < 5 but sets will not be immutable.
if (!Object.freeze) { Object.freeze = function (x) { return x; }; }

var EMPTY_SET = Object.freeze([]);

function set_union(a, b) {
  var m = a.length, n = b.length;
  if (!m) { return b; }
  if (!n) { return a; }
  var i = 0, j = 0, k = 0;
  var o = [];
  while (i < m && j < n) {
    var v = a[i], w = b[j];
    if (v <= w) {
      o[k++] = v;
      ++i;
      if (v === w) { ++j; }
    } else {
      o[k++] = w;
      ++j;
    }
  }
  if (i < m) {
    if (k === i) { return a; }
    do {
      o[k++] = a[i++];
    } while (i < m);
  } else {
    if (k === j) { return b; }
    while (j < n) {
      o[k++] = b[j++];
    }
    if (k === i) { return a; }
  }
  return Object.freeze(o);
}

function set_difference(a, b) {
  var m = a.length, n = b.length;
  if (!n || !m) { return a; }
  var i = 0, j = 0, k = 0;
  var o = [];
  while (i < m && j < n) {
    var v = a[i], w = b[j];
    if (v <= w) {
      ++i;
      if (v === w) {
        ++j;
      } else {
        o[k++] = v;
      }
    } else {
      ++j;
    }
  }
  if (k === i) { return a; }
  if (i < m) {
    do {
      o[k++] = a[i++];
    } while (i < m);
  }
  return k == 0 ? EMPTY_SET : Object.freeze(o);
}

/** A set containing a single item. */
function set_singleton(item) { return Object.freeze([item]); }