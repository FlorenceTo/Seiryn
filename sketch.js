let osc;
let sphereSize = 100;

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  noStroke();
}

function draw() {
  background(0);

  // rotate the shape slowly
  rotateY(frameCount * 0.01);
  rotateX(frameCount * 0.005);

  fill(0, 200, 255);
  sphere(sphereSize);
}

function keyPressed() {
  // must start audio on user interaction
  userStartAudio();

  if (!osc) {
    osc = new p5.Oscillator('triangle');
    osc.freq(440);
    osc.start();
    osc.amp(0.5, 0.05);
  }

  // increase sphere size when key is pressed
  sphereSize = random(50, 200);
}

function keyReleased() {
  if (osc) {
    osc.amp(0, 0.5);
    osc.stop(0.5);
    osc = null;
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
