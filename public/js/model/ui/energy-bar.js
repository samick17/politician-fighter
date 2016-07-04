function EnergyBar(character, quota) {
  BaseUI.call(this, 8, 48);
  this.energyRate = 1;
  this.quota = quota || 1;
  this.maxQuota = quota || 1;
  this.target = character;
  this.spr.position.set(24,-72);
  this.target.spr.addChild(this.spr);
};
Utils.inheritPrototype(EnergyBar, BaseUI);

EnergyBar.prototype.redraw = function() {
  const border = 2;
  const halfBorder = border * .5;
  const borderColor = 0x000000;
  const bgColor = 0xff0000;
  const defaultBorderColor = 0x000000;
  const energyColor = 0x00ffff;
  this.g.lineStyle(border, borderColor);
  this.g.beginFill(bgColor, 1);
  this.g.drawRect(0, 0, this.width, this.height);
  this.g.lineStyle(0, defaultBorderColor);
  this.g.beginFill(energyColor, 1);
  this.g.drawRect(halfBorder, this.height*(1-this.energyRate)+halfBorder, this.width-border, this.energyRate > 0 ? this.height*this.energyRate - border : 0);
};

EnergyBar.prototype.doAttach = function(obj) {
  var energyBar = this;
  obj.on(CharacterEvent.normalState, function() {
    energyBar.spr.destroy();
  });
  obj.on(CharacterEvent.updateEnergy, function(val) {
    energyBar.setQuota(val);
  });
};

EnergyBar.prototype.setQuota = function(quota) {
  this.quota = quota;
  this.energyRate = Utils.clamp(this.quota / this.maxQuota, 0, 1);
  this.redraw();
};

EnergyBar.prototype.setMaxQuota = function(maxQuota) {
  this.maxQuota = maxQuota;
  this.energyRate = Utils.clamp(this.quota / this.maxQuota, 0, 1);
  this.redraw();
};