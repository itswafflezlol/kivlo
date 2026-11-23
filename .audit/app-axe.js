const { chromium } = require('playwright');
const fs = require('fs');
const axePath = require('path').join(__dirname,'..','src','web','node_modules','axe-core','axe.min.js');
const hasAxe = fs.existsSync(axePath);

(async () => {
  const browser = await chromium.launch();
  const _ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } }); const page = await _ctx.newPage();
  const out = { hasAxe };

  await page.goto('http://localhost:3000/app/clips/cl-1/edit', { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);
  // trim drag
  const handle = page.getByRole('slider', { name: 'Trim end' });
  const box = await handle.boundingBox();
  const before = await handle.getAttribute('aria-valuenow');
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(box.x - 150, box.y + box.height / 2, { steps: 8 });
  await page.mouse.up();
  const after = await handle.getAttribute('aria-valuenow');
  out.trim = `${before} -> ${after}`;

  if (hasAxe) {
    const routes = ['/app', '/app/projects/p-1', '/app/clips/cl-1/edit', '/app/billing'];
    for (const r of routes) {
      for (const w of [1440, 390]) {
        await page.setViewportSize({ width: w, height: 900 });
        await page.goto('http://localhost:3000' + r, { waitUntil: 'networkidle' });
        await page.waitForTimeout(700);
        await page.addScriptTag({ path: axePath });
        const res = await page.evaluate(async () => (await axe.run()).violations.map(v => v.id));
        out[`${r}@${w}`] = res;
      }
    }
  }
  console.log(JSON.stringify(out));
  await browser.close();
})().catch(e => { console.error('FAIL', e); process.exit(1); });
