const fs = require('fs');

function fixTV() {
  let code = fs.readFileSync('src/components/TVGuideModal.tsx', 'utf8');
  code = code.replace(/if \(video!\.networkState === video!\.NETWORK_NO_SOURCE/g, 'if (video!.networkState === video!.NETWORK_NO_SOURCE'); // wait
  // I need to find line 311.
  fs.writeFileSync('src/components/TVGuideModal.tsx', code);
}
fixTV();
