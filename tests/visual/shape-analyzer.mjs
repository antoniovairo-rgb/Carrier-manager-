#!/usr/bin/env node
/* [7.202.0 direttiva PO «sembra davvero una partita di calcio»] ANALIZZATORE DI FORMA DI SQUADRA durante la
   fase `playing` (quello che si guarda per la maggior parte della partita, tra un highlight e l'altro).
   Registra i frame col recorder di gioco (`__CPM_REC`) mentre l'autoplay gioca partite VERE e misura:
     · slope  = di quanto la linea si sposta lateralmente per ogni unità di spostamento della palla.
                1.00 = RETICOLO RIGIDO (tutta la squadra trasla incollata alla palla, nessuna forma);
                nel calcio la linea difensiva scorre ball-side di ~0.4-0.6, l'attacco molto meno (tiene ampiezza).
     · spread = ampiezza media della linea difensiva (distanza tra il più largo a destra e a sinistra);
     · minGap = distanza minima tra due compagni della stessa linea (se collassa, sono sovrapposti dal clamp);
     · pinned = quota di frame in cui almeno due compagni della stessa linea stanno entro 3u (schiacciati al bordo).
   Baseline in `shape-baseline.json`; `SH_UPDATE=1` la rigenera. */
import fs from 'fs';
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';

const BASE = new URL('./shape-baseline.json', import.meta.url);
const srv = await startServer(); const port = srv.address().port;
const browser = await launchBrowser();
const issues = [];
/* ⚠️ UNA SOLA partita NON basta: la misura varia parecchio da run a run (situations diverse ⇒ la palla
   sollecita la forma in modi diversi). Con un campione singolo `pinned` oscilla fra 0.20 e 0.30 sullo STESSO
   build — abbastanza da far sembrare una regressione il rumore. Si campionano quindi 3 partite con seed
   diversi e si mettono in comune tutti i frame. */
const SEEDS = [7, 4211, 90101];
const frames = [];
for (const sd of SEEDS) {
  const pg = await browser.newPage({ viewport: { width: 900, height: 900 } });
  await installCdnRoutes(pg);
  pg.on('pageerror', e => issues.push('pageerror: ' + String(e.message).slice(0, 140)));
  await pg.addInitScript(() => { window.__CPM_GLB = false; });
  await openMatch(pg, port, { skipLoadAll: true });
  await pg.waitForFunction(() => typeof window.__CPM_AUTOPLAY === 'function', null, { timeout: 40000 });
  await pg.evaluate((s2) => { window.__CPM_REC = true; window.__CPM_AUTOPLAY(true, { seed: s2, policy: 'seeded' }); }, sd);
  await sleep(20000);
  const fr = await pg.evaluate(() => (window.__CPM_REC_DRAIN ? window.__CPM_REC_DRAIN() : []));
  frames.push(...fr);
  await pg.close();
}

const gy = z => z / 0.68 + 50;                       // world z → coordinata di gioco 0..100
const play = frames.filter(f => f.ph === 'playing' && f.p && f.p.length >= 21);
console.log(`frame totali ${frames.length} · in fase playing ${play.length}`);
if (play.length < 150) issues.push(`campione insufficiente: solo ${play.length} frame in playing`);

/* linea difensiva ospite = indici 11..14 (10 = portiere ospite, 11..20 i dieci di movimento) */
const LINES = { awayBack: [11, 12, 13, 14], awayMid: [15, 16, 17], homeBack: [1, 2, 3, 4] };
const out = {};
for (const [name, idxs] of Object.entries(LINES)) {
  const bs = [], ms = [];
  let minGap = 99, pinned = 0;
  for (const f of play) {
    const ys = idxs.map(i => f.p[i] && gy(f.p[i][1])).filter(v => v != null);
    if (ys.length < idxs.length) continue;
    const by = gy(f.b[1]);
    bs.push(by); ms.push(ys.reduce((a, b) => a + b, 0) / ys.length);
    const srt = [...ys].sort((a, b) => a - b);
    let g = 99; for (let i = 1; i < srt.length; i++) g = Math.min(g, srt[i] - srt[i - 1]);
    minGap = Math.min(minGap, g); if (g < 3) pinned++;
    out[name + '_spread'] = (out[name + '_spread'] || 0) + (srt[srt.length - 1] - srt[0]);
  }
  const n = bs.length || 1;
  const mb = bs.reduce((a, b) => a + b, 0) / n, mm = ms.reduce((a, b) => a + b, 0) / n;
  let num = 0, den = 0;
  for (let i = 0; i < bs.length; i++) { num += (bs[i] - mb) * (ms[i] - mm); den += (bs[i] - mb) ** 2; }
  out[name + '_slope'] = den > 0.5 ? +(num / den).toFixed(3) : null;
  out[name + '_spread'] = +((out[name + '_spread'] || 0) / n).toFixed(1);
  out[name + '_minGap'] = +minGap.toFixed(2);
  out[name + '_pinned'] = +(pinned / n).toFixed(3);
}
console.log(JSON.stringify(out, null, 1));

let base = null; try { base = JSON.parse(fs.readFileSync(BASE, 'utf8')); } catch (e) {}
if (process.env.SH_UPDATE === '1') { fs.writeFileSync(BASE, JSON.stringify(out, null, 1)); console.log('baseline aggiornata → shape-baseline.json'); }
else if (base) {
  for (const k of Object.keys(out)) {
    if (base[k] == null || out[k] == null) continue;
    const d = out[k] - base[k];
    const worse = k.endsWith('_slope') ? d > 0.18 : k.endsWith('_pinned') ? d > 0.10 : k.endsWith('_minGap') ? d < -1.2 : k.endsWith('_spread') ? d < -10 : false;
    if (worse) issues.push(`${k}: ${out[k]} contro baseline ${base[k]} (peggiora la forma di squadra)`);
    console.log(`  ${k.padEnd(20)} ${String(out[k]).padStart(7)}  (baseline ${base[k]}${d ? `, Δ ${d > 0 ? '+' : ''}${d.toFixed(2)}` : ''})`);
  }
} else console.log('nessuna baseline: esegui con SH_UPDATE=1 per crearla');

await browser.close(); srv.close();
console.log(issues.length ? '❌ FAIL\n' + issues.map(i => '  ✗ ' + i).join('\n') : '✅ FORMA DI SQUADRA OK');
process.exit(issues.length ? 1 : 0);
