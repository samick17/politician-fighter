function CharacterController(character, aoFactory) {
  this.character = character;
  this.currentInput = [];
  this.lastLeftKeyDown = Number.NEGATIVE_INFINITY;
  this.lastRightKeyDown = Number.NEGATIVE_INFINITY;
  this.lastInputTime = Number.NEGATIVE_INFINITY;
  this.inputTimeout = Number.NEGATIVE_INFINITY;
  this.aoFactory = aoFactory;
  this.nextFire = Number.NEGATIVE_INFINITY;
  this.fireRate = 300;

  var charCtrl = this;

  charCtrl.character.on('skill', (skill) => {
    charCtrl.spawnSkill();
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
    this.inputTimeout = game.time.now + 300;
    this.lastInputTime = game.time.now;
    return true;
  }
  return false;
};

CharacterController.prototype.spawnSkill = function() {
  var charObj = this.character;
  this.nextFire = game.time.now + this.fireRate;
  var ballX = charObj.spr.x;
  var bullet = this.aoFactory.createBullet(charObj, ballX, charObj.baseLine);
  if(charObj.spr.scale.x < 0) {
    bullet.turnLeft();
  } else {
    bullet.turnRight();
  }
  bullet.blast();
};

CharacterController.prototype.update = function() {
  if(game.time.now > this.inputTimeout) {
    this.currentInput = [];
  }
};

CharacterController.prototype.castSkill = function(skillData) {
  var charCtrl = this;
  console.log('asdasd')
  charCtrl.speak(skillData.name);
  var charObj = charCtrl.character;
  charObj.castSkill(skillData);
};

CharacterController.prototype.speak = function(text) {
  var charObj = this.character;
  if(this.chatboxgroup) {
    this.chatboxgroup.destroy();
  }
  this.chatboxgroup = this.aoFactory.createChatBoxGroup(charObj, text);
  this.chatboxgroup.setContent(text);
};