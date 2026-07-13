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
    const start = t0 + i*0.18;

    // a short filtered noise burst gives the bark a gritty, plosive onset
    const noise = ctx.createBufferSource();
    noise.buffer = createNoiseBuffer(ctx, 0.05);
    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.value = 450;
    noiseFilter.Q.value = 0.9;
    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.0001, start);
    noiseGain.gain.exponentialRampToValueAtTime(0.5, start+0.008);
    noiseGain.gain.exponentialRampToValueAtTime(0.0001, start+0.05);
    noise.connect(noiseFilter).connect(noiseGain).connect(ctx.destination);
    noise.start(start);
    noise.stop(start+0.06);

    // the tonal "woof" body — falling pitch, softened by a lowpass so it's
    // not just a harsh raw sawtooth
    const osc = ctx.createOscillator();
    const lowpass = ctx.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.value = 900;
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(380, start);
    osc.frequency.exponentialRampToValueAtTime(140, start+0.12);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(0.6, start+0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, start+0.16);
    osc.connect(lowpass).connect(gain).connect(ctx.destination);
    osc.start(start);
    osc.stop(start+0.18);
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
