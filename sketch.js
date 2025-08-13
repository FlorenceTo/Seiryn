function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  noStroke();
  userStartAudio(); // ensure audio context works
}

function draw() {
  background(0);

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

  // Draw shapes
  for (let i = shapes.length - 1; i >= 0; i--) {
    let s = shapes[i];
    s.x += s.vx; s.y += s.vy; s.z += s.vz;

    push();
    translate(s.x, s.y, s.z);
    fill(s.color[0], s.color[1], s.color[2], s.opacity);
    let size = map(s.baseFreq, 200, 800, 50, 150);
    if (s.type === 'sphere') sphere(size);
    else box(size);
    pop();
  }

  // Add a simple text in top center
  push();
  translate(0, -height/2 + 50, 0);
  fill(255);
  textAlign(CENTER, CENTER);
  textSize(32);
  text("Press A,S,D,F,G,H to create shapes", 0, 0);
  pop();
}
