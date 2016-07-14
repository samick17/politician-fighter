var inherits = require('util').inherits;
var BaseItem = require('../base/base-item');
var Physics = require('../base/physics');
var CharacterEvent = require('../event-types/character-event');

function GameProp(gamePropData) {
  BaseItem.call(this, gamePropData);
  this.collider = new Physics.BoxCollider(this, this.size, this.size, true);
  this.coord = gamePropData.coord;
  this.price = this.calculatePrice();
}
inherits(GameProp, BaseItem);

GameProp.prototype.apply = function(target) {
};
//event: destroy from scene(not inventory slots)
GameProp.prototype.destroy = function() {
  this.emit(CharacterEvent.destroy, this);
};

GameProp.prototype.use = function(character) {
  return true;
};

GameProp.prototype.toJson = function() {
  var jsonModel = BaseItem.prototype.toJson.call(this);
  jsonModel.coord = this.coord;
  jsonModel.spriteSheetName = this.spriteSheetName;
  return jsonModel;
};

GameProp.prototype.calculatePrice = function() {
  var price = 0;
  for(var i in this) {
    var val = this[i];
    if(typeof(val) == 'number') {
      price += Math.abs(val);
    }
  }
  return parseInt(price);
};

GameProp.prototype.getPrice = function() {
  return this.price;
};

module.exports = GameProp;