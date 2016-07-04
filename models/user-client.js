var inherits = require('util').inherits;
var format = require('util').format;
var IEventable = require('./base/ieventable');
var GameClientEvent = require('./game-client-event');
var GameRoomEvent = require('./game-room-event');
var ServerClientEvent = require('./event-types/server-client-event');

function UserClient(id, socket) {
  var client = this;
  IEventable.call(client);
  client.id = id;
  client.socket = socket;
  client.countOfConn = 0;
  client.characterIndex = 0;
  client.isLockCharacter = false;
};
inherits(UserClient, IEventable);

UserClient.prototype.joinRoom = function(room) {
  this.gameRoom = room;
};

UserClient.prototype.doLeaveRoom = function() {
  if(this.gameRoom) {
    delete this.gameRoom;
    this.isLockCharacter = false;
    this.emit(GameClientEvent.LeaveRoom, this);
  }
};

UserClient.prototype.leaveRoom = function() {
  if(this.gameRoom) {
    this.gameRoom.removeClient(this);
  }
};

UserClient.prototype.disconnect = function() {
  this.leaveRoom();
  delete this.socket.handshake.session.uid;
};

UserClient.prototype.selectCharacter = function(index) {
  if(this.isLockCharacter)
    return;
  this.characterIndex = index;
  this.gameRoom.broadcast(ServerClientEvent.selectCharacter, {client: this.toJson(), index: index, slotIndex: this.gameRoom.getClientSlotIndex(this)});
};

UserClient.prototype.ensureSelectCharacter = function() {
  if(this.gameRoom) {
    if(this.isLockCharacter) {
      return;
    }
    this.isLockCharacter = true;
    this.gameRoom.emit(GameRoomEvent.ensureSelectCharacter, this);
  }
};

UserClient.prototype.offSocket = function(evt, callback) {
  if(callback) {
    this.socket.removeListener(evt, callback);
  }
  else {
    this.socket.removeAllListeners(evt);
  }
};

UserClient.prototype.listen = function(name, callback) {
  this.socket.on(name, callback);
};

UserClient.prototype.listenOnce = function(name, callback) {
  this.socket.once(name, callback);
};

UserClient.prototype.send = function(name, pkg) {
  this.socket.emit(name, pkg);
  return this;
};

UserClient.prototype.logout = function() {
  this.destroy();
  delete this.socket.handshake.session.uid;
};

UserClient.prototype.destroy = function() {
  this.leaveRoom();
  this.emit('destroy', this);
};

UserClient.prototype.toJson = function() {
  var jsonModel = {
    id: this.id,
    characterIndex: this.characterIndex,
    isLockCharacter: this.isLockCharacter
  };
  jsonModel.roomId = this.gameRoom?this.gameRoom.id:undefined;
  return jsonModel;
};

module.exports = UserClient;