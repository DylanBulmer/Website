var rotationY = 2.5;

function setup() {
    let canvas = createCanvas(240, 240, WEBGL);
    canvas.parent('logo');
    img = loadImage("images/map.png");
}

function draw() {
    background(0,0,0,0);
    rotateY(rotationY * 0.1);
    texture(img);
    sphere(100);
    rotationY += 0.025;
}