import puppeteer from 'puppeteer';
(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  page.on('console', msg => {
    if (msg.text().includes('Failed to parse M3U')) {
      console.log('PAGE LOG:', msg.text());
    }
  });
  await page.goto('http://localhost:3000');
  await new Promise(r => setTimeout(r, 6000));
  await browser.close();
})();
