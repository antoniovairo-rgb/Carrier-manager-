/* [giro 309 PO-560] SOLA MISURA. L'eroe nelle partite SIMULATE (simulateMatch {motore, giocatore} + _pSimStats + votoSimEroe: il
   percorso di Simula/Avanza, src/18 ~3802) contro il MOTORE coi parametri della partita giocata (forza = prestigio puro, eroe attivo,
   scelte risolte dal motore: src/15 ~6686), per OVR. Avversari: tutta la Deutsche Liga, a turno; club dell'eroe FC Augusta (66).
   ⚠️ Il percorso «come il live» NON e' la partita giocata: li' le scelte negli highlight le fa il giocatore.
   CPM_N=120 node misura-309-eroe.mjs */
import { apri, EROE } from './misura-309-sonda.mjs';
import fs from 'node:fs';
const N = +(process.env.CPM_N || 120);
const { page, browser, srv, errors } = await apri(EROE);
const R = await page.evaluate(N => {
  const c = CLUBS.find(x => x.id === 'aug'), L = CLUBS.filter(x => !x.isU18 && x.lg === c.lg && x.id !== c.id);
  const out = {};
  for (const ovr of [60, 66, 72, 78, 84, 90]) {
    const pl = { name: 'Eroe', ovr, age: ovr >= 84 ? 26 : 21, position: 'ATT', archetype: null, form: 70, morale: 72, fatigue: 20, coachTrust: 60, club: c, season: 2, week: 10, standings: [], stats: {} };
    const a = { n: 0, pts: 0, gf: 0, ga: 0, g: 0, as: 0, v: 0, tit: 0 }, b = { n: 0, pts: 0, gf: 0, ga: 0, g: 0, as: 0, v: 0 };
    for (let i = 0; i < N; i++) { const o = L[i % L.length], home = i % 2 === 0, wk = 1 + (i % 38);
      const sd = (standingsSeed(c.id, 2 + Math.floor(i / 38), wk) + (i % 34) * 31 + 1) >>> 0;
      const s = window.__CPM_simMatch(c, o, ovr, home, sd, {}, { motore: true, giocatore: { ...pl, week: wk } });
      const ps = _pSimStats(s, ovr, '', seededRng((sd + 2) >>> 0)); const v = votoSimEroe(s, ps);
      a.n++; a.pts += s.won ? 3 : s.drew ? 1 : 0; a.gf += s.homeScore; a.ga += s.awayScore; a.g += ps.goals; a.as += ps.assists; a.v += v; if (s.stato156 === 'starter') a.tit++;
      const m = window.__CPM_SIM_MOTORE({ dettaglio: true, seed: (sd ^ 0x870) >>> 0, forzaH: c.p, forzaA: o.p, stadio: home ? 'home' : 'away', ovr });
      const e = (m.pag || []).find(x => x && x.eroe) || {};
      b.n++; b.pts += m.home > m.away ? 3 : m.home === m.away ? 1 : 0; b.gf += m.home; b.ga += m.away; b.g += e.gol | 0; b.as += e.assist | 0; b.v += +e.voto || 0; }
    const f = x => ({ ppg: +(x.pts / x.n).toFixed(2), gf: +(x.gf / x.n).toFixed(2), ga: +(x.ga / x.n).toFixed(2), golEroe: +(x.g / x.n).toFixed(3), assEroe: +(x.as / x.n).toFixed(3), voto: +(x.v / x.n).toFixed(2), ...(x.tit != null ? { titolare: +(x.tit / x.n).toFixed(2) } : {}) });
    out['ovr' + ovr] = { simulata: f(a), comeIlLive: f(b) };
  }
  return out;
}, N);
console.log(JSON.stringify(R, null, 1)); if (errors.length) console.log(errors);
fs.mkdirSync('out/misura-309', { recursive: true }); fs.writeFileSync('out/misura-309/eroe.json', JSON.stringify(R, null, 1));
await browser.close(); srv.close();
