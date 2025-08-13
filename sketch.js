let shapes = [];
let keyMap = {};

// Create key mappings for A-Z
let letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
letters.split('').forEach((letter, i) => {
  keyMap[letter] = {
    type: i % 2 === 0 ? 'circle' : 'square',  // alternate shape types
    color: [
      random(150, 255), 
      random(150), 
      random(150)
    ],  // variations of red, green, white
    freq: random(200, 600) // base frequency for each key
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

    // Keep shapes inside canvas
    if (s.x < 0 || s.x > width) s.vx *= -1;
    if (s.y < 0 || s.y > height) s.vy *= -1;

    // Draw trail
    s.trail.push({x: s.x, y: s.y, opacity: s.opacity});
    if (s.trail.length > 20) s.trail.shift();
    for (let t of s.trail) {
      fill(s.color[0], s.color[1], s.color[2], t.opacity);
      if (s.type === 'circle') ellipse(t.x, t.y, 20);
      else rect(t.x, t.y, 20, 20);
      t.opacity -= 10;
    }

    // Fade out
    s.opacity -= 2;
    if (s.opacity <= 0) {
      s.osc.amp(0, 0.2);
      s.osc.stop();
      shapes.splice(i, 1);
      continue;
    }

    // Draw main shape
    fill(s.color[0], s.color[1], s.color[2], s.opacity);
    if (s.type === 'circle') ellipse(s.x, s.y, 30);
    else rect(s.x, s.y, 30, 30);
  }
}

function keyPressed() {
  userStartAudio();

  let k = key.toUpperCase();
  if (!keyMap[k]) return;

  let config = keyMap[k];
  let osc = new p5.Oscillator('triangle');
  osc.freq(config.freq);
  osc.start();
  osc.amp(0.5, 0.05);

  let s = {
    x: random(width),
    y: random(height),
    vx: random(-2, 2),
    vy: random(-2, 2),
    type: config.type,
    color: config.color,
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
