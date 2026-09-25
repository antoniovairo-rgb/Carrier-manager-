/* [7.999.6] GUARDIANO DELL'EROE DAL GIOCO (scelta PO: «meno scene, tutte vere, almeno una a partita»).
   Gioca N partite vere (autoplay seedato, nomi diversi) e conta dal libro mastro le scene per origine:
   · motore-occasione = nata da un fatto del motore (l'eroe col pallone in zona utile);
   · calendario-tick  = aperta dalla griglia dei minuti perche' il fatto non arrivava (la «scena forzata» di prima);
   · le altre (catene, reattive, finali) sono meccanismi distinti e si riportano senza giudicarle.
   E dal motore: ricezioni e tiri dell'eroe, per vedere che i compagni lo cercano ma non per decreto.
   CPM_ROSSO=1 → __CPM_NO_EROEGIOCO: torna il decreto (bonus +26, apertura forzata dopo 14'). */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep, matchPhase } from './lib/harness.mjs';
const N = +(process.env.CPM_PARTITE || 2), ROSSO = process.env.CPM_ROSSO === '1';
/* A · il motore da solo, 60 partite, con la richiesta di scena gestita come nel live (si chiude all'occasione e si riapre 8' dopo):
   quante volte i compagni servono l'eroe. Misurato: 46,3 dal gioco contro 58,5 col decreto. Soglia 52, a meta' fra i due bracci. */
if (ROSSO) globalThis.window = { __CPM_NO_EROEGIOCO: 1 };
await import('../../prototipo/partita-vera/motore-v2.js'); await import('../../prototipo/partita-vera/partita.js');
const CREA = (globalThis.window && globalThis.window.creaPartita) || globalThis.creaPartita;
let ricA = 0; const NA = 60;
for (let k = 0; k < NA; k++) { const P = CREA({ registra: false, v2: true, seed: (7000 + k * 97) >>> 0, casa: { sigla: 'C', forza: 70 }, ospite: { sigla: 'O', forza: 70 }, eroeLato: 'home', eroe: { nome: 'E', ovr: 74 } });
  let aperta = true, riapri = 0; P.motore.chiedi.scenaEroe(true, 'conclusione');
  while (!P.stato.finita) { const r = P.passo({}); if (!aperta && P.stato.min >= riapri) { aperta = true; P.motore.chiedi.scenaEroe(true, 'conclusione'); }
    if (r && r.eventi) for (const e of r.eventi) { if (e.t === 'ricezione' && e.chi && e.chi.i === 21) ricA++; if (e.t === 'occasione_eroe' && aperta) { aperta = false; riapri = P.stato.min + 8; P.motore.chiedi.scenaEroe(false); } } } }
const ricMedia = ricA / NA; console.log(`A · ricezioni dell'eroe con la scena chiesta: ${ricMedia.toFixed(1)} a partita (decreto se >= 52)`);
if (ROSSO) { const rossoOk = ricMedia >= 52; console.log(rossoOk ? '✅ ROSSO come atteso: col decreto i compagni servono l\'eroe per obbligo' : '❌ il rosso non riproduce il decreto (ricezioni sotto 52)'); process.exit(rossoOk ? 0 : 1); }
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser(); const R = [];
for (let k = 0; k < N; k++) {
  const ctx = await b.newContext({ viewport: { width: 412, height: 915 } }); const page = await ctx.newPage(); await installCdnRoutes(page);
  await page.addInitScript(r => { window.__CPM_GLB = false; window.__CPM_REC = true; if (r) window.__CPM_NO_EROEGIOCO = 1; }, ROSSO);
  try {
    await openMatch(page, port, { skipLoadAll: true, name: 'Gioco' + (k * 41 + 7) });
    await page.evaluate(s => window.__CPM_AUTOPLAY(true, { seed: s, policy: 'seeded', tickMs: 300 }), 6100 + k * 89);
    const t0 = Date.now(); while (Date.now() - t0 < 300000) { await sleep(500); const ph = await matchPhase(page); if (ph === 'ended' || ph === 'ceremony') break; }
    const d = await page.evaluate(() => { const ev = window.__CPM_EV ? window.__CPM_EV() : []; const sc = ev.filter(e => e.ev === 'scena');
      const per = {}; for (const e of sc) { const k = e.nessuna ? 'nessuna' : (e.src || '?'); per[k] = (per[k] || 0) + 1; }
      const M = window.__CPM_MOTORE_OBJ && window.__CPM_MOTORE_OBJ(); let ric = 0, tiri = 0;
      try { const p = M.pagelle(); const h = (p.home || p).find ? (p.home || p).find(x => x.i === 21 || x.eroe) : null; if (h) { ric = h.ricezioni | 0; tiri = h.tiri | 0; } } catch (e) {}
      return { per, ric, tiri, fine: sc.length ? Math.max(...sc.map(e => e.min | 0)) : null }; });
    R.push({ k, ...d });
  } catch (e) { R.push({ k, err: String(e.message).slice(0, 120) }); }
  await ctx.close();
}
await b.close(); srv.close();
for (const r of R) console.log(JSON.stringify(r));
const ok = R.filter(r => r.per); const tot = k => ok.reduce((a, r) => a + ((r.per[k]) | 0), 0);
const fatto = tot('motore-occasione'), forzate = tot('calendario-tick');
console.log(`scene nate da un fatto ${fatto} · aperte dalla griglia ${forzate} · partite ${ok.length}`);
const fails = []; if (ok.length < N) fails.push('partite non finite');
for (const r of ok) if (!((r.per['motore-occasione'] | 0) + (r.per['calendario-tick'] | 0) >= 1 || r.per.nessuna)) fails.push(`partita ${r.k}: nessuna scena e nessuna spiegazione in cronaca`);
if (!ROSSO && forzate > 0) fails.push(`${forzate} scene aperte dalla griglia: dovevano nascere solo da un fatto`);
if (!ROSSO && ricMedia >= 52) fails.push(`A: l'eroe riceve ${ricMedia.toFixed(1)} palloni a partita con la scena chiesta: e' ancora il decreto`);
if (ROSSO) { const rossoOk = ricMedia >= 52; console.log(rossoOk ? '✅ ROSSO come atteso: col decreto i compagni servono l\'eroe per obbligo' : '❌ il rosso non riproduce il decreto (ricezioni sotto 52)'); process.exit(rossoOk ? 0 : 1); }
console.log(fails.length ? '❌ FAIL eroe-dal-gioco\n  ' + fails.join('\n  ') : '✅ PASS eroe-dal-gioco'); process.exit(fails.length ? 1 : 0);
