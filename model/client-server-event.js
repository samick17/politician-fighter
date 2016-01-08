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

module.exports = ClientServerEvent;