import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  
  page.on('response', response => {
    if (response.url().includes('stream-proxy')) {
      console.log(response.status(), response.url());
    }
  });
  
  await page.goto('http://localhost:3000');
  
  await page.evaluate(async () => {
    try {
      const res = await fetch('/api/stream-proxy?url=https%3A%2F%2Fi.mjh.nz%2FPBS%2Fall.m3u8');
      console.log('FETCH STATUS:', res.status);
    } catch(e) {
      console.log('FETCH ERROR:', e.message);
    }
  });
  
  await new Promise(r => setTimeout(r, 2000));
  await browser.close();
})();
