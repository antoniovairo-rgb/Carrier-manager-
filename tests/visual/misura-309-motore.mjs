/* [giro 309 PO-596/PO-560] SOLA MISURA. Distribuzione dei punteggi e strisce di sconfitte del motore senza grafica
   (simulateMatch {motore:true} -> simulaPartitaMotore, src/10 ~921 / src/14 ~1902), coi semi del gioco (standingsSeed+giornata*31+1),
   contro: (a) lo stesso motore con semi indipendenti, (b) il motore coi parametri della partita giocata (forza = prestigio puro, senza
   clubPrestigeShifts), (c) un riferimento Poisson indipendente con le stesse medie gol per differenza di forza.
   CPM_CLUBS=aug,mai CPM_STAG=1-20 CPM_CHROME=/opt/pw-browsers/chromium node misura-309-motore.mjs */
import { apri, EROE } from './misura-309-sonda.mjs';
import fs from 'node:fs';
const CL = (process.env.CPM_CLUBS || 'aug').split(',');
const [S0, S1] = (process.env.CPM_STAG || '1-10').split('-').map(Number);
const OVR = +(process.env.CPM_OVR || 66);
const { page, browser, srv, errors } = await apri(EROE);
const out = await page.evaluate(({ CL, S0, S1, OVR }) => {
  const sim = window.__CPM_simMatch;
  const rows = [];
  for (const id of CL) { const c = CLUBS.find(x => x.id === id);
    for (let s = S0; s <= S1; s++) {
      const L = legaDopoTrasferimento212({ season: s, week: 1, clubPrestigeShifts: {} }, c, {});
      const cal = L.newCalendarFull.filter(e => !e.type).sort((a, b) => a.matchday - b.matchday);
      for (const md of cal) { const o = L.lcs.find(x => x.id === md.opponentId); if (!o) continue;
        const sd = (standingsSeed(c.id, s, md.week) + (md.matchday || 0) * 31 + 1) >>> 0;
        const t0 = performance.now();
        const a = sim(c, o, OVR, md.isHome, sd, {}, { motore: true });                       // percorso Simula/Avanza
        const t1 = performance.now();
        const sdI = (hashStr('ind|' + c.id + '|' + s + '|' + md.matchday) * 2654435761) >>> 0;  // semi indipendenti
        const b = sim(c, o, OVR, md.isHome, sdI, {}, { motore: true });
        const v = window.__CPM_SIM_MOTORE({ seed: (sdI ^ 0x870) >>> 0, forzaH: c.p, forzaA: o.p, stadio: md.isHome ? 'home' : 'away', ovr: OVR }); // come il live: prestigio puro
        const p = sim(c, o, OVR, md.isHome, sd, {}, {});                                    // Poisson storico (motore spento)
        rows.push([id, s, md.matchday, md.week, md.isHome ? 1 : 0, o.id, o.p, a.homeScore, a.awayScore, b.homeScore, b.awayScore, v.home, v.away, p.homeScore, p.awayScore, Math.round(t1 - t0)]);
      } } }
  return rows;
}, { CL, S0, S1, OVR });
fs.mkdirSync('out/misura-309', { recursive: true });
const f = `out/misura-309/motore-${CL.join('_')}-${S0}-${S1}-ovr${OVR}.json`;
fs.writeFileSync(f, JSON.stringify(out));
const ms = out.map(r => r[15]); console.log(f, 'partite', out.length, 'ms/partita mediana', ms.sort((a, b) => a - b)[ms.length >> 1], 'errori', errors.length);
await browser.close(); srv.close();
