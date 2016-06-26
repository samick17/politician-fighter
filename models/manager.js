var Manager = function() {

  var Client = require('./user-client');

  var _instance = null;

  var _init = function(io) {
    _instance = {};
    _instance._io = io;
    _instance._userClients = {};
    _instance._adminClients = {};
  };

  var _isUserOnline = function(id) {
    return (id in _instance._userClients);
  };

  var _containsUser = function(id) {
    return id in _instance._userClients;
  };

  var _addUser = function(id, socket) {
    var client = new Client(id, socket);
    _instance._userClients[id] = client;
    return client;
  };

  var _removeUser = function(id) {
    if(id in _instance._userClients) {
      var client = _instance._userClients[id];
      client.destroy();
      delete _instance._userClients[id];
    }
  };

  var _addAdmin = function(id, socket) {
    var client = new Client(id, socket);
    _instance._adminClients[id] = client;
    return client;
  };

  var _logout = function(id) {
    if(id in _instance._userClients) {
      var client = _instance._userClients[id];
      client.logout();
      delete _instance._userClients[id];
    }
  };

  var _adminLogout = function(id) {
    if(id in _instance._adminClients) {
      var client = _instance._adminClients[id];
      client.logout();
      delete _instance._adminClients[id];
    }
  };

  var _getUserById = function(id) {
    return _instance._userClients[id];
  };

  var _broadcast = function(name, pkg) {
    _instance._io.emit(name, pkg);
  };

  //with permission
  var _broadcastToAllUser = function(name, pkg) {
    var clients = _instance._userClients;
    for(var i in clients) {
      var client = clients[i];
      client.send(name, pkg);
    }
  };

  var _broadcastToAllAdmin = function(name, pkg) {
    var clients = _instance._adminClients;
    for(var i in clients) {
      var client = clients[i];
      client.send(name, pkg);
    }
  };

  var _broadcastToAllAuthenticated = function(name, pkg) {
    _broadcastToAllUser(name, pkg);
    _broadcastToAllAdmin(name, pkg);
  };

  var _broadcastToAllUserExcept = function(id, name, pkg) {
    var clients = _instance._userClients;
    for(var i in clients) {
      var client = clients[i];
      if(client.id === id)
        continue;
      client.send(name, pkg);
    }
  };

  var _getConnectionCount = function() {
    if(_instance)
      return Object.keys(_instance._userClients).length;
    return 0;
  };

  var _getConnectionIdArray = function() {
    return Object.keys(_instance._userClients);
  };

  var _sendMessageToClient = function(clientId, event, message, filterCallback) {
    if(_instance) {
      if(clientId in _instance._userClients) {
        var client = _instance._userClients[clientId];
        if(filterCallback && filterCallback(client)) {
          client.send(event, message);
        }
        else {
          client.send(event, message);
        }
      }
    }
  };

  var _broadcastTo = function(clientIds, event, message, filterCallback) {
    for(var i in clientIds) {
      var clientId = clientIds[i];
      _sendMessageToClient(clientId, event, message, filterCallback);
    }
  };

  var _broadcastToExcept = function(excludedClientId, clientIds, event, message) {
    for(var i in clientIds) {
      var clientId = clientIds[i];
      if(clientId !== excludedClientId)
        _sendMessageToClient(clientId, event, message);
    }
  };

  return {
    init: _init,
    isUserOnline: _isUserOnline,
    containsUser: _containsUser,
    addUser: _addUser,
    removeUser: _removeUser,
    addAdmin: _addAdmin,
    logout: _logout,
    adminLogout: _adminLogout,
    getUserById: _getUserById,
    broadcast: _broadcast,
    broadcastToAllUser: _broadcastToAllUser,
    broadcastToAllAdmin: _broadcastToAllAdmin,
    broadcastToAllAuthenticated: _broadcastToAllAuthenticated,
    broadcastToAllUserExcept: _broadcastToAllUserExcept,
    getConnectionCount: _getConnectionCount,
    getConnectionIdArray: _getConnectionIdArray,
    sendMessageToClient: _sendMessageToClient,
    broadcastTo: _broadcastTo,
    broadcastToExcept: _broadcastToExcept
  };
}();

module.exports = Manager;