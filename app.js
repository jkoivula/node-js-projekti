var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get('/', function(req, res){
  res.sendFile(__dirname + '/client/index.html');
});

app.use('/client', express.static(__dirname + '/client'));

http.listen(3000, function(){
  console.log('listening on port:3000');
});

io.on('connection', function(socket){
  console.log('uusi socketyhteys');
  socket.on('chat message', function(msg){
      io.emit('chat message', msg);
    });
    socket.on('disconnect', function(){
    console.log('socketyhteys katkaistu');
  });
});
