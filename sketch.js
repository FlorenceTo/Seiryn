let shapes = [];
let keyMap = {};
let globalReverb, globalDelay;

// Enigmatic scale without C, 3 octaves
let scaleFreqs = [277.18, 329.63, 369.99, 415.30, 466.16, 587.33, 622.25, 739.99, 830.61]; // D♭, E, F♯, G♯, A♯, B, ... across 3 octaves
let colors = [
  [255,0,0],
  [0,255,0],
  [255,255,255],
  [200,0,0],
  [0,200,0],
  [200,200,200]
];

function setup() {
  createCanvas(windowWidth, windowHeight);
  noStroke();
  textAlign(CENTER, CENTER);
  textSize(32);

  // Global effects
  globalReverb = new p5.Reverb();
  globalDelay = new p5.Delay();

  // Map 26 keys to scaleFreqs
  let letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  for (let i=0; i<26; i++) {
    let freq = scaleFreqs[i % scaleFreqs.length];
    let color = colors[i % colors.length];
    let type = (i % 2 === 0) ? 'circle' : 'square';
    keyMap[letters[i]] = { freq, color, type };
  }
}

function draw() {
  background(0, 20); // slight fade for trails

  for (let i = shapes.length-1; i >= 0; i--) {
    let s = shapes[i];
    s.x += s.vx;
    s.y += s.vy;

    // Pitch modulation
    let freqOffset = sin(frameCount*0.01 + s.offset)*20;
    s.osc.freq(s.freq + freqOffset);

    // Smooth amplitude
    s.osc.amp(s.targetAmp, 0.05);

    // Update trail
    s.trail.push({x:s.x, y:s.y, opacity:255});
    if (s.trail.length>15) s.trail.shift();
    for (let t of s.trail) {
      fill(s.color[0], s.color[1], s.color[2], t.opacity);
      if (s.type==='circle') ellipse(t.x,t.y,20,20);
      else rect(t.x-10,t.y-10,20,20);
      t.opacity -= 10;
    }

    // Fade out & remove
    s.opacity -= 1;
    if (s.opacity <= 0) {
      s.osc.stop();
      shapes.splice(i,1);
    } else {
      fill(s.color[0], s.color[1], s.color[2], s.opacity);
      if (s.type==='circle') ellipse(s.x,s.y,30,30);
      else rect(s.x-15,s.y-15,30,30);
    }
  }
}

function keyPressed() {
  userStartAudio();
  let k = key.toUpperCase();
  if (!keyMap[k]) return;

  let config = keyMap[k];
  let oscType = (config.type==='circle') ? 'triangle' : 'sine';
  let osc = new p5.Oscillator(oscType);
  osc.freq(config.freq);
  osc.start();
  osc.amp(0,0.05);

  // Connect global effects
  osc.disconnect();
  osc.connect(globalDelay);
  globalDelay.process(osc,0.25,0.4,500);
  globalReverb.process(osc,3,2);

  let s = {
    x: random(width),
    y: random(height),
    vx: random(-1,1),
    vy: random(-1,1),
    freq: config.freq,
    color: config.color,
    type: config.type,
    osc: osc,
    targetAmp:0.5,
    opacity:255,
    trail: [],
    offset: random(TWO_PI)
  };

  // Limit active shapes
  if (shapes.length>20) {
    let old = shapes.shift();
    old.osc.stop();
  }

  shapes.push(s);
}

function keyReleased() {
  let s = shapes[shapes.length-1];
  if(s) s.targetAmp = 0;
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
