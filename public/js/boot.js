var Boot = function(game) {};

var game;
var gameWidth;
var gameHeight;
var gameMgr;
var aoFactory;

const AOFactory = new ArenaObjectFactory();
const GameMgr = new GameManager(AOFactory);

Boot.prototype = {
  preload: function() {
    game = this.game;
    gameWidth = game.width;
    gameHeight = game.height;
  },
  create: function() {
    game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
    game.scale.pageAlignHorizontally = true;
    game.scale.pageAlignVertically = true;

    game.state.start("Load");
  }
};
