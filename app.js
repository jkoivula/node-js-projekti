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

  // Alkuperäinen socketin luoma id yhteydelle,
  // viestin välittäminen tietylle henkilölle toimii vain tällä
  var original_id = socket.id;
  // päivitetään taustaväri
  if (io.sockets.connected[original_id]) {
    io.sockets.connected[original_id].emit('update clientbg', {backgroundcolor: backgroundcolor});
  }

  console.log("Uusi yhteys: " + socket.id);

  socket.on('new user', function(data) {
    var kayttaja = new UusiKayttaja(socket.id, data.username);
    kayttajat.set(socket.id, kayttaja);

    //Päivitetään käyttäjälistat, luodaan hashmapista array,
    //jossa on vain kayttaja-oliot
    var kayttajat_oliot = mapValuesToArray(kayttajat);
    io.sockets.emit('update userlist', kayttajat_oliot);

    // viedään colors-lista VAIN juuri liittyneelle käyttäjälle
    if (colors.size > 0) {
      if (io.sockets.connected[original_id]) {
        io.sockets.connected[original_id].emit('liittyneelle', {
          viesti: 'for your eyes only',
          nimi: kayttajat.get(socket.id).username
        });
        io.sockets.connected[original_id].emit('update colorslist', {colors: mapToTuplesOrdered(colors)});
      }
    }

  });

  socket.on('chat message', function(data){

    updateColors(data.msgcolor);

    var isNewBackgroundColor = updateBackgroundColor();

    var x = {
      message: data.message,
      color: kayttajat.get(socket.id).color,
      username: kayttajat.get(socket.id).username,
      msgcolor: data.msgcolor,
      backgroundcolor: backgroundcolor
    }

    io.sockets.emit('chat message', x);

    // Lähetetään clientiin (index.html) päivittetty colors-map
    // colors: tuples --viestin mukana lähetetään tuples-array, koska
    // colors-map ei toiminut clientin puolella. jostain syystä
    io.sockets.emit('update colorslist', {colors: mapToTuplesOrdered(colors)});

    // lähetetään viesti clientille jos taustaväri on muuttunut
    if (isNewBackgroundColor)
      io.sockets.emit('update clientbg', {backgroundcolor: backgroundcolor});
  });

  socket.on('disconnect', function(){
    console.log('socketyhteys katkaistu');
    kayttajat.delete(socket.id);

    var kayttajat_oliot = mapValuesToArray(kayttajat);
    io.sockets.emit('update userlist', kayttajat_oliot);

  });

});

var UusiKayttaja = function(id, username) {
  if(!username) {
    var h = Math.random() * 1000000;
    username = "anon" + h.toString().slice(0,5);;
  }
  var kayttaja = {
    color:id,
    username: username
  }
  return kayttaja;
}

var colors = new Map(); //viesti väri ja määrät
var backgroundcolor = '#ff6214'; //oranssi, joku default vain

function updateColors(msgcolor) {
  var colorExists = false;

  for (var c of colors.keys()) {
    if (msgcolor == c) {
      colorExists = true;
      break;
    }
  }
  /*
  console.log("colors-Map alkutilanne:")
  console.log(colors);
  */
  if (colorExists) colors.set(msgcolor, colors.get(msgcolor) + 1);
  else colors.set(msgcolor, 1);
  /*
  console.log("colors-Map viestimäärä kasvatettu/lisätty:")
  console.log(colors);
  */
  var tuples = mapToTuplesOrdered(colors);

  colors.clear();
  colors = new Map(tuples);

  console.log("colors-Map uudessa järjestyksessä(laskeva):")
  console.log(colors);

}

function mapToTuplesOrdered(map) {
  var tuples = [];
  for (var k of colors.keys()) tuples.push([k, colors.get(k)]);

  // tuples-array sisältö lajitellaan arvon mukaan laskevassa järjestyksessä
  tuples.sort(function(a,b){
    return b[1] - a[1];
  });

  return tuples;
}

function mapValuesToArray(map) {
  var array = [];
  for (var k of map.values()) {
    array.push(k);
  }
  return array;
}

function updateBackgroundColor() {
  // Vaihdetaanko taustaväri?
  // colors.keys().next().value --colors.avaimet.seuraavan(elin ekan).arvo = eniten viestejä oleva väri
  if (backgroundcolor != colors.keys().next().value) {
    backgroundcolor = colors.keys().next().value;
    return true;
  } else
    return false;
}
