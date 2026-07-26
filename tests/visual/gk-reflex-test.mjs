#!/usr/bin/env node
/* [7.203.0 direttiva PO «sembra davvero una partita di calcio»] PROBE sul reparto portiere.
   Prima: OGNI conclusione nello specchio faceva partire un tuffo a corpo disteso — anche un pallone calciato
   ADDOSSO al portiere o da due passi — e la clip `anim-gk-block.glb` veniva scaricata a ogni partita senza
   essere mai suonata. Ora una parata con la palla vicina al portiere (o da distanza ravvicinata) è un
   RIFLESSO (`gk_block`), il tuffo resta per le conclusioni angolate.
   Verifica: forza tutte le situations con una conclusione, risolve, e classifica la reazione del portiere
   leggendo l'hook `__CPM_GKACT`; controlla la CORRELAZIONE (riflesso ⟺ palla vicina/tiro ravvicinato). */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';

const srv = await startServer(); const port = srv.address().port;
const browser = await launchBrowser();
const page = await browser.newPage({ viewport: { width: 900, height: 900 } });
await installCdnRoutes(page);
const issues = [];
page.on('pageerror', e => issues.push('pageerror: ' + String(e.message).slice(0, 140)));
await openMatch(page, port);
await page.waitForFunction(() => !!window.__CPM_FORCE_SIT && !!window.__CPM_SITS, null, { timeout: 60000 });

const cands = await page.evaluate(() => {
  const S = window.__CPM_SITS || []; const out = [];
  for (let i = 0; i < S.length; i++) {
    const s = S[i]; if (!s || s.type === 'def' || !Array.isArray(s.actions)) continue;
    const ai = s.actions.findIndex(a => a && a.rew === 'goal');
    if (ai >= 0) out.push({ gi: i, ai });
  }
  return out.slice(0, 70);
});
console.log(`situations con conclusione: ${cands.length}`);

await page.evaluate(() => { window.__CPM_GKACT = {}; });
const seen = [];
for (const c of cands) {
  await page.evaluate(() => { try { window.__CPM_GKACT.last = null; } catch (e) {} });
  await page.evaluate((g) => window.__CPM_FORCE_SIT(g), c.gi);
  await sleep(420);
  await page.evaluate((ai) => window.__CPM_RESOLVE(ai), c.ai);
  await sleep(420);
  const g = await page.evaluate(() => { const x = window.__CPM_GKACT || {}; return x.last ? { act: x.last, dz: x.lastDz, x: x.lastX, kind: x.lastKind } : null; });
  if (g) seen.push(g);
}
const tot = await page.evaluate(() => window.__CPM_GKACT || {});
const blocks = seen.filter(g => g.act === 'gk_block'), dives = seen.filter(g => g.act === 'gk_dive');
console.log(`reazioni del portiere osservate: ${seen.length} · riflesso ${blocks.length} · tuffo ${dives.length}`);
console.log(`contatori di gioco: ${JSON.stringify({ gk_block: tot.gk_block || 0, gk_dive: tot.gk_dive || 0 })}`);

if (!seen.length) issues.push('nessuna reazione del portiere osservata (hook __CPM_GKACT muto)');
if (seen.length && !blocks.length) issues.push('il RIFLESSO non scatta mai: la clip gk-block resta inutilizzata come prima');
/* correlazione: ogni riflesso deve avere una giustificazione (palla vicina O tiro ravvicinato) */
for (const b of blocks) {
  if (!(b.dz < 2.4 || b.x >= 87)) issues.push(`riflesso su un tiro né centrale né ravvicinato (Δz=${b.dz}, x=${b.x})`);
  if (!/^sav/.test(String(b.kind || ''))) issues.push(`riflesso su un esito che non è una parata (${b.kind})`);
}
/* controprova: un tuffo su palla vicina + parata sarebbe la vecchia resa */
const wrongDive = dives.filter(d => /^sav/.test(String(d.kind || '')) && d.dz < 2.4 && d.x < 87);
if (wrongDive.length) issues.push(`${wrongDive.length} tuffi a corpo disteso su palloni calciati addosso al portiere (Δz<2.4)`);
if (blocks.length) console.log(`  esempi riflesso: ${blocks.slice(0, 4).map(b => `Δz=${b.dz} x=${b.x} ${b.kind}`).join(' · ')}`);
if (dives.length) console.log(`  esempi tuffo:    ${dives.slice(0, 4).map(b => `Δz=${b.dz} x=${b.x} ${b.kind}`).join(' · ')}`);

await browser.close(); srv.close();
console.log(issues.length ? '❌ FAIL\n' + issues.map(i => '  ✗ ' + i).join('\n') : '✅ PORTIERE OK (riflesso sui tiri centrali/ravvicinati · tuffo su quelli angolati · clip block finalmente in uso)');
process.exit(issues.length ? 1 : 0);
