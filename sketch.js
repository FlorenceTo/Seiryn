let shapes = [];
let keysUsed = 'drcfvtgbyhnujkm';
let baseNotes = [146.83, 164.81, 174.61, 185.00, 196.00, 207.65, 220.00, 233.08]; // D3, E3… no C
let reverb, delay;
let activeKeys = {};
let harmonyOsc = null;

function setup() {
  createCanvas(windowWidth, windowHeight);
  noStroke();
  reverb = new p5.Reverb();
  delay = new p5.Delay();
}

function draw() {
  background(0, 50);

  for (let i = shapes.length - 1; i >= 0; i--) {
    let s = shapes[i];

    s.x += s.vx;
    s.y += s.vy;

    for (let t of s.trail) {
      fill(255, t.opacity);
      if (s.type === 'circle') ellipse(t.x, t.y, s.size * t.scale);
      else rectMode(CENTER), rect(t.x, t.y, s.size * t.scale, s.size * t.scale);
      t.opacity -= 10;
    }
    s.trail.push({ x: s.x, y: s.y, opacity: 150, scale: random(0.5, 1.2) });
    if (s.trail.length > 20) s.trail.shift();

    fill(255);
    stroke(0, 255, 0, s.glow);
    strokeWeight(1);
    if (s.type === 'circle') ellipse(s.x, s.y, s.size);
    else rectMode(CENTER), rect(s.x, s.y, s.size, s.size);
    s.glow = max(0, s.glow - 5);

    s.opacity -= 5;
    if (s.opacity <= 0) {
      s.osc1.amp(0, 0.05);
      s.osc2.amp(0, 0.05);
      s.osc1.stop();
      s.osc2.stop();
      shapes.splice(i, 1);
    }
  }
}

function keyPressed() {
  userStartAudio();
  let k = key.toLowerCase();
  if (!keysUsed.includes(k)) return;

  if (!activeKeys[k]) {
    activeKeys[k] = true;

    let octaveMultiplier = pow(2, floor(random(3))); 
    let freqBase = random(baseNotes) * octaveMultiplier;

    let osc1 = new p5.Oscillator('triangle');
    osc1.freq(freqBase + random(-1,1));
    osc1.amp(0.3, 0.02);
    osc1.start();

    let osc2 = new p5.Oscillator('sine');
    osc2.freq(freqBase);
    osc2.amp(0.2, 0.02);
    osc2.start();

    reverb.process(osc1, 3.5, 2.5);
    reverb.process(osc2, 3.5, 2.5);
    delay.process(osc1, 0.3, 0.4, 500);
    delay.process(osc2, 0.3, 0.4, 500);

    let s = {
      x: random(width),
      y: random(height),
      vx: random(-1,1),
      vy: random(-1,1),
      size: random(30, 70),
      type: random(['circle','square']),
      osc1: osc1,
      osc2: osc2,
      opacity: 255,
      glow: 150,
      trail: [],
      key: k
    };
    shapes.push(s);

    checkHarmony();
  }
}

function keyReleased() {
  let k = key.toLowerCase();
  activeKeys[k] = false;
  checkHarmony();
}

function checkHarmony() {
  let circleKey = shapes.find(s => s.type === 'circle' && activeKeys[s.key]);
  let squareKey = shapes.find(s => s.type === 'square' && activeKeys[s.key]);

  if (circleKey && squareKey) {
    if (!harmonyOsc) {
      let highFreq = max(circleKey.osc1.freq().value(), squareKey.osc1.freq().value());
      harmonyOsc = new p5.Oscillator('triangle');
      harmonyOsc.freq([highFreq, highFreq*1.2599, highFreq*1.4983]);
      harmonyOsc.amp(0.3, 0.05);
      harmonyOsc.start();

      reverb.process(harmonyOsc, 3.5, 2.5);
      delay.process(harmonyOsc, 0.3, 0.4, 500);
    }
  } else {
    if (harmonyOsc) {
      harmonyOsc.amp(0, 0.2);
      harmonyOsc.stop(0.3);
      harmonyOsc = null;
    }
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
