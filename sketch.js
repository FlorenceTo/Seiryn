let shapes = [];
let keyMap = {};
let scaleNotes = [261, 277, 329, 370, 415, 466, 493, 523]; // C, D♭, E, F♯, G♯, A♯, B, C one octave
let colors = [[0,255,0],[255,0,0],[255,255,255]]; // Green, red, white variations

function setup() {
  createCanvas(windowWidth, windowHeight);
  noStroke();

  // Map all 26 keys to notes in scale, cycling through
  let letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  for(let i=0; i<letters.length; i++){
    keyMap[letters[i]] = {
      type: i % 2 === 0 ? 'circle' : 'square',
      baseFreq: scaleNotes[i % scaleNotes.length],
      color: colors[i % colors.length]
    };
  }
}

function draw() {
  background(0, 30); // slight persistence for trail effect

  for(let i = shapes.length - 1; i >= 0; i--){
    let s = shapes[i];

    // Move shapes
    s.x += s.vx;
    s.y += s.vy;

    // Pitch modulation
    let freqOffset = sin(frameCount*0.01 + s.offset) * 20;
    s.osc.freq(s.baseFreq + freqOffset);

    // Amplitude scaling
    let level = s.amp.getLevel();
    let ampScale = map(level, 0, 0.3, 0.5, 3);

    // Trail
    s.trail.push({x:s.x, y:s.y, opacity:255});
    if(s.trail.length>20) s.trail.shift();
    for(let t of s.trail){
      fill(s.color[0], s.color[1], s.color[2], t.opacity);
      if(s.type==='circle') ellipse(t.x,t.y,10*ampScale);
      else rect(t.x-5, t.y-5, 10*ampScale, 10*ampScale);
      t.opacity -= 10;
    }

    // Fade out
    s.opacity -= 0.5;
    if(s.opacity <= 0){
      s.osc.amp(0,0.5); 
      s.osc.stop(0.5);
      shapes.splice(i,1);
      continue;
    }

    // Draw main shape
    fill(s.color[0], s.color[1], s.color[2], s.opacity);
    let size = map(s.baseFreq + freqOffset, 250, 530, 30, 80);
    if(s.type==='circle') ellipse(s.x, s.y, size*ampScale);
    else rect(s.x-size/2, s.y-size/2, size*ampScale, size*ampScale);
  }
}

function keyPressed() {
  userStartAudio();

  let k = key.toUpperCase();
  if(!keyMap[k]) return;

  let config = keyMap[k];
  let osc = new p5.Oscillator(config.type==='circle'?'triangle':'sine');
  osc.freq(config.baseFreq);
  osc.start();
  osc.amp(0.5,0.1); // smooth fade in

  // Reverb + Delay
  let reverb = new p5.Reverb();
  reverb.process(osc, 3, 2);
  let delay = new p5.Delay();
  delay.process(osc, 0.3, 0.5, 2000);

  let amp = new p5.Amplitude();
  amp.setInput(osc);

  let s = {
    x: random(width),
    y: random(height),
    vx: random(-1,1),
    vy: random(-1,1),
    type: config.type,
    baseFreq: config.baseFreq,
    offset: random(TWO_PI),
    osc: osc,
    color: config.color,
    opacity: 255,
    trail: [],
    amp: amp
  };

  shapes.push(s);
}

function keyReleased() {
  if(shapes.length>0){
    let s = shapes[shapes.length-1];
    s.osc.amp(0,0.5); // smooth fade out
    s.osc.stop(0.5);
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
