let shapes = [];
let keyMap = {};
let notes = [261.63, 277.18, 329.63, 369.99, 415.30, 466.16, 493.88]; // Enigmatic scale, one octave
let keysList = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

function setup() {
  createCanvas(windowWidth, windowHeight);
  noStroke();
  textAlign(CENTER, CENTER);
  textSize(32);

  // Map all 26 keys to the scale, cycling over 3 octaves
  for (let i = 0; i < keysList.length; i++) {
    let octave = floor(i / notes.length);
    keyMap[keysList[i]] = notes[i % notes.length] * pow(2, -1 + octave); // one octave down
  }
}

function draw() {
  background(0, 50); // slight fade for trails

  for (let i = shapes.length - 1; i >= 0; i--) {
    let s = shapes[i];

    // Move shape
    s.x += s.vx;
    s.y += s.vy;

    // Trail
    s.trail.push({x: s.x, y: s.y, opacity: s.opacity});
    if (s.trail.length > 20) s.trail.shift();

    for (let t of s.trail) {
      fill(255, t.opacity);
      if (s.type === 'circle') ellipse(t.x, t.y, s.size*0.7);
      else rect(t.x, t.y, s.size*0.7, s.size*0.7);
      t.opacity -= 5;
    }

    // Glow pulse
    if (s.glow > 0) {
      fill(255, 50, 50, s.glow);
      if (s.type === 'circle') ellipse(s.x, s.y, s.size*1.2);
      else rect(s.x - s.size*0.1, s.y - s.size*0.1, s.size*1.2, s.size*1.2);
      s.glow -= 5;
    }

    // Main shape
    fill(255, s.opacity);
    if (s.type === 'circle') ellipse(s.x, s.y, s.size);
    else rect(s.x, s.y, s.size, s.size);

    // Fade
    s.opacity -= 0.5;
    if (s.opacity <= 0) {
      s.osc.amp(0, 0.5);
      s.osc.stop();
      shapes.splice(i, 1);
    }
  }
}

function keyPressed() {
  userStartAudio();

  let k = key.toUpperCase();
  if (!keyMap[k]) return;

  let freq = keyMap[k];
  let oscType = random(['triangle','sine']);
  let osc = new p5.Oscillator(oscType);
  osc.freq(freq);
  osc.start();
  osc.amp(0.4, 0.05); // smooth fade-in

  // Delay & Reverb
  let delay = new p5.Delay();
  delay.process(osc, 0.3, 0.4, 2000);
  let reverb = new p5.Reverb();
  reverb.process(osc, 2, 1); 

  let s = {
    x: random(width), 
    y: random(height), 
    vx: random(-1,1), 
    vy: random(-1,1),
    size: random(30,60),
    type: random(['circle','square']),
    osc: osc,
    trail: [],
    glow: 100,
    opacity: 255
  };
  shapes.push(s);
}

function keyReleased() {
  if (shapes.length > 0) {
    let s = shapes[shapes.length - 1];
    s.osc.amp(0, 0.8); // smooth fade-out
    s.osc.stop(0.8);
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
