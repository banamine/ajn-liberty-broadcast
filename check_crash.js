const fs = require('fs');
const html = fs.readFileSync('screenshot.png').toString('base64');
// Actually, dump_dom2.js outputted the DOM! Let's check it.
