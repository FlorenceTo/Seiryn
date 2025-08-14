let shapes = [];
let keyMap = {
  'e': 'D4', 's': 'E4', 'x': 'F#4', 'c': 'G#4', 'd': 'A#4',
  'r': 'B4', 'f': 'D5', 'v': 'E5', 't': 'F#5', 'g': 'G#5',
  'b': 'A#5', 'h': 'B5', 'y': 'D6', 'n': 'E6', 'j': 'F#6',
  'u': 'G#6', 'i': 'A#6', 'k': 'B6', 'l': 'D7', 'm': 'E7'
};
let reverb;

function setup() {
  createCanvas(windowWidth, windowHeight);
  reverb = new p5.Reverb();
}

function keyPressed() {
  let keyName = key.toLowerCase();
  if (!keyMap[keyName]) return;

  let freq = midiToFreq(noteToMidi(keyMap[keyName]));
  let osc = new p5.Oscillator('triangle');
  osc.freq(freq + random(-1,1)); // slight pitch wobble
  osc.amp(0.5);
  osc.start();

  // Reverb effect
  reverb.process(osc, 3, 2); // more reverb

  // Random position
  let x = random(width);
  let y = random(height);

  // Random shape
  let type = random(['circle', 'square']);

  shapes.push({x, y, size: 50, type, osc});
}

function draw() {
  background(0);

  for (let i = shapes.length - 1; i >= 0; i--) {
    let s = shapes[i];

    fill(255);
    stroke(0, 255, 0);
    strokeWeight(1);

    if (s.type === 'circle') ellipse(s.x, s.y, s.size);
    else rectMode(CENTER), rect(s.x, s.y, s.size, s.size);

    // Fade out immediately
    s.osc.amp(0, 0.05);
    s.osc.stop(0.05);
    shapes.splice(i, 1);
  }
}

// Helper: convert note name to MIDI number
function noteToMidi(note) {
  let notes = {'C':0,'C#':1,'D':2,'D#':3,'E':4,'F':5,'F#':6,'G':7,'G#':8,'A':9,'A#':10,'B':11};
  let octave = parseInt(note.slice(-1));
  let key = note.slice(0, -1);
  return 12 + notes[key] + octave*12;
}
