const { chromium } = require('playwright');
const path = require('path');
const S = (n) => path.join(__dirname, '..', 'mockups', 'screens', n);

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  const msgs = [];
  page.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') msgs.push(`${page.url().split('3000')[1]} [${m.type()}] ${m.text().slice(0, 160)}`); });
  page.on('pageerror', (e) => msgs.push(`PAGEERROR ${e.message.slice(0, 160)}`));

  for (const r of ['/app', '/app/projects/p-1', '/app/clips/cl-1/edit', '/app/calendar', '/app/library', '/app/billing']) {
    await page.goto('http://localhost:3000' + r, { waitUntil: 'networkidle' });
    await page.waitForTimeout(900);
  }

  // retakes
  await page.goto('http://localhost:3000/app', { waitUntil: 'networkidle' });
  await page.waitForTimeout(900);
  await page.screenshot({ path: S('app-dashboard-1440.png'), fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('http://localhost:3000/app', { waitUntil: 'networkidle' });
  await page.waitForTimeout(900);
  await page.screenshot({ path: S('app-dashboard-390.png'), fullPage: true });
  await page.setViewportSize({ width: 1440, height: 900 });
  for (const [route, name] of [['/app/library', 'app-library-1440.png'], ['/app/billing', 'app-billing-1440.png']]) {
    await page.goto('http://localhost:3000' + route, { waitUntil: 'networkidle' });
    await page.waitForTimeout(600);
    await page.screenshot({ path: S(name), fullPage: true });
  }
  await page.goto('http://localhost:3000/app/clips/cl-1/edit', { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);
  await page.keyboard.press('Space');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: S('workspace-1440.png') });
  await page.getByRole('tab', { name: 'Layout' }).click();
  await page.getByRole('button', { name: 'Split', exact: true }).click();
  await page.waitForTimeout(600);
  await page.screenshot({ path: S('workspace-split-1440.png') });

  console.log('CONSOLE:', JSON.stringify(msgs, null, 1));
  await browser.close();
})().catch(e => { console.error('FAIL', e); process.exit(1); });
