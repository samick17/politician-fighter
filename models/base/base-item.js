var inherits = require('util').inherits;
var IEventable = require('./ieventable');
var GameConfig = require('../../bin/config').game;

function BaseItem(data) {
  IEventable.call(this);
  for(var i in data) {
    var val = data[i];
    this[i] = val;
  }
  this.isHookable = false;
  this.size = GameConfig.GameItemSize;
}
inherits(BaseItem, IEventable);

BaseItem.prototype.update = function() {
};

BaseItem.prototype.toJson = function() {
  return {
    id: this.id,
    name: this.name
  };
};

module.exports = BaseItem;