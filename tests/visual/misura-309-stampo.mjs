/* [giro 309 PO-596] SOLA MISURA. Lo «stampo» delle giornate passate quando l'eroe arriva in un club a stagione in corso
   (legaDopoTrasferimento212, src/09 ~1912): riproduce la foto del PO e conta quanto spesso escono strisce di punteggi identici.
   CPM_CHROME=/opt/pw-browsers/chromium node misura-309-stampo.mjs */
import { apri, EROE } from './misura-309-sonda.mjs';
import fs from 'node:fs';
const { page, browser, srv, errors } = await apri(EROE);
const R = await page.evaluate(() => {
  const lega = c => CLUBS.filter(x => !x.isU18 && x.lg === c.lg);
  const fmt = r => r ? (r.won ? 'V' : r.drew ? 'N' : 'P') + ' ' + r.homeScore + '-' + r.awayScore : '-';
  // 1) la foto: FC Augusta, stagione 1, arrivo alla settimana 20
  const aug = CLUBS.find(c => c.id === 'aug');
  const L = legaDopoTrasferimento212({ season: 1, week: 20, clubPrestigeShifts: {} }, aug, {});
  const foto = L.newCalendar.filter(e => !e.type).map(e => ({ md: e.matchday, w: e.week, casa: e.isHome, opp: e.opponentName, r: e.played ? fmt(e.result) : 'da giocare' }));
  // 2) censimento: tutti i club di prima divisione delle leghe, stagioni 1-10, arrivo alla settimana 20
  const leghe = [...new Set(CLUBS.filter(c => !c.isU18).map(c => c.lg))];
  let tot = 0, cnt = {}, strisce = [], runsGe5 = 0, casi = 0, flipW = 0, wins = 0;
  for (const c of CLUBS.filter(c => !c.isU18)) for (let s = 1; s <= 10; s++) {
    let LL; try { LL = legaDopoTrasferimento212({ season: s, week: 20, clubPrestigeShifts: {} }, c, {}); } catch (e) { continue; }
    const pas = LL.newCalendar.filter(e => !e.type && e.played).sort((a, b) => a.matchday - b.matchday);
    if (!pas.length) continue; casi++;
    let best = 1, cur = 1;
    pas.forEach((e, i) => { const k = e.result.homeScore + '-' + e.result.awayScore; cnt[k] = (cnt[k] || 0) + 1; tot++;
      if (e.result.won) { wins++; if (e.result.homeScore < e.result.awayScore) flipW++; }
      if (i) { const p = pas[i - 1].result; if (p.won === e.result.won && p.drew === e.result.drew) { cur++; best = Math.max(best, cur); } else cur = 1; } });
    strisce.push(best); if (best >= 5) runsGe5++;
  }
  // 3) atteso con esiti INDIPENDENTI con le stesse probabilita' (stessa formula _wp, pareggio 0,27): striscia di esiti uguali piu' lunga
  const aspett = (() => { let ge5 = 0, n = 0, sum = 0; let s = 12345; const r = () => { s ^= s << 13; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; };
    for (const c of CLUBS.filter(c => !c.isU18)) { const lc = lega(c); if (lc.length < 4) continue; for (let k = 0; k < 10; k++) {
      let best = 1, cur = 1, prev = null; const N = Math.min(lc.length - 1, 19);
      for (let i = 0; i < N; i++) { const o = lc[(i + 1 + lc.indexOf(c)) % lc.length]; const wp = Math.max(0.05, Math.min(0.72, 0.33 + ((c.p || 70) - (o.p || 65)) * 0.004)); const h = r();
        const out = h < wp ? 'V' : h < wp + 0.27 ? 'N' : 'P'; if (out === prev) { cur++; best = Math.max(best, cur); } else cur = 1; prev = out; }
      n++; sum += best; if (best >= 5) ge5++; } }
    return { casi: n, media: +(sum / n).toFixed(2), quotaGe5: +(ge5 / n).toFixed(3) }; })();
  // 4) perche': hashStr(seed+"_"+md) % 100 per md 1..19 della foto
  const hr = []; for (let md = 1; md <= 19; md++) hr.push([md, Math.abs(hashStr(String(L.seed) + '_' + md)) % 100]);
  return { foto, seed: L.seed, censimento: { casi, giornate: tot, punteggi: cnt, strisciaMedia: +(strisce.reduce((a, b) => a + b, 0) / strisce.length).toFixed(2), quotaStrisciaGe5: +(runsGe5 / casi).toFixed(3), vittorieMostrateAlRovescio: flipW + '/' + wins }, atteso: aspett, hr };
});
console.log(JSON.stringify(R, null, 1).slice(0, 6000)); if (errors.length) console.log('errori pagina', errors);
fs.mkdirSync('out/misura-309', { recursive: true }); fs.writeFileSync('out/misura-309/stampo.json', JSON.stringify(R, null, 1));
await browser.close(); srv.close();
