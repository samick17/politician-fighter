var ClientServerEvent = function() {
  return {
    GameStart: 'gs',
    CreateGameRoom: 'cgr',
    QuickJoin: 'qj'
  };
}();

module.exports = ClientServerEvent;