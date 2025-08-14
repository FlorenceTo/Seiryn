let shapes = [];
let keyMap = {};
let keys = 'esxcdrfvtgbhynjuiklm';
let baseFreqs = [146.83, 164.81, 174.61, 185.00, 196.00, 220.00, 246.94]; // D3, E3, F3, G3, A3, B3
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

    // faster fade and softer glow
    s.opacity -= 8; 
    s.glow -= 6; 

    if (s.opacity <= 0) {
      s.osc.amp(0, 0.05);
      s.osc.stop(0.05);
      shapes.splice(i, 1);
      continue;
    }

    fill(255, s.opacity * 0.5); // softer white
    stroke(0, 255, 0, s.glow * 0.3); // very subtle green glow
    strokeWeight(0.8);

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
  osc.freq(config.freq + random(-1, 1)); // very subtle pitch wobble
  osc.start();
  osc.amp(0.4, 0.03);

  let reverb = new p5.Reverb();
  reverb.process(osc, 2, 1.5); // softer, dreamy reverb

  let s = {
    x: random(width * 0.3, width * 0.7),
    y: random(height * 0.3, height * 0.7),
    type: config.type,
    size: random(40, 70),
    osc: osc,
    opacity: 180,
    glow: 180
  };

  shapes.push(s);
}
