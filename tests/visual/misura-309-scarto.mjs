/* [giro 309 PO-560] SOLA MISURA. Da dove viene lo scarto fra simulata e motore «come il live» a parita' di forza: tre bracci
   sullo stesso motore (simulaPartitaMotore): T = seme della Simula + tattica come simulateMatch (persona dell'avversario);
   S = stesso seme senza tattica; L = seme diverso (^0x870) senza tattica. CPM_N=680 */
import { apri, EROE } from './misura-309-sonda.mjs';
import fs from 'node:fs';
const N = +(process.env.CPM_N || 680);
const { page, browser, srv, errors } = await apri(EROE);
const R = await page.evaluate(N => {
  const c = CLUBS.find(x => x.id === 'aug'), L = CLUBS.filter(x => !x.isU18 && x.lg === c.lg && x.id !== c.id);
  const acc = { T: [0, 0, 0], S: [0, 0, 0], L: [0, 0, 0], T2: [0, 0, 0] }; let conPersona = 0;
  const add = (k, m) => { acc[k][0] += m.home > m.away ? 3 : m.home === m.away ? 1 : 0; acc[k][1] += m.home; acc[k][2] += m.away; };
  for (let i = 0; i < N; i++) { const o = L[i % L.length], home = i % 2 === 0, sd = (standingsSeed(c.id, 2 + Math.floor(i / 34), 1 + (i % 38)) + (i % 34) * 31 + 1) >>> 0;
    const pe = getClubPersona(o); if (pe) conPersona++;
    const tat = { home: null, away: (pe && TATTICHE_MOTORE.persona[pe.id]) || null };
    const base = { forzaH: c.p, forzaA: o.p, stadio: home ? 'home' : 'away', ovr: 66 };
    add('T', window.__CPM_SIM_MOTORE({ ...base, seed: (sd ^ 0x5a17) >>> 0, tattica: tat }));
    add('S', window.__CPM_SIM_MOTORE({ ...base, seed: (sd ^ 0x5a17) >>> 0 }));
    add('L', window.__CPM_SIM_MOTORE({ ...base, seed: (sd ^ 0x870) >>> 0 }));
    add('T2', window.__CPM_SIM_MOTORE({ ...base, seed: (sd ^ 0x870) >>> 0, tattica: tat })); }
  const f = a => ({ ppg: +(a[0] / N).toFixed(3), gf: +(a[1] / N).toFixed(2), ga: +(a[2] / N).toFixed(2) });
  return { N, conPersona, T: f(acc.T), S: f(acc.S), L: f(acc.L), T2: f(acc.T2), persone: [...new Set(L.map(o => (getClubPersona(o) || {}).id || '-'))] };
}, N);
console.log(JSON.stringify(R)); if (errors.length) console.log(errors);
fs.writeFileSync('out/misura-309/scarto.json', JSON.stringify(R, null, 1));
await browser.close(); srv.close();
