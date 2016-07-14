var Arena = function(game) {};

(function() {

  const DEBUG = false;

  var player, charCtrl;
  var fireballs;

  var characterData;

  function unregisterGameRoomSocketListener() {
    Client.offSocket(ServerClientEvent.gameOver);
    Client.offSocket(ServerClientEvent.switchToRunMode);
    Client.offSocket(ServerClientEvent.moveTo);
    Client.offSocket(ServerClientEvent.jump);
    Client.offSocket(ServerClientEvent.doubleJump);
    Client.offSocket(ServerClientEvent.idle);
  }

  function navigateTo(name) {
    unregisterGameRoomSocketListener();
    game.state.start(name);
  }

  function registerGameRoomSocketListener() {
    Client.listen(ServerClientEvent.gameOver, (data) => {
      navigateTo('Lobby');
    });
    Client.listen(ServerClientEvent.switchToRunMode, (data) => {
      var character = GameMgr.getPlayerById(data.id);
      if(character) {
        character.switchToRunMode();
      }
    });
    Client.listen(ServerClientEvent.moveTo, (data) => {
      var character = GameMgr.getPlayerById(data.id);
      if(character) {
        character.moveTo(data.coord, data.moveType);
      }
    });
    Client.listen(ServerClientEvent.jump, (data) => {
      var character = GameMgr.getPlayerById(data.id);
      if(character) {
        character.jump();
      }
    });
    Client.listen(ServerClientEvent.doubleJump, (data) => {
      var character = GameMgr.getPlayerById(data.id);
      if(character) {
        character.doJump();
      }
    });
    Client.listen(ServerClientEvent.idle, (data) => {
      var character = GameMgr.getPlayerById(data.id);
      if(character) {
        character.switchToWalkMode();
      }
    });
  }

  function registerPCController(game, charCtrl) {
    var keyUp = game.input.keyboard.addKey(Phaser.Keyboard.UP);
    keyUp.onDown.add(() => {charCtrl.upKeyDown();}, this);
    keyUp.onUp.add(() => {charCtrl.upKeyUp();}, this);
    var keyDown = game.input.keyboard.addKey(Phaser.Keyboard.DOWN);
    keyDown.onDown.add(() => {charCtrl.bottomKeyDown();}, this);
    keyDown.onUp.add(() => {charCtrl.bottomKeyUp();}, this);
    var keyLeft = game.input.keyboard.addKey(Phaser.Keyboard.LEFT);
    keyLeft.onDown.add(()=>{charCtrl.leftKeyDown();}, this);
    keyLeft.onUp.add(() => {charCtrl.leftKeyUp();}, this);
    var keyRight = game.input.keyboard.addKey(Phaser.Keyboard.RIGHT);
    keyRight.onDown.add(() => {charCtrl.rightKeyDown();}, this);
    keyRight.onUp.add(() => {charCtrl.rightKeyUp();}, this);
    game.input.keyboard.addKey(Phaser.Keyboard.C)
    .onDown.add(() => {charCtrl.atkKeyDown();}, this);
    game.input.keyboard.addKey(Phaser.Keyboard.X)
    .onDown.add(() => {charCtrl.jumpKeyDown();}, this);
    var defKey = game.input.keyboard.addKey(Phaser.Keyboard.Z);
    defKey.onDown.add(() => {charCtrl.defKeyDown();}, this);
  }

  function registerMobileController(game, charCtrl) {
    /*//
    new VirtualController(game, {
      left: function() {
        charCtrl.upKeyDown();
        charCtrl.faceUp();
      },
      right: function() {
        charCtrl.bottomKeyDown();
        charCtrl.faceBottom();
      },
      up: function() {
        charCtrl.leftKeyDown();
        charCtrl.faceLeft();
      },
      down: function() {
        charCtrl.rightKeyDown();
        charCtrl.faceRight();
      },
      cancel: function() {
        charCtrl.upKeyUp();
        charCtrl.bottomKeyUp();
        charCtrl.leftKeyUp();
        charCtrl.rightKeyUp();
      },
      atk: function() {
        charCtrl.doKeyDown();
      }
    });*/
  }

Arena.prototype = {
  preload: function(cc) {
    registerGameRoomSocketListener();
    game = this.game;
    game.scale.fullScreenScaleMode = Phaser.ScaleManager.SHOW_ALL;
    game.stage.disableVisibilityChange = true;
      //characterData = Client.characters['freeze'];
      game.load.image('box', 'media/arena/props/box.png');
      game.load.image('bg', 'media/arena/grass/grass-1.png');
      game.load.image('bg2', 'media/arena/grass/grass-2.png');
      game.load.image('life-bar', 'media/arena/life-bar.png');
      game.load.image('life-bar-content', 'media/arena/life-bar-content.png');
      game.load.image('chatbox', 'media/chatbox.png');
      game.load.spritesheet('firen_ball', 'media/arena/firen_ball.png',82,83,12);
      game.load.spritesheet('winstorm', 'media/arena/skill/ww.png',160,160,10);
      game.load.spritesheet('weapon', 'media/arena/weapon/weapon0.png',70,70,40);
      game.load.spritesheet('iconslot', 'media/ui/iconslot.png', 64, 64, 1);
      game.load.spritesheet('control', 'media/ui/control.png', 64, 64, 1);
      for(var i in Client.characters) {
        var characterData = Client.characters[i];
        game.load.spritesheet(characterData.name, characterData.path, characterData.width, characterData.height, characterData.framesCount);
      }
      for(var key in AudioResource) {
        game.load.audio(key, AudioResource[key].path);
      }
    },
    create: function() {
      game.world.setBounds(0, 0, ArenaSettings.BackgroundScale*game.width, game.height);

      /*var circleBar = new CircleBar();
      var allParties = GameManager.getAllParties();
      for(var i in allParties) {
        var party = allParties[i];
        circleBar.addParty(party);
        party.on('score', function() {
          circleBar.redraw();
        });
      }
      circleBar.redraw();
      var rankBoard = new RankBoard();
      rankBoard.redraw();*/

      game.physics.startSystem(Phaser.Physics.ARCADE);
      bg1 = game.add.tileSprite(0, 0, game.width, 128, 'bg');
      bg1.scale.setTo(ArenaSettings.BackgroundScale, 1);
      bg1.tileScale.x = 1/ArenaSettings.BackgroundScale;
      bg2 = game.add.tileSprite(0, 128, game.width, 896, 'bg2');
      bg2.scale.setTo(ArenaSettings.BackgroundScale, 1);
      bg2.tileScale.x = 1/ArenaSettings.BackgroundScale;

      fireballs = game.add.group();  // add a new group for fireballs
      fireballs.createMultiple(3, 'firen_ball', 0, false);

      /**/
      var player = GameMgr.getPlayer();
      charCtrl = new CharacterController(player, AOFactory);
      var box = GameMgr.addMapItem({box: {id: Utils.generateGUID(), spriteSheetName: 'box', coord: new Vector(25,0,58), audios: ['woodenboxHit1', 'woodenboxHit2']}});
      var w1 = GameMgr.addMapItem({weapon: {id: Utils.generateGUID(), spriteSheetName: 'weapon', coord: new Vector(0,0,0)}});
      //player.equipWeapon(w1);
      GameMgr.init();

      cursors = game.input.keyboard.createCursorKeys();
      game.camera.follow(player.spr);

      player.on(CharacterEvent.updateRankBoard, function(ranking) {
        for(var i in ranking) {
          var rank = ranking[i];
          rankBoard.changeRank(i, rank);
        }
      });

      var characterUIScaling = 1;
      switch(getUserDevice()) {
        case UserDevice.PC:
        registerPCController(game, charCtrl);
        break;
        case UserDevice.Mobile:
        registerMobileController(game, charCtrl);
        GameManager.displayFullScreenToggle({
          toggle: function() {
            if (game.scale.isFullScreen) {
              game.scale.stopFullScreen();
            }
            else {
              game.scale.startFullScreen(false);
            }
          }
        });
        characterUIScaling = 2;
        break;
      }
      var characterUI = new CharacterUI(charCtrl, characterUIScaling);
      //characterUI.addUIObject(UIKeys.PartyRankBoard, circleBar);
      //characterUI.addUIObject(UIKeys.RankBoard, rankBoard);
    },
    update: function() {
      charCtrl.update();
      GameMgr.update();
    },
    render: function() {
      if(DEBUG) {
        game.debug.body(player.spr);
        var tmpBullets = GameMgr.bullets;
        for(var i in tmpBullets) {
          var bullet = tmpBullets[i];
          game.debug.body(bullet.spr);
        }
      }
    }
  }
}());