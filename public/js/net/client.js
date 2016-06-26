function ClientModel() {
  IEventable.call(this);
  this.socket = io('');
  var client = this;
  this.socket.on('connect', function() {
  });
  this.socket.on('disconnect', function(){
  });
}
Utils.inheritPrototype(ClientModel, IEventable);

ClientModel.prototype.send = function(name, pkg) {
  this.socket.emit(name, pkg);
};
ClientModel.prototype.listen = function(name, callback) {
  this.socket.on(name, callback);
};
ClientModel.prototype.offSocket = function(name) {
  this.socket.off(name);
};

ClientModel.prototype.setPlayer = function(data) {
  this.player = new Player(data);
};

ClientModel.prototype.getPlayer = function() {
  return this.player;
};

ClientModel.prototype.getRoom = function() {
  return this.player.room;
};

ClientModel.prototype.leaveRoom = function() {
  this.player.leaveRoom();
};

var Client = new ClientModel();