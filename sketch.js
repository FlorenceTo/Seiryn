function draw() {
  background(0); // clear background every frame for almost no trail

  for (let i = shapes.length - 1; i >= 0; i--) {
    let s = shapes[i];

    // much faster fade
    s.opacity -= 15; 
    s.glow -= 12; 

    if (s.opacity <= 0) {
      s.osc.amp(0, 0.03);
      s.osc.stop(0.03);
      shapes.splice(i, 1);
      continue;
    }

    fill(255, s.opacity * 0.5); // soft white
    stroke(0, 255, 0, s.glow * 0.3); // subtle green glow
    strokeWeight(0.8);

    if (s.type === 'circle') ellipse(s.x, s.y, s.size);
    else rectMode(CENTER), rect(s.x, s.y, s.size, s.size);
  }
}
