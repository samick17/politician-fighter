var ServerClientEvent = function() {
  return {
    profile: 'b',
    loadCharacters: 'c',
    onJoinRoom: 'd',
    onLeaveRoom: 'e',
    onLoadEnd: 'f',
    selectCharacter: 'g',
    ensureSelectCharacter: 'h',
    gameStart: 'i',
    gameOver: 'j'
  };
}();

module.exports = ServerClientEvent;