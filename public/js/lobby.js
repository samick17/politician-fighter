var Lobby = function(game) {};

(function() {

  var menuModel = [
    {name: '創建房間', onMenuSelect: () => {game.state.start('CreateRoom');}},
    {name: '快速加入', onMenuSelect: () => {Client.send(ClientServerEvent.QuickJoin)}},
    {name: '按鍵設定', onMenuSelect: () => {console.log('keyboard settings');}}
  ];
  var menu = [];
  var selectedMenuIndex = 0;
  var highLightGroup;

  function moveMenuItemUp() {
    var mItem = menuModel[selectedMenuIndex];
    if(mItem.onMenuUnhover)
      mItem.onMenuUnhover(mItem);
    selectedMenuIndex = MathUtils.clamp(selectedMenuIndex-1, 0, menu.length-1);
    mItem = menuModel[selectedMenuIndex];
    if(mItem.onMenuHover) {
      mItem.onMenuHover(mItem);
    }
    mItem.highlight();
  }
  function moveMenuItemDown() {
    var mItem = menuModel[selectedMenuIndex];
    if(mItem.onMenuUnhover)
      mItem.onMenuUnhover(mItem);
    selectedMenuIndex = MathUtils.clamp(selectedMenuIndex+1, 0, menu.length-1);
    mItem = menuModel[selectedMenuIndex];
    if(mItem.onMenuHover) {
      mItem.onMenuHover(mItem);
    }
    mItem.highlight();
  }
  function onMenuSelect() {
    menuModel[selectedMenuIndex].onMenuSelect();
  }

  function createHighlightMenuItem() {
    var highLightGroup = game.add.group();
    var highlightImg = game.add.image(0, 0, 'highlight');
    highlightImg.scale.setTo(1, 2);
    highlightImg.alpha = 0.4;
    highLightGroup.add(highlightImg);
    highLightGroup.setPos = (x, y) => {
      highlightImg.x = x;
      highlightImg.y = y;
    };
    return highLightGroup;
  }

  function drawMenuItem(mi, i, focus) {
    var x = game.width/2;
    var y = game.height/2-200+40*i;
    mi.menuItem.setTextBounds(x, y, 120, 40);
    mi.highlight = function() {
      highLightGroup.setPos(x, y);
    };
  }

  Client.on(ServerClientEvent.AllClients, function(data) {
    appMgr.setAllClients(data);
    console.log(data);
  });
  Client.on(ServerClientEvent.OnClientConnect, function(data) {
    appMgr.addClient(data);
  });
  Client.on(ServerClientEvent.Profile, function(data) {
    appMgr.setClientId(data.id);
  });
  Client.on(ServerClientEvent.UpdateProfile, function(data) {
    appMgr.getClient().update(data);
  });
  Client.on(ServerClientEvent.AllRooms, function(data) {
    appMgr.setAllRooms(data);
  });
  Client.on(ServerClientEvent.LoadCharacters, function(data) {
    appMgr.characters = data.characters;
    appMgr.candidateCharacters = data.candidateCharacters;
  });
  Client.on(ServerClientEvent.OnRoomCreated, (data) => {
    appMgr.addRoom(data);
  });
  Client.on(ServerClientEvent.OnJoinRoom, (data) => {
    appMgr.joinRoom(data);
    if(data.id === appMgr.getClient().id) {
      game.state.start('GameRoom');
    }
  });

  Lobby.prototype = {
    preload: function() {
      game.load.image('highlight', '/media/highlight-red.png');
    },
    create: function() {
      highLightGroup = createHighlightMenuItem();
      var style = { font: "bold 32px Arial", fill: "#fff", boundsAlignH: "center", boundsAlignV: "middle" };
      for(var i in menuModel) {
        var mModel = menuModel[i];
        mModel.menuItem = game.add.text(0, 0, mModel.name, style);
        menu.push(mModel.menuItem);
        drawMenuItem(mModel, i, i == selectedMenuIndex);
      }
      menuModel[selectedMenuIndex].highlight();
      keyMenuUp = game.input.keyboard.addKey(Phaser.Keyboard.UP);
      keyMenuUp.onDown.add(moveMenuItemUp, this);
      keyMenuDown = game.input.keyboard.addKey(Phaser.Keyboard.DOWN);
      keyMenuDown.onDown.add(moveMenuItemDown, this);
      keyMenuSelect = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
      keyMenuSelect.onDown.add(onMenuSelect, this);
      var mItem = menuModel[selectedMenuIndex];
      if(mItem.onMenuHover)
        mItem.onMenuHover(mItem);
    },
    update: function() {
    },
    render: function() {
    }
  }
}());