var utils = require('./utils');

const ArmorType = {
  IMMORTAL: {value: 1, name: 'Immortal', code: 'imt'},
  NORMAL: {value: 2, name: 'Normal', code: 'nml'},
};

function Armor(aType, value, dmgResist, dmgResistRate) {
  this.aType = aType;
  this.value = value || 0;
  this.dmgResist = dmgResist || 0;
  this.dmgResistRate = dmgResistRate || 0;
}

Armor.prototype.calculateDamage = function(value) {
  switch(this.aType.value) {
    case ArmorType.IMMORTAL.value:
    return 0;
    case ArmorType.NORMAL.value:
    var resistRate = this.toResistRate();
    var totalResistRate = utils.clamp(resistRate + this.dmgResistRate, 0, 100);
    var damage = (100 - totalResistRate)*value/100 - this.dmgResist;
    if(damage < 0)
      damage = 0
    return damage;
  }
  return value;
};

Armor.prototype.adjust = function(value) {
  this.value += value;
};

Armor.prototype.adjustResistValue = function(value) {
  this.dmgResist += value;
};

Armor.prototype.adjustResistRate = function(value) {
  this.dmgResistRate += value;
};

//in percent
Armor.prototype.toResistRate = function() {
  var rate = Math.sqrt(this.value*10);
  return utils.clamp(rate, 0, 100);
};

Armor.prototype.toJson = function() {
  return {
    type: this.aType,
    value: this.value
  };
};

module.exports = {
  ArmorType: ArmorType,
  Armor: Armor
};

/**/
/*var a = new Armor(ArmorType.NORMAL, 47, 3, 30);
//console.log(a.toResistRate());
console.log(a.calculateDamage(15));
console.log(a.calculateDamage(107));*/
/*
  resistRate in 0-100 %
  (100-(resistRate + extraDmgResistRate))*dmg/100 - extraDmgResistValue
  (100-(resistRate + extraDmgResistRate))*(dmg - extraDmgResistValue)/100
*/