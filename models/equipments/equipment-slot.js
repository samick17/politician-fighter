var equipmentSlots = {
  Hand: 'weapon',
  Head: 'hat',
  Body: 'body'
};

module.exports = {
  EquipmentSlot: equipmentSlots,
  containsKey: function(key) {
    for(var i in equipmentSlots) {
      var slotKey = equipmentSlots[i];
      if(slotKey == key)
        return true;
    }
    return false;return false;
  }
};
