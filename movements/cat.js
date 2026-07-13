import { playPurr } from '../js/audio.js';
import { findNearestOfType } from './utils.js';

const CHASE_SPEED = 90; // faster than a bird's average speed, so the cat can actually gain on it
const POUNCE_RANGE = 140; // only pounce once the bird is actually close

/* Cat: ambles along slowly and periodically pounces/jumps. There's no real
   object detection here — it's a timed jump arc, not an actual leap onto
   something in the room — but it reads as a cat hopping up onto stuff.
   If a bird is on stage, the cat chases it and pounces more eagerly. */
export const cat = {
  baseSpeed(){
    return 12 + Math.random()*8;
  },
  initialState(){
    return { state: 'walking', behaviorT: 2 + Math.random()*2.5, jumpT: 0 };
  },
  update(c, dt, r, { wallBounce, creatures }){
    const bird = findNearestOfType(c, 'bird', creatures);

    c.behaviorT -= dt;
    if(c.state === 'jumping'){
      c.jumpT += dt/0.5;
      c.x += c.vx*0.5*dt; // creep forward mid-pounce
      wallBounce(c, r);
      if(c.jumpT >= 1){
        c.jumpT = 0;
        c.state = 'walking';
        c.behaviorT = bird ? 0.4 + Math.random()*0.4 : 2 + Math.random()*2.5;
      }
      return Math.sin(Math.min(c.jumpT,1)*Math.PI) * 46; // jump arc height in px
    }
    if(bird){
      c.vx = (bird.target.x > c.x ? 1 : -1) * CHASE_SPEED;
    }
    c.x += c.vx*dt;
    wallBounce(c, r);
    const readyToPounce = !bird || bird.distance < POUNCE_RANGE;
    if(c.behaviorT <= 0 && readyToPounce){
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
