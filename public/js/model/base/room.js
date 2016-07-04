function Room(data) {
  IEventable.call(this);
  for(var i in data) {
    this[i] = data[i];
  }
  this.clients = {};
}
Utils.inheritPrototype(Room, IEventable);

Room.prototype.init = function() {
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

Room.prototype.update = function(data) {
  var evts = this.evts;
  for(var i in data) {
    this[i] = data[i];
  }
  this.evts = evts;
  this.trigger(OpType.update, this);
};

Room.prototype.addClient = function(client) {
  this.clients[client.id] = client;
  this.trigger('addClient', {client: client});
};

Room.prototype.removeClient = function(clientId) {
  var client = this.clients[clientId];
  delete this.clients[clientId];
  return client;
};

Room.prototype.updateClient = function(clientData) {
  var client = this.getClientById(clientData.id);
  if(client) {
    client.update(clientData);
  }
};

Room.prototype.getClientIndex = function(clientId) {
 return indexOfArrayProperty(this.members, 'id', clientId);
};

Room.prototype.getClientById = function(id) {
  return this.clients[id];
};

Room.prototype.isFull = function() {
  return Object.keys(this.members).length == this.maxMember;
};