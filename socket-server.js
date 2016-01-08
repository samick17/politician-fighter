function createSocketServer(app) {
  var io = require('socket.io')(app);
  var ClientServerEvent = require('./model/client-server-event');
  var ServerClientEvent = require('./model/server-client-event');
  var CharacterLoader = require('./model/character-loader');
  var OpType = require('./model/op-type');
  var GameClient = require('./model/game-client');
  var RoomManager = require('./model/room-manager');
  var ClientManager = require('./model/client-manager');
  var roomMgr = new RoomManager();
  var clientMgr = new ClientManager();

  roomMgr.on(OpType.add, function(room) {
    io.emit(ServerClientEvent.OnRoomCreated, room.toJson());
  });
  roomMgr.on(OpType.update, function(room) {
    io.emit(ServerClientEvent.OnRoomCreated, room.toJson());
  });
  roomMgr.on(OpType.remove, function(roomId) {
    io.emit(ServerClientEvent.OnRoomRemoved, roomId);
  });

  var allClients = {};

  function initGameRoomSocketListener(client) {
    var socket = client.socket;
    socket.on(ClientServerEvent.GameStart, function(data) {
      console.log(data);
    });
    socket.on(ClientServerEvent.SelectCharacter, function(index) {
      client.selectCharacter(index);
    });
    socket.on(ClientServerEvent.EnsureSelectCharacter, function() {
      client.ensureSelectCharacter();
    });
  }

  io.on('connection', function(socket) {
    var client = clientMgr.addClient(socket);
    io.emit(ServerClientEvent.OnClientConnect, client.toJson());
    socket.on(ClientServerEvent.RequestInitial, function() {
      socket.emit(ServerClientEvent.AllClients, clientMgr.toJson());
      socket.emit(ServerClientEvent.Profile, client.toJson());
      socket.emit(ServerClientEvent.AllRooms, roomMgr.toJson());
      socket.emit(ServerClientEvent.LoadCharacters, {characters: CharacterLoader.characters, candidateCharacters: CharacterLoader.candidateCharacters});
      socket.emit(ServerClientEvent.OnLoadEnd);
    });
    socket.on(ClientServerEvent.CreateGameRoom, function(data) {
      if(client.gameRoom)
        return;
      roomMgr.addRoom(data, client);
      initGameRoomSocketListener(client);
    });
    socket.on(ClientServerEvent.QuickJoin, function() {
      if(client.gameRoom)
        return;
      roomMgr.addToRandomRoom(client);
      initGameRoomSocketListener(client);
    });

    socket.on('disconnect', function() {
      clientMgr.removeClient(client);
      io.emit(ServerClientEvent.OnClientDisconnect, {clientId: client.id});
    });
  });  
}

module.exports = {
  createSocketServer: createSocketServer
};
