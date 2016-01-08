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
    OnJoinRoom: 'ojr',//client-self join room
    OnLeaveRoom: 'olr',//another client leave room
    OnLoadEnd: 'oled',//load game data completed
    SelectCharacter: 'sct',
    EnsureSelectCharacter: 'esct',
    RefreshRoomMembers: 'rrms'
  };
}();

module.exports = ServerClientEvent;