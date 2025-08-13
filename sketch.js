let shapes = [];
let keysAllowed = 'ertyuisdfghjklxcvbnm';
let scaleFreqs = [130.81, 138.59, 164.81, 185.00, 207.65, 233.08, 246.94]; // C enigmatic scale, one octave down

function setup() {
  createCanvas(windowWidth, windowHeight);
  noStroke();
}

function draw() {
  background(0, 50); // slight trail effect

  // Move and draw shapes
  for (let s of shapes) {
    s.x += s.vx;
    s.y += s.vy;

    // Bounce off walls
    if (s.x < 0 || s.x > width) s.vx *= -1;
    if (s.y < 0 || s.y > height) s.vy *= -1;

    // Draw glow
    fill(255, s.glow);
    ellipse(s.x, s.y, s.size);
    if (s.type === 'square') rectMode(CENTER), rect(s.x, s.y, s.size, s.size);

    // Fade glow
    s.glow = max(s.glow - 5, 0);
  }

  // Check collisions
  for (let i = 0; i < shapes.length; i++) {
    for (let j = i + 1; j < shapes.length; j++) {
      let a = shapes[i];
      let b = shapes[j];
      let d = dist(a.x, a.y, b.x, b.y);
      if (d < (a.size + b.size) / 2) {
        // Collision: trigger glow
        a.glow = 255;
        b.glow = 255;
        if (!a.collided) playPluck(a, -2); // shift 2 octaves down
        if (!b.collided) playPluck(b, -2);
        a.collided = true;
        b.collided = true;
      } else {
        a.collided = false;
        b.collided = false;
      }
    }
  }
}

function keyPressed() {
  userStartAudio();
  let k = key.toLowerCase();
  if (!keysAllowed.includes(k)) return;

  let type = random(['circle','square']);
  let freq = random(scaleFreqs) * (random([1,2])); // random octave

  let shape = {
    x: random(width),
    y: random(height),
    vx: random(-2,2),
    vy: random(-2,2),
    size: random(30, 60),
    type: type,
    glow: 0,
    collided: false
  };

  playPluck(shape, 0, freq);
  shapes.push(shape);
}

function playPluck(shape, octaveShift = 0, customFreq = null) {
  let osc = new p5.Oscillator('triangle');
  let freq = customFreq || random(scaleFreqs);
  freq *= pow(2, octaveShift);

  let env = new p5.Envelope();
  env.setADSR(0.01, 0.15, 0.2, 0.2);
  env.setRange(0.3, 0);

  osc.freq(freq);
  osc.start();
  env.play(osc);
  setTimeout(() => osc.stop(), 400); // stop oscillator after envelope
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
