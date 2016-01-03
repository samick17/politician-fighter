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

module.exports = ServerClientEvent;