var Lobby = function(game) {};

(function() {

  var menuModel = [
    {id: 0, name: '創建房間', onMenuSelect: () => {game.state.start('CreateRoom');}},
    {id: 1, name: '快速加入', onMenuSelect: () => {Client.send(ClientServerEvent.quickJoin)}},
    {id: 2, name: '按鍵設定', onMenuSelect: () => {console.log('keyboard settings');}}
  ];

  function registerLobbySocketListener() {
    Client.listen(ServerClientEvent.onJoinRoom, (data) => {
      Client.getPlayer().joinRoom(data.room);
      Client.offSocket(ServerClientEvent.onJoinRoom);
      game.state.start('GameRoom');
    });
  }

  Lobby.prototype = {
    preload: function() {
      registerLobbySocketListener();
      game.load.image('highlight', '/media/highlight-red.png');
    },
    create: function() {
      const gameMenu = new GameMenu(menuModel);
      keyMenuUp = game.input.keyboard.addKey(Phaser.Keyboard.UP);
      keyMenuUp.onDown.add(function() {
        gameMenu.previous();
      }, this);
      const keyMenuDown = game.input.keyboard.addKey(Phaser.Keyboard.DOWN);
      keyMenuDown.onDown.add(function() {
        gameMenu.next();
      }, this);
      const keyMenuSelect = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
      keyMenuSelect.onDown.add(function() {
        gameMenu.select();
      }, this);
    },
    update: function() {
    },
    render: function() {
    }
  }
}());