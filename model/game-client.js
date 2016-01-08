var ServerClientEvent = require('./server-client-event');

function GameClient(socket) {
  this.id = socket.id;
  this.socket = socket;
  this.characterIndex = 0;
  this.isLockCharacter = false;
}

GameClient.prototype.joinRoom = function(room) {
  this.gameRoom = room;
};

GameClient.prototype.leaveRoom = function(room) {
  this.gameRoom = null;
};

GameClient.prototype.disconnect = function() {
  if(this.gameRoom) {
    this.gameRoom.removeClient(this);
    delete this.gameRoom;
  }
};

GameClient.prototype.selectCharacter = function(index) {
  if(this.isLockCharacter)
    return;
  this.characterIndex = index;
  this.gameRoom.broadcast(ServerClientEvent.SelectCharacter, {client: this.toJson(), index: index});
};

GameClient.prototype.ensureSelectCharacter = function() {
  if(this.isLockCharacter)
    return;
  this.isLockCharacter = true;
  this.gameRoom.broadcast(ServerClientEvent.EnsureSelectCharacter, {client: this.toJson()});
};

GameClient.prototype.toJson = function() {
  var jsonModel = {
    id: this.id,
    characterIndex: this.characterIndex,
    isLockCharacter: this.isLockCharacter
  };
  jsonModel.roomId = this.gameRoom?this.gameRoom.id:undefined;
  return jsonModel;
};

module.exports = GameClient;