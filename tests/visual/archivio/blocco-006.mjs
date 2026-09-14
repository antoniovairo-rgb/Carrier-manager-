/* [STRUMENTO] IL REPARTO SI MUOVE COME UNA LINEA?
   Il codice 006 («reparto fermo») NON e' immobilita' dei singoli: misurato coi GLB accesi, 2 corpi su
   21 fermi e spostamento mediano 0,22-0,42u in 1,2s. L'ipotesi nuova, nata dallo scatto, e' che il
   reparto non si muova COME BLOCCO: non scala col pallone, non stringe.
   Tre grandezze, campionate in gioco aperto (non in scena, dove il freeze e' voluto):
   (a) il BARICENTRO della squadra che difende segue il pallone? correlazione fra i loro spostamenti;
   (b) la LARGHEZZA del blocco (deviazione standard sull'asse lungo) cambia col pallone o e' costante?
   (c) la distanza baricentro-pallone: cala quando il pallone si avvicina alla porta difesa?
   Nessuna di queste e' un'impressione: se il blocco e' vivo, si vede nei numeri. */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
const srv = await startServer(); const port = srv.address().port;
const b = await launchBrowser();
const page = await b.newPage({ viewport: { width: 412, height: 915 } });
await installCdnRoutes(page);
await page.addInitScript(() => { window.__CPM_GLB = false; window.__CPM_REC = true; });
await openMatch(page, port, { skipLoadAll: true, name: 'Bl' });
await page.evaluate(() => window.__CPM_AUTOPLAY(true, { seed: 7300, policy: 'seeded', tickMs: 300 }));
const S = [];
for (let k = 0; k < 260; k++) {
  await sleep(300);
  const r = await page.evaluate(() => { try {
    const st = window.__CPM_STATE && window.__CPM_STATE(); if (!st || !st.players || !st.ball) return null;
    if (st.phase !== 'playing') return null;
    const bx = st.ball.x + 50;
    const dif = st.players.filter(p => p.team === 'away' && !p.gk);
    if (dif.length < 6) return null;
    const cx = dif.reduce((s, p) => s + p.x, 0) / dif.length;
    const mu = cx, sd = Math.sqrt(dif.reduce((s, p) => s + (p.x - mu) * (p.x - mu), 0) / dif.length);
    return { bx, cx, sd, n: dif.length };
  } catch (e) { return null; } });
  if (r) S.push(r);
}
await b.close(); srv.close();
const d = [];
for (let i = 1; i < S.length; i++) d.push({ db: S[i].bx - S[i - 1].bx, dc: S[i].cx - S[i - 1].cx, sd: S[i].sd, dist: Math.abs(S[i].cx - S[i].bx) });
const media = a => a.reduce((s, v) => s + v, 0) / (a.length || 1);
const corr = (a, c) => { const ma = media(a), mc = media(c);
  const num = a.reduce((s, v, i) => s + (v - ma) * (c[i] - mc), 0);
  const da = Math.sqrt(a.reduce((s, v) => s + (v - ma) ** 2, 0)), dc = Math.sqrt(c.reduce((s, v) => s + (v - mc) ** 2, 0));
  return (da && dc) ? num / (da * dc) : 0; };
const sds = d.map(x => x.sd).sort((a, c) => a - c);
console.log('\n=== IL REPARTO SI MUOVE COME UNA LINEA? ===\n');
console.log(`  campioni in gioco aperto: ${S.length}`);
console.log(`  passo del BARICENTRO che difende: mediano ${d.length ? media(d.map(x => Math.abs(x.dc))).toFixed(3) : '—'}u per campione`);
console.log(`  passo del PALLONE:                mediano ${d.length ? media(d.map(x => Math.abs(x.db))).toFixed(3) : '—'}u per campione`);
console.log(`  correlazione baricentro↔pallone:  ${corr(d.map(x => x.db), d.map(x => x.dc)).toFixed(3)}   (1 = scala col pallone, 0 = indifferente)`);
console.log(`  larghezza del blocco (dev.std):    min ${sds[0]?.toFixed(1)} · mediana ${sds[sds.length >> 1]?.toFixed(1)} · max ${sds[sds.length - 1]?.toFixed(1)}u`);
console.log(`  distanza baricentro-pallone:       mediana ${media(d.map(x => x.dist)).toFixed(1)}u\n`);
