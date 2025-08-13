let shapes = [];
let reverb;

let keyMap = {
  'A': { type: 'sphere', freq: 277.18, color: [255, 0, 0] },
  'B': { type: 'box',    freq: 329.63, color: [0, 255, 0] },
  'C': { type: 'sphere', freq: 369.99, color: [255, 255, 255] },
  'D': { type: 'box',    freq: 415.30, color: [200, 0, 0] },
  'E': { type: 'sphere', freq: 466.16, color: [0, 200, 0] },
  'F': { type: 'box',    freq: 493.88, color: [200, 200, 200] },
  'G': { type: 'sphere', freq: 523.25, color: [255, 0, 0] },
  'H': { type: 'box',    freq: 554.37, color: [0, 255, 0] },
  'I': { type: 'sphere', freq: 659.26, color: [255, 255, 255] },
  'J': { type: 'box',    freq: 739.99, color: [200, 0, 0] },
  'K': { type: 'sphere', freq: 830.61, color: [0, 200, 0] },
  'L': { type: 'box',    freq: 932.33, color: [200, 200, 200] },
  'M': { type: 'sphere', freq: 987.77, color: [255, 0, 0] },
  'N': { type: 'box',    freq: 1046.50, color: [0, 255, 0] },
  'O': { type: 'sphere', freq: 1108.73, color: [255, 255, 255] },
  'P': { type: 'box',    freq: 1318.51, color: [200, 0, 0] },
  'Q': { type: 'sphere', freq: 1479.98, color: [0, 200, 0] },
  'R': { type: 'box',    freq: 1661.22, color: [200, 200, 200] },
  'S': { type: 'sphere', freq: 1864.66, color: [255, 0, 0] },
  'T': { type: 'box',    freq: 1975.53, color: [0, 255, 0] },
  'U': { type: 'sphere', freq: 2093.00, color: [255, 255, 255] },
  'V': { type: 'box',    freq: 2217.46, color: [200, 0, 0] },
  'W': { type: 'sphere', freq: 2637.02, color: [0, 200, 0] },
  'X': { type: 'box',    freq: 2959.96, color: [200, 200, 200] },
  'Y': { type: 'sphere', freq: 3322.44, color: [255, 0, 0] },
  'Z': { type: 'box',    freq: 3729.31, color: [0, 255, 0] }
};

function setup() {
  createCanvas(windowWidth, windowHeight);
  noStroke();
  reverb = new p5.Reverb();
}

function draw() {
  background(0, 30); // slightly transparent for trails

  for (let i = shapes.length - 1; i >= 0; i--) {
    let s = shapes[i];

    s.x += s.vx;
    s.y += s.vy;

    // Pitch modulation
    let freqOffset = sin(frameCount * 0.01 + s.offset) * 30;
    s.osc.freq(s.baseFreq + freqOffset);

    // Smooth amplitude scaling
    let level = s.amp.getLevel();
    let ampScale = map(level, 0, 0.3, 0.5, 3);

    // Trail
    s.trail.push({x: s.x, y: s.y, opacity: 255});
    if (s.trail.length > 30) s.trail.shift();
    for (let t of s.trail) {
      fill(s.color[0], s.color[1], s.color[2], t.opacity);
      if (s.type === 'sphere') ellipse(t.x, t.y, 10 * ampScale);
      else rect(t.x, t.y, 10 * ampScale, 10 * ampScale);
      t.opacity -= 10;
    }

    // Shape fade out
    s.opacity -= 1;
    if (s.opacity <= 0) {
      s.osc.amp(0, 0.5);
      s.osc.stop();
      shapes.splice(i, 1);
      continue;
    }

    // Draw main shape
    fill(s.color[0], s.color[1], s.color[2], s.opacity);
    let size = map(s.baseFreq + freqOffset, 200, 4000, 30, 120) * ampScale;
    if (s.type === 'sphere') ellipse(s.x, s.y, size);
    else rect(s.x, s.y, size, size);
  }
}

function keyPressed() {
  userStartAudio();

  let k = key.toUpperCase();
  if (!keyMap[k]) return;

  let config = keyMap[k];

  let osc = new p5.Oscillator(config.type === 'sphere' ? 'triangle' : 'sine');
  osc.freq(config.freq);
  osc.start();
  osc.amp(0.5, 0.05);

  // Smooth reverb and delay for dreamy effect
  let delay = new p5.Delay();
  delay.process(osc, 0.4, 0.5, 2000);
  reverb.process(osc, 3, 2);

  let amp = new p5.Amplitude();
  amp.setInput(osc);

  let s = {
    x: random(width),
    y: random(height),
    vx: random(-1.5, 1.5),
    vy: random(-1.5, 1.5),
    type: config.type,
    baseFreq: config.freq,
    offset: random(TWO_PI),
    osc: osc,
    color: config.color,
    opacity: 255,
    trail: [],
    amp: amp
  };

  shapes.push(s);
}

function keyReleased() {
  for (let s of shapes) {
    s.osc.amp(0, 1); // smooth fade out
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
