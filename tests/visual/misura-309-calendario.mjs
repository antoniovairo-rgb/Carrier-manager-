/* [giro 309 PO-596] SOLA MISURA. Il calendario mette le big una dopo l'altra? Per ogni club e stagione: probabilita' ESATTA (programma
   dinamico sulla striscia) di almeno 8 sconfitte di fila con le probabilita' del motore per (differenza di forza, casa/trasferta)
   stimate da misura-309-analisi (percorso «come il live»), nell'ordine VERO del calendario contro lo stesso calendario rimescolato.
   Prerequisito: out/misura-309/analisi-motore.json */
import { apri, EROE } from './misura-309-sonda.mjs';
import fs from 'node:fs';
const T = JSON.parse(fs.readFileSync('out/misura-309/analisi-motore.json')).tabellaPsconfitta.map(s => { const m = s.match(/^(-?\d+)\|(\d): n(\d+) V([\d.]+) N([\d.]+) P([\d.]+)/); return [m[1] + '|' + m[2], +m[6]]; });
const { page, browser, srv, errors } = await apri(EROE);
const R = await page.evaluate(T => {
  const tab = Object.fromEntries(T);
  const pl = (d, c) => { let k = Math.max(-15, Math.min(35, Math.round(d / 5) * 5)); while (tab[k + '|' + c] == null && k > -15) k -= 5; return tab[k + '|' + c] ?? 0.4; };
  const pRun = (ps, K) => { let st = new Array(K).fill(0); st[0] = 1; let hit = 0; for (const p of ps) { const n = new Array(K).fill(0); for (let j = 0; j < K; j++) { if (!st[j]) continue; n[0] += st[j] * (1 - p); if (j + 1 >= K) hit += st[j] * p; else n[j + 1] += st[j] * p; } st = n; } return hit; };
  let s = 0x309; const rnd = () => { s ^= s << 13; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; };
  const out = []; for (const c of CLUBS.filter(x => !x.isU18 && x.lg === 'Deutsche Liga')) { let vero = 0, mix = 0, fin = 0, finMix = 0, n = 0;
    for (let ss = 1; ss <= 10; ss++) { const L = legaDopoTrasferimento212({ season: ss, week: 1, clubPrestigeShifts: {} }, c, {});
      const cal = L.newCalendarFull.filter(e => !e.type).sort((a, b) => a.matchday - b.matchday);
      const ps = cal.map(e => pl(((L.lcs.find(x => x.id === e.opponentId) || {}).p || 65) - c.p, e.isHome ? 1 : 0));
      vero += pRun(ps, 8); fin += Math.max(...ps.map((_, i) => i + 8 <= ps.length ? ps.slice(i, i + 8).reduce((a, b) => a + b, 0) / 8 : 0));
      for (let k = 0; k < 40; k++) { const q = [...ps]; for (let i = q.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [q[i], q[j]] = [q[j], q[i]]; } mix += pRun(q, 8) / 40; finMix += Math.max(...q.map((_, i) => i + 8 <= q.length ? q.slice(i, i + 8).reduce((a, b) => a + b, 0) / 8 : 0)) / 40; }
      n++; }
    out.push({ club: c.n, p: c.p, P8vero: +(vero / n).toFixed(4), P8rimescolato: +(mix / n).toFixed(4), finestra8PeggioreVero: +(fin / n).toFixed(2), finestra8PeggioreRimescolato: +(finMix / n).toFixed(2) }); }
  const aug = CLUBS.find(x => x.id === 'aug'); const L1 = legaDopoTrasferimento212({ season: 1, week: 1, clubPrestigeShifts: {} }, aug, {});
  const ordine = L1.newCalendarFull.filter(e => !e.type).sort((a, b) => a.matchday - b.matchday).map(e => (L1.lcs.find(x => x.id === e.opponentId) || {}).p);
  return { out, ordineAvversariAugustaS1: ordine };
}, T);
console.log(JSON.stringify(R, null, 0)); fs.writeFileSync('out/misura-309/calendario.json', JSON.stringify(R, null, 1));
await browser.close(); srv.close();
