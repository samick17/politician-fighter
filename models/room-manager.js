var GameRoom = require('./game-room');
var inherits = require('util').inherits;
var IEventable = require('./base/ieventable');
var OpType = require('./op-type');
var ServerClientEvent = require('./event-types/server-client-event');

function RoomManager() {
  IEventable.call(this);
  this.rooms = {};
}
inherits(RoomManager, IEventable);

RoomManager.prototype.addRoom = function(params, client) {
  var gameRoom = new GameRoom(params, this);
  this.rooms[gameRoom.id] = gameRoom;
  this.emit(OpType.add, gameRoom);
  gameRoom.addClient(client);
};

RoomManager.prototype.addToRandomRoom = function(client) {
  for(var i in this.rooms) {
    var room = this.rooms[i];
    if(!room.isFull()) {
      room.addClient(client);
      return;
    }
  }
  this.addRoom({mapId: 0, maxMember: 6}, client);
};

RoomManager.prototype.removeRoom = function(roomId) {
  var room = this.rooms[roomId];
  if(room) {
    delete this.rooms[roomId];
    this.emit(OpType.remove, roomId);
    return true;
  }
  return false;
};

RoomManager.prototype.toJson = function() {
  var roomsArr = {};
  for(var i in this.rooms) {
    var room = this.rooms[i].toJson();
    roomsArr[room.id] = room;
  }
  return roomsArr;
};

module.exports = RoomManager;