import { playBark } from '../js/audio.js';

/* Dog: runs back and forth at a brisk pace, stopping every so often to bark. */
export const dog = {
  baseSpeed(){
    return 70 + Math.random()*40;
  },
  initialState(){
    return { state: 'running', behaviorT: 1.2 + Math.random()*1.6 };
  },
  update(c, dt, r, { wallBounce }){
    c.behaviorT -= dt;
    if(c.state === 'running'){
      c.x += c.vx*dt;
      wallBounce(c, r);
      if(c.behaviorT <= 0){
        c.state = 'barking';
        c.behaviorT = 0.5 + Math.random()*0.4;
        c.pausedVx = c.vx;
        c.vx = 0;
        playBark();
      }
    } else if(c.behaviorT <= 0){
      c.state = 'running';
      c.behaviorT = 1.4 + Math.random()*1.6;
      const speed = 70 + Math.random()*40;
      c.vx = -Math.sign(c.pausedVx || 1) * speed; // reverse each time — runs back and forth
    }
    return 0;
  },
  onPickup(){
    playBark();
    // no cleanup needed — a bark is a one-shot sound
  }
};
