#!/usr/bin/env node
/* [7.57.0 PHASE 3 · collaudo PO «la 1ª azione fa cadere la palla in punti irrealistici, incompatibili con
   l'azione a catena guadagnata»] PROBE — quando una chain-sit viene iniettata, l'ASSESTAMENTO della palla
   (ballTargetRef) cade DENTRO la startZone del secondo tempo (dove l'azione guadagnata comincia) → niente più
   snap del clamp di continuità né palla che «cade» in un punto incompatibile.
   Metodo: trova una SITUATION con chainOn aerial + un'azione ad ASSIST (→ catena header/mischia/second_ball),
   la forza, risolve l'assist, legge window.__CPM_CHAIN_COH e verifica settle ∈ startZone della chain-sit.
   Controprova realismo: le chain-sit aeree (header/mischia) assestano IN AREA (x≥78). */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';

const srv = await startServer(); const port = srv.address().port;
const browser = await launchBrowser();
const page = await browser.newPage({ viewport: { width: 900, height: 900 } });
await installCdnRoutes(page);
const issues = [];
page.on('pageerror', e => issues.push('pageerror: ' + String(e.message).slice(0, 140)));
await openMatch(page, port);
await page.waitForFunction(() => !!window.__CPM_FORCE_SIT && !!window.__CPM_SITS, null, { timeout: 60000 });

// trova gli indici di situations con chainOn aerial + un'azione assist (innescano la catena via il ramo 12876)
const cands = await page.evaluate(() => {
  const S = window.__CPM_SITS || [];
  const out = [];
  for (let i = 0; i < S.length; i++) {
    const s = S[i];
    if (s && s.chainOn === 'aerial' && !s.lockMovement && Array.isArray(s.actions)) {
      const ai = s.actions.findIndex(a => a && a.rew === 'assist');
      if (ai >= 0) out.push({ gi: i, ai, text: s.text });
    }
  }
  return out;
});
console.log(`situations aeree con azione assist: ${cands.length}`);
if (!cands.length) { issues.push('nessuna situation chainOn aerial con azione assist trovata'); }

let tested = 0, inZone = 0, inBox = 0;
for (const c of cands) {
  await page.evaluate(() => { try { window.__CPM_CHAIN_COH = null; } catch (e) {} });
  await page.evaluate((g) => window.__CPM_FORCE_SIT(g), c.gi);
  await sleep(700);
  await page.evaluate((ai) => window.__CPM_RESOLVE(ai), c.ai);
  await sleep(350);
  const coh = await page.evaluate(() => window.__CPM_CHAIN_COH || null);
  if (!coh) continue; // quell'azione non ha aperto la catena (esito non-assist per reseed) → salta
  tested++;
  if (coh.inZone) inZone++; else issues.push(`gi${c.gi}: settle (${coh.settle.x.toFixed(1)},${coh.settle.y.toFixed(1)}) FUORI da startZone x[${coh.sz.x}] y[${coh.sz.y}]`);
  if (coh.settle.x >= 78) inBox++;
  console.log(`gi${c.gi} "${(c.text || '').slice(0, 34)}" → settle x=${coh.settle.x.toFixed(1)} y=${coh.settle.y.toFixed(1)} · inZone=${coh.inZone} · sz.x=[${coh.sz.x}]`);
}
console.log(`\ncatene testate: ${tested} · settle IN zona: ${inZone}/${tested} · settle in area (x≥78): ${inBox}/${tested}`);
if (tested === 0) issues.push('nessuna catena aerea effettivamente innescata (impossibile verificare)');
if (tested > 0 && inZone !== tested) issues.push(`${tested - inZone}/${tested} catene con settle FUORI dalla startZone (snap residuo)`);
if (tested > 0 && inBox < tested) issues.push(`${tested - inBox}/${tested} catene aeree assestano FUORI area (x<78) — irrealistico per header/mischia`);

await browser.close(); srv.close();
console.log(issues.length ? '❌ FAIL\n' + issues.map(i => '  ✗ ' + i).join('\n') : '✅ CHAIN COHERENCE OK (assestamento ∈ startZone del secondo tempo · catene aeree in area)');
process.exit(issues.length ? 1 : 0);
