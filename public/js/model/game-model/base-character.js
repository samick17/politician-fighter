const ApplyForceTime = 50;
const VMotionState = {UP: 0, DOWN: 1, NONE: 2};
const HMotionState = {LEFT: 0, RIGHT: 1, NONE: 2};
const MOVE_VERTICAL_TIME = 5;
const CHARACTER_ANIM_STATE = {IDLE: 0, WALK: 1, RUN: 2, STRETCH: 3, STRETCH_GROUNDED: 4, JUMP: 5, THRESH: 6, DEFENSE: 7, CASTING: 8};
const DIRECTION = {LEFT: 0, RIGHT: 1};
const DoubleJumpTimeThreshold = 300;

function BaseCharacter(data, audioDataArr, baseLine, gameMgr) {
  BaseModel.call(this, data, false, false, gameMgr);
  var charObj = this;
  charObj.id = genId();
  charObj.hp = 50;
  charObj.maxHp = 50;
  charObj.baseLine = baseLine;
  charObj.gameMgr = gameMgr;
  charObj.punches = [];
  charObj.animState = CHARACTER_ANIM_STATE.IDLE;
  charObj.audios = {};
  for(var key in audioDataArr) {
    aItem = audioDataArr[key];
    charObj.audios[key] = game.add.audio(key);
  }
  //time params
  this.nextMoveVerticalTime = Number.NEGATIVE_INFINITY;
  this.nextJump = Number.NEGATIVE_INFINITY;
  this.threshTime = 1.2;
  //
  charObj.animState = CHARACTER_ANIM_STATE.IDLE;
  charObj.attackComboIndex = 0;
  charObj.isRun = false;
  charObj.isJumping = false;
  charObj.vMotionState = VMotionState.NONE;
  charObj.hMotionState = HMotionState.NONE;
  charObj.characterSkillData = {
    'lrr': {
      skillName: 'firen_ball',
      name: '發明無薪假的人可以得諾貝爾獎!',
    },
    'rll': {
      skillName: 'firen_ball',
      name: '我一定做好做滿'
    },
    'dla': {
      skillName: 'firen_ball',
      name: '一個便當吃不飽 何不吃兩個'
    },
    'dra': {
      skillName: 'firen_ball',
      name: '等我說完再來救你!'
    },
    'dja': {
      skillName: 'winstorm',
      name: '震怒丸~'
    },
    'dba': {
      skillName: 'firen_ball',
      name: 'Over my dead body!',
      anim: 'lie',
      audio: CharacterAudios.Lie[0]
    }
  };
  charObj.skillGenerator = {
    'lrr': function() {
      charObj.trigger('skill', 'lrr');
    },
    'rll': function() {
      charObj.trigger('skill', 'rll');
    },
    'dla': function() {
      charObj.trigger('skill', 'dla');
    },
    'dra': function() {
      charObj.trigger('skill', 'dra');
    },
    'dja': function() {
      charObj.trigger('skill', 'dja');
    },
    'dba': function() {
      charObj.trigger('skill', 'dba');
    }
  };
}
Utils.inheritPrototype(BaseCharacter, BaseModel);

BaseCharacter.prototype.doInit = function() {
  var charObj = this;
  charObj.spr.body.width = charObj.spr.width*.8;
  for(var i in this.anims) {
    var animData = this.anims[i];
    var anim = charObj.spr.animations.add(animData.name, animData.frames, animData.fps, animData.repeat);
    //anim.onStart.add(this.onAnimStarted, this);
  }
  charObj.spr.animations.getAnimation('stretch').onComplete.add(()=>{
    charObj.doJump();
  }, this);
  charObj.spr.animations.getAnimation('stretchGrounded').onComplete.add(()=>{
    charObj.doGrounded();
  }, this);
  charObj.spr.animations.getAnimation('attack0').onComplete.add(()=>{
    charObj.animState = CHARACTER_ANIM_STATE.IDLE;
    charObj.spr.animations.play('idle');
  }, this);
  charObj.spr.animations.getAnimation('attack1').onComplete.add(()=>{
    charObj.animState = CHARACTER_ANIM_STATE.IDLE;
    charObj.spr.animations.play('idle');
  }, this);
  charObj.turnRight();
};

BaseCharacter.prototype.moveTo = function(coord) {
  //moving, but not arrived
  if(this.nextCoord) {
    this.tmpPos = new Vector(this.spr.x, this.spr.y);
  }
  this.nextCoord = new Vector(coord.x, coord.y);
  this.lastMoveTime = game.time.time;
};
BaseCharacter.prototype.moveToNextCoord = function() {
  var gamePos = this.tmpPos || GameManager.coordToGamePos(this.coord);
  var nextGamePos = GameManager.coordToGamePos(this.nextCoord);
  var distX = nextGamePos.x - gamePos.x;
  var distY = nextGamePos.z - gamePos.z;
  const spd = this.moveSpd/1000;
  var t = (game.time.time - this.lastMoveTime)*spd;
  if(t > 1) t = 1;
  this.spr.x = gamePos.x + t*distX;
  this.spr.y = gamePos.z + t*distY;
};
/*Audio*/
BaseCharacter.prototype.playPunchAudio = function() {
  var ndx = game.rnd.integerInRange(0, CharacterAudios.Punch.length-1);
  this.audios[CharacterAudios.Punch[ndx]].play();
};

BaseCharacter.prototype.playAttackAudio = function() {
  var ndx = game.rnd.integerInRange(0, CharacterAudios.Attack.length-1);
  this.audios[CharacterAudios.Attack[ndx]].play();
};

BaseCharacter.prototype.playJumpAudio = function() {
  this.audios[CharacterAudios.Jump].play();
};

BaseCharacter.prototype.playRunAudio = function() {
  var charObj = this;
  charObj.stopRunAudio();
  var idx = 0;
  charObj.audios[CharacterAudios.Run[idx]].play();
  idx = (idx+1)%CharacterAudios.Run.length;
  charObj.runAudioEvent = game.time.events.loop(Phaser.Timer.SECOND*.2, () => {charObj.playRunAudio();}, charObj);
};

BaseCharacter.prototype.run = function() {
  var charObj = this;
  if(!charObj.isRun && !charObj.isJump()) {
    charObj.isRun = true;
    charObj.velocity = this.runVelocity;
    charObj.animState = CHARACTER_ANIM_STATE.RUN;
    charObj.spr.animations.play('run');
    charObj.stopRunAudio();
    this.playRunAudio();
  }
};
BaseCharacter.prototype.stopRun = function() {
  this.isRun = false;
  this.stopRunAudio();
};

BaseCharacter.prototype.stopRunAudio = function() {
  if(this.runAudioEvent) {
    game.time.events.remove(this.runAudioEvent);
    delete this.runAudioEvent;
  }
};

BaseCharacter.prototype.turnLeft = function() {
  var charObj = this;
  var charSpr = this.spr;
  charSpr.scale.setTo(-1, 1);
  charObj.dir = DIRECTION.LEFT;
  this.trigger(CharacterEvent.turnLeft);
};
BaseCharacter.prototype.turnRight = function() {
  var charObj = this;
  var charSpr = this.spr;
  charSpr.scale.setTo(1, 1);
  charObj.dir = DIRECTION.RIGHT;
  this.trigger(CharacterEvent.turnRight);
};
BaseCharacter.prototype.stopThresh = function() {
  var charObj = this;
  charObj.stopMoveHorizontal();
};
BaseCharacter.prototype.thresh = function() {
  var charObj = this;
  charObj.stopRun();
  charObj.animState = CHARACTER_ANIM_STATE.THRESH;
  charObj.spr.animations.play('thresh');
  charObj.runAudioEvent = game.time.events.add(Phaser.Timer.SECOND*charObj.threshTime, ()=>{charObj.stopThresh();}, charObj);
};
BaseCharacter.prototype.canJump = function() {
  return this.animState != CHARACTER_ANIM_STATE.STRETCH && this.animState != CHARACTER_ANIM_STATE.JUMP && this.animState != CHARACTER_ANIM_STATE.STRETCH_GROUNDED;
};
BaseCharacter.prototype.canDoubleJump = function() {
  return this.isJumping && !this.isDoubleJump;
};
BaseCharacter.prototype.doJump = function() {
  var charSpr = this.spr;
  charSpr.body.velocity.setTo(charSpr.body.velocity.x, -400);
  charSpr.body.gravity.set(0, 900);
  this.nextJump = game.time.now + 900;
  this.animState = CHARACTER_ANIM_STATE.JUMP;

  charSpr.animations.play('jump');
  this.trigger('pos', this.toPosition());
  this.playJumpAudio();
};
BaseCharacter.prototype.isJump = function() {
  return this.isJumping;
};
BaseCharacter.prototype.update = function() {
  var charObj = this;
  var charSpr = charObj.spr;
  if(this.isInit) {
    if(this.nextCoord) {
      //arrived
      var nextGamePos = this.gameMgr.coordToGamePos(this.coord);
      if(Math.abs(charSpr.x - (nextGamePos.x)) < 2 && Math.abs(charSpr.y - (nextGamePos.z)) < 2) {
        this.coord = this.nextCoord;
        this.nextCoord = undefined;
        this.tmpPos = undefined;
        if(!charSpr.body) {
          game.physics.enable(charSpr, Phaser.Physics.ARCADE);
        }
        charSpr.body.velocity.setTo(0, 0);
        var gamePos = GameManager.coordToGamePos(this.coord);
        charSpr.x = gamePos.x;
        charSpr.y = gamePos.z;
      }
      else {
        charObj.moveToNextCoord();
      }
    }
    else if(this.startApplyForce) {
      const elapsedTime = game.time.time - this.applyForceElapsedTime;
      if(elapsedTime > ApplyForceTime) {
        //arrived
        this.coord = this.endCoord;
        this.spr.x = this.endPos.x;
        this.spr.y = this.endPos.z;
        delete this.applyForceElapsedTime;
        delete this.startApplyForce;
        delete this.gamePos;
        delete this.endCoord;
        delete this.endPos;
      }
      else {
        var distX = this.endPos.x - this.gamePos.x;
        var distY = this.endPos.z - this.gamePos.z;
        const t = elapsedTime / ApplyForceTime;
        this.spr.x = this.gamePos.x + t*distX;
        this.spr.y = this.gamePos.z + t*distY;
      }
    }
  }
};
BaseCharacter.prototype.stopMoving = function() {
  delete this.nextCoord;
  delete this.tmpPos;
  this.spr.body.velocity.setTo(0, 0);
};
BaseCharacter.prototype.transportTo = function(coord) {
  this.stopMoving();
  this.coord = coord;
  var gamePos = GameManager.coordToGamePos(this.coord);
  this.spr.x = gamePos.x;
  this.spr.y = gamePos.z;
};
BaseCharacter.prototype.applyForceTo = function(coord) {
  //TODO assign accel/force
  this.stopMoving();
  this.gamePos = GameManager.coordToGamePos(this.coord);
  var endPos = GameManager.coordToGamePos(coord);
  this.endPos = endPos;
  this.endCoord = coord;
  this.applyForceElapsedTime = game.time.time;
  this.startApplyForce = true;
};
BaseCharacter.prototype.animCastSkill = function(skillData) {
  var charObj = this;
  var charSpr = charObj.spr;
  charObj.doStopMoveHorizontal();
  //TODO anim cast skill
};

BaseCharacter.prototype.die = function() {
  var charObj = this;
  var charSpr = charObj.spr;
  charSpr.animations.play('lie');
  charObj.animState = CHARACTER_ANIM_STATE.DEAD;
};

BaseCharacter.prototype.toPosition = function() {
  return {x: this.spr.x, y: this.spr.y};
};

BaseCharacter.prototype.equipWeapon = function(wp) {
  var charObj = this;
  if(this.weapon) {
    this.weapon.destroy();
  }
  this.weapon = wp;
  this.weapon.init(this, {x: 0.35, y: 0.6});
  this.spr.addChild(this.weapon.spr);
};
BaseCharacter.prototype.isGenerateSkill = function(currentInputValue) {
  var generated = this.skillGenerator[currentInputValue];
  if(generated) {
    generated();
    return true;
  }
  return false;
};
BaseCharacter.prototype.grounded = function() {
  var charSpr = this.spr;
  charSpr.body.y = this.baseLine * ArenaSettings.BaseLineHeight;
  charSpr.body.gravity.set(0, 0);
  charSpr.body.velocity.setTo(charSpr.body.velocity.x, 0);
  var anim = charSpr.animations.play('stretchGrounded');
  this.animState = CHARACTER_ANIM_STATE.STRETCH_GROUNDED;
  charSpr.animations.play('stretchGrounded');
};
BaseCharacter.prototype.doGrounded = function() {
  var charSpr = this.spr;
  this.stopMoveVertical();
  this.stopMoveHorizontal();
  this.isJumping = false;
  delete this.isDoubleJump;
};
BaseCharacter.prototype.attack = function() {
  var charObj = this;
  var charSpr = charObj.spr;
  this.playAttackAudio();
  charObj.animState = CHARACTER_ANIM_STATE.ATTACK;
  if(this.weapon) {
    this.weapon.attack();
    charSpr.animations.play('weaponAttack');
  }
  else {
    charSpr.animations.play('attack'+this.attackComboIndex);
  }
};