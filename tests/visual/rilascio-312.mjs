#!/usr/bin/env node
/* [giro 312, PO-600] GUARDIANO DEL RILASCIO AUTOMATICO (tools/rilascio-vagone-312.mjs). Niente browser, niente gioco.

   A. la DECISIONE su esiti finti: rilascia con soli rossi dichiarati; NON rilascia con un rosso nuovo, un non giudicato,
      una parte mancante, la mappa non intera, l'interruttore spento (file o variabile), il ramo mosso, nessuna unione.
   B. il PERCORSO VERO su un remoto finto (clone locale --shared, rami lavoro/prova-312, poc, main): decidi → prepara →
      pubblica. Si giudica cio' che arriva sul remoto: GAME_VERSION +1 con la nota, check-src IDENTICO sul main pubblicato,
      main = poc = tag annotato, lavoro avanzato di un solo commit, ROSSI-DICHIARATI.versione, ULTIMO-RILASCIO.json,
      conflitto in docs/governo risolto col poc. Poi: un rosso nuovo NON tocca il remoto; un ramo mosso dopo la decisione
      fa rifiutare il push atomico (nessun ramo cambia).

   Verde col verde e rosso col rosso: il caso «rosso nuovo» si gioca anche con la guardia spenta (senzaGuardia) e DEVE
   rilasciare, altrimenti il guardiano non guarda niente. Con CPM_NO_G312=1 la guardia e' spenta anche nel braccio verde:
   il guardiano deve uscire ROSSO (braccio da provare: `CPM_NO_G312=1 npm run rilascio-312` → uscita 1).

     npm run rilascio-312            (≈ 20-40 s: un clone --shared, due build-src) */
import fs from 'node:fs'; import path from 'node:path'; import os from 'node:os';
import { execFileSync, spawnSync } from 'node:child_process';
const QUI = path.dirname(new URL(import.meta.url).pathname), ROOT = path.resolve(QUI, '../..');
const T = path.join(ROOT, 'tools/rilascio-vagone-312.mjs');
const R = await import(T);
const NO = process.env.CPM_NO_G312 === '1';
let fall = 0; const ok = (c, m) => { console.log(`${c ? '✅' : '❌'} ${m}`); if (!c) fall++; };

/* ---------------------------------------------------------------- A. decisione */
const SHA = 'a'.repeat(40);
const base = () => ({ commit: SHA, guardiani: 4, verdi: 2, parti_attese: 2, parti_arrivate: 2, mappa_intera: true, rossi_nuovi: [], non_giudicati: [],
  rossi_noti: ['tpose-196'], rossi_noti_runner: ['salti-274'],
  per_guardiano: { a: { classe: 'verde' }, b: { classe: 'verde' }, 'tpose-196': { classe: 'rosso_noto' }, 'salti-274': { classe: 'rosso_noto_runner' } } });
const ctx = (o = {}) => ({ esito: base(), modo: 'auto', ramo: 'lavoro/201', sha: SHA, punta: SHA, interruttore: { attivo: true }, variabile: '', unioni: ['Unione sviluppo/giro312-x in lavoro/201'], senzaGuardia: NO, ...o });
const conEsito = f => { const e = base(); f(e); return e; };
const casi = [
  ['soli rossi dichiarati (noti + noti del runner)', ctx(), true],
  ['un rosso NUOVO', ctx({ esito: conEsito(e => { e.rossi_nuovi = ['difesa-220']; e.per_guardiano['difesa-220'] = { classe: 'rosso_nuovo' }; }) }), false],
  ['un NON GIUDICATO (tetto)', ctx({ esito: conEsito(e => { e.non_giudicati = ['nomi-219']; e.per_guardiano['nomi-219'] = { classe: 'non_giudicato' }; }) }), false],
  ['una parte mancante', ctx({ esito: conEsito(e => { e.parti_arrivate = 1; }) }), false],
  ['esito mancante', ctx({ esito: null }), false],
  ['mappa NON intera (elenco a mano)', ctx({ esito: conEsito(e => { e.mappa_intera = false; }) }), false],
  ['interruttore: file attivo=false', ctx({ interruttore: { attivo: false } }), false],
  ['interruttore: file mancante', ctx({ interruttore: null }), false],
  ['interruttore: variabile «spento»', ctx({ variabile: 'spento' }), false],
  ['ramo mosso dopo il commit provato', ctx({ punta: 'b'.repeat(40) }), false],
  ['esito di un altro commit', ctx({ esito: conEsito(e => { e.commit = 'c'.repeat(40); }) }), false],
  ['ramo non lavoro/**', ctx({ ramo: 'prova/x' }), false],
  ['nessuna unione dal rilascio precedente', ctx({ unioni: [] }), false],
  ['prova: interruttore spento non ferma', ctx({ modo: 'prova', ramo: 'prova-cd/lavoro-312', interruttore: { attivo: false }, esito: conEsito(e => { e.mappa_intera = false; }) }), true],
  ['prova con rosso finto', ctx({ modo: 'prova', ramo: 'prova-cd/lavoro-312', rossoFinto: true }), false],
];
console.log(`\n== A. decisione${NO ? ' (CPM_NO_G312=1: guardia SPENTA)' : ''} ==`);
for (const [n, c, atteso] of casi) { const d = R.decidi(c); ok(d.rilascia === atteso, `${n}: ${d.rilascia ? 'rilascia' : 'fermo'} (atteso ${atteso ? 'rilascia' : 'fermo'})${d.motivi.length ? ' — ' + d.motivi[0] : ''}`); }
/* braccio rosso interno: senza guardia il rosso nuovo PASSA (prova che i casi qui sopra guardano la guardia) */
const rosso = R.decidi({ ...casi[1][1], senzaGuardia: true });
ok(rosso.rilascia === true, `braccio rosso interno: con la guardia spenta il rosso nuovo rilascerebbe (${rosso.rilascia})`);
ok(R.prossimaVersione(['7.999.200', '7.999.199', '7.999.9']) === '7.999.201', 'prossima versione: 7.999.200 → 7.999.201');
ok(R.prossimaVersione(['7.999.200', '7.999.201']) === '7.999.202', 'prossima versione: tag gia\' a 7.999.201 → 7.999.202');
const nota = R.componiNota({ versione: '7.999.201', precedente: '7.999.200', unioni: ['Unione sviluppo/a in lavoro/201', 'Unione */ x\ny in lavoro/201'], corsa: '9' });
ok(!nota.includes('*/') && !nota.includes('\n') && nota.includes('Unione sviluppo/a in lavoro/201'), 'nota su una riga, senza «*/», coi titoli delle unioni');

/* ---------------------------------------------------------------- B. percorso vero su un remoto finto */
console.log('\n== B. percorso vero su un remoto finto ==');
const TMP = fs.mkdtempSync(path.join(process.env.CPM_TMP || os.tmpdir(), 'rilascio-312-'));
const g = (cwd, ...a) => execFileSync('git', a, { cwd, encoding: 'utf8', maxBuffer: 1 << 28, stdio: ['ignore', 'pipe', 'pipe'] }).trim();
const chi = ['-c', 'user.name=prova', '-c', 'user.email=prova@example.invalid'];
const node = (cwd, ...a) => spawnSync('node', [T, ...a, '--cwd', cwd], { cwd, encoding: 'utf8', env: { ...process.env, CPM_RILASCIO_AUTO: '', CPM_CORSA: 'p312', GITHUB_OUTPUT: '', GITHUB_STEP_SUMMARY: '' } });
try {
  const REM = path.join(TMP, 'remoto.git'), W = path.join(TMP, 'lavoro');
  const HEAD = g(ROOT, 'rev-parse', 'HEAD');
  const poc0 = g(ROOT, 'rev-parse', 'origin/poc/marioprada-character-system'), main0 = g(ROOT, 'rev-parse', 'origin/main');
  const lav0 = g(ROOT, 'rev-parse', 'origin/lavoro/200');
  g(TMP, 'init', '-q', '--bare', REM);
  fs.writeFileSync(path.join(REM, 'objects/info/alternates'), path.join(ROOT, '.git/objects') + '\n');
  for (const [r, s] of [['poc/marioprada-character-system', poc0], ['main', main0], ['lavoro/prova-312', lav0]]) g(REM, 'update-ref', `refs/heads/${r}`, s);
  g(TMP, 'clone', '-q', '--shared', REM, W);
  /* poc: interruttore acceso + una modifica in docs/governo che va in conflitto col campo versione del lavoro */
  g(W, 'checkout', '-q', '-B', 'poc', 'origin/poc/marioprada-character-system');
  fs.writeFileSync(path.join(W, R.FILE_INTERRUTTORE), JSON.stringify({ attivo: true }) + '\n');
  const fr = path.join(W, R.FILE_ROSSI), jr = JSON.parse(fs.readFileSync(fr, 'utf8')); jr._ = jr._ + ' (modificato sul poc)'; jr.versione = '7.999.200-poc'; fs.writeFileSync(fr, JSON.stringify(jr, null, 1) + '\n');
  g(W, 'add', '-A'); g(W, ...chi, 'commit', '-q', '-m', 'Governo: interruttore acceso (prova)'); g(W, 'push', '-q', 'origin', 'HEAD:refs/heads/poc/marioprada-character-system');
  const poc1 = g(W, 'rev-parse', 'HEAD');
  /* main resta indietro rispetto al poc (come succede quando il poc ha commit di governo): deve avanzare in fast-forward */
  /* lavoro: unione del ramo di sviluppo, come la fa la sessione madre */
  g(W, 'checkout', '-q', '-B', 'lav', 'origin/lavoro/prova-312');
  g(W, ...chi, 'merge', '-q', '--no-ff', HEAD, '-m', 'Unione sviluppo/giro312-rilascio-automatico in lavoro/prova-312');
  g(W, 'push', '-q', 'origin', 'HEAD:refs/heads/lavoro/prova-312');
  const sha = g(W, 'rev-parse', 'HEAD');
  const esito = f => { const e = { ...base(), commit: sha }; if (f) f(e); const p = path.join(TMP, 'esito.json'); fs.writeFileSync(p, JSON.stringify(e)); return p; };
  const dec = path.join(TMP, 'decisione.json');

  /* B1. rosso nuovo: fermo, remoto intatto */
  const refs = () => g(REM, 'for-each-ref', '--format=%(refname) %(objectname)');
  const prima = refs();
  let x = node(W, 'decidi', '--esito', esito(e => { e.rossi_nuovi = ['difesa-220']; e.per_guardiano['difesa-220'] = { classe: 'rosso_nuovo' }; }), '--modo', 'auto', '--ramo', 'lavoro/prova-312', '--sha', sha, '--uscita', dec);
  let d = JSON.parse(fs.readFileSync(dec, 'utf8'));
  ok(d.rilascia === false, `B1 rosso nuovo: ${d.rilascia ? 'RILASCIA' : 'fermo'} — ${d.motivi.join(' | ') || 'nessun motivo'}`);
  if (!d.rilascia) { x = node(W, 'prepara', '--decisione', dec); ok(x.status !== 0, 'B1 «prepara» rifiuta una decisione di fermo'); }
  ok(refs() === prima, 'B1 remoto intatto');

  /* B2. soli rossi dichiarati: rilascia davvero */
  x = node(W, 'decidi', '--esito', esito(), '--modo', 'auto', '--ramo', 'lavoro/prova-312', '--sha', sha, '--uscita', dec);
  d = JSON.parse(fs.readFileSync(dec, 'utf8'));
  ok(d.rilascia === true && d.versione === '7.999.201', `B2 soli rossi dichiarati: ${d.rilascia ? 'rilascia' : 'fermo'} ${d.versione} — ${d.motivi.join(' | ')}`);
  ok(d.unioni.length === 1 && /giro312/.test(d.nota), `B2 nota dai titoli delle unioni: «${(d.nota || '').slice(0, 120)}…»`);
  x = node(W, 'prepara', '--decisione', dec); ok(x.status === 0, 'B2 prepara' + (x.status ? ': ' + (x.stderr || x.stdout).slice(-400) : ''));
  ok(/docs\/governo\/ROSSI-DICHIARATI\.json/.test(x.stdout), 'B2 conflitto in docs/governo risolto con la versione del poc');
  x = node(W, 'pubblica', '--decisione', dec); ok(x.status === 0, 'B2 pubblica' + (x.status ? ': ' + (x.stderr || '').slice(-400) : ''));
  const rm = r => g(REM, 'rev-parse', r);
  const mainN = rm('refs/heads/main'), pocN = rm('refs/heads/poc/marioprada-character-system'), lavN = rm('refs/heads/lavoro/prova-312');
  ok(mainN === pocN && rm('refs/tags/v7.999.201^{commit}') === pocN, 'B2 main = poc = tag v7.999.201');
  ok(g(REM, 'cat-file', '-t', 'refs/tags/v7.999.201') === 'tag', 'B2 tag annotato (messaggio leggibile senza credenziali)');
  ok(g(REM, 'rev-parse', lavN + '^') === sha && g(REM, 'rev-list', '--count', `${sha}..${lavN}`) === '1', 'B2 lavoro avanzato di UN commit sopra quello provato');
  ok(g(REM, 'rev-parse', pocN + '^1') === poc1 && g(REM, 'rev-parse', pocN + '^2') === lavN, 'B2 poc = unione --no-ff (poc precedente + lavoro)');
  ok(g(REM, 'merge-base', '--is-ancestor', main0, mainN) === '' , 'B2 main avanzato in fast-forward');
  const C = path.join(TMP, 'controllo'); g(TMP, 'clone', '-q', '--shared', '-b', 'main', REM, C);
  ok(R.leggiVersione(fs.readFileSync(path.join(C, 'CARRIER-MANAGER-AV.html'), 'utf8')) === '7.999.201', 'B2 il main pubblicato porta GAME_VERSION 7.999.201 nel gioco');
  const ck = spawnSync('node', ['tools/check-src.mjs'], { cwd: C, encoding: 'utf8' }); ok(ck.status === 0, 'B2 check-src IDENTICO sul main pubblicato');
  const u = JSON.parse(fs.readFileSync(path.join(C, R.FILE_ULTIMO), 'utf8')); ok(u.versione === '7.999.201' && u.tag === 'v7.999.201' && u.commit_provato === sha, 'B2 ULTIMO-RILASCIO.json sul main');
  const rr = JSON.parse(fs.readFileSync(path.join(C, R.FILE_ROSSI), 'utf8')); ok(rr.versione === '7.999.201' && /modificato sul poc/.test(rr._), 'B2 ROSSI-DICHIARATI: versione 7.999.201, resto del poc');
  ok(fs.existsSync(path.join(C, R.FILE_INTERRUTTORE)), 'B2 interruttore del poc conservato');

  /* B3. ramo mosso dopo la decisione: il push atomico deve essere rifiutato e nessun ramo cambia */
  g(W, 'fetch', '-q', 'origin');
  g(W, 'checkout', '-q', '-B', 'svil2', HEAD); fs.writeFileSync(path.join(W, 'bis-312.txt'), 'bis\n'); g(W, 'add', 'bis-312.txt'); g(W, ...chi, 'commit', '-q', '-m', 'giro 312 bis');
  g(W, 'checkout', '-q', '-B', 'lav2', 'origin/lavoro/prova-312');
  g(W, ...chi, 'merge', '-q', '--no-ff', 'svil2', '-m', 'Unione sviluppo/giro312-bis in lavoro/prova-312');
  const sha2 = g(W, 'rev-parse', 'HEAD'); g(W, 'push', '-q', 'origin', 'HEAD:refs/heads/lavoro/prova-312');
  x = node(W, 'decidi', '--esito', (() => { const p = esito(); const e = JSON.parse(fs.readFileSync(p)); e.commit = sha2; fs.writeFileSync(p, JSON.stringify(e)); return p; })(), '--modo', 'auto', '--ramo', 'lavoro/prova-312', '--sha', sha2, '--uscita', dec);
  d = JSON.parse(fs.readFileSync(dec, 'utf8')); ok(d.rilascia === true && d.versione === '7.999.202', `B3 secondo vagone: ${d.versione}`);
  x = node(W, 'prepara', '--decisione', dec); ok(x.status === 0, 'B3 prepara');
  g(W, 'checkout', '-q', '-B', 'intruso', sha2); fs.writeFileSync(path.join(W, 'intruso.txt'), 'x\n'); g(W, 'add', 'intruso.txt'); g(W, ...chi, 'commit', '-q', '-m', 'commit arrivato durante il rilascio');
  g(W, 'push', '-q', 'origin', 'HEAD:refs/heads/lavoro/prova-312');
  const prima3 = refs();
  x = node(W, 'pubblica', '--decisione', dec); ok(x.status !== 0, 'B3 push atomico RIFIUTATO col ramo mosso');
  ok(refs() === prima3, 'B3 nessun ramo e nessun tag cambiato sul remoto');
} catch (err) { ok(false, 'percorso B interrotto: ' + (err.stderr || err.message).toString().slice(-600)); }
finally { try { fs.rmSync(TMP, { recursive: true, force: true }); } catch {} }

console.log(`\n${fall ? `❌ ROSSO: ${fall} controlli falliti` : '✅ VERDE'}${NO ? ' (CPM_NO_G312=1: atteso ROSSO)' : ''}`);
process.exit(fall ? 1 : 0);
