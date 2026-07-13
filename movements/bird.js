import { playTweet } from '../js/audio.js';

/* Bird: flits around fast and erratically, changing direction at random
   short intervals, and stays aloft with a steady hover height instead of
   walking on the ground. Tweets when picked up and every so often mid-flight. */
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
  update(c, dt, r, { wallBounce }){
    c.behaviorT -= dt;
    c.chirpT -= dt;
    c.hoverPhase += dt*5;
    if(c.behaviorT <= 0){
      c.vx = (Math.random()<0.5?-1:1) * (60 + Math.random()*50);
      c.behaviorT = 0.4 + Math.random()*0.8;
    }
    if(c.chirpT <= 0){
      playTweet();
      c.chirpT = 2 + Math.random()*3;
    }
    c.x += c.vx*dt;
    wallBounce(c, r);
    return 34 + Math.sin(c.hoverPhase)*10; // stays airborne with a light flutter
  },
  onPickup(){
    playTweet();
  }
};
