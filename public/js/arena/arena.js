var Arena = function(game) {};

(function() {

  const DEBUG = false;

  var characterObj, charCtrl;
  var fireballs;

  var gameMgr;
  var characterData;

  Arena.prototype = {
    preload: function(cc) {
      game = this.game;
      characterData = Client.characters[Object.keys(Client.characters)[0]];
      game.load.image('bg', 'media/arena/grass/grass-1.png');
      game.load.image('bg2', 'media/arena/grass/grass-2.png');
      game.load.image('life-bar', 'media/arena/life-bar.png');
      game.load.image('life-bar-content', 'media/arena/life-bar-content.png');
      game.load.image('chatbox', 'media/chatbox.png');
      game.load.spritesheet('firen_ball', 'media/arena/firen_ball.png',82,83,12);
      game.load.spritesheet(characterData.name, characterData.path, characterData.width, characterData.height, characterData.framesCount);
      for(var key in AudioResource) {
        game.load.audio(key, AudioResource[key].path);
      }
    },
    create: function() {
      game.stage.disableVisibilityChange = true;
      game.world.setBounds(0, 0, ArenaSettings.BackgroundScale*game.width, game.height);
      game.physics.startSystem(Phaser.Physics.ARCADE);
      bg1 = game.add.tileSprite(0, 0, game.width, 128, 'bg');
      bg1.scale.setTo(ArenaSettings.BackgroundScale, 1);
      bg1.tileScale.x = 1/ArenaSettings.BackgroundScale;
      bg2 = game.add.tileSprite(0, 128, game.width, 896, 'bg2');
      bg2.scale.setTo(ArenaSettings.BackgroundScale, 1);
      bg2.tileScale.x = 1/ArenaSettings.BackgroundScale;

      fireballs = game.add.group();  // add a new group for fireballs
      fireballs.createMultiple(3, 'firen_ball', 0, false);

      var aoFactory = new ArenaObjectFactory(game);
      gameMgr = new GameManager(aoFactory);
      characterData = Client.characters[Object.keys(Client.characters)[0]];
      characterObj = aoFactory.createCharacter(characterData, 500, ArenaSettings.MAX_BASELINE, gameMgr);
      charCtrl = new CharacterController(characterObj, aoFactory);
      gameMgr.addPlayer(characterObj);

      cursors = game.input.keyboard.createCursorKeys();
      game.camera.follow(characterObj.spr);

      var keyUp = game.input.keyboard.addKey(Phaser.Keyboard.NUMPAD_8);
      keyUp.onDown.add(() => {charCtrl.upKeyDown();}, this)
      keyUp.onUp.add(() => {charCtrl.upKeyUp();}, this);
      var keyDown = game.input.keyboard.addKey(Phaser.Keyboard.NUMPAD_2)
      keyDown.onDown.add(() => {charCtrl.bottomKeyDown();}, this);
      keyDown.onUp.add(() => {charCtrl.bottomKeyUp();}, this);
      var keyLeft = game.input.keyboard.addKey(Phaser.Keyboard.NUMPAD_4)
      keyLeft.onDown.add(()=>{charCtrl.leftKeyDown();}, this);
      keyLeft.onUp.add(() => {charCtrl.leftKeyUp();}, this);
      var keyRight = game.input.keyboard.addKey(Phaser.Keyboard.NUMPAD_6)
      keyRight.onDown.add(() => {charCtrl.rightKeyDown();}, this);
      keyRight.onUp.add(() => {charCtrl.rightKeyUp();}, this);
      game.input.keyboard.addKey(Phaser.Keyboard.NUMPAD_5)
      .onDown.add(() => {charCtrl.atkKeyDown();}, this);
      game.input.keyboard.addKey(Phaser.Keyboard.NUMPAD_0)
      .onDown.add(() => {charCtrl.jumpKeyDown();}, this);
      var defKey = game.input.keyboard.addKey(Phaser.Keyboard.NUMPAD_ADD);
      defKey.onDown.add(() => {charCtrl.defKeyDown();}, this);
      /*const speakContent = ['hi~~', '國民黨不倒 台灣不會好', 'Let\'s battle!', 'Work smart dont\'t work hard'];
      var speakIndex = 0;
      game.time.events.loop(Phaser.Timer.SECOND*2.2, ()=>{
        charCtrl.speak(speakContent[speakIndex]);
        speakIndex = (speakIndex+1)%speakContent.length;
      },this);*/
},
update: function() {
  characterObj.update();
  charCtrl.update();
  gameMgr.update();
},
render: function() {
  if(DEBUG) {
    game.debug.body(characterObj.spr);
    var tmpBullets = gameMgr.bullets;
    for(var i in tmpBullets) {
      var bullet = tmpBullets[i];
      game.debug.body(bullet.spr);
    }
  }
}
}
}());