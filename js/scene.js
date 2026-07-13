/* The live stage: creature list, per-frame render loop, drag/fling input,
   and the sparkle burst effect. Movement behavior itself lives in
   movements/ — this module just calls into whichever one a creature uses. */
import { floorBounds, perspectiveScale } from './camera.js';
import { getMovement } from '../movements/index.js';

export function initScene({ stage, liveCanvas, camera }){
  const lctx = liveCanvas.getContext('2d');
  const dpr = Math.min(window.devicePixelRatio||1, 2);

  let creatures = [];
  let dragging = null; // { c, x, y, t, vx, cleanup } while a creature is being dragged
  let burst = []; // sparkle particles for transitions
  let frameCount = 0;
  let lastTime = performance.now();
  let loopStarted = false;

  function resizeCanvas(){
    const r = stage.getBoundingClientRect();
    liveCanvas.width = r.width * dpr;
    liveCanvas.height = r.height * dpr;
    liveCanvas.style.width = r.width+'px';
    liveCanvas.style.height = r.height+'px';
  }
  window.addEventListener('resize', resizeCanvas);
  const ro = new ResizeObserver(()=>{ if(camera.isStarted()) resizeCanvas(); });
  ro.observe(stage);

  function spawnBurst(x,y){
    for(let i=0;i<18;i++){
      const ang = Math.random()*Math.PI*2;
      const speed = 60 + Math.random()*120;
      burst.push({
        x, y,
        vx: Math.cos(ang)*speed,
        vy: Math.sin(ang)*speed,
        life: 1,
        color: [ '#FF6B57','#2BC4B8','#FFC64B','#9B7EDE'][i%4],
        size: 3 + Math.random()*4
      });
    }
  }

  function addCreature(sprite, type){
    const r = stage.getBoundingClientRect();
    const targetH = Math.min(r.height*0.28, 220);
    const scale = targetH / sprite.height;
    const w = sprite.width*scale, h = sprite.height*scale;
    const { top, bottom } = floorBounds(r);
    const movement = getMovement(type);
    const baseVx = movement.baseSpeed();
    creatures.push(Object.assign({
      id: creatures.length,
      type,
      img: sprite,
      w, h,
      x: Math.random()*(r.width - w) + w/2,
      y: top + Math.random()*(bottom-top),
      vx: (Math.random()<0.5?-1:1) * baseVx,
      phase: Math.random()*Math.PI*2,
      renderScale: 1,
      groundColor: null
    }, movement.initialState()));
    const c = creatures[creatures.length-1];
    spawnBurst(c.x, c.y);
  }

  function wallBounce(c, r){
    if(c.x - c.w/2 < 0){ c.x = c.w/2; c.vx = Math.abs(c.vx); }
    if(c.x + c.w/2 > r.width){ c.x = r.width - c.w/2; c.vx = -Math.abs(c.vx); }
  }

  function loop(now){
    if(!camera.isStarted()) return;
    const dt = Math.min((now-lastTime)/1000, 0.05);
    lastTime = now;
    frameCount++;

    const r = stage.getBoundingClientRect();
    lctx.save();
    lctx.setTransform(dpr,0,0,dpr,0,0);
    lctx.clearRect(0,0,r.width,r.height);

    // update + draw creatures
    for(const c of creatures){
      const isDragging = dragging && dragging.c === c;
      const jumpOffset = isDragging ? 0 : getMovement(c.type).update(c, dt, r, { wallBounce });
      // step cadence speeds up with stride speed, like a real walking gait
      c.phase += (Math.abs(c.vx) * 0.11 + 0.6) * dt;

      const dir = c.vx < 0 ? -1 : 1;
      const stepBob = Math.abs(Math.sin(c.phase));      // two footfalls per cycle
      const bob = stepBob * 7;                            // small human-scale bounce
      const lean = Math.sin(c.phase*2) * 0.09 * dir;      // weight shifts side to side each step
      const jumpT = jumpOffset / 46;                       // 0..1 while a cat is airborne
      const squashX = 1 + stepBob*0.06 + jumpT*0.12;      // slight compress/stretch on footfall or leap
      const squashY = 1 - stepBob*0.06 - jumpT*0.18;

      // depth: shrink/grow with distance from the "horizon" and pick up
      // the real floor's color under the creature's feet every few frames
      c.renderScale = perspectiveScale(c.y, r);
      if((frameCount + c.id) % 9 === 0){
        const sampled = camera.sampleGroundColor(c.x, c.y, r);
        if(sampled) c.groundColor = sampled;
      }

      const w = c.w * c.renderScale, h = c.h * c.renderScale;
      const groundY = c.y;
      const drawY = groundY - bob*c.renderScale - jumpOffset;
      const shadowScale = Math.max(0.15, 1 - bob/40 - jumpT*0.5);

      // shadow — tinted with the sampled floor color so it blends into the real surface
      lctx.save();
      lctx.globalAlpha = 0.32 * shadowScale;
      lctx.fillStyle = c.groundColor
        ? `rgb(${Math.round(c.groundColor[0]*0.3)}, ${Math.round(c.groundColor[1]*0.3)}, ${Math.round(c.groundColor[2]*0.3)})`
        : '#000';
      lctx.beginPath();
      lctx.ellipse(c.x, groundY + h*0.06, (w*0.32)*shadowScale, h*0.08*shadowScale, 0, 0, Math.PI*2);
      lctx.fill();
      lctx.restore();

      // creature (footstep bounce + weight-shift lean, like a walking stride)
      lctx.save();
      lctx.translate(c.x, drawY - h/2);
      lctx.rotate(lean);
      lctx.scale(dir, 1);
      lctx.scale(squashX, squashY);
      lctx.drawImage(c.img, -w/2, -h/2, w, h);
      lctx.restore();

      // halo ring showing which creature is being dragged right now
      if(isDragging){
        lctx.save();
        lctx.globalAlpha = 0.9;
        lctx.strokeStyle = '#2BC4B8';
        lctx.lineWidth = 3;
        lctx.setLineDash([7,5]);
        lctx.beginPath();
        lctx.ellipse(c.x, drawY - h/2, w*0.62, h*0.62, 0, 0, Math.PI*2);
        lctx.stroke();
        lctx.restore();
      }
    }

    // burst particles
    for(let i=burst.length-1;i>=0;i--){
      const p = burst[i];
      p.life -= dt*1.6;
      if(p.life<=0){ burst.splice(i,1); continue; }
      p.x += p.vx*dt; p.y += p.vy*dt;
      p.vy += 40*dt;
      lctx.save();
      lctx.globalAlpha = Math.max(p.life,0);
      lctx.fillStyle = p.color;
      lctx.beginPath();
      lctx.arc(p.x, p.y, p.size, 0, Math.PI*2);
      lctx.fill();
      lctx.restore();
    }

    lctx.restore();
    requestAnimationFrame(loop);
  }

  function startLoop(){
    if(loopStarted) return;
    loopStarted = true;
    resizeCanvas();
    requestAnimationFrame(loop);
  }

  function hitTest(x,y){
    for(let i=creatures.length-1;i>=0;i--){
      const c = creatures[i];
      const scale = c.renderScale || 1;
      if(Math.abs(x-c.x) < (c.w*scale)/2 && Math.abs(y-c.y) < (c.h*scale)/2) return c;
    }
    return null;
  }

  liveCanvas.addEventListener('pointerdown', (e)=>{
    const r = stage.getBoundingClientRect();
    const x = e.clientX - r.left, y = e.clientY - r.top;
    const c = hitTest(x, y);
    if(c){
      liveCanvas.setPointerCapture(e.pointerId);
      dragging = { c, x, y, t: performance.now(), vx: 0, cleanup: null };
      c.phase += Math.PI/2;
      spawnBurst(c.x, c.y - c.h/2);
      const onPickup = getMovement(c.type).onPickup;
      if(onPickup) dragging.cleanup = onPickup(c) || null;
    }
  });

  liveCanvas.addEventListener('pointermove', (e)=>{
    if(!dragging) return;
    const r = stage.getBoundingClientRect();
    const x = e.clientX - r.left, y = e.clientY - r.top;
    const now = performance.now();
    const dt = Math.max((now - dragging.t)/1000, 0.001);
    const c = dragging.c;
    dragging.vx = (x - dragging.x) / dt;
    const { top, bottom } = floorBounds(r);
    c.x = Math.min(r.width - c.w/2, Math.max(c.w/2, x));
    c.y = Math.min(bottom, Math.max(top, y));
    dragging.x = x; dragging.y = y; dragging.t = now;
  });

  function endDrag(){
    if(!dragging) return;
    if(dragging.cleanup) dragging.cleanup();
    if(Math.abs(dragging.vx) > 20){
      dragging.c.vx = Math.max(-320, Math.min(320, dragging.vx));
    }
    dragging = null;
  }
  liveCanvas.addEventListener('pointerup', endDrag);
  liveCanvas.addEventListener('pointercancel', endDrag);

  return {
    addCreature,
    startLoop,
    resizeCanvas,
    clearAll(){ creatures = []; dragging = null; burst = []; }
  };
}
