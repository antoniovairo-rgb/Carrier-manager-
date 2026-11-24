/* [giro 347 PO-599] SOLA MISURA dei gol del motore della simulazione, per lega. Per ogni lega: ogni club fa da squadra dell'eroe per
   CPM_STAG stagioni col calendario vero (legaDopoTrasferimento212) e i semi del gioco (standingsSeed+giornata*31+1), percorso Simula
   (simulateMatch {motore:true} -> simulaPartitaMotore). Bracci nella STESSA pagina: verde (taratura del giro 347) e rosso
   (window.__CPM_NO_G347 = taratura di oggi). Cartellini di squadra letti dalla stessa esecuzione (involucro su simulaPartitaMotore).
   CPM_LEGHE="Lega A,Premier Division" CPM_STAG=2 CPM_BRACCI=verde,rosso CPM_CHROME=/opt/pw-browsers/chromium node misura-347.mjs
   Uscita: out/misura-347/<etichetta>.json (righe compatte), analisi con misura-347-analisi.mjs */
import { apri, EROE } from './misura-309-sonda.mjs';
import fs from 'node:fs';
const LEGHE = (process.env.CPM_LEGHE || 'Lega A').split(',').map(s => s.trim()).filter(Boolean);
const STAG = +(process.env.CPM_STAG || 2);
const BRACCI = (process.env.CPM_BRACCI || 'verde,rosso').split(',');
const ET = process.env.CPM_ET || LEGHE.map(s => s.replace(/\W+/g, '')).join('_');
const { page, browser, srv, errors } = await apri(EROE);
const out = {};
for (const br of BRACCI) {
  out[br] = await page.evaluate(({ LEGHE, STAG, br }) => {
    window.__CPM_NO_G347 = br === 'rosso' ? 1 : undefined;
    let ult = null; const orig = simulaPartitaMotore;
    try { window.simulaPartitaMotore = function (o) { const r = orig(o); ult = r; return r; }; } catch (e) {}
    const sim = window.__CPM_simMatch; const rows = [];
    for (const lg of LEGHE) { const cl = CLUBS.filter(c => c.lg === lg);
      for (const c of cl) for (let s = 1; s <= STAG; s++) {
        const L = legaDopoTrasferimento212({ season: s, week: 1, clubPrestigeShifts: {} }, c, {});
        const cal = L.newCalendarFull.filter(e => !e.type).sort((a, b) => a.matchday - b.matchday);
        const ovr = Math.max(50, Math.min(90, c.p));
        for (const md of cal) { const o = L.lcs.find(x => x.id === md.opponentId); if (!o) continue;
          const sd = (standingsSeed(c.id, s, md.week) + (md.matchday || 0) * 31 + 1) >>> 0; ult = null;
          const a = sim(c, o, ovr, md.isHome, sd, {}, { motore: true });
          const t = ult && ult.tab; const cart = a.cart310 || { y: 0, r: false };
          rows.push([lg, c.id, s, md.matchday, md.isHome ? 1 : 0, c.p, o.p, a.homeScore, a.awayScore,
            t ? (t.home.ammonizioni | 0) : -1, t ? (t.away.ammonizioni | 0) : -1, t ? (t.home.espulsioni | 0) : -1, t ? (t.away.espulsioni | 0) : -1,
            t ? +(t.home.xg || 0) : -1, t ? +(t.away.xg || 0) : -1, t ? (t.home.tiri | 0) : -1, t ? (t.away.tiri | 0) : -1, cart.y | 0, cart.r ? 1 : 0]);
        } } }
    try { window.simulaPartitaMotore = orig; } catch (e) {}
    window.__CPM_NO_G347 = undefined; return rows;
  }, { LEGHE, STAG, br });
  console.log(br, 'partite', out[br].length);
}
fs.mkdirSync('out/misura-347', { recursive: true });
const f = `out/misura-347/${ET}.json`; fs.writeFileSync(f, JSON.stringify(out));
console.log(f, 'errori di pagina', errors.length, errors.slice(0, 2).join(' | '));
await browser.close(); srv.close();
