let shapes = [];
let keyMap = {};
let scaleFrequencies = []; // Enigmatic scale C, D♭, E, F♯, G♯, A♯, B, C
let baseOctave = 3; // starting octave

function setup() {
  createCanvas(windowWidth, windowHeight);
  noStroke();
  textAlign(CENTER, CENTER);
  textSize(32);

  userStartAudio();

  // Build scale frequencies over 3 octaves
  let baseNotes = [60, 61, 64, 66, 68, 70, 71]; // MIDI notes for C, Db, E, F#, G#, A#, B
  for (let octave = baseOctave; octave <= baseOctave + 2; octave++) {
    for (let n of baseNotes) {
      scaleFrequencies.push(midiToFreq(n + (octave - baseOctave) * 12));
    }
  }

  // Map 26 keys to frequencies and shapes
  let keys = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  for (let i = 0; i < keys.length; i++) {
    keyMap[keys[i]] = {
      type: i % 2 === 0 ? 'circle' : 'box',
      freq: scaleFrequencies[i % scaleFrequencies.length],
      color: getRandomColor()
    };
  }
}

function draw() {
  background(0, 50); // fade trail effect

  for (let i = shapes.length - 1; i >= 0; i--) {
    let s = shapes[i];

    // move shapes
    s.x += s.vx;
    s.y += s.vy;

    // pitch modulation
    let freqOffset = sin(frameCount * 0.01 + s.offset) * 20;
    s.osc.freq(s.baseFreq + freqOffset);

    // update trail
    s.trail.push({ x: s.x, y: s.y, opacity: 255 });
    if (s.trail.length > 20) s.trail.shift();

    for (let t of s.trail) {
      fill(s.color[0], s.color[1], s.color[2], t.opacity);
      ellipse(t.x, t.y, 20);
      t.opacity -= 10;
    }

    // shape fade
    s.opacity -= 1;
    if (s.opacity <= 0) {
      s.osc.amp(0, 0.5); // smooth fade
      setTimeout(() => s.osc.stop(), 500);
      shapes.splice(i, 1);
      continue;
    }

    // draw shape
    fill(s.color[0], s.color[1], s.color[2], s.opacity);
    if (s.type === 'circle') ellipse(s.x, s.y, s.size);
    else rect(s.x - s.size/2, s.y - s.size/2, s.size, s.size);
  }
}

function keyPressed() {
  let k = key.toUpperCase();
  if (!keyMap[k]) return;

  let config = keyMap[k];
  let osc;

  // Choose waveform for dreamy effect
  if (config.type === 'circle') osc = new p5.Oscillator('triangle');
  else osc = new p5.Oscillator('sine');

  osc.freq(config.freq);
  osc.start();
  osc.amp(0, 0.3); // fade in

  // Optional effects
  let delay = new p5.Delay();
  delay.process(osc, 0.3, 0.4, 1500);
  let reverb = new p5.Reverb();
  reverb.process(osc, 3, 2); // longer decay for dreamy

  let s = {
    x: random(width),
    y: random(height),
    vx: random(-1,1),
    vy: random(-1,1),
    type: config.type,
    baseFreq: config.freq,
    offset: random(TWO_PI),
    osc: osc,
    color: config.color,
    size: 50,
    opacity: 255,
    trail: []
  };
  shapes.push(s);
}

function keyReleased() {
  if (shapes.length > 0) {
    let s = shapes[shapes.length - 1];
    s.osc.amp(0, 0.5); // smooth fade out
    setTimeout(() => s.osc.stop(), 500);
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function getRandomColor() {
  let palette = [
    [255,0,0],
    [0,255,0],
    [255,255,255],
    [200,0,0],
    [0,200,0],
    [200,200,200]
  ];
  return palette[int(random(palette.length))];
}
