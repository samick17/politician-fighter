var GameRoom = require('./game-room');
var util = require('util');
var IEventable = require('./ieventable');
var OpType = require('./op-type');
var ServerClientEvent = require('./server-client-event');

function RoomManager() {
  IEventable.call(this);
  this.rooms = {};
}
util.inherits(RoomManager, IEventable);

RoomManager.prototype.addRoom = function(params, client) {
  var gameRoom = new GameRoom(params, this);
  this.rooms[gameRoom.id] = gameRoom;
  this.emit(OpType.add, gameRoom);
  //gameRoom.broadcast(ServerClientEvent.OnRoomCreated, gameRoom.toJson());
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