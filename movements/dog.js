import { playBark } from '../js/audio.js';
import { findNearestOfType } from './utils.js';

const CAT_BARK_RANGE = 100;

/* Dog: runs back and forth at a brisk pace, stopping every so often to bark.
   Also barks whenever a cat wanders within range, independent of its own
   run/pause cycle (with a cooldown so it doesn't spam). */
export const dog = {
  baseSpeed(){
    return 70 + Math.random()*40;
  },
  initialState(){
    return { state: 'running', behaviorT: 1.2 + Math.random()*1.6, catBarkT: 0 };
  },
  update(c, dt, r, { wallBounce, creatures }){
    c.behaviorT -= dt;
    c.catBarkT -= dt;

    const cat = findNearestOfType(c, 'cat', creatures);
    if(cat && cat.distance < CAT_BARK_RANGE && c.catBarkT <= 0){
      playBark();
      c.catBarkT = 1.5 + Math.random()*1.5;
    }

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
