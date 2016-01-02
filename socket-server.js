function createSocketServer(app) {
  var io = require('socket.io')(app);
  var ClientServerEvent = require('./model/client-server-event');

  io.on('connection', function(socket) {
    console.log('connect');
    socket.on(ClientServerEvent.GameStart, function(data) {
      console.log(data);
    });
    socket.on('disconnect', function() {
      console.log('disconnect');
    });
  });  
}

module.exports = {
  createSocketServer: createSocketServer
};
