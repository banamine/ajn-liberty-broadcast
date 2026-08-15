import puppeteer from 'puppeteer';
(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('LOG:', msg.text()));
  page.on('pageerror', err => console.log('ERROR:', err.message));
  page.on('requestfailed', req => console.log('FAILED:', req.url(), req.failure().errorText));
  
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 2000));
  
  const content = await page.content();
  if (content.includes('Initializing AJN System')) {
    console.log('STUCK_ON_SKELETON');
  } else {
    console.log('REACT_MOUNTED_OK');
  }
  
  await browser.close();
})();
