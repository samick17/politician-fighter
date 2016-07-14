var inherits = require('util').inherits;
var BaseCharacter = require('../base/base-character');
var CharacterEvent = require('../event-types/character-event');

function Bullet(data) {
  BaseCharacter.call(this, data);
  this.isAlive = true;
}
inherits(Bullet, BaseCharacter);

Bullet.prototype.init = function(character) {
  this.atk += character.atk;
  this.owner = character;
};

Bullet.prototype.getOwnerName = function() {
  return this.owner.name;
};

Bullet.prototype.destroy = function() {
  this.isAlive = false;
  this.emit(CharacterEvent.die, this);
};

Bullet.prototype.update = function() {
  if(this.isAlive) {
    BaseCharacter.prototype.update.call(this);
    if(Date.now() - this.spawnTime >= this.lifeTime) {
      return this.destroy();
    }
    else {
      var gosAtCoord = this.gameMgr.getGameObjectsByCoord(this.coord);
      if(gosAtCoord && gosAtCoord.length > 0) {
        var target = gosAtCoord[0];
        if(this.owner != target && target.calculateDamage) {
          target.applyDamageByGameItem(this);
          this.emit(CharacterEvent.hit, target);
          this.destroy();
        }
      }      
    }
  }
};

Bullet.prototype.toJson = function() {
  var jsonModel = BaseCharacter.prototype.toJson.call(this);
  jsonModel.coord = this.coord;
  jsonModel.direction = this.currentDirection.toFaceDirection();
  jsonModel.moveSpd = this.moveSpd;
  jsonModel.spriteSheetName = this.spriteSheetName;
  return {bullet: jsonModel};
};

module.exports = Bullet;