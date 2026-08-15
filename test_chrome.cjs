const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  
  await page.setContent(`
    <!DOCTYPE html>
    <html>
    <body>
    <video id="v" muted width="320" height="240" autoplay src="https://archive.org/download/special-branch-1969-73/SPECIAL%20BRANCH%20%281969%29/112.Special%20Branch...Care%20of%20Her%20Majesty.mp4"></video>
    <script>
      const v = document.getElementById('v');
      v.onerror = () => {
        console.log("VIDEO ERROR:", v.error ? v.error.code : 'unknown', v.error ? v.error.message : '');
      };
      v.onplaying = () => {
        console.log("VIDEO PLAYING");
      };
      v.onloadedmetadata = () => {
        console.log("VIDEO LOADED METADATA");
      };
    </script>
    </body>
    </html>
  `);
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  
  await new Promise(r => setTimeout(r, 5000));
  await browser.close();
})();
