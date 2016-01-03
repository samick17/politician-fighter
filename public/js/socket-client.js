var Client = (function() {
  var socket = io('');

  socket.on('connect', function(){
  });
  socket.on('disconnect', function(){
  });

  return {
    send: function(name, pkg) {
      socket.emit(name, pkg);
    },
    on: function(name, callback) {
      socket.on(name, callback);
    }
  };
}());