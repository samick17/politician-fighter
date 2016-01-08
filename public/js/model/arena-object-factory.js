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

ArenaObjectFactory.prototype.createCharacter = function(characterData, x, baseLine) {
  var charX = x;
  var charY = baseLine*ArenaSettings.BaseLineHeight;
  var charSpr = game.add.sprite(0, 0, characterData.name);
  charSpr.pivot.x = charSpr.width/2;
  charSpr.pivot.y = charSpr.height/2;
  charSpr.x = charX+charSpr.pivot.x*2;
  charSpr.y = charY+charSpr.pivot.y*2;
  game.physics.enable(charSpr, Phaser.Physics.ARCADE);
  charSpr.body.gravity.set(0, 0);
  charSpr.scale.setTo(2,2);
  return new Character(charSpr, characterData.anims, AudioResource, baseLine);
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