/* Bunny: hops continuously — a quick arc, a brief pause, then the next hop —
   rather than walking smoothly or pouncing occasionally like a cat. */
export const bunny = {
  baseSpeed(){
    return 45 + Math.random()*20;
  },
  initialState(){
    return { state: 'grounded', behaviorT: 0.15 + Math.random()*0.15, jumpT: 0 };
  },
  update(c, dt, r, { wallBounce }){
    if(c.state === 'hopping'){
      c.jumpT += dt/0.35;
      c.x += c.vx*dt;
      wallBounce(c, r);
      if(c.jumpT >= 1){
        c.jumpT = 0;
        c.state = 'grounded';
        c.behaviorT = 0.1 + Math.random()*0.15; // brief pause between hops
      }
      return Math.sin(Math.min(c.jumpT,1)*Math.PI) * 30;
    }
    c.behaviorT -= dt;
    if(c.behaviorT <= 0){
      c.state = 'hopping';
      c.jumpT = 0;
    }
    return 0;
  }
};
