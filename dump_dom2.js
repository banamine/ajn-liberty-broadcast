import puppeteer from 'puppeteer';
(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 2000));
  
  const content = await page.content();
  console.log(content.substring(0, 3000)); // Only the top part to see what is loaded
  console.log('---');
  console.log(content.substring(content.length - 3000)); // bottom part
  await browser.close();
})();
