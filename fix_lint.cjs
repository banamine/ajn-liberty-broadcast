const fs = require('fs');

function fixTVGuide() {
  let code = fs.readFileSync('src/components/TVGuideModal.tsx', 'utf8');
  const target = `} else if (video.canPlayType("application/vnd.apple.mpegurl")) {
          telemetry.trackEvent({ correlationId, emittedBy: 'TVGuideModal', category: 'PLAYER_LIFECYCLE', type: 'native_load', payload: { url: secureUrl } });
          video.src = secureUrl;
          video.load();
          
          // Native Safari circuit breaker
          loadTimeout = window.setTimeout(() => {
             if (video.networkState === video.NETWORK_NO_SOURCE) {
                console.warn("[Circuit Breaker] Native HLS load timed out or failed.");
                telemetry.trackEvent({ correlationId, emittedBy: 'TVGuideModal', category: 'PLAYER_LIFECYCLE', type: 'native_error', payload: { error: 'timeout' } });
                const isLiveMode = show?.showType === 'live' || (show?.channel && CHANNEL_REGISTRY[show.channel]?.type === "live_hls");
                if (isLiveMode) {
                   console.warn("Live mode detected. Falling back.");
                   setErrorMsg("Live stream unavailable. Switching to backup feed.");
                   setTimeout(() => { onClose(); }, 3000);
                } else {
                   console.warn("Archive mode detected. Retry limit reached.");
                   setErrorMsg(\`Stream load timeout.\`);
                }
             }
          }, 8000);
          
          video.onloadeddata = () => {
             clearTimeout(loadTimeout);
             safePlay(video!);
          };
          
          video.onerror = () => {
             clearTimeout(loadTimeout);
             console.warn("[Circuit Breaker] Native player error.");
             telemetry.trackEvent({ correlationId, emittedBy: 'TVGuideModal', category: 'PLAYER_LIFECYCLE', type: 'native_error', payload: { error: video.error?.message || 'unknown' } });
             const isLiveMode = show?.showType === 'live' || (show?.channel && CHANNEL_REGISTRY[show.channel]?.type === "live_hls");
             if (isLiveMode) {
                setErrorMsg("Live stream error. Switching to backup feed.");
                setTimeout(() => { onClose(); }, 3000);
             } else {
                console.warn("Archive mode detected. Retry limit reached for native load.");
                setErrorMsg(\`Unrecoverable Stream Error: \${video.error?.message || 'unknown'}\`);
             }
          };`;

  const newCode = `} else if (video && video.canPlayType("application/vnd.apple.mpegurl")) {
          telemetry.trackEvent({ correlationId, emittedBy: 'TVGuideModal', category: 'PLAYER_LIFECYCLE', type: 'native_load', payload: { url: secureUrl } });
          video.src = secureUrl;
          video.load();
          
          // Native Safari circuit breaker
          loadTimeout = window.setTimeout(() => {
             if (video && video.networkState === video.NETWORK_NO_SOURCE) {
                console.warn("[Circuit Breaker] Native HLS load timed out or failed.");
                telemetry.trackEvent({ correlationId, emittedBy: 'TVGuideModal', category: 'PLAYER_LIFECYCLE', type: 'native_error', payload: { error: 'timeout' } });
                const isLiveMode = show?.showType === 'live' || (show?.channel && CHANNEL_REGISTRY[show.channel]?.type === "live_hls");
                if (isLiveMode) {
                   console.warn("Live mode detected. Falling back.");
                   setErrorMsg("Live stream unavailable. Switching to backup feed.");
                   setTimeout(() => { onClose(); }, 3000);
                } else {
                   console.warn("Archive mode detected. Retry limit reached.");
                   setErrorMsg(\`Stream load timeout.\`);
                }
             }
          }, 8000);
          
          video.onloadeddata = () => {
             clearTimeout(loadTimeout);
             safePlay(video!);
          };
          
          video.onerror = () => {
             clearTimeout(loadTimeout);
             console.warn("[Circuit Breaker] Native player error.");
             telemetry.trackEvent({ correlationId, emittedBy: 'TVGuideModal', category: 'PLAYER_LIFECYCLE', type: 'native_error', payload: { error: video?.error?.message || 'unknown' } });
             const isLiveMode = show?.showType === 'live' || (show?.channel && CHANNEL_REGISTRY[show.channel]?.type === "live_hls");
             if (isLiveMode) {
                setErrorMsg("Live stream error. Switching to backup feed.");
                setTimeout(() => { onClose(); }, 3000);
             } else {
                console.warn("Archive mode detected. Retry limit reached for native load.");
                setErrorMsg(\`Unrecoverable Stream Error: \${video?.error?.message || 'unknown'}\`);
             }
          };`;
  
  if (code.includes('if (video.canPlayType("application/vnd.apple.mpegurl")) {')) {
     code = code.replace(/\} else if \(video\.canPlayType\("application\/vnd\.apple\.mpegurl"\)\) \{[\s\S]*?Unrecoverable Stream Error: \${video\.error\?\.message \|\| 'unknown'}"\);[\s\S]*?\}[\s\S]*?\};/, newCode);
     fs.writeFileSync('src/components/TVGuideModal.tsx', code);
  }
}

function fixQuad() {
  let code = fs.readFileSync('src/components/QuadVideoPlayer.tsx', 'utf8');
  const target = `} else if (video.canPlayType("application/vnd.apple.mpegurl")) {
          telemetry.trackEvent({ correlationId, emittedBy: 'QuadVideoPlayer', category: 'PLAYER_LIFECYCLE', type: 'native_load', payload: { url: secureUrl } });
          video.src = secureUrl;
          video.load();
        }`;
  const rep = `} else if (video && video.canPlayType("application/vnd.apple.mpegurl")) {
          telemetry.trackEvent({ correlationId, emittedBy: 'QuadVideoPlayer', category: 'PLAYER_LIFECYCLE', type: 'native_load', payload: { url: secureUrl } });
          video.src = secureUrl;
          video.load();
        }`;
  if (code.includes(target)) {
    code = code.replace(target, rep);
    fs.writeFileSync('src/components/QuadVideoPlayer.tsx', code);
  }
}

fixQuad();
fixTVGuide();
