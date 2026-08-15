import puppeteer from 'puppeteer';
(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  
  await page.evaluateOnNewDocument(() => {
    window.onerror = function(msg, url, line, col, error) {
      console.log('BROWSER_ERROR:', msg);
    };
    window.addEventListener('unhandledrejection', function(event) {
      console.log('BROWSER_UNHANDLED_REJECTION:', event.reason);
    });
  });
  
  page.on('console', msg => console.log('LOG:', msg.text()));
  
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 2000));
  await browser.close();
})();
