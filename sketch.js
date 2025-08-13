function getFreqRandomOctave(interval) {
  // Only use the lower octave (C3-ish)
  let baseFreq = 130.81; // C3
  return baseFreq * pow(2, interval / 12) * random(0.98, 1.02); // tiny detune
}

function keyPressed() {
  userStartAudio();

  let idx = keysList.indexOf(key.toLowerCase());
  if (idx === -1) return;

  let interval = scaleIntervals[idx % scaleIntervals.length];
  let freq = getFreqRandomOctave(interval);

  let osc = new p5.Oscillator('triangle');
  osc.freq(freq);
  osc.start();

  let filter = new p5.LowPass();
  filter.freq(1200); // slightly lower to smoothen
  filter.res(1.5);
  osc.disconnect();
  osc.connect(filter);

  let env = new p5.Envelope();
  env.setADSR(0.05, 0.1, 0.3, 0.6);
  env.setRange(0.35, 0);
  env.play(osc);

  let reverb = new p5.Reverb();
  reverb.process(osc, 2, 2); 

  let delay = new p5.Delay();
  delay.process(osc, 0.075, 0.25, 1000); // shorter and smoother

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
