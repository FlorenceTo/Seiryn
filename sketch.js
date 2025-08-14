let shapes = [];
let camZoom = 0;

// Only these keys are active
let activeKeys = 'esxcdrfvtgbhynjuiklm';

// Map each key to a note frequency (plucked/flute tones) across 3 octaves
let keyMap = {
  'e': 196,   // G3
  's': 220,   // A3
  'x': 246.94, // B3
  'c': 261.63, // C4 (skip if you want no C)
  'd': 293.66, // D4
  'r': 329.63, // E4
  'f': 349.23, // F4
  'v': 392,    // G4
  't': 440,    // A4
  'g': 493.88, // B4
  'b': 523.25, // C5 (skip C if needed)
  'h': 587.33, // D5
  'y': 659.25, // E5
  'n': 698.46, // F5
  'j': 783.99, // G5
  'u': 880,    // A5
  'i': 987.77, // B5
  'k': 1046.5, // C6
  'l': 1174.66,// D6
  'm': 1318.51 // E6
};

function setup() {
  createCanvas(windowWidth, windowHeight);
  noStroke();
  userStartAudio();
}

function draw() {
  background(0);

  for (let i = shapes.length - 1; i >= 0; i--) {
    let s = shapes[i];
    push();
    translate(s.x, s.y);
    fill(255, s.opacity); // all white
    ellipse(s.x, s.y, s.size);
    pop();

    // Fade out faster
    s.opacity -= 5;
    if (s.opacity <= 0) {
      s.osc.amp(0, 0.5);
      s.osc.stop(0.5);
      shapes.splice(i, 1);
    }
  }
}

function keyPressed() {
  let k = key.toLowerCase();
  if (!activeKeys.includes(k)) return;

  console.log('Key pressed:', k); // debug

  let freq = keyMap[k];
  let osc = new p5.Oscillator('triangle');
  osc.freq(freq);
  osc.start();
  osc.amp(0.5, 0.05);

  // Add short delay/reverb
  let delay = new p5.Delay();
  delay.process(osc, 0.3, 0.4, 2000);

  let s = {
    x: random(width),
    y: random(height),
    size: random(30, 60),
    opacity: 255,
    osc: osc
  };

  shapes.push(s);
}

function keyReleased() {
  // optionally fade out
}
