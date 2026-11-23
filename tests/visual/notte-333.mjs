#!/usr/bin/env node
/* [giro 333, PO-630 / PO-631] GUARDIANO DEL TRENO GRANDE DI NOTTE. Niente browser; la rete e' un GitHub finto su 127.0.0.1.

   PO-630: il cron delle 01:07 non ha mai prodotto una corsa «schedule» (prove in docs/sviluppo/RAPPORTO-giro333.md). GitHub dichiara
   che uno schedule puo' essere ritardato e, sotto carico, PERSO: un solo orario non basta.
   A. WORKFLOW: il cron sta solo nel custode (treno-notte-330.yml), con DUE orari, nessuno al minuto 0 o 30; il custode puo' avviare il
      treno (actions: write) e scrivere l'esito su main (giro 338) (contents: write, push senza force, solo per le corse del cron).
   B. SCADENZA ASSOLUTA: la notte finisce alle 05:47 UTC per tutti i custodi (01:07 + 280 min); il custode di riserva delle 02:43 non
      veglia fino alle 07:23; avviato a mano conta solo la scadenza relativa; la scadenza si guarda PRIMA di accodare.
   C. REGISTRO (PO-631): docs/governo/TRENO-NOTTE.json — un esito per notte, un «partito» non si sovrascrive, nessun commit doppio.
   D. STATO PER LA PAGINA: partito / non partito (dal record) / in attesa (prima della scadenza) / non partito (nessun record dopo la
      scadenza = il cron non e' scattato).
   E. PAGINA DI GOVERNO: tools/governo-html.mjs mostra «treno grande di stanotte: non partito» / «partito».
   F. CUSTODE VERO contro un GitHub finto: notte normale = accoda e scrive «partito»; a notte finita = NON accoda e scrive «non_partito».
   G. RIGA DELLA MAPPA: i file nuovi stanno nella riga della macchina del treno, che gioca notte-333.
   Verde col verde, rosso col rosso: CPM_NO_G333=1 = giro 330 (un orario, scadenza solo relativa, nessun registro, pagina muta; workflow,
   custode e mappa letti dalla base CPM_G333_BASE) e il guardiano DEVE uscire rosso.   npm run notte-333   (≈ 20 s) */
import fs from 'node:fs'; import path from 'node:path'; import os from 'node:os'; import http from 'node:http';
import { spawn, spawnSync, execFileSync } from 'node:child_process';
const QUI = path.dirname(new URL(import.meta.url).pathname), ROOT = path.resolve(QUI, '../..');
const NO = process.env.CPM_NO_G333 === '1', BASE = process.env.CPM_G333_BASE || 'd681977';
let fall = 0; const ok = (c, m) => { console.log(`${c ? '✅' : '❌'} ${m}`); if (!c) fall++; };
if (NO) console.log(`(CPM_NO_G333=1: correzioni del giro 333 spente, file letti da ${BASE} — il guardiano deve uscire rosso)`);
const leggi = rel => { if (!NO) { try { return fs.readFileSync(path.join(ROOT, rel), 'utf8'); } catch { return ''; } }
  try { return execFileSync('git', ['show', `${BASE}:${rel}`], { cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }); } catch { return ''; } };
const N = await import(path.join(ROOT, 'tools/notte-333.mjs'));
const T = await import(path.join(ROOT, 'tools/trenino-317.mjs'));
const pkg = JSON.parse(fs.readFileSync(path.join(QUI, 'package.json'), 'utf8'));
const W = fs.mkdtempSync(path.join(os.tmpdir(), 'notte333-'));

/* ------------------------------------------------ A. workflow */
console.log('\n== A. il cron sta nel custode, con due orari fuori dall\'inizio dell\'ora ==');
{ const VG = leggi('.github/workflows/verifica-guardiani.yml'), CU = leggi('.github/workflows/treno-notte-330.yml');
  const onVG = VG.split(/^permissions:/m)[0];
  ok(VG && !/^\s+schedule:/m.test(onVG), `verifica-guardiani.yml senza cron proprio: ${/^\s+schedule:/m.test(onVG) ? 'CRON ANCORA LI\'' : 'nessun schedule'}`);
  const cron = [...CU.matchAll(/^\s+- cron: '([^']+)'/gm)].map(m => m[1]);
  ok(cron.length >= 2 && cron.includes('7 1 * * *'), `custode: ${cron.length} orari (${cron.join(' · ') || 'nessuno'}), atteso 01:07 + almeno una riserva`);
  const affollati = cron.filter(c => /^(0|30) /.test(c));
  ok(cron.length && !affollati.length && cron.every(c => /^\d+ \d+ \* \* \*$/.test(c)), `nessun orario al minuto 0 o 30 (GitHub: «High load times include the start of every hour»): ${affollati.join(', ') || 'nessuno'}`);
  ok(/actions: write/.test(CU) && /contents: write/.test(CU), 'permessi: actions: write (avvia il treno) e contents: write (esito su main)');
  const passo = CU.split('Esito della notte su main')[1] || '';
  ok(passo && /if: always\(\) && github\.event_name == 'schedule'/.test(passo) && /notte-333\.mjs registra/.test(passo) && /git push -q origin "HEAD:refs\/heads\/\$RAMO"/.test(passo) && !/--force|push -f|\+HEAD/.test(passo),
    'passo «Esito della notte su main» (giro 338): solo per il cron, anche se la veglia cade, registra e spinge senza force');
  ok(/--esito \/tmp\/esito-notte\.json/.test(CU) && /CPM_ENTRO_NOTTE: \$\{\{ github\.event_name == 'schedule' && '05:47' \|\| '' \}\}/.test(CU), 'la veglia scrive l\'esito e di notte finisce alle 05:47 UTC');
}

/* ------------------------------------------------ B. scadenza assoluta */
console.log('\n== B. la notte finisce alle 05:47 UTC per tutti i custodi ==');
{ const h = s => Date.parse('2026-11-24T' + s + ':00Z'), ora = ms => new Date(ms).toISOString().slice(11, 16);
  const s1 = N.scadenza({ avvio: h('01:07'), scadenzaMin: 280, entro: '05:47' }), s2 = N.scadenza({ avvio: h('02:43'), scadenzaMin: 280, entro: '05:47' });
  const s3 = N.scadenza({ avvio: h('06:10'), scadenzaMin: 280, entro: '05:47' }), s4 = N.scadenza({ avvio: h('14:00'), scadenzaMin: 280, entro: '' });
  ok(ora(s1) === '05:47', `custode delle 01:07: veglia fino alle ${ora(s1)} (atteso 05:47)`);
  ok(ora(s2) === '05:47', `custode di riserva delle 02:43: veglia fino alle ${ora(s2)} (atteso 05:47, non 07:23)`);
  ok(s3 <= h('06:10'), `custode partito a notte finita (06:10): scadenza ${ora(s3)}, gia' passata`);
  ok(ora(s4) === '18:40', `custode avviato a mano alle 14:00: scadenza relativa ${ora(s4)} (280 min)`);
  ok(N.notteDi(h('00:30')) === '2026-11-23' && N.notteDi(h('01:07')) === '2026-11-24', `notte di un istante: 00:30 → ${N.notteDi(h('00:30'))}, 01:07 → ${N.notteDi(h('01:07'))}`);
  const src = leggi('tools/custode-notte-330.mjs'), iS = src.indexOf('if (Date.now() > scad)'), iA = src.indexOf("if (d.azione === 'accoda')");
  ok(iS > 0 && iA > 0 && iS < iA, `nel custode la scadenza si guarda prima di accodare (${iS < iA ? 'si' : 'NO'})`);
}

/* ------------------------------------------------ C. registro */
console.log('\n== C. docs/governo/TRENO-NOTTE.json: un esito per notte ==');
{ const e = (notte, esito, treno) => ({ notte, esito, perche: 'p', treno });
  const r1 = N.registra(null, e('2026-11-24', 'partito', 11));
  ok(r1 && r1.notte === '2026-11-24' && r1.esito === 'partito' && r1.treno === 11 && r1.storia?.length === 1, `primo record: ${r1 ? r1.esito + ' storia ' + r1.storia.length : 'NESSUNO'}`);
  ok(N.registra(r1, e('2026-11-24', 'non_partito')) === null, 'un «partito» non si sovrascrive con un «non partito» della stessa notte (custode di riserva arrivato tardi)');
  ok(N.registra(N.registra(null, e('2026-11-24', 'non_partito')), e('2026-11-24', 'non_partito')) === null, 'stesso esito nella stessa notte: nessun commit doppio');
  const r4 = N.registra(N.registra(null, e('2026-11-24', 'non_partito')), e('2026-11-24', 'partito', 12));
  ok(r4 && r4.esito === 'partito' && r4.storia.length === 1, `«non partito» poi «partito» nella stessa notte (riserva riuscita): ${r4 ? r4.esito : 'NESSUNO'}`);
  const r5 = N.registra(r1, e('2026-11-25', 'non_partito'));
  ok(r5 && r5.notte === '2026-11-25' && r5.storia.length === 2 && r5.storia[1].notte === '2026-11-24', `notte nuova: storia ${r5 ? r5.storia.map(s => s.notte + ' ' + s.esito).join(' · ') : 'NESSUNA'}`);
  ok(N.FILE_NOTTE === 'docs/governo/TRENO-NOTTE.json', `file del registro: ${N.FILE_NOTTE}`);
}

/* ------------------------------------------------ D. stato per la pagina */
console.log('\n== D. treno grande di stanotte: partito / non partito / in attesa ==');
{ const rec = (notte, esito) => ({ notte, esito, perche: 'non accodato entro le 05:47 UTC — posto in attesa occupato', treno: esito === 'partito' ? 77 : null });
  const at = s => '2026-11-24T' + s + ':00Z', st = (r, s) => N.statoNotte(r, at(s)) || { esito: 'NESSUNO', testo: '' };
  const a = st(rec('2026-11-24', 'partito'), '09:00'), b = st(rec('2026-11-24', 'non_partito'), '09:00');
  const c = st(null, '09:00'), d = st(null, '02:30'), f = st(rec('2026-11-23', 'partito'), '09:00');
  ok(a.esito === 'partito' && /partito — corsa 77/.test(a.testo), `record «partito»: ${a.testo || a.esito}`);
  ok(b.esito === 'non_partito' && /non partito — non accodato/.test(b.testo), `record «non partito»: ${b.testo || b.esito}`);
  ok(c.esito === 'non_partito' && /nessun esito scritto/.test(c.testo), `nessun record alle 09:00 (il cron non e' scattato): ${c.testo || c.esito}`);
  ok(d.esito === 'in_attesa', `nessun record alle 02:30 (custode ancora sveglio): ${d.esito}`);
  ok(f.esito === 'non_partito' && /ultima notte registrata 2026-11-23/.test(f.testo), `record della notte prima: ${f.testo || f.esito}`);
}

/* ------------------------------------------------ E. pagina di governo */
console.log('\n== E. la pagina di governo lo mostra ==');
for (const [esito, atteso] of [['non_partito', /treno grande di stanotte \(2026-11-24\): non partito/], ['partito', /treno grande di stanotte \(2026-11-24\): partito/]]) {
  const fr = path.join(W, `notte-${esito}.json`), out = path.join(W, `governo-${esito}.html`);
  fs.writeFileSync(fr, JSON.stringify({ notte: '2026-11-24', esito, perche: 'non accodato entro le 05:47 UTC', treno: esito === 'partito' ? 77 : null }));
  const r = spawnSync('node', [path.join(ROOT, 'tools/governo-html.mjs')], { cwd: ROOT, encoding: 'utf8', env: { ...process.env, CPM_GOVERNO_OUT: out, CPM_NOTTE_FILE: fr, CPM_ADESSO: '2026-11-24T09:00:00Z' } });
  const html = fs.existsSync(out) ? fs.readFileSync(out, 'utf8') : '';
  const scritto = r.status === 0 && html.length > 0 && !fs.readFileSync(path.join(ROOT, 'docs/governo/governo.html'), 'utf8').includes('notte-' + esito + '.json');
  ok(scritto && atteso.test(html) && /id="notte"/.test(html), `governo-html con record «${esito}»: uscita ${r.status}, ${atteso.test(html) ? 'riga presente' : 'RIGA ASSENTE'} (pagina vera non toccata)`);
}

/* ------------------------------------------------ F. custode vero contro un GitHub finto */
console.log('\n== F. il custode vero: accoda e scrive l\'esito · a notte finita non accoda ==');
async function custodeFinto({ entro, occupato }) {
  const runs = [], chiamate = { dispatch: 0 }; let id = 100;
  if (occupato) runs.push({ id: id++, event: 'push', status: 'queued', created_at: new Date().toISOString(), actor: { login: 'po' } });
  const srv = http.createServer((q, s) => {
    if (q.method === 'POST' && /\/dispatches$/.test(q.url)) { chiamate.dispatch++; runs.unshift({ id: id++, event: 'workflow_dispatch', status: 'in_progress', created_at: new Date().toISOString(), triggering_actor: { login: 'github-actions[bot]' } }); s.writeHead(204); return s.end(); }
    if (/\/actions\/workflows\/verifica-guardiani\.yml\/runs/.test(q.url)) { s.writeHead(200, { 'Content-Type': 'application/json' }); return s.end(JSON.stringify({ workflow_runs: runs })); }
    s.writeHead(404); s.end('{}');
  });
  await new Promise(r => srv.listen(0, '127.0.0.1', r));
  const esito = path.join(W, `esito-${entro || 'mano'}-${occupato ? 'occ' : 'lib'}.json`);
  const env = { ...process.env, GITHUB_API_URL: `http://127.0.0.1:${srv.address().port}`, GITHUB_REPOSITORY: 'finto/finto', GH_TOKEN: 'finto', CPM_ENTRO_NOTTE: entro, GITHUB_STEP_SUMMARY: '', GITHUB_RUN_ID: '' };
  const p = spawn('node', [path.join(ROOT, 'tools/custode-notte-330.mjs'), 'veglia', '--passo-s', '1', '--scadenza-min', '1', '--esito', esito], { env, stdio: ['ignore', 'pipe', 'pipe'] });
  let log = ''; p.stdout.on('data', d => log += d); p.stderr.on('data', d => log += d);
  const fine = await new Promise(r => { const t = setTimeout(() => { p.kill(); r('tetto'); }, 90000); p.on('exit', c => { clearTimeout(t); r(c); }); });
  srv.close();
  let e = null; try { e = JSON.parse(fs.readFileSync(esito, 'utf8')); } catch {}
  return { fine, e, chiamate, log };
}
{ const a = await custodeFinto({ entro: '', occupato: false });
  ok(a.fine === 0 && a.chiamate.dispatch === 1 && a.e?.esito === 'partito', `notte normale: uscita ${a.fine}, avvii ${a.chiamate.dispatch}, esito ${a.e?.esito || 'NON SCRITTO'}`);
  /* '00:00' = scadenza della notte gia' passata a qualunque ora; il posto in attesa e' libero, quindi il giro 330 accoderebbe */
  const b = await custodeFinto({ entro: '00:00', occupato: false });
  ok(b.fine === 0 && b.chiamate.dispatch === 0 && b.e?.esito === 'non_partito', `custode partito a notte finita: uscita ${b.fine}, avvii ${b.chiamate.dispatch} (atteso 0), esito ${b.e?.esito || 'NON SCRITTO'}`);
  if (fall) console.log(a.log.slice(-600) + '\n' + b.log.slice(-600));
}

/* ------------------------------------------------ G. riga della mappa */
console.log('\n== G. i file nuovi hanno la loro riga ==');
{ const m = T.leggiMappa(leggi('tests/visual/ci-runner.mjs'));
  const nuovi = ['tools/notte-333.mjs', 'tools/governo-html.mjs', 'tests/visual/notte-333.mjs', '.github/workflows/treno-notte-330.yml', 'tools/custode-notte-330.mjs'];
  const s = T.scegli({ toccati: nuovi, mappa: m, mappaBase: m, pkg, pkgBase: pkg });
  ok(s.tipo === 'trenino' && s.guardiani.includes('notte-333') && s.guardiani.includes('treno-330'), `vagone sui file del giro 333: ${s.tipo}${s.scoperti?.length ? ' (non coperti: ' + s.scoperti.join(', ') + ')' : ''}, con notte-333 ${s.guardiani.includes('notte-333')}`);
  ok(!!pkg.scripts['notte-333'], 'script npm notte-333');
}

fs.rmSync(W, { recursive: true, force: true });
console.log(`\n${fall ? `❌ ROSSO: ${fall} controlli falliti` : '✅ VERDE'} — notte-333${NO ? ' (CPM_NO_G333=1: atteso ROSSO)' : ''}`);
process.exit(fall ? 1 : 0);
