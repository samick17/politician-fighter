function isTouching(c1, c2) {
  return !(c1.right() < c2.left()) && !(c1.left() > c2.right()) && !(c1.bottom() < c2.top()) && !(c1.top() > c2.bottom());
}

function isTouchingOffset(offsetCoord, c1, c2) {
  return !(c1.right()+offsetCoord.x <= c2.left()) && !(c1.left()+offsetCoord.x >= c2.right()) && !(c1.bottom()+offsetCoord.y <= c2.top()) && !(c1.top()+offsetCoord.y >= c2.bottom());
}

//target is baseitem
function BoxCollider(target, w, h, isTrigger) {
  this.target = target;
  this.w = w;
  this.h = h;
  this.isTrigger = isTrigger;
};

BoxCollider.prototype.left = function() {
  return this.target.coord.x - this.w/2;
};

BoxCollider.prototype.right = function() {
  return this.target.coord.x + this.w/2;
};

BoxCollider.prototype.top = function() {
  return this.target.coord.y - this.h/2;
};

BoxCollider.prototype.bottom = function() {
  return this.target.coord.y + this.h/2;
};

module.exports = {
  BoxCollider: BoxCollider,
  isTouching: isTouching,
  isTouchingOffset: isTouchingOffset
};