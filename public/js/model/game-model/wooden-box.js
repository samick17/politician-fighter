function WoodenBox(data, gameMgr) {
  BaseModel.call(this, data, true, false, gameMgr);
}
Utils.inheritPrototype(WoodenBox, BaseModel);

WoodenBox.prototype.doInit = function() {
  this.spr.scale.set(.3);
};
WoodenBox.prototype.setHp = function(data) {
  this.hp = data.hp;
  this.maxHp = data.maxHp;
  var hpRate = (this.hp/this.maxHp);
  if(this.audioEffects.length > 0) {
    this.audioEffects[0].play();
  }
  if(hpRate  > .8)
    this.spr.play('100');
  else if(hpRate  > .6)
    this.spr.play('80');
  else if(hpRate  > .4)
    this.spr.play('60');
  else if(hpRate  > .2)
    this.spr.play('40');
  else
    this.spr.play('20');
};

WoodenBox.prototype.onCollided = function(target) {
  var direction = this.spr.x < target.spr.x ? DIRECTION.RIGHT : DIRECTION.LEFT;
  this.shake(direction);
  if(this.audioEffects.length > 0) {
    var ndx = game.rnd.integerInRange(0, this.audioEffects.length-1);
    this.audioEffects[ndx].play();
  }
};