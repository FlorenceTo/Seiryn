let shapes = [];
let maxShapes = 12; // limit active shapes
let keyMap = {}; 
let reverb;

function setup() {
  createCanvas(windowWidth, windowHeight);
  noStroke();
  textAlign(CENTER, CENTER);
  textSize(32);
  
  userStartAudio();
  
  // Global reverb
  reverb = new p5.Reverb();
  
  // Map keys to frequencies in multiple octaves (C enigmatic scale)
  let scale = [261.63, 277.18, 329.63, 369.99, 415.30, 466.16, 493.88]; // C, D♭, E, F♯, G♯, A♯, B
  let keys = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  for (let i = 0; i < keys.length; i++) {
    let octaveShift = i < 9 ? 0.5 : i < 18 ? 1 : 2; // spread over 3 octaves
    keyMap[keys[i]] = scale[i % scale.length] * octaveShift;
  }
}

function draw() {
  background(0, 50); // semi-transparent for trails
  
  for (let i = shapes.length - 1; i >= 0; i--) {
    let s = shapes[i];
    
    // Smooth movement
    s.x += s.vx * 0.5;
    s.y += s.vy * 0.5;
    
    // Pitch modulation (dreamy vibrato)
    let mod = sin(frameCount * 0.02 + s.offset) * 10; 
    s.osc.freq(s.freq + mod);
    
    // Fade out smoothly
    s.opacity -= 1;
    if (s.opacity <= 0) {
      s.osc.amp(0, 1); 
      s.osc.stop(1);
      s.osc.disconnect();
      shapes.splice(i, 1);
      continue;
    }
    
    // Draw trails
    s.trail.push({x: s.x, y: s.y, opacity: s.opacity});
    if (s.trail.length > 20) s.trail.shift();
    for (let t of s.trail) {
      fill(s.color[0], s.color[1], s.color[2], t.opacity * 0.3);
      if (s.type === 'circle') ellipse(t.x, t.y, s.size * 0.7);
      else rect(t.x, t.y, s.size * 0.7, s.size * 0.7);
    }
    
    // Draw main shape
    fill(s.color[0], s.color[1], s.color[2], s.opacity);
    if (s.type === 'circle') ellipse(s.x, s.y, s.size);
    else rect(s.x, s.y, s.size, s.size);
  }
}

function keyPressed() {
  let k = key.toUpperCase();
  if (!keyMap[k]) return;
  
  if (shapes.length >= maxShapes) {
    let old = shapes.shift();
    old.osc.amp(0, 1);
    old.osc.stop(1);
    old.osc.disconnect();
  }
  
  let freq = keyMap[k];
  let type = random(['circle','square']);
  let oscType = type === 'circle' ? 'triangle' : 'sine';
  
  let osc = new p5.Oscillator(oscType);
  osc.freq(freq);
  osc.start();
  osc.amp(0.5, 0.8);
  
  // Delay
  let delay = new p5.Delay();
  delay.process(osc, 0.3, 0.3, 1000); 
  
  // Reverb
  osc.disconnect();
  reverb.process(osc, 3, 2);
  
  let s = {
    x: random(width),
    y: random(height),
    vx: random(-1,1),
    vy: random(-1,1),
    size: random(30,80),
    type: type,
    color: [random([0,255]), random([0,255]), random([0,255])],
    opacity: 255,
    osc: osc,
    freq: freq,
    trail: [],
    offset: random(TWO_PI)
  };
  shapes.push(s);
}
