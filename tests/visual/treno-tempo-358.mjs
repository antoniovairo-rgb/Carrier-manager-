#!/usr/bin/env node
/* [giro 358] GUARDIANO STATICO «UN GUARDIANO SOLO NON FA ANNULLARE LA CORSA PER TEMPO». Niente browser, niente rete.
   Fatto (corsa 45509361966, trenino su lavoro/201 cfbb7729): la «parte 01 di 8 (1 guardiani, ~100 min)», col solo highlight-95,
   e' arrivata al timeout di 120 min del job ed e' stata annullata: niente riepilogo della parte, highlight-95 «parte mancante», corsa
   «cancelled», rilascio della 7.999.211 fermo. Cinque difese, ognuna misurata qui:

   A. PIANO: nessuna parte supera l'obiettivo (4.200 s) se non contiene un solo guardiano NON spezzabile; highlight-95 entra come due
      pezzi (highlight-95@verde, highlight-95@rosso) in due parti diverse, ognuno sotto l'obiettivo.
   B. ARRESTO: un guardiano che sfora il bilancio e lascia un nipote fuori dal suo gruppo di processi che tiene aperta l'uscita (il
      caso in cui 'close' non arriva mai) si chiude lo stesso come «tetto» entro bilancio + 70 s.
   C. SCADENZA DEL JOB: con CPM_JOB_T0/CPM_JOB_TIMEOUT_MIN il guardiano si ferma prima del timeout del job anche se il bilancio della
      parte (6.600 s) non e' finito.
   D. RIEPILOGO PROGRESSIVO: se il passo viene ucciso da fuori a meta', riepilogo.json c'e' gia' e dichiara il guardiano in corso
      «tetto» e i successivi «non partiti».
   E. RICOMPOSIZIONE: il riepilogo totale rimette insieme i pezzi (per_guardiano['highlight-95'], nessuna chiave con «@»): verde solo
      se tutti i pezzi sono verdi, un pezzo mancante = non giudicato, un pezzo rosso = rosso (e quindi rosso nuovo o noto come prima).
   F. WORKFLOW: timeout del job = CPM_JOB_TIMEOUT_MIN, passo «Inizio del job» prima del checkout, passo dei guardiani con un suo
      timeout minore di quello del job, caricamento con if: always().

   Rosso: CPM_NO_G358=1 esegue gli stessi controlli sul piano e sul workflow della base del giro (cfbb7729, CPM_G358_BASE) e DEVE
   uscire rosso.   npm run treno-tempo-358   (~3 min: B e C aspettano gli arresti veri, il bilancio minimo e' 60 s)
   Uso interno: `node treno-tempo-358.mjs finto` e' il guardiano finto (script npm finto-358) che non finisce mai. */
import fs from 'node:fs'; import path from 'node:path'; import os from 'node:os';
import { spawn, execFileSync } from 'node:child_process';
const QUI = path.dirname(new URL(import.meta.url).pathname), ROOT = path.resolve(QUI, '../..');

if (process.argv[2] === 'finto') {
  /* guardiano finto: con CPM_G358_NIPOTE=1 lascia un nipote in un gruppo suo (setsid) che eredita l'uscita, poi non finisce mai */
  if (process.env.CPM_G358_NIPOTE === '1') { const n = spawn('sleep', ['150'], { detached: true, stdio: ['ignore', 'inherit', 'inherit'] }); n.unref();
    if (process.env.CPM_G358_PIDS) fs.appendFileSync(process.env.CPM_G358_PIDS, n.pid + '\n'); }
  console.log('finto-358: parto e non finisco'); setInterval(() => {}, 1e6);
} else {
  const NO = process.env.CPM_NO_G358 === '1', BASE = process.env.CPM_G358_BASE || 'cfbb772';
  const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'g358-'));
  const PIDS = path.join(TMP, 'pids'); fs.writeFileSync(PIDS, '');
  let TRENO = path.join(QUI, 'ci-treno-308.mjs'), copia = null;
  const leggi = rel => NO ? execFileSync('git', ['show', `${BASE}:${rel}`], { cwd: ROOT, encoding: 'utf8' }) : fs.readFileSync(path.join(ROOT, rel), 'utf8');
  if (NO) { copia = path.join(QUI, '.ci-treno-308-base358.mjs'); fs.writeFileSync(copia, leggi('tests/visual/ci-treno-308.mjs')); TRENO = copia;
    console.log(`(CPM_NO_G358=1: piano e workflow della base ${BASE} — il guardiano deve uscire rosso)`); }
  let fall = 0; const ok = (c, m) => { console.log(`${c ? '✅' : '❌'} ${m}`); if (!c) fall++; };
  const env0 = { ...process.env }; for (const k of Object.keys(env0)) if (/^(CPM_TRENO_|CPM_JOB_|GITHUB_|CPM_PARTE)/.test(k)) delete env0[k];
  const corri = (args, env, maxMs, uccidiDopo) => new Promise(res => { const t0 = Date.now();
    const ch = spawn(process.execPath, [TRENO, ...args], { cwd: QUI, env: { ...env0, ...env }, detached: true, stdio: ['ignore', 'pipe', 'pipe'] }); let out = '';
    ch.stdout.on('data', d => { out += d; }); ch.stderr.on('data', d => { out += d; });
    let fatto = false; const fine = (code, scaduto) => { if (fatto) return; fatto = true; clearTimeout(t1); clearTimeout(t2); try { process.kill(-ch.pid, 'SIGKILL'); } catch {} try { ch.stdout.destroy(); ch.stderr.destroy(); } catch {}
      res({ code, scaduto, s: (Date.now() - t0) / 1000, out }); };
    const t1 = setTimeout(() => fine(null, true), maxMs);
    const t2 = uccidiDopo ? setTimeout(() => { try { process.kill(-ch.pid, 'SIGKILL'); } catch {} fine(null, false); }, uccidiDopo) : null;
    ch.on('exit', code => setTimeout(() => fine(code, false), 3000)); });
  const leggiJ = f => { try { return JSON.parse(fs.readFileSync(f, 'utf8')); } catch { return null; } };

  try {
    console.log('\n== A. piano: nessuna parte oltre l\'obiettivo per un guardiano spezzabile ==');
    const go = path.join(TMP, 'out-piano');
    const pa = await corri(['piano'], { CPM_TRENO_ELENCO: 'highlight-95 tema-unico deploy-326', GITHUB_OUTPUT: go }, 30000);
    const riga = (fs.existsSync(go) ? fs.readFileSync(go, 'utf8') : '').split('\n').find(l => l.startsWith('matrice='));
    const M = riga ? JSON.parse(riga.slice(8)).include : [];
    const OB = 4200; const g = M.flatMap(p => p.guardiani.split(' '));
    console.log('   ' + M.map(p => `${p.nome}: ${p.guardiani}`).join(' · '));
    ok(g.includes('highlight-95@verde') && g.includes('highlight-95@rosso') && !g.includes('highlight-95'), 'highlight-95 entra come due pezzi (verde, rosso)');
    const pv = M.find(p => p.guardiani.split(' ').includes('highlight-95@verde')), pr = M.find(p => p.guardiani.split(' ').includes('highlight-95@rosso'));
    ok(pv && pr && pv.parte !== pr.parte, 'i due pezzi stanno in parti diverse');
    ok(M.length > 0 && M.every(p => p.attesi_s <= OB), `ogni parte sta nell'obiettivo (${OB} s): ${M.map(p => p.attesi_s).join(', ')}`);
    /* ogni voce di DURATE oltre l'obiettivo deve essere spezzabile, e ogni suo pezzo stare nell'obiettivo */
    const D = JSON.parse(fs.readFileSync(path.join(ROOT, 'docs/governo/DURATE-GUARDIANI.json'), 'utf8')).voci;
    const lunghi = Object.entries(D).filter(([, v]) => v.s > OB).map(([k]) => k);
    const go2 = path.join(TMP, 'out-piano2'); await corri(['piano'], { CPM_TRENO_ELENCO: lunghi.join(' ') || 'tema-unico', GITHUB_OUTPUT: go2 }, 30000);
    const r2 = (fs.existsSync(go2) ? fs.readFileSync(go2, 'utf8') : '').split('\n').find(l => l.startsWith('matrice='));
    const M2 = r2 ? JSON.parse(r2.slice(8)).include : [];
    const voci2 = M2.map(p => `${p.guardiani} ${p.attesi_s} s`);
    ok(M2.length > 0 && M2.every(p => p.attesi_s <= OB) && !M2.some(p => lunghi.includes(p.guardiani)), `ogni guardiano di DURATE oltre l'obiettivo (${lunghi.join(', ') || 'nessuno'}) e' spezzato e ogni pezzo ci sta: ${voci2.join(' · ')}`);

    console.log('\n== B. arresto al bilancio con un nipote che tiene aperta l\'uscita ==');
    const oB = path.join(TMP, 'parte-B');
    const rB = await corri(['esegui', 'finto-358'], { CPM_PARTE_OUT: oB, CPM_TRENO_BILANCIO_S: '62', CPM_G358_NIPOTE: '1', CPM_G358_PIDS: PIDS }, 160000);
    const jB = leggiJ(path.join(oB, 'riepilogo.json')), xB = jB && !jB.parziale && jB.passi[0];
    console.log(`   esegui ${rB.scaduto ? 'NON finito' : 'finito'} dopo ${rB.s.toFixed(0)} s · passo ${xB ? xB.esito : '-'}`);
    ok(!rB.scaduto && rB.code === 0 && rB.s >= 55 && rB.s <= 62 + 70, 'la parte si chiude da sola entro bilancio + 70 s');
    ok(xB && xB.esito === 'tetto' && !xB.ok, 'il guardiano fermato e\' «tetto» (non giudicato) nel riepilogo finale');

    console.log('\n== C. scadenza del job prima del bilancio della parte ==');
    const oC = path.join(TMP, 'parte-C');
    const rC = await corri(['esegui', 'finto-358'], { CPM_PARTE_OUT: oC, CPM_TRENO_BILANCIO_S: '6600', CPM_JOB_T0: String(Math.floor(Date.now() / 1000)), CPM_JOB_TIMEOUT_MIN: '2', CPM_TRENO_MARGINE_S: '55' }, 110000);
    const jC = leggiJ(path.join(oC, 'riepilogo.json')), xC = jC && !jC.parziale && jC.passi[0];
    console.log(`   esegui ${rC.scaduto ? 'NON finito' : 'finito'} dopo ${rC.s.toFixed(0)} s · passo ${xC ? xC.esito : '-'}`);
    ok(!rC.scaduto && xC && xC.esito === 'tetto', 'con 65 s alla scadenza del job (bilancio 6.600 s) il guardiano si ferma come «tetto»');

    console.log('\n== D. passo ucciso da fuori: il riepilogo c\'e\' gia\' ==');
    const oD = path.join(TMP, 'parte-D');
    await corri(['esegui', 'finto-358 tema-unico'], { CPM_PARTE_OUT: oD, CPM_PARTE: 'parte 09 di 9 (prova 358)' }, 30000, 5000);
    const jD = leggiJ(path.join(oD, 'riepilogo.json'));
    console.log(`   riepilogo ${jD ? JSON.stringify(jD.passi.map(x => x.guardiano + ':' + x.esito)) : 'assente'}`);
    ok(jD && jD.parte === 'parte 09 di 9 (prova 358)' && jD.passi.length === 2 && jD.passi[0].esito === 'tetto' && jD.passi[1].esito === 'non_partito', 'riepilogo progressivo: in corso «tetto», dopo «non partito»');

    console.log('\n== E. ricomposizione dei pezzi nel riepilogo totale ==');
    const caso = async (nome, parti, matr) => { const d = path.join(TMP, 'E-' + nome); fs.mkdirSync(d, { recursive: true });
      parti.forEach((r, i) => { fs.mkdirSync(path.join(d, 'p' + i), { recursive: true }); fs.writeFileSync(path.join(d, 'p' + i, 'riepilogo.json'), JSON.stringify(r)); });
      await corri(['riunisci', d], { CPM_TRENO_MATRICE: JSON.stringify({ include: matr }), CPM_NO_G330: '1' }, 30000);
      return leggiJ(path.join(d, 'esito-treno.json')); };
    const parte = (nome, passi) => ({ parte: nome, inizio: '2026-11-25T00:00:00Z', fine: '2026-11-25T00:50:00Z', passi });
    const pV = parte('parte 01 di 2', [{ guardiano: 'highlight-95@verde', ok: true, esito: 'verde', uscita: 0, s: 3000 }]);
    const pR = parte('parte 02 di 2', [{ guardiano: 'highlight-95@rosso', ok: true, esito: 'verde', uscita: 0, s: 3100 }, { guardiano: 'tema-unico', ok: true, esito: 'verde', uscita: 0, s: 20 }]);
    const mat = [{ parte: 1, nome: 'parte 01 di 2', guardiani: 'highlight-95@verde' }, { parte: 2, nome: 'parte 02 di 2', guardiani: 'highlight-95@rosso tema-unico' }];
    const e1 = await caso('verdi', [pV, pR], mat), e2 = await caso('manca', [pV], mat);
    const e3 = await caso('rosso', [pV, parte('parte 02 di 2', [{ guardiano: 'highlight-95@rosso', ok: false, esito: 'rosso', uscita: 1, s: 3100, coda: 'rosso: D3 non si vede' }, { guardiano: 'tema-unico', ok: true, esito: 'verde', uscita: 0, s: 20 }])], mat);
    const pg = e => e && e.per_guardiano ? e.per_guardiano : {};
    console.log(`   tutti verdi → ${JSON.stringify(pg(e1)['highlight-95'] || null)} · un pezzo mancante → ${JSON.stringify(pg(e2)['highlight-95'] || null)} · un pezzo rosso → ${JSON.stringify(pg(e3)['highlight-95'] || null)}`);
    ok(e1 && pg(e1)['highlight-95'] && pg(e1)['highlight-95'].classe === 'verde' && !Object.keys(pg(e1)).some(k => k.includes('@')) && e1.verdi === 2, 'due pezzi verdi = highlight-95 verde, nessun nome con «@» nell\'esito');
    ok(e2 && pg(e2)['highlight-95'] && pg(e2)['highlight-95'].classe === 'non_giudicato' && (e2.non_giudicati || []).includes('highlight-95'), 'un pezzo mancante = highlight-95 non giudicato (rilascio fermo)');
    ok(e3 && pg(e3)['highlight-95'] && /^rosso_/.test(pg(e3)['highlight-95'].classe), 'un pezzo rosso = highlight-95 rosso');

    console.log('\n== F. workflow ==');
    const wf = leggi('.github/workflows/verifica-guardiani.yml');
    const job = wf.slice(wf.indexOf('\n  guardiani:'), wf.indexOf('\n  riepilogo:') > 0 ? wf.indexOf('\n  riepilogo:') : undefined);
    const tj = +((/\n    timeout-minutes: (\d+)/.exec(job) || [])[1]), te = +((/CPM_JOB_TIMEOUT_MIN: '(\d+)'/.exec(job) || [])[1]);
    const ts = +((/name: Guardiani di questa parte[^\n]*\n\s+timeout-minutes: (\d+)/.exec(job) || [])[1]);
    const iT0 = job.indexOf('CPM_JOB_T0=$(date +%s)'), iCo = job.indexOf('actions/checkout');
    ok(tj > 0 && tj === te, `timeout del job (${tj}) = CPM_JOB_TIMEOUT_MIN (${te})`);
    ok(iT0 > 0 && iT0 < iCo, 'CPM_JOB_T0 scritto prima del checkout');
    ok(ts > 0 && ts <= tj - 5, `il passo dei guardiani ha un suo timeout (${ts}) almeno 5 min sotto quello del job (${tj})`);
    ok(/name: Uscita come artifact\n\s+(id: \w+\n\s+)?if: always\(\)/.test(job), 'il caricamento della parte gira sempre (if: always())');
  } finally {
    for (const p of fs.readFileSync(PIDS, 'utf8').split('\n').filter(Boolean)) { try { process.kill(+p, 'SIGKILL'); } catch {} }
    if (copia) try { fs.unlinkSync(copia); } catch {}
    fs.rmSync(TMP, { recursive: true, force: true });
  }
  console.log(fall ? `\n❌ treno-tempo-358: ${fall} controlli rossi${NO ? ' (atteso: base senza le difese del giro 358)' : ''}` : '\n✅ treno-tempo-358: un guardiano solo non fa piu\' annullare la corsa per tempo');
  process.exit(fall ? 1 : 0);
}
