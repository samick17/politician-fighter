var CreateRoom = function(game) {};

(function() {

  const MENU_MAP_TEXT = '選擇地圖';
  const MENU_PLAYER_TEXT = '玩家';
  const MENU_START_TEXT = '創建房間';
  const Maps = [{id: 0, name: 'Foreast'}, {id: 1, name: 'Dugeon'}, {id: 2, name: 'Dessert'}];
  const MemberCounts = [1,2,3,4,5,6];
  var menu = [];
  var selectedMenuIndex = 0;
  var highLightGroup;
  var selectedMapIndex = -1, selectedMemberCountIndex = -1;

  var gameParams = {
    mapId: 0,
    maxMember: 2
  };

  var menuModel = [
  {
    id: 0,
    name: MENU_MAP_TEXT,
    onMenuSelect: (item) => {
    },
    onMenuHover: (item) => {
      var keyMenuLeft = game.input.keyboard.addKey(Phaser.Keyboard.LEFT);
      keyMenuLeft.onDown.add(item.menuItemData.choosePreviousMap, this, 0, item);
      var keyMenuRight = game.input.keyboard.addKey(Phaser.Keyboard.RIGHT);
      keyMenuRight.onDown.add(item.menuItemData.chooseNextMap, this, 0, item);
    },
    onMenuUnhover: (item) => {
      game.input.keyboard.removeKey(Phaser.Keyboard.LEFT);
      game.input.keyboard.removeKey(Phaser.Keyboard.RIGHT);
    },
    choosePreviousMap: (evt, item) => {
      selectedMapIndex = Math.abs((selectedMapIndex-1)%Maps.length);
      var selectedMapParam = Maps[selectedMapIndex];
      item.setText(selectedMapParam.name);
      gameParams.mapId = selectedMapParam.id;
    },
    chooseNextMap: (evt, item) => {
      selectedMapIndex = Math.abs((selectedMapIndex+1)%Maps.length);
      var selectedMapParam = Maps[selectedMapIndex];
      item.setText(selectedMapParam.name);
      gameParams.mapId = selectedMapParam.id;
    }
  }, {
    id: 1,
    name: MENU_PLAYER_TEXT,
    onMenuSelect: (item) => {
    },
    onMenuHover: (item) => {
      var keyMenuLeft = game.input.keyboard.addKey(Phaser.Keyboard.LEFT);
      keyMenuLeft.onDown.add(item.menuItemData.choosePreviousCount, this, 0, item);
      var keyMenuRight = game.input.keyboard.addKey(Phaser.Keyboard.RIGHT);
      keyMenuRight.onDown.add(item.menuItemData.chooseNextCount, this, 0, item);
    },
    onMenuUnhover: (item) => {
      game.input.keyboard.removeKey(Phaser.Keyboard.LEFT);
      game.input.keyboard.removeKey(Phaser.Keyboard.RIGHT);
    },
    choosePreviousCount: (evt, item) => {
      selectedMemberCountIndex = Math.abs((selectedMemberCountIndex-1)%MemberCounts.length);
      var memberParam = MemberCounts[selectedMemberCountIndex];
      item.setText('{0}-{1}人'.format(MENU_PLAYER_TEXT, memberParam));
      gameParams.maxMember = memberParam;
    },
    chooseNextCount: (evt, item) => {
      selectedMemberCountIndex = Math.abs((selectedMemberCountIndex+1)%MemberCounts.length);
      var memberParam = MemberCounts[selectedMemberCountIndex];
      item.setText('{0}-{1}人'.format(MENU_PLAYER_TEXT, memberParam));
      gameParams.maxMember = memberParam;
    }
  }, {
    id: 2,
    name: MENU_START_TEXT,
    onMenuSelect: (item) => {
      Client.send(ClientServerEvent.createGameRoom, gameParams);
    }
  }
  ];

  function moveMenuItemUp() {
    var mItem = menuModel[selectedMenuIndex];
    if(mItem.onMenuUnhover)
      mItem.onMenuUnhover(mItem);
    selectedMenuIndex = Utils.clamp(selectedMenuIndex-1, 0, menu.length-1);
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
    selectedMenuIndex = Utils.clamp(selectedMenuIndex+1, 0, menu.length-1);
    mItem = menuModel[selectedMenuIndex];
    if(mItem.onMenuHover) {
      mItem.onMenuHover(mItem);
    }
    mItem.highlight();
  }
  function onMenuSelect() {
    var mItem = menuModel[selectedMenuIndex];
    mItem.onMenuSelect(mItem);
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

  CreateRoom.prototype = {
    preload: function() {
    },
    create: function() {
      var gameMenu = new GameMenu(menuModel);
      keyMenuUp = game.input.keyboard.addKey(Phaser.Keyboard.UP);
      keyMenuUp.onDown.add(function() {
        gameMenu.previous();
      }, this);
      keyMenuDown = game.input.keyboard.addKey(Phaser.Keyboard.DOWN);
      keyMenuDown.onDown.add(function() {
        gameMenu.next();
      }, this);
      keyMenuSelect = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
      keyMenuSelect.onDown.add(function() {
        gameMenu.select();
      }, this);
      keyPageUp = game.input.keyboard.addKey(Phaser.Keyboard.ESC);
      keyPageUp.onDown.add(function() {
        game.state.start('Lobby');
      });
    },
    update: function() {
    },
    render: function() {
    }
  }
}());