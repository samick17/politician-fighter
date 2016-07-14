module.exports = {
  microSpeedUp: {
    name: 'micro speedUp',
    description: 'micro speed up...',
    extraSpd: 2,
    spriteSheetName: 'fast',
    lifeTime: 20
  },
  speedUp: {
    name: 'speedUp',
    description: 'Speed up...',
    extraSpd: 4,
    spriteSheetName: 'fast'
  },
  poisoned: {
    name: 'poisoned',
    description: 'as name says',
    spriteSheetName: 'poisoned',
    effect: {
      effectTime: 0.4,//do effect per effectTime
      costHp: 1
    },
    lifeTime: 1.8
  },
  slow: {
    name: 'slow',
    description: 'as name says',
    extraSpdRate: -50,
    spriteSheetName: 'slow',
    lifeTime: 3
  },
  freeze: {
    name: 'freeze',
    description: 'as name says',
    spriteSheetName: 'poisoned',
    moveSpdFreeze: true,
    lifeTime: 1
  },
  protection: {
    name: 'protection',
    description: 'extraDmgResistRage+100% until no money',
    extraDmgResistRate: 100,
    spriteSheetName: 'slow',
    effectSpriteSheetName: 'protection',
    moveSpdFreeze: true,
    effect: {
      effectTime: 2,//do effect per effectTime
      costCoin: 10
    },
  },
};