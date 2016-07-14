var inherits = require('util').inherits;
var InventoryGameProp = require('./inventory-game-prop');

function Potion(gamePropData) {
  InventoryGameProp.call(this, gamePropData);
}
inherits(Potion, InventoryGameProp);

Potion.prototype.use = function(character) {
  if(character.canSpendMoney(this.costCoin)) {
    var isWorking = false;
    if(this.healingValue) {
      character.applyDamage(this.healingValue);
      isWorking = true;
    }
    if(this.buff) {
      character.addBuffByName(this.buff);
      isWorking = true;
    }
    if(isWorking) {
      character.spendMoney(this.costCoin)
    }
    return isWorking;
  }
  return false;
};

Potion.prototype.toJson = function() {
  var jsonModel = InventoryGameProp.prototype.toJson.call(this);
  jsonModel.healingValue = this.healingValue;
  return {potion: jsonModel};
};

module.exports = Potion;