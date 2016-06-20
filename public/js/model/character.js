const VMotionState = {UP: 0, DOWN: 1, NONE: 2};
const HMotionState = {LEFT: 0, RIGHT: 1, NONE: 2};
const MOVE_VERTICAL_TIME = 5;
const CHARACTER_ANIM_STATE = {IDLE: 0, WALK: 1, RUN: 2, STRETCH: 3, STRETCH_GROUNDED: 4, JUMP: 5, THRESH: 6, DEFENSE: 7, CASTING: 8};
const DIRECTION = {LEFT: 0, RIGHT: 1};

function Character(spr, animDataArr, audioDataArr, baseLine, gameMgr) {
  IEventable.call(this);
  var charObj = this;
  charObj.id = genId();
  charObj.hp = 20;
  charObj.maxHp = 50;
  charObj.spr = spr;
  charObj.baseLine = baseLine;
  charObj.gameMgr = gameMgr;
  charObj.attackAudios = ['punchNone1', 'punchNone2'];
  charObj.runAudios = ['run1', 'run2'];
  charObj.punchAudios = ['punch1'];
  charObj.lieAudio = ['lie'];
  charObj.punches = [];
  for(var i in animDataArr) {
    var animData = animDataArr[i];
    var anim = charObj.spr.animations.add(animData.name, animData.frames, animData.fps, animData.repeat);
    anim.onStart.add(this.onAnimStarted, this);
  }
  charObj.spr.animations.getAnimation('stretch').onComplete.add(()=>{
    charObj.doJump();
  }, this);
  charObj.spr.animations.getAnimation('stretchGrounded').onComplete.add(()=>{
    charObj.doGrounded();
  }, this);
  charObj.spr.animations.getAnimation('attack0').onComplete.add(()=>{
    charObj.animState = CHARACTER_ANIM_STATE.IDLE;
  }, this);
  charObj.spr.animations.getAnimation('attack1').onComplete.add(()=>{
    charObj.animState = CHARACTER_ANIM_STATE.IDLE;
  }, this);
  charObj.animState = CHARACTER_ANIM_STATE.IDLE;
  charObj.audios = {};
  for(var key in audioDataArr) {
    aItem = audioDataArr[key];
    charObj.audios[key] = game.add.audio(key);
  }
  //time params
  this.nextMoveUp = Number.NEGATIVE_INFINITY;
  this.nextMoveDown = Number.NEGATIVE_INFINITY;
  this.nextJump = Number.NEGATIVE_INFINITY;
  this.threshTime = 1.2;
  //
  charObj.animState = CHARACTER_ANIM_STATE.IDLE;
  charObj.attackComboIndex = 0;
  charObj.isRun = false;
  charObj.isJumping = false;
  charObj.walkVelocity = 2;
  charObj.runVelocity = 7;
  charObj.velocity = 5;
  charObj.vMotionState = VMotionState.NONE;
  charObj.hMotionState = HMotionState.NONE;
  charObj.turnRight();
  charObj.characterSkillData = {
    'lrr': {
      name: '發明無薪假的人可以得諾貝爾獎!',
    },
    'rll': {
      name: '我一定做好做滿'
    },
    'dla': {
      name: '一個便當吃不飽 何不吃兩個'
    },
    'dra': {
      name: '等我說完再來救你!'
    },
    'dja': {
      name: '震怒丸~'
    },
    'dba': {
      name: 'Over my dead body!',
      anim: 'lie',
      audio: charObj.lieAudio[0]
    }
  };
  charObj.skillGenerator = {
    'lrr': function() {
      charObj.emit('skill', 'lrr');
    },
    'rll': function() {
      charObj.emit('skill', 'rll');
    },
    'dla': function() {
      charObj.emit('skill', 'dla');
    },
    'dra': function() {
      charObj.emit('skill', 'dra');
    },
    'dja': function() {
      charObj.emit('skill', 'dja');
    },
    'dba': function() {
      charObj.emit('skill', 'dba');
    }
  };
}
inherits(IEventable, Character);

Character.prototype.onAnimStarted = function(spr, anim) {
  console.log(anim.name);
};

Character.prototype.stopMoveHorizontal = function() {
  if(this.isJump() || (this.isRun && (!this.isArchieveRight() && !this.isArchieveLeft())))
    return;
  this.doStopMoveHorizontal();
};

Character.prototype.doStopMoveHorizontal = function() {
  this.stopRun();
  this.nextMoveUp = Number.NEGATIVE_INFINITY;
  this.nextMoveDown = Number.NEGATIVE_INFINITY;
  this.hMotionState = HMotionState.NONE;
  if(this.vMotionState === VMotionState.NONE)
    this.animState = CHARACTER_ANIM_STATE.IDLE;
};

Character.prototype.stopMoveVertical = function() {
  if(this.isRun)
    return;
  this.nextMoveUp = Number.NEGATIVE_INFINITY;
  this.nextMoveDown = Number.NEGATIVE_INFINITY;
  this.vMotionState = VMotionState.NONE;
  if(this.hMotionState === HMotionState.NONE)
    this.animState = CHARACTER_ANIM_STATE.IDLE;
};
Character.prototype.isFaceL = function() {
  return this.dir == DIRECTION.LEFT;
};
Character.prototype.getCenter = function() {
  return {
    x: this.spr.x-this.spr.pivot.x,
    y: this.spr.y-this.spr.pivot.y
  };
}
Character.prototype.attack = function() {
  var charObj = this;
  var charSpr = charObj.spr;
  var ndx = game.rnd.integerInRange(0, this.attackAudios.length-1);
  this.audios[this.attackAudios[ndx]].play();
  this.gameMgr.punch(this);
  charObj.animState = CHARACTER_ANIM_STATE.ATTACK;
  charSpr.animations.play('attack'+this.attackComboIndex);
};

Character.prototype.punch = function() {
  var ndx = game.rnd.integerInRange(0, this.punchAudios.length-1);
  this.audios[this.punchAudios[ndx]].play();
};
Character.prototype.run = function() {
  var charObj = this;
  if(!charObj.isRun && !charObj.isJump()) {
    charObj.isRun = true;
    charObj.velocity = this.runVelocity;
    charObj.animState = CHARACTER_ANIM_STATE.RUN;
    var idx = 0;
    var playRunAudio = () => {
      charObj.audios[charObj.runAudios[idx]].play();
      idx = (idx+1)%charObj.runAudios.length;
    };
    charObj.stopRunAudio();
    charObj.runAudioEvent = game.time.events.loop(Phaser.Timer.SECOND*.2, playRunAudio, charObj);
  }
};
Character.prototype.stopRun = function() {
  this.isRun = false;
  this.stopRunAudio();
};

Character.prototype.stopRunAudio = function() {
  if(this.runAudioEvent)
    this.runAudioEvent.loop = false;
};

Character.prototype.turnLeft = function() {
  var charObj = this;
  var charSpr = this.spr;
  charSpr.scale.setTo(-2, 2);
  charObj.dir = DIRECTION.LEFT;
  this.emit(CharacterEvent.turnLeft);
};
Character.prototype.turnRight = function() {
  var charObj = this;
  var charSpr = this.spr;
  charSpr.scale.setTo(2, 2);
  charObj.dir = DIRECTION.RIGHT;
  this.emit(CharacterEvent.turnRight);
};
Character.prototype.canJump = function() {
  return this.animState != CHARACTER_ANIM_STATE.STRETCH && this.animState != CHARACTER_ANIM_STATE.JUMP && this.animState != CHARACTER_ANIM_STATE.STRETCH_GROUNDED;
};
Character.prototype.stopThresh = function() {
  var charObj = this;
  charObj.stopMoveHorizontal();
};
Character.prototype.thresh = function() {
  var charObj = this;
  charObj.stopRun();
  charObj.animState = CHARACTER_ANIM_STATE.THRESH;
  charObj.runAudioEvent = game.time.events.add(Phaser.Timer.SECOND*charObj.threshTime, ()=>{charObj.stopThresh();}, charObj);
};
Character.prototype.requestJump = function() {
  var charSpr = this.spr;
  if(this.isRun) {
    this.thresh();
  }
  else if(this.canJump() && game.time.now > this.nextJump) {
    this.stopRun();
    this.animState = CHARACTER_ANIM_STATE.STRETCH;
    var anim = charSpr.animations.play('stretch');
    this.isJumping = true;
  }
};
Character.prototype.doJump = function() {
  var charSpr = this.spr;
  charSpr.body.velocity.setTo(charSpr.body.velocity.x, -400);
  charSpr.body.gravity.set(0, 900);
  this.nextJump = game.time.now + 900;
  this.animState = CHARACTER_ANIM_STATE.JUMP;
  charSpr.animations.play('jump');
};
Character.prototype.isJump = function() {
  return this.isJumping;
};
Character.prototype.canMoveUp = function() {
  return !this.isJump() && game.time.now > this.nextMoveUp && this.baseLine > ArenaSettings.MIN_BASELINE;
};
Character.prototype.requestMoveUp = function() {
  if (this.canMoveUp()) {
    this.nextMoveUp = game.time.now + MOVE_VERTICAL_TIME;
    this.vMotionState = VMotionState.UP;
    this.stopRun();
    this.velocity = this.walkVelocity;
    this.animState = CHARACTER_ANIM_STATE.WALK;
    this.baseLine -= 1;
    if(this.spr.body.y > this.baseLine*ArenaSettings.BaseLineHeight)
      this.spr.body.y -= game.time.elapsed/MOVE_VERTICAL_TIME*ArenaSettings.BaseLineHeight;
  }
};
Character.prototype.applyDamage = function(dmg) {
  console.log('damage: '+dmg);
  this.hp -= dmg;
  if(this.hp < 0)
    this.hp = 0;
  this.emit(CharacterEvent.hurt);
};
Character.prototype.moveUp = function() {
  if (this.canMoveUp()) {
    this.baseLine -= 1;

  }
  if(this.spr.body.y > this.baseLine*ArenaSettings.BaseLineHeight) {
    this.spr.body.y -= game.time.elapsed/MOVE_VERTICAL_TIME*ArenaSettings.BaseLineHeight;
    this.emit('pos', this.toPosition());
  }
};
Character.prototype.canMoveDown = function() {
  return !this.isJump() && game.time.now > this.nextMoveDown && this.baseLine < ArenaSettings.MAX_BASELINE;
}
Character.prototype.requestMoveDown = function() {
  if(this.canMoveDown()) {
    this.nextMoveDown = game.time.now + MOVE_VERTICAL_TIME;
    this.vMotionState = VMotionState.DOWN;
    this.stopRun();
    this.velocity = this.walkVelocity;
    this.animState = CHARACTER_ANIM_STATE.WALK;
    this.baseLine += 1;
    if(this.spr.body.y < this.baseLine*ArenaSettings.BaseLineHeight)
      this.spr.body.y += game.time.elapsed/MOVE_VERTICAL_TIME*ArenaSettings.BaseLineHeight;
  }
};
Character.prototype.moveDown = function() {
  if (this.canMoveDown()) {
    this.baseLine += 1;
  }
  if(this.spr.body.y < this.baseLine*ArenaSettings.BaseLineHeight) {
    this.spr.body.y += game.time.elapsed/MOVE_VERTICAL_TIME*ArenaSettings.BaseLineHeight;
    this.emit('pos', this.toPosition());
  }
};
Character.prototype.isArchieveLeft = function() {
  return this.spr.body.x <= this.velocity;
};
Character.prototype.requestMoveLeft = function() {
  this.turnLeft();
  if(!this.isJump()) {
    if(!this.isArchieveLeft()) {
      this.hMotionState = HMotionState.LEFT;
      this.stopRun();
      this.velocity = this.walkVelocity;
      this.animState = CHARACTER_ANIM_STATE.WALK;
    }
  }
};
Character.prototype.moveLeft = function() {
  if(!this.isArchieveLeft()) {
    this.spr.body.x -= this.velocity;
    this.emit('pos', this.toPosition());
  }
  else {
    this.stopMoveHorizontal();
  }
};
Character.prototype.isArchieveRight = function() {
  return this.spr.body.x >= game.world.getBounds().right-this.velocity;
};
Character.prototype.requestMoveRight = function() {
  this.turnRight();
  if(!this.isJump()) {
    if(!this.isArchieveRight()) {
      this.hMotionState = HMotionState.RIGHT;
      this.stopRun();
      this.velocity = this.walkVelocity;
      this.animState = CHARACTER_ANIM_STATE.WALK;
    }
  }
};
Character.prototype.moveRight = function() {
  if(!this.isArchieveRight()) {
    this.spr.body.x += this.velocity;
    this.emit('pos', this.toPosition());
  }
  else {
    this.stopMoveHorizontal();
  }
};
Character.prototype.grounded = function() {
  var charSpr = this.spr;
  charSpr.body.y = this.baseLine * ArenaSettings.BaseLineHeight;
  charSpr.body.gravity.set(0, 0);
  charSpr.body.velocity.setTo(charSpr.body.velocity.x, 0);
  var anim = charSpr.animations.play('stretchGrounded');
  this.animState = CHARACTER_ANIM_STATE.STRETCH_GROUNDED;
};
Character.prototype.doGrounded = function() {
  var charSpr = this.spr;
  this.stopMoveVertical();
  this.stopMoveHorizontal();
  this.isJumping = false;
};
Character.prototype.requestAttack = function() {
  var charObj = this;
  var charSpr = charObj.spr;
  if(charObj.isRun) {
    charObj.stopRun();
    charObj.stopMoveHorizontal();
  }
  this.attack();
  //this.attackComboIndex = (this.attackComboIndex+1);
  //console.log('asdsd');
};
Character.prototype.requestDefense = function() {
  this.animState = CHARACTER_ANIM_STATE.DEFENSE;
};
Character.prototype.isGenerateSkill = function(currentInputValue) {
  var generated = this.skillGenerator[currentInputValue];
  if(generated)
    generated();
  return generated;
};
Character.prototype.update = function() {
  var charObj = this;
  var charSpr = charObj.spr;
  var isMoving = false;
  switch(charObj.vMotionState) {
    case VMotionState.UP:
    charObj.moveUp();
    break;
    case VMotionState.DOWN:
    charObj.moveDown();
    break;
  }
  switch(charObj.hMotionState) {
    case HMotionState.LEFT:
    charObj.moveLeft();
    break;
    case HMotionState.RIGHT:
    charObj.moveRight();
    break;
  }
  switch(charObj.animState) {
    case CHARACTER_ANIM_STATE.IDLE:
    charSpr.animations.play('idle');
    break;
    case CHARACTER_ANIM_STATE.WALK:
    charSpr.animations.play('walk');
    break;
    case CHARACTER_ANIM_STATE.RUN:
    charSpr.animations.play('run');
    break;
    case CHARACTER_ANIM_STATE.STRETCH:
    charSpr.animations.play('stretch');
    break;
    case CHARACTER_ANIM_STATE.JUMP:
    charSpr.animations.play('jump');
    charObj.emit('pos', charObj.toPosition());
    break;
    case CHARACTER_ANIM_STATE.STRETCH_GROUNDED:
    charSpr.animations.play('stretchGrounded');
    break;
    case CHARACTER_ANIM_STATE.THRESH:
    charSpr.animations.play('thresh');
    break;
    case CHARACTER_ANIM_STATE.DEFENSE:
    charSpr.animations.play('defense');
    break;
    case CHARACTER_ANIM_STATE.CASTING:
    //if(charSpr.nextCast)
    //charSpr.animations.play('defense');
    break;
  }
  if((charObj.isJump()) && charSpr.body.y > charObj.baseLine * ArenaSettings.BaseLineHeight) {
    charObj.grounded();
  }
};

Character.prototype.castSkill = function(skillData) {
  var charObj = this;
  var charSpr = charObj.spr;
  charObj.doStopMoveHorizontal();
  if(skillData.anim) {
    charSpr.animations.play(skillData.anim);
    charObj.animState = CHARACTER_ANIM_STATE.CASTING;
    if(skillData.audio)
      this.audios[skillData.audio].play();
  }
};

Character.prototype.toPosition = function() {
  return {x: this.spr.x, y: this.spr.y};
};