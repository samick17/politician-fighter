var Load = function(game) {
  this.game = game;
};

(function() {

  function loadAudios(data) {
    for(var key in data) {
      var item = data[key];
      game.load.audio(key, item.path);
    }
  }

  Load.prototype = {
    preload: function() {
      game = this.game;
      game.load.spritesheet('loading', 'media/arena/freeze.png',80,80,70);
      //loadAudios(AudioResource);
    },
    create: function() {
      var player = game.add.sprite(0, 0, 'loading');
      player.scale.setTo(2,2);
      player.x = 20;
      player.y = game.height - player.height-20;
      player.animations.add('idle', [0,1,2,3,2,1], 10, true);
      player.animations.play('idle');
      Client.listen(ServerClientEvent.profile, function(data) {
        Client.setPlayer(data);
      });
      Client.listen(ServerClientEvent.loadCharacters, function(data) {
        Client.characters = data.characters;
        Client.candidateCharacters = data.candidateCharacters;
      });
      Client.listen(ServerClientEvent.onLoadEnd, function(data) {
        Client.offSocket(ServerClientEvent.profile);
        Client.offSocket(ServerClientEvent.loadCharacters);
        Client.offSocket(ServerClientEvent.onLoadEnd);
        game.state.start('Arena');
      });
      Client.send(ClientServerEvent.init);
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