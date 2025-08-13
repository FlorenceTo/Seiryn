function getFreqRandomOctave(interval) {
  // Pick octave -2 or -1 relative to C4
  let octaveShift = random([-2, -1]);
  return baseNote * pow(2, octaveShift) * pow(2, interval / 12);
}

function keyPressed() {
  userStartAudio();

  let idx = keysList.indexOf(key.toLowerCase());
  if (idx === -1) return;

  let interval = scaleIntervals[idx % scaleIntervals.length];
  let freq = getFreqRandomOctave(interval);

  let osc = new p5.Oscillator('triangle');
  osc.freq(freq * random(0.98, 1.02)); // slight detune
  osc.start();

  let filter = new p5.LowPass();
  filter.freq(1500);
  filter.res(2);
  osc.disconnect();
  osc.connect(filter);

  let env = new p5.Envelope();
  env.setADSR(0.05, 0.1, 0.3, 0.7);
  env.setRange(0.4, 0);
  env.play(osc);

  let reverb = new p5.Reverb();
  reverb.process(osc, 2, 2); // reverb stays dreamy

  let delay = new p5.Delay();
  delay.process(osc, 0.075, 0.3, 1200); // delay time halved

  let amp = new p5.Amplitude();
  amp.setInput(osc);

  shapes.push({
    x: random(width),
    y: random(height),
    vx: random(-1, 1),
    vy: random(-1, 1),
    baseFreq: freq,
    osc: osc,
    amp: amp,
    env: env,
    offset: random(TWO_PI),
    opacity: 255,
    size: random(40, 100)
  });
}
