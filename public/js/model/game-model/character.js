const Motion = {
  Idle: 0,
  Left: 1,
  Right: 2,
  Up: 3,
  Down: 4
};

function Character(data, gameMgr) {
  BaseCharacter.call(this, data, gameMgr);
}
Utils.inheritPrototype(Character, BaseCharacter);

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
  if(this.canJump()) {
    Client.send(ClientServerEvent.jump);
  }
  //2step jump
  else if(this.canDoubleJump()) {
    this.isDoubleJump = true;
    Client.send(ClientServerEvent.doubleJump);
  }
};
Character.prototype.requestRun = function() {
  var charObj = this;
  if(!charObj.isRun && !charObj.isJump()) {
    Client.send(ClientServerEvent.run);
  }
};
Character.prototype.applyDamage = function(dmg) {
  this.hp -= dmg;
  if(this.hp < 0)
    this.hp = 0;
  this.trigger(CharacterEvent.hurt);
};
Character.prototype.canMoveUp = function() {
  return !this.isJump();
};
Character.prototype.canMoveDown = function() {
  return !this.isJump();
};
Character.prototype.requestMoveUp = function() {
  if (this.canMoveUp()) {
    this.vMotionState = VMotionState.UP;
    Client.send(ClientServerEvent.move, {v: Motion.Up});
  }
};
Character.prototype.moveUp = function() {
  if(this.spr.body.y > this.coord.y*ArenaSettings.BaseLineHeight) {
    this.spr.body.y -= game.time.elapsed/MOVE_VERTICAL_TIME*ArenaSettings.BaseLineHeight;
    this.trigger('pos', this.toPosition());
  }
};
Character.prototype.requestMoveDown = function() {
  if(this.canMoveDown()) {
    this.vMotionState = VMotionState.DOWN;
    Client.send(ClientServerEvent.move, {v: Motion.Down});
  }
};
Character.prototype.moveDown = function() {
  if(this.spr.body.y < this.coord.y*ArenaSettings.BaseLineHeight) {
    this.spr.body.y += game.time.elapsed/MOVE_VERTICAL_TIME*ArenaSettings.BaseLineHeight;
    this.trigger('pos', this.toPosition());
  }
};
Character.prototype.isArchieveLeft = function() {
  return this.spr.body.x <= this.velocity;
};
Character.prototype.requestMoveLeft = function() {
  if(!this.isJump()) {
    if(!this.isArchieveLeft()) {
      this.hMotionState = HMotionState.LEFT;
      Client.send(ClientServerEvent.move, {h: Motion.Left});
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
  if(!this.isJump()) {
    if(!this.isArchieveRight()) {
      this.hMotionState = HMotionState.RIGHT;
      Client.send(ClientServerEvent.move, {h: Motion.Right});
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
Character.prototype.updateData = function(data) {
  var weaponData = data.weapon;
  delete data.weapon;
  Utils.init(this, data);
  this.mSpd = this.moveSpd;
  this.lifeInterfaceObj.updateValue(this.hp, this.maxHp);
  //TODO weapon
  if(weaponData) {
    this.equip(ModelFactory.createWeapon(weaponData));
  }
};