let shapes = [];
let texts = [];
let noise, filterLFO, delay, reverb;
let activeKeys = {}; // Track keys currently pressed

function setup() {
  createCanvas(windowWidth, windowHeight);
  noStroke();
  textAlign(CENTER, CENTER);
  textSize(32);

  texts.push({text: "Press and Hold Keys", alpha: 255});

  // White noise for metallic/granular sound
  noise = new p5.Noise('white');
  noise.start();
  noise.amp(0); // start silent

  // Lowpass filter for timbre modulation
  filterLFO = new p5.Filter('lowpass');
  noise.disconnect();
  noise.connect(filterLFO);

  // Tiny delay/feedback for metallic feel
  delay = new p5.Delay();
  filterLFO.disconnect();
  filterLFO.connect(delay);
  delay.process(filterLFO, 0.2, 0.2, 2300);

  // Reverb for spacious sound
  reverb = new p5.Reverb();
  delay.disconnect();
  delay.connect(reverb);
  reverb.process(delay, 3, 2); // reverb with decay 3s, pre-delay 2s
}

function draw() {
  background(0, 50); // trail effect

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

// Start sound when key is pressed
function keyPressed() {
  userStartAudio();

  // Only start if key is not already active
  if (!activeKeys[key]) {
    let pan = map(mouseX, 0, width, -1, 1);
    noise.pan(pan);

    // Random filter modulation for metallic timbre
    filterLFO.freq(random(300, 1500));
    filterLFO.res(random(0.5, 5));

    noise.amp(0.5, 0.05); // attack
    activeKeys[key] = true;

    // Add a new shape for visual feedback
    let colors = [
      [255, 0, 0],
      [0, 255, 0],
      [0, 0, 255],
      [255, 255, 0]
    ];
    shapes.push({
      x: random(width),
      y: random(height),
      size: random(20, 50),
      color: random(colors),
      alpha: 255,
      fadeRate: random(1, 3)
    });
  }
}

// Stop sound when key is released
function keyReleased() {
  if (activeKeys[key]) {
    noise.amp(0, 0.5); // release with fade out
    delete activeKeys[key];
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
