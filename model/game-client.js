var ServerClientEvent = require('./server-client-event');

function GameClient(socket) {
  this.id = socket.id;
  this.socket = socket;
  this.characterIndex = 0;
}

GameClient.prototype.joinRoom = function(room) {
  this.gameRoom = room;
  this.socket.emit(ServerClientEvent.UpdateProfile, this.toJson());
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

GameClient.prototype.toJson = function() {
  var jsonModel = {
    id: this.id,
    characterIndex: this.characterIndex
  };
  jsonModel.roomId = this.gameRoom?this.gameRoom.id:undefined;
  return jsonModel;
};

module.exports = GameClient;