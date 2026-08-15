const fs = require('fs');

let code = fs.readFileSync('src/components/QuadVideoPlayer.tsx', 'utf8');
code = code.replace(/if \(video\.canPlayType\("application\/vnd\.apple\.mpegurl"\) && false\)/, 'if (video && video.canPlayType("application/vnd.apple.mpegurl") && false)');

code = code.replace(/\} else if \(video\.canPlayType\("application\/vnd\.apple\.mpegurl"\)\)/g, '} else if (video && video.canPlayType("application/vnd.apple.mpegurl"))');
fs.writeFileSync('src/components/QuadVideoPlayer.tsx', code);
