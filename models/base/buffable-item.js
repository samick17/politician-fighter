var inherits = require('util').inherits;
var BaseItem = require('./base-item');
var CharacterUtils = require('./character-utils');

function BuffableItem(data) {
  BaseItem.call(this, data);
  this.extraHp = data.extraHp || 0;
  this.extraAtk = data.extraAtk;
  this.extraDef = data.extraDef || 0;
  this.extraSpd = data.extraSpd || 0;
  this.extraDmgResist = data.extraDmgResist || 0;
  this.extraDmgResistRate = data.extraDmgResistRate || 0;
  this.moveSpdFreeze = data.moveSpdFreeze || false;
}
inherits(BuffableItem, BaseItem);

BuffableItem.prototype.apply = function(character) {
  CharacterUtils.applyExtraHp(this, character);
  CharacterUtils.applyExtraAtk(this, character);
  CharacterUtils.applyExtraDef(this, character);
  CharacterUtils.applyExtraSpd(this, character);
  CharacterUtils.applyExtraSpdRate(this, character);
  CharacterUtils.applyFreeze(this, character);
  CharacterUtils.applyExtraBuildQuota(this, character);
  CharacterUtils.applyExtraDmgResist(this, character);
  CharacterUtils.applyExtraDmgResistRate(this, character);
  this.character = character;
};

BuffableItem.prototype.unapply = function(character) {
  CharacterUtils.unapplyExtraHp(this, character);
  CharacterUtils.unapplyExtraAtk(this, character);
  CharacterUtils.unapplyExtraDef(this, character);
  CharacterUtils.unapplyExtraSpdRate(this, character);
  CharacterUtils.unapplyExtraSpd(this, character);
  CharacterUtils.unapplyFreeze(this, character);
  CharacterUtils.unapplyExtraBuildQuota(this, character);
  CharacterUtils.unapplyExtraDmgResist(this, character);
  CharacterUtils.unapplyExtraDmgResistRate(this, character);
  this.character = undefined;
};

BuffableItem.prototype.toJson = function() {
  var jsonModel = BaseItem.prototype.toJson.apply(this);
  jsonModel.extraHp = this.extraHp;
  jsonModel.extraAtk = this.extraAtk;
  jsonModel.extraDef = this.extraDef;
  jsonModel.extraSpd = this.extraSpd;
  jsonModel.moveSpdFreeze = this.moveSpdFreeze;
  jsonModel.extraDmgResist = this.extraDmgResist;
  jsonModel.extraDmgResistRate = this.extraDmgResistRate;
  return jsonModel;
};

module.exports = BuffableItem;