const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await (await browser.newContext()).newPage();
  page.on('console', m => { if (m.type() === 'error') console.log('ERR>>>', m.text().slice(0, 3000)); });
  page.on('pageerror', e => console.log('PAGEERR>>>', e.message.slice(0, 1000)));
  await page.goto('http://localhost:3000/app/clips/cl-1/edit', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2500);
  await browser.close();
})();
