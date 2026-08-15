const fs = require('fs');

let content = fs.readFileSync('server.ts', 'utf8');

const injectionCode = `
// ============================================================================
// AUTO-HYDRATION PIPELINE: Rumble Live Stream HLS Token
// ============================================================================
let globalLiveChannels: Record<string, string> = {};

function updateLiveChannelUrl(name: string, url: string) {
  globalLiveChannels[name] = url;
  cachedPlayoutResponse = null; // Invalidate playout cache so it uses the fresh token
}

async function hydrateRumbleLiveStream() {
  console.log("[Hydration] Fetching fresh Rumble HLS stream token...");
  const liveVideoId = "v5xwnen"; // Designated 24/7 Live ID from user

  try {
    const url = \`https://rumble.com/embedJS/u3/?request=video&v=\${liveVideoId}\`;
    const response = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" },
      signal: AbortSignal.timeout(15000)
    });

    if (!response.ok) throw new Error("Failed to reach Rumble metadata API.");
    
    const data = await response.json();
    const freshM3u8Url = data?.u?.hls?.url || data?.u?.mp4?.['480']?.url;

    if (freshM3u8Url) {
      // OVERWRITE the live stream URL in your active memory/database
      // This ensures when the frontend calls /api/v1/playout/channels, it gets the fresh link
      updateLiveChannelUrl('AJN Live 24/7', freshM3u8Url); 
      console.log("[Hydration] SUCCESS: Active M3U payload updated with fresh stream link.");
    } else {
      throw new Error("No valid HLS or MP4 URL found in payload.");
    }
  } catch (err: any) {
    console.error("[Hydration Error]:", err.message);
  }
}
`;

content = content.replace(
  'function getCompiledPlayoutChannels(): any[] {', 
  injectionCode + '\nfunction getCompiledPlayoutChannels(): any[] {'
);

const bootCall = `
  // 2. Execute on Boot (Cold Start)
  hydrateRumbleLiveStream();

  // 3. Keep it Alive (Refresh tokens every 4 hours before they expire)
  setInterval(hydrateRumbleLiveStream, 4 * 60 * 60 * 1000); 
`;

content = content.replace(
  'runNewsHarvest().catch(err => console.error("[Boot] Cold Start Fetch failed:", err));',
  'runNewsHarvest().catch(err => console.error("[Boot] Cold Start Fetch failed:", err));\n' + bootCall
);

fs.writeFileSync('server.ts', content);
