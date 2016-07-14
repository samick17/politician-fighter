module.exports = {
  baseSword: {
    name: 'baseSword',
    type: 'sword',
    spriteSheetName: 'sword',
    bankaiSpriteSheetName: 'sword-bankai',
    effectSpriteSheetName: 'swipe-effect',
    baseAttackCost: 1,
    bankaiAttackCost: 5,
    extraAtk: 7,
    extraDef: 5,
    extraHp: 2,
    extraSpd: 1.8
  },
  baseShield: {
    name: 'baseShield',
    type: 'shield',
    spriteSheetName: 'shield',
    baseAttackCost: 0,
    bankaiAttackCost: 0,
    extraAtk: 1,
    extraDef: 40,
    extraHp: 25,
    extraSpd: 0.5,
    extraDmgResist: 3,
    extraDmgResistRate: 30
  },
  baseGun: {
    name: 'baseGun',
    type: 'gun',
    spriteSheetName: 'gun',
    bankaiSpriteSheetName: 'gun-bankai',
    baseAttackCost: 1,
    //bankaiAttackCost: 1,
    bankaiAttackCost: 15,
    maxBullet: 7,
    extraAtk: 4,
    extraDef: 1,
    extraHp: 4,
    extraSpd: 1.3
  },
  baseHammer: {
    name: 'baseHammer',
    type: 'hammer',
    spriteSheetName: 'hammer',
    bankaiSpriteSheetName: 'hammer-bankai',
    baseAttackCost: 2,
    bankaiAttackCost: 8,
    extraAtk: 0,
    extraDef: 3,
    extraHp: 8,
    extraSpd: 1.5,
    extraBuildQuota: 10
  },
  //TODO assign value
  baseBook: {
    name: 'baseBook',
    type: 'book',
    spriteSheetName: 'book',
    bankaiSpriteSheetName: 'book-bankai',
    baseAttackCost: 4,
    bankaiAttackCost: 10,
    extraAtk: 4,
    extraDef: 2,
    extraHp: 8,
    extraSpd: 1.2
  }
};