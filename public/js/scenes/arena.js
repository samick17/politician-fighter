var Arena = function(game) {};

(function() {

  const DEBUG = false;

  var characterObj, charCtrl;
  var fireballs;

  var gameMgr;
  var characterData;

  function unregisterGameRoomSocketListener() {
    Client.offSocket(ServerClientEvent.gameOver);
  }

  function navigateTo(name) {
    unregisterGameRoomSocketListener();
    game.state.start(name);
  }

  function registerGameRoomSocketListener() {
    Client.listen(ServerClientEvent.gameOver, (data) => {
      navigateTo('Lobby');
    });
  }

  Arena.prototype = {
    preload: function(cc) {
      registerGameRoomSocketListener();
      game = this.game;
      characterData = Client.characters['firen'];
      game.load.image('box', 'media/arena/props/box.png');
      game.load.image('bg', 'media/arena/grass/grass-1.png');
      game.load.image('bg2', 'media/arena/grass/grass-2.png');
      game.load.image('life-bar', 'media/arena/life-bar.png');
      game.load.image('life-bar-content', 'media/arena/life-bar-content.png');
      game.load.image('chatbox', 'media/chatbox.png');
      game.load.spritesheet('firen_ball', 'media/arena/firen_ball.png',82,83,12);
      game.load.spritesheet('winstorm', 'media/arena/skill/ww.png',160,160,10);
      game.load.spritesheet('weapon', 'media/arena/weapon/weapon0.png',70,70,40);
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
      characterObj = gameMgr.addPlayer('firen');
      charCtrl = new CharacterController(characterObj, aoFactory);
      var box = gameMgr.addMapItem({box: {id: Utils.generateGUID(), spriteSheetName: 'box', coord: new Vector(25,0,58), audios: ['woodenboxHit1', 'woodenboxHit2']}});
      box.init();
      var w1 = gameMgr.addMapItem({weapon: {id: Utils.generateGUID(), spriteSheetName: 'weapon', coord: new Vector(12,0,58)}});
      characterObj.equipWeapon(w1);
      //w1.init();

      cursors = game.input.keyboard.createCursorKeys();
      game.camera.follow(characterObj.spr);

      var keyUp = game.input.keyboard.addKey(Phaser.Keyboard.UP);
      keyUp.onDown.add(() => {charCtrl.upKeyDown();}, this)
      keyUp.onUp.add(() => {charCtrl.upKeyUp();}, this);
      var keyDown = game.input.keyboard.addKey(Phaser.Keyboard.DOWN)
      keyDown.onDown.add(() => {charCtrl.bottomKeyDown();}, this);
      keyDown.onUp.add(() => {charCtrl.bottomKeyUp();}, this);
      var keyLeft = game.input.keyboard.addKey(Phaser.Keyboard.LEFT)
      keyLeft.onDown.add(()=>{charCtrl.leftKeyDown();}, this);
      keyLeft.onUp.add(() => {charCtrl.leftKeyUp();}, this);
      var keyRight = game.input.keyboard.addKey(Phaser.Keyboard.RIGHT)
      keyRight.onDown.add(() => {charCtrl.rightKeyDown();}, this);
      keyRight.onUp.add(() => {charCtrl.rightKeyUp();}, this);
      game.input.keyboard.addKey(Phaser.Keyboard.C)
      .onDown.add(() => {charCtrl.atkKeyDown();}, this);
      game.input.keyboard.addKey(Phaser.Keyboard.X)
      .onDown.add(() => {charCtrl.jumpKeyDown();}, this);
      var defKey = game.input.keyboard.addKey(Phaser.Keyboard.Z);
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