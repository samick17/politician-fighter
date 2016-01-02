var Lobby = function(game) {};

(function() {

  //Client.send('data', {'name': 'orz'});
  var menuModel = [
    {name: '創建房間', onMenuSelect: () => {game.state.start('CreateRoom');}},
    {name: '快速加入', onMenuSelect: () => {game.state.start('QuickJoin');}},
    {name: '按鍵設定', onMenuSelect: () => {console.log('keyboard settings');}}
  ];
  var menu = [];
  var selectedMenuIndex = 0;

  function moveMenuItemUp() {
    selectedMenuIndex = MathUtils.clamp(selectedMenuIndex-1, 0, menu.length-1);
  }
  function moveMenuItemDown() {
    selectedMenuIndex = MathUtils.clamp(selectedMenuIndex+1, 0, menu.length-1);
  }
  function onMenuSelect() {
    menuModel[selectedMenuIndex].onMenuSelect();
  }

  Lobby.prototype = {
    preload: function() {

    },
    create: function() {
      var centerX = game.width/2;
      var centerY = game.height/2;
      var style = { font: "bold 32px Arial", fill: "#fff", boundsAlignH: "center", boundsAlignV: "middle" };
      for(var i in menuModel) {
        var mModel = menuModel[i];
        var menuItem = game.add.text(0, 0, mModel.name, style);
        menuItem.setTextBounds(centerX, centerY-200+40*i, 120, 40);
        menu.push(menuItem);
      }
      keyMenuUp = game.input.keyboard.addKey(Phaser.Keyboard.UP);
      keyMenuUp.onDown.add(moveMenuItemUp, this);
      keyMenuDown = game.input.keyboard.addKey(Phaser.Keyboard.DOWN);
      keyMenuDown.onDown.add(moveMenuItemDown, this);
      keyMenuSelect = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
      keyMenuSelect.onDown.add(onMenuSelect, this);
    },
    update: function() {
    },
    render: function() {
      game.debug.geom(menu[selectedMenuIndex].textBounds);
    }
  }
}());