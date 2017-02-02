var socket;
var puhekuplat = [];
var scl = 30; // puhekuplien padding
var chatWidth, chatHeight;
var messagesTotal; //viestin määrä yhteensä --ei vielä käytetä

var backgroundcolor = '#ff6214'; //oranssi, joku default vain

function setup() {
    var canvas = createCanvas(window.innerWidth, window.innerHeight);
    canvas.parent("myCanvas");
    textAlign(LEFT, CENTER);
    textSize(14);
    colorMode(HSB, 100, 100, 100);

    if (window.innerWidth < 1000) {
      chatWidth = 600;
    } else {
      chatWidth = 1000;
    }

    socket.on('chat message', function(data) {
        var kupla = new Puhekupla(data.message, data.color, data.username, data.msgcolor);
        backgroundcolor = data.backgroundcolor;
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

    var r = random(-chatWidth/2, chatWidth/2);
    this.r = constrain(r, -chatWidth/2, chatWidth/2-this.w);

    // Lisätään viesti colors-map:in ja lajitellaan colors-map
    // updateColors(msgcolor);

    this.show = function() {
        push();
        if (window.innerWidth < 1000) {
          chatHeight = 300;
        } else {
          chatHeight = 500;
        }

        translate(width / 2, chatHeight);

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
    var w = window.innerWidth;
    var h = window.innerHeight;

    if (w < 1000) {
      chatWidth = w;
    } else {
      chatWidth = 1000;
    }

    resizeCanvas(w, h);
}
