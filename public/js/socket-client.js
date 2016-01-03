var Client = (function() {
  var socket = io('');

  socket.on('connect', function(){
    console.log('connect');
  });
  socket.on('data', function(data){
    console.log('connect');
  });
  socket.on('disconnect', function(){
    console.log('disconnect');
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