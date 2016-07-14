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

GameManager.prototype.init = function() {
  this.gameObjectsManager.init();
  this.characterManager.init();
}


GameManager.prototype.loadAllPlayers = function(playerDataArray) {
  for(var i in playerDataArray) {
    var playerData = playerDataArray[i];
    this.addPlayer(playerData);
  }
}

GameManager.prototype.loadAllMapItems = function(mapData) {
  var mapItems = mapData.mapItems;
  mapSize = mapData.mapSize;
  for(var i in mapItems) {
    this.addMapItem(mapItems[i]);
  }
}

GameManager.prototype.getGameObjectById = function(id) {
  return this.gameObjectsManager.getById(id);
};

GameManager.prototype.addPlayer = function(data) {
  var character = this.aoFactory.createCharacter(this, data);
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
  this.characterManager.update();
};

const offsetCol = {x: 32, z: 0};
const offsetRow = {x: 0, z: 16};
GameManager.prototype.coordToGamePos = function(coord) {
  return new Vector(coord.x*64, coord.z*64 - coord.y*16);
};

GameManager.prototype.getPlayer = function() {
  return this.characterManager.getById(this.playerId);
};

GameManager.prototype.getPlayerById = function(id) {
  return this.characterManager.getById(id);
};

GameManager.prototype.setPlayer = function(playerId) {
  this.playerId = playerId;
};

GameManager.prototype.updatePlayer = function(playerData) {
  var player = this.getPlayerById(playerData.id);
  if(player) {
    player.updateData(playerData);
  }
};