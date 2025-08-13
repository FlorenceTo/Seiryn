let shapes = [];

// Map all 26 keys to shapes, base frequency, and color
let keyMap = {};
let letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
for (let i = 0; i < letters.length; i++) {
  keyMap[letters[i]] = {
    type: i % 2 === 0 ? 'circle' : 'square',
    freq: 200 + i * 25,
    color: i % 3 === 0 ? [255, 0, 0] : (i % 3 === 1 ? [0, 255, 0] : [255, 255, 255])
  };
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  noStroke();
  textAlign(CENTER, CENTER);
}

function draw() {
  background(0, 30); // Slight transparency to keep trails

  for (let i = shapes.length - 1; i >= 0; i--) {
    let s = shapes[i];

    // Move shapes
    s.x += s.vx;
    s.y += s.vy;

    // Bounce off edges
    if (s.x < 0 || s.x > width) s.vx *= -1;
    if (s.y < 0 || s.y > height) s.vy *= -1;

    // Pitch modulation
    let freqOffset = sin(frameCount * 0.01 + s.offset) * 100;
    s.osc.freq(s.baseFreq + freqOffset);

    // Update amplitude
    let level = s.amp.getLevel();
    let ampScale = map(level, 0, 0.3, 0.5, 3);

    // Shape trail
    s.trail.push({x: s.x, y: s.y, opacity: 255});
    if (s.trail.length > 30) s.trail.shift();
    for (let t of s.trail) {
      fill(s.color[0], s.color[1], s.color[2], t.opacity);
      if (s.type === 'circle') ellipse(t.x, t.y, 10 * ampScale);
      else rect(t.x - 5*ampScale, t.y - 5*ampScale, 10 * ampScale, 10 * ampScale);
      t.opacity -= 10;
    }

    // Particle effect
    for (let j = s.particles.length - 1; j >= 0; j--) {
      let p = s.particles[j];
      p.x += p.vx * ampScale;
      p.y += p.vy * ampScale;
      p.opacity -= 4;
      if (p.opacity <= 0) s.particles.splice(j, 1);
      else {
        fill(p.color[0], p.color[1], p.color[2], p.opacity);
        if (s.type === 'circle') ellipse(p.x, p.y, p.size * ampScale);
        else rect(p.x - p.size*0.5*ampScale, p.y - p.size*0.5*ampScale, p.size*ampScale, p.size*ampScale);
      }
    }

    // Fade out shape
    s.opacity -= 1;
    if (s.opacity <= 0) {
      s.osc.amp(0, 0.2);
      s.osc.stop(0.2);
      shapes.splice(i, 1);
      continue;
    }

    // Draw main shape
    fill(s.color[0], s.color[1], s.color[2], s.opacity);
    let size = map(s.baseFreq + freqOffset, 200, 900, 30, 100) * ampScale;
    if (s.type === 'circle') ellipse(s.x, s.y, size);
    else rect(s.x - size/2, s.y - size/2, size, size);
  }
}

function keyPressed() {
  userStartAudio();

  let k = key.toUpperCase();
  if (!keyMap[k]) return;

  let config = keyMap[k];

  // Assign oscillator type based on shape
  let osc;
  if (config.type === 'circle') osc = new p5.Oscillator('triangle'); // tap-like
  else osc = new p5.Oscillator('sine'); // bongo-like

  osc.freq(config.freq);
  osc.start();
  osc.amp(0.5, 0.05);

  let amp = new p5.Amplitude();
  amp.setInput(osc);

  let s = {
    x: random(width),
    y: random(height),
    vx: random(-2, 2),
    vy: random(-2, 2),
    type: config.type,
    baseFreq: config.freq,
    offset: random(TWO_PI),
    osc: osc,
    color: config.color,
    opacity: 255,
    trail: [],
    particles: [],
    amp: amp
  };

  // Spawn particles
  for (let i = 0; i < 10; i++) {
    let speed = s.type === 'circle' ? random(1, 4) : random(0.5, 2);
    s.particles.push({
      x: s.x, y: s.y,
      vx: random(-speed, speed),
      vy: random(-speed, speed),
      size: random(5, 15),
      opacity: 255,
      color: s.color
    });
  }

  shapes.push(s);
}

function keyReleased() {
  if (shapes.length > 0) {
    let s = shapes[shapes.length - 1];
    s.osc.amp(0, 0.5);
    s.osc.stop(0.5);
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
