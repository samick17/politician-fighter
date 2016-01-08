const BallXOffset = 20;

function Bullet(caster, spr, animData, audioData, baseLine) {
  IEventable.call(this);
  var obj = this;
  obj.spr = spr;
  obj.baseLine = baseLine;
  var charX = caster.spr.x;
  var charY = baseLine*ArenaSettings.BaseLineHeight;
  const BallXOffset = 20;
  obj.spr.pivot.x = obj.spr.width/2;
  obj.spr.pivot.y = obj.spr.height/2;
  obj.spr.x = charX+obj.spr.pivot.x*2;
  obj.spr.y = charY+obj.spr.pivot.y*2;
  game.physics.enable(obj.spr, Phaser.Physics.ARCADE);
  obj.spr.lifespan = 1500;
  obj.spr.body.gravity.set(0, 0);
  obj.spr.scale.setTo(2, 2);
  obj.velocity = 1200;
  for(var i in animData) {
    var anim = animData[i];
    obj.spr.animations.add(anim.name, anim.frames, anim.fps, anim.repeat);
  }
  obj.audios = {};
  for(var key in audioData) {
    aItem = audioData[key];
    obj.audios[key] = game.add.audio(key);
  }
}

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
  spr.animations.play('blast')
}
