var inherits = require('util').inherits;
var BaseItem = require('./base-item');
var Physics = require('./physics');
var Vector = require('./vector');
var CharacterEvent = require('../event-types/character-event');
var ObjectManager = require('./object-manager');
var Utils = require('./utils');

function GameItem(data) {
  BaseItem.call(this, data);
  this.collider = new Physics.BoxCollider(this, this.size, this.size);
  this.buffManager = new ObjectManager(4);
  this.lastAttackerName = '';
}
inherits(GameItem, BaseItem);

GameItem.prototype.applyDamage = function(damage) {
  if(damage && damage != 0) {
    this.hp = Utils.clamp(this.hp - damage, 0, this.maxHp);
    if(this.hp == 0) {
      this.emit(CharacterEvent.die, this);
    }
    else {
      this.emit(CharacterEvent.updateHp, {id: this.id, hp: this.hp, maxHp: this.maxHp});
    }
  }
};

GameItem.prototype.getOwnerName = function() {
  return this.name;
};

GameItem.prototype.calculateDamage = function(gameItem) {
  return parseInt(this.armor.calculateDamage(gameItem.atk) * (this.isAllies(gameItem) ? .6 : 1));
};

GameItem.prototype.applyDamageByGameItem = function(gameItem) {
  this.lastAttackerName = gameItem.getOwnerName();
  this.applyDamage(this.calculateDamage(gameItem));
};

GameItem.prototype.isAllies = function(obj) {
  return this.party && this.party == obj.party;
};
//event: destroy from scene
GameItem.prototype.destroy = function() {
  this.emit(CharacterEvent.destroy, this);
};

/*buff*/
GameItem.prototype.addBuff = function(buff) {
  var character = this;
  if(!character.buffManager.contains({name: buff.name}) && character.buffManager.add(buff)) {
    buff.apply(this);
    buff.on(CharacterEvent.remove, function() {
      character.buffManager.remove(buff);
      character.emit(CharacterEvent.removeBuff, buff);
    });
    character.emit(CharacterEvent.addBuff, buff);
  }
};

GameItem.prototype.addBuffByName = function(buffName) {
  var character = this;
  var modelFactory = this.gameMgr.modelFactory;
  var buff = modelFactory.createBaseBuff(buffName);
  this.addBuff(buff);
};

GameItem.prototype.removeBuff = function(buff) {
  if(this.buffManager.containsKey(buff.id)) {
    buff.destroy();
  }
};
/*clear all buff*/
GameItem.prototype.clearBuff = function() {
  this.buffManager.each(function(buff) {
    buff.destroy();
  });
}

GameItem.prototype.toJson = function() {
  var jsonModel = BaseItem.prototype.toJson.call(this);
  jsonModel.coord = this.coord;
  if(this.hasOwnProperty('hp')) jsonModel.hp = this.hp;
  if(this.hasOwnProperty('maxHp')) jsonModel.maxHp = this.maxHp;
  if(this.hasOwnProperty('armor')) jsonModel.armor = this.armor.toJson();
  if(this.hasOwnProperty('audios')) jsonModel.audios = this.audios;
  return jsonModel;
};

module.exports = GameItem;