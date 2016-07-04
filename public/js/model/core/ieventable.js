function IEventable() {
  this._evts = {};
}
IEventable.prototype.on = function(name, callback) {
  if(!(name in this._evts))
    this._evts[name] = [];
  var evtSlots = this._evts[name];
  if(!(callback in evtSlots))
    this._evts[name].push(callback);
};
IEventable.prototype.off = function(name, callback) {
  var evtSlots = this._evts[name];
  if(callback)
    evtSlots.splice(evtSlots.indexOf(callback));
  else
    this._evts[name] = [];
};
IEventable.prototype.trigger = function(name, args) {
  if(name in this._evts) {
    var evts = this._evts[name];
    for(var i in evts) {
      var evt = evts[i];
      evt(args);
    }
  }
};