var inherits = require('util').inherits;
var IEventable = require('./base/ieventable');
var uuid = require('node-uuid');
var ServerClientEvent = require('./event-types/server-client-event');
var OpType = require('./op-type');
var GameRoomEvent = require('./game-room-event');

function PositionSlots(count) {
  this.slots = {};
  for(var i = 0;i < count; i++)
    this.slots[i] = undefined;
}
PositionSlots.prototype.addItem = function(item) {
  for(var key in this.slots) {
    var slotItem = this.slots[key];
    if(!slotItem) {
      this.slots[key] = item;
      return;
    }
  }
};
PositionSlots.prototype.removeItem = function(item) {
  for(var key in this.slots) {
    var slotItem = this.slots[key];
    if(slotItem === item) {
      this.slots[key] = undefined;
      return;
    }
  }
};

PositionSlots.prototype.getItemKey = function(item) {
  for(var key in this.slots) {
    var slotItem = this.slots[key];
    if(slotItem === item) {
      return key;
    }
  }
};

function GameRoom(params, roomMgr) {
  IEventable.call(this);
  var room = this;
  room.name = params.name || 'default';
  room.mapId = params.mapId;
  room.maxMember = params.maxMember || 2;
  room.roomMgr = roomMgr;
  room.id = uuid.v4();
  room.clients = {};
  room.posSlots = new PositionSlots(room.maxMember);
  room.on(GameRoomEvent.ensureSelectCharacter, function(gameClient) {
    room.broadcast(ServerClientEvent.ensureSelectCharacter, {client: room.clientToJson(gameClient)});
    if(room.isReady()) {
      room.broadcast(ServerClientEvent.gameStart, {});
    }
  });
};
inherits(GameRoom, IEventable);

GameRoom.prototype.isReady = function() {
  var isReady = Object.keys(this.clients).length === this.maxMember;
  if(isReady) {
    for(var i in this.clients) {
      var client = this.clients[i];
      isReady &= client.isLockCharacter;
    }
  }
  return isReady;
};

GameRoom.prototype.addClient = function(client) {
  this.posSlots.addItem(client);
  this.clients[client.id] = client;
  client.joinRoom(this);
  this.broadcast(ServerClientEvent.onJoinRoom, {client: this.clientToJson(client), room: this.toJson()});
};

GameRoom.prototype.removeClient = function(client) {
  var client = this.clients[client.id];
  if(client) {
    var slotIndex = this.getClientSlotIndex(client);
    client.doLeaveRoom();
    this.broadcast(ServerClientEvent.onLeaveRoom, {room: this.toJson(), clientId: client.id});
    delete this.clients[client.id];
    this.posSlots.removeItem(client);
    if(Object.keys(this.clients).length === 0) {
      this.breakup();
    }
  }
};

GameRoom.prototype.getClientSlotIndex = function(client) {
  return this.posSlots.getItemKey(client);
}

GameRoom.prototype.broadcast = function(name, pkg) {
  for(var i in this.clients) {
    var client = this.clients[i];
    client.socket.emit(name, pkg);
  }
};

GameRoom.prototype.breakup = function() {
  this.roomMgr.removeRoom(this.id);
};

GameRoom.prototype.isFull = function() {
  return Object.keys(this.clients).length >= this.maxMember;
};

GameRoom.prototype.clientsToJsonArray = function() {
  var jsonClientArr = [];
  for(var i in this.clients) {
    var client = this.clients[i];
    jsonClientArr.push(this.clientToJson(client));
  }
  return jsonClientArr;
}

GameRoom.prototype.clientToJson = function(client) {
  var jsonClient = client.toJson();
  jsonClient.slotIndex = this.getClientSlotIndex(client);
  return jsonClient;
}

GameRoom.prototype.toJson = function() {
  return {
    id: this.id,
    mapId: this.mapId,
    name: this.name,
    maxMember: this.maxMember,
    members: this.clientsToJsonArray()
  };
};

module.exports = GameRoom;