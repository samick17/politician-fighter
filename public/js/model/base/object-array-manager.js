function ObjectArrayManager() {
  IEventable.call(this);
  this.objs = {};
}
Utils.inheritPrototype(ObjectArrayManager, IEventable);

ObjectArrayManager.prototype.get = function(key) {
  if(key in this.objs)
    return this.objs[key];
  return [];
};

ObjectArrayManager.prototype.add = function(key, obj) {
  var objArray = this.objs[key];
  if(!objArray) {
    this.objs[key] = objArray = [];
  }
  objArray.push(obj);
};

ObjectArrayManager.prototype.remove = function(key, obj) {
  if(key in this.objs) {
    var objArray = this.objs[key];
    var objIdx = objArray.indexOf(obj);
    if(objIdx >= 0)
      objArray.splice(objIdx, 1);
  }
};

ObjectManager.prototype.toString = function() {
  return '{0}'.format(Object.keys(this.objs).length)
};