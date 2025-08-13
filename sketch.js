let shapes = [];
let texts = [];
let activeKeys = {};

let noise, filterLFO;
let bongoEnv, bongoOsc, bongoDelay;

function setup() {
  let cnv = createCanvas(windowWidth, windowHeight);
  cnv.parent(document.body);
  noStroke();
  textAlign(CENTER, CENTER);
  textSize(32);

  texts.push({ text: "Press Keys", alpha: 255 });

  // Plain metallic granular noise
  noise = new p5.Noise('white');
  noise.start();
  noise.amp(0); // start silent

  filterLFO = new p5.Filter('lowpass');
  noise.disconnect();
  noise.connect(filterLFO);

  // Bongo percussive sound
  bongoOsc = new p5.Oscillator('triangle');
  bongoOsc.start();
  bongoOsc.amp(0);
  bongoEnv = new p5.Envelope();
  bongoEnv.setADSR(0.001, 0.2, 0, 0.2);
  bongoEnv.setRange(0.5, 0);

  // Short delay for bongo
  bongoDelay = new p5.Delay();
  bongoOsc.disconnect();
  bongoOsc.connect(bongoDelay);
  bongoDelay.process(bongoOsc, 0.15, 0.3, 2300);
}

function draw() {
  background(0, 50); // trails

  // Draw shapes
  for (let i = shapes.length - 1; i >= 0; i--) {
    let s = shapes[i];
    fill(s.color[0], s.color[1], s.color[2], s.alpha);
    push();
    translate(s.x, s.y);
    rotate(s.angle);
    ellipse(0, 0, s.sizeX, s.sizeY);
    pop();

    s.alpha -= s.fadeRate;
    s.angle += s.rotationSpeed;

    if (s.alpha <= 0) shapes.splice(i, 1);
  }

  // Draw text
  for (let t of texts) {
    fill(255, t.alpha);
    text(t.text, width / 2, 100);
    if (t.alpha > 0) t.alpha -= 2;
  }
}

function keyPressed() {
  userStartAudio(); // activate audio

  if (!activeKeys[key]) {
    activeKeys[key] = true;

    if ('ASDF'.includes(key.toUpperCase())) {
      // Bongo mid-frequency
      bongoOsc.freq(random(300, 600));
      bongoEnv.play(bongoOsc);
    } else {
      // Plain metallic noise
      let pan = map(mouseX, 0, width, -1, 1);
      noise.pan(pan);
      filterLFO.freq(random(300, 1500));
      filterLFO.res(random(0.5, 5));
      noise.amp(1.0, 0.05);
    }

    // Visual abstract shapes
    let colors = [
      [255, 0, 0],
      [0, 255, 0],
      [0, 0, 255],
      [255, 255, 0]
    ];

    shapes.push({
      x: random(width),
      y: random(height),
      sizeX: random(20, 50),
      sizeY: random(10, 40),
      color: random(colors),
      alpha: 255,
      fadeRate: random(1, 3),
      angle: random(TWO_PI),
      rotationSpeed: random(-0.05, 0.05)
    });
  }
}

function keyReleased() {
  if (activeKeys[key]) {
    if (!'ASDF'.includes(key.toUpperCase())) {
      noise.amp(0, 0.5); // fade out
    }
    delete activeKeys[key];
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function mousePressed() {
  userStartAudio(); // required for browsers
}
