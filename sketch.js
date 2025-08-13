let shapes = [];
let audioUnlocked = false;
let keyMap = {};
let scaleNotes = [130.81, 138.59, 164.81, 185.00, 207.65, 233.08, 246.94, 261.63];
let letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

function setup() {
  createCanvas(windowWidth, windowHeight);
  noStroke();
  textAlign(CENTER, CENTER);
  textSize(24);

  // Map letters to shapes and colors
  for (let i = 0; i < letters.length; i++) {
    keyMap[letters[i]] = {
      type: i % 2 === 0 ? 'circle' : 'square',
      baseFreq: scaleNotes[i % scaleNotes.length],
      color: [random(50,255), random(50,255), random(50,255)]
    };
  }
}

function draw() {
  background(0, 20);

  if (!audioUnlocked) {
    fill(255);
    text('Click to start', width/2, height/2);
    return;
  }

  // Draw and update shapes
  for (let i = shapes.length - 1; i >= 0; i--) {
    let s = shapes[i];
    s.x += s.vx;
    s.y += s.vy;

    // Draw trail
    for (let t of s.trail) {
      fill(s.color[0], s.color[1], s.color[2], t.opacity);
      if (s.type === 'circle') ellipse(t.x, t.y, 20);
      else rect(t.x-10, t.y-10, 20, 20);
      t.opacity *= 0.9;
    }

    // Draw main shape
    fill(s.color[0], s.color[1], s.color[2], s.opacity);
    if (s.type === 'circle') ellipse(s.x, s.y, 30);
    else rect(s.x-15, s.y-15, 30, 30);

    // Update opacity
    s.opacity *= 0.97;
    if (s.opacity < 1) {
      s.osc.amp(0, 1);
      s.osc.stop(1);
      shapes.splice(i,1);
    }
  }
}

function mousePressed() {
  if (!audioUnlocked) {
    userStartAudio();
    audioUnlocked = true;
  }
}

function keyPressed() {
  if (!audioUnlocked) return;
  let k = key.toUpperCase();
  if (!keyMap[k]) return;

  let cfg = keyMap[k];
  let osc = new p5.Oscillator('sine');
  osc.freq(cfg.baseFreq);
  osc.start();
  osc.amp(0.5, 0.1);

  let s = {
    x: random(width),
    y: random(height),
    vx: random(-2,2),
    vy: random(-2,2),
    type: cfg.type,
    color: cfg.color,
    opacity: 255,
    trail: [{x: random(width), y: random(height), opacity:255}],
    osc: osc
  };

  shapes.push(s);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
