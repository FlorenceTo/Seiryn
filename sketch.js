let shapes = [];

let keyMap = {
  'A': { type: 'circle', freq: 261.63, color: [255,0,0] },
  'S': { type: 'square', freq: 293.66, color: [0,255,0] },
  'D': { type: 'circle', freq: 329.63, color: [255,255,255] },
  'F': { type: 'square', freq: 349.23, color: [200,0,0] },
  'G': { type: 'circle', freq: 392.00, color: [0,200,0] },
  'H': { type: 'square', freq: 440.00, color: [200,200,200] }
};

function setup() {
  createCanvas(windowWidth, windowHeight);
  noStroke();
}

function draw() {
  background(0, 20);

  for (let i = shapes.length - 1; i >= 0; i--) {
    let s = shapes[i];

    // Move shape
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

    // Update opacity and remove if done
    s.opacity *= 0.97;
    if (s.opacity < 1) {
      s.osc.amp(0, 0.5);
      s.osc.stop(0.5);
      shapes.splice(i,1);
    }
  }
}

function keyPressed() {
  userStartAudio();

  let k = key.toUpperCase();
  if (!keyMap[k]) return;

  let cfg = keyMap[k];

  let oscType = cfg.type === 'circle' ? 'triangle' : 'sine';
  let osc = new p5.Oscillator(oscType);
  osc.freq(cfg.freq);
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
