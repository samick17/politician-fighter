const LifeBarConfig = {
  OriginWidth: 96,
  LifeColor: {
    Health: {
      value: 0x00ff00,
      rate: .65
    },
    Normal: {
      value: 0xffa500,
      rate: .33
    },
    Danger: {
      value: 0xff0000,
      rate: 0
    }
  }
};

function LifeBar(value, maxValue) {
  BaseUI.call(this, 48, 8);
  this.value = value || 100;
  this.maxValue = maxValue || 100;
}
Utils.inheritPrototype(LifeBar, BaseUI);
LifeBar.prototype.doAttach = function(character) {
  var lb = this;
  var charSpr = character.spr;
  charSpr.addChild(lb.spr);
  lb.spr.position.set(-this.width*1.5, -charSpr.height*.6);
  lb.value = character.hp;
  lb.maxValue = character.maxHp;
  character.on(CharacterEvent.hurt, () => {
    lb.value = character.hp;
    lb.maxValue = character.maxHp;
    lb.redraw();
  });
  this.redraw();
};
LifeBar.prototype.calculateRate = function() {
  return this.value/this.maxValue;
};

LifeBar.prototype.getContentColor = function(rate) {
  var lb = this;
  if(rate >= LifeBarConfig.LifeColor.Health.rate)
    return LifeBarConfig.LifeColor.Health.value;
  else if(rate >= LifeBarConfig.LifeColor.Normal.rate)
    return LifeBarConfig.LifeColor.Normal.value;
  else
    return LifeBarConfig.LifeColor.Danger.value;
};
LifeBar.prototype.redraw = function() {
  const bgColor = 0x000000;
  this.g.beginFill(bgColor);
  this.g.drawRect(0, 0, this.width, this.height);
  var rate = this.calculateRate();
  this.g.beginFill(this.getContentColor(rate));
  this.g.drawRect(2, 2, Utils.clamp(Math.floor(rate*this.width)-4, 0, this.width), this.height-4);
};
LifeBar.prototype.alignLifeBar = function() {
  var lb = this;
  //lb.spr.x = -lb.width*1.5;
};