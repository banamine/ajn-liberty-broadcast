const fs = require('fs');

function fixTV() {
  let code = fs.readFileSync('src/components/TVGuideModal.tsx', 'utf8');
  code = code.replace(/if \(false && video && video\.canPlayType/g, 'if (false && video && video!.canPlayType');
  code = code.replace(/if \(video! \? video!.networkState : video\.networkState\)/g, 'if (video?.networkState)');
  code = code.replace(/if \(video! \? video\.networkState : video\.networkState\)/g, 'if (video?.networkState)');
  code = code.replace(/video\.networkState === video\.NETWORK_NO_SOURCE/g, 'video?.networkState === video?.NETWORK_NO_SOURCE');
  fs.writeFileSync('src/components/TVGuideModal.tsx', code);
}

function fixQuad() {
  let code = fs.readFileSync('src/components/QuadVideoPlayer.tsx', 'utf8');
  code = code.replace(/if \(false && video && video\.canPlayType/g, 'if (false && video && video!.canPlayType');
  fs.writeFileSync('src/components/QuadVideoPlayer.tsx', code);
}

fixTV();
fixQuad();
