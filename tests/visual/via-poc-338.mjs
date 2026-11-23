#!/usr/bin/env node
/* [giro 338, decisione PO 23/11 08:00 «elimina il ramo poc, non serve a nulla. Crea solo rumore»] GUARDIANO STATICO DEL RILASCIO
   SENZA RAMO DI APPOGGIO. Niente browser, niente rete, niente git remoto: legge i file della macchina del rilascio.

   A. CENSIMENTO: nei file operativi (strumenti del rilascio e del treno, piano, runner, workflow, interruttore, regole di processo,
      CLAUDE.md) nessuna riga nomina il ramo di appoggio, salvo le righe marcate «338» (ripiego dichiarato da togliere, braccio rosso
      CPM_NO_G338, nome di questo guardiano).
   B. PERCORSO: il rilascio ha la base su main (contesto: base = main se non c'e' il rosso 338), il push atomico porta lavoro + main +
      tag, il blocco del treno grande si scrive su main, l'interruttore dichiara main; la lettura di ripiego esiste UNA volta sola ed
      e' tollerante (un ramo cancellato non e' un errore).

   Verde col verde, rosso col rosso: con CPM_NO_G338=1 i file si leggono dalla base del giro (d681977, punta di lavoro/201) e il
   guardiano DEVE uscire rosso.   npm run via-poc-338   (≈ 1 s) */
import fs from 'node:fs'; import path from 'node:path';
import { execFileSync } from 'node:child_process';
const QUI = path.dirname(new URL(import.meta.url).pathname), ROOT = path.resolve(QUI, '../..');
const NO = process.env.CPM_NO_G338 === '1', BASE = process.env.CPM_G338_BASE || 'd681977';
const leggi = rel => { try { return NO ? execFileSync('git', ['show', `${BASE}:${rel}`], { cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }) : fs.readFileSync(path.join(ROOT, rel), 'utf8'); } catch { return null; } };
let fall = 0; const ok = (c, m) => { console.log(`${c ? '✅' : '❌'} ${m}`); if (!c) fall++; };
if (NO) console.log(`(CPM_NO_G338=1: file letti da ${BASE}, prima del giro 338 — il guardiano deve uscire rosso)`);

const WF = fs.readdirSync(path.join(ROOT, '.github/workflows')).filter(f => /\.ya?ml$/.test(f)).map(f => '.github/workflows/' + f);
const FILE = ['tools/rilascio-vagone-312.mjs', 'tools/trenino-317.mjs', 'tools/custode-notte-330.mjs', 'tools/governo-html.mjs',
  'tests/visual/ci-treno-308.mjs', 'tests/visual/ci-runner.mjs', 'docs/governo/RILASCIO-AUTO.json', 'docs/governo/PROCESSO.md', 'CLAUDE.md', ...WF];
const RE = /\bpoc\b|marioprada/i;

console.log('\n== A. censimento dei riferimenti al ramo di appoggio ==');
let tot = 0, dich = 0;
for (const f of FILE) {
  const t = leggi(f); if (t == null) { ok(!['tools/rilascio-vagone-312.mjs', '.github/workflows/verifica-guardiani.yml'].includes(f), `${f}: non leggibile`); continue; }
  const righe = t.split('\n').map((r, i) => [i + 1, r]).filter(([, r]) => RE.test(r));
  const fuori = righe.filter(([, r]) => !/338/.test(r)); tot += fuori.length; dich += righe.length - fuori.length;
  ok(!fuori.length, `${f}: ${fuori.length} riferimenti operativi${fuori.length ? ' — ' + fuori.slice(0, 3).map(([n, r]) => `r.${n} «${r.trim().slice(0, 90)}»`).join(' · ') : ''}${righe.length - fuori.length ? ` (${righe.length - fuori.length} dichiarati «338»)` : ''}`);
}
console.log(`   totale: ${tot} riferimenti non dichiarati · ${dich} dichiarati «338»`);

console.log('\n== B. il percorso del rilascio passa da main ==');
const RIL = leggi('tools/rilascio-vagone-312.mjs') || '', TRENO = leggi('.github/workflows/verifica-guardiani.yml') || '', INT = leggi('docs/governo/RILASCIO-AUTO.json') || '';
ok(/base: viaPoc \? appoggio : \(process\.env\.CPM_RAMO_MAIN \|\| 'main'\)/.test(RIL), 'rilascio: la base e\' main (il ramo di appoggio solo col rosso CPM_NO_G338)');
ok(/viaPoc = process\.env\.CPM_NO_G338 === '1'/.test(RIL), 'rilascio: il percorso di prima vive solo dietro CPM_NO_G338=1');
ok(/\.\.\.\(d\.dest\.poc \? \[/.test(RIL) && /`\$\{d\.commit_main\}:refs\/heads\/\$\{d\.dest\.main\}`/.test(RIL), 'rilascio: push atomico lavoro + main + tag (il terzo ramo solo col rosso)');
ok((RIL.match(/function refAppoggio338\(/g) || []).length === 1 && /refAppoggio338[\s\S]{0,200}if \(r\.status !== 0\)[\s\S]{0,120}return null/.test(RIL), 'rilascio: UNA lettura di ripiego, tollerante (ramo cancellato = nessun errore)');
ok(/const refRip = c\.viaPoc \? null : refAppoggio338\(c\)/.test(RIL) && /leggiConRipiego338\(/.test(RIL), 'rilascio: interruttore, rossi dichiarati e blocco letti da main, ripiego solo se main non ha il file');
ok(/RAMO_BLOCCO: main/.test(TRENO) && /dest="\$RAMO_BLOCCO"/.test(TRENO), 'treno grande: il blocco si scrive su main');
ok(/sha=d\.commit_main\|\|sha/.test(TRENO), 'esito del rilascio: lo stato si scrive sul commit nuovo di main');
ok(/da main/.test(INT), 'interruttore: dichiara di essere letto da main');

console.log(`\n${fall ? '❌ ROSSO' : '✅ VERDE'} — via-poc-338: ${fall} controlli falliti${NO ? ' (braccio rosso: atteso ROSSO)' : ''}`);
process.exit(fall ? 1 : 0);
