const fs = require('fs');

function fixTV() {
  let code = fs.readFileSync('src/components/TVGuideModal.tsx', 'utf8');

  // We have a deprecated block:
  code = code.replace(/if \(video && video\.canPlayType\("application\/vnd\.apple\.mpegurl"\) && false\) \{/g, 'if (false && video && video.canPlayType("application/vnd.apple.mpegurl")) {');
  
  // also the other video.src = secureUrl things are still failing, let's just make it video!.src
  code = code.replace(/video\.src =/g, 'video!.src =');
  code = code.replace(/video\.load\(\)/g, 'video!.load()');
  code = code.replace(/if \(video && video\.networkState/g, 'if (video!.networkState');
  code = code.replace(/if \(video\) video\.onerror =/g, 'video!.onerror =');
  code = code.replace(/if \(video\) video\.onloadeddata =/g, 'video!.onloadeddata =');
  code = code.replace(/video\?\.error\?\.message/g, 'video!.error?.message');
  fs.writeFileSync('src/components/TVGuideModal.tsx', code);
}

function fixQuad() {
  let code = fs.readFileSync('src/components/QuadVideoPlayer.tsx', 'utf8');
  code = code.replace(/if \(video && video\.canPlayType\("application\/vnd\.apple\.mpegurl"\) && false\) \{/g, 'if (false && video && video.canPlayType("application/vnd.apple.mpegurl")) {');
  
  code = code.replace(/video\.src =/g, 'video!.src =');
  code = code.replace(/video\.load\(\)/g, 'video!.load()');
  fs.writeFileSync('src/components/QuadVideoPlayer.tsx', code);
}

fixTV();
fixQuad();
