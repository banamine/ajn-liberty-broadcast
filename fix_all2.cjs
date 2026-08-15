const fs = require('fs');

function fixTV() {
  let code = fs.readFileSync('src/components/TVGuideModal.tsx', 'utf8');

  // The deprecated block uses 'if (false && video && ...)'
  // Then inside we have video.src and video.load
  code = code.replace(/video\.src =/g, 'video!.src =');
  code = code.replace(/video\.load\(\)/g, 'video!.load()');
  code = code.replace(/video!\.src =/g, 'if (video) video.src =');
  code = code.replace(/video!\.load\(\)/g, 'if (video) video.load()');
  code = code.replace(/video!\.onerror =/g, 'if (video) video.onerror =');
  code = code.replace(/video!\.onloadeddata =/g, 'if (video) video.onloadeddata =');
  
  // also fix safePlay(video) if any
  code = code.replace(/safePlay\(video\)/g, 'if (video) safePlay(video)');
  
  fs.writeFileSync('src/components/TVGuideModal.tsx', code);
}

function fixQuad() {
  let code = fs.readFileSync('src/components/QuadVideoPlayer.tsx', 'utf8');
  code = code.replace(/video\.src =/g, 'video!.src =');
  code = code.replace(/video\.load\(\)/g, 'video!.load()');
  code = code.replace(/video!\.src =/g, 'if (video) video.src =');
  code = code.replace(/video!\.load\(\)/g, 'if (video) video.load()');
  fs.writeFileSync('src/components/QuadVideoPlayer.tsx', code);
}

fixTV();
fixQuad();
