#!/usr/bin/env node
/* BANCO giro 346 (PO-561) — «I movimenti incidono sulla probabilita' di successo della giocata o e' solo "un abbellimento"?»
   Chiede l'esito al MOTORE (giocaScena, quello che decide tiro e assist su azione nella partita vissuta) per ogni azione da gol o da
   assist delle scene del catalogo in cui l'eroe ha passi da spendere (cappedMM > 0, fuori area, non piazzati, non difensive), in STATI
   diversi della partita (il motore avanza di 4 minuti fra uno stato e l'altro: i difensori veri si spostano).
   Bracci, a parita' di stato: FERMO (nessun passo) · MIGLIORE (i passi verso la porta, staccandosi dal marcatore) · AVANTI (verso la
   porta, stacco neutro) · ADDOSSO (verso la porta andando sul marcatore) · INDIETRO (via dalla porta, staccandosi) · PEGGIORE (via
   dalla porta e sul marcatore). Un passo = 2,5 unita' di campo e ±1 di stacco, come il pad.
   TIRO: la riuscita e' il gol atteso che il motore calcola (esatto, nessun sorteggio da contare). ASSIST: frequenza su REP ripetizioni.
   Stampa anche la percentuale che il TASTO mostrerebbe (probEroe) nello stesso punto: solo misura.
     CPM_CHROME=… node movimenti-346.mjs     (CPM_ROSSO=1 → __CPM_NO_G346B · CPM_STATI=10 · CPM_REP=300 · CPM_K='{"pos":1,"sp":0.1,"pas":0.03}') */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
export const BRACCI = ['fermo', 'migliore', 'avanti', 'addosso', 'indietro', 'peggiore'];
export async function banco({ rosso = false, stati = +(process.env.CPM_STATI || 10), rep = +(process.env.CPM_REP || 300), liv = 80, K = process.env.CPM_K ? JSON.parse(process.env.CPM_K) : null } = {}) {
  const srv = await startServer(), port = srv.address().port, b = await launchBrowser();
  const p = await b.newPage(); await installCdnRoutes(p);
  await p.addInitScript(([r, K]) => { if (r) window.__CPM_NO_G346B = 1; if (K) window.__CPM_K346 = K; }, [rosso, K]);
  let out = null;
  try { await openMatch(p, port, { skipLoadAll: true, name: 'Giro346' }); await sleep(1500);
    out = await p.evaluate(([stati, rep, liv, BR]) => { const M = window.__CPM_MOTORE_OBJ && window.__CPM_MOTORE_OBJ(); if (!M || !M.giocaScena) return { err: 'motore assente' };
      const st = { tiro: liv, tecnica: liv, passaggio: liv, dribbling: liv, 'velocità': liv, fisico: liv, 'mentalità': liv, posizionamento: liv };
      const casi = [];
      SITUATIONS.forEach((sit, gi) => { const z = sit.startZone || sit.moveZone; if (!z || sit.type === 'def') return;
        try { if (isPenaltySit(sit) || hideDirCursor(sit)) return; } catch (e) { return; }
        const mm = cappedMM(sit); if (!(mm > 0)) return; const x = (z.x[0] + z.x[1]) / 2, y = (z.y[0] + z.y[1]) / 2;
        (sit.actions || []).forEach(a => { if (a.rew !== 'goal' && a.rew !== 'assist') return; const o = _brainIn82(a, sit, { x, y }, st, {}); if ((o.fam !== 'tiro' && o.fam !== 'assist') || o.intent === 'penalty' || o.intent === 'freekick') return;
          casi.push({ gi, fam: o.fam, stat: o.stat, intent: o.intent, x, y, mm, a }); }); });
      const mov = (c, br) => { const d = 2.5 * c.mm, s = c.mm; return br === 'fermo' ? null : br === 'migliore' ? { dx: d, dy: 0, sm: s } : br === 'avanti' ? { dx: d, dy: 0, sm: 0 } : br === 'addosso' ? { dx: d, dy: 0, sm: -s } : br === 'indietro' ? { dx: -d, dy: 0, sm: s } : { dx: -d, dy: 0, sm: -s }; };
      const acc = {}; for (const f of ['tiro', 'assist']) { acc[f] = {}; for (const br of BR) acc[f][br] = { s: 0, n: 0 }; } const tasto = { tiro: { s: 0, n: 0 }, assist: { s: 0, n: 0 } };
      /* identita' «senza passi = come prima»: PRIMA di ogni altro conto (stesso stato in ogni braccio), il gol atteso di ogni tiro da fermo */
      const xg0 = () => casi.filter(c => c.fam === 'tiro').map(c => { const g = M.giocaScena({ fam: c.fam, stat: c.stat, intent: c.intent, x: c.x, y: c.y, stats: st, mov: null }); return g ? g.xg : null; });
      const primo = xg0();
      /* [giro 350] l'identita' si misura NELLA STESSA PAGINA, sullo STESSO stato: prima il conto cosi' com'e', poi lo stesso conto col rosso
         acceso per un istante (nessun tick in mezzo). Confrontare due pagine diverse misurava il cronometro: la partita aperta avanza in
         tempo reale fra openMatch e il conto, e due pagine verdi davano 1-4 gol attesi diversi su 109 (anche su v7.999.207, prima del 346). */
      const r0 = !!window.__CPM_NO_G346B; window.__CPM_NO_G346B = 1; const primoRosso = xg0(); if (!r0) delete window.__CPM_NO_G346B;
      let min = 1; const B = 22; let diversi = 0, uguali = 0;
      for (let t = 0; t < stati; t++) { for (let k = 0; k < 4; k++) { for (let q = 0; q < B; q++) M.tick({ min: Math.min(min, 44), dt: 1 / B, dec: true }); min++; }
        for (const c of casi) { const base = { fam: c.fam, stat: c.stat, intent: c.intent, x: c.x, y: c.y, stats: st };
          const pr = M.probEroe(_brainIn82(c.a, SITUATIONS[c.gi], { x: c.x, y: c.y }, st, { mods: 0, mult: 1 })); if (pr && isFinite(pr.p)) { tasto[c.fam].s += pr.p; tasto[c.fam].n++; }
          let pf = null;
          for (const br of BR) { let v;
            if (c.fam === 'tiro') { const g = M.giocaScena({ ...base, mov: mov(c, br) }); if (!g) continue; v = g.xg; }
            else { let ok = 0, n = 0; for (let r = 0; r < rep; r++) { const g = M.giocaScena({ ...base, mov: mov(c, br) }); if (g) { n++; ok += g.ok ? 1 : 0; } } if (!n) continue; v = ok / n; }
            acc[c.fam][br].s += v; acc[c.fam][br].n++;
            if (c.fam === 'tiro') { if (br === 'fermo') pf = v; else if (br === 'migliore' && pf != null) { if (Math.abs(v - pf) > 1e-9) diversi++; else uguali++; } } } } }
      const R = {}; for (const f of ['tiro', 'assist']) { R[f] = {}; for (const br of BR) R[f][br] = acc[f][br].n ? +(acc[f][br].s / acc[f][br].n).toFixed(4) : null; R[f].n = acc[f].fermo.n; R[f].tasto = tasto[f].n ? +(tasto[f].s / tasto[f].n).toFixed(4) : null; }
      return { R, primo, primoRosso, casi: casi.length, scene: new Set(casi.map(c => c.gi)).size, stati, diversi, uguali, passi: { uno: casi.filter(c => c.mm === 1).length, due: casi.filter(c => c.mm >= 2).length } }; }, [stati, rep, liv, BRACCI]);
  } catch (e) { out = { err: String(e.message || e).slice(0, 200) }; }
  await b.close(); srv.close(); return out; }
export function stampa(o, et) { if (!o || o.err) { console.log(`  ?? ${et}: ${o && o.err}`); return; }
  console.log(`  ${et}: ${o.casi} azioni di ${o.scene} scene (${o.passi.uno} con un passo, ${o.passi.due} con due) × ${o.stati} stati di partita`);
  for (const f of ['tiro', 'assist']) { const r = o.R[f]; if (!r.n) { console.log(`    ${f}: nessun campione`); continue; }
    console.log(`    ${f.padEnd(6)} (${r.n} campioni) ` + BRACCI.map(b => `${b} ${(r[b] * 100).toFixed(2)}%${b !== 'fermo' ? ' (' + (r[b] / r.fermo >= 1 ? '+' : '') + ((r[b] / r.fermo - 1) * 100).toFixed(1) + '%)' : ''}`).join(' · ') + ` · tasto ${(r.tasto * 100).toFixed(1)}%`); }
  console.log(`    tiri in cui la mossa migliore cambia il gol atteso: ${o.diversi} su ${o.diversi + o.uguali}`); }
if (import.meta.url === `file://${process.argv[1]}`) { const v = await banco({}); stampa(v, 'verde'); const r = await banco({ rosso: true }); stampa(r, 'ROSSO __CPM_NO_G346B');
  if (v.primo && v.primoRosso) { const d = v.primo.filter((q, i) => q !== v.primoRosso[i]).length; console.log(`  identita' senza passi (gol atteso da fermo, primo conto, verde contro rosso): ${v.primo.length - d} uguali su ${v.primo.length}`); }
  process.exit(0); }
