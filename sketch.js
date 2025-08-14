let shapes = [];
let pressedKeys = {};
let harmonyChord = null;

let keySet = 'drcfvtgbyhnujkm';
let scaleNotes = [146.83, 164.81, 174.61, 185.00, 207.65, 220.00, 246.94]; // D3, E3, F#3, G#3, A#3, B3, D4

function setup() {
  createCanvas(windowWidth, windowHeight);
  noStroke();
}

function draw() {
  background(0, 50);

  // Draw and update shapes
  for (let i = shapes.length - 1; i >= 0; i--) {
    let s = shapes[i];

    // Move shape
    s.x += s.vx;
    s.y += s.vy;

    // Update oscillator pitch wobble
    let wobble = sin(frameCount * 0.05 + s.offset) * 2; 
    s.osc.freq(s.baseFreq + wobble);

    // Update amplitude
    let level = s.amp.getLevel();
    let scale = map(level, 0, 0.3, 0.5, 1.5);

    // Add trail
    s.trail.push({x: s.x, y: s.y, opacity: 255});
    if (s.trail.length > 15) s.trail.shift();

    for (let t of s.trail) {
      fill(255, 0, 0, t.opacity);
      if (s.type === 'circle') ellipse(t.x, t.y, 20 * scale);
      else rect(t.x-10*scale/2, t.y-10*scale/2, 20*scale, 20*scale);
      t.opacity -= 15;
    }

    // Draw main shape with subtle red glow
    fill(255);
    if (s.type === 'circle') ellipse(s.x, s.y, 30 * scale);
    else rect(s.x-15*scale/2, s.y-15*scale/2, 30*scale, 30*scale);

    // Fade out faster to reduce CPU load
    s.opacity -= 5;
    if (s.opacity <= 0) {
      s.osc.amp(0, 0.2);
      s.osc.stop();
      shapes.splice(i, 1);
    }
  }
}

// Trigger shape or harmony chord
function keyPressed() {
  userStartAudio();
  let k = key.toLowerCase();
  if (!keySet.includes(k)) return;

  pressedKeys[k] = true;

  // Check for harmony chord
  let circleKey = Object.keys(pressedKeys).find(key => pressedKeys[key] && getShapeType(key) === 'circle');
  let squareKey = Object.keys(pressedKeys).find(key => pressedKeys[key] && getShapeType(key) === 'square');

  if (circleKey && squareKey && !harmonyChord) {
    playHarmony(circleKey, squareKey);
    return;
  }

  if (!harmonyChord) {
    createShape(k);
  }
}

function keyReleased() {
  let k = key.toLowerCase();
  pressedKeys[k] = false;

  // Stop harmony if either key is released
  if (harmonyChord && (!pressedKeys[harmonyChord.keys[0]] || !pressedKeys[harmonyChord.keys[1]])) {
    harmonyChord.osc.forEach(o => o.amp(0, 0.5));
    harmonyChord.osc.forEach(o => o.stop());
    harmonyChord = null;
  }
}

// Determine shape type for key
function getShapeType(k) {
  let index = keySet.indexOf(k);
  return index % 2 === 0 ? 'circle' : 'square';
}

// Create individual shape
function createShape(k) {
  let index = keySet.indexOf(k);
  let type = getShapeType(k);
  let baseFreq = scaleNotes[index % scaleNotes.length] * (index < scaleNotes.length ? 1 : 2); // randomize octaves
  let osc = new p5.Oscillator('triangle');
  osc.freq(baseFreq);
  osc.amp(0.5, 0.05);
  osc.start();
  let amp = new p5.Amplitude();
  amp.setInput(osc);

  let s = {
    x: random(width),
    y: random(height),
    vx: random(-1, 1),
    vy: random(-1, 1),
    type: type,
    baseFreq: baseFreq,
    osc: osc,
    amp: amp,
    trail: [],
    opacity: 255,
    offset: random(TWO_PI)
  };
  shapes.push(s);
}

// Play harmony chord
function playHarmony(circleKey, squareKey) {
  let circleIndex = keySet.indexOf(circleKey);
  let squareIndex = keySet.indexOf(squareKey);
  let notes = [
    scaleNotes[circleIndex % scaleNotes.length] * 2, 
    scaleNotes[squareIndex % scaleNotes.length] * 2,
    scaleNotes[Math.max(circleIndex, squareIndex) % scaleNotes.length] * 2
  ];
  harmonyChord = {
    keys: [circleKey, squareKey],
    osc: notes.map(f => {
      let o = new p5.Oscillator('triangle');
      o.freq(f);
      o.amp(0.7, 0.05); // louder than single shape
      o.start();
      return o;
    })
  };
}
