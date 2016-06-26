function GameMenu(menuModelArray) {
  this.menu = {};
  this.menuModelArray = menuModelArray;
  const style = { font: "bold 32px Arial", fill: "#fff", boundsAlignH: "center", boundsAlignV: "middle" };
  for(var i in menuModelArray) {
    var item = menuModelArray[i];
    var gameMenuItem = new GameMenuItem(item, i);
    gameMenuItem.draw(style);
    this.menu[item.id] = gameMenuItem;
  }
  this.selectedIndex = -1;
  this.highlight(0);
}

GameMenu.prototype.highlight = function(index) {
  if(!this.highlightGroup) {
    this.selectedIndex = index;
    var group = game.add.group();
    var img = game.add.graphics(0,0);
    img.beginFill(0xff0000, 1);
    img.drawRect(0,0,130,40);
    img.alpha = 0.4;
    group.add(img);
    group.setPos = (x, y) => {
      img.x = x;
      img.y = y;
    };
    this.highlightGroup = group;
  }
  var menuItem = this.getSelectedMenuItem();
  this.highlightGroup.position.copyFrom(menuItem.getPosition());
  this.selectedIndex = index;
  if(menuItem.menuItemData.onMenuHover) {
    menuItem.menuItemData.onMenuHover(menuItem);
  }
};

GameMenu.prototype.getSelectedKey = function() {
  return this.menuModelArray[this.selectedIndex].id;
};

GameMenu.prototype.getSelectedMenuItem = function() {
  return this.menu[this.getSelectedKey()];
};

GameMenu.prototype.unhover = function() {
  if(this.selectedIndex >= 0) {
    var menuItem = this.getSelectedMenuItem();
    if(menuItem.menuItemData.onMenuUnhover) {
      menuItem.menuItemData.onMenuUnhover(menuItem);
    }
  }
};

GameMenu.prototype.next = function() {
  this.unhover();
  this.selectedIndex += 1;
  if(this.selectedIndex > this.menuModelArray.length-1) {
    this.selectedIndex = 0;
  }
  this.highlight(this.selectedIndex);
};

GameMenu.prototype.previous = function() {
  this.unhover();
  this.selectedIndex -= 1;
  if(this.selectedIndex < 0) {
    this.selectedIndex = this.menuModelArray.length-1;
  }
  this.highlight(this.selectedIndex);
};

GameMenu.prototype.select = function() {
  this.getSelectedMenuItem().select();
};

function GameMenuItem(menuItemData, index) {
  this.menuItemData = menuItemData;
  this.id = menuItemData.id;
  this.index = index;
}

GameMenuItem.prototype.draw = function(style) {
  this.group = game.add.group();
  this.uiText = game.add.text(0, 0, this.menuItemData.name, style);
  this.group.add(this.uiText);
  const x = game.width/2;
  const y = game.height/2-200+40*this.index;
  this.group.position.set(x,y);
};

GameMenuItem.prototype.setText = function(text) {
  this.uiText.setText(text);
};

GameMenuItem.prototype.getPosition = function() {
  return this.group.position;
};

GameMenuItem.prototype.select = function() {
  this.menuItemData.onMenuSelect();
};