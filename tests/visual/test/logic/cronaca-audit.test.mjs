/* TEST LOGIC — CRONACA (BG_MATCH) DATA AUDIT (rete di sicurezza per il FINE-TUNING della cronaca).
   Valida la qualità dei dati delle 149 righe di cronaca: testo non vuoto, peso positivo, bpos in campo,
   momThreshold/minClock coerenti, segnaposto ben formati. HARD su dati malformati (errori introdotti
   nel fine-tuning); WARN-soft su tassonomie nuove (pd/ef/ms/segnaposto fuori dal set noto = da rivedere).
   Tassonomie dai dati reali (audit 5.38.0). */
import { test } from 'node:test';
import assert from 'node:assert';
import { loadBgMatch } from '../../lib/bgmatch.mjs';

const BG = loadBgMatch();
const PD = new Set(['attack', 'attack_goal', 'defend_goal', 'midfield', 'opp_goal', 'retreat', 'wide_right']);
const EF = new Set(['null', 'opp_goal', 'opp_injury', 'opp_red', 'team_goal']);
const MS = new Set(['shots', 'corners', 'oppShots', 'fouls']);
const PLACEHOLDERS = new Set(['H', 'H2', 'A', 'P', 'DERBY']); // dal codice di sostituzione reale (riga ~9912)

test('cronaca: caricata e non vuota', () => {
  assert.ok(BG.length >= 100, `solo ${BG.length} righe di cronaca`);
});

test('cronaca: ogni riga ben formata (txt/w/bpos/momThreshold/minClock)', () => {
  const bad = [];
  BG.forEach((m, i) => {
    if (!m.txt || !String(m.txt).trim()) bad.push(`#${i}: txt vuoto`);
    if (typeof m.w !== 'number' || !(m.w > 0)) bad.push(`#${i}: w non valido "${m.w}" (${(m.txt || '').slice(0, 30)})`);
    if (!m.bpos || typeof m.bpos.x !== 'number' || typeof m.bpos.y !== 'number') bad.push(`#${i}: bpos malformato (${(m.txt || '').slice(0, 30)})`);
    else if (m.bpos.x < 0 || m.bpos.x > 100 || m.bpos.y < 0 || m.bpos.y > 100) bad.push(`#${i}: bpos fuori campo ${JSON.stringify(m.bpos)}`);
    if (m.momThreshold && (!Array.isArray(m.momThreshold) || m.momThreshold.length !== 2 || m.momThreshold[0] > m.momThreshold[1] || m.momThreshold[0] < 0 || m.momThreshold[1] > 100)) bad.push(`#${i}: momThreshold non valido ${JSON.stringify(m.momThreshold)}`);
    if (m.minClock != null && (typeof m.minClock !== 'number' || m.minClock < 0 || m.minClock > 90)) bad.push(`#${i}: minClock non valido "${m.minClock}"`);
    if (m.poss != null && typeof m.poss !== 'number') bad.push(`#${i}: poss non numerico "${m.poss}"`);
  });
  assert.strictEqual(bad.length, 0, `righe cronaca malformate (${bad.length}):\n` + bad.slice(0, 25).join('\n'));
});

test('cronaca: segnaposto {…} bilanciati e noti', () => {
  const bad = [], unknown = new Set();
  BG.forEach((m, i) => {
    const t = String(m.txt || '');
    const open = (t.match(/\{/g) || []).length, close = (t.match(/\}/g) || []).length;
    if (open !== close) bad.push(`#${i}: graffe sbilanciate (${(t).slice(0, 40)})`);
    for (const tok of (t.match(/\{([^}]*)\}/g) || [])) { const name = tok.slice(1, -1); if (!PLACEHOLDERS.has(name)) unknown.add(name); }
  });
  // graffe sbilanciate = HARD (renderizzerebbe spazzatura); segnaposto sconosciuto = WARN (nuovo? typo?)
  assert.strictEqual(bad.length, 0, `segnaposto malformati:\n` + bad.join('\n'));
  if (unknown.size) console.log(`ℹ segnaposto fuori dal set noto (verifica typo): ${[...unknown].join(', ')}`);
});

test('cronaca: tassonomie note (warn-soft su pd/ef/ms nuovi)', () => {
  const upd = new Set(), uef = new Set(), ums = new Set();
  BG.forEach(m => {
    if (m.pd && !PD.has(m.pd)) upd.add(m.pd);
    if (m.ef && m.ef !== null && !EF.has(String(m.ef))) uef.add(m.ef);
    if (m.ms) for (const k in m.ms) if (!MS.has(k)) ums.add(k);
  });
  if (upd.size) console.log(`ℹ pd fuori set: ${[...upd].join(', ')}`);
  if (uef.size) console.log(`ℹ ef fuori set: ${[...uef].join(', ')}`);
  if (ums.size) console.log(`ℹ ms key fuori set: ${[...ums].join(', ')}`);
  assert.ok(true);
});
