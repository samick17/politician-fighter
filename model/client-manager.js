var util = require('util');
var IEventable = require('./ieventable');
var OpType = require('./op-type');
var GameClient = require('./game-client');

function ClientManager() {
  IEventable.call(this);
  this.clients = {};
}
util.inherits(ClientManager, IEventable);

ClientManager.prototype.addClient = function(socket) {
  var client = new GameClient(socket);
  this.clients[client.id] = client;
  this.emit(OpType.add, client);
  return client;
}

ClientManager.prototype.removeClient = function(client) {
  var client = this.clients[client.id];
  if(client) {
    client.disconnect();
    delete this.clients[client.id];
    this.emit(OpType.remove, client.id);
  }
}

ClientManager.prototype.toJson = function() {
  var clientsArr = {};
  for(var i in this.clients) {
    var client = this.clients[i].toJson();
    clientsArr[client.id] = client;
  }
  return clientsArr;
};

module.exports = ClientManager;