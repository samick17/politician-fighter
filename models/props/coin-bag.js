var inherits = require('util').inherits;
var GameProp = require('./game-prop');

function CoinBag(gamePropData) {
  GameProp.call(this, gamePropData);
  this.coinAmount = gamePropData.coinAmount;
}
inherits(CoinBag, GameProp);

CoinBag.prototype.apply = function(target) {
  target.acquireCoin(this.coinAmount);
  this.destroy();
};

CoinBag.prototype.toJson = function() {
  var jsonModel = GameProp.prototype.toJson.call(this);
  jsonModel.coinAmount = this.coinAmount;
  return {coinBag: jsonModel};
};

module.exports = CoinBag;