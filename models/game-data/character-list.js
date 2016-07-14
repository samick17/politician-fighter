var Hunter = require('../base/character/hunter');
var Blader = require('../base/character/blader');
var Architect = require('../base/character/architect');
var Wizard = require('../base/character/wizard');
var Weapons = require('./weapons');

module.exports =  {
  //Blader
  '0': {
    name: 'Wilder',
    spriteSheetName: 'character',
    hp: 25,
    maxHp: 25,
    atk: 2,
    atkSpd: 1.8,
    def: 7,
    moveSpd: 2.2,
    coinAmount: 120,
    picture: 'images/charintro1.png',
    weapon: Weapons.baseSword,
    maxBankaiQuota: 1,
    switchModeCost: 5,
    prototype: Blader
  },
  //Hunter
  '1': {
    name: 'Hunter',
    spriteSheetName: 'character',
    hp: 15,
    maxHp: 15,
    atk: 4,
    atkSpd: 1.2,
    //atkSpd: 9,
    def: 1,
    moveSpd: 2,
    coinAmount: 120,
    picture: 'images/charintro2.png',
    weapon: Weapons.baseGun,
    maxBankaiQuota: 1,
    switchModeCost: 5,
    prototype: Hunter
  },
  //Architect
  /*'2': {
    name: '3',
    spriteSheetName: 'character',
    hp: 30,
    maxHp: 30,
    atk: 0,
    atkSpd: 4.4,
    def: 4,
    moveSpd: 2.7,
    coinAmount: 70,
    picture: 'images/charintro3.png',
    weapon: Weapons.baseHammer,
    maxBankaiQuota: 1,
    prototype: Architect
  },*/
  //Wizard
  '3': {
    name: 'Wizard',
    spriteSheetName: 'character',
    hp: 12,
    maxHp: 12,
    atk: 3,
    atkSpd: 0.25,
    def: 4,
    moveSpd: 2.8,
    coinAmount: 120,
    picture: 'images/charintro4.png',
    weapon: Weapons.baseBook,
    maxBankaiQuota: 2,
    switchModeCost: 5,
    prototype: Wizard
  }
};