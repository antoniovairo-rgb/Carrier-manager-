#!/usr/bin/env node
/* 7.549 — VARIANTE A FINESTRA LUNGA. Collaudo PO: «vedo ancora girotondo, addirittura in area
   avversaria». La sonda base misura finestre di ~3s (uomini) e ~10s (pallone) e dice 0,71 di rettilineita':
   ma il PO guarda la partita per MINUTI. La trappola e' gia' nei libri — la stessa sonda a 3 secondi
   diceva 0,90 e 1% di giri, a 10 secondi 0,40 e 41%: la LUNGHEZZA DELLA FINESTRA era la differenza fra
   «non c'e' niente» e «il difetto e' enorme». Qui i campioni per finestra sono configurabili (CPM_NCAMP,
   default 540 = sei volte piu' lunga).

   7.542 — «GIRO GIRO TONDO» (collaudo PO). ⚠️ La prima sonda misurava la COMPRESSIONE della squadra e ha
   SMENTITO il mio sospetto: verde e rosso identici (21,8u contro 21,6u di distanza mediana dal pallone,
   ampiezza 13,1/15,3 contro 13,4/15,2), quindi la traslazione dei reparti introdotta nel 7.538 NON c'entra
   — e i 13u di ampiezza in lunghezza corrispondono ai 35-40 metri che una squadra vera occupa davvero.
   Ma «giro giro tondo» non descrive una squadra STRETTA: descrive gente che GIRA. E' una firma di MOTO,
   non di posizione, e va campionata a fotogrammi, non a minuti di gioco.
   Qui, su una finestra di scena breve, per ogni uomo in campo si misura:
   · RETTILINEITA' = spostamento netto / lunghezza del percorso (1 = va dritto, ~0 = torna su se stesso);
   · GIRO ATTORNO AL PALLONE = gradi di angolo percorsi attorno alla palla.
   Chi ha rettilineita' bassa E molto giro sta letteralmente girando in tondo attorno al pallone. */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep, matchPhase } from './lib/harness.mjs';
const FINESTRE = +(process.env.CPM_FIN || 6);
const srv = await startServer(); const port = srv.address().port;
const b = await launchBrowser();
const page = await b.newPage({ viewport: { width: 412, height: 915 } });
await installCdnRoutes(page);
await page.addInitScript(() => { window.__CPM_GLB = false; });
await openMatch(page, port, { skipLoadAll: true, name: 'Giro' });
await page.addInitScript(()=>{window.__CPM_NCAMP=+(new URLSearchParams(location.search).get('ncamp'))||540;});
 await page.evaluate(n => { window.__CPM_NCAMP = n; window.__CPM_AUTOPLAY(true, { seed: 4242, policy: 'seeded', tickMs: 300 }); }, +(process.env.CPM_NCAMP||540));
let out = [];
for (let f = 0; f < FINESTRE; f++) {
  // si aspetta una finestra di gioco vivo
  let ok = false;
  for (let k = 0; k < 40; k++) { const ph = await matchPhase(page); if (ph === 'playing') { ok = true; break; } if (ph === 'ended' || ph === 'ceremony') break; await sleep(500); }
  if (!ok) break;
  const r = await page.evaluate(() => new Promise(res => {
    const campioni = []; let n = 0;
    const iv = setInterval(() => {
      try {
        const s = window.__CPM_STATE && window.__CPM_STATE();
        if (s && s.phase === 'playing') {
          const p = (s.players || []).filter(q => q && q.team !== 'ref' && !q.gk).concat(s.hero ? [s.hero] : []);
          campioni.push({ c: s.clock, b: { x: s.ball.x, y: s.ball.y }, p: p.map(q => ({ x: q.x, y: q.y })) });
        }
      } catch (e) {}
      if (++n >= (window.__CPM_NCAMP || 90)) { clearInterval(iv); res(campioni); }
    }, 110);
  }));
  if (r.length < 12) continue;
  out.push({ span: true, min: (r[r.length - 1].c || 0) - (r[0].c || 0), rett: 0, giro: 0, perc: 0 });
  const N = Math.min(...r.map(c => c.p.length));
  for (let i = 0; i < N; i++) {
    let perc = 0, giro = 0;
    for (let k = 1; k < r.length; k++) {
      const a = r[k - 1].p[i], c = r[k].p[i];
      perc += Math.hypot(c.x - a.x, c.y - a.y);
      const a1 = Math.atan2(a.y - r[k - 1].b.y, a.x - r[k - 1].b.x), a2 = Math.atan2(c.y - r[k].b.y, c.x - r[k].b.x);
      let d = a2 - a1; while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI;
      giro += Math.abs(d) * 180 / Math.PI;
    }
    const netto = Math.hypot(r[r.length - 1].p[i].x - r[0].p[i].x, r[r.length - 1].p[i].y - r[0].p[i].y);
    if (perc > 0.8) out.push({ rett: netto / perc, giro, perc });
  }
  { let bp = 0; for (let k = 1; k < r.length; k++) bp += Math.hypot(r[k].b.x - r[k - 1].b.x, r[k].b.y - r[k - 1].b.y);
    const bn = Math.hypot(r[r.length - 1].b.x - r[0].b.x, r[r.length - 1].b.y - r[0].b.y);
    if (bp > 1) out.push({ ball: true, rett: bn / bp, giro: 0, perc: bp }); }
}
await b.close(); srv.close();
if (out.length < 20) { console.log('campione insufficiente:', out.length); process.exit(1); }
const med = (a) => a.slice().sort((x, y) => x - y)[Math.floor(a.length / 2)];
const spn = out.filter(q => q.span); out = out.filter(q => !q.span);
/* ⚠️ E IL PALLONE? I giocatori vanno dritti (rettilineita' 0,90): se il «giro giro tondo» esiste, gira
   il PALLONE — che dal 7.539 rimbalza fra le posizioni di compagni veri, e se i riceventi si alternano
   sui due lati la palla puo' zigzagare fra tre uomini senza guadagnare un metro. */
const bal = out.filter(q => q.ball);
const tondi = out.filter(q => !q.ball && !q.span && q.rett < 0.35 && q.giro > 60).length;
console.log(`tracce misurate: ${out.length} (uomini x finestre di ~3s di scena)`);
console.log(`  RETTILINEITÀ mediana (1 = va dritto)      : ${med(out.map(q => q.rett)).toFixed(2)}`);
console.log(`  tracce con rettilineità < 0,35            : ${(out.filter(q => !q.ball && !q.span && q.rett < 0.35).length / out.filter(q => !q.ball && !q.span).length * 100).toFixed(0)}%`);
console.log(`  GIRO attorno al pallone, mediana          : ${med(out.map(q => q.giro)).toFixed(0)}°`);
console.log(`  GIRO GIRO TONDO (poco dritti E molto giro): ${tondi}/${out.length} (${(tondi / out.length * 100).toFixed(0)}%)`);
console.log(`  percorso medio in finestra                : ${med(out.filter(q => !q.ball).map(q => q.perc)).toFixed(1)}u`);
console.log(`\n  IL PALLONE (${bal.length} finestre di ~10s di scena)`);
console.log(`    rettilineità del pallone (1 = va da qualche parte) : ${bal.length ? med(bal.map(q => q.rett)).toFixed(2) : '-'}`);
console.log(`    percorso del pallone nella finestra                : ${bal.length ? med(bal.map(q => q.perc)).toFixed(1) : '-'}u`);
console.log(`    finestre in cui il pallone TORNA SU SE STESSO (<0,35): ${bal.filter(q => q.rett < 0.35).length}/${bal.length}`);
/* ⚠️ QUANTO TEMPO DI GIOCO STA DENTRO UNA FINESTRA. E' il numero che decide se il difetto e' una taratura
   o la compressione del tempo: se in ~10 secondi di visione passano piu' minuti di uno spell di possesso
   (4-9), la palla cambia padrone e verso DENTRO la finestra — e allora torna su se stessa perche' e'
   giusto cosi', non perche' il modello sia sbagliato. */
console.log(`    MINUTI DI GIOCO dentro una finestra di ~10s: mediana ${spn.length ? med(spn.map(q => q.min)) : '-'} (spell di possesso: 4-9 minuti)`);
