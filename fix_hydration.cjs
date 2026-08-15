const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const oldHydrate = `    const freshM3u8Url = data?.u?.hls?.url || data?.u?.mp4?.['480']?.url;`;
const newHydrate = `    let freshM3u8Url = typeof data?.u === 'string' ? data.u : (data?.u?.hls?.url || data?.u?.mp4?.['480']?.url);`;

code = code.replace(oldHydrate, newHydrate);
fs.writeFileSync('server.ts', code);
