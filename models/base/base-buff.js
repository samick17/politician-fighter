var inherits = require('util').inherits;
var BuffableItem = require('../base/buffable-item');
var CharacterEvent = require('../event-types/character-event');

/* buff will destroy automatically when time out */
function BaseBuff(data) {
  BuffableItem.call(this, data);
  this.autoDestroy = this.lifeTime && this.lifeTime > 0;
  if(this.autoDestroy) {
    this.lifeTimeSpan = this.lifeTime * 1000;
  }
  this.isAlive = true;
}
inherits(BaseBuff, BuffableItem);

BaseBuff.prototype.apply = function(character) {
  var buff = this;
  buff.character = character;
  BuffableItem.prototype.apply.call(buff, character);
  //register effect timer if effect
  if(buff.effect) {
    function takeEffect() {
      var canEffect = buff.effect.costCoin ? character.canSpendMoney(buff.effect.costCoin) : true;
      if(buff.isAlive && canEffect) {
        buff.effectTimer = setTimeout(function() {
          character.applyDamage(buff.effect.costHp);
          character.spendMoney(buff.effect.costCoin);
          takeEffect();
        }, buff.effect.effectTime*1000);
      }
      else {
        buff.destroy();
      }
    }
    takeEffect();
  }
  //reg lifeTime callback
  if(buff.autoDestroy) {
    buff.lifeTimer = setTimeout(function() {
      buff.destroy();
    }, buff.lifeTimeSpan);
  }
  character.on(CharacterEvent.destroy, function() {
    buff.isAlive = false;
    clearTimeout(buff.lifeTimer);
    clearTimeout(buff.effectTimer);
  });
};

BaseBuff.prototype.unapply = function(character) {
  BuffableItem.prototype.unapply.call(this, character);
  //unreg lifeTime callback
  if(this.autoDestroy) {
    clearTimeout(this.lifeTimer);
    clearTimeout(this.effectTimer);
  }
  this.isAlive = false;
};

BaseBuff.prototype.destroy = function() {
  if(this.isAlive) {
    this.isAlive = false;
    if(this.character) {
      this.unapply(this.character);
      this.character = undefined;
    }
    this.emit(CharacterEvent.remove, this);
  }
};

BaseBuff.prototype.toJson = function() {
  var jsonModel = BuffableItem.prototype.toJson.apply(this);
  jsonModel.lifeTime = this.lifeTime;
  jsonModel.spriteSheetName = this.spriteSheetName;
  jsonModel.effectSpriteSheetName = this.effectSpriteSheetName;
  return jsonModel;
};

module.exports = BaseBuff;