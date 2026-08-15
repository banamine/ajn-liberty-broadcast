const fs = require('fs');
let content = fs.readFileSync('src/services/StreamValidator.ts', 'utf8');

content = content.replace(/if \(typeof window !== "undefined"\) \{ try \{ if \(\!window.localStorage\) return;       try \{/g, 'if (typeof window !== "undefined") { try { if (!window.localStorage) return;');

// Wait, the previous replace left an extra open brace. I will just restore the file from git and do it properly!
