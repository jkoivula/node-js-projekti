var socket;
var puhekuplat = [];
var scl = 30; // puhekuplien padding

var colors = new Map(); //viesti väri ja määrät
var messagesTotal; //viestin määrä yhteensä --ei vielä käytetä

var backgroundcolor = '#ff6214'; //oranssi, joku default vain

function setup() {
    var canvas = createCanvas(window.innerWidth, window.innerHeight);
    canvas.parent("myCanvas");
    textAlign(LEFT, CENTER);
    textSize(14);
    colorMode(HSB, 100, 100, 100);

    socket.on('chat message', function(data) {
        var kupla = new Puhekupla(data.message, data.color, data.username, data.msgcolor);
        console.log(kupla);
        puhekuplat.push(kupla);
    });

}

function Puhekupla(msg, color, username, msgcolor) {
    this.user = username + ":  ";
    this.text = msg;
    this.color = color;
    this.x;
    this.y = 0;
    this.uw = textWidth(this.user);
    this.w = textWidth(this.text) + this.uw + scl;
    this.angle = 0;
    var r = random(-250, 250);
    this.r = constrain(r, -250, 250-this.w);

    // Lisätään viesti colors-map:in ja lajitellaan colors-map
    updateColors(msgcolor);

    this.show = function() {
        push();
        translate(width / 2, 500);

        // arvotaan x-koordinaatti johon kupla ilmestyy ja lisätään aaltoliike
        var ang = radians(this.angle);
        this.x = this.r + (10 * cos(ang));

        // piirretään puhekupla
        //noFill();
        strokeWeight(3);
        stroke(msgcolor); // testailin valittua väriä kuplan reunan värinä
        fill(255);
        rect(this.x, this.y, this.w, scl, scl);

        // näytetään käyttäjänimi
        textStyle(BOLD);
        strokeWeight(0);
        fill(this.color, 80, 80);
        text(this.user, this.x + scl / 2, this.y, width - this.x, scl);

        // näytetään käyttäjän viesti
        textStyle(NORMAL);
        fill(0);
        text(this.text, this.x + scl / 2 + this.uw, this.y, width - this.x, scl);
        pop();
    }

    this.update = function() {
        this.y -= 0.5;
        this.angle += 1.2;
    }
}

function draw() {
    background(backgroundcolor);
    for (var i = 0; i < puhekuplat.length; i++) {
        puhekuplat[i].show();
        puhekuplat[i].update();
    };
}

// aseta canvasin koko uudelleen jos selainikkunan kokoa muutetaan
function windowResized() {
    resizeCanvas(window.innerWidth, window.innerHeight);
}

function updateColors(msgcolor) {
  var colorExists = false;

  for (var c of colors.keys()) {
    if (msgcolor == c) {
      colorExists = true;
      break;
    }
  }

  console.log("colors-Map alkutilanne:")
  console.log(colors);

  if (colorExists) colors.set(msgcolor, colors.get(msgcolor) + 1);
  else colors.set(msgcolor, 1);

  console.log("colors-Map viestimäärä kasvatettu/lisätty:")
  console.log(colors);

  var tuples = [];
  for (var k of colors.keys()) tuples.push([k, colors.get(k)]);

  // tuples-array sisältö lajitellaan arvon mukaan laskevassa järjestyksessä
  tuples.sort(function(a,b){
    return b[1] - a[1];
  });

  colors.clear();
  colors = new Map(tuples);

  console.log("colors-Map uudessa järjestyksessä(laskeva):")
  console.log(colors);

  // Vaihdetaanko taustaväri?
  // colors.keys().next().value --colors.avaimet.seuraavan(elin ekan).arvo = eniten viestejä oleva väri
  if (backgroundcolor != colors.keys().next().value)
    backgroundcolor = colors.keys().next().value;

  // Lähetetään clientiin (index.html) päivittetty colors-map
  // colors: tuples --viestin mukana lähetetään tuples-array, koska
  // colors-map ei toiminut clientin puolella. jostain syystä
  socket.emit('update colorslist', {colors: tuples});
}
