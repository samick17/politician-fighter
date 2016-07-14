var inherits = require('util').inherits;
var InventoryGameProp = require('./inventory-game-prop');

function PortalScroll(gamePropData) {
  InventoryGameProp.call(this, gamePropData);
}
inherits(PortalScroll, InventoryGameProp);

function isTrigger(objArray) {
  for(var obj in objArray) {
    if(obj.collider && !obj.collider.isTrigger)
      return false;
  }
  return true;
};

PortalScroll.prototype.use = function(character) {
  if(character.spendMoney(this.costCoin)) {
    var pos = this.gameMgr.pointGenerator.generate();
    var objsAtCoord = this.gameMgr.posObjsManager.get(pos.toString());
    while(objsAtCoord.length != 0 && !isTrigger(objsAtCoord)) {
      pos = this.gameMgr.pointGenerator.generate();
      objsAtCoord = this.gameMgr.posObjsManager.get(pos.toString());
    }
    character.transportTo(pos);
    return true;
  }
  return false;
};

PortalScroll.prototype.toJson = function() {
  var jsonModel = InventoryGameProp.prototype.toJson.call(this);
  return {portalScroll: jsonModel};
};

module.exports = PortalScroll;