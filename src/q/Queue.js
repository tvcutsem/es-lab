



function Queue() {
  var ends = Q.defer();
  return Object.freeze({
    enqueue: function(elem) {
      var next = Q.defer();
      ends.resolve(Object.freeze({head: elem, tail: next.promise}));
      ends.resolve = next.resolve;
    },
    dequeue: function() {
      var result = Q.get(ends.promise, 'head');
      ends.promise = Q.get(ends.promise, 'tail');
      return result;
    }
  });
}
