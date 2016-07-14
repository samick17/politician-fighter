var inherits = require('util').inherits;
var Weapon = require('./weapon');
var CharacterEvent = require('../event-types/character-event');

function Sword(data) {
  Weapon.call(this, data);
}
inherits(Sword, Weapon);

module.exports = Sword;