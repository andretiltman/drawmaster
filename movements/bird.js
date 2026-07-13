import { playTweet } from '../js/audio.js';
import { findNearestOfType } from './utils.js';

const EAT_RANGE = 40;

/* Bird: flits around fast and erratically, changing direction at random
   short intervals, and stays aloft with a steady hover height instead of
   walking on the ground. Tweets when picked up and every so often mid-flight.
   If a snail is on stage, the bird swoops down and eats it. */
export const bird = {
  baseSpeed(){
    return 60 + Math.random()*50;
  },
  initialState(){
    return {
      behaviorT: 0.4 + Math.random()*0.8,
      hoverPhase: Math.random()*Math.PI*2,
      chirpT: 1.5 + Math.random()*2.5
    };
  },
  update(c, dt, r, { wallBounce, creatures, removeCreature, spawnBurst }){
    c.behaviorT -= dt;
    c.chirpT -= dt;
    c.hoverPhase += dt*5;

    const snail = findNearestOfType(c, 'snail', creatures);
    let hoverHeight = 34;

    if(snail){
      const dx = snail.target.x - c.x;
      c.vx = (dx >= 0 ? 1 : -1) * (60 + Math.random()*20);
      c.y += (snail.target.y - c.y) * Math.min(1, dt*3); // swoop down toward it
      const gap = Math.abs(dx) + Math.abs(snail.target.y - c.y);
      hoverHeight = Math.max(4, Math.min(34, gap*0.4));
      if(gap < EAT_RANGE){
        removeCreature(snail.target);
        spawnBurst(c.x, c.y);
        playTweet();
        c.behaviorT = 0.3 + Math.random()*0.5; // dart off after eating
      }
    } else if(c.behaviorT <= 0){
      c.vx = (Math.random()<0.5?-1:1) * (60 + Math.random()*50);
      c.behaviorT = 0.4 + Math.random()*0.8;
    }

    if(c.chirpT <= 0){
      playTweet();
      c.chirpT = 2 + Math.random()*3;
    }

    c.x += c.vx*dt;
    wallBounce(c, r);
    return hoverHeight + Math.sin(c.hoverPhase)*(snail ? 6 : 10); // steadier while hunting
  },
  onPickup(){
    playTweet();
  }
};
