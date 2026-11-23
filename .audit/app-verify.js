const { chromium } = require('playwright');
const path = require('path');
const S = (n) => path.join(__dirname, '..', 'mockups', 'screens', n);

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  const out = {};

  // dashboard
  await page.goto('http://localhost:3000/app', { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);
  out.sw1440 = await page.evaluate(() => document.documentElement.scrollWidth);
  await page.screenshot({ path: S('app-dashboard-1440.png'), fullPage: true });

  // empty state
  await page.goto('http://localhost:3000/app?state=empty', { waitUntil: 'networkidle' });
  await page.screenshot({ path: S('app-dashboard-empty-1440.png'), fullPage: true });

  // mobile dashboard
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('http://localhost:3000/app', { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);
  out.sw390 = await page.evaluate(() => document.documentElement.scrollWidth);
  await page.screenshot({ path: S('app-dashboard-390.png'), fullPage: true });

  // 1024 overflow
  await page.setViewportSize({ width: 1024, height: 900 });
  await page.goto('http://localhost:3000/app', { waitUntil: 'networkidle' });
  out.sw1024 = await page.evaluate(() => document.documentElement.scrollWidth);

  // import modal
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('http://localhost:3000/app', { waitUntil: 'networkidle' });
  await page.getByRole('button', { name: 'New import' }).first().click();
  await page.waitForTimeout(400);
  const urlField = page.locator('input[type=url]').last();
  await urlField.fill('https://www.youtube.com/watch?v=demo123');
  await page.getByRole('button', { name: 'Check link' }).click();
  await page.waitForTimeout(1600);
  await page.screenshot({ path: S('app-import-modal-1440.png') });
  // rights checkbox + find highlights
  const rights = page.locator('input[type=checkbox]').last();
  if (await rights.count()) await rights.check();
  await page.getByRole('dialog').getByRole('button', { name: 'Find highlights' }).click();
  await page.waitForTimeout(1500);
  out.importUrl = page.url();
  await page.screenshot({ path: S('app-processing-1440.png') });
  // wait for ready transition
  await page.waitForTimeout(11000);
  out.afterProcessing = await page.locator('body').innerText().then(t => t.includes('Finding the best') ? 'still-processing' : 'ready');
  await page.screenshot({ path: S('app-project-1440.png'), fullPage: true });

  // post prep: open a clip's Post prep if present
  const postBtn = page.getByRole('button', { name: 'Post prep' }).first();
  if (await postBtn.count()) { await postBtn.click(); await page.waitForTimeout(600); }
  await page.screenshot({ path: S('app-postprep-1440.png') });

  // workspace
  await page.goto('http://localhost:3000/app/clips/cl-1/edit', { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);
  const t0 = await page.locator('text=/\\d+:\\d+\\.\\d+ \\/ /').first().innerText().catch(() => 'n/a');
  await page.keyboard.press('Space');
  await page.waitForTimeout(2100);
  const t1 = await page.locator('text=/\\d+:\\d+\\.\\d+ \\/ /').first().innerText().catch(() => 'n/a');
  const limeWords = await page.locator('span[style*="rgb(189, 239, 114)"], span[style*="#BDEF72" i]').count();
  out.wsPlay = `${t0} -> ${t1} limeWords:${limeWords}`;
  await page.screenshot({ path: S('workspace-1440.png') });

  // transcript rail
  await page.getByRole('button', { name: 'Transcript' }).click();
  await page.waitForTimeout(400);
  await page.screenshot({ path: S('workspace-transcript-1440.png') });

  // split layout via inspector
  await page.getByRole('tab', { name: 'Layout' }).click();
  await page.getByRole('button', { name: 'Split', exact: true }).click();
  await page.waitForTimeout(400);
  out.videos = await page.locator('video').count();
  await page.screenshot({ path: S('workspace-split-1440.png') });

  // caption color change
  await page.getByRole('tab', { name: 'Captions' }).click();
  await page.getByRole('button', { name: 'Color #F5A524' }).click();
  await page.waitForTimeout(300);
  out.colorApplied = await page.locator('span[style*="rgb(245, 165, 36)"]').count();

  // export
  await page.getByRole('button', { name: 'Export' }).click();
  await page.waitForTimeout(300);
  await page.getByRole('button', { name: 'Export clip' }).click();
  await page.waitForTimeout(3500);
  out.exportReady = await page.locator('text=Your clip is ready.').count();
  await page.screenshot({ path: S('workspace-export-1440.png') });
  await page.keyboard.press('Escape');

  // secondary pages
  for (const [route, name] of [['/app/calendar','app-calendar-1440.png'],['/app/billing','app-billing-1440.png'],['/app/library','app-library-1440.png'],['/app/settings','app-settings-1440.png']]) {
    await page.goto('http://localhost:3000' + route, { waitUntil: 'networkidle' });
    await page.waitForTimeout(600);
    await page.screenshot({ path: S(name), fullPage: true });
  }

  console.log(JSON.stringify(out, null, 1));
  await browser.close();
})().catch(e => { console.error('FAIL', e); process.exit(1); });
