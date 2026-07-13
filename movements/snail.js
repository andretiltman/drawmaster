/* Snail: a steady, unhurried crawl — no pauses, no jumps, just slow going. */
export const snail = {
  baseSpeed(){
    return 6 + Math.random()*4;
  },
  initialState(){
    return {};
  },
  update(c, dt, r, { wallBounce }){
    c.x += c.vx*dt;
    wallBounce(c, r);
    return 0;
  }
};
