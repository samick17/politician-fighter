function ArenaObjectFactory(game) {
  this.game = game;
}

ArenaObjectFactory.prototype.createBullet = function(caster, x, baseLine) {
  var game = this.game;
  var charSpr = game.add.sprite(0, 0, 'firen_ball');
  var animData = [
  {name: 'blast', frames: [0,1,2,3,4,5,4,3,2,1], fps: 20, repeat: true},
  {name: 'blowup', frames: [8,9,10,11], fps: 10, repeat: false},
  ];
  return new Bullet(caster, charSpr, animData, {}, baseLine);
}

ArenaObjectFactory.prototype.createCharacter = function(characterData, x, baseLine, gameMgr) {
  var charX = x;
  var charY = baseLine*ArenaSettings.BaseLineHeight;
  var charSpr = game.add.sprite(0, 0, characterData.name);
  game.physics.enable(charSpr, Phaser.Physics.ARCADE);
  charSpr.anchor.setTo(.5, .5);
  charSpr.body.setSize(charSpr.width*.5, charSpr.height*.9, 0, 0);
  /*charSpr.pivot.x = charSpr.width/2;
  charSpr.pivot.y = charSpr.height/2;*/
  charSpr.x = charX+charSpr.width;
  charSpr.y = charY+charSpr.height;
  charSpr.body.gravity.set(0, 0);
  charSpr.scale.setTo(2,2);
  var character = new Character(charSpr, characterData.anims, AudioResource, baseLine, gameMgr);
  var lifeBar = this.createLifeBar();
  lifeBar.attachTo(character);
  return character;
};

ArenaObjectFactory.prototype.createChatBoxGroup = function(charObj, content) {
  var chatboxgroup = charObj.chatboxgroup = game.add.group();
  var updateChatBoxPos = function(pos) {
    if(chatboxgroup.chatbox) {
      chatboxgroup.x = pos.x;
      chatboxgroup.y = pos.y - chatboxgroup.chatbox.height - 30;
    }
  }
  charObj.on('pos', updateChatBoxPos);
  chatboxgroup.init = function() {
    var chatbox = chatboxgroup.chatbox;
    var text = chatboxgroup.text;
    if(!chatbox) {
      chatboxgroup.chatbox = chatbox = game.add.image(0, 0, 'chatbox');
      chatboxgroup.add(chatbox);
    }
    if(!text) {
      var style = { font: 'bold 28px Microsoft Yahei', fill: '#222', boundsAlignH: 'center', boundsAlignV: 'middle' };
      chatboxgroup.text = text = game.add.text(0, 0, '', style);
      chatboxgroup.add(text);
    }
    text.setTextBounds(0, 0, chatbox.width, chatbox.height);
    text.wordWrapWidth = 240;
    text.wordWrap = true;
  };
  chatboxgroup.setContent = function(content) {
    chatboxgroup.init();
    var chatbox = chatboxgroup.chatbox;
    var text = chatboxgroup.text;
    text.text = content;
    chatbox.width = text.width+60;
    chatbox.height = text.height*2;
    chatboxgroup.x = charObj.spr.x;
    chatboxgroup.y = charObj.spr.y - chatbox.height - 30;
    game.time.events.add(Phaser.Timer.SECOND * 2, () => {
      charObj.off('pos', updateChatBoxPos);
      chatboxgroup.destroy();
    }, chatboxgroup);
  };
  chatboxgroup.setContent(content);
  return chatboxgroup;
}

ArenaObjectFactory.prototype.createPunch = function(charObj) {
  var charSpr = charObj.spr;
  var center = charObj.getCenter();
  var punchArea = game.add.sprite(center.x+(charObj.isFaceL()?-80:48), charSpr.y);
  var punch = {
    id: genId(),
    spr: punchArea,
    damage: 5
  };
  punchArea.width = 32;
  punchArea.height = 32;
  game.physics.enable(punchArea, Phaser.Physics.ARCADE);
  return punch;
};

ArenaObjectFactory.prototype.createLifeBar = function(value, maxValue) {
  var lbGroup = game.add.group();
  var containerSpr = game.add.sprite(0, 0, 'life-bar');
  containerSpr.tint = 0x222222;
  var contentSpr = game.add.sprite(3, 3, 'life-bar-content');
  contentSpr.tint = 0xff0000;
  //contentSpr.
  const originWidth = parseInt(contentSpr.width);
  containerSpr.addChild(contentSpr);
  containerSpr.scale.set(.6);
  //lbGroup.pivot.setTo(lbGroup.width*.5, lbGroup.height*.5);
  lbGroup.add(containerSpr);
  const LifeColor = {Health: 0x00ff00, Normal: 0xffa500, Danger: 0xff0000};
  var lifeBar = {
    spr: lbGroup,
    contentSpr: contentSpr,
    value: value || 70,
    maxValue: maxValue || 100,
  };
  lifeBar.attachTo = function(character) {
    var lb = this;
    lb.character = character;
    var charSpr = character.spr;
    charSpr.addChild(lb.spr);
    lb.alignLifeBar();
    lb.spr.y = charSpr.body.y-charSpr.height*.3;
    lb.update();
    character.on(CharacterEvent.hurt, () => {
      lb.update();
    });
    character.on(CharacterEvent.turnLeft, () => {
      lb.turnLeft();
    });
    character.on(CharacterEvent.turnRight, () => {
      lb.turnRight();
    });
  };
  lifeBar.calculateRate = function() {
    return this.value/this.maxValue;
  }
  lifeBar.update = function() {
    var lb = this;
    if(lb.character) {
      lb.value = lb.character.hp;
      lb.maxValue = lb.character.maxHp;
    }
    var rate = lb.calculateRate();
    lb.contentSpr.width = rate*originWidth;
    if(rate >= .65)
      lb.contentSpr.tint = LifeColor.Health;
    else if(rate >= .33 && rate < .65)
      lb.contentSpr.tint = LifeColor.Normal;
    if(rate < .33)
      lb.contentSpr.tint = LifeColor.Danger;
  };
  lifeBar.alignLifeBar = function() {
    var lb = this;
    lb.spr.x = -lb.spr.width/2;
  };
  lifeBar.turnLeft = function() {
    var lb = this;
    var character = lb.character;
    var charSpr = character.spr;
    if(lb.spr.scale.x > 0) {
      lb.spr.scale.setTo(-lb.spr.scale.x, lb.spr.scale.y);
      lb.alignLifeBar();
    }
  };
  lifeBar.turnRight = function() {
    var lb = this;
    var character = lb.character;
    var charSpr = character.spr;
    if(lb.spr.scale.x < 0) {
      lb.spr.scale.setTo(-lb.spr.scale.x, lb.spr.scale.y);
      lb.alignLifeBar();
    }
  };
  return lifeBar;
};