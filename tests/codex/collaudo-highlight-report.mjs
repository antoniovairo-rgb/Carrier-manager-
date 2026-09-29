#!/usr/bin/env node
/* Trasforma le note verificate nel rapporto. Non assegna codici per inferenza. */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const json = path.join(root, 'tests/codex/collaudo-highlight.json');
const report = path.join(root, 'reports/codex/2026-09-30-collaudo-highlight.md');
const summaryJson = path.join(root, 'reports/codex/2026-09-30-collaudo-highlight.json');
const data = fs.existsSync(json) ? JSON.parse(fs.readFileSync(json, 'utf8')) : null;
const version = fs.readFileSync(path.join(root, 'src/07-versione-save-interviste.jsx'), 'utf8').match(/const GAME_VERSION="([^"]+)"/)?.[1];
const forced = data?.forced || [];
const natural = (data?.natural || []).flatMap(m => m.highlights.map(h => ({ ...h, match: m.match, seed: m.seed })));
const reviewed = forced.filter(x => x.review === 'verificato visivamente');
const covered = new Set(forced.map(x => `${x.gi}:${x.ai}:${x.outcome}`));
const total = (data?.combos?.length || 0) * 2;
const codeMap = new Map();
for (const x of reviewed) for (const c of x.codes || []) {
  const key = typeof c === 'string' ? c : c.code;
  if (!codeMap.has(key)) codeMap.set(key, []);
  codeMap.get(key).push(x);
}
const esc = x => String(x ?? '').replaceAll('|','\\|').replaceAll('\n',' ');
const link = p => p ? `[${path.basename(p)}](${path.relative(path.dirname(report), path.join(root, p)).replaceAll('\\','/')})` : '—';
const frames = x => (x.frames || []).map(f => link(f.png)).join(' ');
const rows = [
  '# Collaudo degli highlight 3D — 7.999.61',
  '',
  `**Stato:** ${total && covered.size === total && (data?.natural?.length || 0) === 6 && reviewed.length === forced.length ? 'acquisizione completa; giudizio visivo completato' : 'parziale — non è un verdetto finale'}.`,
  `**Base verificata:** GAME_VERSION=${version || 'non verificato'}; ramo codex/2026-09-30-collaudo-highlight.`,
  `**Copertura forzata:** ${covered.size}/${total || 'non verificato'} combinazioni azione×esito; ${reviewed.length}/${forced.length} note esaminate visivamente.`,
  `**Partite naturali:** ${data?.natural?.length || 0}/6; ${natural.length} highlight acquisiti.`,
  '',
  'Comandi: `git ls-files tools/build-src.mjs`; `node tools/build-src.mjs --check`; `$env:CPM_BATCH="1"; node tests/codex/collaudo-highlight.mjs` (ripetere fino a completamento); `$env:CPM_MODE="natural"; node tests/codex/collaudo-highlight.mjs`; `node tests/codex/collaudo-highlight-report.mjs`.',
  'Dati grezzi e checkpoint: [collaudo-highlight.json](../../tests/codex/collaudo-highlight.json).',
  '',
  '## Classifica dei codici', '',
  '| Codice | Frequenza verificata | Tre scene peggiori |', '|---|---:|---|',
];
if (!codeMap.size) rows.push('| — | 0 | Nessuna nota visiva verificata, quindi nessun codice attribuito. |');
for (const [code, hits] of [...codeMap.entries()].sort((a,b)=>b[1].length-a[1].length)) {
  const worst = [...hits].sort((a,b)=>(b.severity || 0)-(a.severity || 0)).slice(0,3);
  rows.push(`| ${esc(code)} | ${hits.length} | ${worst.map(x=>`gi${x.gi}/a${x.ai}/${x.outcome}`).join(', ')} |`);
}
rows.push('', '## Scene forzate', '', '| gi | Azione | Esito | Codici | Fotogrammi | Nota |', '|---:|---|---|---|---|---|');
for (const x of forced.sort((a,b)=>a.gi-b.gi || a.ai-b.ai || a.outcome.localeCompare(b.outcome))) {
  const codes = (x.codes || []).map(c=>typeof c==='string'?c:c.code).join(', ') || (x.review==='verificato visivamente'?'nessun difetto':'non verificato');
  rows.push(`| ${x.gi} | ${esc(x.label)} | ${x.outcome} | ${codes} | ${frames(x)} | ${esc(x.note || x.review)} |`);
}
rows.push('', '## Note nel formato del taccuino', '');
for (const x of reviewed) {
  rows.push(`[KE ${version}] SIT #${x.gi} [${esc(x.intent)}]: «${esc(x.text)}» · AZIONE «${esc(x.label)}» → ${x.outcome}`);
  rows.push(`NOTA: ${esc(x.auto?.text || 'bozza assente')} ${esc(x.note || 'nessun difetto')}`);
  rows.push('');
}
rows.push('## Partite naturali', '', '| Partita | Seme | Highlight | Fotogrammi | Nota |', '|---:|---:|---|---|---|');
for (const x of natural) rows.push(`| ${x.match+1} | ${x.seed} | gi ${x.gi ?? 'non verificato'} — ${esc(x.text)} | ${frames(x)} | ${esc(x.note || x.review)} |`);
rows.push('', '## Differenze fra scene forzate e naturali', '',
  natural.length && reviewed.length ? 'Confronto da redigere dopo la revisione visiva delle scene corrispondenti; al momento non verificato.' : 'Non verificato: mancano scene naturali o note visive sufficienti.',
  '', '## Limiti', '',
  'Condizione prevista, ancora non verificata in questo checkpoint: Chrome headless con GPU software. In tale condizione tempi e fluidità non si giudicano; i fotogrammi consentono di giudicare soltanto pose, posizioni, direzioni e coerenza pallone/esito. Un fotogramma etichettato «contatto» o «volo» senza testimone positivo resta approssimativo e non prova da solo l’istante del gesto.',
  '', `Errori registrati: ${data?.errors?.length || 0}. Le scene non acquisite o non osservate visivamente restano «non verificato».`, '');
fs.mkdirSync(path.dirname(report), {recursive:true});
fs.writeFileSync(report, rows.join('\n'));
fs.writeFileSync(summaryJson, JSON.stringify({
  versione: version || 'non verificato', compito: 'collaudo highlight 3D',
  comando: 'node tests/codex/collaudo-highlight.mjs', seme: 'forzate: indice; naturali: 5100,5197,5294,5391,5488,5585',
  misure: [
    { nome: 'scene forzate acquisite', valore: covered.size, soglia: total || 'non verificato', esito: total && covered.size === total ? 'ok' : 'anomalia' },
    { nome: 'partite naturali acquisite', valore: data?.natural?.length || 0, soglia: 6, esito: (data?.natural?.length || 0) === 6 ? 'ok' : 'anomalia' },
    { nome: 'note visive completate', valore: reviewed.length, soglia: forced.length || 'non verificato', esito: forced.length && reviewed.length === forced.length ? 'ok' : 'anomalia' }
  ], segnalazioni: [],
  stato: 'parziale finché acquisizione e revisione visiva non sono complete',
  dati: 'tests/codex/collaudo-highlight.json'
}, null, 2));
console.log(report);
