var inherits = require('util').inherits;
var GameProp = require('./game-prop');

function Portal(gamePropData) {
  GameProp.call(this, gamePropData);
}
inherits(Portal, GameProp);

function isTrigger(objArray) {
  for(var obj in objArray) {
    if(obj.collider && !obj.collider.isTrigger)
      return false;
  }
  return true;
};

Portal.prototype.apply = function(character) {
  var pos = this.gameMgr.pointGenerator.generate();
  var objsAtCoord = this.gameMgr.posObjsManager.get(pos.toString());
  while(objsAtCoord.length != 0 && !isTrigger(objsAtCoord)) {
    pos = this.gameMgr.pointGenerator.generate();
    objsAtCoord = this.gameMgr.posObjsManager.get(pos.toString());
  }
  character.transportTo(pos);
    this.destroy();
};

Portal.prototype.toJson = function() {
  var jsonModel = GameProp.prototype.toJson.call(this);
  return {portal: jsonModel};
};

module.exports = Portal;