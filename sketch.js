let shapes = [];
let keyMap = {};
let scaleNotes = [130.81, 138.59, 164.81, 185.00, 207.65, 233.08, 246.94, 261.63];
let letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
let audioUnlocked = false;

for (let i = 0; i < letters.length; i++) {
  keyMap[letters[i]] = {
    type: i % 2 === 0 ? 'circle' : 'square',
    color: [random([0,128,255]), random([0,128,255]), random([0,128,255])],
    baseFreq: scaleNotes[i % scaleNotes.length]
  };
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  noStroke();
  textAlign(CENTER, CENTER);
  fill(255);
  textSize(24);
}

function draw() {
  background(0, 20);

  if (!audioUnlocked) {
    text('Click anywhere to start', width/2, height/2);
    return;
  }

  for (let i = shapes.length - 1; i >= 0; i--) {
    let s = shapes[i];

    s.x += s.vx;
    s.y += s.vy;

    let freqOffset = sin(frameCount * 0.01 + s.offset) * 10;
    if (s.osc) s.osc.freq(s.baseFreq + freqOffset);

    let ampScale = s.osc ? map(s.amp.getLevel(), 0, 0.3, 0.5, 2) : 1;

    s.trail.push({ x: s.x, y: s.y, opacity: 255 });
    if (s.trail.length > 20) s.trail.shift();
    for (let t of s.trail) {
      fill(s.color[0], s.color[1], s.color[2], t.opacity);
      if (s.type === 'circle') ellipse(t.x, t.y, 20 * ampScale);
      else rect(t.x - 10 * ampScale, t.y - 10 * ampScale, 20 * ampScale, 20 * ampScale);
      t.opacity *= 0.85;
    }

    for (let j = s.particles.length - 1; j >= 0; j--) {
      let p = s.particles[j];
      p.x += p.vx * ampScale;
      p.y += p.vy * ampScale;
      p.opacity *= 0.85;
      if (p.opacity < 1) s.particles.splice(j, 1);
      else {
        fill(p.color[0], p.color[1], p.color[2], p.opacity);
        ellipse(p.x, p.y, p.size * ampScale);
      }
    }

    let size = map(s.baseFreq + freqOffset, 130, 262, 30, 80) * ampScale;
    fill(s.color[0], s.color[1], s.color[2], s.opacity);
    if (s.type === 'circle') ellipse(s.x, s.y, size);
    else rect(s.x - size/2, s.y - size/2, size, size);

    s.opacity *= 0.97;
    if (s.opacity < 1) {
      if (s.osc) {
        s.osc.amp(0, 1.0, 'expo');
        s.osc.stop(1.0);
      }
      shapes.splice(i, 1);
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

  let config = keyMap[k];
  let osc = new p5.Oscillator(config.type === 'circle' ? 'triangle' : 'sine');
  osc.freq(config.baseFreq);
  osc.start();
  osc.amp(0.5, 0.1);

  let delay = new p5.Delay();
  delay.process(osc, 0.4, 0.6, 2000);

  let reverb = new p5.Reverb();
  reverb.process(osc, 4, 2.5);

  let amp = new p5.Amplitude();
  amp.setInput(osc);

  let s = {
    x: random(width),
    y: random(height),
    vx: random(-1, 1),
    vy: random(-1, 1),
    type: config.type,
    baseFreq: config.baseFreq,
    osc: osc,
    color: config.color,
    opacity: 255,
    trail: [],
    particles: [],
    amp: amp,
    offset: random(TWO_PI)
  };

  for (let i = 0; i < 10; i++) {
    s.particles.push({
      x: s.x, y: s.y,
      vx: random(-2, 2), vy: random(-2, 2),
      size: random(5, 15),
      opacity: 255,
      color: s.color
    });
  }

  shapes.push(s);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
