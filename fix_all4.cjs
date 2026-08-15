const fs = require('fs');

function fixTV() {
  let code = fs.readFileSync('src/components/TVGuideModal.tsx', 'utf8');
  // Just use non-null assertion on video everywhere inside this block
  code = code.replace(/if \(false && video && video!\.canPlayType/g, 'if (false && video!.canPlayType');
  code = code.replace(/if \(video\) video\.src =/g, 'video!.src =');
  code = code.replace(/if \(video\) video\.load/g, 'video!.load');
  code = code.replace(/if \(video\) video\.onerror/g, 'video!.onerror');
  code = code.replace(/if \(video\) video\.onloadeddata/g, 'video!.onloadeddata');
  code = code.replace(/if \(video\?\.networkState/g, 'if (video!.networkState');
  code = code.replace(/video\?\.networkState === video\?\.NETWORK_NO_SOURCE/g, 'video!.networkState === video!.NETWORK_NO_SOURCE');
  
  fs.writeFileSync('src/components/TVGuideModal.tsx', code);
}

function fixQuad() {
  let code = fs.readFileSync('src/components/QuadVideoPlayer.tsx', 'utf8');
  code = code.replace(/if \(false && video && video!\.canPlayType/g, 'if (false && video!.canPlayType');
  code = code.replace(/if \(video\) video\.src =/g, 'video!.src =');
  code = code.replace(/if \(video\) video\.load/g, 'video!.load');
  fs.writeFileSync('src/components/QuadVideoPlayer.tsx', code);
}

fixTV();
fixQuad();
