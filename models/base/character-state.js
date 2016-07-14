var inherits = require('util').inherits;
var Armor = require('./armor');
var CharacterEvent = require('../event-types/character-event');
//var CharacterList = require('../character-data/character-list');

function CharacterState(character) {
  this.character = character;
  this.name = 'normal';
}

CharacterState.prototype.requestAttack = function() {
  this.character.attack();
};

CharacterState.prototype.build = function(gameMgr, pos) {
  return gameMgr.addBrick(pos, Armor.ArmorType.NORMAL.code);
};

CharacterState.prototype.switchState = function() {
  this.character.switchToSpecialState();
};

CharacterState.prototype.toJson = function() {
  return {
    name: this.name
  };
};

function SpecialState(character) {
  CharacterState.call(this, character);
  this.name = 'special';
}
inherits(SpecialState, CharacterState);

SpecialState.prototype.requestAttack = function() {
  this.character.specialAttack();
};

SpecialState.prototype.build = function(gameMgr, pos) {
  return gameMgr.addTower(pos, Armor.ArmorType.NORMAL.code);
};

SpecialState.prototype.switchState = function() {
  this.character.switchToNormalState();
};

function BankaiState(character) {
  CharacterState.call(this, character);
  this.name = 'bankai';
  this.quota = character.maxBankaiQuota;
}
inherits(BankaiState, CharacterState);

BankaiState.prototype.switchToOriginState = function() {
  this.character.switchToNormalState();
};

BankaiState.prototype.requestAttack = function() {
  if(this.quota > 0 && this.character.bankaiAttack()) {
    this.quota--;
    this.character.emit(CharacterEvent.updateEnergy, this.quota);
    if(this.quota == 0) {
      this.switchToOriginState();
    }
  }
};

BankaiState.prototype.switchState = function() {
};

BankaiState.prototype.toJson = function() {
  var jsonModel = CharacterState.prototype.toJson.call(this);
  jsonModel.quota = this.quota;
  return jsonModel;
};

module.exports = {
  CharacterState: CharacterState,
  SpecialState: SpecialState,
  BankaiState: BankaiState
};