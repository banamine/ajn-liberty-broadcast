import puppeteer from 'puppeteer';
(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  
  // Set localStorage before loading the page
  await page.evaluateOnNewDocument(() => {
    localStorage.setItem('ajn_onboarding_complete', 'true');
  });

  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 6000));
  const html = await page.content();
  console.log(html);
  await browser.close();
})();
