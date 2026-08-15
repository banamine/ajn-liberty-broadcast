import puppeteer from 'puppeteer-core';
import { launch } from 'chrome-launcher';

(async () => {
  const chrome = await launch({chromeFlags: ['--headless', '--disable-gpu', '--no-sandbox']});
  const browser = await puppeteer.connect({
    browserURL: `http://localhost:${chrome.port}`
  });
  
  const page = await browser.newPage();
  page.on('console', msg => console.log('BROWSER CONSOLE:', msg.type(), msg.text()));
  page.on('pageerror', err => console.error('BROWSER ERROR:', err));
  
  await page.goto('http://localhost:3000');
  await page.waitForTimeout(5000);
  await browser.close();
  chrome.kill();
})();
