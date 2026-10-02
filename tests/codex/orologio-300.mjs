import fs from 'node:fs';
import os from 'node:os';
import { startServer, launchBrowser, installCdnRoutes, openMatch } from '../visual/lib/harness.mjs';

const output = 'tests/codex/orologio-300.json';
const freeGB = os.freemem() / 2 ** 30;
if (freeGB < 3.5) {
  fs.writeFileSync(output, JSON.stringify({ executed: false, reason: `RAM libera ${freeGB.toFixed(2)} GB < 3.5 GB` }, null, 2));
  console.error(`Pausa: ${freeGB.toFixed(2)} GB liberi`);
  process.exit(2);
}
const server = await startServer();
const browser = await launchBrowser();
try {
  const context = await browser.newContext({ viewport: { width: 412, height: 915 }, serviceWorkers: 'block' });
  const page = await context.newPage();
  await installCdnRoutes(page);
  await page.addInitScript(() => {
    let virtualTime = 0;
    let lastNative = null;
    let nativeFrames = 0;
    const nativeRaf = window.requestAnimationFrame.bind(window);
    performance.now = () => virtualTime;
    window.requestAnimationFrame = callback => nativeRaf(nativeTime => {
      if (nativeTime !== lastNative) {
        virtualTime += 1000 / 30;
        nativeFrames++;
        lastNative = nativeTime;
      }
      callback(virtualTime);
    });
    window.__QA_CLOCK_READ = () => ({ virtualTime, nativeFrames });
  });
  await openMatch(page, server.address().port);
  const result = await page.evaluate(() => new Promise(resolve => {
    const start = window.__QA_CLOCK_READ();
    let callbackFrames = 0;
    const tick = () => {
      callbackFrames++;
      if (callbackFrames === 300) {
        const end = window.__QA_CLOCK_READ();
        resolve({ callbackFrames, nativeFrames: end.nativeFrames - start.nativeFrames,
          virtualSteps: (end.virtualTime - start.virtualTime) / (1000 / 30),
          virtualMs: end.virtualTime - start.virtualTime });
      } else requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }));
  result.valid = result.callbackFrames === 300 && result.nativeFrames === 300 && Math.abs(result.virtualSteps - 300) < 1e-6;
  result.command = 'node tests/codex/orologio-300.mjs';
  fs.writeFileSync(output, JSON.stringify(result, null, 2));
  console.log(JSON.stringify(result));
  await context.close();
} finally {
  await browser.close();
  server.closeAllConnections?.();
  server.close();
}
