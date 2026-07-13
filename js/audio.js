/* Synthesized sound effects — no audio files, generated with Web Audio. */
let audioCtx = null;

export function getAudioCtx(){
  if(!audioCtx){
    const AC = window.AudioContext || window.webkitAudioContext;
    audioCtx = new AC();
  }
  if(audioCtx.state === 'suspended') audioCtx.resume();
  return audioCtx;
}

function createNoiseBuffer(ctx, duration){
  const length = Math.max(1, Math.floor(ctx.sampleRate * duration));
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for(let i=0;i<length;i++) data[i] = Math.random()*2 - 1;
  return buffer;
}

export function playBark(){
  const ctx = getAudioCtx();
  const t0 = ctx.currentTime;
  for(let i=0;i<2;i++){
    const start = Math.max(t0, t0 + i*0.2 + (Math.random()-0.5)*0.01);
    const pitch = 1 + (Math.random()-0.5)*0.14; // each bark varies slightly, like a real dog's

    // a short, chesty filtered noise burst gives the bark a gritty, plosive onset
    const noise = ctx.createBufferSource();
    noise.buffer = createNoiseBuffer(ctx, 0.05);
    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.value = 280;
    noiseFilter.Q.value = 0.6;
    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.0001, start);
    noiseGain.gain.exponentialRampToValueAtTime(0.6, start+0.006);
    noiseGain.gain.exponentialRampToValueAtTime(0.0001, start+0.045);
    noise.connect(noiseFilter).connect(noiseGain).connect(ctx.destination);
    noise.start(start);
    noise.stop(start+0.06);

    const lowpass = ctx.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.value = 1100;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(0.6, start+0.01);
    gain.gain.exponentialRampToValueAtTime(0.1, start+0.07); // sharp initial decay
    gain.gain.exponentialRampToValueAtTime(0.0001, start+0.17); // then a short tail
    lowpass.connect(gain);
    gain.connect(ctx.destination);

    // growl: a fast, subtle vibrato on the main tone gives it vocal-fold roughness
    // instead of a perfectly clean pitch sweep
    const growl = ctx.createOscillator();
    growl.type = 'sine';
    growl.frequency.value = 55;
    const growlDepth = ctx.createGain();
    growlDepth.gain.value = 16;
    growl.connect(growlDepth);
    growl.start(start);
    growl.stop(start+0.18);

    // main tonal body — a sharp, front-loaded pitch drop (real barks snap down
    // fast, not a smooth glide) plus vibrato from the growl oscillator above
    const osc = ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(300*pitch, start);
    osc.frequency.exponentialRampToValueAtTime(160*pitch, start+0.04);
    osc.frequency.exponentialRampToValueAtTime(115*pitch, start+0.14);
    growlDepth.connect(osc.frequency);
    osc.connect(lowpass);
    osc.start(start);
    osc.stop(start+0.18);

    // an octave-down layer adds chest weight, so it reads as a "woof" rather
    // than a thin beep
    const sub = ctx.createOscillator();
    sub.type = 'sawtooth';
    sub.frequency.setValueAtTime(150*pitch, start);
    sub.frequency.exponentialRampToValueAtTime(58*pitch, start+0.14);
    const subGain = ctx.createGain();
    subGain.gain.value = 0.6;
    sub.connect(subGain).connect(lowpass);
    sub.start(start);
    sub.stop(start+0.18);
  }
}

export function playTweet(){
  const ctx = getAudioCtx();
  const t0 = ctx.currentTime;
  [0, 0.11].forEach((offset, i)=>{
    const start = t0 + offset;
    const base = 1800 + i*250;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(base, start);
    osc.frequency.exponentialRampToValueAtTime(base*1.6, start+0.05);
    osc.frequency.exponentialRampToValueAtTime(base*1.1, start+0.09);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(0.3, start+0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, start+0.09);
    osc.connect(gain).connect(ctx.destination);
    osc.start(start);
    osc.stop(start+0.1);
  });
}

export function playPurr(duration){
  duration = duration || 0.9;
  const ctx = getAudioCtx();
  const t0 = ctx.currentTime;

  const master = ctx.createGain();
  master.gain.setValueAtTime(0.0001, t0);
  master.gain.exponentialRampToValueAtTime(0.4, t0+0.15);
  master.gain.setValueAtTime(0.4, t0+Math.max(duration-0.25, 0.1));
  master.gain.exponentialRampToValueAtTime(0.0001, t0+duration);
  master.connect(ctx.destination);

  // a lowpass rounds off the sawtooth's harsh upper harmonics into a warm rumble
  const lowpass = ctx.createBiquadFilter();
  lowpass.type = 'lowpass';
  lowpass.frequency.value = 220;
  lowpass.connect(master);

  // amplitude tremolo gives the purr its characteristic pulsing texture
  const ampGain = ctx.createGain();
  ampGain.gain.value = 0.5;
  ampGain.connect(lowpass);
  const tremolo = ctx.createOscillator();
  tremolo.type = 'sine';
  tremolo.frequency.value = 27; // real purrs pulse at roughly this rate
  const tremoloDepth = ctx.createGain();
  tremoloDepth.gain.value = 0.45;
  tremolo.connect(tremoloDepth);
  tremoloDepth.connect(ampGain.gain);
  tremolo.start(t0);
  tremolo.stop(t0+duration);

  // two very-low, slightly-detuned tones — a real purr's fundamental sits around 25-30 Hz
  [26, 27.5].forEach(freq=>{
    const osc = ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.value = freq;
    osc.connect(ampGain);
    osc.start(t0);
    osc.stop(t0+duration);
  });
}
