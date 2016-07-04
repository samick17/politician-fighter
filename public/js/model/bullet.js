function Bullet(data, gameMgr) {
  this.hitCount = 0;
  this.maxHitCount = 0;
  BaseModel.call(this, data, true, false, gameMgr);
}
Utils.inheritPrototype(Bullet, BaseModel);

Bullet.prototype.doInit = function() {
  var obj = this;
  obj.spr.lifespan = 1500 || data.lifeTime;
  obj.spr.body.gravity.set(0, 0);
  obj.spr.scale.setTo(1, 1);
  obj.velocity = 1200 || data.velocity;
  for(var i in this.anims) {
    var anim = this.anims[i];
    obj.spr.animations.add(anim.name, anim.frames, anim.fps, anim.repeat);
  }
  obj.audios = {};
  for(var key in this.audios) {
    aItem = this.audios[key];
    obj.audios[key] = game.add.audio(key);
  }
  obj.spr.animations.getAnimation('init').onComplete.add(()=>{
    obj.blast();
  }, this);
  obj.spr.animations.play('init');
  if(this.audioEffects.length > 0) {
    this.audioEffects[0].play();
  }
};
Bullet.prototype.turnLeft = function() {
  var spr = this.spr;
  spr.scale.x = spr.scale.x > 0 ? -spr.scale.x:spr.scale.x;
};
Bullet.prototype.turnRight = function() {
  var spr = this.spr;
  spr.scale.x = spr.scale.x > 0 ? spr.scale.x:-spr.scale.x;
};
Bullet.prototype.blast = function() {
  var spr = this.spr;
  spr.body.velocity.setTo(spr.scale.x<0?-this.velocity:this.velocity,0);
  spr.animations.play('blast');
};

Bullet.prototype.blowup = function() {
  var bullet = this;
  bullet.hitCount++;
  if(bullet.hitCount >= bullet.maxHitCount) {
    var spr = bullet.spr;
    spr.animations.getAnimation('blowup').onComplete.add(()=>{
      bullet.destroy();
    }, bullet);
    spr.animations.play('blowup');
    spr.body.velocity.setTo(0, 0);
    this.isAlive = false;
  }
}

Bullet.prototype.onCollided = function(target) {
  this.blowup();
};