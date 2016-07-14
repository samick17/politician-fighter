const requireDir = require('require-dir');
const CoinBag = require('./props/coin-bag');
const CharacterList = requireDir('./character');
const characterKeys = Object.keys(CharacterList);
const GameConfig = require('../bin/config').game;
const EquipmentSlot = require('./equipments/equipment-slot').EquipmentSlot;
const Armor = require('./base/armor');
const Utils = require('./base/utils');
const Player = require('./player');
const WeaponType = require('./equipments/weapon-type');
const Weapon = require('./equipments/weapon');
const Sword = require('./equipments/sword');
const Hammer = require('./equipments/hammer');
const Gun = require('./equipments/gun');
const PropsData = require('./game-data/props-data');
const WoodenBox = require('./props/wooden-box');

function createArmorByName(armorCode, value, dmgResist, dmgResistRate) {
  switch(armorCode) {
    case Armor.ArmorType.IMMORTAL.code.toLowerCase():
    return new Armor.Armor(Armor.ArmorType.IMMORTAL, value, dmgResist, dmgResistRate);
    case Armor.ArmorType.NORMAL.code.toLowerCase():
    return new Armor.Armor(Armor.ArmorType.NORMAL, value, dmgResist, dmgResistRate);
  }
  throw new Error('invalid armor code');
}

function createCoinBag(pos, amount) {
  var coinBagData = PropsData['coinBag'];
  var data = {
    id: Utils.genId(),
    spriteSheetName: coinBagData.spriteSheetName,
    name: coinBagData.name,
    coord: new Vector(pos.x, pos.y),
    coinAmount: Utils.genValue(coinBagData.randomAmount) + coinBagData.baseAmount
  };
  return new CoinBag(data);
}

function createCharacterByParams(params) {
  const CharacterData = CharacterList[characterKeys[params.characterId]];
  var characterData = {
    id: params.id,
    name: params.name,
    spriteSheetName: CharacterData.spriteSheetName,
    coord: params.coord,
    characterId: params.characterId,
    hp: CharacterData.hp,
    maxHp: CharacterData.maxHp,
    atk: CharacterData.atk,
    atkSpd: CharacterData.atkSpd,
    moveSpd: CharacterData.moveSpd,
    runSpd: CharacterData.runSpd,
    maxBankaiQuota: CharacterData.maxBankaiQuota,
    switchModeCost: CharacterData.switchModeCost,
    armor: createArmorByName(Armor.ArmorType.NORMAL.code, CharacterData.def, CharacterData.dmgResist, CharacterData.dmgResistRate),
    buildQuota: 0,
    maxBuildQuota: GameConfig.BaseBuildQuota,
    coinAmount: CharacterData.coinAmount,
    anims: CharacterData.anims
  };
  return characterData;
}

function createWeapon(data) {
  switch(data.type) {
    case WeaponType.Sword:
    return new Sword(data);
    break;
    case WeaponType.Hammer:
    return new Hammer(data);
    break;
    case WeaponType.Gun:
    return new Gun(data);
    break;
  }
  return new Weapon(data);
}

function createCharacter(data) {
  return new CharacterList[characterKeys[data.characterId]].prototype(data);
}

function createDefaultWeaponByCharacterId(characterId) {
  if(characterId in CharacterList) {
    var weaponData = CharacterList[characterKeys[characterId]].weapon;
    weaponData.id = Utils.genId();
    return createWeapon(weaponData);
  }
}

function createPlayer(id, params, arena, client) {
  params.id = id;
  var character = createCharacter(createCharacterByParams(params));
  var player = new Player(character, arena, client);
  character.player = player;
  var character = player.character;
  character.equip(EquipmentSlot.Hand, createDefaultWeaponByCharacterId(params.characterId));
  return player;
}

function createWoodenBox(pos, armorTypeCode) {
  var boxData = {
    id: Utils.generateGUID(),
    spriteSheetName: 'box',
    coord: new Vector(25,0,15),
    hp: 20,
    maxHp: 20,
    armor: createArmorByName(armorTypeCode),
    audios: ['woodenboxHit1', 'woodenboxHit2']
  };
  return new WoodenBox(boxData);
}

module.exports = {
  createCoinBag: createCoinBag,
  createPlayer: createPlayer,
  createWoodenBox: createWoodenBox
};