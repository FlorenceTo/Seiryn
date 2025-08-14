let shapes = [];
let keysUsed = 'drcfvtgbyhnujkm';
let notes = [146.83, 164.81, 174.61, 185.00, 196.00, 207.65, 220.00, 233.08, 246.94, 261.63]; // 3 octaves example
let reverb, delay;

function setup() {
  createCanvas(windowWidth, windowHeight);
  noStroke();
  reverb = new p5.Reverb();
  delay = new p5.Delay();
}

function draw() {
  background(0, 50); // fade trails slowly

  for (let i = shapes.length - 1; i >= 0; i--) {
    let s = shapes[i];

    // Move shapes
    s.x += s.vx;
    s.y += s.vy;

    // Draw trail
    for (let t of s.trail) {
      fill(255, t.opacity, t.opacity);
      ellipse(t.x, t.y, s.size * t.scale);
      t.opacity -= 10;
    }
    s.trail.push({ x: s.x, y: s.y, opacity: 150, scale: random(0.5, 1.2) });
    if (s.trail.length > 20) s.trail.shift();

    // Draw shape with red glow pulse
    fill(255);
    stroke(255, 0, 0, s.glow);
    strokeWeight(1);
    if (s.type === 'circle') ellipse(s.x, s.y, s.size);
    else rectMode(CENTER), rect(s.x, s.y, s.size, s.size);
    s.glow = max(0, s.glow - 5);

    // Fade out
    s.opacity -= 3;
    if (s.opacity <= 0) {
      s.osc.amp(0, 0.1);
      s.osc.stop();
      shapes.splice(i, 1);
    }
  }
}

function keyPressed() {
  userStartAudio();
  let k = key.toLowerCase();
  if (!keysUsed.includes(k)) return;

  // Random note from 3 octaves
  let freq = random(notes) * pow(2, floor(random(3))); // 3 octaves

  // Plucked sound
  let osc = new p5.Oscillator('triangle');
  osc.freq(freq + random(-1,1)); // slight wobble
  osc.amp(0.5, 0.02);
  osc.start();

  reverb.process(osc, 3, 2); // dreamy
  delay.process(osc, 0.2, 0.3, 500);

  let s = {
    x: random(width),
    y: random(height),
    vx: random(-1,1),
    vy: random(-1,1),
    size: random(30, 70),
    type: random(['circle','square']),
    osc: osc,
    opacity: 255,
    glow: 150,
    trail: []
  };
  shapes.push(s);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
