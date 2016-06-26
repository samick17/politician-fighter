function IEventable()  {
  this.evts = {};
}

IEventable.prototype.on = function(name, method) {
  var eventSlot;
  if(!(name in this.evts)) {
    eventSlot = this.evts[name] = [];
  }
  else {
    eventSlot = this.evts[name];
  }
  eventSlot.push(method);
};
IEventable.prototype.off = function(name, method) {
  if(name in this.evts) {
    if(method) {
      var eventSlot = this.evts[name];
      var index = eventSlot.indexOf(method);
      if(index > -1) {
        eventSlot.splice(index, 1);
      }
    }
    else {
      delete this.evts[name];
    }
  }
};
IEventable.prototype.emit = function(name, arg) {
  if(name in this.evts) {
    var eventSlot = this.evts[name];
    for(var i in eventSlot) {
      var evt = eventSlot[i];
      evt(arg);
    }
  }
};

module.exports = IEventable;