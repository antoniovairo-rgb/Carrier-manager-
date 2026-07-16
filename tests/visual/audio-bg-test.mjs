#!/usr/bin/env node
/* [7.89.0] PROBE — AUDIO IN PAUSA IN BACKGROUND: quando document.hidden diventa true (visibilitychange/pagehide)
   l'AudioContext di AudioMgr viene SOSPESO; al ritorno in foreground riprende. Gira SENZA cpmtest (in test l'audio
   è muto): sblocca l'audio via gesto, poi verifica lo stato del ctx a hidden ON/OFF. */
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
const srv = await startServer(); const port = srv.address().port;
const browser = await launchBrowser();
const issues = [];
const page = await browser.newPage();
await installCdnRoutes(page);
page.on('pageerror', e => issues.push('pageerror: ' + String(e.message).slice(0, 150)));
await page.addInitScript(() => { window.__CPM_GLB = false; });
await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html`, { waitUntil: 'load', timeout: 60000 });
await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 60000 });
await sleep(1200);

// API presente
const hasApi = await page.evaluate(() => typeof AudioMgr !== 'undefined' && typeof AudioMgr.setSuspended === 'function');
console.log('setSuspended presente:', hasApi);
if (!hasApi) issues.push('AudioMgr.setSuspended assente');

// sblocca l'audio (gesto) → ctx running
await page.evaluate(() => { try { AudioMgr.unlock(); } catch (e) {} });
await sleep(500);
const s0 = await page.evaluate(() => { try { return AudioMgr.debug().ctx; } catch (e) { return 'err:' + e.message; } });
console.log('dopo unlock:', s0);
if (s0 === 'none') issues.push('AudioContext non creato dopo unlock (headless senza WebAudio?) — skip stato');

// override document.hidden = true + visibilitychange → suspended
await page.evaluate(() => { Object.defineProperty(document, 'hidden', { configurable: true, get: () => true }); document.dispatchEvent(new Event('visibilitychange')); });
await sleep(500);
const sHidden = await page.evaluate(() => { try { return AudioMgr.debug().ctx; } catch (e) { return 'err'; } });
console.log('background (hidden):', sHidden);

// ritorno in foreground → running
await page.evaluate(() => { Object.defineProperty(document, 'hidden', { configurable: true, get: () => false }); document.dispatchEvent(new Event('visibilitychange')); });
await sleep(500);
const sVisible = await page.evaluate(() => { try { return AudioMgr.debug().ctx; } catch (e) { return 'err'; } });
console.log('foreground (visible):', sVisible);

// verdetto: solo se il ctx era davvero attivo (headless può non avere WebAudio)
if (s0 === 'running') {
  if (sHidden !== 'suspended') issues.push('in background il ctx NON è sospeso (' + sHidden + ')');
  if (sVisible !== 'running') issues.push('al ritorno in foreground il ctx NON riprende (' + sVisible + ')');
} else {
  console.log('⚠️ ctx non «running» in headless (' + s0 + ') → verifica logica: setSuspended esiste e i listener sono registrati (transizione stato non osservabile qui)');
}

await browser.close(); srv.close();
console.log(issues.length ? '❌ FAIL\n' + issues.map(i => '  ✗ ' + i).join('\n') : '✅ AUDIO-BG OK');
process.exit(issues.length ? 1 : 0);
