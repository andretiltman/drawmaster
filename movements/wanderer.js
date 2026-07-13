/* Default movement: an easygoing walk that bounces off the edges of the stage. */
export const wanderer = {
  baseSpeed(){
    return 30 + Math.random()*20;
  },
  initialState(){
    return {};
  },
  update(c, dt, r, { wallBounce }){
    c.x += c.vx*dt;
    wallBounce(c, r);
    return 0; // no vertical jump offset
  }
};
