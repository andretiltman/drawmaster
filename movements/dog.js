import { playBark } from '../js/audio.js';
import { findNearestOfType } from './utils.js';

const CAT_BARK_RANGE = 100;
const SHAKE_SPEED = 40;

/* Dog: just runs back and forth, bouncing off the edges of the stage.
   It only barks when a cat is nearby — no more random/periodic barking —
   and while a cat is in range it stops running and shakes back and forth
   in place (an agitated wiggle) instead of moving past it. */
export const dog = {
  baseSpeed(){
    return 70 + Math.random()*40;
  },
  initialState(){
    return { catBarkT: 0, shakePhase: 0, runVx: 0 };
  },
  update(c, dt, r, { wallBounce, creatures }){
    c.catBarkT -= dt;

    const cat = findNearestOfType(c, 'cat', creatures);
    const confronting = !!(cat && cat.distance < CAT_BARK_RANGE);

    if(confronting){
      if(c.catBarkT <= 0){
        playBark();
        c.catBarkT = 1 + Math.random()*0.8;
      }
      if(!c.runVx) c.runVx = c.vx; // remember running speed/direction to resume later
      c.shakePhase += dt*40;
      c.vx = Math.sin(c.shakePhase) * SHAKE_SPEED;
    } else if(c.runVx){
      c.vx = c.runVx; // resume running the way it was headed before
      c.runVx = 0;
    }

    c.x += c.vx*dt;
    wallBounce(c, r);
    return 0;
  },
  onPickup(){
    playBark();
    // no cleanup needed — a bark is a one-shot sound
  }
};
