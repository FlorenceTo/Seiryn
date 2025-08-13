let sounds = {};
let shapes = [];
let activeKeys = {};

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  textAlign(CENTER, CENTER);
  background(0);

  // Prepare sounds for two shapes
  sounds['A'] = createOscSound('triangle'); // Circle
  sounds['S'] = createOscSound('square');   // Square
}

function draw() {
  background(0);

  // Draw all shapes
  for (let i = shapes.length - 1; i >= 0; i--) {
    let s = shapes[i];

    push();
    translate(s.x, s.y, s.z);
    rotateX(s.rotX);
    rotateY(s.rotY);
    rotateZ(s.rotZ);
    fill(s.color[0], s.color[1], s.color[2], s.alpha);

    if (s.type === 'circle') {
      sphere(s.size);
    } else if (s.type === 'square') {
      box(s.size);
    }
    pop();

    // Rotate shapes
    s.rotX += s.speedX;
    s.rotY += s.speedY;
    s.rotZ += s.speedZ;

    // Fade out
    s.alpha -= 2;
    if (s.alpha <= 0) {
      shapes.splice(i, 1);
    }
  }
}

function keyPressed() {
  userStartAudio(); // ensure audio context is active

  if (!activeKeys[key]) {
    activeKeys[key] = true;

    if (sounds[key]) {
      let s = sounds[key];
      let freq = random(100, 800); // Random pitch
      s.osc.freq(freq);
      s.env.play(s.osc);

      // Map pitch to size (low = bigger)
      let size = map(freq, 100, 800, 200, 50);

      // Create new shape
      shapes.push({
        x: random(-width / 2, width / 2),
        y: random(-height / 2, height / 2),
        z: random(-300, 300), // keep objects closer
        type: key === 'A' ? 'circle' : 'square',
        size: size,
        color: [random(150, 255), random(150, 255), random(150, 255)],
        rotX: random(TWO_PI),
        rotY: random(TWO_PI),
        rotZ: random(TWO_PI),
        speedX: random(-0.01, 0.01),
        speedY: random(-0.01, 0.01),
        speedZ: random(-0.01, 0.01),
        alpha: 255
      });
    }
  }
}

function keyReleased() {
  if (activeKeys[key]) {
    delete activeKeys[key];
  }
}

function createOscSound(type) {
  let osc = new p5.Oscillator(type);
  osc.start();
  osc.amp(0);
  let env = new p5.Envelope();
  env.setADSR(0.001, 0.1, 0, 0.2);
  env.setRange(0.5, 0);
  return { osc, env };
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
