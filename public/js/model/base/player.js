function BasePlayer(data) {
  IEventable.call(this);
  for(var i in data) {
    this[i] = data[i];
  }
}
Utils.inheritPrototype(BasePlayer, IEventable);

BasePlayer.prototype.update = function(data) {
  var evts = this.evts;
  for(var i in data) {
    this[i] = data[i];
  }
  this.evts = evts;
  this.trigger(OpType.update, this);
};

function Player(data) {
  BasePlayer.call(this, data);
}
Utils.inheritPrototype(Player, BasePlayer);

Player.prototype.joinRoom = function(roomData) {
  this.room = new Room(roomData);
};

Player.prototype.leaveRoom = function() {
  if(this.room) {
    this.isLockCharacter = false;
    delete this.room;
  }
};