var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);

app.get('/', function(req, res){
  res.sendFile(__dirname + '/client/index.html');
});

app.use('/client', express.static(__dirname + '/client'));

server.listen(3000, function(){
  console.log('listening on port 3000');
});

io.sockets.on('connection', function(socket){

  console.log('uusi socketyhteys: '+socket.id);

  socket.on('chat message', function(data){
      io.sockets.emit('chat message', data);
  });

    socket.on('disconnect', function(){
    console.log('socketyhteys katkaistu');
  });
});
