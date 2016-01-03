var uuid = require('node-uuid');
var ServerClientEvent = require('./server-client-event');
var OpType = require('./op-type');

function GameRoom(params, roomMgr) {
  this.name = params.name || 'default';
  this.mapId = params.mapId;
  this.maxMember = params.maxMember || 2;
  this.roomMgr = roomMgr;
  this.id = uuid.v4();
  this.clients = {};
}

GameRoom.prototype.addClient = function(client) {
  this.clients[client.id] = client;
  client.joinRoom(this);
  this.broadcast(ServerClientEvent.OnRoomCreated, this.toJson());
  this.broadcast(ServerClientEvent.OnJoinRoom, client.toJson());
}

GameRoom.prototype.removeClient = function(client) {
  var client = this.clients[client.id];
  if(client) {
    client.leaveRoom(this.gameRoom);
    delete this.clients[client.id];
    if(Object.keys(this.clients).length === 0) {
      this.breakup();
    }
  }
}

GameRoom.prototype.broadcast = function(name, pkg) {
  for(var i in this.clients) {
    var client = this.clients[i];
    client.socket.emit(name, pkg);
  }
};

GameRoom.prototype.breakup = function() {
  if(this.roomMgr.removeRoom(this.id)) {
    this.broadcast(ServerClientEvent.RoomBreakUp, {});
  }
};

GameRoom.prototype.isFull = function() {
  return Object.keys(this.clients).length >= this.maxMember;
}

GameRoom.prototype.toJson = function() {
  var members = [];
  for(var i in this.clients) {
    var client = this.clients[i];
    members.push(client.toJson());
  }
  return {
    id: this.id,
    mapId: this.mapId,
    name: this.name,
    maxMember: this.maxMember,
    members: members
  };
}

module.exports = GameRoom;