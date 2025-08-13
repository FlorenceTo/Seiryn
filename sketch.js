let shapes = [];
let scaleNotes = [130.81, 138.59, 164.81, 185.00, 207.65, 233.08, 246.94, 261.63]; // C, Db, E, F#, G#, A#, B, C (one octave down)
let colors = [
  [255, 0, 0],
  [0, 255, 0],
  [255, 255, 255]
];
let keyMap = {};
let letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

// Map all 26 letters to shapes, alternating circle/square and cycling scale/colors
for (let i = 0; i < letters.length; i++) {
  keyMap[letters[i]] = {
    type: i % 2 === 0 ? 'circle' : 'square',
    baseFreq: scaleNotes[i % scaleNotes.length],
    color: colors[i % colors.length]
  };
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  noStroke();
}

function draw() {
  background(0);

  for (let i = shapes.length - 1; i >= 0; i--) {
    let s = shapes[i];

    // Move shapes
    s.x += s.vx;
    s.y += s.vy;

    // Pitch modulation
    let freqOffset = sin(frameCount * 0.01 + s.offset) * 20;
    s.osc.freq(s.baseFreq + freqOffset);

    // Update amplitude for size
    let level = s.amp.getLevel();
    let ampScale = map(level, 0, 0.3, 0.5, 2);

    // Shape trail
    s.trail.push({ x: s.x, y: s.y, opacity: 255 });
    if (s.trail.length > 20) s.trail.shift();
    for (let t of s.trail) {
      push();
      translate(t.x, t.y);
      fill(s.color[0], s.color[1], s.color[2], t.opacity);
      if (s.type === 'circle') ellipse(0, 0, 20 * ampScale);
      else rectMode(CENTER), rect(0, 0, 20 * ampScale, 20 * ampScale);
      pop();
      t.opacity -= 15;
    }

    // Fade out
    s.opacity -= 0.5;
    if (s.opacity <= 0) {
      s.osc.amp(0, 0.5);
      s.osc.stop(0.5);
      shapes.splice(i, 1);
      continue;
    }

    // Draw main shape
    push();
    translate(s.x, s.y);
    fill(s.color[0], s.color[1], s.color[2], s.opacity);
    let size = map(s.baseFreq + freqOffset, 130, 270, 30, 100);
    if (s.type === 'circle') ellipse(0, 0, size * ampScale);
    else rectMode(CENTER), rect(0, 0, size * ampScale, size * ampScale);
    pop();
  }
}

function keyPressed() {
  userStartAudio();
  let k = key.toUpperCase();
  if (!/[A-Z]/.test(k)) return;
  if (!keyMap[k]) return;
  let config = keyMap[k];

  let osc = new p5.Oscillator(config.type === 'circle' ? 'triangle' : 'square');
  osc.freq(config.baseFreq);
  osc.amp(0.5, 0.05);
  osc.start();

  let delay = new p5.Delay();
  delay.process(osc, 0.3, 0.5, 2000);

  let reverb = new p5.Reverb();
  reverb.process(osc, 2, 3);

  let amp = new p5.Amplitude();
  amp.setInput(osc);

  let s = {
    x: random(width),
    y: random(height),
    vx: random(-1, 1),
    vy: random(-1, 1),
    type: config.type,
    baseFreq: config.baseFreq,
    offset: random(TWO_PI),
    osc: osc,
    color: config.color,
    opacity: 255,
    trail: [],
    amp: amp
  };

  shapes.push(s);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
