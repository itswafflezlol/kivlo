const { chromium } = require('playwright');
const axePath = require('path').join(__dirname, '..', 'src', 'web', 'node_modules', 'axe-core', 'axe.min.js');
(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  for (const r of process.argv.slice(2)) {
    await page.goto('http://localhost:3000/' + r, { waitUntil: 'networkidle' });
    await page.waitForTimeout(700);
    await page.addScriptTag({ path: axePath });
    const res = await page.evaluate(async () => (await axe.run()).violations.map(v => ({ id: v.id, nodes: v.nodes.slice(0, 3).map(n => n.target.join(' ')) })));
    console.log(r, JSON.stringify(res, null, 1));
  }
  await browser.close();
})();
