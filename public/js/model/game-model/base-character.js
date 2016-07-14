const ApplyForceTime = 50;
const VMotionState = {UP: 0, DOWN: 1, NONE: 2};
const HMotionState = {LEFT: 0, RIGHT: 1, NONE: 2};
const MOVE_VERTICAL_TIME = 5;
const CHARACTER_ANIM_STATE = {IDLE: 0, WALK: 1, RUN: 2, STRETCH: 3, STRETCH_GROUNDED: 4, JUMP: 5, THRESH: 6, DEFENSE: 7, CASTING: 8};
const DIRECTION = {LEFT: 0, RIGHT: 1};
const DoubleJumpTimeThreshold = 300;

const MoveType = {
  Walk: 0,
  Run: 1
};

const CharacterAudios = {
  Attack: ['punchNone1', 'punchNone2'],
  Run: ['run1', 'run2'],
  Punch: ['punch1'],
  Jump: ['jump'],
  Lie: ['lie']
};

function BaseCharacter(data, gameMgr) {
  BaseModel.call(this, data, false, false, gameMgr);
  var charObj = this;
  charObj.hp = 50 || data.hp;
  charObj.maxHp = 50 || data.maxHp;
  charObj.coord = new Vector(data.coord.x, data.coord.y, data.coord.z);
  charObj.gameMgr = gameMgr;
  charObj.punches = [];
  charObj.animState = CHARACTER_ANIM_STATE.IDLE;
  charObj.mSpd = charObj.moveSpd;
  //time params
  this.nextMoveVerticalTime = Number.NEGATIVE_INFINITY;
  this.nextJump = Number.NEGATIVE_INFINITY;
  this.threshTime = 1.2;
  //
  charObj.animState = CHARACTER_ANIM_STATE.IDLE;
  charObj.isRun = false;
  charObj.isJumping = false;
  charObj.vMotionState = VMotionState.NONE;
  charObj.hMotionState = HMotionState.NONE;
  charObj.playRunAudioIndex = 0;
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
  }
  charObj.spr.animations.getAnimation('stretch').onComplete.add(()=>{
    charObj.doJump();
  }, this);
  charObj.spr.animations.getAnimation('stretchGrounded').onComplete.add(()=>{
    charObj.doGrounded();
  }, this);
  charObj.spr.animations.getAnimation('attack0').onComplete.add(()=>{
    charObj.animIdle();
  }, this);
  charObj.spr.animations.getAnimation('attack1').onComplete.add(()=>{
    charObj.animIdle();
  }, this);
  charObj.turnRight();
  charObj.animIdle();
  var lifeBar = AOFactory.createLifeBar();
  lifeBar.attach(this);
  this.doInitWeapon();
};

/*anim function here*/
BaseCharacter.prototype.animIdle = function() {
  this.animState = CHARACTER_ANIM_STATE.IDLE;
  this.spr.animations.play('idle');
};

BaseCharacter.prototype.animRun = function() {
  if(this.animState != CHARACTER_ANIM_STATE.RUN) {
    this.animState = CHARACTER_ANIM_STATE.RUN;
    this.spr.animations.play('run');
    this.playRunAudio();
    /*this.playRunAudioIndex = (this.playRunAudioIndex+1)%2;
    if(this.playRunAudioIndex % 2 == 0) {
      this.playRunAudio();
    }*/
  }
};

BaseCharacter.prototype.animThresh = function() {
  this.animState = CHARACTER_ANIM_STATE.THRESH;
  this.spr.animations.play('thresh');
};

BaseCharacter.prototype.animJump = function() {
  this.animState = CHARACTER_ANIM_STATE.JUMP;
  this.spr.animations.play('jump');
};

BaseCharacter.prototype.animLie = function() {
  this.animState = CHARACTER_ANIM_STATE.DEAD;
  this.spr.animations.play('lie');
};

BaseCharacter.prototype.animStretchGrounded = function() {
  this.animState = CHARACTER_ANIM_STATE.STRETCH_GROUNDED;
  this.spr.animations.play('stretchGrounded');
};

BaseCharacter.prototype.animWalk = function() {
  this.animState = CHARACTER_ANIM_STATE.WALK;
  this.spr.animations.play('walk');
};

BaseCharacter.prototype.moveTo = function(coord, moveType) {
  //moving, but not arrived
  if(this.nextCoord) {
    //TODO fix this
    this.tmpPos = new Vector(this.spr.x, this.spr.y);
  }
  this.nextCoord = new Vector(coord.x, coord.y, coord.z);
  this.lastMoveTime = game.time.time;
  this.turn();
  switch(moveType) {
    case MoveType.Walk:
    this.animWalk();
    break;
    case MoveType.Run:
    this.animRun();
    break;
  }
  if(this.animMove)
    this.animMove();
};
BaseCharacter.prototype.switchToRunMode = function() {
  this.mSpd = this.runSpd;
};
//
BaseCharacter.prototype.switchToWalkMode = function() {
  this.mSpd = this.moveSpd;
};
BaseCharacter.prototype.turn = function() {
  if(this.nextCoord.x < this.coord.x) {
    this.turnLeft();
  }
  else {
    this.turnRight();
  }
};
BaseCharacter.prototype.moveToNextCoord = function() {
  var gamePos = this.tmpPos || this.gameMgr.coordToGamePos(this.coord);
  var nextGamePos = this.gameMgr.coordToGamePos(this.nextCoord);
  var distX = nextGamePos.x - gamePos.x;
  var distY = nextGamePos.y - gamePos.y;
  const spd = this.mSpd/1000;
  var t = (game.time.time - this.lastMoveTime)*spd;
  if(t > 1) t = 1;
  this.spr.x = gamePos.x + t*distX;
  this.spr.y = gamePos.y + t*distY;
};
/*Audio*/
BaseCharacter.prototype.playPunchAudio = function() {
  var ndx = game.rnd.integerInRange(0, CharacterAudios.Punch.length-1);
  game.sound.play(CharacterAudios.Punch[ndx]);
};

BaseCharacter.prototype.playAttackAudio = function() {
  var ndx = game.rnd.integerInRange(0, CharacterAudios.Attack.length-1);
  game.sound.play(CharacterAudios.Attack[ndx]);
};

BaseCharacter.prototype.playJumpAudio = function() {
  game.sound.play(CharacterAudios.Jump[0]);
};

BaseCharacter.prototype.playRunAudio = function() {
  var charObj = this;
  //charObj.stopRunAudio();
  var idx = 0;
  game.sound.play(CharacterAudios.Run[idx]);
  idx = (idx+1)%CharacterAudios.Run.length;
  //charObj.runAudioEvent = game.time.events.loop(Phaser.Timer.SECOND*.2, () => {charObj.playRunAudio();}, charObj);
};

BaseCharacter.prototype.run = function() {
  var charObj = this;
  if(!charObj.isRun && !charObj.isJump()) {
    //charObj.isRun = true;
    //charObj.velocity = this.runVelocity;
    this.animRun();
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
  charObj.animThresh();
  charObj.runAudioEvent = game.time.events.add(Phaser.Timer.SECOND*charObj.threshTime, ()=>{charObj.stopThresh();}, charObj);
};
BaseCharacter.prototype.canJump = function() {
  return this.animState != CHARACTER_ANIM_STATE.STRETCH && this.animState != CHARACTER_ANIM_STATE.JUMP && this.animState != CHARACTER_ANIM_STATE.STRETCH_GROUNDED && game.time.now > this.nextJump;
};
BaseCharacter.prototype.canDoubleJump = function() {
  return this.isJumping && !this.isDoubleJump;
};
BaseCharacter.prototype.jump = function() {
  var charSpr = this.spr;
  this.nextDoubleJumpTime = game.time.now + DoubleJumpTimeThreshold;
  this.stopRun();
  this.animState = CHARACTER_ANIM_STATE.STRETCH;
  charSpr.animations.play('stretch');
  this.isJumping = true;
};
BaseCharacter.prototype.doJump = function() {
  var charSpr = this.spr;
  charSpr.body.velocity.setTo(0, -400);
  charSpr.body.gravity.set(0, 900);
  this.nextJump = game.time.now + 900;
  this.animJump();
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
      var nextGamePos = this.gameMgr.coordToGamePos(this.nextCoord);
      if(Math.abs(charSpr.x - (nextGamePos.x)) < 2 && Math.abs(charSpr.y - (nextGamePos.y)) < 2) {
        this.coord = this.nextCoord;
        this.nextCoord = undefined;
        this.tmpPos = undefined;
        if(!charSpr.body) {
          game.physics.enable(charSpr, Phaser.Physics.ARCADE);
        }
        charSpr.body.velocity.setTo(0, 0);
        var gamePos = this.gameMgr.coordToGamePos(this.coord);
        charSpr.x = gamePos.x;
        charSpr.y = gamePos.y;
        this.animIdle();
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
        this.spr.y = this.endPos.y;
        delete this.applyForceElapsedTime;
        delete this.startApplyForce;
        delete this.gamePos;
        delete this.endCoord;
        delete this.endPos;
      }
      else {
        var distX = this.endPos.x - this.gamePos.x;
        var distY = this.endPos.y - this.gamePos.y;
        const t = elapsedTime / ApplyForceTime;
        this.spr.x = this.gamePos.x + t*distX;
        this.spr.y = this.gamePos.y + t*distY;
      }
    }
    else {
      if((charObj.isJump()) && charSpr.body.y > this.gameMgr.coordToGamePos(charObj.coord).y) {
        charObj.grounded();
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
  this.spr.y = gamePos.y;
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
BaseCharacter.prototype.stopMoveHorizontal = function() {
  if(this.isJump() || (this.isRun && (!this.isArchieveRight() && !this.isArchieveLeft())))
    return;
  this.doStopMoveHorizontal();
};

BaseCharacter.prototype.doStopMoveHorizontal = function() {
  this.stopRun();
  this.nextMoveVerticalTime = Number.NEGATIVE_INFINITY;
  this.hMotionState = HMotionState.NONE;
  if(this.vMotionState === VMotionState.NONE) {
    this.animIdle();
  }
};

BaseCharacter.prototype.stopMoveVertical = function() {
  if(this.isRun)
    return;
  this.nextMoveVerticalTime = Number.NEGATIVE_INFINITY;
  this.vMotionState = VMotionState.NONE;
  if(this.hMotionState === HMotionState.NONE) {
    this.animIdle();
  }
};
BaseCharacter.prototype.animCastSkill = function(skillData) {
  var charObj = this;
  var charSpr = charObj.spr;
  charObj.doStopMoveHorizontal();
  //TODO anim cast skill
};

BaseCharacter.prototype.die = function() {
  this.animLie();
};

BaseCharacter.prototype.toPosition = function() {
  return {x: this.spr.x, y: this.spr.y};
};

BaseCharacter.prototype.equipWeapon = function(wp) {
  var charObj = this;
  if(this.weapon && this.weapon.spr) {
    this.weapon.destroy();
  }
  if(wp) {
    this.weapon = wp;
    this.initWeapon();
  }
};
BaseCharacter.prototype.initWeapon = function() {
  if(this.isInit) {
    this.doInitWeapon();
  }
};
BaseCharacter.prototype.doInitWeapon = function() {
  if(this.weapon) {
    this.weapon.init(this, {x: 0.35, y: 0.6});
    this.spr.addChild(this.weapon.spr);
  }
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
  charSpr.body.gravity.set(0, 0);
  charSpr.body.velocity.setTo(charSpr.body.velocity.x, 0);
  charSpr.y = this.gameMgr.coordToGamePos(this.coord).y;
  //charSpr.body.y = this.gameMgr.coordToGamePos(this.coord).y;
  
  this.animStretchGrounded();
};
BaseCharacter.prototype.doGrounded = function() {
  var charSpr = this.spr;
  this.stopMoveVertical();
  this.stopMoveHorizontal();
  this.isJumping = false;
  delete this.isDoubleJump;
  this.animIdle();
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
    var ndx = game.rnd.integerInRange(0, 1);
    charSpr.animations.play('attack'+ndx);
  }
};