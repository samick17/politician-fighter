var inherits = require('util').inherits;
var BaseCharacter = require('./base-character');
var EquipmentSlot = require('../equipments/equipment-slot');
var ObjectManager = require('./object-manager');
var CharacterEvent = require('../event-types/character-event');
var State = require('./character-state');

function GameCharacter(data) {
  BaseCharacter.call(this, data);
  var character = this;
  character.equipmentSlots = {};
  character.score = 0;
  character.inventory = new ObjectManager(5);
  character.state = new State.CharacterState(character);
  character.calculateScore();
  character.on(CharacterEvent.updateCoinAmount, function() {
    character.calculateScore();
  });
  character.on(CharacterEvent.obtainItem, function() {
    character.calculateScore();
  });
  character.on(CharacterEvent.releaseItem, function() {
    character.calculateScore();
  });
}
inherits(GameCharacter, BaseCharacter);

GameCharacter.prototype.requestAttack = function(params) {
  //emit attack event, apply different attack effect from weapon to weapon
  this.state.requestAttack();
};

GameCharacter.prototype.toJson = function() {
  var jsonModel = BaseCharacter.prototype.toJson.call(this);
  jsonModel.spriteSheetName = this.spriteSheetName;
  jsonModel.atk = this.atk;
  jsonModel.atkSpd = this.atkSpd;
  jsonModel.def = this.armor.value;
  jsonModel.moveSpd = this.moveSpd;
  jsonModel.runSpd = this.runSpd;
  jsonModel.moveTime = this.getMoveTime();
  jsonModel.isMoving = this.isMoving;
  jsonModel.coinAmount = this.coinAmount;
  jsonModel.rankingIndex = this.rankingIndex;
  if(this.party) jsonModel.partyColor = this.party.name;
  if(this.anims) jsonModel.anims = this.anims;
  for(var key in this.equipmentSlots) {
    var equipment = this.equipmentSlots[key];
    jsonModel[key] = equipment.toJson();
  }
  return jsonModel;
};

GameCharacter.prototype.getWeapon = function() {
  return this.equipmentSlots[EquipmentSlot.EquipmentSlot.Hand];
};

GameCharacter.prototype.equip = function(slotKey, equipment) {
  if(EquipmentSlot.containsKey(slotKey) && equipment) {
    this.unequip(slotKey);
    this.equipmentSlots[slotKey] = equipment;
    equipment.apply(this);
    this.emit(CharacterEvent.equipWeapon);
  }
};

GameCharacter.prototype.unequip = function(slotKey) {
  var equipment = this.equipmentSlots[slotKey];
  if(EquipmentSlot.containsKey(slotKey) && equipment) {
    equipment.unapply(this);
    delete this.equipmentSlots[slotKey];
  }
};

GameCharacter.prototype.useItemById = function(itemId) {
  if(this.inventory.containsKey(itemId)) {
    var item = this.inventory.get(itemId);
    if(item.use(this)) {
      this.inventory.remove(item);
      this.emit(CharacterEvent.releaseItem, item);  
    }
  };
};

GameCharacter.prototype.canObtainItem = function(item) {
  return !this.inventory.isFull();
};

GameCharacter.prototype.obtainItem = function(item) {
  if(!this.inventory.isFull()) {
    item.owner = this;
    this.inventory.add(item);
    this.emit(CharacterEvent.obtainItem, item);
  }
};

GameCharacter.prototype.switchToSpecialState = function() {
  if(this.spendMoney(this.switchModeCost)) {
    this.state = new State.SpecialState(this);
    this.emit(CharacterEvent.changeState, this.state);
  }
};

GameCharacter.prototype.switchToNormalState = function() {
  this.state = new State.CharacterState(this);
  this.emit(CharacterEvent.changeState, this.state);
};

GameCharacter.prototype.bankai = function() {
  this.switchToNormalState();
  this.state = new State.BankaiState(this);
  this.emit(CharacterEvent.changeState, this.state);
};

GameCharacter.prototype.switchState = function() {
  this.state.switchState();
};

GameCharacter.prototype.calculateScore = function() {
  var character = this;
  character.score = character.coinAmount;
  character.inventory.each(function(invItem) {
    character.score += invItem.getPrice();
  });
  character.emit(CharacterEvent.updateScore, character.score);
};

GameCharacter.prototype.updateRank = function(rankingIndex) {
  this.rankingIndex = rankingIndex;
  this.emit(CharacterEvent.updateRank, this.rankingIndex);
};

GameCharacter.prototype.doAttack = function() {
};
GameCharacter.prototype.bankaiAttack = function() {
};

module.exports = GameCharacter;