/* [23/09] Fotografa `provino-clip.html` per un GLB e una clip. CPM_GLB (percorso servito), CPM_CLIP, CPM_T (istanti), CPM_OUT. */
import fs from 'node:fs';
import { startServer, launchBrowser, installCdnRoutes, sleep } from '../visual/lib/harness.mjs';
const server = await startServer(); const browser = await launchBrowser();
const T = process.env.CPM_T || '0,0.8,1.6,2.4';
const page = await (await browser.newContext({ viewport: { width: 300 * T.split(',').length, height: 360 } })).newPage();
await installCdnRoutes(page);
await page.goto(`http://127.0.0.1:${server.address().port}/tests/character-lab/provino-clip.html?glb=${encodeURIComponent(process.env.CPM_GLB)}&clip=${process.env.CPM_CLIP}&t=${T}${process.env.CPM_EXTRA ? '&extra=' + encodeURIComponent(process.env.CPM_EXTRA) : ''}`);
await page.waitForFunction(() => window.__PROVINO, null, { timeout: 120000 });
await sleep(500);
const P = await page.evaluate(() => window.__PROVINO);
await page.screenshot({ path: process.env.CPM_OUT });
console.log(JSON.stringify(P));
await browser.close(); server.close();
