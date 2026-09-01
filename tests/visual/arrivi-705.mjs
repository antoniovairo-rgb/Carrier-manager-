/* [STRUMENTO] GLI ARRIVI DEL PIANO SONO CUSTODITI? — collaudo PO: «non ci sono azioni ben manovrate».
   Un'azione manovrata e' passaggio -> uomo -> controllo -> passaggio. Il piano nomina un ricevente per
   ogni tempo (`chi`), ma nessuna banda sorveglia le costruzioni: il testimone della custodia le ESCLUDE
   per progetto, quindi le sole scene che il PO guarda sono le sole non guardate da nessun metro.
   Qui: a ogni riga di piano (rk manovra-gol) si misura, DUE campioni dopo (il volo), la distanza fra il
   pallone e l'uomo piu' vicino della squadra che attacca. Arrivo custodito = sotto 4u. */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
const GLB = process.env.CPM_GLB !== '0';/* [direttiva PO 01/09] «i test li devi fare con GLB ON»: acceso di default, si spegne SOLO dichiarandolo nel comando */
const srv = await startServer(); const port = srv.address().port;
const b = await launchBrowser();
const arrivi = [];
for (const seme of [7300, 9200]) {
  const page = await b.newPage({ viewport: { width: 412, height: 915 } });
  await installCdnRoutes(page);
  const ROSSO = process.env.CPM_ROSSO || '';/* [v4] braccio rosso: CPM_ROSSO=706 accende __CPM_NO706 */
  await page.addInitScript((o) => { window.__CPM_GLB = o.glb; window.__CPM_REC = true; if (o.r) window['__CPM_NO' + o.r] = true; if (o.rk) window.__CPM_RK_PROBE = o.rk; }, { r: ROSSO, rk: process.env.CPM_RK || '', glb: GLB });
  await openMatch(page, port, { skipLoadAll: true, name: 'Ar' });
  await page.evaluate(s => window.__CPM_AUTOPLAY(true, { seed: s, policy: 'seeded', tickMs: 300 }), seme);
  let nPrev = 0;
  for (let k = 0; k < 900; k++) {
    await sleep(250);
    const r = await page.evaluate(() => { try {
      const ev = (window.__CPM_EV && window.__CPM_EV()) || [];
      const st = window.__CPM_STATE && window.__CPM_STATE();
      const RK = window.__CPM_RK_PROBE || 'manovra-gol';/* [v7] parametrizzata: CPM_RK=counter misura i contropiedi con lo stesso metro */
      const piani = ev.filter(e => e.ev === 'chronicle' && (e.rk === RK));
      const h = window.__CPM_HOLD && window.__CPM_HOLD();/* [v2] il verso del piano si legge QUI, al trigger: 700ms dopo il piano puo' essere gia' chiuso e pgDir e' null */
      return { n: piani.length, c: st ? st.clock : null, dir: (h && h.pgDir) || null, bx: st && st.ball ? st.ball.x : null };
    } catch (_e) { return null; } });
    if (!r) continue;
    if (r.n > nPrev) { nPrev = r.n;
      const dir705 = r.dir || (r.bx != null && r.bx > 50 ? 1 : -1);/* [v7] i contropiedi non hanno pgDir: il verso si stima dalla meta' campo del pallone al trigger */
      await sleep(700); /* il volo: ~2 campioni */
      const m = await page.evaluate((d) => { try {
        const st = window.__CPM_STATE && window.__CPM_STATE(); if (!st || !st.players || !st.ball) return null;
        const lato = d > 0 ? 'home' : 'away';
        const bx = st.ball.x, by = st.ball.y;/* [v2] st.ball e' GIA' in coordinate gioco (x,y) — la v1 leggeva .z inesistente: by=NaN, nessun confronto passava, mediana=sentinella 1e9 */
        let md = 1e9, nd = 0, nd6 = 0; st.players.forEach(p => { if (p.gk) return; const dd = Math.hypot(p.x - bx, p.y - by); if (p.team === lato) { if (dd < md) md = dd; } else { if (dd < 12) nd++; if (dd < 6) nd6++; } });/* [v5] +nd6: l'anello del 7.706 sta a 4,5u — a 12u il righello non lo distingue dai difensori che c'erano gia' *//* [v4] +nd: DIFENSORI entro 12u dal pallone — l'ipotesi dal filmstrip: l'azione sembra «non manovrata» perche' non e' CONTESA */
        return { md: +md.toFixed(1), nd, nd6, n706: (window.__CPM_N706 || 0), d706: (window.__CPM_D706 || []).join('/') };
      } catch (e) { return null; } }, dir705);
      if (m && m.md < 1e8) arrivi.push({ md: m.md, dir: r.dir, nd: m.nd, nd6: m.nd6, n706: m.n706, d706: m.d706 });/* [v3] +dir per smascherare gli arrivi attribuiti alla squadra sbagliata (dir null al trigger → default home) */
    }
    if (r.c != null && r.c >= 89) break;
  }
  await page.close();
}
await b.close(); srv.close();
const vals = arrivi.map(a => a.md);
const ord = vals.slice().sort((a, c) => a - c);
console.log(`\n=== GLI ARRIVI DEL PIANO SONO CUSTODITI? ${process.env.CPM_ROSSO ? '· ROSSO ' + process.env.CPM_ROSSO : '· VERDE'} ===\n`);
console.log(`  arrivi misurati: ${arrivi.length} · senza verso al trigger (dir null → assunto home): ${arrivi.filter(a => !a.dir).length}`);
if (arrivi.length) {
  console.log(`  distanza uomo-piu'-vicino → pallone: mediana ${ord[ord.length >> 1]}u · p90 ${ord[Math.floor(ord.length * 0.9)]}u · max ${ord[ord.length - 1]}u`);
  console.log(`  arrivi CUSTODITI (<4u): ${vals.filter(v => v < 4).length}/${vals.length}`);
  console.log(`  elenco (md@dir): ${arrivi.map(a => `${a.md}@${a.dir == null ? '?' : a.dir}`).join(' · ')}`);
  const nds = arrivi.map(a => a.nd).sort((a, c) => a - c);
  console.log(`  DIFENSORI entro 12u dal pallone: mediana ${nds[nds.length >> 1]} · arrivi senza NESSUN difensore: ${nds.filter(v => v === 0).length}/${nds.length}`);
  console.log(`  elenco difensori: ${arrivi.map(a => a.nd).join(' · ')}`);
  const n6 = arrivi.map(a => a.nd6).sort((a, c) => a - c);
  console.log(`  DIFENSORI entro 6u: mediana ${n6[n6.length >> 1]} · elenco: ${arrivi.map(a => a.nd6).join(' · ')}`);
  console.log(`  tick con elezione 706 attiva (cumulativo per arrivo): ${arrivi.map(a => a.n706).join(' · ')}`);
  console.log(`  distanze eletti al tick dell'arrivo: ${arrivi.map(a => a.d706 || '?').join(' · ')}`);
}
console.log('');
