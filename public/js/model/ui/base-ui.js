function BaseUI(width, height) {
  this.spr = game.add.group();
  this.width = width;
  this.height = height;
  this.g = game.add.graphics(this.width, this.height);
  this.spr.add(this.g);
  this.spr.position.set(game.width-this.width*2,-this.height);
};

BaseUI.prototype.doAttach = function(character) {

};

BaseUI.prototype.attach = function(character) {
  this.character = character;
  this.doAttach(character);  
};

BaseUI.prototype.bringToTop = function() {
  game.world.bringToTop(this.spr);
};

BaseUI.prototype.redraw = function() {

};