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

export function playPurr(duration){
  duration = duration || 0.9;
  const ctx = getAudioCtx();
  const t0 = ctx.currentTime;
  const master = ctx.createGain();
  master.gain.setValueAtTime(0.0001, t0);
  master.gain.exponentialRampToValueAtTime(0.22, t0+0.1);
  master.gain.setValueAtTime(0.22, t0+Math.max(duration-0.2, 0.1));
  master.gain.exponentialRampToValueAtTime(0.0001, t0+duration);
  master.connect(ctx.destination);
  [44, 47].forEach(freq=>{
    const osc = ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.value = freq;
    osc.connect(master);
    osc.start(t0);
    osc.stop(t0+duration);
  });
}
