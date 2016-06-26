function IEventable() {
  this.evts = {};
}

IEventable.prototype.on = function(name, callback) {
  var evtSlot;
  if(!(name in this.evts)) {
    evtSlot = this.evts[name] = [];
  }
  else
    evtSlot = this.evts[name];
  evtSlot.push(callback);
};

IEventable.prototype.off = function(name, callback) {
  if(name in this.evts) {
    var evtSlot = this.evts[name];
    var callbackIndex = evtSlot.indexOf(callback);
    if(callbackIndex >= 0) {
      evtSlot.splice(callbackIndex, 1);
    }
  }
};

IEventable.prototype.emit = function(name, arg) {
  if(name in this.evts) {
    var evtSlot = this.evts[name];
    for(var i in evtSlot) {
      evtSlot[i](arg);
    }
  }
};