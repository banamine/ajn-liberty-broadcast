const fs = require('fs');

let code = fs.readFileSync('src/components/TVGuideModal.tsx', 'utf8');

code = code.replace(/if \(video\.canPlayType\("application\/vnd\.apple\.mpegurl"\) && false\)/, 'if (video && video.canPlayType("application/vnd.apple.mpegurl") && false)');

code = code.replace(/\} else if \(video\.canPlayType\("application\/vnd\.apple\.mpegurl"\)\)/g, '} else if (video && video.canPlayType("application/vnd.apple.mpegurl"))');

code = code.replace(/if \(video\.networkState/g, 'if (video && video.networkState');
code = code.replace(/video\.onerror =/g, 'if (video) video.onerror =');
code = code.replace(/video\.onloadeddata =/g, 'if (video) video.onloadeddata =');
code = code.replace(/video\.error\?\.message/g, 'video?.error?.message');

fs.writeFileSync('src/components/TVGuideModal.tsx', code);
