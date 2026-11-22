#!/usr/bin/env node
/* ============================================================================
   mappa-stretta-328.mjs — QUALI FILE DI src/ GUARDA DAVVERO UN GUARDIANO (giro 328, PO-621 «trenini piu' corti»)

   Strumento di MISURA (niente browser, niente esecuzione di guardiani). Per ogni guardiano delle righe della MAPPA di
   tests/visual/ci-runner.mjs raccoglie le prove che dipende da ciascun file di src/, e propone righe per file.

   Prove (una basta per tenere il guardiano sul file F):
     A  hook  — il testo del guardiano (script npm + moduli locali che importa, tranne lib/harness.mjs) nomina un identificatore
               __CPM_* che compare in F e in al piu' 2 file di src/ (i generici come __CPM_GLB, in 5 file, non dicono niente);
     B  storia — un commit (senza unioni, che tocca al piu' 4 file di src/) ha toccato insieme lo script del guardiano e F (non per
               src/07, che porta GAME_VERSION e lo tocca ogni giro);
     C  nome  — il guardiano nomina «src/NN» o il nome del file;
     D  simboli — il guardiano nomina (parola intera) un simbolo dichiarato in testa a F (>= 6 caratteri) o un valore data-cpm di F;
     K  dominio — il guardiano contiene una parola del dominio di F (elenco scritto a mano qui sotto, dai componenti del file).
   Incerto = nessuna prova A/B/C/D su NESSUN file di src/ → resta su tutte le righe dove era (non sappiamo cosa guarda).
   Un guardiano che dopo lo stringimento non avrebbe piu' nessuna riga resta dove era.

   Quali righe si stringono (decisione del giro 328, dalle misure del rapporto):
     STRINGI = src/16 (scene e schermate di fine/avvio carriera: componenti propri, pochi dipendenti). src/19 si MISURA con
     --stringi 16,19 ma resta larga (e' ...CATENE.completa per scelta: la radice dell'app, da cui passa ogni flusso). Gli altri file
     restano larghi: fondamenta usate da molti file (src/00-11, kit e cartellino in src/13, simulateMatch in src/10, migratePlayer
     in src/17, motore e partita in src/12-15, carriera in src/18).

   Uso: node tools/mappa-stretta-328.mjs [--da origin/lavoro/201] [--stringi 16,19] [--json f.json] [--dettaglio src/16]
        → stampa la proposta; non scrive ci-runner.mjs
   ============================================================================ */
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { leggiMappa } from './trenino-317.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..'), TV = path.join(ROOT, 'tests/visual');
export let STRINGI = ['16'];
/* dominio per file: parole che un guardiano usa quando esercita i componenti del file (dai nomi dichiarati in testa al file) */
export const DOMINIO = {
  '16': /presentazion|intervist|conferenz|gala|parata|pullman|fine stagione|finestagione|SeasonEnd|SeasonAwards|ProTransition|premiazion|sponsor|saluto|figurin|pelle|serata|busta|ritratt/i,
  '19': /impostazion|opzioni|settings|privacy|navbar|IntroCinematic|\bintro\b|recension|ReviewWizard|Lettura|SitTest|ErrorBoundary|TIENI|AudioSettings/i,
};

const scripts = JSON.parse(fs.readFileSync(path.join(TV, 'package.json'), 'utf8')).scripts;
const SRC = fs.readdirSync(path.join(ROOT, 'src')).filter(f => /^\d\d-/.test(f));
const TESTO = Object.fromEntries(SRC.map(f => [f, fs.readFileSync(path.join(ROOT, 'src', f), 'utf8')]));
const num = f => f.slice(0, 2);

/** file del guardiano: gli script che il comando npm nomina + i moduli locali importati (ricorsivo), tranne lib/harness.mjs */
export function fileDi(nome) {
  const out = new Set(), q = [];
  for (const t of String(scripts[nome] || '').split(/[\s;&|()'"=]+/)) if (/\.(mjs|js|cjs)$/.test(t)) { const p = path.resolve(TV, t); if (fs.existsSync(p)) q.push(p); }
  while (q.length) {
    const p = q.pop(); if (out.has(p) || /lib\/harness\.mjs$/.test(p)) continue; out.add(p);
    for (const m of fs.readFileSync(p, 'utf8').matchAll(/(?:from|import\()\s*['"](\.[^'"]+)['"]/g)) { const r = path.resolve(path.dirname(p), m[1]); if (fs.existsSync(r)) q.push(r); }
  }
  return [...out].map(p => path.relative(ROOT, p));
}
const dove = new Map();
const fileConId = id => { if (!dove.has(id)) { const re = new RegExp(id.replace(/\$/g, '\\$') + '(?![A-Za-z0-9_$])'); dove.set(id, SRC.filter(f => re.test(TESTO[f]))); } return dove.get(id); };
const SIMBOLI = Object.fromEntries(SRC.map(f => [f, [...new Set([...TESTO[f].matchAll(/^(?:function|const|let|class) ([A-Za-z_$][A-Za-z0-9_$]*)/gm)].map(m => m[1]).filter(s => s.length >= 6))]]));
const DATACPM = Object.fromEntries(SRC.map(f => [f, [...new Set([...TESTO[f].matchAll(/data-cpm=["{'`]+([A-Za-z0-9_-]{4,})/g)].map(m => m[1]))]]));

/** storia: commit senza unioni → file toccati (una sola passata su git log) */
let STORIA = null;
function storia() {
  if (STORIA) return STORIA;
  const r = spawnSync('git', ['log', '--no-merges', '--name-only', '--format=@@%H', 'HEAD'], { cwd: ROOT, encoding: 'utf8', maxBuffer: 1 << 30 });
  const per = new Map(); let cur = null;
  for (const l of r.stdout.split('\n')) { if (l.startsWith('@@')) { cur = []; continue; } if (l && cur) { cur.push(l); if (!per.has(l)) per.set(l, []); per.get(l).push(cur); } }
  const sh = spawnSync('git', ['rev-parse', '--is-shallow-repository'], { cwd: ROOT, encoding: 'utf8' }).stdout.trim();
  return (STORIA = { per, corta: sh === 'true' });
}

/** prove del guardiano g sul file f (f = nome in src/) */
export function prove(g, f) {
  const fl = fileDi(g), txt = fl.map(p => fs.readFileSync(path.join(ROOT, p), 'utf8')).join('\n');
  const ids = [...new Set(txt.match(/__CPM_[A-Za-z0-9_$]+/g) || [])];
  const A = ids.filter(i => { const w = fileConId(i); return w.length && w.length <= 2 && w.includes(f); });
  /* src/07 porta GAME_VERSION: ogni commit di giro lo tocca, la storia li' non dice niente */
  const B = new Set(); if (num(f) !== '07') for (const p of fl.filter(p => !p.includes('/lib/'))) for (const c of storia().per.get(p) || []) { const s = c.filter(x => /^src\/\d\d-/.test(x)); if (s.length <= 4 && s.includes('src/' + f)) B.add(c); }
  const C = txt.includes('src/' + num(f)) || txt.includes(f);
  const D = [...SIMBOLI[f].filter(s => new RegExp('(?<![A-Za-z0-9_$])' + s.replace(/\$/g, '\\$') + '(?![A-Za-z0-9_$])').test(txt)), ...DATACPM[f].filter(v => txt.includes(v))];
  const K = DOMINIO[num(f)] ? (txt.match(DOMINIO[num(f)]) || [])[0] || null : null;
  return { A, B: B.size, C, D, K, ha: !!(A.length || B.size || C || D.length || K) };
}

/** proposta: righe nuove della MAPPA (stessa forma [regex, elenco]) + resoconto per file */
export function proponi(MAPPA) {
  const nuove = [], resoconto = [], tutti = new Set(MAPPA.flatMap(r => r[1]));
  for (const [re, l] of MAPPA) {
    const fs_ = SRC.filter(f => re.test('src/' + f)), str = fs_.filter(f => STRINGI.includes(num(f)));
    if (!str.length) { nuove.push([re, l]); continue; }
    const larghi = fs_.filter(f => !STRINGI.includes(num(f))), unici = [...new Set(l)];
    const P = Object.fromEntries(unici.map(g => [g, Object.fromEntries(fs_.map(f => [f, prove(g, f)]))]));
    /* incerto = nessuna prova su NESSUN file di src/ (non solo del gruppo): per lui non sappiamo niente, resta largo */
    const incerto = g => fs_.every(f => !P[g][f].ha) && SRC.every(f => { const v = prove(g, f); return !(v.A.length || v.B || v.C || v.D.length); });
    if (larghi.length) nuove.push([new RegExp(larghi.map(f => 'src\\/' + num(f) + '-').join('|')), l]);
    for (const f of str) {
      const tiene = l.filter((g, i) => l.indexOf(g) === i && (P[g][f].ha || incerto(g)));
      nuove.push([new RegExp('src\\/' + num(f) + '-'), tiene]);
      resoconto.push({ file: 'src/' + f, prima: unici.length, dopo: tiene.length, incerti: unici.filter(incerto).length,
        tolti: unici.filter(g => !tiene.includes(g)), prove: Object.fromEntries(tiene.map(g => [g, P[g][f]])) });
    }
  }
  /* nessun guardiano senza riga */
  const dopo = new Set(nuove.flatMap(r => r[1])), orfani = [...tutti].filter(g => !dopo.has(g));
  for (const g of orfani) { const r = MAPPA.find(x => x[1].includes(g)); const n = nuove.find(x => x[0].source === r[0].source) || nuove.find(x => STRINGI.some(s => x[0].source === 'src\\/' + s + '-' && r[0].test('src/' + s + '-'))); n[1].push(g); }
  return { nuove, resoconto, orfani, storia_corta: storia().corta };
}

/** PRIMA/DOPO su vagoni reali: per ogni commit d'unione m, il vagone e' `git diff m^1 m`; la scelta e' scegli() del trenino (stessa
 *  funzione del treno) sulla mappa PRIMA (commit dato) e DOPO (file di lavoro); i minuti col taglio in parti di ci-treno-308 (durate
 *  di docs/governo/DURATE-GUARDIANI.json, obiettivo 4200 s per parte, tetti di TETTI_328 del trenino). */
export async function confronta(prima, unioni) {
  const T = await import('./trenino-317.mjs');
  const D = JSON.parse(fs.readFileSync(path.join(ROOT, 'docs/governo/DURATE-GUARDIANI.json'), 'utf8')).voci || {};
  const g = a => spawnSync('git', a, { cwd: ROOT, encoding: 'utf8', maxBuffer: 1 << 28 }).stdout;
  const mP = T.leggiMappa(g(['show', `${prima}:tests/visual/ci-runner.mjs`])), mD = T.leggiMappa(fs.readFileSync(path.join(TV, 'ci-runner.mjs'), 'utf8'));
  const piano = (nomi, tipo) => { const v = nomi.map(n => (D[n] && D[n].s) || 300), tot = v.reduce((a, b) => a + b, 0), OB = 4200;
    /* stesso taglio di ci-treno-308 piano(): il piu' lungo nella parte piu' leggera; parti in piu' finche' una parte con piu' d'un guardiano sfora */
    const taglia = N => { const p = Array.from({ length: N }, () => ({ s: 0, k: 0 })); for (const x of [...v].sort((a, b) => b - a)) { const q = p.reduce((m, y) => (y.s < m.s ? y : m), p[0]); q.s += x; q.k++; } return p; };
    let N = Math.max(1, Math.min(v.length, Math.ceil(tot / OB))), p = taglia(N); while (N < Math.min(v.length, 256) && p.some(y => y.s > OB && y.k > 1)) p = taglia(++N);
    const mx = Math.max(...p.map(y => y.s)), tetto = tipo === 'trenino' ? T.TETTI_328.trenino : T.TETTI_328.grande;/* [giro 329] dai tetti del trenino (erano 4/15 scritti qui) */
    /* parete attesa: `tetto` macchine, le parti partono nell'ordine della matrice appena una macchina e' libera (max-parallel di Actions);
       durate del banco, senza installazione ne' code: e' un confronto fra due mappe, non una previsione dell'orologio del runner */
    const mac = Array(Math.min(tetto, N)).fill(0); for (const y of p) { const i = mac.indexOf(Math.min(...mac)); mac[i] += y.s; }
    return { guardiani: nomi.length, parti: N, somma_min: Math.round(tot / 60), parte_max_min: Math.round(mx / 60), parete_min: Math.round(Math.max(...mac) / 60) }; };
  const out = [];
  for (const m of unioni) {
    const toccati = g(['diff', '--name-only', `${m}^1`, m]).split('\n').filter(Boolean), pkg = JSON.parse(g(['show', `${m}:tests/visual/package.json`]) || '{}'), pkgB = JSON.parse(g(['show', `${m}^1:tests/visual/package.json`]) || '{}');
    const mB = T.leggiMappa(g(['show', `${m}^1:tests/visual/ci-runner.mjs`]));
    const una = (mappa, dopo) => { const s = T.scegli({ toccati, mappa, mappaBase: mB, pkg, pkgBase: pkgB, riferimenti: dopo ? T.riferimentiDaGit(ROOT, m, toccati) : undefined, durate: dopo ? D : undefined }); const n = s.tipo === 'trenino' ? s.guardiani : [...new Set([...Object.values(mappa.CATENE).flat(), ...mappa.MAPPA.flatMap(r => r[1])])].filter(x => !/^ci(:|$)/.test(x) && pkg.scripts && pkg.scripts[x]); return { tipo: s.tipo, ...piano(n, s.tipo), scoperti: s.scoperti }; };
    out.push({ unione: m.slice(0, 8), titolo: g(['log', '-1', '--format=%s', m]).trim(), src: toccati.filter(f => f.startsWith('src/')).map(f => f.slice(4, 6)), prima: una(mP, false), dopo: una(mD, true) });
  }
  return out;
}

/** ORFANI: guardiani delle catene (tranne nucleo/sentinelle) che non stanno in nessuna riga della MAPPA: girano solo nella mappa intera.
 *  Si collocano nella riga «di casa» dei file dove hanno prove forti (A o C), altrimenti B o D. → { guardiano: [regex della riga] } */
export const CASA = { '00': 'src\\/0[0-8]-', '01': 'src\\/0[0-8]-', '02': 'src\\/0[0-8]-', '03': 'src\\/0[0-8]-', '04': 'src\\/0[0-8]-', '05': 'src\\/05-|src\\/09-', '06': 'src\\/0[0-8]-',
  '07': 'src\\/0[0-8]-', '08': 'src\\/0[0-8]-', '09': 'src\\/05-|src\\/09-', '10': 'src\\/18-|src\\/10-', '11': 'src\\/1[17]-', '12': 'src\\/12-|src\\/13-', '13': 'src\\/12-|src\\/13-',
  '14': 'src\\/14-', '15': 'src\\/15-', '16': 'src\\/16-', '17': 'src\\/1[17]-', '18': 'src\\/18-|src\\/10-', '19': 'src\\/19-' };
export function collocaOrfani(CATENE, MAPPA) {
  const inM = new Set(MAPPA.flatMap(r => r[1])), out = {};
  const orf = [...new Set(Object.entries(CATENE).filter(([k]) => !['nucleo', 'sentinelle'].includes(k)).flatMap(([, l]) => l))].filter(n => !/^ci(:|$)/.test(n) && !inM.has(n) && scripts[n]);
  for (const g of orf) { const P = SRC.map(f => [f, prove(g, f)]);
    let fs_ = P.filter(([, v]) => v.A.length || v.C).map(([f]) => f); if (!fs_.length) fs_ = P.filter(([, v]) => v.B || v.D.length).map(([f]) => f);
    out[g] = fs_.length ? [...new Set(fs_.map(f => CASA[num(f)]))] : null; }
  return out;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url) && process.argv[2] === 'orfani') {
  const { CATENE, MAPPA } = leggiMappa(fs.readFileSync(path.join(TV, 'ci-runner.mjs'), 'utf8'));
  console.log(JSON.stringify(collocaOrfani(CATENE, MAPPA), null, 1));
} else if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url) && process.argv[2] === 'confronta') {
  const a = process.argv.slice(3); const r = await confronta(a[0], a.slice(1));
  console.log('| vagone | src toccati | prima: guardiani · parti · somma · parete | dopo: guardiani · parti · somma · parete |\n|---|---|---|---|');
  for (const x of r) { const f = y => y.tipo === 'trenino' ? `${y.guardiani} · ${y.parti} · ${y.somma_min} min · ~${y.parete_min} min` : `COMPLETO (${y.scoperti.length ? `${y.scoperti.length} file scoperti: ${y.scoperti.slice(0, 2).join(', ')}${y.scoperti.length > 2 ? '…' : ''}` : 'trenino piu\' lento della mappa intera'}) ${y.guardiani} · ${y.parti} · ${y.somma_min} min · ~${y.parete_min} min`; console.log(`| ${x.titolo.replace(/^Unione sviluppo\//, '').replace(/ in lavoro.*/, '')} (${x.unione}) | ${x.src.join(' ') || '—'} | ${f(x.prima)} | ${f(x.dopo)} |`); }
} else if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const a = process.argv.slice(2), o = {}; for (let i = 0; i < a.length; i++) if (a[i].startsWith('--')) o[a[i].slice(2)] = a[i + 1] && !a[i + 1].startsWith('--') ? a[++i] : true;
  if (o.stringi) STRINGI = String(o.stringi).split(',');
  /* --da <ref>: la proposta si calcola sulla MAPPA di quel commit (es. lavoro/201, prima della riga di src/16) */
  const testo = o.da ? spawnSync('git', ['show', `${o.da}:tests/visual/ci-runner.mjs`], { cwd: ROOT, encoding: 'utf8', maxBuffer: 1 << 26 }).stdout : fs.readFileSync(path.join(TV, 'ci-runner.mjs'), 'utf8');
  const { MAPPA } = leggiMappa(testo);
  const p = proponi(MAPPA);
  if (p.storia_corta) console.log('⚠️ storia corta (clone shallow): la prova B e\' incompleta, la proposta tiene MENO guardiani del dovuto. Usare un clone intero.');
  for (const r of p.resoconto) console.log(`${r.file}: ${r.prima} → ${r.dopo} guardiani (incerti tenuti: ${r.incerti}); tolti: ${r.tolti.join(' ')}`);
  console.log('righe proposte:'); for (const [re, l] of p.nuove) console.log(`  /${re.source}/ ${new Set(l).size}`);
  if (o.dettaglio) { const r = p.resoconto.find(x => x.file.startsWith(o.dettaglio)); for (const [g, v] of Object.entries(r.prove)) console.log(`  ${g.padEnd(26)} A:${v.A.join(',') || '-'} B:${v.B} C:${v.C ? 1 : 0} D:${v.D.join(',') || '-'} K:${v.K || '-'}`); }
  if (o.json) fs.writeFileSync(o.json, JSON.stringify({ ...p, nuove: p.nuove.map(([re, l]) => [re.source, l]) }, null, 1) + '\n');
}
