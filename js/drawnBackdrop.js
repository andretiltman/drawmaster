/* A hand-drawn backdrop, used instead of the camera feed. Same shape as
   camera.js's instance (isStarted/sampleGroundColor) so scene.js doesn't
   need to care which one it's given. */
export function createDrawnBackdrop(canvas, imgEl){
  let started = false;

  function start(onReady){
    if(!started){
      imgEl.src = canvas.toDataURL('image/png');
      imgEl.classList.remove('hidden');
      started = true;
    }
    if(onReady) onReady();
    return Promise.resolve(true);
  }

  function sampleGroundColor(x, y, r){
    const scale = Math.max(r.width/canvas.width, r.height/canvas.height);
    const drawnW = canvas.width*scale, drawnH = canvas.height*scale;
    const offsetX = (r.width-drawnW)/2, offsetY = (r.height-drawnH)/2;
    const bx = (x-offsetX)/scale, by = (y-offsetY)/scale;
    const sx = Math.max(0, Math.min(canvas.width-6, Math.round(bx)-3));
    const sy = Math.max(0, Math.min(canvas.height-6, Math.round(by)-3));
    try{
      const d = canvas.getContext('2d').getImageData(sx, sy, 6, 6).data;
      let rs=0, gs=0, bs=0, n=0;
      for(let i=0;i<d.length;i+=4){ rs+=d[i]; gs+=d[i+1]; bs+=d[i+2]; n++; }
      return [rs/n, gs/n, bs/n];
    }catch(e){
      return null;
    }
  }

  return {
    start,
    isStarted: () => started,
    sampleGroundColor
  };
}
