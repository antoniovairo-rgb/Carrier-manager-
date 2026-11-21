/* [giro 309 PO-584] SOLA MISURA. Cartellini che il motore senza grafica gia' produce nelle partite SIMULATE (src/14 _cart913)
   per l'eroe e per la squadra, e che oggi nessuno trasforma in squalifica (simulateMatch, src/10 ~921, non li legge).
   Poi: con la regola «5 gialli = 1 giornata» e «rosso = 1 giornata» (proposta, non applicata) quante squalifiche a stagione.
   CPM_N=340 node misura-309-cartellini.mjs */
import { apri, EROE } from './misura-309-sonda.mjs';
import fs from 'node:fs';
const N = +(process.env.CPM_N || 340);
const { page, browser, srv, errors } = await apri(EROE);
const R = await page.evaluate(N => {
  const c = CLUBS.find(x => x.id === 'aug'), L = CLUBS.filter(x => !x.isU18 && x.lg === c.lg && x.id !== c.id);
  let gE = 0, rE = 0, gH = 0, rH = 0, gA = 0, rA = 0, n = 0, chiavi = null, tabK = null; const seq = [];
  for (let i = 0; i < N; i++) { const o = L[i % L.length], home = i % 2 === 0, sd = (standingsSeed(c.id, 2 + Math.floor(i / 34), 1 + (i % 38)) + (i % 34) * 31 + 1) >>> 0;
    const m = window.__CPM_SIM_MOTORE({ dettaglio: true, seed: (sd ^ 0x5a17) >>> 0, forzaH: c.p, forzaA: o.p, stadio: home ? 'home' : 'away', ovr: 70 });
    const e = (m.pag || []).find(x => x && x.eroe) || {}; if (!chiavi) { chiavi = Object.keys(e); tabK = Object.keys(m.tab.home || {}); }
    const g = +(e.gialli ?? e.g ?? e.amm ?? 0) || 0, r = +(e.rosso ?? e.rossi ?? e.esp ?? 0) || 0; gE += g; rE += r ? 1 : 0; seq.push([g, r ? 1 : 0]);
    const th = m.tab.home || {}, ta = m.tab.away || {}; gH += +(th.gialli ?? th.ammonizioni ?? 0) || 0; rH += +(th.rossi ?? th.espulsioni ?? 0) || 0; gA += +(ta.gialli ?? ta.ammonizioni ?? 0) || 0; rA += +(ta.rossi ?? ta.espulsioni ?? 0) || 0; n++; }
  // squalifiche dell'eroe a stagione con la regola proposta, a blocchi di 34
  const sq = []; for (let s = 0; s + 34 <= seq.length; s += 34) { let y = 0, q = 0; for (let k = s; k < s + 34; k++) { if (seq[k][1]) { q++; } else { y += seq[k][0]; if (y >= 5) { q++; y -= 5; } } } sq.push(q); }
  return { partite: n, chiaviPagella: chiavi, chiaviTabellino: tabK, eroe: { gialliPartita: +(gE / n).toFixed(3), rossiPartita: +(rE / n).toFixed(3) }, squadra: { gialli: +(gH / n).toFixed(2), rossi: +(rH / n).toFixed(3) }, avversari: { gialli: +(gA / n).toFixed(2), rossi: +(rA / n).toFixed(3) }, squalificheEroeStagioneProposta: sq };
}, N);
console.log(JSON.stringify(R)); if (errors.length) console.log(errors);
fs.mkdirSync('out/misura-309', { recursive: true }); fs.writeFileSync('out/misura-309/cartellini.json', JSON.stringify(R, null, 1));
await browser.close(); srv.close();
