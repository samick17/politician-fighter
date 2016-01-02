var GameRoom = function(game) {};

(function() {

  const MAX_RENDERED_MEMBER_COUNT = 8;
  const CHARACTER_MENU_PADDING = 0, CHARACTER_BLOCK_WIDTH = 320, CHARACTER_BLOCK_CONTENT_WIDTH = 320, CHARACTER_BLOCK_HEIGHT = 512, CHARACTER_BLOCK_CONTENT_HEIGHT = 512, CHARACTER_BLOCK_NAME_HEIGHT = 48;

  var candidateCharacters = [
    {name: 'SungLa', avatarPath: '/media/arena/character/sung/sung.jpg'},
    {name: 'Tsai', avatarPath: '/media/arena/character/tsai/tsai.jpg'},
    {name: 'KerP', avatarPath: '/media/arena/character/kp/kp.jpg'},
    {name: 'DDL', avatarPath: '/media/arena/character/ddl/ddl.jpg'}
  ];

  var characters = [
    {id: 0, selectedCharacter: 2},
    {id: 1, selectedCharacter: 3},
    {id: 2, selectedCharacter: 1},
    {id: 3, selectedCharacter: 0},
    {id: 4, selectedCharacter: 2},
    {id: 5, selectedCharacter: 2}
  ];

  var character = characters[3];

  function drawCharacterBlock(ch, i, focus) {
    var x = CHARACTER_MENU_PADDING+CHARACTER_BLOCK_WIDTH*(i%4);
    var y = CHARACTER_MENU_PADDING+CHARACTER_BLOCK_HEIGHT*parseInt(i/4);
    var menuItemAvatar;
    var highLightGroup = game.add.group();
    ch.updateSelectedCharacter = function(i) {
      ch.selectedCharacter = i;
      if(menuItemAvatar)
        menuItemAvatar.destroy();
      menuItemAvatar = game.add.image(x, y, candidateCharacters[ch.selectedCharacter].name);
      menuItemAvatar.scale.setTo(0.35242, 0.35242);
      game.world.bringToTop(highLightGroup);
    };
    ch.updateSelectedCharacter(ch.selectedCharacter);
    if(focus) {
      var highlightImg = game.add.image(x, y, 'highlight');
      highlightImg.scale.setTo(64, 64);
      highlightImg.alpha = 0.1;
      game.add.tween(highlightImg).to({ alpha: 0.4 }, 1400, Phaser.Easing.Quadratic.InOut, true, null, null, true)
      highLightGroup.add(highlightImg);
    }
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
      for(var i in candidateCharacters) {
        var cch = candidateCharacters[i];
        game.load.image(cch.name, cch.avatarPath);
      }
      game.load.image('highlight', '/media/arena/character/character-highlight.png');
    },
    create: function() {
      graphics = game.add.graphics(0,0);
      var playerCharacterIndex = characters.indexOf(character);
      for(var i = 0; i < characters.length; i++) {
        var ch = characters[i];
        drawCharacterBlock(ch, i, playerCharacterIndex === i);
      }
      for(i; i < MAX_RENDERED_MEMBER_COUNT; i++) {
        drawCharacterCrossedBlock(i);
      }
      game.input.keyboard.addKey(Phaser.Keyboard.LEFT).onDown.add(()=>{
        //character.selectedCharacter  = Math.abs((character.selectedCharacter-1)%candidateCharacters.length);
        character.updateSelectedCharacter(MathUtils.previous(character.selectedCharacter, candidateCharacters.length));//Math.abs((character.selectedCharacter-1)%candidateCharacters.length));
      }, this, 0);
      game.input.keyboard.addKey(Phaser.Keyboard.RIGHT).onDown.add(()=>{
        character.updateSelectedCharacter(MathUtils.next(character.selectedCharacter, candidateCharacters.length));
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