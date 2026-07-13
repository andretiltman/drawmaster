import { initDraw } from './draw.js';
import { initCamera } from './camera.js';
import { initScene } from './scene.js';
import { getAudioCtx } from './audio.js';

const drawScreen = document.getElementById('drawScreen');
const liveScreen = document.getElementById('liveScreen');
const liveBtn = document.getElementById('liveBtn');
const camMsg = document.getElementById('camMsg');
const stage = document.getElementById('stage');
const video = document.getElementById('camVideo');
const liveCanvas = document.getElementById('liveCanvas');
const creatureTypeSelect = document.getElementById('creatureType');

const draw = initDraw();
draw.onDrawChange((hasDrawn)=>{ liveBtn.disabled = !hasDrawn; });

const camera = initCamera(video, camMsg);
const scene = initScene({ stage, liveCanvas, camera });

let creatureType = creatureTypeSelect.value;
creatureTypeSelect.addEventListener('change', ()=>{ creatureType = creatureTypeSelect.value; });

function showLive(){
  drawScreen.classList.remove('active');
  liveScreen.classList.add('active');
}

liveBtn.addEventListener('click', async ()=>{
  if(!draw.hasDrawn()) return;
  const sprite = draw.extractSprite();
  if(!sprite) return;
  liveBtn.disabled = true;
  getAudioCtx(); // unlock audio now, on a user gesture, so later autonomous barks aren't blocked
  showLive();
  const ok = await camera.startCamera(() => scene.startLoop());
  if(ok){
    camMsg.classList.add('hidden');
    scene.addCreature(sprite, creatureType);
  }
});

document.getElementById('addBtn').addEventListener('click', ()=>{
  draw.resetCanvas();
  drawScreen.classList.add('active');
  liveScreen.classList.remove('active');
});

document.getElementById('clearBtn').addEventListener('click', ()=>{
  scene.clearAll();
});

document.getElementById('flipCamBtn').addEventListener('click', ()=> camera.flipCamera());

document.getElementById('helpBtn').addEventListener('click', ()=>{
  alert("Draw a little creature, pick a movement style (Wanderer, Cat, or Dog), then tap \"Bring it to life\". Your camera turns on and your drawing appears living in your room. Drag it to fling it around!");
});
