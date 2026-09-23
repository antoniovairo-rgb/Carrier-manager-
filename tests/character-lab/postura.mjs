/* [23/09] Fotografa e misura postura.html. CPM_CLIP (idle|jog), CPM_CORR=1 per la correzione, CPM_OUT. */
import { startServer, launchBrowser, installCdnRoutes, sleep } from '../visual/lib/harness.mjs';
const server = await startServer(); const browser = await launchBrowser();
const T = process.env.CPM_T || '0,0.4';
const page = await (await browser.newContext({ viewport: { width: 480 * T.split(',').length, height: 360 } })).newPage();
await installCdnRoutes(page);
const extra = process.env.CPM_CORR === '1' ? await import('node:fs').then(fs => fs.readFileSync(new URL('../../src/12-three-match-view.jsx', import.meta.url), 'utf8').match(/\/\*CORR23\*\/([\s\S]*?)\/\*\/CORR23\*\//)?.[1] || '') : '';
if (extra) await page.addInitScript(extra + ';window.corrPostura23=_corrPostura23;');
await page.goto(`http://127.0.0.1:${server.address().port}/tests/character-lab/postura.html?glb=${encodeURIComponent('/assets/cgtrader-review-lod1-kit-adapter.glb')}&clip=${process.env.CPM_CLIP || 'idle'}&t=${T}&corr=${process.env.CPM_CORR === '1' ? 1 : 0}`, { waitUntil: 'load' });
await page.waitForFunction(() => window.__POSTURA, null, { timeout: 120000 }); await sleep(400);
console.log(JSON.stringify(await page.evaluate(() => window.__POSTURA)));
await page.screenshot({ path: process.env.CPM_OUT || '/tmp/postura.png' }); await browser.close(); server.close();
