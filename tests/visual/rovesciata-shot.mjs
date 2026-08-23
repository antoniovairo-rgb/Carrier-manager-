#!/usr/bin/env node
/* PROVINI DELLA ROVESCIATA — «rovesciata al contrario», QUARTA segnalazione del PO, la prima DOPO un
   mio rimedio (7.551). Quel rimedio l'avevo dichiarato «verifica aritmetica, non visiva»: confrontavo
   i valori che il codice assegna, non la scena. Il PO ha guardato la scena e il difetto era ancora li'.
   Questa sonda toglie l'alibi: trova da sola una scena che offre un tiro al volo o una rovesciata,
   la gioca, e FOTOGRAFA il gesto fotogramma per fotogramma, con accanto i numeri del testimone.

     CPM_CHROME=... node rovesciata-shot.mjs            (CPM_TAG=prima|dopo · CPM_NO575=1 per il rosso) */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
import fs from 'node:fs';

const OUT = 'out/rovesciata'; fs.mkdirSync(OUT, { recursive: true });
const TAG = process.env.CPM_TAG || 'dopo';
const QUANTE = +(process.env.CPM_QUANTE || 2);
const TS = (process.env.CPM_TS || '0.10,0.22,0.34,0.46,0.60,0.80').split(',').map(Number);
const RX = /al volo|vol[eé]e|volee|rovesciat|sforbiciat/i;

const srv = await startServer(); const port = srv.address().port;
const b = await launchBrowser();
const page = await b.newPage({ viewport: { width: 412, height: 820 }, deviceScaleFactor: 2 });
await installCdnRoutes(page);
const errs = []; page.on('pageerror', e => errs.push(String(e.message).slice(0, 140)));
await page.addInitScript(n => { window.__CPM_GLB = false; window.__CPM_CINE = 1; if (n) window.__CPM_NO575 = 1; }, process.env.CPM_NO575 ? 1 : 0);
const { total } = await openMatch(page, port);
await sleep(600);

/* 1. CENSIMENTO: quali scene offrono il gesto */
const cand = [];
for (let gi = 0; gi < total; gi++) {
  let ok = false; try { ok = await page.evaluate(g => window.__CPM_FORCE_SIT(g, true), gi); } catch (e) {}
  if (!ok) continue;
  const acts = await page.evaluate(() => (window.__CPM_ACTS ? window.__CPM_ACTS() : []));
  const k = acts.findIndex(a => RX.test(a));
  if (k >= 0) cand.push({ gi, k, label: acts[k] });
}
console.log(`\n=== ${cand.length} scene offrono il gesto (su ${total}) ===`);
for (const c of cand.slice(0, 12)) console.log(`  gi${String(c.gi).padStart(3)} az.${c.k}  «${c.label}»`);
if (!cand.length) { console.log('\n❌ nessuna scena offre il gesto: la sonda non puo\' fotografare niente.'); srv.close(); await b.close(); process.exit(1); }

/* 2. PROVINI */
for (const c of cand.slice(0, QUANTE)) {
  let ok = false; try { ok = await page.evaluate(g => window.__CPM_FORCE_SIT(g, true), c.gi); } catch (e) {}
  if (!ok) continue;
  await sleep(350);
  await page.evaluate(() => { window.__CPM_FROZEN = false; window.__CPM_VOLLEY = null; });
  try { await page.evaluate(k => window.__CPM_RESOLVE(k), c.k); } catch (e) { console.log(`  gi${c.gi}: RESOLVE fallita`); continue; }
  let prev = 0;
  for (const t of TS) {
    await sleep(Math.max(0, (t - prev) * 1000)); prev = t;
    const V = await page.evaluate(() => window.__CPM_VOLLEY || null);
    const f = `${OUT}/rov-${TAG}-gi${c.gi}-t${String(t).replace('.', 'p')}.png`;
    await page.screenshot({ path: f });
    console.log(`  gi${c.gi} t=${t}s → ${f}${V ? `   busto x ${V.tx} · y ${V.ty} · salto ${V.y} · gamba ${V.lR} · u ${V.u}` : '   [il ramo volee NON e\' passato]'}`);
  }
}
srv.close(); await b.close();
for (const e of errs.slice(0, 4)) console.log('⚠ pageerror: ' + e);
console.log(`\nFotogrammi in ${OUT}/ — questa volta il giudizio si da\' guardando, non contando.`);
