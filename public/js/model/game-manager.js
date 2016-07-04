function GameManager(aoFactory) {
  this.aoFactory = aoFactory;
  this.aoFactory.gameMgr = this;
  this.gameObjectsManager = aoFactory.createObjectManager();
  this.projectileObjectsManager = aoFactory.createObjectManager();
  this.characterManager = aoFactory.createObjectManager();
  this.partyManager = aoFactory.createObjectManager();
}

//inner
GameManager.prototype.addGameObject = function(gameObject) {
  this.gameObjectsManager.add(gameObject);
  return gameObject;
};

//inner
GameManager.prototype.removeGameObject = function(id) {
  var go = this.gameObjectsManager.removeById(id);
  if(go) {
    go.destroy();
  }
};

GameManager.prototype.getGameObjectById = function(id) {
  return this.gameObjectsManager.getById(id);
};

GameManager.prototype.addPlayer = function(resName) {
  var character = this.aoFactory.createCharacter(this, 500, ArenaSettings.MAX_BASELINE, resName);
  this.characterManager.add(character);
  return character;
};

GameManager.prototype.removePlayer = function(id) {
  var character = this.characterManager.removeById(id);
  if(character) {
    character.destroy();
  }
};

GameManager.prototype.addMapItem = function(mapItem) {
  if('box' in mapItem) {
    return this.addGameObject(this.aoFactory.createWoodenBox(mapItem['box']));
  }
  else if('weapon' in mapItem) {
    return this.addGameObject(this.aoFactory.createWeaponProp(mapItem['weapon']));
  }
};

GameManager.prototype.removeMapItem = function(id) {
  this.removeGameObject(id);
};

GameManager.prototype.addSkillGameObject = function(coord, skillName) {
  var bullet = this.aoFactory.createBullet(coord, skillName);
  this.projectileObjectsManager.add(bullet);
  return bullet;
};

/*GameManager.prototype.addProjectileItem = function(projectileItem) {
  if('bullet' in projectileItem) {
    var bullet = this.aoFactory.createBullet(projectileItem['bullet']);
    this.projectileObjectsManager.add(bullet);
    return bullet;
  }
};*/

GameManager.prototype.removeProjectileItem = function(id) {
  var go = this.projectileObjectsManager.removeById(id);
  if(go) {
    go.destroy();
  }
};

GameManager.prototype.getProjectileItemById = function(id) {
  return this.projectileObjectsManager.getById(id);
};

GameManager.prototype.update = function() {
  //this.characterManager.update();
  //this.projectileObjectsManager.update();/*var gameMgr = this;
  var tmpGos = this.gameObjectsManager.objs;
  var tmpBullets = this.projectileObjectsManager.objs;
  for(var i in tmpGos) {
    //console.log(i)
    for(var j in tmpBullets) {
      var go = tmpGos[i];
      var bullet = tmpBullets[j];
      if(bullet.isAlive) {
        game.physics.arcade.overlap(go.spr, bullet.spr, ()=>{
          go.onCollided(bullet);
          bullet.onCollided(go);
          //go.shake(direction);
          //bullet.blowup();
        }, null, this);
      }
      //game.physics.arcade.overlap(character.spr, bullet.spr, ()=> {}, null, this);
    }
  }
};

const offsetCol = {x: 32, z: 0};
const offsetRow = {x: 0, z: 16};
GameManager.prototype.coordToGamePos = function(coord) {
  return new Vector(coord.x*32, coord.y*8, coord.z*16);
};