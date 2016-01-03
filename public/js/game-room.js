var GameRoom = function(game) {};

(function() {

  const MAX_RENDERED_MEMBER_COUNT = 8;
  const CHARACTER_MENU_PADDING = 0, CHARACTER_BLOCK_WIDTH = 320, CHARACTER_BLOCK_CONTENT_WIDTH = 320, CHARACTER_BLOCK_HEIGHT = 512, CHARACTER_BLOCK_CONTENT_HEIGHT = 512, CHARACTER_BLOCK_NAME_HEIGHT = 48;

  var highLightGroup;
  /*var characters = [
    {id: 0, selectedCharacter: 2},
    {id: 1, selectedCharacter: 3},
    {id: 2, selectedCharacter: 1},
    {id: 3, selectedCharacter: 0},
    {id: 4, selectedCharacter: 2},
    {id: 5, selectedCharacter: 2}
  ];*/

  //var character = characters[3];
  //update selected character:
  //characters[1].updateSelectedCharacter(MathUtils.next(characters[1].selectedCharacter, candidateCharacters.length));

  function drawCharacterBlock(ch, i, focus) {
    //var candidateCharacters = appMgr.candidateCharacters;
    var x = CHARACTER_MENU_PADDING+CHARACTER_BLOCK_WIDTH*(i%4);
    var y = CHARACTER_MENU_PADDING+CHARACTER_BLOCK_HEIGHT*parseInt(i/4);
    var menuItemAvatar;
    ch.updateSelectedCharacter = function(i) {
      ch.characterIndex = i;
      if(menuItemAvatar)
        menuItemAvatar.destroy();
      menuItemAvatar = game.add.image(x, y, appMgr.candidateCharacters[ch.characterIndex].name);
      if(highLightGroup)
        game.world.bringToTop(highLightGroup);
    };
    if(focus) {
      highLightGroup = game.add.group();
      var highlightImg = game.add.image(x, y, 'highlight');
      highlightImg.scale.setTo(64, 64);
      highlightImg.alpha = 0.1;
      game.add.tween(highlightImg).to({ alpha: 0.4 }, 1400, Phaser.Easing.Quadratic.InOut, true, null, null, true)
      highLightGroup.add(highlightImg);
    }
    ch.updateSelectedCharacter(ch.characterIndex);
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

  GameRoom.prototype = {
    preload: function() {
      var candidateCharacters = appMgr.candidateCharacters;
      for(var i in candidateCharacters) {
        var cch = candidateCharacters[i];
        game.load.image(cch.name, cch.avatarPath);
      }
      game.load.image('highlight', '/media/arena/character/character-highlight.png');
    },
    create: function() {
      var gameRoom = appMgr.getRoom();
      gameRoom.on('addClient', function(client) {
        var idx = indexOfArrayProperty(gameRoom.members, 'id', client.id);
        drawCharacterBlock(client, idx, false);
      });
      var candidateCharacters = appMgr.candidateCharacters;
      var roomMembers = gameRoom.clients;
      var character = roomMembers[appMgr.getClient().id];
      graphics = game.add.graphics(0,0);
      for(var i in gameRoom.members) {
        var member = gameRoom.members[i];
        var client = appMgr.getClientById(member.id);
        console.log(client)
        drawCharacterBlock(client, i, client.id === appMgr.getClient().id);
      }
      for(var i = gameRoom.members.length; i < MAX_RENDERED_MEMBER_COUNT; i++) {
        drawCharacterCrossedBlock(i);
      }
      game.input.keyboard.addKey(Phaser.Keyboard.LEFT).onDown.add(()=>{
        character.updateSelectedCharacter(MathUtils.previous(character.characterIndex, candidateCharacters.length));
      }, this, 0);
      game.input.keyboard.addKey(Phaser.Keyboard.RIGHT).onDown.add(()=>{
        character.updateSelectedCharacter(MathUtils.next(character.characterIndex, candidateCharacters.length));
      }, this, 0);
      game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR).onDown.add(()=>{
        game.state.start("Arena");
      }, this, 0);
    },
    update: function() {
    },
    render: function() {
    }
  }
}());