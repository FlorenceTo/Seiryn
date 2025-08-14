let shapes = [];
let keyMap = {};
let keys = 'esxcdrfvtgbhynjuiklm';
let baseFreqs = [146.83, 164.81, 174.61, 185.00, 196.00, 220.00, 246.94]; // D3, E3, F3, G3, A3, B3, C4 removed C
let octaves = [1, 2, 3]; // multiply baseFreq by 2^octave for higher octaves

function setup() {
  createCanvas(windowWidth, windowHeight);
  noStroke();

  // Map keys to shapes and frequencies
  for (let i = 0; i < keys.length; i++) {
    let type = (i % 2 === 0) ? 'circle' : 'square';
    let octave = octaves[i % octaves.length];
    keyMap[keys[i]] = {
      type: type,
      freq: baseFreqs[i % baseFreqs.length] * octave,
    };
  }
}

function draw() {
  background(0);

  for (let i = shapes.length - 1; i >= 0; i--) {
    let s = shapes[i];

    // fade shapes faster
    s.opacity -= 5;
    if (s.opacity <= 0) {
      s.osc.amp(0, 0.1);
      s.osc.stop(0.1);
      shapes.splice(i, 1);
      continue;
    }

    // update glow
    s.glow = max(0, s.glow - 5);

    // draw shape
    fill(255, s.opacity); // white
    stroke(0, 255, 0, s.glow); // green glow
    strokeWeight(1);

    if (s.type === 'circle') ellipse(s.x, s.y, s.size);
    else rectMode(CENTER), rect(s.x, s.y, s.size, s.size);
  }
}

function keyPressed() {
  userStartAudio();
  let k = key.toLowerCase();
  if (!keyMap[k]) return;

  let config = keyMap[k];

  let osc = new p5.Oscillator('triangle');
  osc.freq(config.freq + random(-2, 2)); // slight pitch wobble
  osc.start();
  osc.amp(0.5, 0.05);

  let reverb = new p5.Reverb();
  reverb.process(osc, 3, 2); // dreamy reverb

  let s = {
    x: random(width * 0.2, width * 0.8),
    y: random(height * 0.2, height * 0.8),
    type: config.type,
    size: random(40, 80),
    osc: osc,
    opacity: 255,
    glow: 255
  };

  shapes.push(s);
}
