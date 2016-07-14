var CharacterEvent = require('./event-types/character-event');
var ClientServerEvent = require('./event-types/client-server-event');
//create player after arena start
function Player(character, gameMgr, client) {
  var player = this;
  character.player = player;
  player.id = character.id;
  player.gameMgr = gameMgr;
  player.client = client;
  client.player = player;
  player.character = character;
  player.character.setGameMgr(gameMgr);
  player.client.off('destroy');
  player.client.on('destroy', function() {
    //TODO unregister socket
    player.offArenaSocketListener();
    gameMgr.removePlayer(player);
  });

  player.client.listen(ClientServerEvent.move, function(data) {
    character.changeDir(data);
  });
  player.client.listen(ClientServerEvent.run, function() {
    character.switchToRunMode();
  });
  player.client.listen(ClientServerEvent.jump, function() {
    character.jump();
  });
  player.client.listen(ClientServerEvent.doubleJump, function() {
    character.doubleJump();
  });
};

Player.prototype.offArenaSocketListener = function() {
  this.client.offSocket(ClientServerEvent.move);
  this.client.offSocket(ClientServerEvent.run);
  this.client.offSocket(ClientServerEvent.jump);
  this.client.offSocket(ClientServerEvent.doubleJump);
};

Player.prototype.update = function() {
  this.character.update();
};

Player.prototype.sendToClient = function(name, pkg) {
  this.client.send(name, pkg);
};

module.exports = Player;