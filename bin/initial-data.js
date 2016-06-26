//initial when server first service
var InitialData = function() {
  var PasswordMatcher = require('../models/password-matcher');
  return {
    admin: {
      accountId: 'root',
      password: PasswordMatcher.processPasswordFrontend('admin'),
      email: 'gg@ggg.com'
    }
  };
}();

module.exports = InitialData;