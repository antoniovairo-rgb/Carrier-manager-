#!/usr/bin/env node
/* [giro 392 PO-528 «controlli lunghi», PO 21/11 «valuta la soluzione piu' efficace» → una leva sola] GUARDIANO STATICO (~1 s, niente browser).
   MISURA che ha scelto la leva: il gioco accetta solo le velocita' MATCH_SPEEDS = [1, 1.5, 2] (src/15, readMatchSpeed) e una preferenza
   fuori lista la RISCRIVE a 1. Molti controlli scrivevano `cpm-match-speed = '4'` credendo di giocare a 4×: giocavano a 1×. La leva
   «velocita' 2× nel banco» e' quindi correggere il valore, non inventarne uno nuovo: '2' e' la velocita' piu' alta che il gioco esiste
   davvero (docs/sviluppo/RAPPORTO-giro392.md: minuti risparmiati misurati, verde e rosso di ogni controllo passato).
   VERDE: (1) readMatchSpeed VERO (estratto da src/15 ed eseguito in node con un localStorage finto) trasforma '4' in 1 e tiene '2' (se un
   giorno il gioco accettasse 4, questa premessa cade e il guardiano lo dice); (2) ogni controllo di ELENCO_392 scrive SOLO velocita' che
   readMatchSpeed tiene (nessuna riscritta a 1) e almeno una volta '2'; (3) ogni controllo di ELENCO_392 ha in DURATE-GUARDIANI.json la sua
   durata misurata dal giro 392 (`giro392`). Censimento informativo: gli altri controlli che scrivono ancora una velocita' fuori lista
   (dichiarati, non passati: ognuno va verificato verde+rosso prima di cambiarlo).
   ROSSO (CPM_NO_G392=1): legge i controlli di ELENCO_392 dalla base del giro (29d758c8, comportamento di prima) e deve uscire rosso.
   Uso: node controlli-lunghi-392.mjs */
import fs from 'node:fs'; import path from 'node:path'; import vm from 'node:vm'; import { spawnSync } from 'node:child_process';
const QUI = path.dirname(new URL(import.meta.url).pathname), ROOT = path.resolve(QUI, '../..');
const BASE = '29d758c8', ROSSO = process.env.CPM_NO_G392 === '1';
export const ELENCO_392 = ['assist-nome-98', 'nomi-219', 'difesa-220', 'assist-298'];
const g = [];
/* (1) la premessa, sul codice vero */
const src = fs.readFileSync(path.join(ROOT, 'src/15-live-match.jsx'), 'utf8');
const a = src.indexOf('const MATCH_SPEEDS='), z = src.indexOf('return 1;}catch(_e){return 1;}}', a);
let tiene = null;
if (a < 0 || z < 0) g.push('src/15: MATCH_SPEEDS/readMatchSpeed non trovati (premessa non giudicata)');
else {
  const store = {}; const ctx = { localStorage: { getItem: k => (k in store ? store[k] : null), setItem: (k, v) => { store[k] = String(v); } } }; vm.createContext(ctx);
  vm.runInContext(src.slice(a, z + 'return 1;}catch(_e){return 1;}}'.length).replace('const MATCH_SPEEDS', 'var MATCH_SPEEDS') + ';var _rd=readMatchSpeed;', ctx);
  tiene = v => { store['cpm-match-speed'] = String(v); return ctx._rd(); };
  const q = tiene('4'), d = tiene('2');
  if (q !== 1) g.push(`premessa: readMatchSpeed('4') = ${q}, non 1 (il gioco accetta 4: la leva va rimisurata)`);
  if (d !== 2) g.push(`premessa: readMatchSpeed('2') = ${d}, non 2`);
  console.log(`premessa: MATCH_SPEEDS = ${JSON.stringify(ctx.MATCH_SPEEDS)} · '4' → ${q} · '2' → ${d}`);
}
/* le velocita' scritte da un controllo: localStorage.setItem('cpm-match-speed', 'X') e localStorage['cpm-match-speed'] = 'X' */
const RE = /cpm-match-speed['"]\s*(?:,\s*|\]\s*=\s*)(?:String\()?['"]?([0-9.]+)/g;
const velDi = t => [...t.matchAll(RE)].map(m => m[1]);
const script = JSON.parse(fs.readFileSync(path.join(QUI, 'package.json'), 'utf8')).scripts;
const fileDi = n => { const m = (script[n] || '').match(/node ([\w.-]+\.mjs)/); return m ? m[1] : null; };
const testo = f => ROSSO ? spawnSync('git', ['show', `${BASE}:tests/visual/${f}`], { cwd: ROOT, encoding: 'utf8' }).stdout : fs.readFileSync(path.join(QUI, f), 'utf8');
/* (2) i controlli passati dalla leva */
for (const n of ELENCO_392) {
  const f = fileDi(n); if (!f) { g.push(`${n}: nessuno script npm (non giudicato)`); continue; }
  const t = testo(f); if (!t) { g.push(`${n}: ${f} non leggibile${ROSSO ? ' alla base ' + BASE : ''} (non giudicato)`); continue; }
  const v = velDi(t); if (!v.length) { g.push(`${n}: ${f} non scrive cpm-match-speed (non giudicato)`); continue; }
  const riscritte = tiene ? v.filter(x => tiene(x) !== +x) : [];
  if (riscritte.length) g.push(`${n}: scrive cpm-match-speed = ${[...new Set(riscritte)].join(', ')}, che il gioco riscrive a 1 (gioca a 1×, non piu' veloce)`);
  if (!v.includes('2')) g.push(`${n}: nessuna velocita' '2' (scritte: ${v.join(', ')})`);
  console.log(`${n} (${f}): velocita' scritte ${v.join(', ')}`);
}
/* (3) le durate misurate */
const D = JSON.parse(fs.readFileSync(path.join(ROOT, 'docs/governo/DURATE-GUARDIANI.json'), 'utf8'));
for (const n of ELENCO_392) { const e = D.voci && D.voci[n]; if (!e || !e.giro392 || !(e.giro392.dopo_s > 0)) g.push(`${n}: DURATE-GUARDIANI.json senza la durata misurata dal giro 392`); }
/* censimento informativo */
const altri = [];
for (const f of fs.readdirSync(QUI).filter(f => f.endsWith('.mjs') && f !== 'controlli-lunghi-392.mjs')) {
  const v = velDi(fs.readFileSync(path.join(QUI, f), 'utf8')); const r = tiene ? [...new Set(v.filter(x => tiene(x) !== +x))] : [];
  if (r.length && !ELENCO_392.some(n => fileDi(n) === f)) altri.push(f + '(' + r.join('/') + ')'); }
console.log(`informativo: ${altri.length} altri script scrivono ancora una velocita' che il gioco riscrive a 1 (non passati dal giro 392): ${altri.slice(0, 12).join(', ')}${altri.length > 12 ? ', …' : ''}`);
if (g.length) { console.log(`❌ controlli-lunghi-392${ROSSO ? ' (rosso CPM_NO_G392: controlli della base ' + BASE + ')' : ''}`); g.forEach(x => console.log('  · ' + x)); process.exit(1); }
console.log(`✅ controlli-lunghi-392 verde: ${ELENCO_392.length} controlli giocano davvero a 2× (premessa sul readMatchSpeed vero) e hanno la durata misurata`);
/* prova del rosso nello stesso giro: lo stesso guardiano sui controlli della base deve uscire rosso, e per il motivo giusto */
if (!process.env.CPM_392_FIGLIO) {
  const r = spawnSync(process.execPath, [new URL(import.meta.url).pathname], { env: { ...process.env, CPM_NO_G392: '1', CPM_392_FIGLIO: '1' }, encoding: 'utf8' });
  const out = (r.stdout || '') + (r.stderr || ''); const visto = ELENCO_392.filter(n => out.includes(`${n}: scrive cpm-match-speed = 4`));
  if (r.status !== 1 || visto.length !== ELENCO_392.length) { console.log(`❌ controlli-lunghi-392: il rosso (CPM_NO_G392=1) non si vede (uscita ${r.status}, velocita' fuori lista viste in ${visto.length}/${ELENCO_392.length})`); console.log(out.slice(-800)); process.exit(1); }
  console.log(`✅ e il rosso si vede: con CPM_NO_G392=1 (controlli della base ${BASE}) ${visto.length}/${ELENCO_392.length} scrivono '4' e giocano a 1×`);
}
