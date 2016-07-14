const inherits = require('util').inherits;
const GameItem = require('./game-item');
const GameConfig = require('../../bin/config').game;
const Vector = require('./vector');
const CharacterEvent = require('../event-types/character-event');
const MapCalculator = require('./map-calculator');
const Motion = require('./motion');
const MoveType = {
  Walk: 0,
  Run: 1
};

function BaseCharacter(data) {
  GameItem.call(this, data);
  /*init default value*/
  this.hp = data.hp || 1;
  this.maxHp = data.maxHp || 1;
  this.atk = data.atk || 0;
  this.atkSpd = data.atkSpd || 0;
  this.def = data.def || 0;
  this.dmgResist = data.dmgResist || 0;
  this.dmgResistRate = data.dmgResistRate || 0;
  this.moveSpd = data.moveSpd || 0;
  this.runSpd = data.runSpd || 0;
  this.mSpd = this.moveSpd;
  this.coinAmount = data.coinAmount || 0;
  /*init value for controller*/
  this.lastMoveTime = Number.NEGATIVE_INFINITY;
  this.isMoving = false;
  this.currentDirection = data.currentDirection || new Vector(0, 0, 0);
  this.lastAttackTime = Number.NEGATIVE_INFINITY;
  this.score = 0;
  this.isHookable = true;
  this.nextJump = Number.NEGATIVE_INFINITY;
}
inherits(BaseCharacter, GameItem);

BaseCharacter.prototype.setGameMgr = function(gameMgr) {
  this.gameMgr = gameMgr;
};

BaseCharacter.prototype.changeDir = function(params) {
  var character = this;
  character.moveType = MoveType.Walk;
  character.mSpd = this.moveSpd;
  var direction = character.currentDirection;
  var toIdleState = true;
  if('h' in params) {
    switch(params.h) {
      case Motion.Left:
      direction.x = -1;
      toIdleState = false;
      break;
      case Motion.Right:
      direction.x = 1;
      toIdleState = false;
      break;
      case Motion.Idle:
      direction.x = 0;
      break;
    }
  }
  if('v' in params) {
    switch(params.v) {
      case Motion.Up:
      direction.y = 1;
      toIdleState = false;
      break;
      case Motion.Down:
      direction.y = -1;
      toIdleState = false;
      break;
      case Motion.Idle:
      direction.y = 0;
      break;
    }
  }
  if(toIdleState) {
    character.emit(CharacterEvent.idle);
  }
};

BaseCharacter.prototype.switchToRunMode = function() {
  this.mSpd = this.runSpd;
  this.moveType = MoveType.Run;
  this.emit(CharacterEvent.switchToRunMode);
};

BaseCharacter.prototype.canJump = function() {
  var now = Date.now();
  return now > this.nextJump && !this.isJumping;
}

BaseCharacter.prototype.jump = function() {
  if(this.canJump()) {
    this.nextJump = Date.now() + 900;
    this.isJumping = true;
    this.coord.y = 1;
    this.emit(CharacterEvent.jump);
  }
};

BaseCharacter.prototype.canDoubleJump = function() {
  return this.isJumping && !this.isDoubleJump;
};

BaseCharacter.prototype.doubleJump = function() {
  if(this.canDoubleJump()) {
    this.nextJump = Date.now() + 1800;
    this.coord.y = 2;
    this.isDoubleJump = true;
    this.emit(CharacterEvent.doubleJump);
  }
};

BaseCharacter.prototype.getMoveTime = function() {
  var moveTime = this.mSpd <= 0 ? 1/GameConfig.MinMoveSpd : 1/this.mSpd;
  return moveTime*1000;
};

BaseCharacter.prototype.isMovingTimeout = function() {
  var moveTime = this.getMoveTime();
  return Date.now() - this.lastMoveTime >= moveTime;
};

BaseCharacter.prototype.isDoubleJumpTimeout = function() {
  return this.nextJump - Date.now() <= 900;
};

BaseCharacter.prototype.isJumpTimeout = function() {
  return this.nextJump - Date.now() <= 0;
};

BaseCharacter.prototype.canMove = function(direction) {
  var character = this;
  //check move timeout
  if(character.movementFreezed || !character.isMovingTimeout() || character.isMoving)
    return false;
  var preMoveEvents = character.evts['preMove'];
  //check collision
  for(var i in preMoveEvents) {
    evt = preMoveEvents[i];
    if(!evt(direction)) {
      return false;
    }
  }
  return true;
};

BaseCharacter.prototype.translate = function(direction) {
  //translate if there is no collider
  var dir = direction.normalized();
  if(this.canMove(direction)) {
    this.isMoving = true;
    this.nextCoord = this.coord.add(direction);
    this.lastMoveTime = Date.now();
    this.emit(CharacterEvent.moveTo, this.nextCoord);
  }
};

BaseCharacter.prototype.processUpdate = function() {
  var character = this;
  if(character.isMoving && character.isMovingTimeout()) {
    character.isMoving = false;
    character.updateCoord(character.nextCoord);
  }
  if(character.isDoubleJump && character.isDoubleJumpTimeout()) {
    this.coord.y = 1;
    character.isDoubleJump = false;
  }
  if(character.isJumping && character.isJumpTimeout()) {
    this.coord.y = 0;
    character.isJumping = false;
  }
};

BaseCharacter.prototype.updateCoord = function(coord) {
  var character = this;
  var oldCoord = character.coord;
  character.coord = coord;
  character.pos = MapCalculator.coordToPos(coord);
  character.emit(CharacterEvent.updatePos, {oldCoord: oldCoord, newCoord: coord});
};

BaseCharacter.prototype.update = function() {
  if(!this.currentDirection.isZero())
    this.translate(this.currentDirection);
  this.processUpdate();
};

BaseCharacter.prototype.transportTo = function(coord, hookMode) {
  var character = this;
  //stop moving
  character.lastMoveTime = Number.NEGATIVE_INFINITY;
  character.currentDirection = new Vector(0,0);
  character.isMoving = false;
  delete character.nextCoord;
  //transport
  var oldCoord = character.coord;
  character.coord = coord;
  character.pos = MapCalculator.coordToPos(coord);
  var transportData = {id: character.id, oldCoord: oldCoord, newCoord: coord};
  this.gameMgr.triggerGameObjectAtCoord(character, coord);
  if(hookMode) {
    character.emit(CharacterEvent.applyForceTo, transportData);
  }
  else {
    character.emit(CharacterEvent.transportTo, transportData);
  }
};

BaseCharacter.prototype.acquireCoin = function(coinAmount) {
  this.coinAmount += coinAmount;
  this.emit(CharacterEvent.updateCoinAmount, this.coinAmount);
};

BaseCharacter.prototype.canSpendMoney = function(coinAmount) {
  return this.coinAmount >= coinAmount;
};

BaseCharacter.prototype.spendMoney = function(coinAmount) {
  if((typeof coinAmount !== 'undefined') && this.coinAmount >= coinAmount) {
    this.coinAmount -= coinAmount;
    this.emit(CharacterEvent.updateCoinAmount, this.coinAmount);
    return true;
  }
  return false;
};

BaseCharacter.prototype.getDirection = function() {
  return this.direction;
};

BaseCharacter.prototype.setDirection = function(direction) {
  this.direction = direction;
};

BaseCharacter.prototype.calculateForwardCoord = function() {
  return this.coord.add(this.getForward());
};

BaseCharacter.prototype.getForward = function() {
  var directionFlag = Math.round((this.direction-120)/90);
  switch(directionFlag) {
    case 3://up
    return new Vector(-1, 0);
    break;
    case 2://left
    return new Vector(0, -1);
    break;
    case 1://down
    return new Vector(1, 0);
    break;
    default://right
    return new Vector(0, 1);
    break;
  }
};

BaseCharacter.prototype.getScore = function() {
  return this.score;
};

/*attack*/
BaseCharacter.prototype.getAttackTime = function() {
  var attackTime = this.atkSpd <= 0 ? 1/GameConfig.MinAtkSpd : 1/this.atkSpd;
  return attackTime*1000;
};

BaseCharacter.prototype.isAttackingTimeout = function() {
  var attackTime = this.getAttackTime();
  return Date.now() - this.lastAttackTime >= attackTime;
};

BaseCharacter.prototype.canAttack = function() {
  return this.isAttackingTimeout();
};

BaseCharacter.prototype.attack = function() {
  if(this.canAttack()) {
    this.lastAttackTime = Date.now();
    this.doAttack();
  }
};
BaseCharacter.prototype.doAttack = function() {
};

BaseCharacter.prototype.specialAttack = function() {
  if(this.canAttack()) {
    this.lastAttackTime = Date.now();
    this.doSpecialAttack();
  }
};
BaseCharacter.prototype.doSpecialAttack = function() {
};

module.exports = BaseCharacter;