let started = false;
let shapes = [];
let texts = [];
let noise; // p5.Noise for granular sound

function setup() {
  createCanvas(windowWidth, windowHeight);
  noStroke();
  textAlign(CENTER, CENTER);
  textSize(32);

  texts.push({text: "Click or Tap Anywhere", alpha: 255});

  // Create white noise
  noise = new p5.Noise('white');
  noise.start();
  noise.amp(0); // start silent
}

function draw() {
  background(0, 50); // slight trail

  // Draw fading shapes
  for (let i = shapes.length - 1; i >= 0; i--) {
    let s = shapes[i];
    fill(s.color[0], s.color[1], s.color[2], s.alpha);
    ellipse(s.x, s.y, s.size);

    s.alpha -= s.fadeRate;
    if (s.alpha <= 0) shapes.splice(i, 1);
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

  // Play granular white noise burst
  let pan = map(mouseX, 0, width, -1, 1); // spatial panning
  noise.pan(pan);

  // Envelope for short granular burst
  let attack = 0.01;
  let sustain = random(0.05, 0.15);
  let release = 0.1;

  noise.amp(0.5, attack);        // ramp up quickly
  setTimeout(() => {
    noise.amp(0, release);       // ramp down after sustain
  }, sustain * 1000);

  // Add new shape
  let colors = [
    [255, 0, 0],
    [0, 255, 0],
    [0, 0, 255],
    [255, 255, 0]
  ];

  shapes.push({
    x: mouseX,
    y: mouseY,
    size: random(20, 50),
    color: random(colors),
    alpha: 255,
    fadeRate: random(1, 3)
  });
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
