let sphereOsc, boxOsc;
let shapes = [];

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  noStroke();
}

function draw() {
  background(0);

  // rotate whole scene slowly
  rotateY(frameCount * 0.002);

  for (let s of shapes) {
    push();
    translate(s.x, s.y, s.z);

    // shape reacts to frequency by changing size
    let size = map(s.freq, 100, 1000, 50, 200);

    if (s.type === 'sphere') {
      fill(0, 200, 255);
      sphere(size);
    } else if (s.type === 'box') {
      fill(255, 150, 0);
      box(size);
    }
    pop();
  }
}

function keyPressed() {
  userStartAudio(); // must be first for audio to work
  let freq = random(200, 800); // random pitch for demo

  let type = random() < 0.5 ? 'sphere' : 'box';
  let osc = new p5.Oscillator(type === 'sphere' ? 'triangle' : 'sine');
  osc.freq(freq);
  osc.start();
  osc.amp(0.5, 0.05);

  // add delay feedback
  let delay = new p5.Delay();
  delay.process(osc, 0.2, 0.5, 2300);

  // store shape with oscillator
  shapes.push({x: random(-width/2, width/2), y: random(-height/2, height/2), z: random(-500,500), type: type, osc: osc, freq: freq});
}

function keyReleased() {
  // fade out oscillator of the last shape
  if (shapes.length > 0) {
    let s = shapes[shapes.length-1];
    s.osc.amp(0, 0.5);
    s.osc.stop(0.5);
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
