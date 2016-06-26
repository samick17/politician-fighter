var PasswordMatcher = function() {

  var JsSha = require('jssha');
  var ServerConfig = require('../bin/config');

  var _processPasswordFrontend = function(password) {
    var shaObj = new JsSha('SHA-256', 'TEXT');
    shaObj.update(password);
    return shaObj.getHash('HEX');
  };

  var _processPassword = function(password) {
    var shaObj = new JsSha('SHA-512', 'TEXT');
    shaObj.update(password);
    return shaObj.getHash('HEX');
  };

  var _isMatch = function(password, actual) {
    return _processPassword(password) === actual;
  };

  var _processAdminPassword = function(password) {
    var shaObj = new JsSha('SHA-512', 'TEXT');
    shaObj.update(password + ServerConfig.secret);
    return shaObj.getHash('HEX');
  };

  var _isAdminPasswordMatch = function(password, actual) {
    return _processAdminPassword(password) === actual;
  };

  return {
    processPasswordFrontend: _processPasswordFrontend,
    processPassword: _processPassword,
    isMatch: _isMatch,
    processAdminPassword: _processAdminPassword,
    isAdminPasswordMatch: _isAdminPasswordMatch
  };
}();

module.exports = PasswordMatcher;