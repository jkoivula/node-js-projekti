var socket;
var puhekuplat = [];
var scl = 30; // puhekuplien padding

function setup() {
    var canvas = createCanvas(600, 500);
    canvas.parent("myCanvas");
    textAlign(LEFT, CENTER);
    textSize(14);
    // HSB = hue, saturation, brightness
    colorMode(HSB, 100, 100, 100);
    socket.on('chat message', function(data) {
        var kupla = new Puhekupla(data.message, data.color, data.username);
        console.log(kupla);
        puhekuplat.push(kupla);
    });
}

function Puhekupla(msg, color, username) {
    this.user = username + ":  ";
    this.text = msg;
    this.color = color;
    this.x;
    this.y = height - scl;
    this.uw = textWidth(this.user);
    this.w = textWidth(this.text)+this.uw+scl;
    this.angle = 0;
    this.r = random(scl, width - (this.w+scl));

    this.show = function() {
        // näytä puhekupla
        var ang = radians(this.angle);
        this.x = this.r + (10 * cos(ang));
        noFill();
        strokeWeight(3);
        stroke(this.color, 30, 100);
        rect(this.x, this.y, this.w, scl, scl);
        // näytä käyttäjänimi ja viesti puhekuplan sisällä
        textStyle(BOLD);
        strokeWeight(0);
        fill(this.color, 80, 80);
        text(this.user, this.x+scl/2, this.y, width-this.x, scl);
        textStyle(NORMAL);
        fill(0);
        text(this.text, this.x + scl/2 + this.uw, this.y, width-this.x, scl);
    }

    this.update = function() {
        this.y -= 0.5;
        this.angle += 1.2;
    }
}

function draw() {
    background(255);
    for (var i = 0; i < puhekuplat.length; i++) {
        puhekuplat[i].show();
        puhekuplat[i].update();
    };
}
