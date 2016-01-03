var Arena = function(game) {};

(function() {

  const BackgroundScale = 5;
  const BaseLineHeight = 32;
  const VMotionState = {UP: 0, DOWN: 1, NONE: 2};
  const HMotionState = {LEFT: 0, RIGHT: 1, NONE: 2};
  const MIN_BASELINE = 0, MAX_BASELINE = 27;

  var playerObj;
  var fireballs;
  var nextJump = Number.NEGATIVE_INFINITY, nextMoveDown = Number.NEGATIVE_INFINITY, nextInputThreshold = 20, lastInputTime = Number.NEGATIVE_INFINITY, inputTimeout = Number.NEGATIVE_INFINITY, nextFire = Number.NEGATIVE_INFINITY, fireRate = 300;

  var characterData;

  var skillGenerator = {
    'lrr': function() {
      fire_now();
    },
    'dla': function() {
      fire_now();
    },
    'dra': function() {
      fire_now();
    },
    'dja': function() {
      fire_now();
      nextFire = game.time.now-5;
      fire_now();
    }
  };

  var currentInput = [];
  function appendInput(inputText) {
    if(game.time.now - lastInputTime > nextInputThreshold) {
      currentInput.push(inputText);
      var currentInputValue = currentInput.join('');
      if(skillGenerator[currentInputValue]) {
        skillGenerator[currentInputValue]();
        currentInput = [];
        inputTimeout = Number.NEGATIVE_INFINITY;
        return false;
      }
      inputTimeout = game.time.now + 300;
      lastInputTime = game.time.now;
      return true;
    }
    return false;
  }

  function createPlayer(x, baseLine) {
    var player = game.add.sprite(x, baseLine*BaseLineHeight, characterData.name);
    player.pivot.x = player.width/2;
    player.pivot.y = player.height/2;
    game.physics.enable(player, Phaser.Physics.ARCADE);
    player.body.gravity.set(0, 0);
    player.scale.setTo(2,2);
    for(var i in characterData.anims) {
      var anim = characterData.anims[i];
      player.animations.add(anim.name, anim.frames, anim.fps, anim.repeat);
    }
    function Player(spr) {
      this.spr = spr;
      this.isJump = false;
      this.baseLine = baseLine;
      this.velocity = 5;
      this.vMotionState = VMotionState.NONE;
      this.hMotionState = HMotionState.NONE;
    }
    Player.prototype.turnLeft = function() {
      this.spr.scale.setTo(-2, 2);
      this.spr.body.setSize(-player.width/2, player.height/2, player.width, 0);
    };
    Player.prototype.turnRight = function() {
      this.spr.scale.setTo(2, 2);
      this.spr.body.setSize(-player.width/2, player.height/2, player.width, 0);
    };
    Player.prototype.jump = function() {
      if (!this.isJump && game.time.now > nextJump){
        this.spr.body.velocity.setTo(this.spr.body.velocity.x, -400);
        player.body.gravity.set(0, 900);
        nextJump = game.time.now + 900;
        this.isJump = true;
      }
    };
    Player.prototype.moveUp = function() {
      if (!this.isJump && game.time.now > nextMoveDown && this.baseLine > MIN_BASELINE){
        this.baseLine -= 1;
        game.add.tween(this.spr.body).to({ y: this.baseLine * BaseLineHeight }, 100, Phaser.Easing.Linear.None, true, null, 0, false);
        nextMoveDown = game.time.now + 100;
      }
    };
    Player.prototype.moveDown = function() {
      if (!this.isJump && game.time.now > nextMoveDown && this.baseLine < MAX_BASELINE) {
        this.baseLine += 1;
        game.add.tween(this.spr.body).to({ y: this.baseLine * BaseLineHeight }, 100, Phaser.Easing.Linear.None, true, null, 0, false);
        nextMoveDown = game.time.now + 100;
      }
    };
    Player.prototype.moveLeft = function() {
      this.turnLeft();
      if(this.spr.body.x >= this.velocity) {
        this.spr.body.x -= this.velocity;
      }
    };
    Player.prototype.moveRight = function() {
      this.turnRight();
      if(this.spr.body.x <= game.world.getBounds().right-this.velocity) {
        this.spr.body.x += this.velocity;
      }
    };
    Player.prototype.grounded = function() {
      this.spr.body.y = this.baseLine * BaseLineHeight;
      this.spr.body.gravity.set(0, 0);
      this.spr.body.velocity.setTo(this.spr.body.velocity.x, 0);
      this.isJump = false;
    }
    Player.prototype.update = function() {
      switch(this.vMotionState) {
        case VMotionState.UP:
        this.moveUp();
        player.animations.play('walk');
        break;
        case VMotionState.DOWN:
        this.moveDown();
        player.animations.play('walk');
        break;
      }
      switch(this.hMotionState) {
        case HMotionState.LEFT:
        this.moveLeft();
        player.animations.play('walk');
        break;
        case HMotionState.RIGHT:
        this.moveRight();
        player.animations.play('walk');
        break;
      }
      if(this.vMotionState === VMotionState.NONE && this.hMotionState == HMotionState.NONE)
        player.animations.play('idle');
      if(this.isJump && this.spr.body.y > this.baseLine * BaseLineHeight) {
        this.grounded();
      }
    };
    return new Player(player);
  }

  function fire_now() {
    nextFire = game.time.now + fireRate;
    var fireball = fireballs.getFirstExists(false); // get the first created fireball that no exists atm
    if (fireball) {
      fireball.exists = true;  // come to existance !
      fireball.lifespan = 1500;  // remove the fireball after 2500 milliseconds - back to non-existance
      if(playerObj.spr.scale.x < 0){  // if player looks to the left - create the fireball on his left side
        fireball.reset(playerObj.spr.x-20, playerObj.spr.y);
        game.physics.enable(fireball, Phaser.Physics.ARCADE);
        fireball.body.velocity.setTo(-800,0);
      } else {
        fireball.reset(playerObj.spr.x+20, playerObj.spr.y);
        game.physics.enable(fireball, Phaser.Physics.ARCADE);
        fireball.body.velocity.setTo(800,0);
      }
    }
  }

  Arena.prototype = {
    preload: function(cc) {
      game = this.game;
      characterData = appMgr.characters[Object.keys(appMgr.characters)[0]];
      game.load.image('bg', 'media/arena/grass/grass-1.png');
      game.load.image('bg2', 'media/arena/grass/grass-2.png');
      game.load.image('life-bar', 'media/arena/life-bar.png');
      game.load.image('life-bar-content', 'media/arena/life-bar-content.png');
      game.load.spritesheet('firen_ball', 'media/arena/firen_ball.bmp',82,83,12);
      game.load.spritesheet(characterData.name, characterData.path, characterData.width, characterData.height, characterData.framesCount);
    },
    create: function() {
      game.world.setBounds(0, 0, BackgroundScale*game.width, game.height);
      game.physics.startSystem(Phaser.Physics.ARCADE);
      bg1 = game.add.tileSprite(0, 0, game.width, 128, 'bg');
      bg1.scale.setTo(BackgroundScale, 1);
      bg1.tileScale.x = 1/BackgroundScale;
      bg2 = game.add.tileSprite(0, 128, game.width, 896, 'bg2');
      bg2.scale.setTo(BackgroundScale, 1);
      bg2.tileScale.x = 1/BackgroundScale;

      fireballs = game.add.group();  // add a new group for fireballs
      fireballs.createMultiple(500, 'firen_ball', 0, false);

      playerObj = createPlayer(500, MAX_BASELINE);

      cursors = game.input.keyboard.createCursorKeys();
      game.camera.follow(playerObj.spr);

      var keyUp = game.input.keyboard.addKey(Phaser.Keyboard.NUMPAD_8);
      keyUp.onDown.add(() => {playerObj.vMotionState = VMotionState.UP;if(appendInput('u'))playerObj.moveUp();}, this)
      keyUp.onUp.add(() => {playerObj.vMotionState = VMotionState.NONE}, this);
      var keyDown = game.input.keyboard.addKey(Phaser.Keyboard.NUMPAD_2)
      keyDown.onDown.add(() => {playerObj.vMotionState = VMotionState.DOWN;if(appendInput('b'))playerObj.moveDown();}, this);
      keyDown.onUp.add(() => {playerObj.vMotionState = VMotionState.NONE}, this);
      var keyLeft = game.input.keyboard.addKey(Phaser.Keyboard.NUMPAD_4)
      keyLeft.onDown.add(() => {playerObj.hMotionState = HMotionState.LEFT;if(appendInput('l'))playerObj.moveLeft();}, this);
      keyLeft.onUp.add(() => {playerObj.hMotionState = HMotionState.NONE}, this);
      var keyRight = game.input.keyboard.addKey(Phaser.Keyboard.NUMPAD_6)
      keyRight.onDown.add(() => {playerObj.hMotionState = HMotionState.RIGHT;if(appendInput('r'))playerObj.moveRight();}, this);
      keyRight.onUp.add(() => {playerObj.hMotionState = HMotionState.NONE}, this);
      game.input.keyboard.addKey(Phaser.Keyboard.NUMPAD_5)
      .onDown.add(() => {console.log('atk');appendInput('a');}, this);
      game.input.keyboard.addKey(Phaser.Keyboard.NUMPAD_0)
      .onDown.add(() => {playerObj.jump();appendInput('j');}, this);
      game.input.keyboard.addKey(Phaser.Keyboard.NUMPAD_ADD)
      .onDown.add(() => {console.log('def');appendInput('d');}, this);
    },
    update: function() {
      playerObj.update();
      if(game.time.now > inputTimeout) {
        currentInput = [];
      }
    },
    render: function() {
    }
  }
}());