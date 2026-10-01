#!/usr/bin/env node
// Analizza il grezzo del collaudo PO-021/035 senza avviare il gioco.
import fs from 'node:fs';
import path from 'node:path';
import { gunzipSync } from 'node:zlib';

const root = process.cwd();
const rawPath = 'tests/codex/goleade-credibilita.json.gz';
const raw = JSON.parse(gunzipSync(fs.readFileSync(path.join(root, rawPath))).toString('utf8'));
const groups = ['50-50', '60-50', '70-50', '80-50', '95-50', '95-80', '50-95'];
const mean = (xs) => xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null;
const fmt = n => n == null ? 'non esposto' : n.toFixed(2).replace('.', ',');
const pct = (n, d) => d ? (100 * n / d).toFixed(1).replace('.', ',') + '%' : 'n.d.';
const summary = [];
for (const pair of groups) {
  const rows = raw.partA.filter(x => x.pair === pair).sort((a, b) => a.seed - b.seed);
  const freq = new Map();
  for (const r of rows) freq.set(`${r.home}-${r.away}`, (freq.get(`${r.home}-${r.away}`) || 0) + 1);
  const [homeStrength, awayStrength] = pair.split('-').map(Number);
  const favorite = homeStrength === awayStrength ? null : homeStrength > awayStrength ? 'home' : 'away';
  const win = rows.filter(r => favorite === 'away' ? r.away > r.home : r.home > r.away).length;
  const draw = rows.filter(r => r.home === r.away).length;
  const loss = rows.length - win - draw;
  summary.push({ pair, n: rows.length, favorite: favorite || 'nessuno: V/N/P della casa',
    goals: [mean(rows.map(r => r.home)), mean(rows.map(r => r.away))],
    top10: [...freq].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).slice(0, 10).map(([score, n]) => ({ score, n })),
    seven: rows.filter(r => r.home >= 7 || r.away >= 7).length,
    margin5: rows.filter(r => Math.abs(r.home - r.away) >= 5).length,
    vnd: [win, draw, loss],
    stats: Object.fromEntries(['tiri', 'inPorta', 'possesso', 'falli'].map(k => [k,
      ['home', 'away'].map(side => {
        const vals = rows.map(r => r.tab?.[side]?.[k]).filter(x => typeof x === 'number');
        return vals.length === rows.length ? mean(vals) : null;
      })])),
    anomalies: rows.filter(r => r.home >= 7 || r.away >= 7 || Math.abs(r.home - r.away) >= 5)
      .map(r => ({ seed: r.seed, score: `${r.home}-${r.away}`, seven: r.home >= 7 || r.away >= 7, margin5: Math.abs(r.home - r.away) >= 5 })),
    eventScoreMismatch: rows.filter(r => r.eventGoals !== r.home + r.away).map(r => r.seed)
  });
}
const balanced = raw.partA.filter(r => r.pair === '50-50');
const completeA = summary.every(x => x.n === 100);
const completeB = raw.partB.filter(x => x.finished).length === 20;
const lines = [
  '# Goleade e credibilità del risultato — collaudo numerico', '',
  `Base verificata: \`main\` ${raw.commit}, GAME_VERSION ${raw.version}. Ramo del rapporto: \`codex/2026-10-01-goleade-credibilita\`.`, '',
  `**Esito:** parte A ${completeA ? 'completa' : 'parziale'} (${raw.partA.length}/700 partite); parte B ${completeB ? 'completa' : 'non verificata'} (${raw.partB.filter(x => x.finished).length}/20 partite vere completate).`,
  'Il guardiano su 95–50 era già verde secondo la consegna; questo è un campione indipendente su sette accoppiamenti.', '',
  '## Metodo e riproduzione', '',
  'Il motore e il percorso di simulazione sono quelli di `tests/visual/goleade-test.mjs`: `creaPartita`, `creaMotoreV2`, `occasioniV2:false`, `v2:true`, `registra:false`, `eroeLato:home`, `tuttaSubito()`. Questo audit varia le forze e imposta `eroe.ovr` alla forza della squadra di casa; il guardiano originale prova solo 95–50 con eroe OVR 95. Per ogni coppia i 100 semi sono `960100 + 1000 × indiceCoppia + i`, con `i=0…99` nell’ordine della tabella. I valori vengono dal tabellino del motore e dagli eventi di gol.', '',
  'Comando completo: `node tests/codex/goleade-credibilita.mjs A`. Analisi: `node tests/codex/goleade-report.mjs`. Dati partita per partita: `tests/codex/goleade-credibilita.json.gz`.', '',
  '## Parte A — motore senza grafica', '',
  '| Forze casa–ospite | N | Gol medi C–O | 7+ gol di una squadra | Scarto ≥5 | V/N/P favorito¹ | Tiri C–O | In porta C–O | Possesso C–O | Falli C–O |',
  '|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|',
  ...summary.map(x => `| ${x.pair} | ${x.n} | ${x.goals.map(fmt).join('–')} | ${x.seven} (${pct(x.seven, x.n)}) | ${x.margin5} (${pct(x.margin5, x.n)}) | ${x.vnd.map(v => pct(v, x.n)).join('/')} | ${x.stats.tiri.map(fmt).join('–')} | ${x.stats.inPorta.map(fmt).join('–')} | ${x.stats.possesso.map(fmt).join('–')} | ${x.stats.falli.map(fmt).join('–')} |`),
  '', '¹ Per 50–50 non c’è un favorito: la colonna riporta V/N/P della squadra di casa. Per 50–95 riporta la squadra ospite.', '',
  `Nel 50–50: ${balanced.filter(r => r.home === 0 && r.away === 0).length}/100 risultati 0–0; ${balanced.filter(r => r.home + r.away >= 5).length}/100 partite con almeno 5 gol totali.`, '',
  `Nel confronto con ospite a forza 50, passando da casa 50 a 95 i gol medi della casa vanno da ${fmt(summary[0].goals[0])} a ${fmt(summary[4].goals[0])}, i tiri da ${fmt(summary[0].stats.tiri[0])} a ${fmt(summary[4].stats.tiri[0])} e il possesso da ${fmt(summary[0].stats.possesso[0])}% a ${fmt(summary[4].stats.possesso[0])}% (medie dei 100 semi per coppia nella tabella). Questo è un andamento misurato, non una valutazione esterna di realismo.`, '',
  '### Dieci risultati più frequenti per accoppiamento', '',
  ...summary.map(x => `- **${x.pair}:** ${x.top10.map(y => `${y.score} (${y.n})`).join(', ')}.`), '',
  '### Semi delle goleade e degli scarti ≥5', '',
  ...summary.map(x => `- **${x.pair}:** ${x.anomalies.length ? x.anomalies.map(y => `${y.seed} → ${y.score}${y.seven ? ' [7+]' : ''}${y.margin5 ? ' [scarto≥5]' : ''}`).join('; ') : 'nessuno nei 100 semi'}.`), '',
  `Controllo interno: ${summary.reduce((n, x) => n + x.eventScoreMismatch.length, 0)} partite hanno un numero di eventi «gol» diverso dalla somma dei gol del risultato.`, '',
  '## Parte B — partita nel percorso carriera', '',
  completeB ? 'Vedere il grezzo per le 20 partite e le sorgenti dei gol.' : 'Non verificato. Il primo avvio di Chrome è stato interrotto quando la memoria libera è scesa a 0,71 GB (misura con `node -e "console.log((require(\'os\').freemem()/2**30).toFixed(2))"`). Nessun risultato di quella partita viene contato. La coda di goleade nel percorso carriera e la sorgente dei gol in eccesso restano non verificati.', '',
  '## Verdetto e limiti', '',
  completeA ? `Nel motore senza grafica, la coda 7+ è ${summary.some(x => x.seven) ? 'presente' : 'assente nei 700 semi esaminati'}; gli scarti ≥5 sono ${summary.some(x => x.margin5) ? 'presenti' : 'assenti nei 700 semi esaminati'}. Il campione non dimostra una probabilità zero fuori dai semi provati.` : 'Parte A incompleta: verdetto non verificato.',
  'Questi numeri descrivono il motore con occasioni dell’eroe disattivate. La corrispondenza con le partite vere, e la credibilità percepita dei singoli risultati, non sono verificate da questa parte.',
  'Le anomalie osservate restano ipotesi fino alla riproduzione del team. Nessuna modifica al gioco.', ''
];
const report = path.join(root, 'reports/codex/2026-10-01-goleade-credibilita.md');
const reportJson = path.join(root, 'reports/codex/2026-10-01-goleade-credibilita.json');
fs.mkdirSync(path.dirname(report), { recursive: true });
fs.writeFileSync(report, lines.join('\n'));
fs.writeFileSync(reportJson, JSON.stringify({ versione: raw.version, compito: 'PO-021/035: coda delle goleade nel motore', comando: 'node tests/codex/goleade-credibilita.mjs A', seme: '960100 + 1000 × indiceCoppia + i, i=0…99', misure: summary.map(x => ({ nome: x.pair, valore: { n: x.n, seven: x.seven, margin5: x.margin5, goals: x.goals, vnd: x.vnd }, soglia: 'nessuna soglia prescritta per l’audit', esito: x.n === 100 ? 'ok' : 'anomalia' })), segnalazioni: [], parteB: completeB ? 'completata' : 'non verificata' }, null, 2));
console.log(JSON.stringify({ version: raw.version, commit: raw.commit, a: raw.partA.length, b: raw.partB.filter(x => x.finished).length, balanced00: balanced.filter(r => r.home === 0 && r.away === 0).length, balanced5: balanced.filter(r => r.home + r.away >= 5).length, summary: summary.map(x => ({ pair: x.pair, seven: x.seven, margin5: x.margin5, vnd: x.vnd })) }));
