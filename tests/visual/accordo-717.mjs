/* smoke + primo banco: distribuzione delle decisioni ombra e ACCORDO col copione
   (per ogni riga di cronaca con bersaglio bex, la decisione ombra al tick piu' vicino
    puntava nella stessa direzione? il ricevente ombra era vicino al bersaglio della riga?) */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from '/workspace/carrier-manager-/tests/visual/lib/harness.mjs';
const srv = await startServer(); const port = srv.address().port;
const b = await launchBrowser();
const page = await b.newPage({ viewport: { width: 412, height: 915 } });
await installCdnRoutes(page);
await page.addInitScript(() => { window.__CPM_GLB = true; window.__CPM_REC = true; });
await openMatch(page, port, { skipLoadAll: true, name: 'De' });
await page.evaluate(() => window.__CPM_AUTOPLAY(true, { seed: 7300, policy: 'seeded', tickMs: 300 }));
/* [v4] il registro e' un ANELLO col tetto: letto a fine partita perde le righe vecchie — si raccoglie
   DURANTE, deduplicando per ts. */
let c = 0; const visti = new Set(); const R = [];
while (c < 89) { await sleep(4000);
  const batch = await page.evaluate(() => { const st = window.__CPM_STATE && window.__CPM_STATE();
    const b3 = (window.__CPM_BALL3 && window.__CPM_BALL3()) || null;
    return { c: st ? st.clock : 0, ball: b3 && b3.l ? { ts: Date.now(), x: b3.l.x, y: b3.l.y } : null }; });
  c = batch.c || 0; if (batch.ball) R.push(batch.ball); }
const D = await page.evaluate(() => (window.__CPM_DEC || []));
await b.close(); srv.close();
/* [v5] METRO NUOVO: la riga-bersaglio e' rara (~5/partita, quasi tutte le righe sono mute) — si misura
   invece l'accordo fra la decisione e cio' che il pallone FA: per ogni 'passa', spostamento del pallone
   logico nei 2s successivi contro la direzione del ricevente scelto (coseno). */
const per = {}; for (const d of D) per[d.act] = (per[d.act] || 0) + 1;
console.log(`\n=== LA DECISIONE OMBRA ===  campioni ${D.length} · ${Object.entries(per).map(([k,v])=>`${k} ${v}`).join(' · ')}`);
const conRcv = D.filter(d => d.act === 'passa' && d.rcv);
const fwm = conRcv.map(d => d.rcv.fw).sort((a,b)=>a-b), blk = conRcv.filter(d => d.rcv.blk).length, mk = conRcv.filter(d => d.rcv.mk).length;
if (conRcv.length) console.log(`  passaggi: ${conRcv.length} · avanzamento mediano ${fwm[fwm.length>>1]}u · linee intercettabili scelte ${blk} · riceventi marcati scelti ${mk}`);
const cosi = [];
for (const d of D) { if (d.act !== 'passa' || !d.rcv || !d.ts) continue;
  const p0 = R.filter(b => b.ts <= d.ts).slice(-1)[0];
  const p1 = R.filter(b => b.ts > d.ts + 1200 && b.ts < d.ts + 3000)[0];
  if (!p0 || !p1) continue;
  const mx = p1.x - p0.x, my = p1.y - p0.y, mm = Math.hypot(mx, my); if (mm < 2) continue;
  const rx = d.rcv.x - p0.x, ry = d.rcv.y - p0.y, rm = Math.hypot(rx, ry) || 1;
  cosi.push((mx * rx + my * ry) / (mm * rm));
}
const conc = cosi.filter(v => v > 0.5).length, opp = cosi.filter(v => v < -0.5).length;
const cs = cosi.slice().sort((a, b) => a - b);
console.log(`  ACCORDO decisione<->pallone (coseno su ${cosi.length} passaggi): mediana ${cs.length ? cs[cs.length >> 1].toFixed(2) : '?'} · concordi(>0,5) ${conc} (${cosi.length?Math.round(conc/cosi.length*100):0}%) · opposti(<-0,5) ${opp}`);
console.log('');
