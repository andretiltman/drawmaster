/* Polar bear: a big, slow, lumbering walk that pauses every so often as if
   sniffing around before continuing. */
export const polarBear = {
  baseSpeed(){
    return 16 + Math.random()*8;
  },
  initialState(){
    return { state: 'walking', behaviorT: 2 + Math.random()*3 };
  },
  update(c, dt, r, { wallBounce }){
    c.behaviorT -= dt;
    if(c.state === 'walking'){
      c.x += c.vx*dt;
      wallBounce(c, r);
      if(c.behaviorT <= 0){
        c.state = 'pausing';
        c.behaviorT = 1 + Math.random()*1.5;
        c.pausedVx = c.vx;
        c.vx = 0;
      }
    } else if(c.behaviorT <= 0){
      c.state = 'walking';
      c.behaviorT = 2 + Math.random()*3;
      c.vx = c.pausedVx || (Math.random()<0.5?-1:1) * (16 + Math.random()*8);
    }
    return 0;
  }
};
