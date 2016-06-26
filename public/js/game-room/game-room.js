var GameRoom = function(game) {};

(function() {

  const MAX_RENDERED_MEMBER_COUNT = 8;
  const CHARACTER_MENU_PADDING = 0, CHARACTER_BLOCK_WIDTH = 320, CHARACTER_BLOCK_CONTENT_WIDTH = 320, CHARACTER_BLOCK_HEIGHT = 512, CHARACTER_BLOCK_CONTENT_HEIGHT = 512, CHARACTER_BLOCK_NAME_HEIGHT = 48;

  var highLightGroup;
  var memberSlots = {};

  function unregisterGameRoomSocketListener() {
    Client.offSocket(ServerClientEvent.onJoinRoom);
    Client.offSocket(ServerClientEvent.onLeaveRoom);
    Client.offSocket(ServerClientEvent.selectCharacter);
    Client.offSocket(ServerClientEvent.ensureSelectCharacter);
    Client.offSocket(ServerClientEvent.gameStart);
  }

  function navigateTo(name) {
    unregisterGameRoomSocketListener();
    game.state.start(name);
  }

  function registerGameRoomSocketListener() {
    Client.listen(ServerClientEvent.onJoinRoom, (data) => {
      Client.getRoom().addClient(new BasePlayer(data.client));
    });
    Client.listen(ServerClientEvent.onLeaveRoom, (data) => {
      var roomData = data.room;
      var clientId = data.clientId;
      var gameRoom = Client.getRoom();
      if(clientId === Client.getPlayer().id) {
        Client.leaveRoom();
        navigateTo('Lobby');
      }
      else {
        var client = gameRoom.removeClient(clientId);
        memberSlots[client.slotIndex].leave();
      }
    });
    Client.listen(ServerClientEvent.selectCharacter, (data) => {
      var clientData = data.client;
      Client.getRoom().updateClient(clientData);
      memberSlots[data.slotIndex].draw();
    });
    Client.listen(ServerClientEvent.ensureSelectCharacter, (data) => {
      var clientData = data.client;
      var gameRoom = Client.getRoom();
      gameRoom.updateClient(clientData);
      var client = gameRoom.getClientById(clientData.id);
      memberSlots[clientData.slotIndex].selectCharacter();
    });
    Client.listen(ServerClientEvent.gameStart, (data) => {
      countDownAndStartGame(3);
    });
  }

  function countDownAndStartGame(countDownTime) {
    function drawText(text) {
      var scaleFac = 2;
      var style = { font: 'bold 108px Microsoft Yahei', fill: '#777', align: 'center', boundsAlignH: 'center', boundsAlignV: 'middle' };
      var text = game.add.text(0, 0, text, style);
      text.setTextBounds(0, 0, game.width/scaleFac, game.height/scaleFac);
      text.scale.setTo(scaleFac);
      return text;
    }
    var text;
    game.time.events.repeat(Phaser.Timer.SECOND, countDownTime, () => {
      if(text)
        text.destroy();
      countDownTime -= 1;
      text = drawText(countDownTime);
      if(countDownTime == 0) {
        navigateTo('Arena');
      }
    }, this);
  }

  function MemberSlot(index) {
    this.index = index;
    this.x = CHARACTER_MENU_PADDING+CHARACTER_BLOCK_WIDTH*(this.index%4);
    this.y = CHARACTER_MENU_PADDING+CHARACTER_BLOCK_HEIGHT*parseInt(this.index/4);
    this.spr = game.add.group();
    this.sprGraphics = game.add.graphics(0,0);
    this.spr.add(this.sprGraphics);
    this.spr.position.set(this.x, this.y);
  }

  MemberSlot.prototype.draw = function() {
    this.sprGraphics.clear();
    this.sprGraphics.lineStyle(4, 0xff0000);
    this.sprGraphics.drawRect(0, 0, CHARACTER_BLOCK_CONTENT_WIDTH, CHARACTER_BLOCK_CONTENT_HEIGHT);
    if(this.isEmpty) {
      this.sprGraphics.moveTo(0,0);
      this.sprGraphics.lineTo(CHARACTER_BLOCK_CONTENT_WIDTH,CHARACTER_BLOCK_CONTENT_HEIGHT);
      this.sprGraphics.moveTo(CHARACTER_BLOCK_CONTENT_WIDTH,0);
      this.sprGraphics.lineTo(0,CHARACTER_BLOCK_CONTENT_HEIGHT);
    }
    else if(this.client) {
      this.removeCharacter();
      this.clientSpr = game.add.image(0, 0, Client.candidateCharacters[this.client.characterIndex].name);
      this.spr.add(this.clientSpr);
    }
  };

  MemberSlot.prototype.removeCharacter = function() {
    if(this.clientSpr) {
      this.spr.remove(this.clientSpr);
      delete this.clientSpr;
    }
  };

  MemberSlot.prototype.addCharacter = function() {
    this.removeCharacter();
    this.clientSpr = game.add.image(0, 0, Client.candidateCharacters[this.client.characterIndex].name);
    this.spr.add(this.clientSpr);
  };

  MemberSlot.prototype.join = function(client) {
    this.client = client;
    this.draw();
    if(client.id === Client.getPlayer().id) {
      this.highlight();
    }
    if(client.isLockCharacter) {
      this.selectCharacter();
    }
  };

  MemberSlot.prototype.leave = function() {
    this.deselectCharacter();
    if(this.clientSpr) {
      this.spr.remove(this.clientSpr);
      delete this.clientSpr;
      this.lowlight();
      this.removeCharacter();
      this.deselectCharacter();
    }
  };

  MemberSlot.prototype.highlight = function() {
    this.lowlight();
    this.highlightSpr = game.add.image(0, 0, 'highlight');
    this.highlightSpr.scale.setTo(64, 64);
    this.highlightSpr.alpha = 0.1;
    game.add.tween(this.highlightSpr).to({ alpha: 0.4 }, 1400, Phaser.Easing.Quadratic.InOut, true, null, null, true)
    this.spr.add(this.highlightSpr);
  };

  MemberSlot.prototype.lowlight = function() {
    if(this.highlightSpr) {
      this.spr.remove(this.highlightSpr);
      delete this.highlightSpr;
    }
  };

  MemberSlot.prototype.setEmpty = function() {
    this.isEmpty = true;
    this.draw();
  };

  MemberSlot.prototype.deselectCharacter = function() {
    if(this.selectSpr) {
      this.spr.remove(this.selectSpr, true);
      delete this.selectSpr;
    }
  };

  MemberSlot.prototype.selectCharacter = function() {
    this.deselectCharacter();
    this.lowlight();
    this.selectSpr = game.add.image(0, 0, 'select-character');
    this.spr.add(this.selectSpr);
  };

  GameRoom.prototype = {
    preload: function() {
      registerGameRoomSocketListener();
      var candidateCharacters = Client.candidateCharacters;
      for(var i in candidateCharacters) {
        var cch = candidateCharacters[i];
        game.load.image(cch.name, cch.avatarPath);
      }
      game.load.image('highlight', '/media/arena/character/character-highlight.png');
      game.load.image('select-character', '/media/select_character.png');
    },
    create: function() {
      game.stage.disableVisibilityChange = true;
      var gameRoom = Client.getRoom();
      for(var i = 0; i < gameRoom.maxMember; i++) {
        var slot = new MemberSlot(i);
        slot.draw();
        memberSlots[i] = slot;
      }
      for(var i = gameRoom.maxMember; i < MAX_RENDERED_MEMBER_COUNT; i++) {
        var slot = new MemberSlot(i);
        slot.draw();
        memberSlots[i] = slot;
        slot.setEmpty();
      }
      gameRoom.on('addClient', function(data) {
        var slot = memberSlots[data.client.slotIndex];
        slot.join(gameRoom.getClientById(data.client.id));
      });
      gameRoom.init();
      var candidateCharacters = Client.candidateCharacters;
      var character = Client.getPlayer();
      graphics = game.add.graphics(0,0);
      /*previous character*/
      game.input.keyboard.addKey(Phaser.Keyboard.LEFT).onDown.add(()=>{
        var charIndex = MathUtils.previous(character.characterIndex, candidateCharacters.length);
        Client.send(ClientServerEvent.selectCharacter, charIndex);
      }, this, 0);
      /*next character*/
      game.input.keyboard.addKey(Phaser.Keyboard.RIGHT).onDown.add(()=>{
        var charIndex = MathUtils.previous(character.characterIndex, candidateCharacters.length);
        Client.send(ClientServerEvent.selectCharacter, charIndex);
      }, this, 0);
      /*select character*/
      game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR).onDown.add(()=>{
        Client.send(ClientServerEvent.ensureSelectCharacter);
      }, this, 0);
      /*leave room*/
      game.input.keyboard.addKey(Phaser.Keyboard.ESC).onDown.add(()=>{
        Client.send(ClientServerEvent.leaveRoom);
      }, this, 0);
    },
    update: function() {
    },
    render: function() {
    }
  }
}());