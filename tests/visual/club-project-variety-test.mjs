#!/usr/bin/env node
/* [7.265.0 collaudo PO «spesso viene indicato che il progetto del club è solido, è ripetitivo»]
   GUARDIANO della VARIETÀ del progetto club. Il difetto misurato: clubProject aveva 4 stati e
   «Progetto solido» era il FALLBACK — su una carriera realistica usciva nel 74% delle settimane,
   sempre con la stessa identica frase.
   Asserzioni: (1) nessuno stato domina oltre il 55%; (2) almeno 8 stati raggiungibili; (3) ogni stato
   ha piu' di una formulazione; (4) la scelta e' DETERMINISTICA (stessa stagione = stesso testo) ma
   CAMBIA tra stagioni diverse; (5) ogni stato dichiara un `tone` valido (i due punti che colorano la
   card leggono quello, non le chiavi).
   Uso: node club-project-variety-test.mjs */
import fs from 'node:fs';
import { ROOT } from './lib/harness.mjs';

const src = fs.readFileSync(ROOT + '/CARRIER-MANAGER-AV.html', 'utf8');
function hashStr(x) { let h = 5381; for (let i = 0; i < x.length; i++) { h = ((h << 5) + h) ^ x.charCodeAt(i); h = h >>> 0; } return h; }
const LEAGUE_PAIRS = [['Lega A', 'Lega B'], ['Premier Division', 'Championship']];
const i = src.indexOf('const clubProject=(p)=>{try{');
if (i < 0) { console.log('❌ FAIL — clubProject non trovata'); process.exit(1); }
const j = src.indexOf('}catch(_e){return null;}};', i) + '}catch(_e){return null;}};'.length;
const clubProject = new Function('hashStr', 'LEAGUE_PAIRS', 'return ' + src.slice(i + 'const clubProject='.length, j - 1))(hashStr, LEAGUE_PAIRS);

// popolazione REALISTICA: prestigio del club variabile, posizione correlata al valore della rosa,
// evoluzione pluriennale rara (serve un biennio ai vertici o in fondo), shift di prestigio piccoli.
const mk = (seed) => {
  const R = (() => { let s = seed >>> 0 || 1; return () => { s ^= s << 13; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; }; })();
  const myP = 45 + Math.floor(R() * 45);
  const others = Array.from({ length: 17 }, () => 45 + Math.floor(R() * 45));
  const rank = [myP, ...others].sort((a, b) => b - a).indexOf(myP) + 1;
  const pos = Math.max(1, Math.min(18, rank + Math.round((R() + R() + R() - 1.5) * 6)));
  const st = Array.from({ length: 18 }, (_, q) => ({ id: 'c' + q, n: 'C' + q, pts: 100 - q, gf: 10, ga: 5, p: others[q] || 50 }));
  st[pos - 1] = { id: 'me', n: 'Club', pts: 100 - pos, gf: 10, ga: 5, p: myP };
  return { proStatus: 'pro', season: 1 + Math.floor(R() * 8), week: 4 + Math.floor(R() * 35),
    club: { id: 'me', n: 'Club', lg: R() < 0.3 ? 'Lega B' : 'Lega A' },
    clubEvo: { clubId: 'me', seasonsTop: R() < 0.10 ? 1 + (R() < 0.4 ? 1 : 0) : 0, seasonsLow: R() < 0.10 ? 1 + (R() < 0.4 ? 1 : 0) : 0, stadiumTier: R() < 0.08 ? 1 : 0, fanbase: 40 },
    clubPrestigeShifts: { me: Math.round((R() + R() + R() - 1.5) * 5) }, standings: st };
};

const issues = [];
const N = 30000, cnt = {}, texts = {}, tones = {};
for (let k = 0; k < N; k++) {
  const r = clubProject(mk(k * 2654435761));
  if (!r) { issues.push('clubProject ha restituito null su un player pro valido'); break; }
  cnt[r.k] = (cnt[r.k] || 0) + 1;
  (texts[r.k] = texts[r.k] || new Set()).add(r.d);
  (tones[r.k] = tones[r.k] || new Set()).add(r.tone);
}
const rows = Object.entries(cnt).sort((a, b) => b[1] - a[1]);
console.log(`stati raggiungibili: ${rows.length}`);
rows.forEach(([k, v]) => console.log(`  ${k.padEnd(15)} ${(v / N * 100).toFixed(1)}% · formulazioni distinte: ${texts[k].size} · tone: ${[...tones[k]].join(',')}`));

const top = rows[0];
if (top[1] / N > 0.55) issues.push(`lo stato «${top[0]}» domina il ${(top[1] / N * 100).toFixed(0)}% delle settimane (max 55%): il progetto club torna ripetitivo`);
if (rows.length < 8) issues.push(`solo ${rows.length} stati raggiungibili (attesi ≥8)`);
const mono = rows.filter(([k]) => texts[k].size < 2);
if (mono.length) issues.push(`stati con una sola formulazione: ${mono.map(([k]) => k).join(', ')}`);
const badTone = Object.entries(tones).filter(([, v]) => [...v].some(t => !['good', 'bad', 'neutral'].includes(t)));
if (badTone.length) issues.push(`tone non valido su: ${badTone.map(([k]) => k).join(', ')}`);

// ───── (4) deterministico dentro la stagione, diverso tra stagioni
const base = mk(12345);
const a1 = clubProject(base), a2 = clubProject({ ...base });
if (!a1 || !a2 || a1.d !== a2.d) issues.push('la formulazione non è deterministica a parità di stagione (cambierebbe a ogni render)');
let changed = 0;
for (let s = 1; s <= 8; s++) { const r = clubProject({ ...base, season: s }); if (r && r.d !== a1.d) changed++; }
console.log(`\ndeterminismo entro la stagione: ${a1 && a2 && a1.d === a2.d ? 'sì' : 'NO'} · stagioni (su 8) con formulazione diversa: ${changed}`);
if (changed === 0) issues.push('la formulazione non cambia MAI tra stagioni diverse: la varietà è solo teorica');

if (issues.length) { console.log('\n❌ FAIL'); issues.forEach(x => console.log('  · ' + x)); process.exit(1); }
console.log('\n✅ PASS — il progetto del club racconta la stagione reale, senza uno stato dominante');
