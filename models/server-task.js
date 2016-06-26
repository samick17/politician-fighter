var ServerState = require('../dbs/server-state');
var Admin = require('../dbs/admin');
var InitialData = require('../bin/initial-data');
var ServerConfig = require('../bin/config').server;

var _launch = function(callback) {
  ServerState.launch(function(err, serverState) {
    if(err)
      callback(err);
    else if(serverState) {
      ServerConfig.setAppName(serverState.name);
      if(serverState.launchTimes === 1) {
        Admin.create(InitialData.admin, function(err, admin) {
          callback(err);
        });
      }
      else
        callback();
    }
    else {
      callback(new Error('invalid server state'));
    }
  });
};

module.exports = {
  launch: _launch
};