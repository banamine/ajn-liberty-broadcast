import puppeteer from 'puppeteer';
import fs from 'fs';
(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({ path: 'screenshot.png' });
  await browser.close();
  const base64 = fs.readFileSync('screenshot.png').toString('base64');
  console.log('SCREENSHOT_BASE64: ' + base64.substring(0, 100) + '...');
  
  // also print body innerHTML snippet
  const html = await fs.promises.readFile('screenshot.png', {encoding: 'base64'});
  
})();
