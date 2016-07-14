var inherits = require('util').inherits;
var BuffableItem = require('../base/buffable-item');

function Equipment(data) {
  BuffableItem.call(this, data);
}
inherits(Equipment, BuffableItem);

Equipment.prototype.toJson = function() {
  var jsonModel = BuffableItem.prototype.toJson.apply(this);
  jsonModel.type = this.type;
  jsonModel.spriteSheetName = this.spriteSheetName;
  if(this.effectSpriteSheetName) {
    jsonModel.effectSpriteSheetName = this.effectSpriteSheetName;
  }
  return jsonModel;
};

module.exports = Equipment;