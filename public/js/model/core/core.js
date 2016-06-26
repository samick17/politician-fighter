var ArenaSettings = {
  BackgroundScale: 5,
  BaseLineHeight: 1,
  MIN_BASELINE: 0,
  MAX_BASELINE: 864,
  NextInputThreshold: 20,
  DOUBLE_KEYDOWN_THRESHOLD: 200
};

function indexOfArrayProperty(arr, property, val) {
  for(var i in arr) {
    if(arr[i][property] === val)
      return i;
  }
  return -1;
}

var OpType = {
  add: 'ad',
  remove: 'rm',
  update: 'ud',
  refresh: 'rf'
};

function useDefault(v, d) {
  return (typeof v !== 'undefined' && v !== null) ? v : d
}

function genValue(range) {
  return Math.floor(Math.random()*range);
}

const UserDevice = {
  PC: 0,
  Mobile: 1
};
function getUserDevice() {
  var ua = navigator.userAgent;
  if(/Android/.test(ua) || /mobile/.test(ua) || /iPhone/.test(ua) || /iPad/.test(ua)) {
    return UserDevice.Mobile;
  }
  else if(/Windows NT/.test(ua)) {
    return UserDevice.PC;
  }
  else {
    return UserDevice.PC;
  }
};

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
  this.emit(OpType.update, this);
};

function Player(data) {
  BasePlayer.call(this, data);
}
Utils.inheritPrototype(Player, BasePlayer);

Player.prototype.joinRoom = function(roomData) {
  this.room = new RoomModel(roomData);
};

Player.prototype.leaveRoom = function() {
  if(this.room) {
    this.isLockCharacter = false;
    delete this.room;
  }
};

function RoomModel(data) {
  IEventable.call(this);
  for(var i in data) {
    this[i] = data[i];
  }
  this.clients = {};
}
Utils.inheritPrototype(RoomModel, IEventable);

RoomModel.prototype.init = function() {
  this.clients = {};
  for(var i in this.members) {
    var client = this.members[i];
    if(client.id === Client.getPlayer().id) {
      Client.getPlayer().update(client);
      this.addClient(Client.getPlayer(), i);
    }
    else {
      this.addClient(new BasePlayer(client), client.slotIndex);
    }
  }
};

RoomModel.prototype.update = function(data) {
  var evts = this.evts;
  for(var i in data) {
    this[i] = data[i];
  }
  this.evts = evts;
  this.emit(OpType.update, this);
};

RoomModel.prototype.addClient = function(client) {
  this.clients[client.id] = client;
  this.emit('addClient', {client: client});
};

RoomModel.prototype.removeClient = function(clientId) {
  var client = this.clients[clientId];
  delete this.clients[clientId];
  return client;
};

RoomModel.prototype.updateClient = function(clientData) {
  var client = this.getClientById(clientData.id);
  if(client) {
    client.update(clientData);
  }
};

RoomModel.prototype.getClientIndex = function(clientId) {
 return indexOfArrayProperty(this.members, 'id', clientId);
};

RoomModel.prototype.getClientById = function(id) {
  return this.clients[id];
};

RoomModel.prototype.isFull = function() {
  return Object.keys(this.members).length == this.maxMember;
};

//--begin utils
var idIndex = 0;
function genId() {
  var idx = idIndex;
  idIndex++;
  return idx;
}

function lerp(a, b, t) {
  return (1-t)*(b-a)+a;
}

function toHex(num) {
  return num.toString(16);
}

function randomRange(from, to) {
  return parseInt(Math.round(Math.random()*(to-from)))+from;
}