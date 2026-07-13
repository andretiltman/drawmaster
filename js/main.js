import { createDrawingPad } from './draw.js';
import { initCamera } from './camera.js';
import { createDrawnBackdrop } from './drawnBackdrop.js';
import { initScene } from './scene.js';
import { getAudioCtx } from './audio.js';

const drawScreen = document.getElementById('drawScreen');
const bgScreen = document.getElementById('bgScreen');
const liveScreen = document.getElementById('liveScreen');
const liveBtn = document.getElementById('liveBtn');
const setBgBtn = document.getElementById('setBgBtn');
const camMsg = document.getElementById('camMsg');
const stage = document.getElementById('stage');
const video = document.getElementById('camVideo');
const bgImage = document.getElementById('bgImage');
const liveCanvas = document.getElementById('liveCanvas');
const creatureTypeSelect = document.getElementById('creatureType');
const backdropModeSelect = document.getElementById('backdropMode');
const flipCamBtn = document.getElementById('flipCamBtn');

const creaturePad = createDrawingPad({
  canvasId: 'drawCanvas', swatchesId: 'swatches', brushInputId: 'brushSizeInput',
  undoBtnId: 'undoBtn', clearBtnId: 'clearDrawBtn', width: 600, height: 600
});
creaturePad.onDrawChange((hasDrawn)=>{ liveBtn.disabled = !hasDrawn; });

const bgPad = createDrawingPad({
  canvasId: 'bgCanvas', swatchesId: 'bgSwatches', brushInputId: 'bgBrushSizeInput',
  undoBtnId: 'bgUndoBtn', clearBtnId: 'bgClearBtn', width: 480, height: 800,
  fillStyle: '#FBF3E4'
});

const cameraBackdrop = initCamera(video, camMsg);
const drawnBackdrop = createDrawnBackdrop(bgPad.getCanvasEl(), bgImage);

let creatureType = creatureTypeSelect.value;
creatureTypeSelect.addEventListener('change', ()=>{ creatureType = creatureTypeSelect.value; });

let backdropMode = backdropModeSelect.value;
backdropModeSelect.addEventListener('change', ()=>{ backdropMode = backdropModeSelect.value; });

let scene = null; // created lazily, bound to whichever backdrop is used first
let pendingSprite = null; // a drawn creature waiting on the background screen

function currentBackdrop(){
  return backdropMode === 'drawn' ? drawnBackdrop : cameraBackdrop;
}

async function bringToLife(sprite){
  liveBtn.disabled = true;
  getAudioCtx(); // unlock audio now, on a user gesture, so later autonomous barks aren't blocked

  const backdrop = currentBackdrop();
  if(!scene){
    scene = initScene({ stage, liveCanvas, backdrop });
    backdropModeSelect.disabled = true; // the room's backdrop is locked in once it's live
  }

  drawScreen.classList.remove('active');
  bgScreen.classList.remove('active');
  liveScreen.classList.add('active');
  flipCamBtn.classList.toggle('hidden', backdropMode === 'drawn');
  video.classList.toggle('hidden', backdropMode === 'drawn');

  let ok;
  if(backdropMode === 'drawn'){
    ok = await drawnBackdrop.start(() => scene.startLoop());
  }else{
    ok = await cameraBackdrop.startCamera(() => scene.startLoop());
    if(ok) camMsg.classList.add('hidden');
  }
  if(ok) scene.addCreature(sprite, creatureType);
}

liveBtn.addEventListener('click', async ()=>{
  if(!creaturePad.hasDrawn()) return;
  const sprite = creaturePad.extractSprite();
  if(!sprite) return;

  if(backdropMode === 'drawn' && !drawnBackdrop.isStarted()){
    pendingSprite = sprite;
    drawScreen.classList.remove('active');
    bgScreen.classList.add('active');
    return;
  }
  await bringToLife(sprite);
});

setBgBtn.addEventListener('click', async ()=>{
  if(!pendingSprite) return;
  const sprite = pendingSprite;
  pendingSprite = null;
  await bringToLife(sprite);
});

document.getElementById('addBtn').addEventListener('click', ()=>{
  creaturePad.resetCanvas();
  liveScreen.classList.remove('active');
  drawScreen.classList.add('active');
});

document.getElementById('clearBtn').addEventListener('click', ()=>{
  if(scene) scene.clearAll();
});

flipCamBtn.addEventListener('click', ()=> cameraBackdrop.flipCamera());

document.getElementById('helpBtn').addEventListener('click', ()=>{
  alert("Draw a little creature, pick a movement style and background, then tap \"Bring it to life\". If you chose \"Draw it\" for the background, sketch a scene first, then tap \"Set background\". Drag a creature to fling it around!");
});
