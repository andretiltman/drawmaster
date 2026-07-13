/* Camera lifecycle, plus the ground-mapping depth illusion: the lower part
   of the camera frame is treated as a "floor" creatures walk on, shrinking
   with distance and picking up the real floor's color for their shadow. */

export function floorBounds(r){
  return { top: r.height*0.42, bottom: r.height*0.95 };
}

export function perspectiveScale(y, r){
  const { top, bottom } = floorBounds(r);
  const t = Math.min(1, Math.max(0, (y-top)/(bottom-top)));
  return 0.6 + 0.55*t; // smaller near the horizon, bigger up close
}

const sampleCanvas = document.createElement('canvas');
sampleCanvas.width = 6; sampleCanvas.height = 6;
const sctx = sampleCanvas.getContext('2d', { willReadFrequently: true });

export function initCamera(video, camMsg){
  let camStarted = false;
  let camFacing = 'environment';
  let currentStream = null;

  async function openCamera(facing){
    try{
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: facing }, audio: false
      });
      if(currentStream) currentStream.getTracks().forEach(t=>t.stop());
      currentStream = stream;
      video.srcObject = stream;
      video.classList.toggle('rear', facing === 'environment');
      await video.play();
      return true;
    }catch(err){
      camMsg.classList.remove('hidden');
      camMsg.textContent = "Couldn't access your camera (" + (err.message||err.name) + "). Check camera permissions and try again.";
      return false;
    }
  }

  async function startCamera(onStarted){
    if(camStarted) return true;
    const ok = await openCamera(camFacing);
    if(ok){
      camStarted = true;
      if(onStarted) onStarted();
    }
    return ok;
  }

  async function flipCamera(){
    if(!camStarted) return;
    camFacing = camFacing === 'environment' ? 'user' : 'environment';
    await openCamera(camFacing);
  }

  function sampleGroundColor(x, y, r){
    if(!video.videoWidth) return null;
    const scale = Math.max(r.width/video.videoWidth, r.height/video.videoHeight);
    const drawnW = video.videoWidth*scale, drawnH = video.videoHeight*scale;
    const offsetX = (r.width-drawnW)/2, offsetY = (r.height-drawnH)/2;
    let vx = (x-offsetX)/scale, vy = (y-offsetY)/scale;
    if(!video.classList.contains('rear')) vx = video.videoWidth - vx; // mirrored display
    try{
      sctx.drawImage(video, vx-3, vy-3, 6, 6, 0, 0, 6, 6);
      const d = sctx.getImageData(0,0,6,6).data;
      let rs=0, gs=0, bs=0, n=0;
      for(let i=0;i<d.length;i+=4){ rs+=d[i]; gs+=d[i+1]; bs+=d[i+2]; n++; }
      return [rs/n, gs/n, bs/n];
    }catch(e){
      return null; // e.g. video frame not decodable yet
    }
  }

  return {
    startCamera,
    flipCamera,
    isStarted: () => camStarted,
    sampleGroundColor
  };
}
