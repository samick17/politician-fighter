var inherits = require('util').inherits;
var GameProp = require('./game-prop');

const ItemToPropertyParam = 0.06;

function InventoryGameProp(gamePropData) {
  GameProp.call(this, gamePropData);
}
inherits(InventoryGameProp, GameProp);

InventoryGameProp.prototype.apply = function(character) {
  if(character.canObtainItem()) {
    character.obtainItem(this);
    this.destroy();
  }
  else {
    character.acquireCoin(Math.floor(this.calculatePrice()*ItemToPropertyParam));
    this.destroy();
  }
};

module.exports = InventoryGameProp;