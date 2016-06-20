function GameManager(aoFactory) {
  this.aoFactory = aoFactory;
  this.characters = {};
  this.bullets = {};
}

GameManager.prototype.addPlayer = function(character) {
  this.characters[character.id] = character;
};

GameManager.prototype.removePlayer = function(character) {
  delete this.characters[character.id];
};

GameManager.prototype.punch = function(character) {
  var punchObj = this.aoFactory.createPunch(character);
  this.addBullet(punchObj);
}

GameManager.prototype.addBullet = function(bullet) {
  this.bullets[bullet.id] = bullet;
};

GameManager.prototype.removeBullet = function(bullet) {
  delete this.bullets[bullet.id];
};

GameManager.prototype.applyPunch = function(character, bullet) {
  console.log('character:'+character.id+' has been attack by bullet:'+bullet.id);
  character.applyDamage(bullet.damage);
  bullet.spr.destroy();
  this.removeBullet(bullet);
};

GameManager.prototype.update = function() {
  var gameMgr = this;
  var tmpCharacters = this.characters;
  var tmpBullets = this.bullets;
  for(var i in tmpCharacters) {
    for(var j in tmpBullets) {
      var character = tmpCharacters[i];
      var bullet = tmpBullets[j];
      game.physics.arcade.overlap(character.spr, bullet.spr, ()=> {gameMgr.applyPunch(character, bullet);}, null, this);
    }
  }
}