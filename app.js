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
  socket.id = (Math.random() * 100) + 1;
  console.log("Uusi yhteys: "+socket.id);

  socket.on('new user', function(data) {
    var kayttaja = new UusiKayttaja(socket.id, data.username);
    kayttajat.set(socket.id, kayttaja);

    //Päivitetään käyttäjälistat, luodaan hashmapista array,
    //jossa on vain kayttaja-oliot
    var kayttajat_oliot = Array();
    for (var k of kayttajat.values()) {
      kayttajat_oliot.push(k);
    }
    io.sockets.emit('update userlist', kayttajat_oliot);
  });


  socket.on('chat message', function(data){
    var x = {
      message: data.message,
      color: kayttajat.get(socket.id).color,
      username: kayttajat.get(socket.id).username,
      msgcolor: data.msgcolor
    }
    io.sockets.emit('chat message', x);
  });

    socket.on('disconnect', function(){
    console.log('socketyhteys katkaistu');
    kayttajat.delete(socket.id);
  });
});

var UusiKayttaja = function(id, username) {
  var kayttaja = {
    color:id,
    username: username
  }
  return kayttaja;
}
