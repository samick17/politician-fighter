const GameCharacter = require('../base/game-character');
const Weapons = require('../game-data/weapons');

module.exports = {
  name: 'firen',
  spriteSheetName: 'firen',
  path: 'media/arena/firen.png',
  moveSpd: 1,
  runSpd: 4,
  width: 80,
  height: 80,
  framesCount: 140,
  walkVelocity: 2,
  runVelocity: 7,
  anims: [
    {name: 'idle', frames: [0,1,2,3,2,1], fps: 10, repeat: true},
    {name: 'walk', frames: [4,5,6,7,6,5], fps: 10, repeat: true},
    {name: 'run', frames: [20,21,22,21], fps: 10, repeat: true},
    {name: 'stretch', frames: [60,61], fps: 10, repeat: false},
    {name: 'stretchGrounded', frames: [60], fps: 10, repeat: false},
    {name: 'jump', frames: [62], fps: 10, repeat: false},
    {name: 'attack0', frames: [10,11], fps: 10, repeat: false},
    {name: 'attack1', frames: [12,13], fps: 10, repeat: false},
    {name: 'thresh', frames: [58,59,69], fps: 10, repeat: true},
    {name: 'defense', frames: [56], fps: 10, repeat: false},
    {name: 'lie', frames: [35,34], fps: 10, repeat: false},
    {name: 'recovery', frames: [34,35], fps: 10, repeat: false},
    {name: 'weaponAttack', frames: [70,72,73,72,70], fps: 10, repeat: false}
  ],
  prototype: GameCharacter,
  weapon: Weapons.baseSword
};