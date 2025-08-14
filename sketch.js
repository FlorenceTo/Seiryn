let shapes = [];
let keyMap = 'drcfvtgbyhnujkm';
let freqs = [146.83, 164.81, 174.61, 185.00, 196.00, 207.65, 220.00]; // D3 to A#3
let pressedKeys = {};

function setup() {
  createCanvas(windowWidth, windowHeight);
}

function draw() {
  background(0); // clear frame

  for (let i = shapes.length - 1; i >= 0; i--) {
    let s = shapes[i];
    let lifeProgress = (millis() - s.startTime) / s.lifespan;

    if (lifeProgress >= 1) {
      s.osc.amp(0, 0.05);
      s.osc.stop(0.05);
      shapes.splice(i, 1);
      continue;
    }

    // Trail update
    s.trail.push({x: s.x, y: s.y, alpha: 255 * (1 - lifeProgress)});
    if (s.trail.length > 5) s.trail.shift();

    // Draw trail
    for (let t of s.trail) {
      let glow = sin(frameCount * 0.2) * 50 + 50;
      push();
      translate(t.x, t.y);
      stroke(255, 0, 0, glow * (t.alpha / 255));
      strokeWeight(1);
      fill(255, t.alpha * 0.4);
      if (s.type === 'circle') ellipse(0, 0, s.size * 0.5);
      else rectMode(CENTER), rect(0, 0, s.size * 0.5, s.size * 0.5);
      pop();
    }

    // Draw main shape
    let glow = sin(frameCount * 0.2) * 50 + 50;
    push();
    translate(s.x, s.y);
    stroke(255, 0, 0, glow);
    strokeWeight(1);
    fill(255, 255 * (1 - lifeProgress));
    if (s.type === 'circle') ellipse(0, 0, s.size * (1 - lifeProgress));
    else rectMode(CENTER), rect(0, 0, s.size * (1 - lifeProgress), s.size * (1 - lifeProgress));
    pop();
  }
}

function keyPressed() {
  let k = key.toLowerCase();
  if (!keyMap.includes(k) || pressedKeys[k]) return;

  pressedKeys[k] = true;

  let x = random(100, width-100);
  let y = random(100, height-100);
  let type = random(['circle','square']);
  let osc = new p5.Oscillator('triangle');
  let baseFreq = random(freqs);
  let octaveShift = random([0, 12]);
  osc.freq(baseFreq * pow(2, octaveShift/12) + random(-1,1));
  osc.amp(0);
  osc.start();

  // Pluck envelope
  let env = new p5.Envelope();
  env.setADSR(0.001, 0.1, 0.2, 0.2);
  env.setRange(0.5, 0);
  env.play(osc);

  shapes.push({
    x, y, size: random(40, 80), type,
    osc, env,
    trail: [],
    startTime: millis(),
    lifespan: 500
  });

  // Check harmony chord if circle+square pressed together
  let other = shapes.find(s => s.type !== type);
  if (other) {
    let chordOsc = new p5.Oscillator('triangle');
    let highFreq = max(baseFreq, other.osc.freq().value());
    chordOsc.freq(highFreq);
    chordOsc.amp(0.3);
    chordOsc.start();
    setTimeout(() => chordOsc.stop(), 500);
  }
}

function keyReleased() {
  let k = key.toLowerCase();
  if (pressedKeys[k]) delete pressedKeys[k];
}
