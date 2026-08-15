import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  
  page.on('response', response => {
    if (response.status() === 500) {
      console.log('STATUS 500:', response.url());
    } else if (response.status() >= 400) {
      console.log('HTTP ERROR:', response.status(), response.url());
    }
  });
  
  page.on('console', msg => {
    if (msg.text().includes('Failed to parse M3U')) {
      console.log('PAGE LOG:', msg.text());
    }
  });
  
  await page.goto('http://localhost:3000');
  
  await new Promise(r => setTimeout(r, 8000));
  await browser.close();
})();
