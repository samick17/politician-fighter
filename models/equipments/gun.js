var inherits = require('util').inherits;
var Weapon = require('./weapon');
var Utils = require('../base/utils');
var CharacterEvent = require('../event-types/character-event');

function Gun(data) {
  Weapon.call(this, data);
  this.bullets = [];
}
inherits(Gun, Weapon);

Gun.prototype.canFire = function() {
  return this.bullets.length < this.maxBullet;
};

module.exports = Gun;