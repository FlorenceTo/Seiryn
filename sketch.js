let shapes = [];
let keyMap = {};
let letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

// Map each key
letters.split('').forEach((letter, i) => {
  keyMap[letter] = {
    type: i % 2 === 0 ? 'circle' : 'square',
    color: [
      random(150, 255), 
      random(150, 255), 
      random(150, 255)
    ],
    baseFreq: random(200, 600)
  };
});

function setup() {
  createCanvas(windowWidth, windowHeight);
  noStroke();
  textAlign(CENTER, CENTER);
  textSize(32);
}

function draw() {
  background(0);

  for (let i = shapes.length - 1; i >= 0; i--) {
    let s = shapes[i];

    // Move shapes
    s.x += s.vx;
    s.y += s.vy;

    // Keep inside canvas
    if (s.x < 0 || s.x > width) s.vx *= -1;
    if (s.y < 0 || s.y > height) s.vy *= -1;

    // Pitch modulation
    let freqOffset = sin(frameCount * 0.02 + s.offset) * 50;
    s.osc.freq(s.baseFreq + freqOffset);

    // Size changes with pitch
    let size = map(s.baseFreq + freqOffset, 150, 650, 20, 80);

    // Trail
    s.trail.push({x: s.x, y: s.y, opacity: s.opacity});
    if (s.trail.length > 20) s.trail.shift();
    for (let t of s.trail) {
      fill(s.color[0], s.color[1], s.color[2], t.opacity);
      if (s.type === 'circle') ellipse(t.x, t.y, size*0.5);
      else rect(t.x, t.y, size*0.5, size*0.5);
      t.opacity -= 8;
    }

    // Fade out
    s.opacity -= 1;
    if (s.opacity <= 0) {
      s.osc.amp(0, 0.5);
      s.osc.stop();
      shapes.splice(i, 1);
      continue;
    }

    // Draw main shape
    fill(s.color[0], s.color[1], s.color[2], s.opacity);
    if (s.type === 'circle') ellipse(s.x, s.y, size);
    else rect(s.x, s.y, size, size);
  }
}

function keyPressed() {
  userStartAudio();

  let k = key.toUpperCase();
  if (!keyMap[k]) return;

  let config = keyMap[k];
  let oscType = config.type === 'circle' ? 'triangle' : 'sine';
  let osc = new p5.Oscillator(oscType);
  osc.freq(config.baseFreq);
  osc.start();
  osc.amp(0.5, 0.1);

  // Add delay and reverb for dreamy sound
  let delay = new p5.Delay();
  delay.process(osc, 0.3, 0.4, 2000);
  let reverb = new p5.Reverb();
  reverb.process(osc, 3, 2);

  let s = {
    x: random(width),
    y: random(height),
    vx: random(-2, 2),
    vy: random(-2, 2),
    type: config.type,
    color: config.color,
    baseFreq: config.baseFreq,
    offset: random(TWO_PI),
    opacity: 255,
    trail: [],
    osc: osc
  };

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
