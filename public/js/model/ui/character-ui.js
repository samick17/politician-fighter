function CharacterUI(charCtrl, scaling) {
  const padding = 4;
  const UIScaling = scaling;

  function Inventory() {
    this.emptySlots = [];
    this.itemSlots = {};
    this.itemIdSlotIdDict = {};
  }
  Inventory.prototype.init = function(uiGroup) {
    this.uiGroup = uiGroup;
  };
  Inventory.prototype.addSlot = function(slot) {
    this.uiGroup.add(slot.spr);
    if(slot.item) {
      this.itemSlots[slot.keytext] = slot;
    }
    else {
      this.emptySlots.push(slot);
    }
  };
  Inventory.prototype.addItem = function(item) {
    if(this.emptySlots.length > 0) {
      var slot = this.emptySlots[0];
      slot.addItem(item);
      this.emptySlots.splice(0, 1);
      this.itemSlots[slot.keytext] = slot;
      this.itemIdSlotIdDict[item.id] = slot.keytext;
    }
  };
  Inventory.prototype.removeItem = function(item) {
    //itemId: keyText
    var slotId = this.itemIdSlotIdDict[item.id];
    var slot = this.itemSlots[slotId];
    slot.removeItem(item);
    this.emptySlots.push(slot);
    delete this.itemSlots[slotId];
    delete this.itemIdSlotIdDict[item.id];
  };
  Inventory.prototype.bringToTop = function() {
    for(var slotKey in this.itemSlots) {
      var slot = this.itemSlots[slotKey];
      slot.bringToTop();
    }
  };

  function InventorySlot(index, keytext) {
    var slot = this;
    var slotGroup = game.add.group();
    var slotBackground = game.add.sprite(0, 0, 'iconslot');
    slotBackground.scale.set(UIScaling, UIScaling);
    slotBackground.x = 20+index*(2*padding+slotBackground.width);
    slotBackground.y = game.height-slotBackground.height-20;
    slotGroup.add(slotBackground);
    slot.keytext = keytext;
    slot.spr = slotGroup;
    slot.slotBackground = slotBackground;
    var style = { font: 'bold {0}px Microsoft Yahei'.format(28*UIScaling), fill: '#eee', boundsAlignH: 'right', boundsAlignV: 'top' };
    var skText = game.add.text(0, 0, keytext, style);
    skText.setTextBounds(slotBackground.x+2, slotBackground.y+2, slotBackground.width-8, slotBackground.height-4);
    slotGroup.add(skText);
    game.input.keyboard.addKey(keytext.charCodeAt(0))
    .onDown.add(function() {charCtrl.useInventoryItem(slot.getItemId())}, slot);
    slot.skText = skText;
  }
  InventorySlot.prototype.addItem = function(item) {
    this.item = item;
    this.item.spr = game.add.sprite(this.slotBackground.x, this.slotBackground.y, item.spriteSheetName);
    this.item.spr.scale.set(UIScaling, UIScaling);
    this.spr.addChild(this.item.spr);
    this.bringToTop();
  };
  InventorySlot.prototype.removeItem = function(item) {
    this.spr.removeChild(item.spr, true);
    this.item = undefined;
  };
  InventorySlot.prototype.getItemId = function() {
    return this.item ? this.item.id : undefined;
  };
  InventorySlot.prototype.bringToTop = function() {
    this.skText.bringToTop();
  };
  InventorySlot.prototype.onClick = function(callback) {
    var slot = this;
    var slotSpr = slot.spr.children[0];
    slotSpr.inputEnabled = true;
    slotSpr.events.onInputDown.add(function() {
      callback(slot);
    }, this);
  };

  function UIText(text, option) {
    var style = { font: 'bold 44px Microsoft Yahei', fill: '#ffa500', boundsAlignH: 'left', boundsAlignV: 'middle' };
    var text = game.add.text(0, 0, text, style);
    text.scale.set(UIScaling, UIScaling);
    this.spr = game.add.group();
    if(option && option.pos) {
      this.setPosition(option.pos);
    }
    this.spr.add(text);
    this.textSpr = text;
  }

  UIText.prototype.setPosition = function(pos) {
    this.spr.position.set(pos.x, pos.y);
  };

  UIText.prototype.setText = function(text) {
    this.textSpr.text = text;
  };

  UIText.prototype.bringToTop = function() {
    game.world.bringToTop(this.spr);
  }

  function UIManager(charCtrl) {
    this.uiGroup = game.add.group();
    this.uiGroup.fixedToCamera = true;
    this.charCtrl = charCtrl;
    this.ui = {};
  }
  UIManager.prototype.add = function(key, uiElement) {
    this.ui[key] = uiElement;
    this.uiGroup.add(uiElement.spr);
  };
  UIManager.prototype.addContainer = function(uiContainer) {
    uiContainer.init(this.uiGroup);
  };
  UIManager.prototype.get = function(key) {
    return this.ui[key];
  };
  UIManager.prototype.bringToTop = function() {
    for(var i in this.ui) {
      this.ui[i].bringToTop();
    }
  };

  var inventoryBindingKey = ['Q', 'W', 'E', 'R', 'T'];
  var inventory = new Inventory();

  var uiManager = new UIManager(charCtrl);
  uiManager.add(UIKeys.Property, new UIText('${0}'.format(charCtrl.character.coinAmount), {pos: {x: 20,y: game.height-10-130*UIScaling}}));
  uiManager.add(UIKeys.Rank, new UIText('{0}'.format(charCtrl.character.rankInfo), {pos: {x: 20,y: game.height-10-200*UIScaling}}));
  uiManager.addContainer(inventory);

  for(var i = 0; i < 5; i++) {
    var slot = new InventorySlot(i, inventoryBindingKey[i]);
    slot.onClick(function(st) {
      charCtrl.onClicked(st);
    });
    inventory.addSlot(slot);
  }
  charCtrl.character.on(CharacterEvent.updateRank, function(rankInfo) {
    uiManager.get(UIKeys.Rank).setText('{0}'.format(rankInfo));
  });
  Client.listen(ServerClientEvent.addMapItem, function(data) {
    uiManager.bringToTop();
  });

  var obtainCoinEffectTimer;

  function obtainCoinEffect(amount, delta, max) {
    function doEffect() {
      if(obtainCoinEffectTimer) {
        clearTimeout(obtainCoinEffectTimer);
        obtainCoinEffectTimer = undefined;
      }
      obtainCoinEffectTimer = setTimeout(function() {
        amount = Utils.clamp(amount+delta, 0, max);
        uiManager.get(UIKeys.Property).setText('${0}'.format(amount));
        if(amount != max)
          doEffect();
        else
          uiManager.get(UIKeys.Property).setText('${0}'.format(max));
      }, 60);
    }
    doEffect();
  }

  charCtrl.character.on(CharacterEvent.updateCoinAmount, function(data) {
    obtainCoinEffect(data.currentAmount, parseInt((data.coinAmount-data.currentAmount)/2), data.coinAmount);
  });
  charCtrl.character.on(CharacterEvent.obtainItem, function(item) {
    inventory.addItem(item);
    uiManager.bringToTop();
  });
  charCtrl.character.on(CharacterEvent.releaseItem, function(item) {
    inventory.removeItem(item);
  });

  return {
    addUIObject: function(key, uiObj) {
      uiManager.add(key, uiObj);
    },
    getChild: function(idx) {
      return uiManager.uiGroup.children[idx];
    }
  };
}