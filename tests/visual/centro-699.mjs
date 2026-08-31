/* [STRUMENTO] QUANTO CENTROCAMPO C'E' DENTRO UNA SCENA SALIENTE?
   Collaudo PO: «devono vedersi soltanto le azioni extra eroe realmente pericolose, viene simulato molto
   il centrocampo». Il metro: mentre una finestra e' APERTA, quanti campioni hanno il pallone sotto la
   soglia dell'ultimo terzo (62) nel verso di chi attacca — e, all'opposto, le CONCLUSIONI restano dentro
   la finestra? Servono tutt'e due: una finestra pulita che perde il gol non e' un miglioramento. */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
const srv = await startServer(); const port = srv.address().port;
const b = await launchBrowser();
let dentro = 0, sotto = 0, fin = 0, conConcl = 0;
const righe = [];
for (const seme of [7300, 8100, 9200]) {
  const ctx = await b.newContext({ viewport: { width: 412, height: 915 } });
  const page = await ctx.newPage();
  await installCdnRoutes(page);
  const rossi = (process.env.CPM_ROSSO || '').split(',').map(x => x.trim()).filter(Boolean);
  await page.addInitScript(r => { window.__CPM_GLB = false; window.__CPM_REC = true; for (const k of r) window['__CPM_NO' + k] = true; }, rossi);
  await openMatch(page, port, { skipLoadAll: true, name: 'Cn' });
  await page.evaluate(s => window.__CPM_AUTOPLAY(true, { seed: s, policy: 'seeded', tickMs: 300 }), seme);
  let cur = null;
  for (let k = 0; k < 900; k++) {
    await sleep(250);
    const r = await page.evaluate(() => { try {
      const st = window.__CPM_STATE && window.__CPM_STATE(); const h = window.__CPM_HOLD && window.__CPM_HOLD();
      const bx = st && st.ball ? st.ball.x : 50; const d = h && h.pgDir ? h.pgDir : 0;
      /* ⚠️ IL METRO PRECEDENTE ERA DIFETTOSO, e i suoi numeri non vanno riusati: la quota di centrocampo
         la calcolavo solo sui campioni con una direzione d'attacco dichiarata (pendingGoal vivo), quindi
         la coda dopo il gol, i cartellini e il calcio d'inizio — centrocampo PURO — finivano nel
         denominatore e mai al numeratore. Il confronto 21% contro 23% metteva a fronte due numeri che non
         misuravano la stessa cosa. Qui la definizione non ha bisogno di direzione ed e' quella che l'occhio
         usa: il pallone sta nella FASCIA CENTRALE del campo (gx 35-65). Terzo difetto trovato in un mio
         strumento oggi, e il primo che invalida un confronto gia' pubblicato. */
      const ev = (window.__CPM_EV && window.__CPM_EV()) || [];
      return { w: window.__CPM_SAL689_WHY || null, adv: d === 0 ? null : (d > 0 ? bx : 100 - bx),
               bx, c: st ? st.clock : null, tiri: ev.filter(e => e.ev === 'chronicle' && (e.shots || e.oppShots)).length,
               gol: ev.filter(e => e.ev === 'goal').length };
    } catch (_e) { return null; } });
    if (!r) continue;
    if (r.w && !cur) cur = { causa: r.w, n: 0, giu: 0, t0: r.tiri, g0: r.gol, advMax: -1 };
    if (r.w && cur) { cur.n++; if (r.bx != null && r.bx >= 35 && r.bx <= 65) cur.giu++; if (r.adv != null) { if (r.adv > cur.advMax) cur.advMax = r.adv; } cur.t1 = r.tiri; cur.g1 = r.gol; }
    if (!r.w && cur) { righe.push({ seme, ...cur }); cur = null; }
    if (r.c != null && r.c >= 89) break;
  }
  if (cur) righe.push({ seme, ...cur });
  await ctx.close();
}
await b.close(); srv.close();
for (const f of righe) { fin++; dentro += f.n; sotto += f.giu;
  const concl = ((f.t1 || 0) - (f.t0 || 0)) > 0 || ((f.g1 || 0) - (f.g0 || 0)) > 0;
  if (concl) conConcl++; }
console.log(`\n=== QUANTO CENTROCAMPO DENTRO LE SCENE ${process.env.CPM_ROSSO ? '· ROSSO ' + process.env.CPM_ROSSO : '· VERDE'} ===\n`);
console.log(`  finestre: ${fin} · campioni totali ${dentro}`);
console.log(`  campioni col pallone in FASCIA CENTRALE (gx 35-65): ${sotto}/${dentro} = ${dentro ? (100 * sotto / dentro).toFixed(1) : '—'}%`);
console.log(`  finestre che contengono una CONCLUSIONE (tiro o gol): ${conConcl}/${fin}`);
console.log('\n  per finestra (causa · campioni · quota centrocampo · avanzata max):');
for (const f of righe) console.log(`    ${String(f.causa).padEnd(12)} ${String(f.n).padStart(3)} · ${f.n ? (100 * f.giu / f.n).toFixed(0) : '—'}% · ${f.advMax < 0 ? '—' : f.advMax.toFixed(0)}`);
console.log('');
