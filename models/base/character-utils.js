module.exports = {
  //hp: extraHp
  applyExtraHp: function(equipment, character) {
    if(equipment.extraHp) {
      var hpRate = character.hp/character.maxHp;
      character.maxHp += equipment.extraHp;
      character.hp = Math.round(character.maxHp * hpRate);
    }
  },
  unapplyExtraHp: function(equipment, character) {
    if(equipment.extraHp) {
      var hpRate = character.hp/character.maxHp;
      character.maxHp -= equipment.extraHp;
      character.hp = Math.round(character.maxHp * hpRate);
    }
  },
  //atk: extraAtk
  applyExtraAtk: function(equipment, character) {
    if(equipment.extraAtk) {
      character.atk += equipment.extraAtk;
    }
  },
  unapplyExtraAtk: function(equipment, character) {
    if(equipment.extraAtk) {
      character.atk -= equipment.extraAtk;
    }
  },
  //def: extraDef
  applyExtraDef: function(equipment, character) {
    if(equipment.extraDef) {
      character.armor.adjust(equipment.extraDef);
    }
  },
  unapplyExtraDef: function(equipment, character) {
    if(equipment.extraDef) {
      character.armor.adjust(-equipment.extraDef);
    }
  },
  //dmgResist: extraDmgResist
  applyExtraDmgResist: function(equipment, character) {
    if(equipment.extraDmgResist) {
      character.armor.adjustResistValue(equipment.extraDmgResist);
    }
  },
  unapplyExtraDmgResist: function(equipment, character) {
    if(equipment.extraDmgResist) {
      character.armor.adjustResistValue(-equipment.extraDmgResist);
    }
  },
  //dmgResistRate: extraDmgResistRate
  applyExtraDmgResistRate: function(equipment, character) {
    if(equipment.extraDmgResistRate) {
      character.armor.adjustResistRate(equipment.extraDmgResistRate);
    }
  },
  unapplyExtraDmgResistRate: function(equipment, character) {
    if(equipment.extraDmgResistRate) {
      character.armor.adjustResistRate(-equipment.extraDmgResistRate);
    }
  },
  //move spd: extraSpd
  applyExtraSpd: function(equipment, character) {
    if(equipment.extraSpd) {
      character.moveSpd += equipment.extraSpd;
    }
  },
  unapplyExtraSpd: function(equipment, character) {
    if(equipment.extraSpd) {
      character.moveSpd -= equipment.extraSpd;
    }
  },
  //move spd: extraSpdRate
  applyExtraSpdRate: function(equipment, character) {
    if(equipment.extraSpdRate) {
      character.moveSpd *= (100+equipment.extraSpdRate)/100;
    }
  },
  unapplyExtraSpdRate: function(equipment, character) {
    if(equipment.extraSpdRate) {
      character.moveSpd /= (100+equipment.extraSpdRate)/100;
    }
  },
  //move spd: moveSpdFreeze
  applyFreeze: function(equipment, character) {
    if(equipment.moveSpdFreeze) {
      character.movementFreezed = true;
    }
  },
  unapplyFreeze: function(equipment, character) {
    if(equipment.moveSpdFreeze) {
      delete character.movementFreezed;
    }
  },
  //build quota: extraBuildQuota
  applyExtraBuildQuota: function(equipment, character) {
    if(equipment.extraBuildQuota) {
      character.maxBuildQuota += equipment.extraBuildQuota;
    }
  },
  unapplyExtraBuildQuota: function(equipment, character) {
    if(equipment.extraBuildQuota) {
      character.maxBuildQuota -= equipment.extraBuildQuota;
    }
  }
}