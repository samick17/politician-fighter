var Config = require('../bin/config');

function Arena(manager) {
  this.manager = manager;
}

Arena.prototype.gameStart = function() {
  var arena = this;
  setInterval(function() {
    arena.gameLoop();
  }, Config.game.INTERVAL);
};

Arena.prototype.gameLoop = function() {
};