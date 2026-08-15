const fs = require('fs');
const path = require('path');

const BACKEND_DECLARATION = `const BACKEND_URL = import.meta.env.VITE_API_URL || 'https://ajn-archive-iptv-player-382115576551.us-west2.run.app';`;

function processDirectory(directory) {
  const files = fs.readdirSync(directory);
  for (const file of files) {
    const fullPath = path.join(directory, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let changed = false;
      
      const fetchRegex = /fetch\(\s*(["'`])\/api\//g;
      if (fetchRegex.test(content)) {
        content = content.replace(/fetch\(\s*"(?=\/api\/)/g, 'fetch(BACKEND_URL + "')
                         .replace(/fetch\(\s*'(?=\/api\/)/g, "fetch(BACKEND_URL + '")
                         .replace(/fetch\(\s*`(?=\/api\/)/g, "fetch(BACKEND_URL + `");
        changed = true;
      }

      if (changed && !content.includes('const BACKEND_URL =')) {
        const lines = content.split('\n');
        let importEndIndex = -1;
        for (let i = 0; i < lines.length; i++) {
          if (lines[i].startsWith('import ')) {
            importEndIndex = i;
          }
        }
        lines.splice(importEndIndex + 1, 0, '\n' + BACKEND_DECLARATION + '\n');
        content = lines.join('\n');
      }

      if (changed) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log("Updated", fullPath);
      }
    }
  }
}

processDirectory('./src');
