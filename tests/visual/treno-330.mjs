#!/usr/bin/env node
/* [giro 330, PO-624 resto + PO-626 — decisioni PO 22/11] GUARDIANO DEL TRENO ROBUSTO. Niente browser, niente rete: un GitHub finto.

   A. PO-624 — i risultati delle parti non si perdono piu'. `esegui` stampa il suo riepilogo nel log (righe CPM_PARTE330 + impronta);
      `riunisci` ricostruisce dal log una parte senza artifact e lo dichiara. Si gioca `esegui` vero (su deploy-326, ~2 s) e il suo
      stdout diventa il log finto di una parte. Una parte troncata (job ucciso), con l'impronta sbagliata o col log di un'altra parte
      resta «non giudicata». Il workflow riprova il caricamento dopo un'attesa e il Riepilogo puo' leggere i log (actions: read).
   B. PO-626 a — il treno grande di notte si rimette in coda da solo. Simulatore della concorrenza di GitHub (una in corso, una in
      attesa, la terza scalza quella in attesa) e il custode vero (tools/custode-notte-330.mjs decidi). Il cron sta nel custode.
   C. PO-626 b — margine del 10% prima del treno completo (scegli di tools/trenino-317.mjs, durate sintetiche).
   D. PO-626 c — i 4 guardiani della catena carriera tornano nelle righe (via da SOLO_NOTTE_329).
   E. la macchina nuova (custode, workflow, guardiano, copia della mappa 329) ha la sua riga: un vagone che la tocca e' un trenino.

   Verde col verde, rosso col rosso: CPM_NO_G330=1 spegne le quattro correzioni (riunisci senza log, custode del giro 329, regola
   «basta essere piu' lento», mappa del giro 329) e il guardiano DEVE uscire rosso.   npm run treno-330   (≈ 5 s) */
import fs from 'node:fs'; import path from 'node:path'; import os from 'node:os';
import { spawnSync, execFileSync } from 'node:child_process';
const QUI = path.dirname(new URL(import.meta.url).pathname), ROOT = path.resolve(QUI, '../..');
const NO = process.env.CPM_NO_G330 === '1', BASE = process.env.CPM_G330_BASE || '55a500d5';
let fall = 0; const ok = (c, m) => { console.log(`${c ? '✅' : '❌'} ${m}`); if (!c) fall++; };
if (NO) console.log(`(CPM_NO_G330=1: correzioni del giro 330 spente, workflow letti da ${BASE} — il guardiano deve uscire rosso)`);
const leggi = rel => { if (!NO) return fs.readFileSync(path.join(ROOT, rel), 'utf8'); try { return execFileSync('git', ['show', `${BASE}:${rel}`], { cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }); } catch { return ''; } };
const T = await import(path.join(ROOT, 'tools/trenino-317.mjs'));
const C = await import(path.join(ROOT, 'tools/custode-notte-330.mjs'));
const pkg = JSON.parse(fs.readFileSync(path.join(QUI, 'package.json'), 'utf8'));

/* ------------------------------------------------ A. parti dal log */
console.log('\n== A. PO-624: una parte senza artifact si ricostruisce dal suo log ==');
{ const W = fs.mkdtempSync(path.join(os.tmpdir(), 'treno330-')), ART = path.join(W, 'parti'), LOG = path.join(W, 'log');
  fs.mkdirSync(LOG, { recursive: true });
  const nome = i => `parte 0${i} di 4 (1 guardiani, ~1 min)`, san = n => n.replace(/[^\w.-]/g, '_') + '.log';
  const esegui = (i, g) => { const out = path.join(W, 'out' + i);
    const r = spawnSync('node', ['ci-treno-308.mjs', 'esegui', g], { cwd: QUI, encoding: 'utf8', env: { ...process.env, CPM_PARTE: nome(i), CPM_PARTE_OUT: out, GITHUB_STEP_SUMMARY: '', CPM_NO_G326: '' }, maxBuffer: 1 << 26 });
    /* il log di GitHub: ogni riga con l'ora davanti, piu' righe del runner prima e dopo */
    const log = ['2026-11-22T10:00:00.0000000Z ##[group]Run node ci-treno-308.mjs esegui', ...String(r.stdout).split('\n').map(l => '2026-11-22T10:00:01.1234567Z ' + l), '2026-11-22T10:00:09.0000000Z ##[group]Run actions/upload-artifact@v4'].join('\n');
    return { r, out, log }; };
  const e1 = esegui(1, 'deploy-326'), e2 = esegui(2, 'deploy-326');
  ok(e1.r.status === 0 && fs.existsSync(path.join(e1.out, 'riepilogo.json')), `esegui vero (deploy-326): uscita ${e1.r.status}, riepilogo.json scritto`);
  const righe = e2.log.split('\n').filter(l => /CPM_PARTE330/.test(l));
  ok(righe.length >= 2 && /CPM_PARTE330_FINE [0-9a-f]{64} \d+$/.test(righe.at(-1)), `esegui stampa il riepilogo nel log: ${righe.length} righe CPM_PARTE330 (ultima con l'impronta)`);
  /* parte 1: artifact arrivato · parte 2: SOLO log (il caso del treno 45050383306) · parte 3: job ucciso, log troncato prima della fine
     · parte 4: log con l'impronta che non torna */
  fs.mkdirSync(path.join(ART, 'guardiani-parte-1/ci-parte'), { recursive: true });
  fs.copyFileSync(path.join(e1.out, 'riepilogo.json'), path.join(ART, 'guardiani-parte-1/ci-parte/riepilogo.json'));
  fs.writeFileSync(path.join(LOG, san(nome(2))), e2.log);
  const e3 = e2.log.split('\n').filter(l => !/CPM_PARTE330/.test(l)).join('\n').replaceAll(nome(2), nome(3));
  fs.writeFileSync(path.join(LOG, san(nome(3))), e3 + '\n2026-11-22T10:00:05Z ##[error]The operation was canceled.');
  const e4 = e2.log.replace(/(CPM_PARTE330 1\/\d+ )([A-Za-z0-9+/]{8})/, (m, a, b) => a + b.split('').reverse().join(''));
  fs.writeFileSync(path.join(LOG, san(nome(4))), e4);
  const matrice = { include: [1, 2, 3, 4].map(i => ({ parte: i, nome: nome(i), guardiani: 'deploy-326', attesi_s: 60 })) };
  const r = spawnSync('node', ['ci-treno-308.mjs', 'riunisci', ART], { cwd: QUI, encoding: 'utf8', env: { ...process.env, CPM_TRENO_MATRICE: JSON.stringify(matrice), CPM_TRENO_LOG_DIR: LOG, CPM_TRENO_TIPO: 'mappa', GITHUB_STEP_SUMMARY: '', GH_TOKEN: '', GITHUB_TOKEN: '' } });
  let es = null; try { es = JSON.parse(fs.readFileSync(path.join(ART, 'esito-treno.json'), 'utf8')); } catch {}
  const pass = es ? JSON.parse(fs.readFileSync(path.join(ART, 'riepilogo-totale.json'), 'utf8')).passi : [];
  const di = i => pass.find(x => x.parte === nome(i)) || {};
  ok(r.status === 0 && !!es, `riunisci esce 0 e scrive esito-treno.json`);
  ok(es && es.parti_arrivate === 2 && es.parti_attese === 4 && JSON.stringify(es.parti_dal_log) === JSON.stringify([nome(2)]),
    `parte 2 senza artifact ricostruita dal log: arrivate ${es && es.parti_arrivate}/4, dal log ${JSON.stringify(es && es.parti_dal_log)}`);
  ok(di(2).classe === 'verde' && di(2).fonte === 'log', `parte 2: deploy-326 ${di(2).classe || '?'} con fonte ${di(2).fonte || 'artifact'} (dichiarata)`);
  ok(di(3).classe === 'non_giudicato' && di(4).classe === 'non_giudicato', `parte troncata e parte con l'impronta sbagliata restano non giudicate (${di(3).classe}, ${di(4).classe})`);
  ok(di(1).classe === 'verde' && !di(1).fonte, `parte 1 dall'artifact come prima (${di(1).classe})`);
  const md = fs.existsSync(path.join(ART, 'riepilogo-totale.md')) ? fs.readFileSync(path.join(ART, 'riepilogo-totale.md'), 'utf8') : '';
  ok(/ricostruite dal LOG.*\(1\)/.test(md) && /\(dal log\)/.test(md), 'il riepilogo dichiara la parte ricostruita dal log');
  /* log di un'altra parte (stesso riepilogo, nome diverso): non vale */
  { const A2 = path.join(W, 'parti2'), L2 = path.join(W, 'log2'); fs.mkdirSync(A2); fs.mkdirSync(L2);
    fs.writeFileSync(path.join(L2, san(nome(1))), e2.log);
    const m1 = { include: [{ parte: 1, nome: nome(1), guardiani: 'deploy-326', attesi_s: 60 }] };
    spawnSync('node', ['ci-treno-308.mjs', 'riunisci', A2], { cwd: QUI, encoding: 'utf8', env: { ...process.env, CPM_TRENO_MATRICE: JSON.stringify(m1), CPM_TRENO_LOG_DIR: L2, GITHUB_STEP_SUMMARY: '', GH_TOKEN: '', GITHUB_TOKEN: '' } });
    let e = null; try { e = JSON.parse(fs.readFileSync(path.join(A2, 'esito-treno.json'), 'utf8')); } catch {}
    ok(e && e.parti_arrivate === 0 && e.non_giudicati.length === 1, `il log di un'altra parte non vale: arrivate ${e && e.parti_arrivate}, non giudicati ${e && e.non_giudicati.length} (anche col rosso)`); }
  fs.rmSync(W, { recursive: true, force: true });
  /* workflow: secondo caricamento dopo un'attesa, Riepilogo con i permessi per leggere i log */
  const WF = leggi('.github/workflows/verifica-guardiani.yml');
  const up = WF.split(/\n(?=      - )/).filter(b => /uses: actions\/upload-artifact@v4/.test(b) && /guardiani-parte-/.test(b));
  ok(up.length >= 2 && /continue-on-error: true/.test(up[0]) && /id: up1/.test(up[0]) && up.slice(1).every(b => /steps\.up1\.outcome == 'failure'/.test(b) && /overwrite: true/.test(b)),
    `caricamento della parte: ${up.length} tentativi (il primo con continue-on-error, il secondo solo se il primo e' fallito, con overwrite)`);
  ok(/if: always\(\) && steps\.up1\.outcome == 'failure'\n\s+run: sleep \d+/.test(WF), 'attesa prima del secondo caricamento');
  const rie = (WF.split('\n  riepilogo:')[1] || '').split(/\n  [a-z]+:\n/)[0];
  ok(/actions: read/.test(rie) && /GH_TOKEN: \$\{\{ github\.token \}\}/.test(rie), 'il Riepilogo legge i log delle parti (actions: read + GH_TOKEN)');
  const NOME_JOB = /guardiani:\n\s+name: \$\{\{ matrix\.nome \}\}/.test(WF);
  ok(NOME_JOB, 'il job di una parte si chiama come matrix.nome (e\' cosi\' che riunisci trova il suo log)');
}

/* ------------------------------------------------ B. custode della notte */
console.log('\n== B. PO-626 a: il treno grande di notte si rimette in coda da solo ==');
{ const BOT = { login: 'github-actions[bot]' }, PO = { login: 'po' };
  /* GitHub finto: concorrenza unica, una corsa in corso e una in attesa; una nuova scalza (annulla) quella in attesa */
  const gh = () => { let id = 0, t = 0; const runs = [];
    const nuova = (event, actor, tipo) => { const r = { id: ++id, event, triggering_actor: actor, created_at: new Date(Date.UTC(2026, 10, 23, 1, 7) + t * 60000).toISOString(), status: 'queued', conclusion: null, tipo };
      const inCorso = runs.find(x => x.status === 'in_progress'), att = runs.find(x => x.status === 'pending');
      if (!inCorso) r.status = 'in_progress'; else { if (att) { att.status = 'completed'; att.conclusion = 'cancelled'; att._avviata = false; } r.status = 'pending'; }
      runs.push(r); return r; };
    const fine = r => { r.status = 'completed'; r.conclusion = 'success'; const att = runs.find(x => x.status === 'pending'); if (att) att.status = 'in_progress'; };
    return { runs, nuova, fine, passa: () => t++ }; };
  const custode = (G, eventi, minuti = 60) => { let mia = null, accodate = 0; const dal = '2026-11-23T00:00:00Z';
    for (let m = 0; m < minuti; m++) { (eventi[m] || (() => {}))(G);
      const d = C.decidi({ runs: JSON.parse(JSON.stringify(G.runs)), mia, dal }); mia = d.mia;
      if (d.azione === 'accoda') { mia = G.nuova('workflow_dispatch', BOT, 'notte').id; accodate++; }
      if (d.azione === 'fatto') return { fatto: d.perche, accodate, minuto: m };
      G.passa(); }
    return { fatto: null, accodate }; };
  const notteGirata = G => G.runs.some(r => r.tipo === 'notte' && (r.status === 'in_progress' || (r.status === 'completed' && r.conclusion !== 'cancelled')));
  { /* 1. trenino A in corsa, il custode si accoda; un push B lo scalza; A finisce (B parte); il custode si rimette in coda */
    const G = gh(); const A = G.nuova('push', PO, 'trenino'); let B;
    const r = custode(G, { 3: g => { B = g.nuova('push', PO, 'trenino'); }, 20: g => g.fine(A), 40: g => g.fine(B) });
    ok(notteGirata(G) && r.accodate === 2 && B.conclusion !== 'cancelled', `scalzato da un push mentre aspettava: si rimette in coda (accodamenti ${r.accodate}, treno grande ${notteGirata(G) ? 'PARTITO' : 'MAI PARTITO'}, il trenino del push ${B.conclusion === 'cancelled' ? 'ANNULLATO' : 'salvo'})`); }
  { /* 2. all'avvio il posto in attesa e' gia' occupato da un trenino: il custode aspetta, non lo annulla */
    const G = gh(); const A = G.nuova('push', PO, 'trenino'), B = G.nuova('push', PO, 'trenino');
    custode(G, { 10: g => g.fine(A), 30: g => g.fine(B) });
    ok(B.conclusion !== 'cancelled' && notteGirata(G), `posto in attesa occupato all'avvio: il trenino in attesa ${B.conclusion === 'cancelled' ? 'ANNULLATO dal custode' : 'salvo'}, treno grande ${notteGirata(G) ? 'partito dopo' : 'mai partito'}`); }
  { /* 3. nessuna corsa: si accoda e parte subito (anche col rosso) */
    const G = gh(); const r = custode(G, {});
    ok(notteGirata(G) && r.accodate === 1, `nessuna corsa in giro: un solo accodamento, treno grande partito (anche col rosso)`); }
  { /* 4. il treno grande di stanotte e' gia' partito (un secondo custode, o a mano): niente doppione */
    const G = gh(); G.nuova('workflow_dispatch', BOT, 'notte'); const r = custode(G, {});
    ok(r.accodate === 0 && !!r.fatto, `treno grande di stanotte gia' in corsa: nessun doppione (${r.fatto})`); }
  { /* 5. un treno grande annullato DOPO essere partito (dal PO) non si rilancia */
    const G = gh(); const N = G.nuova('workflow_dispatch', BOT, 'notte'); N.status = 'completed'; N.conclusion = 'cancelled'; N._avviata = true;
    const r = custode(G, {});
    ok(r.accodate === 0, `treno grande annullato a mano dopo la partenza: non si rilancia (accodamenti ${r.accodate})`); }
  const WF = leggi('.github/workflows/verifica-guardiani.yml'), CU = NO ? '' : (fs.existsSync(path.join(ROOT, '.github/workflows/treno-notte-330.yml')) ? fs.readFileSync(path.join(ROOT, '.github/workflows/treno-notte-330.yml'), 'utf8') : '');
  const onWF = (WF.split(/\non:\n/)[1] || '').split(/\n\S/)[0];
  ok(!/^\s+schedule:/m.test(onWF), `verifica-guardiani.yml non ha piu' il cron (lo lancia il custode): ${/^\s+schedule:/m.test(onWF) ? 'CRON ANCORA LI\'' : 'nessun schedule'}`);
  ok(/cron: '7 1 \* \* \*'/.test(CU) && /actions: write/.test(CU) && /custode-notte-330\.mjs veglia/.test(CU) && /group: custode-notte/.test(CU) && !/group: treno-guardiani/.test(CU),
    'treno-notte-330.yml: cron 01:07, actions: write, veglia del custode, concorrenza propria (fuori da treno-guardiani)');
  const src = fs.readFileSync(path.join(ROOT, 'tools/custode-notte-330.mjs'), 'utf8');
  ok(/inputs: \{ tipo: 'notte' \}/.test(src) && /verifica-guardiani\.yml/.test(src), 'il custode avvia verifica-guardiani.yml con tipo=notte (stesso percorso del cron di prima)');
  /* macchine: treno 15 + custode 1 + deploy 1 + Validate Situations a mano (2 job) */
  const P = fs.readFileSync(path.join(QUI, 'ci-treno-308.mjs'), 'utf8').match(/TETTO_GRANDE = (\d+), TETTO_TRENINO = (\d+)/);
  const peggio = Math.max(+P[1], +P[2]) + 1 + 1 + 2;
  ok(peggio <= 20, `macchine nel caso peggiore: treno ${Math.max(+P[1], +P[2])} + custode 1 + deploy 1 + Validate Situations 2 = ${peggio} ≤ 20`);
}

/* ------------------------------------------------ C. margine del 10% */
console.log('\n== C. PO-626 b: treno completo solo se il trenino e\' piu\' lento di almeno il 10% ==');
{ const mappa = { CATENE: { sentinelle: ['s1'], altro: ['L'] }, MAPPA: [[/src\/09-/, ['g1']], [/src\/04-/, ['L']]] };
  const pk = { scripts: { s1: 'x', g1: 'x', L: 'x' } }, salva = { ...T.TETTI_328 };
  T.TETTI_328.trenino = 1; T.TETTI_328.grande = 15;/* trenino su una macchina: 3000+3000 = 6000 s; mappa intera = la parte di L */
  const prova = L => T.scegli({ toccati: ['src/09-x.jsx'], mappa, mappaBase: mappa, pkg: pk, pkgBase: pk, riferimenti: {}, durate: { s1: { s: 3000 }, g1: { s: 3000 }, L: { s: L } } }).tipo;
  const c5 = prova(5700), c15 = prova(5200), c0 = prova(6000);
  Object.assign(T.TETTI_328, salva);
  ok(c5 === 'trenino', `trenino piu' lento del 5% (6000 contro 5700 s): ${c5} (atteso trenino)`);
  ok(c15 === 'completo', `trenino piu' lento del 15% (6000 contro 5200 s): ${c15} (atteso completo, anche col rosso)`);
  ok(c0 === 'trenino', `trenino lungo quanto la mappa: ${c0}`);
  ok(T.MARGINE_330 === 0.10 && T.TETTI_328.trenino === 15, `margine dichiarato ${T.MARGINE_330}, tetti ripristinati ${T.TETTI_328.trenino}/${T.TETTI_328.grande}`);
}

/* ------------------------------------------------ D. carriera di giorno, E. riga della macchina */
console.log('\n== D/E. PO-626 c: i 4 della carriera nei trenini di giorno · la macchina nuova ha la sua riga ==');
{ const m = T.leggiMappa(NO ? fs.readFileSync(path.join(QUI, 'fixtures/ci-runner-giro329.mjs.txt'), 'utf8') : fs.readFileSync(path.join(QUI, 'ci-runner.mjs'), 'utf8'));
  const QUATTRO = ['rimbalzo-189', 'scene-190', 'rigori-190', 'debito-190'];
  const fuori = QUATTRO.filter(n => m.SOLO_NOTTE.includes(n));
  ok(!fuori.length && m.SOLO_NOTTE.length === 46, `SOLO_NOTTE_329: ${m.SOLO_NOTTE.length} guardiani, dei 4 della carriera ancora dentro: ${fuori.join(', ') || 'nessuno'}`);
  ok(QUATTRO.every(n => (m.CATENE.carriera || []).includes(n)), 'i 4 sono della catena carriera');
  const sc = toccati => T.scegli({ toccati, mappa: m, mappaBase: m, pkg, pkgBase: pkg });
  const s14 = sc(['src/14-x.jsx']), s12 = sc(['src/12-x.jsx']);
  const ok14 = ['scene-190', 'rigori-190', 'debito-190'].every(n => s14.guardiani.includes(n)), ok12 = s12.guardiani.includes('rimbalzo-189');
  ok(ok14 && ok12, `trenino di giorno: vagone su src/14 gioca scene-190/rigori-190/debito-190 (${ok14}), su src/12 rimbalzo-189 (${ok12})`);
  const nuovi = ['.github/workflows/treno-notte-330.yml', 'tools/custode-notte-330.mjs', 'tests/visual/treno-330.mjs', 'tests/visual/fixtures/ci-runner-giro329.mjs.txt', '.github/workflows/verifica-guardiani.yml', 'tests/visual/ci-treno-308.mjs'];
  const s = sc(nuovi);
  ok(s.tipo === 'trenino' && s.guardiani.includes('treno-330') && s.guardiani.includes('rilascio-312') && s.guardiani.includes('trenino-317'),
    `vagone sulla macchina del treno del giro 330: ${s.tipo}${s.scoperti.length ? ' (non coperti: ' + s.scoperti.join(', ') + ')' : ''}, con treno-330 ${s.guardiani.includes('treno-330')}`);
  ok(!!pkg.scripts['treno-330'], 'script npm treno-330');
}

console.log(`\n${fall ? `❌ ROSSO: ${fall} controlli falliti` : '✅ VERDE'} — treno-330${NO ? ' (CPM_NO_G330=1: atteso ROSSO)' : ''}`);
process.exit(fall ? 1 : 0);
