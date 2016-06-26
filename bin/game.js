module.exports = Game;

const manager = require('../models/manager');
const RoomManager = require('../models/room-manager');
const ClientServerEvent = require('../models/event-types/client-server-event');
const ServerClientEvent = require('../models/event-types/server-client-event');
const CharacterLoader = require('../models/character-loader');
const GameClientEvent = require('../models/game-client-event');
const OpType = require('../models/op-type');

function initGameSocket(socket, roomMgr, client) {
  socket.off = function(evt, callback) {
    if(callback) {
      socket.removeListener(evt, callback);
    }
    else {
      socket.removeAllListeners(evt);
    }
  };

  function initGameRoomSocketListener(client) {
    var socket = client.socket;
    socket.on(ClientServerEvent.gameStart, function(data) {
      console.log(data);
    });
    socket.on(ClientServerEvent.selectCharacter, function(index) {
      client.selectCharacter(index);
    });
    socket.on(ClientServerEvent.ensureSelectCharacter, function() {
      client.ensureSelectCharacter();
    });
    socket.on(ClientServerEvent.leaveRoom, function() {
      client.leaveRoom();
    });
    client.on(GameClientEvent.leaveRoom, function(client) {
      client.offSocket(ClientServerEvent.gameStart);
      client.offSocket(ClientServerEvent.selectCharacter);
      client.offSocket(ClientServerEvent.ensureSelectCharacter);
      client.offSocket(ClientServerEvent.leaveRoom);
      client.offSocket(GameClientEvent.LeaveRoom);
    });
  }

  socket.on(ClientServerEvent.createGameRoom, function(data) {
    if(client.gameRoom)
      return;
    roomMgr.addRoom(data, client);
    initGameRoomSocketListener(client);
  });
  socket.on(ClientServerEvent.quickJoin, function() {
    if(client.gameRoom)
      return;
    roomMgr.addToRandomRoom(client);
    initGameRoomSocketListener(client);
  });
  //TODO broadcast room clients
  socket.emit(ServerClientEvent.profile, client.toJson());
  socket.emit(ServerClientEvent.loadCharacters, {characters: CharacterLoader.characters, candidateCharacters: CharacterLoader.candidateCharacters});
  socket.emit(ServerClientEvent.onLoadEnd);
}

//Package here
function Game(io, mapServerConfig) {
  manager.init(io);
  var roomMgr = new RoomManager();

  io.on('connection', function(socket) {
    var cookie = socket.handshake.headers.cookie;
    var userId;
    if(cookie) {
      var match = cookie.match(/\buser_id=([a-zA-Z0-9]{32})/);//parse cookie header
      userId = match ? match[1] : null;
    }
    if(userId && !manager.containsUser(userId)) {
      var client = manager.addUser(userId, socket);
      client.listenOnce(ClientServerEvent.init, function() {
        initGameSocket(socket, roomMgr, client);
      });
    }
    else {
      manager.removeUser(userId);
    }
    socket.on('disconnect', function(reason) {
      //disconnect by human
      if (reason === 'transport close'){
        manager.removeUser(userId);
      } else {
        console.log('recover from connection broken');
      }
    });
  });
}