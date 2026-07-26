#!/usr/bin/env node
/* [7.206.0 direttiva PO «sembra davvero una partita di calcio»] PROBE sull'AI DELIBERATIVA off-ball.
   Il motore dichiara (F10) che un difensore «legge» il ricevente più pericoloso della squadra in possesso e
   si mette sulla LINEA palla→ricevente per chiuderla, invece di limitarsi a marcare il più vicino. Finora
   nessuna misura lo verificava. Metodo: dai frame registrati di partite vere si ricava il portatore (il più
   vicino alla palla), il ricevente PIÙ PERICOLOSO (compagno del portatore più avanzato verso la porta
   attaccata) e si misura la distanza perpendicolare del difensore più vicino a quel corridoio.
   Il confronto è con un MODELLO NULLO: la stessa misura su un corridoio QUALUNQUE (un altro compagno del
   portatore). Se la copertura è deliberata, il corridoio pericoloso è coperto meglio di uno qualsiasi. */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';

const srv = await startServer(); const port = srv.address().port;
const browser = await launchBrowser();
const issues = [];
const frames = [];
for (const sd of [7, 4211, 90101, 55501]) {
  const pg = await browser.newPage({ viewport: { width: 900, height: 900 } });
  await installCdnRoutes(pg);
  pg.on('pageerror', e => issues.push('pageerror: ' + String(e.message).slice(0, 140)));
  await pg.addInitScript(() => { window.__CPM_GLB = false; });
  await openMatch(pg, port, { skipLoadAll: true });
  await pg.waitForFunction(() => typeof window.__CPM_AUTOPLAY === 'function', null, { timeout: 40000 });
  await pg.evaluate((s) => { window.__CPM_REC = true; window.__CPM_AUTOPLAY(true, { seed: s, policy: 'seeded' }); }, sd);
  await sleep(20000);
  frames.push(...await pg.evaluate(() => (window.__CPM_REC_DRAIN ? window.__CPM_REC_DRAIN() : [])));
  await pg.close();
}
await browser.close(); srv.close();

const gx = x => x + 50, gy = z => z / 0.68 + 50;
/* distanza perpendicolare dal segmento A→B, contata solo se la proiezione cade DENTRO il corridoio
   (un difensore dietro la palla o oltre il ricevente non sta chiudendo nulla) */
const laneDist = (A, B, P) => {
  const vx = B[0] - A[0], vy = B[1] - A[1], L2 = vx * vx + vy * vy;
  if (L2 < 4) return null;
  const t = ((P[0] - A[0]) * vx + (P[1] - A[1]) * vy) / L2;
  if (t < 0.12 || t > 0.92) return null;
  return Math.abs((P[0] - A[0]) * vy - (P[1] - A[1]) * vx) / Math.sqrt(L2);
};
const play = frames.filter(f => f.ph === 'playing' && f.p && f.p.length >= 21);
let nD = 0, sD = 0, nN = 0, sN = 0, covD = 0, covN = 0;
for (const f of play) {
  const B = [gx(f.b[0]), gy(f.b[1])];
  const P = f.p.map(p => p && [gx(p[0]), gy(p[1])]);
  let ci = -1, cd = 1e9;
  for (let i = 0; i < 21; i++) { if (!P[i] || i === 0 || i === 10) continue; const d = Math.hypot(P[i][0] - B[0], P[i][1] - B[1]); if (d < cd) { cd = d; ci = i; } }
  if (ci < 0 || cd > 12) continue;                      // nessun portatore chiaro
  const homeBall = ci < 10, goalX = homeBall ? 100 : 0;
  const mates = [], defs = [];
  for (let i = 0; i < 21; i++) {
    if (!P[i] || i === 0 || i === 10 || i === ci) continue;
    if ((i < 10) === homeBall) mates.push(P[i]); else defs.push(P[i]);
  }
  if (mates.length < 3 || defs.length < 3) continue;
  mates.sort((a, b) => Math.abs(a[0] - goalX) - Math.abs(b[0] - goalX));
  const danger = mates[0], neutral = mates[Math.floor(mates.length / 2)];
  for (const [tgt, isD] of [[danger, true], [neutral, false]]) {
    let best = 1e9;
    for (const d of defs) { const v = laneDist(B, tgt, d); if (v != null && v < best) best = v; }
    if (best > 1e8) continue;
    if (isD) { nD++; sD += best; if (best < 5) covD++; } else { nN++; sN += best; if (best < 5) covN++; }
  }
}
const avgD = nD ? sD / nD : 0, avgN = nN ? sN / nN : 0;
console.log(`frame utili ${play.length} · corridoi pericolosi misurati ${nD} · corridoi qualunque ${nN}`);
console.log(`corridoio PERICOLOSO: difensore più vicino alla linea ${avgD.toFixed(1)}u · chiuso (<5u) nel ${(covD / Math.max(1, nD) * 100).toFixed(1)}% dei casi`);
console.log(`corridoio QUALUNQUE (modello nullo): ${avgN.toFixed(1)}u · chiuso nel ${(covN / Math.max(1, nN) * 100).toFixed(1)}%`);
if (nD < 40) issues.push(`campione insufficiente (${nD} corridoi)`);
else if (!(avgD < avgN - 0.8 || covD / nD > covN / nN + 0.05))
  issues.push(`la copertura NON è deliberata: il corridoio più pericoloso è chiuso come uno qualunque (${avgD.toFixed(1)}u contro ${avgN.toFixed(1)}u · ${(covD / nD * 100).toFixed(1)}% contro ${(covN / nN * 100).toFixed(1)}%)`);
console.log(issues.length ? '❌ FAIL\n' + issues.map(i => '  ✗ ' + i).join('\n') : '✅ COPERTURA DELIBERATA CONFERMATA (il corridoio pericoloso è chiuso meglio di uno qualunque)');
process.exit(issues.length ? 1 : 0);
