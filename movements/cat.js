import { playPurr } from '../js/audio.js';

/* Cat: ambles along slowly and periodically pounces/jumps. There's no real
   object detection here — it's a timed jump arc, not an actual leap onto
   something in the room — but it reads as a cat hopping up onto stuff. */
export const cat = {
  baseSpeed(){
    return 12 + Math.random()*8;
  },
  initialState(){
    return { state: 'walking', behaviorT: 2 + Math.random()*2.5, jumpT: 0 };
  },
  update(c, dt, r, { wallBounce }){
    c.behaviorT -= dt;
    if(c.state === 'jumping'){
      c.jumpT += dt/0.5;
      c.x += c.vx*0.5*dt; // creep forward mid-pounce
      wallBounce(c, r);
      if(c.jumpT >= 1){
        c.jumpT = 0;
        c.state = 'walking';
        c.behaviorT = 2 + Math.random()*2.5;
      }
      return Math.sin(Math.min(c.jumpT,1)*Math.PI) * 46; // jump arc height in px
    }
    c.x += c.vx*dt;
    wallBounce(c, r);
    if(c.behaviorT <= 0){
      c.state = 'jumping';
      c.jumpT = 0;
    }
    return 0;
  },
  onPickup(){
    playPurr(1.1);
    const intervalId = setInterval(()=>playPurr(1.1), 1000);
    return () => clearInterval(intervalId); // stop purring on release
  }
};
