var uuid = require('node-uuid');
var ServerClientEvent = require('./server-client-event');
var OpType = require('./op-type');

function PositionSlots(count) {
  this.slots = {};
  for(var i = 0;i< count; i++)
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
  this.name = params.name || 'default';
  this.mapId = params.mapId;
  this.maxMember = params.maxMember || 2;
  this.roomMgr = roomMgr;
  this.id = uuid.v4();
  this.clients = {};
  this.posSlots = new PositionSlots(this.maxMember);
};

GameRoom.prototype.addClient = function(client) {
  this.posSlots.addItem(client);
  this.clients[client.id] = client;
  client.socket.emit(ServerClientEvent.RefreshRoomMembers, {clients: this.clientsToJsonArray()});
  client.joinRoom(this);
  this.broadcast(ServerClientEvent.OnJoinRoom, {client: client.toJson(), room: this.toJson(), idx: this.posSlots.getItemKey(client)});
};

GameRoom.prototype.removeClient = function(client) {
  var client = this.clients[client.id];
  if(client) {
    client.leaveRoom(this);
    delete this.clients[client.id];
    this.broadcast(ServerClientEvent.OnLeaveRoom, {room: this.toJson(), clientId: client.id, idx: this.posSlots.getItemKey(client)});
    this.posSlots.removeItem(client);
    if(Object.keys(this.clients).length === 0) {
      this.breakup();
    }
  }
};

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
};

GameRoom.prototype.clientsToJsonArray = function() {
  var jsonClientArr = [];
  for(var i in this.clients) {
    var c = this.clients[i];
    jsonClientArr.push(c.toJson());
  }
  return jsonClientArr;
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
};

module.exports = GameRoom;