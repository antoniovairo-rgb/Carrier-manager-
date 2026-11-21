/* [giro 310 PO-597] Misura prima/dopo dello stampo: legaDopoTrasferimento212 col motore (verde) e con lo stampo (rosso __CPM_NO_G310A).
   Punteggi distinti, striscia piu' lunga di esiti identici, vittorie al rovescio, tempo alla firma, anteprima == accettazione.
   CPM_CHROME=/opt/pw-browsers/chromium CPM_N=120 node misura-310-stampo.mjs */
import { apri, EROE } from './misura-309-sonda.mjs';
import fs from 'node:fs';
const N = +(process.env.CPM_N || 120);
const { page, browser, srv, errors } = await apri(EROE);
const R = await page.evaluate(N => {
  const braccio = (rosso) => { window.__CPM_NO_G310A = rosso ? 1 : undefined; legaDopoTrasferimento212._m310 = new Map();
    const clubs = CLUBS.filter(c => !c.isU18); const out = { casi: 0, giornate: 0, punteggi: {}, strisce: [], rovescio: 0, vittorie: 0, ms: [], identici: 0, foto: null, pts17: null };
    for (let k = 0; k < N; k++) { const c = clubs[(k * 7) % clubs.length], s = 1 + (k % 10);
      const t0 = performance.now(); const L = legaDopoTrasferimento212({ season: s, week: 20, clubPrestigeShifts: {} }, c, {}); out.ms.push(performance.now() - t0);
      const L2 = legaDopoTrasferimento212({ season: s, week: 20, clubPrestigeShifts: {} }, c, {});/* l'anteprima: seconda chiamata */
      if (JSON.stringify(L.newCalendar) === JSON.stringify(L2.newCalendar) && JSON.stringify(L.newStandings) === JSON.stringify(L2.newStandings)) out.identici++;
      const pas = L.newCalendar.filter(e => !e.type && e.played).sort((a, b) => a.matchday - b.matchday); if (!pas.length) continue; out.casi++;
      let best = 1, cur = 1; pas.forEach((e, i) => { const r = e.result; const kk = r.homeScore + '-' + r.awayScore; out.punteggi[kk] = (out.punteggi[kk] || 0) + 1; out.giornate++;
        if (r.won) { out.vittorie++; if (r.homeScore < r.awayScore) out.rovescio++; }
        if (i) { const p = pas[i - 1].result; if (p.won === r.won && p.drew === r.drew) { cur++; best = Math.max(best, cur); } else cur = 1; } });
      out.strisce.push(best);
      /* coerenza classifica <-> calendario: la riga del club somma i risultati del calendario */
      const me = L.newStandings.find(t => t.id === c.id); const gf = pas.reduce((a, e) => a + e.result.homeScore, 0);
      if (!me || me.gf !== gf || me.played !== pas.length) out.incoerente = (out.incoerente || 0) + 1;
    }
    const aug = CLUBS.find(c => c.id === 'aug'); legaDopoTrasferimento212._m310 = new Map();
    const LA = legaDopoTrasferimento212({ season: 1, week: 20, clubPrestigeShifts: {} }, aug, {});
    out.foto = LA.newCalendar.filter(e => !e.type && e.played).map(e => (e.result.won ? 'V' : e.result.drew ? 'N' : 'P') + e.result.homeScore + '-' + e.result.awayScore).join(' ');
    out.pts17 = (LA.newStandings.find(t => t.id === 'aug') || {}).pts;
    const ms = out.ms.sort((a, b) => a - b); const st = out.strisce;
    return { casi: out.casi, giornate: out.giornate, punteggiDistinti: Object.keys(out.punteggi).length, piuFrequente: Object.entries(out.punteggi).sort((a, b) => b[1] - a[1])[0],
      strisciaMedia: +(st.reduce((a, b) => a + b, 0) / st.length).toFixed(2), quotaGe5: +(st.filter(x => x >= 5).length / st.length).toFixed(3),
      rovescio: out.rovescio + '/' + out.vittorie, msMediana: +ms[ms.length >> 1].toFixed(0), msMax: +ms[ms.length - 1].toFixed(0), anteprimaIdentica: out.identici + '/' + N, incoerenti: out.incoerente || 0, foto: out.foto, augPunti: out.pts17 };
  };
  const verde = braccio(false), rosso = braccio(true); window.__CPM_NO_G310A = undefined; return { verde, rosso };
}, N);
console.log(JSON.stringify(R, null, 1)); if (errors.length) console.log('errori pagina', errors);
fs.mkdirSync('out/misura-310', { recursive: true }); fs.writeFileSync('out/misura-310/stampo.json', JSON.stringify(R, null, 1));
await browser.close(); srv.close();
