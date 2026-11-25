#!/usr/bin/env node
/* [giro 359, PO-630 riaperta il 25/11] GUARDIANO DELLA SVEGLIA DELLA NOTTE. Niente browser; la rete e' un GitHub finto su 127.0.0.1.

   Misura (rapporto docs/sviluppo/RAPPORTO-giro359.md): una sola corsa «schedule» del custode in quattro finestre utili, e fuori orario.
   Il treno grande non puo' dipendere solo dal cron. La seconda rete e' la fine di un treno o di un deploy (eventi che ci sono ogni sera).
   A. WORKFLOW: treno-notte-330.yml si sveglia anche con workflow_run (fine di «Treno — …» e «Deploy to GitHub Pages», nomi VERI dei
      due workflow); il job sveglia ha concorrenza propria (mai treno-guardiani, mai custode-notte), timeout che copre la sera, e gira
      solo su workflow_run; il custode non gira su workflow_run; un custode avviato con notte=true finisce alle 05:47 e scrive l'esito.
   B. DECISIONE (sveglia()): giorno → niente · sera → dorme fino alle 01:09 · notte senza custode → avvia · notte coperta (record,
      custode vivo, un'altra sveglia che dorme) → niente · un custode annullato non copre · dopo le 05:47 e' gia' la sera dopo.
   C. PAGINA: «partito in ritardo» (record scritto dopo le 02:43) · «in ritardo» (nessun esito dopo le 02:43, notte non finita);
      partito/non partito/in attesa come prima.
   D. SVEGLIA VERA contro un GitHub finto, orologio finto: di sera dorme e alle 01:09 avvia il custode (un solo dispatch, notte=true) ·
      se nel frattempo il cron ha fatto partire il custode, non avvia nulla · di giorno non avvia nulla.
   E. RIGA DELLA MAPPA: i file del giro stanno nella riga della macchina del treno, che gioca notte-359.
   Rosso: CPM_NO_G359=1 = giro 333 (solo il cron; workflow e mappa letti dalla base CPM_G359_BASE) e il guardiano DEVE uscire rosso.
   npm run notte-359   (≈ 10 s) */
import fs from 'node:fs'; import path from 'node:path'; import os from 'node:os'; import http from 'node:http';
import { spawn, execFileSync } from 'node:child_process';
const QUI = path.dirname(new URL(import.meta.url).pathname), ROOT = path.resolve(QUI, '../..');
const NO = process.env.CPM_NO_G359 === '1', BASE = process.env.CPM_G359_BASE || 'db4da95';
let fall = 0; const ok = (c, m) => { console.log(`${c ? '✅' : '❌'} ${m}`); if (!c) fall++; };
if (NO) console.log(`(CPM_NO_G359=1: sveglia spenta, file letti da ${BASE} — il guardiano deve uscire rosso)`);
const leggi = rel => { if (!NO) { try { return fs.readFileSync(path.join(ROOT, rel), 'utf8'); } catch { return ''; } }
  try { return execFileSync('git', ['show', `${BASE}:${rel}`], { cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }); } catch { return ''; } };
const S = await import(path.join(ROOT, 'tools/sveglia-359.mjs'));
const N = await import(path.join(ROOT, 'tools/notte-333.mjs'));
const T = await import(path.join(ROOT, 'tools/trenino-317.mjs'));
const pkg = JSON.parse(fs.readFileSync(path.join(QUI, 'package.json'), 'utf8'));
const nomeWf = f => (leggi(`.github/workflows/${f}`).match(/^name:\s*(.+)$/m) || [])[1]?.trim().replace(/^['"]|['"]$/g, '') || '';

/* ------------------------------------------------ A. workflow */
console.log('\n== A. il custode si sveglia anche alla fine di un treno o di un deploy ==');
{ const CU = leggi('.github/workflows/treno-notte-330.yml');
  const on = (CU.match(/^on:\n([\s\S]*?)^\S/m) || [])[1] || '';
  const wr = (on.match(/workflow_run:\n\s+workflows: \[([^\]]*)\]\n\s+types: \[completed\]/) || [])[1] || '';
  const nomi = [...wr.matchAll(/'([^']+)'/g)].map(m => m[1]);
  const veri = [nomeWf('verifica-guardiani.yml'), nomeWf('deploy-pages.yml')];
  ok(nomi.length === 2 && veri.every(v => v && nomi.includes(v)), `workflow_run su ${nomi.length ? nomi.join(' · ') : 'NESSUN WORKFLOW'} (nomi veri: ${veri.join(' · ')})`);
  ok(/inputs:\n\s+notte:\n[\s\S]*?type: boolean/.test(on), 'workflow_dispatch con l\'ingresso notte (boolean)');
  const job = n => (CU.match(new RegExp(`^  ${n}:\\n([\\s\\S]*?)(?=^  \\S|(?![\\s\\S]))`, 'm')) || [])[1] || '';
  const sv = job('sveglia'), cu = job('custode');
  ok(/if: github\.event_name == 'workflow_run'/.test(sv) && [...sv.matchAll(/group: (\S+)/g)].map(m => m[1]).join() === 'sveglia-notte', 'job sveglia: solo su workflow_run, concorrenza propria (fuori da treno-guardiani e custode-notte)');
  const to = +(sv.match(/timeout-minutes: (\d+)/) || [])[1] || 0;
  ok(to >= 280 && to < 360 && /tools\/sveglia-359\.mjs sveglia/.test(sv), `job sveglia: timeout ${to} min (copre 20:30 → 01:09 = 279 min, sotto il tetto di 360) e logica sveglia-359`);
  ok(/if: github\.event_name != 'workflow_run'/.test(cu) && /group: custode-notte/.test(cu), 'job custode: non gira su workflow_run, concorrenza custode-notte sul job');
  ok(/CPM_ENTRO_SVEGLIA359: \$\{\{ inputs\.notte && '05:47' \|\| '' \}\}/.test(cu) && /always\(\) && inputs\.notte/.test(cu), 'custode avviato dalla sveglia: notte che finisce alle 05:47 ed esito scritto su main');
  ok(!/secrets\./.test(CU) && /actions: write/.test(CU), 'nessun segreto: basta il GITHUB_TOKEN con actions: write');
  const src = leggi('tools/custode-notte-330.mjs');
  ok(/CPM_ENTRO_SVEGLIA359/.test(src), 'il custode legge CPM_ENTRO_SVEGLIA359');
}

/* ------------------------------------------------ B. decisione */
console.log('\n== B. la sveglia decide: giorno niente · sera dorme · notte senza custode avvia ==');
{ const at = s => s.length === 5 ? '2026-11-24T' + s + ':00Z' : s;
  const bot = { login: 'github-actions[bot]' };
  const d = (s, runs = [], rec = null, mio = 9) => S.sveglia({ adesso: at(s), runs, rec, mio });
  const a = d('14:00'), b = d('22:15'), c = d('02:00'), e = d('06:10');
  ok(a.azione === 'niente', `14:00 UTC: ${a.azione} (${a.perche})`);
  ok(b.azione === 'dormi' && b.notte === '2026-11-25' && new Date(b.fino).toISOString() === '2026-11-25T01:09:00.000Z', `22:15 UTC: ${b.azione} fino a ${b.fino ? new Date(b.fino).toISOString() : '-'} per la notte ${b.notte}`);
  ok(c.azione === 'avvia' && c.notte === '2026-11-24', `02:00 UTC senza custode: ${c.azione} (notte ${c.notte})`);
  ok(e.azione === 'niente', `06:10 UTC (notte finita): ${e.azione}`);
  const cron = [{ id: 5, event: 'schedule', status: 'in_progress', created_at: '2026-11-24T01:20:00Z' }];
  ok(d('02:00', cron).azione === 'niente', 'notte con il custode del cron vivo: niente');
  const sv = [{ id: 6, event: 'workflow_dispatch', status: 'completed', conclusion: 'success', created_at: '2026-11-24T01:09:30Z', triggering_actor: bot }];
  ok(d('03:30', sv).azione === 'niente', 'notte con un custode gia\' avviato da una sveglia: niente (nessun doppione)');
  const ann = [{ id: 7, event: 'workflow_dispatch', status: 'completed', conclusion: 'cancelled', created_at: '2026-11-24T01:09:30Z', triggering_actor: bot }];
  ok(d('03:30', ann).azione === 'avvia', 'un custode annullato non copre la notte: avvia');
  const vecchio = [{ id: 8, event: 'schedule', status: 'completed', conclusion: 'success', created_at: '2026-11-23T10:49:03Z' }];
  ok(d('02:00', vecchio).azione === 'avvia', 'la corsa fuori orario del giorno prima (10:49) non copre stanotte');
  ok(d('02:00', [], { notte: '2026-11-24', esito: 'partito' }).azione === 'niente' && d('02:00', [], { notte: '2026-11-23', esito: 'partito' }).azione === 'avvia', 'registro «partito» di stanotte copre, quello della notte prima no');
  const dorme = [{ id: 10, event: 'workflow_run', status: 'in_progress', created_at: '2026-11-24T21:00:00Z' }];
  ok(d('22:15', dorme).azione === 'niente' && d('22:15', dorme, null, 10).azione === 'dormi', 'un\'altra sveglia che dorme: niente (se stessa non conta)');
  ok(d('20:29').azione === 'niente' && d('20:31').azione === 'dormi', `limite della sera alle ${S.SERA} UTC`);
}

/* ------------------------------------------------ C. pagina */
console.log('\n== C. la pagina dice partito / in ritardo / non partito ==');
{ const at = s => '2026-11-24T' + s + ':00Z', st = (r, s) => N.statoNotte(r, at(s)) || { esito: 'NESSUNO', testo: '' };
  const rec = scritto => ({ notte: '2026-11-24', esito: 'partito', treno: 77, scritto: at(scritto) });
  const a = st(rec('01:30'), '09:00'), b = st(rec('03:40'), '09:00'), c = st(null, '03:00'), d = st(null, '02:30'), e = st(null, '09:00');
  ok(a.esito === 'partito', `partito alle 01:30: ${a.testo}`);
  ok(b.esito === 'in_ritardo' && /partito in ritardo — alle 03:40 UTC/.test(b.testo), `partito alle 03:40: ${b.testo || b.esito}`);
  ok(c.esito === 'in_ritardo' && /in ritardo/.test(c.testo), `nessun esito alle 03:00: ${c.testo || c.esito}`);
  ok(d.esito === 'in_attesa' && e.esito === 'non_partito', `nessun esito alle 02:30: ${d.esito} · alle 09:00: ${e.esito}`);
}

/* ------------------------------------------------ D. sveglia vera contro un GitHub finto */
console.log('\n== D. la sveglia vera: dorme, si sveglia alle 01:09 e avvia il custode una volta ==');
async function svegliaFinta({ adesso, scala, cronNelSonno }) {
  const runs = [], chiamate = []; let id = 500;
  const srv = http.createServer((q, s) => {
    let corpo = ''; q.on('data', x => corpo += x); q.on('end', () => {
      if (q.method === 'POST' && /\/actions\/workflows\/treno-notte-330\.yml\/dispatches$/.test(q.url)) { chiamate.push(JSON.parse(corpo || '{}')); s.writeHead(204); return s.end(); }
      if (/\/actions\/workflows\/treno-notte-330\.yml\/runs/.test(q.url)) {
        if (cronNelSonno && chiamate.giri++ >= 1 && !runs.length) runs.push({ id: id++, event: 'schedule', status: 'in_progress', created_at: '2026-11-25T01:08:00Z' });
        s.writeHead(200, { 'Content-Type': 'application/json' }); return s.end(JSON.stringify({ workflow_runs: runs })); }
      if (/\/contents\//.test(q.url)) { s.writeHead(404); return s.end('{}'); }
      s.writeHead(404); s.end('{}');
    });
  });
  chiamate.giri = 0;
  await new Promise(r => srv.listen(0, '127.0.0.1', r));
  const env = { ...process.env, GITHUB_API_URL: `http://127.0.0.1:${srv.address().port}`, GITHUB_REPOSITORY: 'finto/finto', GH_TOKEN: 'finto', GITHUB_STEP_SUMMARY: '', GITHUB_RUN_ID: '9' };
  const p = spawn('node', [path.join(ROOT, 'tools/sveglia-359.mjs'), 'sveglia', '--adesso', adesso, '--scala', String(scala)], { env, stdio: ['ignore', 'pipe', 'pipe'] });
  let log = ''; p.stdout.on('data', x => log += x); p.stderr.on('data', x => log += x);
  const t0 = Date.now();
  const fine = await new Promise(r => { const t = setTimeout(() => { p.kill(); r('tetto'); }, 30000); p.on('exit', c => { clearTimeout(t); r(c); }); });
  srv.close();
  return { fine, chiamate, log, s: (Date.now() - t0) / 1000 };
}
{ /* 22:00 → 01:09 = 189 min; scala 2000 → ~5,7 s veri */
  const a = await svegliaFinta({ adesso: '2026-11-24T22:00:00Z', scala: 2000 });
  ok(a.fine === 0 && a.chiamate.length === 1 && a.chiamate[0]?.inputs?.notte === 'true' && a.s > 3, `sera 22:00: uscita ${a.fine}, avvii del custode ${a.chiamate.length} (notte=${a.chiamate[0]?.inputs?.notte ?? '-'}), sonno ${a.s.toFixed(1)} s veri`);
  const b = await svegliaFinta({ adesso: '2026-11-24T22:00:00Z', scala: 2000, cronNelSonno: true });
  ok(b.fine === 0 && b.chiamate.length === 0, `sera 22:00 e il cron scatta durante il sonno: avvii ${b.chiamate.length} (atteso 0)`);
  const c = await svegliaFinta({ adesso: '2026-11-24T14:00:00Z', scala: 1 });
  ok(c.fine === 0 && c.chiamate.length === 0 && c.s < 10, `giorno 14:00: avvii ${c.chiamate.length}, uscita in ${c.s.toFixed(1)} s`);
  if (fall) console.log(a.log.slice(-500) + '\n' + b.log.slice(-500) + '\n' + c.log.slice(-300));
}

/* ------------------------------------------------ E. riga della mappa */
console.log('\n== E. i file del giro hanno la loro riga ==');
{ const m = T.leggiMappa(leggi('tests/visual/ci-runner.mjs'));
  const nuovi = ['tools/sveglia-359.mjs', 'tests/visual/notte-359.mjs', '.github/workflows/treno-notte-330.yml', 'tools/notte-333.mjs', 'tools/custode-notte-330.mjs'];
  const s = T.scegli({ toccati: nuovi, mappa: m, mappaBase: m, pkg, pkgBase: pkg });
  ok(s.tipo === 'trenino' && s.guardiani.includes('notte-359') && s.guardiani.includes('notte-333') && s.guardiani.includes('treno-330'), `vagone sui file del giro 359: ${s.tipo}${s.scoperti?.length ? ' (non coperti: ' + s.scoperti.join(', ') + ')' : ''}, con notte-359 ${s.guardiani.includes('notte-359')}`);
  ok(!!pkg.scripts['notte-359'], 'script npm notte-359');
}

console.log(`\n${fall ? `❌ ROSSO: ${fall} controlli falliti` : '✅ VERDE'} — notte-359${NO ? ' (CPM_NO_G359=1: atteso ROSSO)' : ''}`);
process.exit(fall ? 1 : 0);
