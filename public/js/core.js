String.prototype.format = function() {
  var args = arguments;
  return this.replace(/{(\d+)}/g, function(match, number) { 
    return typeof args[number] != 'undefined' ? args[number] : match;
  });
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

function inherits(Base, Concrete, args) {
  Concrete.prototype = Object.create(Base.prototype, args);
  Concrete.prototype.constructor = Base;
  Concrete.prototype.parent = Base.prototype;
}

function IEventable() {
  this.evts = {};
}

IEventable.prototype.on = function(name, callback) {
  var evtSlot;
  if(!(name in this.evts)) {
    evtSlot = this.evts[name] = [];
  }
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

function ClientModel(data) {
  IEventable.call(this);
  for(var i in data) {
    this[i] = data[i];
  }
}
inherits(IEventable, ClientModel);

ClientModel.prototype.update = function(data) {
  var evts = this.evts;
  for(var i in data) {
    this[i] = data[i];
  }
  this.evts = evts;
  this.emit(OpType.update, this);
};

function RoomModel(data) {
  IEventable.call(this);
  for(var i in data) {
    this[i] = data[i];
  }
  this.clients = {};
}
inherits(IEventable, RoomModel);

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
  this.emit('addClient', client)
};

RoomModel.prototype.removeClient = function(clientId) {
  delete this.clients[clientId];
};


var appMgr = function() {
  var rooms = {};
  var clients = {};
  var clientId;
  return {
    setAllClients: function(allClients) {
      clients = {};
      for(var i in allClients) {
        var data = allClients[i];
        clients[data.id] = new ClientModel(data);
      }
    },
    addClient: function(data) {
      if(data.id in clients) {
        clients[data.id].update(data);
      }
      else {
        clients[data.id] = new ClientModel(data);
      }
    },
    setAllRooms: function(allRooms) {
      rooms = {};
      for(var i in allRooms) {
        var data = allRooms[i];
        rooms[data.id] = new RoomModel(data);
      }
    },
    setClientId: function(currentClientId) {
      clientId = currentClientId;
    },
    getClient: function() {
      return clients[clientId];
    },
    getClientById: function(id) {
      return clients[id];
    },
    getRoom: function() {
      var client = clients[clientId];
      return rooms[client.roomId];
    },
    addRoom: function(data) {
      if(data.id in rooms) {
        rooms[data.id].update(data);
      }
      else {
        rooms[data.id] = new RoomModel(data);
      }
    },
    removeRoom: function(roomId) {
      delete rooms[roomId];
    },
    joinRoom: function(data) {
      var clientData = data.client;
      var client = clients[clientData.id];
      if(client) {
        client.update(data);
        var roomData = data.room;
        var room = rooms[roomData.id];
        if(room) {
          room.update(roomData);
          room.addClient(client);
        }
      }
    }
  };
}();

var ClientServerEvent = function() {
  return {
    GameStart: 'gs',
    CreateGameRoom: 'cgr',
    QuickJoin: 'qj'
  };
}();

var ServerClientEvent = function() {
  return {
    AllClients: 'ac',
    OnClientConnect: 'oclntcon',
    Profile: 'pf',
    UpdateProfile: 'upf',
    AllRooms: 'arm',
    LoadCharacters: 'lc',
    OnRoomCreated: 'orc',
    OnRoomRemoved: 'orrd',
    OnJoinRoom: 'ojr',
    OnLeaveRoom: 'olr'
  };
}();