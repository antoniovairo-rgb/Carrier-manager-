#!/usr/bin/env node
/* [M1 · STRUMENTO] LA PARTITA HA DELLE CATENE? Direttiva REAL MATCH ENGINE §3/§5: un possesso e' una
   SEQUENZA (costruzione, progressione, ultimo terzo), non un tiro di dado a ogni battito. Prima di
   riscrivere il cuore del motore serve sapere dove finiscono i possessi di oggi: quanti passaggi dura una
   catena, quanto vive il pallone in aria, quanto lontano va ogni passaggio, e chi chiude il possesso.
   Sola lettura, nessun browser: importa il motore come fa `tabellino-vero`.

   BASELINE 16/09 (7.923), 30 partite a 11 decisioni al minuto:
     passaggi 156 (una partita vera ne ha ~900) · catene 62 · passaggi per catena 2,52 (mediana 2)
     lunghezza media del passaggio 28,3u, cioe TRENTA METRI · 3,21 battiti passati in aria per ogni passaggio
     il passaggio parte dal terzo basso solo nel 10 % dei casi (nel vero ~30 %)
     chi chiude il possesso: fallo 31,5 · tiro 10,5 · rimessa 9,3 · intercetto 3,8 · contrasto 2,6

   CINQUE IPOTESI PROVATE E TUTTE RESPINTE DA QUESTA MISURA (16/09, e per questo il motore NON e stato
   modificato): (1) preferire passaggi da 14 unita invece che da 24 -> 28,3 a 27,8; (2) far saturare il
   premio alla progressione, che sceglieva sempre l uomo piu avanti -> 27,1; (3) portare il sostegno da
   12-18 unita a 7-12 -> 26,5; (4) moltiplicare per otto la velocita degli uomini (oggi 4,5-8 unita al
   MINUTO, contro i ~110 metri di un calciatore vero) -> 25,4, e le catene si ACCORCIANO perche i
   difensori arrivano prima; (5) compattare la squadra in possesso verso il pallone al 45 % -> 24,1, ma il
   gioco si concentra nel terzo centrale (76,7 %) e il terzo basso peggiora.
   CONCLUSIONE: la lunghezza dei passaggi non e una taratura, e una CONSEGUENZA della struttura — una
   decisione per battito, passaggio immediato appena si ha il pallone, slot di formazione fissi a 25 unita.
   Serve la macchina a stati del possesso (§5 della direttiva REAL MATCH ENGINE), non una manopola. */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const QUI = path.dirname(fileURLToPath(import.meta.url));
const SRC = fs.readFileSync(path.join(QUI, '..', '..', 'src', '14-motore-possesso.jsx'), 'utf8');
const crea = new Function(SRC + '\n;return creaMotorePossesso;')();
const N = +(process.env.CPM_N || 30), MIN = 90, DEC = +(process.env.CPM_DEC || 11);
const j = (x, y) => ({ x, y });
const XI = [
  { ...j(8, 50), team: 'home', gk: true }, { ...j(18, 12), team: 'home' }, { ...j(18, 38), team: 'home' },
  { ...j(18, 62), team: 'home' }, { ...j(18, 88), team: 'home' }, { ...j(38, 25), team: 'home' },
  { ...j(38, 50), team: 'home' }, { ...j(38, 75), team: 'home' }, { ...j(55, 22), team: 'home' }, { ...j(55, 78), team: 'home' },
  { ...j(95, 50), team: 'away', gk: true }, { ...j(82, 12), team: 'away' }, { ...j(82, 38), team: 'away' },
  { ...j(82, 62), team: 'away' }, { ...j(82, 88), team: 'away' }, { ...j(62, 25), team: 'away' },
  { ...j(62, 50), team: 'away' }, { ...j(62, 75), team: 'away' }, { ...j(48, 20), team: 'away' },
  { ...j(48, 50), team: 'away' }, { ...j(48, 80), team: 'away' },
];
const cat = [], dist = [], volo = [], chiuso = {};
let passTot = 0, terzi = { basso: 0, medio: 0, alto: 0 };
for (let p = 0; p < N; p++) {
  const m = crea({ seed: 1000 + p * 7, giocatori: XI, eroe: { name: 'Vairo', x: 58, y: 50, attivo: true, ovr: 70 }, forza: { home: 70, away: 70 }, lato: 'home' });
  let lato = null, n = 0, inVolo = 0;
  for (let t = 1; t <= MIN; t++) {
    for (let k = 0; k < DEC; k++) {
      const evs = DEC > 1 ? m.tick({ min: t, dt: 1 / DEC, dec: true }) : m.tick({ min: t });
      const st = m.stato();
      if (st.poss.stato === 'volo') inVolo++; else if (inVolo) { volo.push(inVolo); inVolo = 0; }
      for (const e of evs || []) {
        if (e.t === 'passaggio' || e.t === 'cross') {
          passTot++;
          const l = (e.da && e.da.team) || e.lato;
          if (l === lato) n++; else { if (lato) cat.push(n); lato = l; n = 1; }
          if (e.from && e.to) dist.push(Math.hypot(e.to.x - e.from.x, e.to.y - e.from.y));
          if (e.from) { const a = l === 'home' ? e.from.x : 100 - e.from.x; terzi[a < 33 ? 'basso' : a < 66 ? 'medio' : 'alto']++; }
        }
        if (/^(intercetto|contrasto|recupero|fallo|rimessa|corner|rinvio|tiro|gol)$/.test(e.t)) {
          if (lato) { cat.push(n); chiuso[e.t] = (chiuso[e.t] || 0) + 1; lato = null; n = 0; }
        }
      }
    }
  }
  if (lato) cat.push(n);
}
const med = (a) => a.length ? (a.reduce((x, y) => x + y, 0) / a.length) : 0;
const q = (a, f) => { if (!a.length) return 0; const b = [...a].sort((x, y) => x - y); return b[Math.min(b.length - 1, Math.floor(b.length * f))]; };
console.log(`\n=== CATENE DI POSSESSO — ${N} partite, ${DEC} decisioni al minuto ===`);
console.log(`  passaggi totali (due squadre)   ${(passTot / N).toFixed(1)} a partita   · una partita vera ne ha ~900`);
console.log(`  catene chiuse                   ${(cat.length / N).toFixed(1)} a partita`);
console.log(`  passaggi per catena             media ${med(cat).toFixed(2)} · mediana ${q(cat, 0.5)} · 90° percentile ${q(cat, 0.9)} · massimo ${cat.length ? Math.max(...cat) : 0}`);
console.log(`  catene da 4 o piu' passaggi     ${(cat.filter(c => c >= 4).length / N).toFixed(1)} a partita · da 6 o piu': ${(cat.filter(c => c >= 6).length / N).toFixed(1)}`);
console.log(`  lunghezza del passaggio         media ${med(dist).toFixed(1)}u · mediana ${q(dist, 0.5)}u · 90° percentile ${q(dist, 0.9)}u`);
console.log(`  battiti passati in volo         media ${med(volo).toFixed(2)} per volo · 90° percentile ${q(volo, 0.9)}`);
const tt = terzi.basso + terzi.medio + terzi.alto || 1;
console.log(`  da dove parte il passaggio      terzo BASSO ${(100 * terzi.basso / tt).toFixed(1)}% · medio ${(100 * terzi.medio / tt).toFixed(1)}% · alto ${(100 * terzi.alto / tt).toFixed(1)}%   · nel vero il basso vale ~30%`);
console.log(`  chi chiude il possesso:         ${Object.entries(chiuso).sort((a, b) => b[1] - a[1]).map(([k, v]) => k + ' ' + (v / N).toFixed(1)).join(' · ')}`);
