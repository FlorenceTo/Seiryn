let shapes = [];

function setup() {
  createCanvas(windowWidth, windowHeight);
  noStroke();
}

function draw() {
  background(0);
  
  // Update shapes
  for (let s of shapes) {
    s.x += s.vx;
    s.y += s.vy;
    
    // Collision with canvas edges
    if (s.x < 0 || s.x > width) s.vx *= -1;
    if (s.y < 0 || s.y > height) s.vy *= -1;
    
    // Draw shape with glow
    push();
    translate(s.x, s.y);
    fill(255);
    if (s.glow > 0) {
      stroke(255, 0, 0, s.glow);
      strokeWeight(2);
      s.glow -= 5;
    } else {
      noStroke();
    }
    if (s.type === 'circle') ellipse(0, 0, s.size);
    else rectMode(CENTER), rect(0, 0, s.size, s.size);
    pop();
  }
  
  // Collision detection
  for (let i = 0; i < shapes.length; i++) {
    for (let j = i + 1; j < shapes.length; j++) {
      if (checkCollision(shapes[i], shapes[j])) {
        shiftDown(shapes[i]);
        shiftDown(shapes[j]);
      }
    }
  }
}

// Simple collision for circle & square approximation
function checkCollision(a, b) {
  let dx = a.x - b.x;
  let dy = a.y - b.y;
  let distance = sqrt(dx*dx + dy*dy);
  return distance < (a.size + b.size)/2;
}

// Shift frequency 2 octaves down
function shiftDown(shape) {
  if (!shape.collided) {
    shape.osc.freq(shape.osc.freq().value / 4, 0.5); // smooth transition
    shape.glow = 100;
    shape.collided = true;
    setTimeout(() => shape.collided = false, 500); // cooldown
  }
}

// Key pressed to spawn shapes
function keyPressed() {
  userStartAudio();
  let type = random(['circle','square']);
  let osc = new p5.Oscillator('triangle');
  let freq = random([261.63, 277.18, 329.63, 369.99, 415.30, 466.16, 493.88]); // Enigmatic scale
  osc.freq(freq);
  osc.amp(0.3, 0.05);
  osc.start();
  
  shapes.push({
    x: random(width), y: random(height),
    vx: random(-2,2), vy: random(-2,2),
    size: random(30,60),
    type: type,
    osc: osc,
    glow: 0,
    collided: false
  });
}
