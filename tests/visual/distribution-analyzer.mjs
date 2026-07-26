#!/usr/bin/env node
/* [7.206.0 direttiva PO «sembra davvero una partita di calcio»] DISTRIBUZIONE A PALLA CONTROLLATA.
   Il precedente tentativo di misurare lo «sciame attorno al pallone» raggruppava i frame per DURATA della
   fase, e la misura risultava confusa: più il gioco resta aperto più il pallone tende a centrocampo, dove i
   due blocchi sono per costruzione vicini — quindi «i giocatori si stringono col tempo» e «la palla si sposta
   al centro col tempo» producono lo stesso segnale. Qui i frame vengono raggruppati per POSIZIONE DELLA PALLA
   (terzo di campo × fascia laterale): dentro ogni cella la palla è ~ferma, quindi ciò che resta è la
   distribuzione VERA della squadra.
   Per cella misura, sui 20 giocatori di movimento:
     · nn    = distanza media dal compagno più vicino (bassa = grumo)
     · sdx   = dispersione in profondità · sdy = dispersione in ampiezza
     · near  = coppie entro 3u
     · dBall = distanza media dalla palla
   Baseline `distribution-baseline.json`; `DA_UPDATE=1` la rigenera. */
import fs from 'fs';
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';

const BASE = new URL('./distribution-baseline.json', import.meta.url);
const srv = await startServer(); const port = srv.address().port;
const browser = await launchBrowser();
const issues = [];
const SEEDS = [7, 4211, 90101, 55501];
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
  frames.push(...await pg.evaluate(() => (window.__CPM_REC_DRAIN ? window.__CPM_REC_DRAIN() : [])));
  await pg.close();
}
const gx = x => x + 50, gy = z => z / 0.68 + 50;   // world → coordinate di gioco
const OUT = [...Array(21).keys()].filter(i => i !== 0 && i !== 10); // i 20 di movimento (esclusi i portieri)
const play = frames.filter(f => f.ph === 'playing' && f.p && f.p.length >= 21);
console.log(`frame totali ${frames.length} · in fase playing ${play.length}`);
if (play.length < 200) issues.push(`campione insufficiente: ${play.length} frame in playing`);

const cellOf = (bx, by) => (bx < 38 ? 'difesa' : bx > 62 ? 'attacco' : 'centro') + '·' + (Math.abs(by - 50) > 20 ? 'fascia' : 'centrale');
const acc = {};
for (const f of play) {
  const bx = gx(f.b[0]), by = gy(f.b[1]);
  const P = OUT.map(i => f.p[i]).filter(Boolean).map(p => [gx(p[0]), gy(p[1])]);
  if (P.length < 18) continue;
  let nnSum = 0, near = 0, dB = 0;
  for (let i = 0; i < P.length; i++) {
    let nd = 1e9;
    for (let j = 0; j < P.length; j++) { if (i === j) continue; const d = Math.hypot(P[i][0] - P[j][0], P[i][1] - P[j][1]); if (d < nd) nd = d; if (j > i && d < 3) near++; }
    nnSum += nd; dB += Math.hypot(P[i][0] - bx, P[i][1] - by);
  }
  const mx = P.reduce((a, p) => a + p[0], 0) / P.length, my = P.reduce((a, p) => a + p[1], 0) / P.length;
  const sdx = Math.sqrt(P.reduce((a, p) => a + (p[0] - mx) ** 2, 0) / P.length);
  const sdy = Math.sqrt(P.reduce((a, p) => a + (p[1] - my) ** 2, 0) / P.length);
  const c = cellOf(bx, by); const A = acc[c] || (acc[c] = { n: 0, nn: 0, sdx: 0, sdy: 0, near: 0, dB: 0 });
  A.n++; A.nn += nnSum / P.length; A.sdx += sdx; A.sdy += sdy; A.near += near; A.dB += dB / P.length;
}
const out = {};
for (const c of Object.keys(acc).sort()) {
  const A = acc[c];
  out[c] = { n: A.n, nn: +(A.nn / A.n).toFixed(2), sdx: +(A.sdx / A.n).toFixed(1), sdy: +(A.sdy / A.n).toFixed(1), near: +(A.near / A.n).toFixed(2), dBall: +(A.dB / A.n).toFixed(1) };
  const o = out[c];
  console.log(`${c.padEnd(16)} n=${String(o.n).padStart(3)} · vicino di casa ${o.nn}u · profondità ±${o.sdx} · ampiezza ±${o.sdy} · coppie<3u ${o.near} · dalla palla ${o.dBall}u`);
}
/* Invarianti di credibilità, validi A PALLA FERMA in una cella (11 vs 11 su un campo 104×68):
   il compagno più vicino non può stare mediamente addosso, e la squadra deve restare distribuita. */
for (const [c, o] of Object.entries(out)) {
  if (o.n < 15) continue;
  if (o.nn < 4.0) issues.push(`${c}: il compagno più vicino è a ${o.nn}u — i giocatori si ammucchiano (atteso ≥4u con la palla in quella zona)`);
  if (o.sdy < 12) issues.push(`${c}: ampiezza ±${o.sdy} — la squadra è schiacciata su una corsia (atteso ≥12)`);
  if (o.sdx < 12) issues.push(`${c}: profondità ±${o.sdx} — le linee sono collassate una sull'altra (atteso ≥12)`);
}
let base = null; try { base = JSON.parse(fs.readFileSync(BASE, 'utf8')); } catch (e) {}
if (process.env.DA_UPDATE === '1') { fs.writeFileSync(BASE, JSON.stringify(out, null, 1)); console.log('baseline aggiornata → distribution-baseline.json'); }
else if (base) for (const [c, o] of Object.entries(out)) {
  const b = base[c]; if (!b || o.n < 15) continue;
  if (o.nn < b.nn - 1.2) issues.push(`${c}: vicino di casa ${o.nn}u contro ${b.nn}u di baseline (più ammucchiati)`);
  if (o.sdy < b.sdy - 3) issues.push(`${c}: ampiezza ±${o.sdy} contro ±${b.sdy} di baseline (meno larghi)`);
}
await browser.close(); srv.close();
console.log(issues.length ? '❌ FAIL\n' + issues.map(i => '  ✗ ' + i).join('\n') : '✅ DISTRIBUZIONE OK (a palla ferma la squadra resta distribuita in ogni zona del campo)');
process.exit(issues.length ? 1 : 0);
