var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var port = process.env.PORT || 3000;

app.get('/', function(req, res){
  res.sendFile(__dirname + '/client/index.html');
});

app.use('/client', express.static(__dirname + '/client'));

server.listen(port, function(){
  console.log('listening on port ' + port);
});

var kayttajat = new Map();

io.sockets.on('connection', function(socket){

  socket.on('new user', function(data) {
    socket.id = (Math.random() * 100) + 1;
    var kayttaja = new UusiKayttaja(socket.id, data.username);
    kayttajat.set(socket.id, kayttaja);
    io.sockets.emit('new user', kayttaja);
  });

  socket.on('chat message', function(data){
    var x = {
      message: data.message,
      color: kayttajat.get(socket.id).color,
      username: kayttajat.get(socket.id).username
    }
    io.sockets.emit('chat message', x);
  });

    socket.on('disconnect', function(){
    console.log('socketyhteys katkaistu');
  });
});

var UusiKayttaja = function(id, username) {
  var kayttaja = {
    color:id,
    username: username
  }
  return kayttaja;
}
