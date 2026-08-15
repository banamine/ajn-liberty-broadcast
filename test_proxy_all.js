import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  
  page.on('response', response => {
    if (response.status() === 500) {
      console.log('500 ERROR URL:', response.url());
    }
  });
  
  await page.goto('http://localhost:3000');
  
  await new Promise(r => setTimeout(r, 5000));
  await browser.close();
})();
