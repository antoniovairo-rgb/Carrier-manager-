/* [giro 310] Misura prima/dopo, in pagina senza grafica, dei punti E (gialli dell'eroe nel motore, cartellini di squadra, squalifiche a
   stagione con la regola 5 gialli/rosso) e F (voto simulato sotto OVR 72). Verde = interruttori spenti, rosso = __CPM_NO_G310E/__CPM_NO_G310F.
   CPM_N=680 node misura-310-motore.mjs */
import { apri, EROE } from './misura-309-sonda.mjs';
import fs from 'node:fs';
const N = +(process.env.CPM_N || 680);
const { page, browser, srv, errors } = await apri(EROE);
const R = await page.evaluate(N => {
  const c = CLUBS.find(x => x.id === 'aug'), L = CLUBS.filter(x => !x.isU18 && x.lg === c.lg && x.id !== c.id);
  const cart = (rosso) => { window.__CPM_NO_G310E = rosso ? 1 : undefined;
    let gE = 0, rE = 0, gH = 0, rH = 0, gA = 0, rA = 0; const seq = [];
    for (let i = 0; i < N; i++) { const o = L[i % L.length], home = i % 2 === 0, sd = (standingsSeed(c.id, 2 + Math.floor(i / 34), 1 + (i % 38)) + (i % 34) * 31 + 1) >>> 0;
      const m = window.__CPM_SIM_MOTORE({ dettaglio: true, seed: (sd ^ 0x5a17) >>> 0, forzaH: c.p, forzaA: o.p, stadio: home ? 'home' : 'away', ovr: 70 });
      const e = (m.pag || []).find(x => x && x.eroe) || {}; const g = +e.amm || 0, r = (+e.esp || 0) > 0 ? 1 : 0; gE += g; rE += r; seq.push([g, r]);
      const th = m.tab.home || {}, ta = m.tab.away || {}; gH += +(th.ammonizioni ?? 0) || 0; rH += +(th.espulsioni ?? 0) || 0; gA += +(ta.ammonizioni ?? 0) || 0; rA += +(ta.espulsioni ?? 0) || 0; }
    const sq = []; const soglia = rosso ? 3 : 5;/* rosso: com'era (3 gialli dal vivo, nessuna nelle simulate); verde: la regola nuova */
    for (let s = 0; s + 34 <= seq.length; s += 34) { let y = 0, q = 0, salta = false; for (let k = s; k < s + 34; k++) { if (salta) { salta = false; continue; }
      if (seq[k][1]) { q++; y = 0; salta = true; } else { y += seq[k][0]; if (y >= soglia) { q++; y = 0; salta = true; } } } sq.push(q); }
    return { eroeGialli: +(gE / N).toFixed(3), eroeRossi: +(rE / N).toFixed(3), squadraGialli: +(gH / N).toFixed(3), squadraRossi: +(rH / N).toFixed(3), avvGialli: +(gA / N).toFixed(3),
      squalificheStagione: sq, mediaSq: +(sq.reduce((a, b) => a + b, 0) / sq.length).toFixed(2) }; };
  const voto = (rosso) => { window.__CPM_NO_G310F = rosso ? 1 : undefined; const out = {};
    for (const ovr of [60, 66, 71, 72, 78]) { let v = 0, n = 0; for (let i = 0; i < 150; i++) { const o = L[i % L.length], sd = (standingsSeed(c.id, 3, 1 + (i % 38)) + (i % 34) * 31 + 1) >>> 0;
      const sm = window.__CPM_simMatch(c, o, ovr, i % 2 === 0, sd, {}, { motore: true }); const vv = window.__CPM_VOTO158(sm, { goals: 0, assists: 0 }); if (vv != null) { v += vv; n++; } }
      out['ovr' + ovr] = +(v / n).toFixed(3); } return out; };
  const r = { E: { verde: cart(false), rosso: cart(true) }, F: { verde: voto(false), rosso: voto(true) } };
  window.__CPM_NO_G310E = undefined; window.__CPM_NO_G310F = undefined; return r;
}, N);
console.log(JSON.stringify(R)); if (errors.length) console.log('errori pagina', errors);
fs.mkdirSync('out/misura-310', { recursive: true }); fs.writeFileSync('out/misura-310/motore.json', JSON.stringify(R, null, 1));
await browser.close(); srv.close();
