let shapes = [];
let keyMap = {};
let scaleFreqs = [261.63, 277.18, 329.63, 369.99, 415.30, 466.16, 493.88]; // C, Db, E, F#, G#, A#, B

function setup() {
  createCanvas(windowWidth, windowHeight);
  noStroke();
  textAlign(CENTER, CENTER);
  textSize(32);

  // Map all 26 keys to the scale over 2 octaves
  let keys = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  for (let i = 0; i < keys.length; i++) {
    let octave = i < 7 ? 1 : i < 14 ? 2 : 3;
    keyMap[keys[i]] = scaleFreqs[i % scaleFreqs.length] / Math.pow(2, 1 - octave);
  }
}

function draw() {
  background(0);

  for (let i = shapes.length - 1; i >= 0; i--) {
    let s = shapes[i];

    // Move shapes
    s.x += s.vx;
    s.y += s.vy;

    // Update amplitude
    let level = s.amp.getLevel();
    let ampScale = map(level, 0, 0.3, 0.5, 2);

    // Shape trail
    s.trail.push({x: s.x, y: s.y, opacity: 255});
    if (s.trail.length > 30) s.trail.shift();
    for (let t of s.trail) {
      fill(255, t.opacity);
      ellipse(t.x, t.y, 20 * ampScale);
      t.opacity -= 8;
    }

    // Glow pulse
    if (s.glow > 0) {
      fill(255, 50, 50, s.glow); // subtle red glow
      ellipse(s.x, s.y, 30 * ampScale);
      s.glow *= 0.95;
    }

    // Shape fade out
    s.opacity -= 1;
    if (s.opacity <= 0) {
      s.osc.amp(0, 0.5);
      s.osc.stop(0.5);
      shapes.splice(i, 1);
      continue;
    }

    // Draw main shape
    fill(255, s.opacity);
    ellipse(s.x, s.y, 30 * ampScale);
  }
}

function keyPressed() {
  userStartAudio();
  let k = key.toUpperCase();
  if (!keyMap[k]) return;

  let freq = keyMap[k];
  let osc = new p5.Oscillator('triangle');
  osc.freq(freq);
  osc.start();
  osc.amp(0.3, 0.1);

  let amp = new p5.Amplitude();
  amp.setInput(osc);

  let s = {
    x: random(width),
    y: random(height),
    vx: random(-2, 2),
    vy: random(-2, 2),
    osc: osc,
    amp: amp,
    opacity: 255,
    trail: [],
    glow: 150
  };

  shapes.push(s);
}

function keyReleased() {
  if (shapes.length > 0) {
    let s = shapes[shapes.length - 1];
    s.osc.amp(0, 0.5);
    s.osc.stop(0.5);
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
