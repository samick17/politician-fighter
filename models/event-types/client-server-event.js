var ClientServerEvent = function() {
  return {
    init: 'a',
    gameStart: 'b',
    createGameRoom: 'c',
    quickJoin: 'd',
    selectCharacter: 'e',
    ensureSelectCharacter: 'f',
    leaveRoom: 'g'
  };
}();

module.exports = ClientServerEvent;