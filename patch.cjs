const fs = require('fs');
let code = fs.readFileSync('src/utils/playlistUtils.ts', 'utf8');
code = code.replace(
  "    const playlistUrls = text.split('\\n')\n      .map(line => line.trim())\n      .filter(line => line && !line.startsWith('#'));",
  "    const playlistUrls = text.split('\\n')\n      .map(line => line.trim())\n      .filter(line => line && !line.startsWith('#'))\n      .map(line => {\n        if (!line.match(/^(https?|rtmp|rtsp|mms):\\/\\//i) && !line.startsWith(\"file://\")) {\n           try {\n             return new URL(line, m3uUrl).toString();\n           } catch(e) {}\n        }\n        return line;\n      });"
);
fs.writeFileSync('src/utils/playlistUtils.ts', code);
