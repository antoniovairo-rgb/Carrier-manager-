/* [STRUMENTO] IL FLIPPER DELLE AZIONI PERICOLOSE — collaudo PO 01/09: «azioni pericolose sembrano un flipper».
   Due indiziati, misurati insieme sulle finestre di piano (GLB ON):
   (1) i BERSAGLI delle righe (bex/bey dal registro): se il racconto stesso zigzaga, il pallone non puo'
       che rimbalzare — angolo di virata fra righe consecutive del piano;
   (2) il TRASPORTO renderer: pallone campionato a 250ms — virate secche (>120 gradi con passo >2u) al secondo.
   Confronto col gioco aperto della stessa partita: il flipper e' tale solo se le scene sono PEGGIO del normale. */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
const GLB = process.env.CPM_GLB !== '0';
const srv = await startServer(); const port = srv.address().port;
const b = await launchBrowser();
const page = await b.newPage({ viewport: { width: 412, height: 915 } });
await installCdnRoutes(page);
await page.addInitScript(o => { window.__CPM_GLB = o.glb; window.__CPM_REC = true; }, { glb: GLB });
await openMatch(page, port, { skipLoadAll: true, name: 'Fl' });
await page.evaluate(() => window.__CPM_AUTOPLAY(true, { seed: 7300, policy: 'seeded', tickMs: 300 }));
/* [v2] POLILINEA: a 2fps i campioni da 250ms sono doppioni (passo 0) e il filtro mangiava tutto.
   Un vertice si registra solo quando il pallone s'e' mosso >=1u dall'ultimo vertice; le virate si
   misurano sui vertici — e' la traiettoria dei fotogrammi RESI, quella che l'occhio vede. */
const dentro = [], fuori = []; let vtx = null, vprev = null;
for (let k = 0; k < 900; k++) {
  await sleep(250);
  const r = await page.evaluate(() => { try {
    const h = window.__CPM_HOLD && window.__CPM_HOLD();
    const st = window.__CPM_STATE && window.__CPM_STATE();
    const vivo = !!(h && h.pg && h.pgStep != null && h.pgStep < h.pgLen);
    return { vivo, bx: st && st.ball ? st.ball.x : null, by: st && st.ball ? st.ball.y : null, c: st ? st.clock : null };
  } catch (_e) { return null; } });
  if (!r || r.bx == null) continue;
  if (!vtx) { vtx = { x: r.bx, y: r.by }; continue; }
  const dx1 = r.bx - vtx.x, dy1 = r.by - vtx.y, d1 = Math.hypot(dx1, dy1);
  if (d1 < 1) { if (r.c != null && r.c >= 89) break; continue; }
  if (vprev) {
    const cos = (dx1 * vprev.dx + dy1 * vprev.dy) / (d1 * vprev.d);
    const ang = Math.acos(Math.max(-1, Math.min(1, cos))) * 180 / Math.PI;
    if (d1 >= 2 && vprev.d >= 2) (r.vivo ? dentro : fuori).push({ ang: +ang.toFixed(0), d: +d1.toFixed(1) });
  }
  vprev = { dx: dx1, dy: dy1, d: d1 }; vtx = { x: r.bx, y: r.by };
  if (r.c != null && r.c >= 89) break;
}
/* i bersagli del racconto: righe manovra-gol consecutive dello stesso piano */
const righe = await page.evaluate(() => ((window.__CPM_EV && window.__CPM_EV()) || [])
  .filter(e => e.ev === 'chronicle' && e.rk === 'manovra-gol' && e.bex != null)
  .map(e => ({ min: e.min, x: e.bex, y: e.bey })));
await b.close(); srv.close();
const st = (a) => { if (!a.length) return 'n 0'; const s = a.map(v => v.ang).sort((x, y) => x - y);
  return `n ${a.length} · virata mediana ${s[s.length >> 1]}° · >120° (flipper): ${a.filter(v => v.ang > 120).length} (${Math.round(a.filter(v => v.ang > 120).length / a.length * 100)}%)`; };
console.log(`\n=== IL FLIPPER, MISURATO ===`);
console.log(`  pallone in FINESTRA di piano : ${st(dentro)}`);
console.log(`  pallone in gioco aperto      : ${st(fuori)}`);
let vir = [];
for (let i = 2; i < righe.length; i++) { const a = righe[i - 2], b2 = righe[i - 1], c = righe[i];
  if (c.min - a.min > 3) continue; /* stesso piano: righe vicine nel tempo */
  const d1x = b2.x - a.x, d1y = b2.y - a.y, d2x = c.x - b2.x, d2y = c.y - b2.y;
  const m1 = Math.hypot(d1x, d1y), m2 = Math.hypot(d2x, d2y);
  if (m1 < 1 || m2 < 1) continue;/* [v2] maglia 2u→1u: in area i tempi della mischia distano poco */
  const ang = Math.acos(Math.max(-1, Math.min(1, (d1x * d2x + d1y * d2y) / (m1 * m2)))) * 180 / Math.PI;
  vir.push({ ang: +ang.toFixed(0), d: +m2.toFixed(1) });
}
console.log(`  BERSAGLI delle righe (piano) : ${st(vir)}`);
if (vir.length) console.log(`  elenco virate bersagli: ${vir.map(v => `${v.ang}°/${v.d}u`).join(' · ')}`);
console.log('');
