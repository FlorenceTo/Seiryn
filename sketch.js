let shapes = [];
let activeKeys = {};
let chordOscs = [];
let reverb;

let keyMap = {
  'D': { type:'sphere', freq: 146.83 },
  'R': { type:'box',    freq: 164.81 },
  'C': { type:'sphere', freq: 185.00 },
  'F': { type:'box',    freq: 207.65 },
  'V': { type:'sphere', freq: 233.08 },
  'T': { type:'box',    freq: 246.94 },
  'G': { type:'sphere', freq: 293.66 },
  'B': { type:'box',    freq: 329.63 },
  'Y': { type:'sphere', freq: 369.99 },
  'H': { type:'box',    freq: 415.30 },
  'N': { type:'sphere', freq: 466.16 },
  'U': { type:'box',    freq: 493.88 },
  'J': { type:'sphere', freq: 587.33 },
  'K': { type:'box',    freq: 659.25 },
  'M': { type:'sphere', freq: 739.99 }
};

function setup() {
  createCanvas(windowWidth, windowHeight);
  noStroke();
  reverb = new p5.Reverb();
}

function draw() {
  // Very quick trail fade
  background(0, 30);

  for (let i = shapes.length-1; i >= 0; i--) {
    let s = shapes[i];
    s.x += s.vx;
    s.y += s.vy;
    if (s.x < 0 || s.x > width) s.vx *= -1;
    if (s.y < 0 || s.y > height) s.vy *= -1;

    let lifeProgress = (millis() - s.startTime) / s.lifespan;
    if (lifeProgress >= 1) {
      s.osc.amp(0, 0.1);
      s.osc.stop(0.1);
      shapes.splice(i,1);
      continue;
    }

    let glow = sin(frameCount * 0.2) * 50 + 50;
    push();
    translate(s.x, s.y);
    stroke(255, 0, 0, glow);
    strokeWeight(1);
    fill(255, 255 * (1-lifeProgress));
    if(s.type==='sphere') ellipse(0,0,s.size*(1-lifeProgress));
    else rectMode(CENTER), rect(0,0,s.size*(1-lifeProgress),s.size*(1-lifeProgress));
    pop();
  }
}

function keyPressed() {
  let k = key.toUpperCase();
  if (!keyMap[k]) return;

  userStartAudio();
  activeKeys[k] = keyMap[k];

  let config = keyMap[k];
  let s = {
    x: random(width), y: random(height),
    vx: random(-1,1), vy: random(-1,1),
    type: config.type,
    size: 50,
    freq: config.freq,
    osc: new p5.Oscillator('triangle'),
    startTime: millis(),
    lifespan: 600 // shorter lifespan for faster disappearance
  };
  s.osc.freq(s.freq * Math.pow(2, random([-1,0]))); 
  s.osc.amp(0.3, 0.01);
  s.osc.mod = 0.001;
  s.osc.start();

  reverb.process(s.osc, 1.2, 0.1);

  shapes.push(s);

  updateChord();
}

function keyReleased() {
  let k = key.toUpperCase();
  delete activeKeys[k];
  updateChord();
}

function updateChord(){
  let sphereKeys = Object.keys(activeKeys).filter(k=>activeKeys[k].type==='sphere');
  let boxKeys = Object.keys(activeKeys).filter(k=>activeKeys[k].type==='box');

  for(let o of chordOscs){
    o.amp(0,0.2);
    o.stop(0.2);
  }
  chordOscs = [];

  if(sphereKeys.length>0 && boxKeys.length>0){
    let highestFreq = max([...sphereKeys,...boxKeys].map(k=>activeKeys[k].freq));
    [0,4,7].forEach(interval=>{
      let osc = new p5.Oscillator('triangle');
      osc.freq(highestFreq * Math.pow(2, interval/12));
      osc.amp(0.2,0.01);
      osc.start();
      reverb.process(osc,1,0.1);
      chordOscs.push(osc);
    });
  }
}

function windowResized(){
  resizeCanvas(windowWidth, windowHeight);
}
