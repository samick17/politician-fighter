function ArenaObjectFactory(game) {
  this.game = game;
}

ArenaObjectFactory.prototype.createObjectManager = function() {
  return new ObjectManager();
};

const SkillData = {
  'firen_ball': {
    name: 'firen_ball',
    spriteSheetName: 'firen_ball',
    anims: [
    {name: 'init', frames: [0], fps: 0, repeat: false},
    {name: 'blast', frames: [1,2,3,4,5,4,3,2,1], fps: 20, repeat: true},
    {name: 'blowup', frames: [8,9,10,11], fps: 10, repeat: false},
    ],
    audios: ['fireball']
  },
  'winstorm': {
    name: 'winstorm',
    spriteSheetName: 'winstorm',
    maxHitCount: 20,
    anims: [
    {name: 'init', frames: [0,1,2,3,4,5,6], fps: 10, repeat: false},
    {name: 'blast', frames: [4,5,6,5], fps: 20, repeat: true},
    {name: 'blowup', frames: [6,7,8,9], fps: 10, repeat: false},
    ],
    audios: ['winstorm']
  }
};

ArenaObjectFactory.prototype.createBullet = function(coord, skillName) {
  var game = this.game;
  var bulletData = Utils.clone(SkillData[skillName]);
  bulletData.id = Utils.generateGUID();
  bulletData.coord = coord;
  var bullet = new Bullet(bulletData, this.gameMgr);
  bullet.init();
  return bullet;
};

ArenaObjectFactory.prototype.createCharacter = function(gameMgr, x, baseLine, characterResName) {
  var charX = x;
  var charY = baseLine*ArenaSettings.BaseLineHeight;
  var data = Client.characters[characterResName];
  data.coord = new Vector(5,0,58);
  var character = new Character(data, AudioResource, baseLine, gameMgr);
  character.init();
  var lifeBar = this.createLifeBar();
  lifeBar.attach(character);
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
};

ArenaObjectFactory.prototype.createLifeBar = function(value, maxValue) {
  return new LifeBar(value, maxValue);
};

ArenaObjectFactory.prototype.createWoodenBox = function(data) {
  return new WoodenBox(data, this.gameMgr);
};

ArenaObjectFactory.prototype.createWeaponProp = function(data) {
  return new WeaponProp(data, this.gameMgr);
};