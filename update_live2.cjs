const fs = require('fs');

let content = fs.readFileSync('server.ts', 'utf8');

// Ensure the fresh live link is actually applied to the channel output
content = content.replace(
  'return sanitizedChannels;',
  `
  if (globalLiveChannels['AJN Live 24/7']) {
    const liveChannelIndex = sanitizedChannels.findIndex(c => c.name.includes("AJN Live 24/7") || c.name.includes("ALN LIVE"));
    if (liveChannelIndex >= 0) {
      sanitizedChannels[liveChannelIndex].streamUrl = globalLiveChannels['AJN Live 24/7'];
      sanitizedChannels[liveChannelIndex].contentType = "live";
    } else {
      // Prepend to top if not already there
      sanitizedChannels.unshift({
        id: 'ajn-live-247',
        name: 'AJN Live 24/7',
        streamUrl: globalLiveChannels['AJN Live 24/7'],
        backupUrl: "https://rumble.com/embed/v77ec70/?pub=15son",
        aspectRatioHint: "16:9",
        contentType: "live",
        currentSegment: {
          title: "AJN 24/7 Live Stream",
          start: now - 3600,
          end: now + 3600
        }
      });
    }
  }

  return sanitizedChannels;
  `
);

fs.writeFileSync('server.ts', content);
