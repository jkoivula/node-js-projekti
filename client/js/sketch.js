var socket;
var puhekuplat = [];
var scl = 35; // puhekuplien padding

function setup() {
    var canvas = createCanvas(600, 500);
    canvas.parent("myCanvas");
    textAlign(LEFT, CENTER);
    textSize(18);
    textStyle(NORMAL);
    colorMode(HSB, 100, 100, 100);
    socket.on('chat message', function(data) {
        var kupla = new Puhekupla(data.message, data.color, data.username);
        console.log(kupla);
        puhekuplat.push(kupla);
    });
}

function Puhekupla(msg, color, username) {
    this.text = username + ": "+msg;
    this.color = color;
    this.x;
    this.y = height - scl;
    this.w = textWidth(this.text)+scl;
    this.angle = 0;
    this.r = random(scl, width - this.w);

    this.show = function() {
        var ang = radians(this.angle);
        this.x = this.r + (10 * cos(ang));
        strokeWeight(0);
        stroke(this.color, 30, 99);
        fill(0);
        text(this.text, this.x+scl/2, this.y, width-this.x, scl);
        noFill();
        strokeWeight(3);
        rect(this.x, this.y, this.w, scl, scl);
    }

    this.update = function() {
        this.y -= 0.5;
        //this.x += random(-5,5);
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
