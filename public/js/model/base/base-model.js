function BaseModel(data, immovable, isTrigger, gameMgr) {
  IEventable.call(this);
  Utils.init(this, data);
  this.immovable = immovable;
  this.isTrigger = isTrigger;
  this.gameMgr = gameMgr;
  this.isInit = false;
  this.isAlive = true;
}
Utils.inheritPrototype(BaseModel, IEventable);

//3D coord system
BaseModel.prototype.init = function(attachement, pivot) {
  if(!this.spr) {
    this.attachement = attachement;
    this.pivot = pivot;
    this.spr = game.add.sprite(0, 0, this.spriteSheetName);
    if(pivot)
      this.spr.anchor.setTo(pivot.x, pivot.y);
    else
      this.spr.anchor.setTo(.5, .5);
    if(!attachement) {
      //TODO imp height coord
      var gamePos = this.gameMgr.coordToGamePos(this.coord);
      this.spr.x = gamePos.x;
      this.spr.y = gamePos.z;
      game.physics.enable(this.spr, Phaser.Physics.ARCADE);
      this.spr.body.immovable = this.immovable;
    }
    if(this.audios) {
      this.audioEffects = [];
      for(var i in this.audios) {
        var audioName = this.audios[i];
        this.audioEffects.push(game.add.audio(audioName));
      }
    }
    this.doInit();
    this.isInit = true;
  }
};

BaseModel.prototype.doInit = function() {
};

BaseModel.prototype.shake = function(direction) {
  var model = this;
  if(model.isShaking) {
    return;
  }
  model.isShaking = true;
  var spr = model.spr;
  var x1 = direction == DIRECTION.RIGHT ? spr.x + 3 : spr.x - 3;
  var x2 = spr.x;
  var y1 = spr.y-1;
  var y2 = spr.y;
  tweenA = game.add.tween(spr).to( { x: x1, y: y1}, 100, Phaser.Easing.Bounce.InOut);
  tweenB = game.add.tween(spr).to( { x: x2, y: y2 }, 100, Phaser.Easing.Bounce.InOut);
  tweenA.onComplete.add(function() {
    tweenB.start();
  }, model);
  tweenB.onComplete.add(function() {
    delete model.isShaking;
  }, model);
  

  //tweenA.chain(tweenB);
  function doShake() {
    tweenA.start();
  }
  doShake();
};

BaseModel.prototype.destroy = function() {
  if(this.spr) {
    this.spr.destroy(true);
    this.spr = null;
  }
};

BaseModel.prototype.update = function() {
};

BaseModel.prototype.updateData = function(data) {  
};

BaseModel.prototype.onCollided = function(target) {
};