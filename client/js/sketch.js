var socket;
var puhekuplat = [];

function setup() {
    var canvas = createCanvas(600, 500);
    canvas.parent("myCanvas");
    textAlign(CENTER, CENTER);
    rectMode(CENTER);
    textSize(18);
    textStyle(NORMAL);

    socket.on('chat message', function(data) {
        var kupla = new Puhekupla(data.message, data.color);
        console.log(kupla);
        puhekuplat.push(kupla);
    });
}

function Puhekupla(msg, color) {
    this.text = msg;
    this.color = color;
    this.w = textWidth(this.text) + 40;
    this.h = 40;
    this.x = random(this.w/2+20, width-this.w);
    this.y = height - this.h;

    this.show = function() {
        strokeWeight(0);
        stroke(color);
        fill(0);
        text(this.text, this.x, this.y);
        noFill();
        strokeWeight(3);
        rect(this.x, this.y, this.w, this.h, 20);
    }

    this.update = function() {
        this.y -= 1;
    }

}

function draw() {
    background(255);
    for (var i = 0; i < puhekuplat.length; i++) {
        puhekuplat[i].show();
        puhekuplat[i].update();
    };
}