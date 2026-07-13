/* Draw screen: canvas, colors, brush size, undo/clear, and sprite extraction. */
const RES = 600;

export function initDraw(){
  const drawCanvas = document.getElementById('drawCanvas');
  const dctx = drawCanvas.getContext('2d', { willReadFrequently: true });
  drawCanvas.width = RES; drawCanvas.height = RES;

  const colors = ['#1C2333','#FF6B57','#2BC4B8','#FFC64B','#9B7EDE','#FFFFFF'];
  let currentColor = colors[0];
  let brushSize = 10;
  const swatchesEl = document.getElementById('swatches');
  colors.forEach((c,i)=>{
    const b = document.createElement('button');
    b.className = 'swatch' + (i===0?' active':'');
    b.style.background = c;
    if(c === '#FFFFFF') b.style.boxShadow = 'inset 0 0 0 1px rgba(0,0,0,0.2)';
    b.addEventListener('click', ()=>{
      currentColor = c;
      [...swatchesEl.children].forEach(ch=>ch.classList.remove('active'));
      b.classList.add('active');
    });
    swatchesEl.appendChild(b);
  });

  const brushSizeInput = document.getElementById('brushSizeInput');
  brushSizeInput.addEventListener('input', ()=>{ brushSize = Number(brushSizeInput.value); });

  let drawing = false;
  let lastPt = null;
  let strokes = []; // for undo: canvas snapshots
  let hasDrawn = false;
  const drawChangeListeners = [];
  function setHasDrawn(v){
    hasDrawn = v;
    drawChangeListeners.forEach(fn => fn(hasDrawn));
  }

  function getPos(e){
    const rect = drawCanvas.getBoundingClientRect();
    const cx = (e.touches ? e.touches[0].clientX : e.clientX);
    const cy = (e.touches ? e.touches[0].clientY : e.clientY);
    return {
      x: (cx - rect.left) / rect.width * RES,
      y: (cy - rect.top) / rect.height * RES
    };
  }

  function snapshot(){
    strokes.push(dctx.getImageData(0,0,RES,RES));
    if(strokes.length > 20) strokes.shift();
  }

  function strokeLine(){
    dctx.lineCap = 'round';
    dctx.lineJoin = 'round';
    dctx.lineWidth = brushSize;
    dctx.strokeStyle = currentColor;
    dctx.stroke();
  }

  function pointerDown(e){
    e.preventDefault();
    drawing = true;
    snapshot();
    lastPt = getPos(e);
    dctx.beginPath();
    dctx.moveTo(lastPt.x, lastPt.y);
    dctx.lineTo(lastPt.x+0.1, lastPt.y+0.1);
    strokeLine();
  }
  function pointerMove(e){
    if(!drawing) return;
    e.preventDefault();
    const p = getPos(e);
    dctx.beginPath();
    dctx.moveTo(lastPt.x, lastPt.y);
    dctx.lineTo(p.x, p.y);
    strokeLine();
    lastPt = p;
  }
  function pointerUp(){
    if(!drawing) return;
    drawing = false;
    setHasDrawn(true);
  }

  drawCanvas.addEventListener('pointerdown', pointerDown);
  drawCanvas.addEventListener('pointermove', pointerMove);
  window.addEventListener('pointerup', pointerUp);

  function isCanvasBlank(){
    const d = dctx.getImageData(0,0,RES,RES).data;
    for(let i=3;i<d.length;i+=4){ if(d[i] !== 0) return false; }
    return true;
  }

  document.getElementById('undoBtn').addEventListener('click', ()=>{
    if(strokes.length){
      const img = strokes.pop();
      dctx.putImageData(img,0,0);
      setHasDrawn(!isCanvasBlank());
    }
  });
  document.getElementById('clearDrawBtn').addEventListener('click', ()=>{
    snapshot();
    dctx.clearRect(0,0,RES,RES);
    setHasDrawn(false);
  });

  /* Extract the trimmed, drawn sprite as its own canvas. */
  function extractSprite(){
    const data = dctx.getImageData(0,0,RES,RES);
    const px = data.data;
    let minX=RES, minY=RES, maxX=0, maxY=0, found=false;
    for(let y=0; y<RES; y++){
      for(let x=0; x<RES; x++){
        const a = px[(y*RES+x)*4+3];
        if(a > 10){
          found = true;
          if(x<minX) minX=x;
          if(x>maxX) maxX=x;
          if(y<minY) minY=y;
          if(y>maxY) maxY=y;
        }
      }
    }
    if(!found) return null;
    const pad = 6;
    minX = Math.max(0,minX-pad); minY = Math.max(0,minY-pad);
    maxX = Math.min(RES,maxX+pad); maxY = Math.min(RES,maxY+pad);
    const w = maxX-minX, h = maxY-minY;
    const off = document.createElement('canvas');
    off.width = w; off.height = h;
    off.getContext('2d').drawImage(drawCanvas, minX, minY, w, h, 0, 0, w, h);
    return off;
  }

  function resetCanvas(){
    dctx.clearRect(0,0,RES,RES);
    strokes = [];
    setHasDrawn(false);
  }

  return {
    hasDrawn: () => hasDrawn,
    onDrawChange: (fn) => drawChangeListeners.push(fn),
    extractSprite,
    resetCanvas
  };
}
