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
const live = raw.partB.filter(x => x.finished).sort((a, b) => a.i - b.i);
const completeB = live.length >= 20;
const liveTail = live.filter(x => x.score && (x.score.home >= 7 || x.score.away >= 7 || Math.abs(x.score.home - x.score.away) >= 5));
const sources = {};
for (const x of live) for (const goal of x.goals || []) sources[goal.src ?? 'non esposto'] = (sources[goal.src ?? 'non esposto'] || 0) + 1;
const liveEventMismatch = live.filter(x => x.score && (x.goals || []).length !== x.score.home + x.score.away);
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
  `Comando completo per la configurazione leggera: \`node tests/codex/goleade-precompile.mjs\`; \`$env:CPM_LIGHT_CHROME='1'; $env:CPM_CHROME='C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'; node tests/codex/goleade-credibilita.mjs B\`. Per completare il campione dopo i tentativi non validi: \`$env:CPM_LIVE_MATCHES='23'; $env:CPM_SKIP_INDICES='9,12,18'; node tests/codex/goleade-credibilita.mjs B\`, con un browser nuovo per ogni partita. HTML del gioco derivato dalla stessa versione con JSX precompilato offline; pagina \`?cpmtest=1\`, percorso \`Nuova carriera → Inizia il provino\`, nome unico per partita, autoplay a velocità 1× con intervallo di controllo di 300 ms. Il corpo GLB è disattivato: il collaudo riguarda punteggio ed eventi, non la resa 3D. La forza delle squadre è riportata solo se esposta dal testimone.`, '',
  `Partite concluse: ${live.length}/20 richieste; tentativi non conclusi conservati nel grezzo: ${raw.partB.filter(x => !x.finished).length}. Gol per etichetta di provenienza nel registro: ${Object.entries(sources).map(([k, v]) => `${k} ${v}`).join(', ') || 'nessuno'}. Discordanze fra numero di eventi «goal» e tabellone: ${liveEventMismatch.length}.`, '',
  ...raw.partB.filter(x => !x.finished).map(x => `Tentativo non valido: #${x.i + 1}, ${x.name}, seed ${x.seed}, dopo ${fmt(x.durationMs / 1000)} s; errore: ${String(x.error || 'fase finale non raggiunta').split('\n')[0]}.`), '',
  '| # | Nome / seed autoplay | Punteggio | Forza casa–ospite | Gol per percorso | 7+ o scarto ≥5 |',
  '|---:|---|---:|---:|---|---|',
  ...live.map(x => { const per = {}; for (const g of x.goals || []) per[g.src ?? 'non esposto'] = (per[g.src ?? 'non esposto'] || 0) + 1;
    const tail = x.score && (x.score.home >= 7 || x.score.away >= 7 || Math.abs(x.score.home - x.score.away) >= 5);
    return `| ${x.i + 1} | ${x.name} / ${x.seed} | ${x.score?.home ?? 'n.d.'}–${x.score?.away ?? 'n.d.'} | ${x.strength?.home ?? 'non esposto'}–${x.strength?.away ?? 'non esposto'} | ${Object.entries(per).map(([k, v]) => `${k}: ${v}`).join(', ') || 'nessuno'} | ${tail ? 'sì' : 'no'} |`; }), '',
  completeB ? `Nel campione di 20 partite vere, coda 7+ o scarto ≥5: ${liveTail.length}/20.${liveTail.length ? ` Casi: ${liveTail.map(x => `${x.name} (${x.seed}) ${x.score.home}-${x.score.away}`).join('; ')}.` : ' Non è possibile attribuire gol in eccesso a un percorso perché non ne sono stati osservati.'}` : 'Verdetto sulla frequenza delle goleade nel percorso carriera: non verificato finché il campione non arriva a 20 partite. Il primo avvio con Chrome standard è stato interrotto quando la memoria libera è scesa a 0,71 GB; non è contato.', '',
  raw.speedChecks?.length ? `Controllo fuori campione: stesso nome e seed della partita #1 a 2× con tick autoplay 100 ms: ${raw.speedChecks.map(x => `${x.row.score?.home ?? '?'}-${x.row.score?.away ?? '?'}`).join(', ')} contro ${raw.partB.find(x => x.i === 0)?.score?.home ?? '?'}-${raw.partB.find(x => x.i === 0)?.score?.away ?? '?'} a 1×/300 ms. Le due impostazioni sono cambiate insieme: la causa della differenza non è isolata. Il controllo accelerato non entra nei 20 casi.` : '', '',
  '## Verdetto e limiti', '',
  completeA ? `Nel motore senza grafica, la coda 7+ è ${summary.some(x => x.seven) ? 'presente' : 'assente nei 700 semi esaminati'}; gli scarti ≥5 sono ${summary.some(x => x.margin5) ? 'presenti' : 'assenti nei 700 semi esaminati'}. Il campione non dimostra una probabilità zero fuori dai semi provati.` : 'Parte A incompleta: verdetto non verificato.',
  'La parte A descrive il motore con occasioni dell’eroe disattivate. La parte B descrive partite reali di provino all’inizio di carriere nuove, non gare di campionato avanzate. La credibilità percepita dei singoli risultati non deriva automaticamente dalle frequenze numeriche.',
  'Le anomalie osservate restano ipotesi fino alla riproduzione del team. Nessuna modifica al gioco.', ''
];
const report = path.join(root, 'reports/codex/2026-10-01-goleade-credibilita.md');
const reportJson = path.join(root, 'reports/codex/2026-10-01-goleade-credibilita.json');
fs.mkdirSync(path.dirname(report), { recursive: true });
fs.writeFileSync(report, lines.join('\n'));
fs.writeFileSync(reportJson, JSON.stringify({ versione: raw.version, compito: 'PO-021/035: coda delle goleade nel motore e nelle partite vere', comando: ['node tests/codex/goleade-credibilita.mjs A', 'node tests/codex/goleade-precompile.mjs', "$env:CPM_LIGHT_CHROME='1'; $env:CPM_CHROME='C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'; node tests/codex/goleade-credibilita.mjs B", "$env:CPM_LIVE_MATCHES='23'; $env:CPM_SKIP_INDICES='9,12,18'; node tests/codex/goleade-credibilita.mjs B"], seme: 'A: 960100 + 1000 × indiceCoppia + i, i=0…99; B: 960200 + i × 97, i=0…22 esclusi i=9,12,18 non validi, nomi distinti', misure: summary.map(x => ({ nome: x.pair, valore: { n: x.n, seven: x.seven, margin5: x.margin5, goals: x.goals, vnd: x.vnd }, soglia: 'nessuna soglia prescritta per l’audit', esito: x.n === 100 ? 'ok' : 'anomalia' })).concat([{ nome: 'partite vere', valore: { n: live.length, sevenOrMargin5: liveTail.length, eventScoreMismatch: liveEventMismatch.length, sources, invalidAttempts: raw.partB.filter(x => !x.finished).length }, soglia: '20 partite richieste', esito: completeB ? 'ok' : 'anomalia' }]), segnalazioni: [], parteB: completeB ? 'completata' : 'non verificata' }, null, 2));
console.log(JSON.stringify({ version: raw.version, commit: raw.commit, a: raw.partA.length, b: raw.partB.filter(x => x.finished).length, balanced00: balanced.filter(r => r.home === 0 && r.away === 0).length, balanced5: balanced.filter(r => r.home + r.away >= 5).length, summary: summary.map(x => ({ pair: x.pair, seven: x.seven, margin5: x.margin5, vnd: x.vnd })) }));
