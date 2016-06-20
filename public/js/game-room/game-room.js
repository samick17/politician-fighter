var GameRoom = function(game) {};

(function() {

  const MAX_RENDERED_MEMBER_COUNT = 8;
  const CHARACTER_MENU_PADDING = 0, CHARACTER_BLOCK_WIDTH = 320, CHARACTER_BLOCK_CONTENT_WIDTH = 320, CHARACTER_BLOCK_HEIGHT = 512, CHARACTER_BLOCK_CONTENT_HEIGHT = 512, CHARACTER_BLOCK_NAME_HEIGHT = 48;

  var highLightGroup;

  Client.on(ServerClientEvent.RefreshRoomMembers, (data) => {
    for(var i in data.clients) {
      var clientData = data.clients[i];
      appMgr.updateClient(clientData);
    }
  });
  Client.on(ServerClientEvent.OnLeaveRoom, (data) => {
    var roomData = data.room;
    var clientId = data.clientId;
    var gameRoom = appMgr.getRoomById(roomData.id);
    client = appMgr.getClientById(clientId);
    var idx = indexOfArrayProperty(gameRoom.members, 'id', clientId);
    gameRoom.update(roomData);
    client.grDestroyAvatar();
    drawCharacterCrossedBlock(idx);
  });
  Client.on(ServerClientEvent.SelectCharacter, (data) => {
    var clientData = data.client;
    appMgr.updateClient(clientData.id);
    var client = appMgr.getClientById(clientData.id);
    client.grUpdateSelectedCharacter(data.index);
  });
  Client.on(ServerClientEvent.EnsureSelectCharacter, (data) => {
    var clientData = data.client;
    appMgr.updateClient(clientData);
    var client = appMgr.getClientById(clientData.id);
    client.grLowlight();
    client.grEnsureSelect();
    var isLockAll = true;
    for(var i in appMgr.getAllClients()) {
      var clt = appMgr.getAllClients()[i];
      if(!clt.isLockCharacter) {
        isLockAll = false;
        break;
      }
    }
    if(isLockAll)
      countDownAndStartGame();
  });

  function drawCharacterBlock(client, i, focus) {
    var x = CHARACTER_MENU_PADDING+CHARACTER_BLOCK_WIDTH*(i%4);
    var y = CHARACTER_MENU_PADDING+CHARACTER_BLOCK_HEIGHT*parseInt(i/4);
    var charAvatarGroup = game.add.group();
    client.grUpdateSelectedCharacter = function(i) {
      client.characterIndex = i;
      if(charAvatarGroup) {
        charAvatarGroup.destroy();
        charAvatarGroup = game.add.group();
      }
      var menuItemAvatar = game.add.image(0, 0, appMgr.candidateCharacters[client.characterIndex].name);
      charAvatarGroup.add(menuItemAvatar);
      charAvatarGroup.x = x;
      charAvatarGroup.y = y;
      if(client.grHighLightGroup)
        game.world.bringToTop(client.grHighLightGroup);
    };
    client.grDestroyAvatar = function() {
      charAvatarGroup.destroy();
    };
    client.grHighlight = function() {
      client.grHighLightGroup = game.add.group();
      var highLightGroup = client.grHighLightGroup;
      var highlightImg = game.add.image(x, y, 'highlight');
      highlightImg.scale.setTo(64, 64);
      highlightImg.alpha = 0.1;
      game.add.tween(highlightImg).to({ alpha: 0.4 }, 1400, Phaser.Easing.Quadratic.InOut, true, null, null, true)
      highLightGroup.add(highlightImg);
    };
    client.grLowlight = function() {
      if(client.grHighLightGroup) {
        var highLightGroup = client.grHighLightGroup;
        highLightGroup.destroy();
        highLightGroup = null;
      }
    };
    client.grEnsureSelect = function() {
      var imgSelectChar = game.add.image(0, 0, 'select-character');
      charAvatarGroup.add(imgSelectChar);
    };
    if(focus)
      client.grHighlight();
    client.grUpdateSelectedCharacter(client.characterIndex);
    if(client.isLockCharacter)
      client.grEnsureSelect();
  }

  function drawEmptyCharacterBlock(i) {
    var x = CHARACTER_MENU_PADDING+CHARACTER_BLOCK_WIDTH*(i%4);
    var y = CHARACTER_MENU_PADDING+CHARACTER_BLOCK_HEIGHT*parseInt(i/4);
    graphics
    .lineStyle(3, 0xff0000)
    .drawRect(x, y, CHARACTER_BLOCK_CONTENT_WIDTH, CHARACTER_BLOCK_CONTENT_HEIGHT)
    .endFill();
  }

  function drawCharacterCrossedBlock(i) {
    var x = CHARACTER_MENU_PADDING+CHARACTER_BLOCK_WIDTH*(i%4);
    var y = CHARACTER_MENU_PADDING+CHARACTER_BLOCK_HEIGHT*parseInt(i/4);
    graphics
    .lineStyle(3, 0xff0000)
    .drawRect(x, y, CHARACTER_BLOCK_CONTENT_WIDTH, CHARACTER_BLOCK_CONTENT_HEIGHT)
    .moveTo(x, y)
    .lineTo(x+CHARACTER_BLOCK_CONTENT_WIDTH, y+CHARACTER_BLOCK_CONTENT_HEIGHT)
    .moveTo(x+CHARACTER_BLOCK_CONTENT_WIDTH, y)
    .lineTo(x, y+CHARACTER_BLOCK_CONTENT_HEIGHT)
    .endFill();
  }

  function countDownAndStartGame() {
    game.state.start('Arena');
    /*function drawText(text) {
      var scaleFac = 2;
      var style = { font: 'bold 108px Microsoft Yahei', fill: '#777', align: 'center', boundsAlignH: 'center', boundsAlignV: 'middle' };
      var text = game.add.text(0, 0, text, style);
      text.setTextBounds(0, 0, game.width/scaleFac, game.height/scaleFac);
      text.scale.setTo(scaleFac);
      return text;
    }
    var countDownTime = 6;
    var text;
    game.time.events.repeat(Phaser.Timer.SECOND, countDownTime, () => {
      if(text)
        text.destroy();
      countDownTime -= 1;
      text = drawText(countDownTime);
      if(countDownTime == 0) {
        game.state.start('Arena');
      }
    }, this);*/
  }

  GameRoom.prototype = {
    preload: function() {
      var candidateCharacters = appMgr.candidateCharacters;
      for(var i in candidateCharacters) {
        var cch = candidateCharacters[i];
        game.load.image(cch.name, cch.avatarPath);
      }
      game.load.image('highlight', '/media/arena/character/character-highlight.png');
      game.load.image('select-character', '/media/select_character.png');
    },
    create: function() {
      var gameRoom = appMgr.getRoom();
      gameRoom.on('addClient', function(data) {
        console.log(data.client);
        drawCharacterBlock(data.client, data.idx, false);
      });
      var candidateCharacters = appMgr.candidateCharacters;
      var roomMembers = gameRoom.clients;
      var character = roomMembers[appMgr.getClient().id];
      graphics = game.add.graphics(0,0);
      for(var i in gameRoom.members) {
        var member = gameRoom.members[i];
        var client = appMgr.getClientById(member.id);
        drawCharacterBlock(client, i, client.id === appMgr.getClient().id);
      }
      for(var i = gameRoom.members.length; i < gameRoom.maxMember; i++) {
        drawEmptyCharacterBlock(i);
      }
      for(var i = gameRoom.maxMember; i < MAX_RENDERED_MEMBER_COUNT; i++) {
        drawCharacterCrossedBlock(i);
      }
      game.input.keyboard.addKey(Phaser.Keyboard.LEFT).onDown.add(()=>{
        var charIndex = MathUtils.previous(character.characterIndex, candidateCharacters.length);
        Client.send(ClientServerEvent.SelectCharacter, charIndex);
        //character.updateSelectedCharacter(MathUtils.previous(character.characterIndex, candidateCharacters.length));
      }, this, 0);
      game.input.keyboard.addKey(Phaser.Keyboard.RIGHT).onDown.add(()=>{
        var charIndex = MathUtils.previous(character.characterIndex, candidateCharacters.length);
        Client.send(ClientServerEvent.SelectCharacter, charIndex);
        //character.updateSelectedCharacter(MathUtils.next(character.characterIndex, candidateCharacters.length));
      }, this, 0);
      game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR).onDown.add(()=>{
        Client.send(ClientServerEvent.EnsureSelectCharacter);
        //game.state.start("Arena");
      }, this, 0);
      //countDownAndStartGame();
    },
    update: function() {
    },
    render: function() {
    }
  }
}());