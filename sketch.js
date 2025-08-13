function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
}

function draw() {
  background(0);
  push();
  fill(255, 0, 0);
  sphere(100);
  pop();
}
