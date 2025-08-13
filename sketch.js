let shapes = [];
let camZoom = 0;

// Enigmatic scale intervals in semitones: 0, 1, 4, 8, 11, 15, 18
let scaleIntervals = [0, 1, 4, 8, 11, 15, 18];
let baseNote = 261.63; // C4

let keysList = "ertyuisdfghjklxcvbnm".split("");

function getFreqRandomOctave(interval) {
  // Pick octave -2, -1, 0 relative to C4
  let octaveShift = random([-2, -1, 0]);
  return baseNote * pow(2, octaveShift) * pow(2, interval/12);
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  noStroke();
}

function draw() {
  background(0);

  for (let i = shapes.length - 1; i >= 0; i--) {
    let s = shapes[i];

    s.x += s.vx;
    s.y += s.vy;

    let freqOffset = sin(frameCount * 0.02 + s.offset) * 5;
    s.osc.freq(s.baseFreq + freqOffset);

    let level = s.amp.getLevel();
    let ampScale = map(level, 0, 0.3, 0.5, 2);

    let glow = sin(frameCount * 0.1 + s.offset) * 100 + 155;
    let redGlow = map(level, 0, 0.3, 0, 255);
    drawingContext.shadowBlur = 20;
    drawingContext.shadowColor = color(redGlow, 0, 0);

    fill(255, 255, 255, glow);
    ellipse(s.x, s.y, s.size * ampScale);

    stroke(255, 0, 0, 150);
    strokeWeight(1);
    noFill();
    ellipse(s.x, s.y, s.size * ampScale + 2);
    noStroke();

    s.opacity -= 1;
    if (s.opacity <= 0) {
      s.env.triggerRelease();
      s.osc.stop();
      shapes.splice(i, 1);
    }
  }
}

function keyPressed() {
  userStartAudio();

  let idx = keysList.indexOf(key.toLowerCase());
  if (idx === -1) return;

  let interval = scaleIntervals[idx % scaleIntervals.length];
  let freq = getFreqRandomOctave(interval);

  let osc = new p5.Oscillator('triangle');
  osc.freq(freq * random(0.98, 1.02)); // slight detune
  osc.start();

  let filter = new p5.LowPass();
  filter.freq(1500);
  filter.res(2);
  osc.disconnect();
  osc.connect(filter);

  let env = new p5.Envelope();
  env.setADSR(0.05, 0.1, 0.3, 0.7);
  env.setRange(0.4, 0);
  env.play(osc);

  let reverb = new p5.Reverb();
  reverb.process(osc, 2, 2); // shorter reverb

  let delay = new p5.Delay();
  delay.process(osc, 0.15, 0.3, 1200); // shorter delay

  let amp = new p5.Amplitude();
  amp.setInput(osc);

  shapes.push({
    x: random(width),
    y: random(height),
    vx: random(-1, 1),
    vy: random(-1, 1),
    baseFreq: freq,
    osc: osc,
    amp: amp,
    env: env,
    offset: random(TWO_PI),
    opacity: 255,
    size: random(40, 100)
  });
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
