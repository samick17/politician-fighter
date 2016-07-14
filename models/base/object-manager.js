var inherits = require('util').inherits;
var IEventable = require('./ieventable');
var OpType = require('./utils').OpType;

function ObjectManager(capacity) {
  IEventable.call(this);
  this.objs = {};
  this.lenOfObjs = 0;
  this.capacity = capacity;
}
inherits(ObjectManager, IEventable);

ObjectManager.prototype.isFull = function() {
  return this.lenOfObjs == this.capacity;
};

ObjectManager.prototype.add = function(obj) {
  if(this.isFull())
    return false;
  if(obj.id in this.objs) {
    delete this.objs[obj.id];
    this.lenOfObjs -= 1;
  }
  this.objs[obj.id] = obj;
  this.lenOfObjs += 1;
  this.emit(OpType.create, obj);
  return true;
};

ObjectManager.prototype.contains = function(option) {
  var field = Object.keys(option)[0];
  for(var i in this.objs) {
    var obj = this.objs[i];
    if(obj[field] == option[field])
      return true;
  }
  return false;
};

ObjectManager.prototype.containsKey = function(objId) {
  return objId in this.objs;
};

ObjectManager.prototype.get = function(objId) {
  return this.objs[objId];
};

ObjectManager.prototype.removeById = function(objId) {
  if(objId in this.objs) {
    var obj = this.objs[objId];
    delete  this.objs[objId];
    this.lenOfObjs -= 1;
    this.emit(OpType.remove, obj);
    return true;
  }
  return false;
};

ObjectManager.prototype.remove = function(obj) {
  return this.removeById(obj.id);
};

ObjectManager.prototype.count = function() {
  return this.lenOfObjs;
};

ObjectManager.prototype.update = function() {
  for(var i in this.objs) {
    var obj = this.objs[i];
    obj.update();
  }
}

ObjectManager.prototype.toString = function() {
  return this.objs;
};

ObjectManager.prototype.toJson = function() {
  var jsonModels = [];
  for(var i in this.objs) {
    var obj = this.objs[i];
    jsonModels.push(obj.toJson());
  }
  return jsonModels;
};

ObjectManager.prototype.each = function(callback) {
  for(var i in this.objs) {
    var obj = this.objs[i];
    callback(obj);
  }
};

module.exports = ObjectManager;