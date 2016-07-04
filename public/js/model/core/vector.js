var RadToDeg = 180/Math.PI

function Vector(x, y, z) {
  //horizontal
  this.x = useDefault(x, 0);
  //height
  this.y = useDefault(y, 0);
  //vertical
  this.z = useDefault(z, 0);
}

Vector.prototype.normalized = function() {
  var dist = this.distance();
  return new Vector(this.x/dist, this.y/dist);
};

Vector.prototype.distance = function() {
  return Math.sqrt(this.x*this.x+this.z*this.z);
};

Vector.prototype.dot = function(v) {
  return this.x*v.x+this.z*v.z;
};

Vector.prototype.multi = function(v) {
  return new Vector(this.x*v, this.y*v, this.z*v);
};

Vector.prototype.add = function(vector) {
  return new Vector(this.x+vector.x, this.y+vector.y, this.z+vector.z);
};

Vector.prototype.subtract = function(vector) {
  return new Vector(this.x-vector.x, this.y-vector.y, this.z-vector.z);
};

Vector.prototype.isZero = function() {
  return this.x && this.y && this.z;
};

Vector.prototype.up = function() {
  return this.add(new Vector(0,0,-1));
};

Vector.prototype.down = function() {
  return this.add(new Vector(0,0,1));
};

Vector.prototype.left = function() {
  return this.add(new Vector(-1,0,0));
};

Vector.prototype.right = function() {
  return this.add(new Vector(1,0,0));
};

Vector.prototype.toString = function() {
  return '({0},{1},{2})'.format(this.x, this.y, this.z);
};