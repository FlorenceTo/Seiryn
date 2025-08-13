let started = false;
let shapes = [];
let texts = [];
let metallicOsc;

function setup() {
  createCanvas(windowWidth, windowHeight);
  noStroke();
  textAlign(CENTER, CENTER);
  textSize(32);
  fill(255);
  
  // Create initial shapes
  for (let i = 0; i < 20; i++) {
    shapes.push({
      x: random(width),
      y: random(height),
      size: random(50, 150),
      color: [random(100, 255), random(100, 255), random(100, 255)],
      offset: random(TWO_PI)
    });
  }

  // Create fading text
  texts.push({text: "Click or Tap Anywhere", alpha: 255});

  // Oscillator for metallic sound
  metallicOsc = new p5.Oscillator('triangle');
  metallicOsc.start();
  metallicOsc.amp(0);
}

function draw() {
  background(0, 30); // slight trail effect

  // Draw shapes
  for (let s of shapes) {
    fill(s.color[0], s.color[1], s.color[2], 200);
    let offsetX = sin(frameCount * 0.01 + s.offset) * 50;
    let offsetY = cos(frameCount * 0.01 + s.offset) * 50;
    ellipse(s.x + offsetX, s.y + offsetY, s.size);
  }

  // Draw fading text
  for (let t of texts) {
    fill(255, t.alpha);
    text(t.text, width / 2, 100);
    if (t.alpha > 0) t.alpha -= 2;
  }
}

function mousePressed() {
  if (!started) {
    userStartAudio(); // enable audio
    started = true;
  }

  // Play metallic sound
  let freq = random(300, 800);
  let pan = map(mouseX, 0, width, -1, 1); // spatial panning
  metallicOsc.freq(freq);
  metallicOsc.pan(pan);
  metallicOsc.amp(0.5, 0.05); // quick attack
  metallicOsc.amp(0, 0.3);     // quick release

  // Create new shape at click/tap
  shapes.push({
    x: mouseX,
    y: mouseY,
    size: random(50, 150),
    color: [random(150, 255), random(150, 255), random(150, 255)],
    offset: random(TWO_PI)
  });
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
