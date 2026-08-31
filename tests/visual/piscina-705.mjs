/* [STRUMENTO] IL TUFFO DEL PORTIERE, GUARDATO FOTOGRAMMA PER FOTOGRAMMA.
   Collaudo PO: «il portiere sembra che sta in piscina». Il tuffo ambientale (7.695) l'ho acceso e
   misurato SOLO in partenza (6/6 col testo); mai guardato come FINISCE. Qui: si aspetta una riga di
   parata, poi 6 scatti in 4 secondi — tuffo, atterraggio, rialzata — piu' la telemetria del corpo del
   portiere (posizione, rotazione z = quanto e' sdraiato) campionata a 250ms per 5s. Se resta sdraiato
   o scivola in posa orizzontale, i numeri e le foto lo dicono insieme. */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
import fs from 'node:fs';
const dir = 'out/piscina705'; fs.mkdirSync(dir, { recursive: true });
const srv = await startServer(); const port = srv.address().port;
const b = await launchBrowser();
const page = await b.newPage({ viewport: { width: 412, height: 915 } });
await installCdnRoutes(page);
const ROSSO = process.env.CPM_ROSSO || '';/* [v4] braccio rosso: CPM_ROSSO=705 accende __CPM_NO705 (numero corto, come le altre sonde mie) */
await page.addInitScript((r) => { window.__CPM_GLB = false; window.__CPM_REC = true; if (r) window['__CPM_NO' + r] = true; }, ROSSO);
await openMatch(page, port, { skipLoadAll: true, name: 'Pi' });
await page.evaluate(() => window.__CPM_AUTOPLAY(true, { seed: 7300, policy: 'seeded', tickMs: 300 }));
let parPrev = 0, prese = 0;
const tele = [];
for (let k = 0; k < 900 && prese < 2; k++) {
  await sleep(250);
  const r = await page.evaluate(() => { try {
    const st = window.__CPM_STATE && window.__CPM_STATE();
    return { c: st ? st.clock : null, par: (window.__CPM_GK695 && window.__CPM_GK695.tuffi) || 0 };/* [v2] si scatta sull'incremento del TUFFO (il renderer arma il gesto), non sulla riga: con la riga il primo scatto arrivava a scena gia' chiusa e rinvio battuto — fotografavo il dopo, non il gesto */
  } catch (_e) { return null; } });
  if (!r) continue;
  if (r.par > parPrev) {
    parPrev = r.par; prese++;
    const serie = [];
    for (let f = 0; f < 20; f++) {
      const t = await page.evaluate(() => { try {
        const st = window.__CPM_STATE && window.__CPM_STATE(); if (!st || !st.players) return null;
        const gks = st.players.filter(p => p.gk);
        const bl = st.ball;
        /* [v3] anche il piano LOGICO: se il corpo va a y 74 mentre il logico resta nel clamp 38-62 del
           suo driver, lo scrittore del nuoto sta nel renderer; se ci va anche il logico, sta in live-match. */
        const mp = (window.__CPM_MP && window.__CPM_MP()) || [];
        const gkl = mp.filter(q => q && q.gk).map(q => ({ t: q.t, x: q.x, y: q.y }));
        const b3 = (window.__CPM_BALL3 && window.__CPM_BALL3()) || null;/* [v4] il pallone LOGICO (BALL3.l) accanto a quello renderer: se divergono, il tuffo insegue un fantasma */
        const lb = b3 && b3.l ? b3.l : null;
        const tg = (window.__CPM_GKT705 && window.__CPM_GKT705.home) || null;/* [v5] il bersaglio del builder e la velocita' residua: attribuiscono il nuoto a monte o a valle */
        const gv = (window.__CPM_GKV705 && window.__CPM_GKV705.home) || null;
        return { gks: gks.map(g => ({ team: g.team, x: g.x, y: g.y, wy: g.worldY, ry: g.ry })), gkl, bx: bl ? bl.x : null, by: bl ? bl.z : null, lbx: lb ? lb.x : null, lby: lb ? lb.y : null, tgy: tg ? tg.y : null, vz: gv ? gv.vz : null };
      } catch (e) { return null; } });
      if (t) serie.push(t);
      if (f <= 6 || f % 3 === 0) await page.screenshot({ path: `${dir}/parata${prese}-f${f}.png` });/* [v2] i primi 7 scatti FITTI: il tuffo dura ~1s */
      await sleep(250);
    }
    tele.push(serie);
  }
  if (r.c != null && r.c >= 89) break;
}
await b.close(); srv.close();
console.log(`\n=== IL TUFFO, GUARDATO ===  parate osservate: ${tele.length}\n`);
for (let i = 0; i < tele.length; i++) {
  const S = tele[i]; if (!S.length) continue;
  /* il portiere del lato dove sta la palla (vicino a gx 0 o 100) */
  console.log(`  parata ${i + 1}:`);/* [v4] la v3 sceglieva il lato con bx MONDO (-50..50) confrontato con 50: sempre 'home', portiere sbagliato meta' delle volte. Qui: TUTTI E DUE i portieri, chi ha nuotato si vede da se'. */
  for (const lato of ['home', 'away']) {
    const g0 = S.map(s => (s.gks || []).find(g => g.team === lato)).filter(Boolean);
    if (!g0.length) { console.log(`    gk ${lato}: non trovato`); continue; }
    const dx = g0.map((g, j) => j ? Math.hypot(g.x - g0[j - 1].x, g.y - g0[j - 1].y) : 0);
    const spost = dx.reduce((a, v) => a + v, 0);
    console.log(`    gk ${lato} — spostamento 5s: ${spost.toFixed(1)}u · passo max ${Math.max(...dx).toFixed(2)}u/250ms`);
    console.log(`      MESH   : ${g0.map(g => `${g.x.toFixed(0)},${g.y.toFixed(0)}`).join(' → ')}`);
    const gl = S.map(s2 => (s2.gkl || []).find(g => g.t === lato)).filter(Boolean);
    if (gl.length) console.log(`      LOGICA : ${gl.map(g => `${g.x},${g.y}`).join(' → ')}`);
  }
  console.log(`    pallone RENDER (x)  : ${S.map(s2 => s2.bx == null ? '?' : (+s2.bx).toFixed(0)).join(' → ')}`);/* [v5] st.ball e' GIA' in coordinate gioco: il +50 della v4 falsava la lettura (il «pallone a centrocampo» era l'angolo) */
  console.log(`    bersaglio gk home(y): ${S.map(s2 => s2.tgy == null ? '?' : (+s2.tgy).toFixed(0)).join(' → ')}`);
  console.log(`    vz gk home          : ${S.map(s2 => s2.vz == null ? '?' : (+s2.vz).toFixed(1)).join(' → ')}`);
  console.log(`    pallone LOGICO (x,y): ${S.map(s2 => s2.lbx == null ? '?' : `${(+s2.lbx).toFixed(0)},${(+s2.lby).toFixed(0)}`).join(' → ')}`);/* [v2] la traccia intera: un salto di 8u/250ms si vede se e' teletrasporto, camminata impossibile o aggancio sbagliato della sonda */
}
console.log(`\n  scatti in ${dir}\n`);
