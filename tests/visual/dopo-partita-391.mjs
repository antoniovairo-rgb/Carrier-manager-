#!/usr/bin/env node
/* [giro 391, PO-523 — decisione PO 18/11 16:40 «Entrambi»] GUARDIANO DEL DOPO-PARTITA: SALTO NEI GIRI, PARTITA INTERA NEL TRENO.
   Niente browser, niente rete (~1 s). I controlli del dopo-partita (partita-rigiocata-194, spazio-296, spazio-270) arrivano al fischio
   con lib/fischio-270.mjs (aspettaFischio270): 10' veri, poi l'orologio all'85' col varco __CPM_SALTA297 e il fischio naturale.
   Il PO ha deciso: salto nei giri (veloci), partita intera nella verifica del treno.

   A. TRENO: il job delle parti di .github/workflows/verifica-guardiani.yml (lo stesso job per trenino, mappa e treno grande di notte,
      che treno-notte-330.yml avvia con workflow_dispatch) ha nel suo env CPM_PARTITA_INTERA: '1'.
   B. GIRI: `node ci-runner.mjs giro` toglie CPM_PARTITA_INTERA dall'ambiente prima di lanciare i passi.
   C. COMPORTAMENTO (pagina finta in node, orologio finto che avanza di un minuto a lettura, fischio naturale al 90'):
      C1 senza la variabile → il salto parte all'85' una volta sola e il fischio arriva;
      C4 con CPM_PARTITA_INTERA=1 e `punteggio` (spazio-270: il salto provoca il pari dopo il 75') → il salto resta;
      C2 con CPM_PARTITA_INTERA=1 → nessun salto, l'orologio passa da tutti i minuti fino al 90', il fischio arriva, tetto di parete
         alzato (una partita intera sul banco costa di piu'); le soglie di giudizio dei controlli non cambiano.
   E. PIANO: ci-treno-308.mjs piano usa per partita-rigiocata-194 e spazio-296 la durata a partita intera (tabella INTERA_391), cosi'
      le parti restano bilanciate sotto l'obiettivo (misurato: 32 parti, la piu' lunga 4.090 → 4.174 s, obiettivo 4.200, bilancio 6.600).
   D. NESSUNA SCORCIATOIA: i tre controlli del dopo-partita importano aspettaFischio270 e nessuno chiama __CPM_SALTA297 da se'.

   Rosso: CPM_NO_G391=1 = comportamento di prima (workflow e ci-runner della base del giro 29d758c8, lib che salta sempre): DEVE uscire
   rosso. Senza variabili il guardiano gioca entrambi i bracci ed esce 0 solo se il verde e' verde E il rosso e' rosso.
   npm run dopo-partita-391 */
import fs from 'node:fs'; import path from 'node:path'; import { execFileSync } from 'node:child_process';
const QUI = path.dirname(new URL(import.meta.url).pathname), ROOT = path.resolve(QUI, '../..'), BASE = process.env.CPM_G391_BASE || '29d758c8';
const SOLO_ROSSO = process.env.CPM_NO_G391 === '1';
const leggi = (rel, rosso) => rosso ? execFileSync('git', ['show', BASE + ':' + rel], { cwd: ROOT, encoding: 'utf8', maxBuffer: 64 << 20 }) : fs.readFileSync(path.join(ROOT, rel), 'utf8');
const { aspettaFischio270 } = await import('./lib/fischio-270.mjs');

function pagina() {/* pagina finta: page.evaluate(fn, arg) esegue fn in node contro un window finto */
  const w = { m: 0, ph: 'playing', salti: [], minuti: new Set() };
  globalThis.window = { __CPM_PHASE: () => w.ph, __CPM_CLOCK: () => { if (w.ph === 'playing') { w.m++; w.minuti.add(w.m); if (w.m >= 90) w.ph = 'ended'; } return w.m; },
    __CPM_SCORE: () => ({ home: 1, away: 0 }), __CPM_SALTA297: (a) => { w.salti.push({ da: w.m, a }); w.m = a; return true; } };
  return { w, page: { evaluate: async (fn, arg) => fn(arg) } };
}
async function comportamento(intera, punteggio = null) {
  const prima = process.env.CPM_PARTITA_INTERA; if (intera) process.env.CPM_PARTITA_INTERA = '1'; else delete process.env.CPM_PARTITA_INTERA;
  try { const { w, page } = pagina(); const r = await aspettaFischio270(page, { daMin: 10, aMin: 85, punteggio, passoMs: 0, tettoMs: 60000, fermoMs: 60000 });
    return { fine: r.fine, fase: r.fase, salti: w.salti, minutiVisti: w.minuti.size, intera: !!r.intera };
  } finally { if (prima == null) delete process.env.CPM_PARTITA_INTERA; else process.env.CPM_PARTITA_INTERA = prima; delete globalThis.window; }
}
async function braccio(rosso) {
  const prova = [];
  const metti = (id, ok, det) => prova.push({ id, ok: !!ok, det });
  const wf = leggi('.github/workflows/verifica-guardiani.yml', rosso);
  const job = (wf.match(/\n  guardiani:\n([\s\S]*?)\n  [a-z-]+:\n/) || [])[1] || '';
  const envJob = (job.match(/\n    env:\n((?:      .*\n)+)/) || [])[1] || '';
  metti('A treno: CPM_PARTITA_INTERA=1 nel job delle parti', /^      CPM_PARTITA_INTERA: '1'/m.test(envJob), job ? (envJob ? 'env del job letto' : 'env del job NON trovato') : 'job «guardiani» NON trovato');
  const cr = leggi('tests/visual/ci-runner.mjs', rosso);
  const blocco = (cr.match(/if \(process\.argv\[2\] === 'giro'\) \{([\s\S]*?)\n\}/) || [])[1] || '';
  metti('B giri: ci-runner giro toglie CPM_PARTITA_INTERA', /delete process\.env\.CPM_PARTITA_INTERA/.test(blocco), blocco ? 'blocco giro letto' : 'blocco giro NON trovato');
  const prec = process.env.CPM_NO_G391; if (rosso) process.env.CPM_NO_G391 = '1'; else delete process.env.CPM_NO_G391;
  try {
    const c1 = await comportamento(false), c2 = await comportamento(true);
    metti('C1 giro: salto all\'85\' e fischio', c1.fine && c1.fase === 'ended' && c1.salti.length === 1 && c1.salti[0].a === 85 && c1.salti[0].da >= 10, JSON.stringify(c1));
    metti('C2 treno: nessun salto, 90 minuti, fischio', c2.fine && c2.fase === 'ended' && c2.salti.length === 0 && c2.minutiVisti >= 90 && c2.intera, JSON.stringify(c2));
    const c4 = await comportamento(true, { home: 1, away: 1 });
    metti('C4 treno: il salto che PROVOCA un momento (punteggio) resta', c4.fine && c4.salti.length === 1 && !c4.intera, JSON.stringify(c4));
  } finally { if (prec == null) delete process.env.CPM_NO_G391; else process.env.CPM_NO_G391 = prec; }
  const pt = leggi('tests/visual/ci-treno-308.mjs', rosso);
  const tab = (pt.match(/const INTERA_391 = \{([^}]*)\}/) || [])[1] || '';
  metti('E piano del treno: durate a partita intera (194 e 296) piu\' lunghe di quelle col salto', /'partita-rigiocata-194': \d{4}/.test(tab) && /'spazio-296': \d{4}/.test(tab) && /Math\.max\(s, INTERA_391\[n\]\)/.test(pt), tab ? tab.trim() : 'tabella INTERA_391 NON trovata');
  const lib = fs.readFileSync(path.join(QUI, 'lib/fischio-270.mjs'), 'utf8');
  metti('C3 tetto di parete alzato solo a partita intera', /TETTO_INTERA391_MS\s*=\s*\d{7,}/.test(lib) && /if \(intera\) tettoMs = Math\.max\(tettoMs, TETTO_INTERA391_MS\)/.test(lib), 'lib/fischio-270.mjs');
  for (const f of ['partita-rigiocata-194.mjs', 'spazio-296.mjs', 'spazio-270.mjs']) { const t = fs.readFileSync(path.join(QUI, f), 'utf8');
    metti('D ' + f + ': aspettaFischio270, nessun salto proprio', /import \{ aspettaFischio270 \} from '\.\/lib\/fischio-270\.mjs'/.test(t) && /aspettaFischio270\(page/.test(t) && !/__CPM_SALTA297\s*\(/.test(t), ''); }
  const ok = prova.every(p => p.ok);
  console.log((rosso ? 'ROSSO (CPM_NO_G391, base ' + BASE + ')' : 'VERDE') + ': ' + prova.filter(p => p.ok).length + '/' + prova.length);
  for (const p of prova) console.log('  ' + (p.ok ? '✓' : '✗') + ' ' + p.id + (p.det ? ' · ' + p.det.slice(0, 220) : ''));
  return ok;
}
if (SOLO_ROSSO) { const ok = await braccio(true); console.log(ok ? '✅ dopo-partita-391 verde (CPM_NO_G391)' : '❌ dopo-partita-391 ROSSO (CPM_NO_G391 = comportamento di prima)'); process.exit(ok ? 0 : 1); }
const v = await braccio(false), r = await braccio(true);
const ok = v && !r;
console.log(ok ? '✅ dopo-partita-391 verde (e il rosso si vede)' : '❌ dopo-partita-391 ROSSO (' + (!v ? 'verde non verde' : 'il rosso non si vede') + ')');
process.exit(ok ? 0 : 1);
