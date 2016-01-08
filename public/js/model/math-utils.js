  var MathUtils = (function() {
  return {
    clamp: function(current, min, max) {
      return current < min ? min : current > max ? max : current;
    },
    previous: function(i, range) {
      var r = (i -1) % range;
      if(r < 0)
        r += range;
      return r;
    },
    next: function(i, range) {
      return (i +1) % range;
    }
  }
}());