function WeaponProp(data, gameMgr) {
  BaseModel.call(this, data, true, false, gameMgr);
}
Utils.inheritPrototype(WeaponProp, BaseModel);

WeaponProp.prototype.doInit = function() {
  var wp = this;
  wp.spr.animations.add('init', [2], 0, false);
  wp.spr.animations.add('attack', [2,3,4,5,4,3,2], 14, false);
  wp.spr.animations.play('init');
  var animWeaponAttack = wp.spr.animations.getAnimation('attack');
  animWeaponAttack.enableUpdate = true;
  var pivot = [{x: 0.3, y: 0.7}, {x: 0.2, y: 0.4}, {x: 0.2, y: 0.5}, {x: 0.2, y: 0.5}, {x: 0.2, y: 0.5}, {x: 0.4, y: 0.7}];
  var idx = 0;
  animWeaponAttack.onUpdate.add(()=>{
    wp.spr.anchor.set(pivot[idx].x, pivot[idx].y);
    idx++;
  }, wp);
  animWeaponAttack.onComplete.add(()=>{
    idx = 0;
  }, wp);
};

WeaponProp.prototype.attack = function() {
  this.spr.animations.play('attack');
};