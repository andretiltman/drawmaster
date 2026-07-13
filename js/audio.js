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

export function playBark(){
  const ctx = getAudioCtx();
  const t0 = ctx.currentTime;
  for(let i=0;i<2;i++){
    const start = t0 + i*0.16;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(340, start);
    osc.frequency.exponentialRampToValueAtTime(150, start+0.1);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(0.55, start+0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, start+0.14);
    osc.connect(gain).connect(ctx.destination);
    osc.start(start);
    osc.stop(start+0.16);
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
