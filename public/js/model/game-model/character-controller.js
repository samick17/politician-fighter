const COMBO_KEY_THRESHOLD = 300;

function CharacterController(character, aoFactory) {
  var charCtrl = this;
  charCtrl.character = character;
  charCtrl.currentInput = [];
  charCtrl.lastLeftKeyDown = Number.NEGATIVE_INFINITY;
  charCtrl.lastRightKeyDown = Number.NEGATIVE_INFINITY;
  charCtrl.lastInputTime = Number.NEGATIVE_INFINITY;
  charCtrl.inputTimeout = Number.NEGATIVE_INFINITY;
  charCtrl.aoFactory = aoFactory;
  charCtrl.nextFire = Number.NEGATIVE_INFINITY;
  charCtrl.fireRate = 300;
  charCtrl.character.on('skill', (skill) => {
    var skillData = charCtrl.character.characterSkillData[skill];
    charCtrl.castSkill(skillData);
  });
}

CharacterController.prototype.leftKeyDown = function() {
  var charObj = this.character;
  if(this.appendInput('l')) {
    charObj.requestMoveLeft();
    if(game.time.now - this.lastLeftKeyDown <= ArenaSettings.DOUBLE_KEYDOWN_THRESHOLD) {
      charObj.run();
    }
  }
  this.lastLeftKeyDown = game.time.now;
};

CharacterController.prototype.leftKeyUp = function() {
  var charObj = this.character;
  charObj.stopMoveHorizontal();
};

CharacterController.prototype.rightKeyDown = function() {
  var charObj = this.character;
  if(this.appendInput('r')) {
    charObj.requestMoveRight();
    if(game.time.now - this.lastRightKeyDown <= ArenaSettings.DOUBLE_KEYDOWN_THRESHOLD) {
      charObj.run();
    }
  }
  this.lastRightKeyDown = game.time.now;
};

CharacterController.prototype.rightKeyUp = function() {
  var charObj = this.character;
  charObj.stopMoveHorizontal();
};

CharacterController.prototype.upKeyDown = function() {
  var charObj = this.character;
  if(this.appendInput('u')) {
    charObj.requestMoveUp();
  }
};

CharacterController.prototype.upKeyUp = function() {
  var charObj = this.character;
  charObj.stopMoveVertical();
};

CharacterController.prototype.bottomKeyDown = function() {
  var charObj = this.character;
  if(this.appendInput('b'))
    charObj.requestMoveDown();
};

CharacterController.prototype.bottomKeyUp = function() {
  var charObj = this.character;
  charObj.stopMoveVertical();
};

CharacterController.prototype.atkKeyDown = function() {
  var charObj = this.character;
  if(this.appendInput('a'))
    charObj.requestAttack();
};

CharacterController.prototype.jumpKeyDown = function() {
  var charObj = this.character;
  if(this.appendInput('j'))
    charObj.requestJump();
};

CharacterController.prototype.defKeyDown = function() {
  var charObj = this.character;
  if(this.appendInput('d'))
    charObj.requestDefense();
};

CharacterController.prototype.appendInput = function(inputText) {
  var charObj = this.character;
  var curInput = this.currentInput;
  if(game.time.now - this.lastInputTime > ArenaSettings.NextInputThreshold) {
    curInput.push(inputText);
    var currentInputValue = curInput.join('');
    if(charObj.isGenerateSkill(currentInputValue)) {
      this.currentInput = [];
      this.inputTimeout = Number.NEGATIVE_INFINITY;
      return false;
    }
    this.inputTimeout = game.time.now + COMBO_KEY_THRESHOLD;
    this.lastInputTime = game.time.now;
    return true;
  }
  return false;
};

CharacterController.prototype.update = function() {
  if(game.time.now > this.inputTimeout) {
    this.currentInput = [];
  }
};

CharacterController.prototype.castSkill = function(skillData) {
  var charCtrl = this;
  charCtrl.speak(skillData.name);
  var charObj = charCtrl.character;
  charObj.animCastSkill(skillData);
  charCtrl.spawnSkill(skillData.skillName);
};

CharacterController.prototype.spawnSkill = function(skillName) {
  var charObj = this.character;
  this.nextFire = game.time.now + this.fireRate;
  var bullet = charObj.gameMgr.addSkillGameObject(charObj.coord.add(new Vector(2,0,0)), skillName);
  if(charObj.spr.scale.x < 0) {
    bullet.turnLeft();
  } else {
    bullet.turnRight();
  }
};

CharacterController.prototype.speak = function(text) {
  var charObj = this.character;
  if(this.chatboxgroup) {
    this.chatboxgroup.destroy();
  }
  if(text) {
    this.chatboxgroup = this.aoFactory.createChatBoxGroup(charObj, text);
    this.chatboxgroup.setContent(text);
  }
};