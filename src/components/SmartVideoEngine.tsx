import React, { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import { Volume2 } from 'lucide-react';

interface SmartVideoEngineProps {
  url: string;
  onPlaying?: () => void;
}

export const SmartVideoEngine: React.FC<SmartVideoEngineProps> = ({ url, onPlaying: onPlayingCallback }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [status, setStatus] = useState<string>('AWAITING SIGNAL');
  const [autoplayBlocked, setAutoplayBlocked] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !url) return;

    // Clean up previous HLS instance when switching channels
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    let isMounted = true;
    setStatus('ANALYZING PROTOCOL...');

    const handlePlayError = (e: any) => {
      if (e.name === 'NotAllowedError') {
        if (isMounted) setAutoplayBlocked(true);
        video.muted = true;
        video.play().catch(() => {});
      } else {
        console.warn("Autoplay deferred:", e);
      }
    };

    const onPlaying = () => {
      if (isMounted && status !== 'PLAYING') {
        setStatus('PLAYING');
      }
      if (onPlayingCallback) {
        onPlayingCallback();
      }
    };

    video.addEventListener('playing', onPlaying);
    video.addEventListener('timeupdate', onPlaying);

    const initializePlayout = async () => {
      let targetStream = url;

      try {
        // 1. RUMBLE EMBED BYPASS: Extracts raw HLS tokens, skipping iframes entirely
        if (targetStream.includes('rumble.com/embed/')) {
          setStatus('EXTRACTING RUMBLE HLS TOKENS...');
          const match = targetStream.match(/\/embed\/([^\/?]+)/);
          const videoId = match ? match[1] : null;
          
          if (videoId) {
            const res = await fetch(`/api/rumble/stream-data/${videoId}`);
            if (res.ok) {
              const payload = await res.json();
              if (payload.success && payload.data?.u?.hls?.url) {
                targetStream = payload.data.u.hls.url;
              } else if (payload.success && payload.data?.u?.mp4?.['480']?.url) {
                targetStream = payload.data.u.mp4['480'].url; // MP4 Fallback
              }
            }
          }
        }

        if (!isMounted) return;

        const isFlatFile = targetStream.toLowerCase().includes('.m4v') || targetStream.toLowerCase().includes('.mp4');

        // 2. CORS GATEWAY: Routes raw M3U8s through your local Node proxy
        // FIX: We specifically exclude 'rumble.com' because their CDN natively supports 
        // direct browser playback. Proxying it causes infinite buffering.
        if (
          targetStream.includes('.m3u8') && 
          targetStream.startsWith('http') && 
          !targetStream.includes('rumble.com') &&
          !isFlatFile
        ) {
          setStatus('ROUTING THROUGH CORS GATEWAY...');
          targetStream = `/api/v1/stream/live.m3u8?url=${encodeURIComponent(targetStream)}`;
        }

        if (!isMounted) return;

        // 3. MEDIA ENGINE ATTACHMENT
        setStatus('BUFFERING...');
        
        if (targetStream.includes('.m3u8') && Hls.isSupported() && !isFlatFile) {
          const hls = new Hls({ enableWorker: true, lowLatencyMode: true });
          hlsRef.current = hls;
          hls.loadSource(targetStream);
          hls.attachMedia(video);
          
          hls.on(Hls.Events.MANIFEST_PARSED, () => {
            if (isMounted) setStatus('PLAYING');
            video.muted = true; // Required to bypass browser autoplay blocks
            video.play().catch(handlePlayError);
          });

          hls.on(Hls.Events.ERROR, (_event, data) => {
            if (data.fatal) {
              if (isMounted) setStatus(`ENGINE ERROR: ${data.type}`);
              hls.destroy();
            }
          });
        } else {
          // Native MP4 / Safari Fallback
          video.src = targetStream;
          video.onloadedmetadata = () => {
            if (isMounted) setStatus('PLAYING');
            video.muted = true;
            video.play().catch(handlePlayError);
          };
        }
      } catch (err: any) {
        if (isMounted) setStatus(`PIPELINE FAILURE: ${err.message}`);
      }
    };

    initializePlayout();

    return () => {
      isMounted = false;
      if (hlsRef.current) hlsRef.current.destroy();
      video.removeEventListener('playing', onPlaying);
      video.removeEventListener('timeupdate', onPlaying);
    };
  }, [url]);

  if (!url) return null;

  return (
    <div className="relative w-full h-full bg-black overflow-hidden rounded-xl border border-slate-800/80 shadow-[0_0_20px_rgba(0,0,0,0.6)]">
      <video 
        ref={videoRef} 
        className="w-full h-full object-contain z-10 !block !visible" 
        controls 
        playsInline 
      />
      
      {autoplayBlocked && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/60 backdrop-blur-sm pointer-events-auto">
          <button
            onClick={() => {
              if (videoRef.current) {
                videoRef.current.muted = false;
                videoRef.current.play();
                setAutoplayBlocked(false);
              }
            }}
            className="flex items-center gap-2 px-6 py-3 bg-[var(--accent)] hover:bg-[var(--accent-2)] text-white font-mono text-sm font-bold uppercase tracking-wider rounded-lg transition-all shadow-[var(--shadow-glow)]"
          >
            <Volume2 className="w-5 h-5" />
            Click to Unmute & Play
          </button>
        </div>
      )}

      {/* Frosted Glass Diagnostic Overlay */}
      <div 
        className="absolute inset-0 z-20 flex items-center justify-center bg-black/60 backdrop-blur-md tuning-overlay-selector transition-opacity duration-300"
        style={{ 
          opacity: status !== 'PLAYING' ? 1 : 0, 
          pointerEvents: status !== 'PLAYING' ? 'auto' : 'none' 
        }}
      >
        <div className="flex flex-col items-center gap-3">
          <div className="w-6 h-6 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
          <span className="text-blue-400 font-mono text-xs tracking-[0.2em] animate-pulse uppercase">
            {status}
          </span>
        </div>
      </div>
    </div>
  );
};
