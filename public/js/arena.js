var Arena = function(game) {};

(function() {

  const BaseLineHeight = 32;

  var character1;
  

  function createCharacter(resName) {
    var characterGroup = game.add.group();
    var characterSpr = game.add.sprite(0, 0, resName);
    const scale = 2;
    const offsetXScale = 0.2*scale;
    const widthScale = 0.6*scale;
    characterGroup.scale.setTo(scale, scale);
    characterGroup.add(characterSpr);
    game.physics.enable(characterSpr, Phaser.Physics.ARCADE);
    characterSpr.pivot.x = characterSpr.width/2;
    characterSpr.pivot.y = characterSpr.height/2;
    characterSpr.body.setSize(characterSpr.width*widthScale, characterSpr.height*scale, characterSpr.width*offsetXScale, 0);
    function Character(spr) {
      this.life = 50;
      this.maxLife = 50;
      this.spr = spr;
      this.walkVelocity = 5;
      this.velocity = this.walkVelocity;
      this.runVelocity = 9;
      this.baseLine = 0;
    };
    Character.prototype.setPos = function(x, y) {
      this.spr.x = x;
      this.spr.y = y;
      return this;
    };
    Character.prototype.getLifeRate = function() {
      return this.life/this.maxLife;
    };
    Character.prototype.applyDamage = function(dmg) {
      this.life = MathUtils.clamp(this.life+dmg, 0, this.maxLife);
      return this;
    };
    Character.prototype.getSprBody = function() {
      return characterSpr;
    };
    Character.prototype.turnLeft = function() {
      characterSpr.scale.setTo(-1, 1);
      characterSpr.body.setSize(characterSpr.width*widthScale, characterSpr.height*scale, characterSpr.width*offsetXScale, 0);
    };
    Character.prototype.turnRight = function() {
      characterSpr.scale.setTo(1, 1);
      characterSpr.body.setSize(characterSpr.width*widthScale, characterSpr.height*scale, characterSpr.width*offsetXScale, 0);
    };
    Character.prototype.moveLeft = function() {
      this.turnLeft();
      this.spr.x -= this.velocity;
    };
    Character.prototype.moveRight = function() {
      this.turnRight();
      this.spr.x += this.velocity;
    };
    Character.prototype.jump = function() {
      if(this.isJump)
        return;
      this.turnRight();
      characterSpr.body.velocity.setTo(characterSpr.body.velocity.x, -180);
      this.isJump = true;
    };
    Character.prototype.update = function() {
      if(this.isJump) {
        //ground
        if(characterSpr.y > this.baseLine*BaseLineHeight) {
          this.grounded();
        }
      }
      else {
        if(characterSpr.y > this.baseLine*BaseLineHeight) {
          characterSpr.y = this.baseLine*BaseLineHeight
        }
      }
    },
    Character.prototype.grounded = function() {
      if(!this.isJump)
        return;
      this.applyGravity(0);
      characterSpr.body.velocity.setTo(characterSpr.body.velocity.x, 0);
      characterSpr.y = this.baseLine*BaseLineHeight;
      this.isJump = false;
    },
    Character.prototype.runMode = function() {
      this.velocity = this.runVelocity;
    };
    Character.prototype.walkMode = function() {
      this.velocity = this.walkVelocity;
    };//getBody
    Character.prototype.applyGravity = function(gravity) {
      characterSpr.body.gravity.set(0, gravity);
    };
    return new Character(characterGroup);
  }

  function createLifeBar() {
    var lifeBarGroup = game.add.group();
    var lifeBar = game.add.image(0, 0, 'life-bar');
    var lifeBarContent = game.add.image(6, 2, 'life-bar-content');
    lifeBarGroup.scale.setTo(0.65,0.65);
    lifeBarGroup.add(lifeBar);
    lifeBarGroup.add(lifeBarContent);
    var lifeBarWidth = lifeBarContent.width;
    return {
      getSpr: function() {
        return  lifeBarGroup;
      },
      setPos: function(x, y) {
        lifeBarGroup.x = x;
        lifeBarGroup.y = y;
        return this;
      },
      setRate: function(rate) {
        lifeBarContent.width = lifeBarWidth*rate;
        return this;
      },
      getHeight: function() {
        return lifeBarGroup.height
      },
      update: function() {
        this.setRate(this.target.getLifeRate());
        //this.setPos(-this.target.spr.width/2, -this.target.spr.height/2-this.getHeight());
      }
    };
  }

  Arena.prototype = {
    preload: function() {
      game.load.image('bg', 'media/arena/grass/grass-1.png');
      game.load.image('bg2', 'media/arena/grass/grass-2.png');
      game.load.image('life-bar', 'media/arena/life-bar.png');
      game.load.image('life-bar-content', 'media/arena/life-bar-content.png');
      game.load.spritesheet('firzen', 'media/arena/firzen_1.bmp', 80, 80, 70);
    },
    create: function() {
      game.physics.startSystem(Phaser.Physics.ARCADE);
      bg1 = game.add.tileSprite(0, 0, 5333, 1396, 'bg');
      bg1.scale.setTo(2, 0.2);
      bg1.tileScale.x = 0.2;
      bg2 = game.add.tileSprite(0, 0, 5333, 1588, 'bg2');
      bg2.scale.setTo(2, 0.2);
      bg2.y = 279;
      bg2.tileScale.x = 0.2;
      character1 = createCharacter('firzen').setPos(100, game.height-500);
      game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR).onDown.add(()=>{
        character1.jump();
        character1.applyGravity(480);
      }, this, 0);
    },
    update: function() {
      if (game.input.keyboard.isDown(Phaser.Keyboard.LEFT))
      {
        character1.moveLeft();
      }
      else if (game.input.keyboard.isDown(Phaser.Keyboard.RIGHT))
      {
        character1.moveRight();
      }
      character1.update();
    },
    render: function() {
    }
  }
}());