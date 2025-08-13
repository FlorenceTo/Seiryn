let circleShape;
let osc;

function setup() {
  createCanvas(windowWidth, windowHeight);
  noStroke();
}

function draw() {
  background(0);

  if (circleShape) {
    fill(0, 255, 0);
    ellipse(circleShape.x, circleShape.y, 100);
  }
}

function keyPressed() {
  userStartAudio();

  circleShape = {
    x: width / 2,
    y: height / 2
  };

  osc = new p5.Oscillator('sine');
  osc.freq(440);
  osc.start();
  osc.amp(0.5, 0.1); // fade in
}

function keyReleased() {
  if (osc) {
    osc.amp(0, 0.5); // fade out
    osc.stop(0.5);
  }
}
