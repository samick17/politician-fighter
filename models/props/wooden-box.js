var inherits = require('util').inherits;
var GameItem = require('../base/game-item');
var Utils = require('../base/utils');

function WoodenBox(gameItemData) {
  GameItem.call(this, gameItemData);
}
inherits(WoodenBox, GameItem);

WoodenBox.prototype.toJson = function() {
  var jsonModel = GameItem.prototype.toJson.call(this);
  jsonModel.spriteSheetName = this.spriteSheetName;
  return {box: jsonModel};
};

module.exports = WoodenBox;