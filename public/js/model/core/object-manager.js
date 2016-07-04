function ObjectManager() {
  IEventable.call(this);
  this.objs = {};
  this.lenOfObjs = 0;
}
Utils.inheritPrototype(ObjectManager, IEventable);

ObjectManager.prototype.init = function() {
  for(var i in this.objs) {
    this.objs[i].init();
  }
};

ObjectManager.prototype.getById = function(key) {
  if(key in this.objs)
    return this.objs[key];
  else
    return {};
};

ObjectManager.prototype.containsKey = function(key) {
  return key in this.objs;
};

ObjectManager.prototype.add = function(obj) {
  if(!(obj.id in this.objs)) {
    this.objs[obj.id] = obj;
    this.lenOfObjs += 1;
    this.trigger('add', obj);
  }
};

ObjectManager.prototype.removeById = function(objId) {
  if(objId in this.objs) {
    var obj = this.objs[objId];
    delete  this.objs[objId];
    this.lenOfObjs -= 1;
    this.trigger('remove', obj);
    return obj;
  }
};

ObjectManager.prototype.update = function() {
  var tObjs = this.objs;
  for(var i in tObjs) {
    var obj = tObjs[i];
    obj.update();
  }
};

ObjectManager.prototype.clearObjects = function() {
  this.objs = {};
};


ObjectManager.prototype.toString = function() {
  return '{0}'.format(Object.keys(this.objs).length)
};