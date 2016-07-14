function ObjectArrayManager() {
  this.objs = {};
}

ObjectArrayManager.prototype.get = function(key) {
  if(key in this.objs) {
    return this.objs[key];
  }
  return [];
};

ObjectArrayManager.prototype.add = function(key, obj) {
  var objArray = this.objs[key];
  if(!objArray) {
    this.objs[key] = objArray = [];
  }
  objArray.push(obj);
};

ObjectArrayManager.prototype.updateKey = function(oldKey, newKey, obj) {
  if(this.remove(oldKey, obj)) {
    this.add(newKey, obj);
  }
};

ObjectArrayManager.prototype.remove = function(key, obj) {
  if(key in this.objs) {
    var objArray = this.objs[key];
    var objIdx = objArray.indexOf(obj);
    if(objIdx >= 0) {
      objArray.splice(objIdx, 1);
      return true;
    }
    return false;
  }
  return false;
};

ObjectArrayManager.prototype.toString = function() {
  return '{0}'.format(Object.keys(this.objs).length);
};

module.exports = ObjectArrayManager;