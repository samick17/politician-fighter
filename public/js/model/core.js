String.prototype.format = function() {
  var args = arguments;
  return this.replace(/{(\d+)}/g, function(match, number) { 
    return typeof args[number] != 'undefined' ? args[number] : match;
  });
};

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

function inherits(Base, Concrete, args) {
  Concrete.prototype = Object.create(Base.prototype, args);
  Concrete.prototype.constructor = Base;
  Concrete.prototype.parent = Base.prototype;
}

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

RoomModel.prototype.addClient = function(client, idx) {
  this.clients[client.id] = client;
  this.emit('addClient', {client: client, idx: idx});
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
    removeClientById: function(data) {
      delete clients[data.clientId];
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
    updateClient: function(clientData) {
      if(clientData.id in clients) {
        clients[clientData.id].update(clientData);
        return clients[clientData.id];
      }
    },
    getClientById: function(id) {
      return clients[id];
    },
    getAllClients: function() {
      return clients;
    },
    getRoom: function() {
      var client = clients[clientId];
      return rooms[client.roomId];
    },
    getRoomById: function(id) {
      return rooms[id];
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
    joinRoom: function(clientData, roomData, idx) {
      var client = clients[clientData.id];
      if(client) {
        client.update(clientData);
        var room = rooms[roomData.id];
        if(room) {
          room.update(roomData);
          room.addClient(client, idx);
        }
      }
    },
    logClients: function() {
    }
  };
}();

var ClientServerEvent = function() {
  return {
    RequestInitial: 'rint',
    GameStart: 'gs',
    CreateGameRoom: 'cgr',
    QuickJoin: 'qj',
    SelectCharacter: 'sct',
    EnsureSelectCharacter: 'esct'
  };
}();

var ServerClientEvent = function() {
  return {
    AllClients: 'ac',
    OnClientConnect: 'oclntcon',
    OnClientDisconnect: 'oclntdcon',
    Profile: 'pf',
    AllRooms: 'arm',
    LoadCharacters: 'lc',
    OnRoomCreated: 'orc',
    OnRoomRemoved: 'orrd',
    OnJoinRoom: 'ojr',
    OnLeaveRoom: 'olr',
    OnLoadEnd: 'oled',
    SelectCharacter: 'sct',
    EnsureSelectCharacter: 'esct',
    RefreshRoomMembers: 'rrms'
  };
}();