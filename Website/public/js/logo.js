var rotationY = 2.5;

function setup() {
    let canvas = createCanvas(200, 200, WEBGL);
    canvas.parent('logo');
    img = loadImage("images/map.png");
}

function draw() {
    background(0,0,0,0);
    rotateY(rotationY * 0.1);
    texture(img);
    sphere(75);
    rotationY += 0.025;
}