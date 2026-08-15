const fs = require('fs');
let code = fs.readFileSync('src/components/guide/TVGuideSchedule.tsx', 'utf8');

code = code.replace(
  "onClick={() => triggerPlayout && triggerPlayout(block.originalBlock, ch)}",
  `onClick={() => {
    if (triggerPlayout) {
      const trace = TelemetryAudit.createTrace("EPG_TIMELINE_CLICK", {
        channelId: ch.id,
        showTitle: block.originalBlock?.episode?.title || block.title,
        expectedM3u: ch.url || ch.source
      });
      triggerPlayout(block.originalBlock, ch, trace);
    }
  }}`
);

fs.writeFileSync('src/components/guide/TVGuideSchedule.tsx', code);
