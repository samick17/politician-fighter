var inherits = require('util').inherits;
var Equipment = require('./equipment');
var Armor = require('../base/armor');
var CharacterEvent = require('../event-types/character-event');

function Weapon(data) {
  Equipment.call(this, data);
  this.baseAttackCost = data.baseAttackCost || 0;
}
inherits(Weapon, Equipment);

Weapon.prototype.apply = function(character) {
  Equipment.prototype.apply.call(this, character);
};

Weapon.prototype.unapply = function(character) {
  Equipment.prototype.unapply.call(this, character);
};

Weapon.prototype.toJson = function() {
  var jsonModel = Equipment.prototype.toJson.apply(this);
  jsonModel.bankaiSpriteSheetName = this.bankaiSpriteSheetName;
  return jsonModel;
};

module.exports = Weapon;