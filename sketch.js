// Patatap-Lite using p5.js + p5.sound (generated tones)
// Press A–Z to trigger sounds with matching visuals.

let started = false;      // toggled after first click to unlock audio
let visuals = [];         // active visual objects
const waves = ["sine", "triangle", "square", "sawtooth"]; // oscillator types

function setup() {
  const canvas = createCanvas(800, 600);
  canvas.parent(document.body);  // centered via flexbox (see index.html)
  noStroke();
  textAlign(CENTER, CENTER);
}

function draw() {
  background(255); // white page

  if (!started) {
    fill(20);
    textSize(24);
    text("Click to start audio\nthen press A–Z", width / 2, height / 2);
    return;
  }

  for (let i = visuals.length - 1; i >= 0; i--) {
    const v = visuals[i];
    v.update();
    v.draw();
    if (v.done) visuals.splice(i, 1);
  }
}

// Unlock audio on user gesture (browser policy)
function mousePressed() {
  if (!started) {
    userStartAudio();
    started = true;
  }
}

function keyPressed() {
  if (!started) return;
  const letter = key.toUpperCase();
  if (letter < "A" || letter > "Z") return;

  playToneFor(letter);
  spawnVisual(letter);
}

// ---- SOUND ----
function playToneFor(letter) {
  const idx = letter.charCodeAt(0) - 65;  // A=0 ... Z=25
  const wave = waves[idx % waves.length];
  const freq = map(idx, 0, 25, 200, 900); // A..Z mapped to 200..900 Hz

  const osc = new p5.Oscillator(wave);
  osc.freq(freq);
  osc.start();
  osc.amp(0, 0);       // start silent
  osc.amp(0.6, 0.01);  // quick attack
  osc.amp(0, 0.2);     // release
  osc.stop(0.25);      // stop after 250ms
}

// ---- VISUALS ----
function spawnVisual(letter) {
  const idx = letter.charCodeAt(0) - 65;
  const x = random(width);
  const y = random(height);
  const c = randomColor();
  const type = idx % 4;
  let v;
  switch (type) {
    case 0: v = new Bubble(x, y, c); break;
    case 1: v = new Burst(x, y, c); break;
    case 2: v = new SquareSpin(x, y, c); break;
    case 3: v = new Ripple(x, y, c); break;
  }
  visuals.push(v);
}

function randomColor() {
  return color(random(40, 220), random(40, 220), random(40, 220), 220);
}

class Bubble {
  constructor(x, y, c) { this.x=x; this.y=y; this.c=c; this.size=10; this.alpha=255; this.done=false; }
  update() { this.size += 8; this.alpha -= 6; if (this.alpha <= 0) this.done = true; }
  draw() { fill(red(this.c), green(this.c), blue(this.c), this.alpha); ellipse(this.x, this.y, this.size); }
}
class Burst {
  constructor(x, y, c) { this.x=x; this.y=y; this.c=c; this.n=12; this.r=8; this.alpha=255; this.done=false; }
  update() { this.r += 6; this.alpha -= 6; if (this.alpha <= 0) this.done = true; }
  draw() {
    push(); translate(this.x, this.y);
    stroke(red(this.c), green(this.c), blue(this.c), this.alpha); noFill();
    for (let i=0;i<this.n;i++){ const a=TWO_PI*i/this.n; line(0,0,cos(a)*this.r, sin(a)*this.r); }
    pop(); noStroke();
  }
}
class SquareSpin {
  constructor(x, y, c) { this.x=x; this.y=y; this.c=c; this.size=20; this.angle=0; this.alpha=255; this.done=false; }
  update() { this.size += 6; this.angle += 0.2; this.alpha -= 5; if (this.alpha <= 0) this.done = true; }
  draw() {
    push(); translate(this.x, this.y); rotate(this.angle); rectMode(CENTER);
    fill(red(this.c), green(this.c), blue(this.c), this.alpha); rect(0, 0, this.size, this.size, 6);
    pop();
  }
}
class Ripple {
  constructor(x, y, c) { this.x=x; this.y=y; this.c=c; this.r=10; this.alpha=200; this.done=false; }
  update() { this.r += 8; this.alpha -= 5; if (this.alpha <= 0) this.done = true; }
  draw() {
    push(); noFill(); stroke(red(this.c), green(this.c), blue(this.c), this.alpha); strokeWeight(3);
    circle(this.x, this.y, this.r * 2); pop(); noStroke();
  }
}

