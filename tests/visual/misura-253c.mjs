#!/usr/bin/env node
/* [giro 253 · dubbio 6 del giro 246] SONDA misura-253c — «gara della settimana gia' giocata» subito dopo l'apertura del salvataggio
   sintetico (apriCarriera166). Apre N volte la carriera, e per la settimana W trovata registra la voce di lega di W subito, dopo 1 s e
   dopo 4 s, con i segni lasciati da chi l'ha marcata (simulated · recupero103 · healed418 · result) e le righe nuove del log: dice SE
   succede e QUALE strada del gioco lo fa. Non giudica (strumento). Uso: CPM_N=12 node misura-253c.mjs */
import { apriCarriera166, sleep } from './lib/partita-166.mjs';
if (!process.env.CPM_CHROME) process.env.CPM_CHROME = '/opt/pw-browsers/chromium';
const N = +(process.env.CPM_N || 12); const tot = { aperture: 0, giocata: 0, casi: [] };
for (let i = 0; i < N; i++) {
  const A = await apriCarriera166({ nome: 'Collaudo Salienti 246', reseed: 4246 + i });
  const leggi = () => A.page.evaluate((w) => { const C = window.__CPM_CAREER, p = C.snapshot();
    const v = (p.calendar || []).filter(m => m.week === w && !m.type).map(m => ({ md: m.matchday, pl: !!m.played, sim: m.simulated, r103: !!m.recupero103, h418: !!m.healed418, res: m.result || null }));
    const lg = (p.calendar || []).filter(m => !m.type && m.week < w); const myId = p.club.id; const st = [...(p.standings || [])].sort((x, y) => (y.pts - x.pts) || ((y.gf - y.ga) - (x.gf - x.ga)) || (y.gf - x.gf));
    return { pos: st.findIndex(r => r.id === myId) + 1, pts: (st.find(r => r.id === myId) || {}).pts, giocate: lg.filter(m => m.played).length, prima: lg.length, flag: lg.map(m => (m.recupero103 ? 'R' : m.healed418 ? 'H' : m.simulated ? 'S' : m.played ? 'P' : '-')).join(''), sommaPts: (p.standings || []).reduce((t, r) => t + (r.pts | 0), 0), week: p.week, lived: p.weekLived, v, t: C.thisWeekMd() ? C.thisWeekMd().matchday : null, log: (p.log || []).slice(0, 4), rec: window.__CPM_RECUPERO103 || null }; }, A.W).catch(e => ({ err: String(e) }));
  const s0 = await leggi(); await sleep(1000); const s1 = await leggi(); await sleep(3000); const s4 = await leggi();
  tot.aperture++; const g = [s0, s1, s4].some(s => (s.v || []).some(x => x.pl));
  if (g) { tot.giocata++; tot.casi.push({ i, W: A.W, s0, s1, s4 }); }
  console.log(`apertura ${i + 1}: W=${A.W} · ${g ? 'GIOCATA' : 'da giocare'} · pos ${s4.pos} pts ${s4.pts} somma ${s4.sommaPts} · lega prima di W ${s4.giocate}/${s4.prima} [${s4.flag}] · s0 [${s0.flag}] somma0 ${s0.sommaPts} · ${JSON.stringify(s4.v)} · thisWeekMd ${s4.t} · log ${JSON.stringify((s4.log || []).slice(0, 2)).slice(0, 220)}`);
  await A.b.close(); A.srv.close();
}
console.log(`RIEPILOGO: ${tot.giocata}/${tot.aperture} aperture con la gara di W gia' giocata`);
for (const c of tot.casi) console.log(JSON.stringify(c).slice(0, 1500));
