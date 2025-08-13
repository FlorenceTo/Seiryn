let shapes = [];
let camZoom = 0;

let keyMap = {
  'A': { type: 'sphere', freq: 600, color: [255, 0, 0] },
  'S': { type: 'box', freq: 300, color: [0, 255, 0] },
  'D': { type: 'sphere', freq: 700, color: [255, 255, 255] },
  'F': { type: 'box', freq: 350, color: [200, 0, 0] },
  'G': { type: 'sphere', freq: 650, color: [0, 200, 0] },
  'H': { type: 'box', freq: 250, color: [200, 200, 200] }
};

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  noStroke();
  textAlign(CENTER, CENTER);
  textSize(32);
}

function draw() {
  background(0);
  orbitControl(); // allow mouse drag

  // Draw shapes
  for (let i = shapes.length - 1; i >= 0; i--) {
    let s = shapes[i];

    s.x += s.vx;
    s.y += s.vy;
    s.z += s.vz;

    // Size based on oscillator frequency
    let freqOffset = sin(frameCount * 0.01 + s.offset) * 100;
    if (s.osc) s.osc.freq(s.baseFreq + freqOffset);
    let size = map(s.baseFreq + freqOffset, 200, 900, 50, 150);

    push();
    translate(s.x, s.y, s.z);
    fill(...s.color, s.opacity);
    if (s.type === 'sphere') sphere(size);
    else box(size);
    pop();

    // Fade out
    s.opacity -= 1;
    if (s.opacity <= 0) {
      if (s.osc) s.osc.stop();
      shapes.splice(i, 1);
    }
  }

  // Instruction text
  push();
  translate(0, -height/2 + 50, 0);
  fill(255);
  text("Press A,S,D,F,G,H to create shapes", 0, 0);
  pop();
}

function keyPressed() {
  let k = key.toUpperCase();
  if (!keyMap[k]) return;

  userStartAudio(); // must start audio on user gesture
  let config = keyMap[k];

  let oscType = config.type === 'sphere' ? 'triangle' : 'sine';
  let osc = new p5.Oscillator(oscType);
  osc.freq(config.freq);
  osc.amp(0.5, 0.05);
  osc.start();

  let s = {
    x: random(-width/2, width/2),
    y: random(-height/2, height/2),
    z: random(-500, 500),
    vx: random(-1, 1),
    vy: random(-1, 1),
    vz: random(-1, 1),
    type: config.type,
    baseFreq: config.freq,
    offset: random(TWO_PI),
    osc: osc,
    color: config.color,
    opacity: 255
  };

  shapes.push(s);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
