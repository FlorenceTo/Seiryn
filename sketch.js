let shapes = [];
let camAngleX = 0;
let camAngleY = 0;
let camZoom = 0;

// Map keys to shape types, base frequency, and colors
let keyMap = {
  'A': { type: 'sphere', freq: 600, color: [255, 0, 0] },
  'S': { type: 'box', freq: 300, color: [0, 255, 0] },
  'D': { type: 'sphere', freq: 700, color: [255, 255, 255] },
  'F': { type: 'box', freq: 350, color: [200, 0, 0] },
  'G': { type: 'sphere', freq: 650, color: [0, 200, 0] },
  'H': { type: 'box', freq: 250, color: [200, 200, 200] }
};

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  noStroke();
  textAlign(CENTER, CENTER);
  textSize(32);
}

function draw() {
  background(0);

  // Camera rotation based on mouse
  camAngleX = map(mouseY, 0, height, -PI/4, PI/4);
  camAngleY = map(mouseX, 0, width, -PI, PI);
  camera(
    camZoom * sin(camAngleY) * cos(camAngleX),
    camZoom * sin(camAngleX),
    (height/2) / tan(PI/6) + camZoom * cos(camAngleY) * cos(camAngleX),
    0, 0, 0,
    0, 1, 0
  );

  rotateY(frameCount * 0.002);

  for (let i = shapes.length - 1; i >= 0; i--) {
    let s = shapes[i];

    // Move shapes
    s.x += s.vx;
    s.y += s.vy;
    s.z += s.vz;

    // Pitch modulation
    let freqOffset = sin(frameCount * 0.01 + s.offset) * 100;
    s.osc.freq(s.baseFreq + freqOffset);
    s.panner.setPosition(s.x/2, s.y/2, s.z/2);

    // Amplitude scaling
    let level = s.amp.getLevel();
    let ampScale = map(level, 0, 0.3, 0.5, 3);

    // Trail
    s.trail.push({x:s.x, y:s.y, z:s.z, opacity:255});
    if(s.trail.length>20) s.trail.shift();
    for(let t of s.trail){
      push();
      translate(t.x, t.y, t.z);
      fill(s.color[0], s.color[1], s.color[2], t.opacity);
      sphere(10 * ampScale);
      pop();
      t.opacity -= 12;
    }

    // Fade out
    s.opacity -= 1;
    if(s.opacity<=0){
      s.osc.amp(0,0.2);
      s.osc.stop(0.2);
      shapes.splice(i,1);
      continue;
    }

    // Draw main shape
    push();
    translate(s.x, s.y, s.z);
    fill(s.color[0], s.color[1], s.color[2], s.opacity);
    let size = map(s.baseFreq + freqOffset, 200, 900, 50, 150);
    if(s.type==='sphere') sphere(size * ampScale);
    else box(size * ampScale);
    pop();
  }

  // Display instructions
  push();
  resetMatrix();
  fill(255);
  text("Press A,S,D,F,G,H to generate shapes with sound", width/2 - width/2, 50);
  pop();
}

function keyPressed() {
  userStartAudio();
  let k = key.toUpperCase();
  if (!keyMap[k]) return;

  let config = keyMap[k];
  let osc;
  if(config.type==='sphere') osc = new p5.Oscillator('triangle');
  else osc = new p5.Oscillator('sine');

  osc.freq(config.freq);
  osc.start();
  osc.amp(0.5, 0.05);

  let delay = new p5.Delay();
  delay.process(osc, 0.2, 0.4, 2000);

  let panner = new p5.Panner3D();
  osc.disconnect();
  osc.connect(panner);

  let amp = new p5.Amplitude();
  amp.setInput(osc);

  let s = {
    x: random(-width/2, width/2),
    y: random(-height/2, height/2),
    z: random(-500, 500),
    vx: random(-1,1),
    vy: random(-1,1),
    vz: random(-1,1),
    type: config.type,
    baseFreq: config.freq,
    offset: random(TWO_PI),
    osc: osc,
    panner: panner,
    color: config.color,
    opacity: 255,
    trail: [],
    amp: amp
  };
  shapes.push(s);
}

function keyReleased(){
  if(shapes.length>0){
    let s = shapes[shapes.length-1];
    s.osc.amp(0,0.5);
    s.osc.stop(0.5);
  }
}

function windowResized(){
  resizeCanvas(windowWidth, windowHeight);
}

function mouseWheel(event){
  camZoom += event.delta*0.5;
  camZoom = constrain(camZoom,-500,1000);
}
</script>
</body>
</html>
