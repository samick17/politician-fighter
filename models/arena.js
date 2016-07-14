const inherits = require('util').inherits;
const IEventable = require('./base/ieventable');
const Config = require('../bin/config');
const ObjectManager = require('./base/object-manager');
const ObjectArrayManager = require('./base/object-array-manager');
const ServerClientEvent = require('./event-types/server-client-event');
const CharacterEvent = require('./event-types/character-event');
const OpType = require('./base/utils').OpType;
const ModelFactory = require('./model-factory');
const Vector = require('./base/vector');

function Arena(gameRoom) {
  var arena = this;
  arena.gameRoom = gameRoom;
  arena.mapItemManager = new ObjectManager();
  arena.projectileItemManager = new ObjectManager();
  arena.charactersManager = new ObjectManager();
  arena.posObjsManager = new ObjectArrayManager();

  //mapItemManager
  arena.mapItemManager.on(OpType.create, function(mapItem) {
    arena.posObjsManager.add(mapItem.coord.toString(), mapItem.id);
    arena.broadcastToAllPlayerGaming(ServerClientEvent.addMapItem, mapItem.toJson());
    mapItem.on(CharacterEvent.updatePos, function(data) {
      arena.posObjsManager.updateKey(data.oldCoord.toString(), data.newCoord.toString(), mapItem.id);
    });
    mapItem.on(CharacterEvent.updateHp, function(data) {
      arena.broadcastToAllPlayerGaming(ServerClientEvent.updateMapItemHp, data);
    });
    mapItem.on(CharacterEvent.die, function(data) {
      arena.removeMapItem(mapItem);
    });
  });
  arena.mapItemManager.on(OpType.remove, function(mapItem) {
    arena.posObjsManager.remove(mapItem.coord.toString(), mapItem.id);
    arena.broadcastToAllPlayerGaming(ServerClientEvent.removeMapItem, {id: mapItem.id});
  });
  //projectileItemManager
  arena.projectileItemManager.on(OpType.create, function(projectileItem) {
    arena.broadcastToAllPlayerGaming(ServerClientEvent.addProjectileItem, projectileItem.toJson());
    projectileItem.on(CharacterEvent.moveTo, function(coord) {
      arena.broadcastToAllPlayerGaming(ServerClientEvent.projectileMoveTo, {id: projectileItem.id, coord: coord.toJson()});
    });
  });
  arena.projectileItemManager.on(OpType.remove, function(projectileItem) {
    arena.broadcastToAllPlayerGaming(ServerClientEvent.removeProjectileItem, {id: projectileItem.id});
  });
  //
  arena.charactersManager.on(OpType.create, function(character) {
    arena.posObjsManager.add(character.coord.toString(), character.id);
    //listen from server-side model event and broadcast to all clients
    character.on(CharacterEvent.updatePos, function(data) {
      arena.posObjsManager.updateKey(data.oldCoord.toString(), data.newCoord.toString(), character.id);
    });
    character.on(CharacterEvent.transportTo, function(data) {
      arena.posObjsManager.updateKey(data.oldCoord.toString(), data.newCoord.toString(), character.id);
      arena.broadcastToAllPlayerGaming(ServerClientEvent.transportTo, data);
    });
    character.on(CharacterEvent.applyForceTo, function(data) {
      arena.posObjsManager.updateKey(data.oldCoord.toString(), data.newCoord.toString(), character.id);
      arena.broadcastToAllPlayerGaming(ServerClientEvent.applyForceTo, data);
    });
    character.on(CharacterEvent.moveTo, function(coord) {
      arena.broadcastToAllPlayerGaming(ServerClientEvent.moveTo, {id: character.id, coord: coord.toJson(), moveType: character.moveType});
    });
    character.on(CharacterEvent.updateCoinAmount, function(coinAmount) {
      character.player.sendToClient(ServerClientEvent.updateCoinAmount, {coinAmount: coinAmount});
    });
    character.on(CharacterEvent.updateHp, function(data) {
      arena.broadcastToAllPlayerGaming(ServerClientEvent.updateHp, data);
    });
    character.on(CharacterEvent.die, function(character) {
      arena.broadcastToAllPlayerGaming(ServerClientEvent.broadcastKilling, {killed: character.name, killer: character.lastAttackerName});
      arena.removeCharacter(character);
      var avgScore = character.getScore()/4;
      arena.addGameProp(ModelFactory.createCoinBag(character.coord, avgScore));
    });
    character.on(CharacterEvent.destroy, function(character) {
      arena.posObjsManager.remove(character.coord.toString(), character.id);
      var client = character.player.client;
      delete client.player;
    });
    character.on(CharacterEvent.requestAttack, function(character) {
      arena.broadcastToAllPlayerGaming(ServerClientEvent.requestAttack, {id: character.id});
    });
    character.on(CharacterEvent.obtainItem, function(item) {
      character.player.sendToClient(ServerClientEvent.obtainItem, {item: item.toJson()});
    });
    character.on(CharacterEvent.releaseItem, function(item) {
      character.player.sendToClient(ServerClientEvent.releaseItem, {itemId: item.id});
    });
    character.on(CharacterEvent.updateScore, function(score) {
      arena.rankManager.update(character, function(idx, total) {
        character.updateRank((idx+1) + '/' + total);
      });
    });
    character.on(CharacterEvent.updateRank, function(rankInfo) {
      character.player.sendToClient(ServerClientEvent.updateRank, {rankInfo: rankInfo});
    });
    character.on(CharacterEvent.changeState, function(state) {
      arena.broadcastToAllPlayerGaming(ServerClientEvent.changeState, {characterId: character.id, state: state.toJson()});
    });
    character.on(CharacterEvent.equipWeapon, function() {
      arena.broadcastToAllPlayerGaming(ServerClientEvent.updateCharacter, {character: character.toJson()});
    });
    character.on(CharacterEvent.updateEnergy, function(quota) {
      character.player.sendToClient(ServerClientEvent.updateEnergy, {quota: quota});
    });
    character.on(CharacterEvent.switchToRunMode, function() {
      arena.broadcastToAllPlayerGaming(ServerClientEvent.switchToRunMode, {id: character.id});
    });
    /*buff*/
    character.on(CharacterEvent.addBuff, function(buff) {
      arena.broadcastToAllPlayerGaming(ServerClientEvent.addBuff, {buff: buff.toJson(), character: character.toJson()});
    });
    character.on(CharacterEvent.removeBuff, function(buff) {
      arena.broadcastToAllPlayerGaming(ServerClientEvent.removeBuff, {buffId: buff.id, character: character.toJson()});
    });
    /*jump*/
    character.on(CharacterEvent.jump, function() {
      arena.broadcastToAllPlayerGaming(ServerClientEvent.jump, {id: character.id});
    });
    character.on(CharacterEvent.doubleJump, function() {
      arena.broadcastToAllPlayerGaming(ServerClientEvent.doubleJump, {id: character.id});
    });
    character.on(CharacterEvent.idle, function() {
      arena.broadcastToAllPlayerGaming(ServerClientEvent.idle, {id: character.id});
    });
  });
  //
  arena.charactersManager.on(OpType.remove, function(character) {
    arena.posObjsManager.remove(character.coord.toString(), character.id);
  });
}
inherits(Arena, IEventable);

//TODO generate coord random or by map config
Arena.prototype.initializePlayers = function() {
  var arena = this;
  arena.players = {};
  for(var i in arena.gameRoom.clients) {
    var client = arena.gameRoom.clients[i];
    var playerParams = {
      name: 'abc',
      coord: new Vector(12, 0, 15),
      characterId: client.characterIndex
    };
    var player = ModelFactory.createPlayer(client.id, playerParams, arena, client);
    arena.charactersManager.add(player.character);
    arena.players[player.id] = player;
  }
};

Arena.prototype.gameStart = function() {
  var arena = this;
  arena.initializePlayers();
  arena.broadcastToAllPlayerGaming(ServerClientEvent.loadAllPlayers, arena.getPlayersJson());
  for(var i in arena.players) {
    var player = arena.players[i];
    player.sendToClient(ServerClientEvent.setPlayer, {id: player.id});
  }
  arena.intervalCallback = setInterval(function() {
    arena.gameLoop();
  }, Config.game.INTERVAL);
};

Arena.prototype.gameLoop = function() {
  this.charactersManager.update();
  this.projectileItemManager.update();
};

Arena.prototype.gameTerminate = function() {
  clearInterval(this.intervalCallback);
  this.gameRoom.broadcast(ServerClientEvent.gameOver);
  this.gameRoom.breakup();
};

Arena.prototype.broadcastToAllPlayerGaming = function(event, message) {
  this.gameRoom.broadcast(event, message);
};

Arena.prototype.removePlayer = function(player) {
  this.removeCharacter(player.character);
  delete player.character;
};

Arena.prototype.removeCharacter = function(character) {
  character.destroy();
};

Arena.prototype.getPlayersJson = function() {
  return {
    players: this.charactersManager.toJson()
  };
};


module.exports = Arena;