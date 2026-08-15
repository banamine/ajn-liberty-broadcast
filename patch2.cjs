const fs = require('fs');
let code = fs.readFileSync('src/components/guide/TVGuideSearch.tsx', 'utf8');

code = code.replace(
  "triggerPlayout(cur, ch);",
  `const trace = TelemetryAudit.createTrace("SIDEBAR_SELECTOR_CLICK", {
      channelId: ch.id,
      showTitle: cur.episode.title || ch.name,
      expectedM3u: ch.url || ch.source
    });
    triggerPlayout(cur, ch, trace);`
);

fs.writeFileSync('src/components/guide/TVGuideSearch.tsx', code);
