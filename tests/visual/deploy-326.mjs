#!/usr/bin/env node
/* [giro 326, PO-624] GUARDIANO DEL DEPLOY DEL GIOCO. Niente browser, niente rete: legge i workflow e il piano del treno.

   Problemi misurati il 22/11 (log pubblici delle corse, docs/sviluppo/RAPPORTO-giro326.md):
   (a) il treno grande apriva 29 parti e prendeva tutte e 20 le macchine dell'account: il deploy del gioco restava in coda
       (3.080 s e 3.886 s misurati) finche' una parte non finiva, o finche' il PO annullava il treno a mano;
   (b) 10 deploy su 11 falliti nel passo «Deploy to GitHub Pages» per guasti passeggeri di GitHub (artefatto non ancora visibile
       mezzo secondo dopo il caricamento · 502 alla creazione), quasi tutti su push di SOLI documenti di governo.

   A. FILTRO: un push su main di soli docs/governo/** o *.md non lancia il deploy; un push che tocca il gioco (src/, il ricomposto,
      assets/, ogni file che il passo «Build static site» copia nel sito) lo lancia sempre. I file del sito si ricavano dal
      workflow stesso (righe `cp`), quindi una voce nuova del sito finita per sbaglio sotto il filtro fa diventare rosso il guardiano.
   B. TENTATIVI: almeno due chiamate a actions/deploy-pages; tutte tranne l'ultima con continue-on-error; ognuna dopo la prima
      parte solo se le precedenti sono fallite; un'attesa prima del primo tentativo; l'ultima senza continue-on-error (se fallisce
      tutto, la corsa e' rossa davvero).
   C. TETTO DI MACCHINE: il job dei guardiani del treno ha max-parallel dal piano; il piano della mappa intera chiede al massimo
      TETTO_GRANDE, il trenino TETTO_TRENINO; treno grande + trenino + un posto per il passo di servizio di ciascuno + il deploy
      stanno nelle 20 macchine. [giro 329] Col trenino a 15 due corse insieme non ci stanno: il workflow del treno deve avere una
      concorrenza UNICA senza annullare (una corsa alla volta) e allora 15 + deploy lascia sempre posti liberi. Il tetto non allunga il treno (stesso numero di ondate del tetto 20).
   D. CODA SIMULATA (prima/dopo): sul piano vero della mappa intera, un deploy che arriva a treno appena partito aspetta
      (senza tetto) quanto la parte piu' corta, (col tetto) zero.

   E. [giro 327] validate-situations.yml parte solo a mano (unico evento workflow_dispatch).

   Verde col verde, rosso col rosso: con CPM_NO_G326=1 i tre file si leggono dalla base del giro (c0dd9cf, 7.999.203) e il
   guardiano DEVE uscire rosso.   npm run deploy-326   (≈ 2 s) */
import fs from 'node:fs'; import path from 'node:path';
import { execFileSync } from 'node:child_process';
const QUI = path.dirname(new URL(import.meta.url).pathname), ROOT = path.resolve(QUI, '../..');
const NO = process.env.CPM_NO_G326 === '1', BASE = process.env.CPM_G326_BASE || 'c0dd9cf';
const leggi = rel => NO ? execFileSync('git', ['show', `${BASE}:${rel}`], { cwd: ROOT, encoding: 'utf8' }) : fs.readFileSync(path.join(ROOT, rel), 'utf8');
let fall = 0; const ok = (c, m) => { console.log(`${c ? '✅' : '❌'} ${m}`); if (!c) fall++; };
if (NO) console.log(`(CPM_NO_G326=1: workflow e piano letti da ${BASE}, prima del giro 326 — il guardiano deve uscire rosso)`);

const DEP = leggi('.github/workflows/deploy-pages.yml'), TRENO = leggi('.github/workflows/verifica-guardiani.yml'), PIANO = leggi('tests/visual/ci-treno-308.mjs');

/* ------------------------------------------------ A. filtro dei percorsi (semantica dei filtri di GitHub) */
console.log('\n== A. il deploy non parte per soli documenti, parte sempre per il gioco ==');
const blocco = (txt, chiave) => { const r = txt.split('\n'), i = r.findIndex(l => l.trim() === chiave + ':'); if (i < 0) return [];
  const ind = r[i].search(/\S/), v = []; for (let k = i + 1; k < r.length; k++) { const l = r[k]; if (!l.trim() || l.trim().startsWith('#')) continue;
    if (l.search(/\S/) <= ind) break; const m = l.replace(/\s+#.*$/, '').match(/^\s*-\s*['"]?([^'"#]+?)['"]?\s*$/); if (m) v.push(m[1]); } return v; };
const pushSez = (() => { const r = DEP.split('\n'), a = r.findIndex(l => /^  push:/.test(l)); const z = r.findIndex((l, i) => i > a && /^  \S/.test(l)); return r.slice(a, z < 0 ? undefined : z).join('\n'); })();
const ignora = blocco(pushSez, 'paths-ignore');
const glob = g => new RegExp('^' + g.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*\*\//g, '\u0001').replace(/\*\*/g, '\u0002').replace(/\*/g, '[^/]*')
  .replace(/\u0001/g, '(?:.*/)?').replace(/\u0002/g, '.*') + '$');
const RE = ignora.map(glob);
const parte = files => !(files.length && files.every(f => RE.some(r => r.test(f))));   /* paths-ignore: si salta solo se TUTTI i file sono ignorati */
ok(ignora.length > 0, `paths-ignore sul push di main: ${JSON.stringify(ignora)}`);
const casi = [
  [['docs/governo/ROADMAP.md', 'docs/governo/BACKLOG.md', 'docs/governo/DECISIONI.md'], false, 'solo documenti di governo (il 90% dei push su main)'],
  [['docs/governo/STABILITA.json'], false, 'solo un json di governo'],
  [['docs/governo/BACKLOG.md', 'docs/collaudo-po/202-home-due-tasti-rossi.jpg'], false, 'governo + foto del collaudo del PO'],
  [['docs/sviluppo/giro149/misure.json'], true, 'pagina d\'ascolto pubblicata (docs/sviluppo)'],
  [['CLAUDE.md', 'docs/sviluppo/RAPPORTO-giro326.md'], false, 'solo .md'],
  [['src/12-three-match-view.jsx', 'CARRIER-MANAGER-AV.html', 'docs/governo/ROADMAP.md'], true, 'rilascio: gioco + governo'],
  [['src/07-versione-save-interviste.jsx'], true, 'solo un frammento del gioco'],
  [['tools/build-dist.mjs'], true, 'la build del sito'],
  [['tests/visual/package.json'], true, 'le dipendenze della build'],
];
for (const [f, atteso, nome] of casi) ok(parte(f) === atteso, `${nome}: deploy ${parte(f) ? 'parte' : 'non parte'} (atteso: ${atteso ? 'parte' : 'non parte'})`);
/* ogni sorgente copiata nel sito dal passo «Build static site» deve far partire il deploy da sola */
const cpRighe = DEP.split('\n').filter(l => /\bcp\b/.test(l) && !l.trim().startsWith('#'));
const sorgenti = [...new Set(cpRighe.flatMap(l => l.split(/&&|;/)).filter(c => /^\s*cp\b/.test(c)).flatMap(c => c.trim().split(/\s+/).slice(1, -1))
  .filter(t => !t.startsWith('-') && !t.startsWith('_site') && !t.startsWith('dist-web')).map(t => t.replace(/\/$/, '')))];
const daSito = sorgenti.map(s => (fs.existsSync(path.join(ROOT, s)) && fs.statSync(path.join(ROOT, s)).isDirectory()) ? s + '/x.bin' : s);
const persi = daSito.filter(f => !parte([f]));
ok(sorgenti.length >= 8 && persi.length === 0, `${sorgenti.length} sorgenti del sito lette dalle righe cp: ${persi.length ? 'FINITE SOTTO IL FILTRO ' + persi.join(', ') : 'tutte fanno partire il deploy'}`);
ok(/workflow_dispatch/.test(DEP.split('jobs:')[0]), 'workflow_dispatch resta (il rilascio automatico avvia il deploy cosi\', senza filtro)');

/* ------------------------------------------------ B. nuovi tentativi del passo di pubblicazione */
console.log('\n== B. il passo di pubblicazione riprova sui guasti passeggeri di GitHub ==');
const passi = DEP.split(/\n(?=      - )/).map(t => ({ t, uses: (t.match(/uses:\s*(\S+)/) || [])[1] || '', id: (t.match(/\bid:\s*(\S+)/) || [])[1] || '',
  cont: /continue-on-error:\s*true/.test(t), se: (t.match(/\bif:\s*(.+)/) || [])[1] || '', run: (t.match(/run:\s*(.+)/) || [])[1] || '' }));
const dep = passi.filter(p => p.uses.startsWith('actions/deploy-pages@'));
ok(dep.length >= 2, `chiamate a actions/deploy-pages: ${dep.length} (servono almeno 2)`);
ok(dep.slice(0, -1).every(p => p.cont) && dep.length > 0 && !dep[dep.length - 1].cont, 'tutte tranne l\'ultima con continue-on-error; l\'ultima fallisce davvero');
ok(dep.slice(1).every((p, i) => dep.slice(0, i + 1).every(q => q.id && p.se.includes(`steps.${q.id}.outcome == 'failure'`))), 'ogni tentativo dopo il primo parte solo se i precedenti sono falliti');
const iDep = passi.indexOf(dep[0]), iUp = passi.findIndex(p => p.uses.startsWith('actions/upload-pages-artifact@'));
ok(iDep > iUp + 1 && passi.slice(iUp + 1, iDep).some(p => /sleep\s+([1-9]\d)/.test(p.run)), 'attesa di almeno 10 s fra il caricamento dell\'artefatto e il primo tentativo');
const url = (DEP.match(/url:\s*\$\{\{([^}]*)\}\}/) || [])[1] || '';
ok(dep.every(p => url.includes(`steps.${p.id}.outputs.page_url`)), 'l\'indirizzo dell\'ambiente viene dal tentativo riuscito, qualunque sia');

/* ------------------------------------------------ C. tetto di macchine del treno */
console.log('\n== C. il treno lascia sempre posti liberi ==');
const MACCHINE = 20;
const mp = (TRENO.match(/max-parallel:\s*(.+)/) || [])[1] || '';
ok(/needs\.piano\.outputs\.paralleli/.test(mp), `guardiani: max-parallel ${mp || 'ASSENTE (= tutte le 20 macchine)'}`);
ok(/paralleli:\s*\$\{\{\s*steps\.piano\.outputs\.paralleli/.test(TRENO), 'il job «piano» esporta paralleli');
ok(/'paralleli=' \+ p\.paralleli/.test(PIANO), 'ci-treno-308.mjs piano scrive paralleli= in GITHUB_OUTPUT');
const tG = +((PIANO.match(/TETTO_GRANDE\s*=\s*(\d+)/) || [])[1] || MACCHINE), tT = +((PIANO.match(/TETTO_TRENINO\s*=\s*(\d+)/) || [])[1] || MACCHINE);
/* caso peggiore dichiarato: treno grande + un trenino nello stesso momento + il deploy. Una corsa e' o nei passi di servizio
   (piano/riepilogo/blocco/rilascio: uno alla volta, needs in fila) o nei guardiani: occupa al massimo max(tetto, 1) macchine. */
/* [giro 329, decisione PO 22/11 19:40] trenino fino a 15: due corse del treno insieme (treno grande + trenino, o due trenini su rami
   diversi) non stanno piu' nelle 20. Il caso peggiore dipende dalla concorrenza del workflow: un gruppo UNICO (che non dipende dal ramo
   ne' dall'evento) senza annullare → una corsa del treno alla volta; altrimenti due corse insieme (il gruppo per ramo del giro 317
   lasciava correre insieme treno grande su main e trenino su lavoro/**, o due lavoro/**). */
const capienza = (wf, g, t) => { const c = (wf.match(/^concurrency:\s*\n\s+group:\s*([^\n#]+?)\s*\n\s+cancel-in-progress:\s*(\S+)/m) || []);
  const unica = !!c[1] && !/\$\{\{/.test(c[1]) && c[2] === 'false';
  return { unica, gruppo: c[1] || 'nessuno', peggio: (unica ? Math.max(g, t, 1) : Math.max(g, 1) + Math.max(t, 1)) + 1 }; };
const cap = capienza(TRENO, tG, tT);
ok(cap.peggio <= MACCHINE - 1 || (!cap.unica && cap.peggio <= MACCHINE), `${cap.unica ? `una corsa del treno alla volta (gruppo «${cap.gruppo}», senza annullare): ${Math.max(tG, tT)}` : `gruppo «${cap.gruppo}»: treno grande ${tG} + trenino ${tT}`} + deploy = ${cap.peggio} ≤ ${MACCHINE}${cap.unica ? ' con almeno 1 posto ancora libero' : ''}`);
/* braccio rosso interno, sempre giocato: gli stessi tetti col gruppo per ramo del giro 317 sforano se il trenino e' alzato */
{ const vecchio = capienza('concurrency:\n  group: treno-guardiani-${{ github.ref }}\n  cancel-in-progress: true\n', tG, tT);
  ok(tT <= 4 || (!vecchio.unica && vecchio.peggio > MACCHINE), `braccio rosso interno: col gruppo per ramo del giro 317 i tetti ${tG}/${tT} farebbero ${vecchio.peggio} macchine (${vecchio.peggio > MACCHINE ? 'oltre le 20: serve la concorrenza unica' : 'nelle 20'})`); }
let pianoVero = null;
try { pianoVero = JSON.parse(execFileSync('node', ['ci-treno-308.mjs', 'piano'], { cwd: QUI, encoding: 'utf8', env: { ...process.env, CPM_TRENO_ELENCO: '', CPM_TRENO_TIPO: 'mappa', GITHUB_OUTPUT: '', GITHUB_STEP_SUMMARY: '' }, stdio: ['ignore', 'pipe', 'ignore'] })); } catch (e) { }
ok(!!pianoVero, 'piano della mappa intera calcolato');
if (pianoVero) {
  const N = pianoVero.matrice.include.length, P = NO ? Math.min(N, MACCHINE) : pianoVero.paralleli;
  ok(!NO && P <= tG && P >= 1, `mappa intera: ${N} parti, ${P} alla volta`);
  const onde = Math.ceil(N / P), onde20 = Math.ceil(N / MACCHINE);
  console.log(`   ondate: ${onde} col tetto, ${onde20} con tutte le 20 macchine ${onde > onde20 ? '(⚠️ il treno si allunga)' : '(il treno non si allunga)'}`);
  /* D. coda simulata: parti in ordine di matrice, tutte avviate a t=0 fino al tetto; un deploy arriva a t=60 s */
  console.log('\n== D. coda simulata del deploy sul piano vero (prima/dopo) ==');
  const attesa = tetto => { const fine = pianoVero.matrice.include.slice(0, Math.min(N, tetto)).map(p => p.attesi_s * 1.7 /* runner 1,7 volte il banco (giro 303) */).sort((a, b) => a - b);
    const occupate = Math.min(N, tetto) + 1 /* passo di servizio */; return occupate < MACCHINE ? 0 : Math.max(0, fine[0] - 60); };
  const prima = attesa(MACCHINE), dopo = attesa(P);
  console.log(`   senza tetto: ${Math.round(prima)} s di coda · col tetto ${P}: ${Math.round(dopo)} s (misurati il 22/11 senza tetto: 3.080 e 3.886 s)`);
  ok(dopo === 0, `col tetto il deploy trova una macchina libera subito (attesa simulata ${Math.round(dopo)} s)`);
}

/* ------------------------------------------------ E. [giro 327, decisione PO 22/11] il gate pesante parte solo a mano */
{ console.log('\n== E. «Validate Situations» solo a mano (giro 327) ==');
  const VS = leggi('.github/workflows/validate-situations.yml');
  const r = VS.split('\n'), a = r.findIndex(l => /^on:\s*$/.test(l)); const z = r.findIndex((l, i) => i > a && /^\S/.test(l));
  const ev = a < 0 ? [] : r.slice(a + 1, z < 0 ? undefined : z).filter(l => /^  [a-z_]+:/.test(l)).map(l => l.trim().split(':')[0]);
  ok(ev.length === 1 && ev[0] === 'workflow_dispatch', `eventi di validate-situations.yml: ${JSON.stringify(ev)} (atteso solo workflow_dispatch: niente push, niente pull_request)`); }

console.log(`\n${fall ? '❌ ROSSO' : '✅ VERDE'} — deploy-326: ${fall} controlli falliti${NO ? ' (braccio rosso: atteso ROSSO)' : ''}`);
process.exit(fall ? 1 : 0);
