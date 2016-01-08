var Load = function(game) {};

(function() {

  function loadAudios(data) {
    for(var key in data) {
      var item = data[key];
      game.load.audio(key, item.path);
    }
  }

  Client.on(ServerClientEvent.OnLoadEnd, function(data) {
    game.state.start('Lobby');
  });

  Load.prototype = {
    preload: function() {
      game.load.spritesheet('loading', 'media/arena/firen_0.png',80,80,70);
      Client.send(ClientServerEvent.RequestInitial);
      //loadAudios(AudioResource);
    },
    create: function() {
      var player = game.add.sprite(0, 0, 'loading');
      player.scale.setTo(2,2);
      player.x = 20;
      player.y = game.height - player.height-20;
      player.animations.add('idle', [0,1,2,3,2,1], 10, true);
      player.animations.play('idle');
      /*var ch = new Character(AudioResource);
      game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR)
      .onDown.add(()=>{ch.attack();}, this);
      game.input.keyboard.addKey(Phaser.Keyboard.NUMPAD_ADD)
      .onDown.add(()=>{ch.punch();}, this);
      var runKey = game.input.keyboard.addKey(Phaser.Keyboard.LEFT);
      runKey.onDown.add(()=>{ch.run();}, this);
      runKey.onUp.add(()=>{ch.stopRun();}, this);*/
    },
    update: function() {
    },
    render: function() {
    }
  }
}());