var TokenGenerator = function() {

  var JsSha = require('jssha');

  var _generate = function(seed) {
    var shaObj = new JsSha('SHA-512', 'TEXT');
    shaObj.update(seed+Date.now());
    var hash = shaObj.getHash('HEX');
    return hash;
  };

  var _generateWithoutTimeSeed = function(seed) {
    var shaObj = new JsSha('SHA-512', 'TEXT');
    shaObj.update(seed);
    var hash = shaObj.getHash('HEX');
    return hash;
  };

  return {
    generate: _generate,
    generateWithoutTimeSeed: _generateWithoutTimeSeed
  };
}();

module.exports = TokenGenerator;