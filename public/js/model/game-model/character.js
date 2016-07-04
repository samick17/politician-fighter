/*const VMotionState = {UP: 0, DOWN: 1, NONE: 2};
const HMotionState = {LEFT: 0, RIGHT: 1, NONE: 2};
const MOVE_VERTICAL_TIME = 5;
const CHARACTER_ANIM_STATE = {IDLE: 0, WALK: 1, RUN: 2, STRETCH: 3, STRETCH_GROUNDED: 4, JUMP: 5, THRESH: 6, DEFENSE: 7, CASTING: 8};
const DIRECTION = {LEFT: 0, RIGHT: 1};
const DoubleJumpTimeThreshold = 300;*/

const CharacterAudios = {
  Attack: ['punchNone1', 'punchNone2'],
  Run: ['run1', 'run2'],
  Punch: ['punch1'],
  Jump: ['jump'],
  Lie: ['lie']
};

function Character(data, audioDataArr, baseLine, gameMgr) {
  BaseCharacter.call(this, data, audioDataArr, baseLine, gameMgr);
}
Utils.inheritPrototype(Character, BaseCharacter);

Character.prototype.stopMoveHorizontal = function() {
  if(this.isJump() || (this.isRun && (!this.isArchieveRight() && !this.isArchieveLeft())))
    return;
  this.doStopMoveHorizontal();
};

Character.prototype.doStopMoveHorizontal = function() {
  this.stopRun();
  this.nextMoveVerticalTime = Number.NEGATIVE_INFINITY;
  this.hMotionState = HMotionState.NONE;
  if(this.vMotionState === VMotionState.NONE) {
    this.animState = CHARACTER_ANIM_STATE.IDLE;
    this.spr.animations.play('idle');
  }
};

Character.prototype.stopMoveVertical = function() {
  if(this.isRun)
    return;
  this.nextMoveVerticalTime = Number.NEGATIVE_INFINITY;
  this.vMotionState = VMotionState.NONE;
  if(this.hMotionState === HMotionState.NONE) {
    this.animState = CHARACTER_ANIM_STATE.IDLE;
    this.spr.animations.play('idle');
  }
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
Character.prototype.requestJump = function() {
  var charSpr = this.spr;
  if(this.canJump() && game.time.now > this.nextJump) {
    this.nextDoubleJumpTime = game.time.now + DoubleJumpTimeThreshold;
    this.stopRun();
    this.animState = CHARACTER_ANIM_STATE.STRETCH;
    charSpr.animations.play('stretch');
    this.isJumping = true;
  }
  //2step jump
  else if(this.canDoubleJump()) {
    this.isDoubleJump = true;
    this.doJump();
  }
};
Character.prototype.applyDamage = function(dmg) {
  this.hp -= dmg;
  if(this.hp < 0)
    this.hp = 0;
  this.trigger(CharacterEvent.hurt);
};

Character.prototype.canMoveUp = function() {
  return !this.isJump() && game.time.now > this.nextMoveVerticalTime && this.baseLine > ArenaSettings.MIN_BASELINE;
};
Character.prototype.canMoveDown = function() {
  return !this.isJump() && game.time.now > this.nextMoveVerticalTime && this.baseLine < ArenaSettings.MAX_BASELINE;
};
Character.prototype.requestMoveUp = function() {
  if (this.canMoveUp()) {
    this.nextMoveVerticalTime = game.time.now + MOVE_VERTICAL_TIME;
    this.vMotionState = VMotionState.UP;
    this.stopRun();
    this.velocity = this.walkVelocity;
    this.animState = CHARACTER_ANIM_STATE.WALK;
    this.spr.animations.play('walk');
    this.baseLine -= 1;
    if(this.spr.body.y > this.baseLine*ArenaSettings.BaseLineHeight)
      this.spr.body.y -= game.time.elapsed/MOVE_VERTICAL_TIME*ArenaSettings.BaseLineHeight;
  }
};
Character.prototype.moveUp = function() {
  if (this.canMoveUp()) {
    this.baseLine -= 1;
  }
  if(this.spr.body.y > this.baseLine*ArenaSettings.BaseLineHeight) {
    this.spr.body.y -= game.time.elapsed/MOVE_VERTICAL_TIME*ArenaSettings.BaseLineHeight;
    this.trigger('pos', this.toPosition());
  }
};
Character.prototype.requestMoveDown = function() {
  if(this.canMoveDown()) {
    this.nextMoveVerticalTime = game.time.now + MOVE_VERTICAL_TIME;
    this.vMotionState = VMotionState.DOWN;
    this.stopRun();
    this.velocity = this.walkVelocity;
    this.animState = CHARACTER_ANIM_STATE.WALK;
    this.spr.animations.play('walk');
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
    this.trigger('pos', this.toPosition());
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
      this.spr.animations.play('walk');
    }
  }
};
Character.prototype.moveLeft = function() {
  if(!this.isArchieveLeft()) {
    this.spr.body.x -= this.velocity;
    this.trigger('pos', this.toPosition());
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
      this.spr.animations.play('walk');
    }
  }
};
Character.prototype.moveRight = function() {
  if(!this.isArchieveRight()) {
    this.spr.body.x += this.velocity;
    this.trigger('pos', this.toPosition());
  }
  else {
    this.stopMoveHorizontal();
  }
};
Character.prototype.requestAttack = function() {
  var charObj = this;
  var charSpr = charObj.spr;
  if(charObj.isRun) {
    charObj.stopRun();
    charObj.stopMoveHorizontal();
  }
  this.attack();
};
Character.prototype.requestDefense = function() {
  if(this.isRun) {
    this.thresh();
  }
  else {
    this.animState = CHARACTER_ANIM_STATE.DEFENSE;
    this.spr.animations.play('defense');
  }
};

/*
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
  if((charObj.isJump()) && charSpr.body.y > charObj.baseLine * ArenaSettings.BaseLineHeight) {
    charObj.grounded();
  }
};*/

/*
Character.prototype.stopMoveHorizontal = function() {
  if(this.hMotionState != HMotionState.NONE) {
    this.hMotionState = HMotionState.NONE;
    Client.send(ClientServerEvent.move, {h: Motion.Idle});
  }
};

Character.prototype.stopMoveVertical = function() {
  if(this.vMotionState != VMotionState.NONE) {
    this.vMotionState = VMotionState.NONE;
    Client.send(ClientServerEvent.move, {v: Motion.Idle});
  }
};
Character.prototype.requestMoveUp = function() {
  if(this.vMotionState != VMotionState.UP) {
    this.vMotionState = VMotionState.UP;
    Client.send(ClientServerEvent.move, {v: Motion.Up});
  }
};
Character.prototype.moveUp = function() {
  if(this.isInit)
    this.spr.body.velocity.setTo(0, -this.moveSpd);
};
Character.prototype.requestMoveDown = function() {
  if(this.vMotionState != VMotionState.DOWN) {
    this.vMotionState = VMotionState.DOWN;
    Client.send(ClientServerEvent.move, {v: Motion.Down});
  }
};
Character.prototype.moveDown = function() {
  if(this.isInit)
    this.spr.body.velocity.setTo(0, this.moveSpd);
};
Character.prototype.requestMoveLeft = function() {
  if(this.hMotionState != HMotionState.LEFT) {
    this.hMotionState = HMotionState.LEFT;
    Client.send(ClientServerEvent.move, {h: Motion.Left});
  }
};
Character.prototype.moveLeft = function() {
  if(this.isInit)
    this.spr.body.velocity.setTo(-this.moveSpd, 0);
};
Character.prototype.requestMoveRight = function() {
  if(this.hMotionState != HMotionState.RIGHT) {
    this.hMotionState = HMotionState.RIGHT;
    Client.send(ClientServerEvent.move, {h: Motion.Right});
  }
};
Character.prototype.moveRight = function() {
  if(this.isInit)
    this.spr.body.velocity.setTo(this.moveSpd, 0);
};
*/