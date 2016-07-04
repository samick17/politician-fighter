var Config = require('../bin/config');
var ServerClientEvent = require('./event-types/server-client-event');

function Arena(gameRoom) {
  this.gameRoom = gameRoom;
  //this.lifeTime = 10*1000;
}

Arena.prototype.gameStart = function() {
  var arena = this;
  arena.intervalCallback = setInterval(function() {
    arena.gameLoop();
  }, Config.game.INTERVAL);
  /*setTimeout(function() {
    console.log('terminate')
    arena.gameTerminate();
  }, arena.lifeTime);*/
};

Arena.prototype.gameLoop = function() {
};

Arena.prototype.gameTerminate = function() {
  clearInterval(this.intervalCallback);
  this.gameRoom.broadcast(ServerClientEvent.gameOver);
  this.gameRoom.breakup();
};

module.exports = Arena;