var ServerClientEvent = function() {
  return {
    allClients: 'a',
    onClientConnect: 'b',
    onClientDisconnect: 'c',
    profile: 'd',
    allRooms: 'e',
    loadCharacters: 'f',
    onRoomCreated: 'g',
    onRoomRemoved: 'h',
    onJoinRoom: 'i',
    onLeaveRoom: 'j',
    onLoadEnd: 'k',
    selectCharacter: 'l',
    ensureSelectCharacter: 'm',
    refreshRoomMembers: 'n',
    gameStart: 'o'
  };
}();

module.exports = ServerClientEvent;