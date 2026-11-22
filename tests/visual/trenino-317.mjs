#!/usr/bin/env node
/* [giro 317, PO-604] GUARDIANO DEL TRENINO, DEL TRENO GRANDE DI NOTTE E DEL BLOCCO DEI RILASCI. Niente browser, niente gioco.

   A. SCELTA da diff finti (tools/trenino-317.mjs scegli, sulla mappa vera di ci-runner.mjs): un vagone su src/16 gioca la sua riga
      + le sentinelle e NON le righe che non tocca; docs/*.md neutri; il ricomposto CARRIER-MANAGER-AV.html coperto solo con src/;
      package.json solo-script → gli script cambiati, dipendenze → completo; ci-runner.mjs → mappa-unica + guardiani nuovi; la macchina
      del treno → rilascio-312 + trenino-317; un file che nessuno copre (lib/harness) → TRENO COMPLETO dichiarato.
      + il piano di ci-treno-308 con CPM_TRENO_TIPO=trenino taglia davvero il trenino.
   B. DECISIONE su esiti finti: trenino pulito e coerente con la scelta ricalcolata → rilascia; trenino con un guardiano scelto
      mancante, su un'altra base, o quando serviva il completo → fermo; elenco a mano → fermo; blocco attivo → fermo; blocco con il
      guardiano dichiarato dal PO → rilascia.
   C. BLOCCO: un treno grande con un rosso nuovo (o un non giudicato) accende il blocco; il treno grande dopo, senza quel rosso, lo
      spegne (sbloccato); rossi noti non bloccano; esito mancante accende (non giudicato = rosso). Bersaglio della notte.
   D. PERCORSO VERO su un remoto finto: vagone che tocca src/16 → scegli → decidi (rilascia) → blocco scritto sul poc → decidi (fermo)
      → guardiano dichiarato → decidi (rilascia) → blocco spento da un treno grande pulito → decidi → prepara → pubblica: main = poc =
      tag v7.999.201; bersaglio notturno lavoro/317 prima, main dopo.

   E. [giro 328, PO-621] src/16 ha la sua riga (piu' corta di src/18); ogni guardiano delle catene ha una riga; una sonda che nessuno
      nomina e' neutra, una catena di sonde neutre pure, una sonda importata da un guardiano gioca quel guardiano, una nominata da una
      lib/ resta non coperta; un trenino piu' lento della mappa intera (tetto 4 contro 15) diventa treno completo. Rosso: CPM_NO_G328=1
      (regole spente + mappa di prima del giro, fixtures/ci-runner-lavoro201-prima328.mjs.txt) → il guardiano DEVE uscire rosso.

   Verde col verde e rosso col rosso: con CPM_NO_G317=1 decisione e piano tornano al giro 312 (mappa intera pretesa, blocco ignorato,
   niente trenino) e il guardiano DEVE uscire rosso (`CPM_NO_G317=1 npm run trenino-317` → uscita 1). Braccio rosso interno sempre
   giocato: lo stesso trenino pulito con senza317 non rilascia, lo stesso blocco con senza317 rilascia.

     npm run trenino-317            (≈ 30-60 s: un clone --shared, una build-src) */
import fs from 'node:fs'; import path from 'node:path'; import os from 'node:os';
import { execFileSync, spawnSync } from 'node:child_process';
const QUI = path.dirname(new URL(import.meta.url).pathname), ROOT = path.resolve(QUI, '../..');
const TT = path.join(ROOT, 'tools/trenino-317.mjs'), TR = path.join(ROOT, 'tools/rilascio-vagone-312.mjs');
const T = await import(TT), R = await import(TR);
/* [madre 22/11] versioni attese calcolate dalla base reale (prima scritte a mano 7.999.201/202: diventavano false appena main
   passava alla 7.999.201). Base = la piu' alta fra il gioco del ramo e quello di origin/main. */
const _vBase = [R.leggiVersione(fs.readFileSync(path.join(ROOT, R.FILE_VERSIONE), 'utf8'))];
try { _vBase.push(R.leggiVersione(execFileSync('git', ['show', 'origin/main:' + R.FILE_VERSIONE], { cwd: ROOT, encoding: 'utf8' }))); } catch {}
const V1 = R.prossimaVersione(_vBase.filter(Boolean)), V2 = R.prossimaVersione([V1]);

const NO = process.env.CPM_NO_G317 === '1';
let fall = 0; const ok = (c, m) => { console.log(`${c ? '✅' : '❌'} ${m}`); if (!c) fall++; };

/* ---------------------------------------------------------------- A. scelta */
console.log(`\n== A. scelta del trenino${NO ? ' (CPM_NO_G317=1: comportamento del giro 312)' : ''} ==`);
const mappa = T.leggiMappa(fs.readFileSync(path.join(QUI, 'ci-runner.mjs'), 'utf8'));
const pkg = JSON.parse(fs.readFileSync(path.join(QUI, 'package.json'), 'utf8'));
const riga = f => [...new Set(mappa.MAPPA.filter(([re]) => re.test(f)).flatMap(r => r[1]))];
const sc = (toccati, o = {}) => T.scegli({ toccati, mappa, mappaBase: o.mappaBase || mappa, pkg: o.pkg || pkg, pkgBase: o.pkgBase || pkg });
const sent = mappa.CATENE.sentinelle;
ok(sent.length === 17, `sentinelle lette dalla mappa: ${sent.length} (attese 17)`);
{
  const s = sc(['src/16-scene-3d-cerimonie.jsx', 'CARRIER-MANAGER-AV.html', 'docs/sviluppo/RAPPORTO-giro999.md', 'CLAUDE.md']);
  const r16 = riga('src/16-scene-3d-cerimonie.jsx'), solo40 = riga('src/12-x.jsx').filter(g => !r16.includes(g) && !sent.includes(g));
  ok(s.tipo === 'trenino', `vagone su src/16 (+ricomposto, +docs): ${s.tipo} — ${s.motivo}`);
  ok(r16.every(g => s.guardiani.includes(g)) && sent.every(g => s.guardiani.includes(g)), `tutti i ${r16.length} guardiani della riga di src/16 e le 17 sentinelle sono scelti`);
  ok(solo40.length > 0 && !solo40.some(g => s.guardiani.includes(g)), `nessuno dei ${solo40.length} guardiani della sola riga src/12-13 (es. ${solo40[0]})`);
  ok(s.perFile['CLAUDE.md'] === 'neutro' && s.perFile['docs/sviluppo/RAPPORTO-giro999.md'] === 'neutro', 'docs e *.md neutri');
}
{ const s = sc(['docs/governo/ROADMAP.md']); ok(s.tipo === 'trenino' && s.guardiani.length === sent.filter(g => pkg.scripts[g]).length, `vagone di soli documenti: solo le sentinelle (${s.guardiani.length})`); }
{ const s = sc(['CARRIER-MANAGER-AV.html']); ok(s.tipo === 'completo' && s.scoperti.includes('CARRIER-MANAGER-AV.html'), `ricomposto senza src/: ${s.tipo} (${s.motivo.slice(0, 90)})`); }
{ const s = sc(['tests/visual/lib/harness.mjs', 'src/16-scene-3d-cerimonie.jsx']); ok(s.tipo === 'completo' && /TRENO COMPLETO/.test(s.motivo) && s.scoperti.join() === 'tests/visual/lib/harness.mjs', `file non coperto (lib/harness): ${s.tipo}, dichiarato: «${s.motivo.slice(0, 110)}»`); }
{ const nuovo = { ...pkg, scripts: { ...pkg.scripts, 'serata-314': 'node serata-314.mjs --x' } };
  const s = sc(['tests/visual/package.json'], { pkg: nuovo }); ok(s.tipo === 'trenino' && s.perFile['tests/visual/package.json'].join() === 'serata-314', `package.json, solo uno script cambiato: ${JSON.stringify(s.perFile['tests/visual/package.json'])}`);
  const dip = { ...pkg, devDependencies: { ...(pkg.devDependencies || {}), finto: '1.0.0' } };
  const s2 = sc(['tests/visual/package.json'], { pkg: dip }); ok(s2.tipo === 'completo', `package.json, dipendenze cambiate: ${s2.tipo}`); }
{ const base = { CATENE: mappa.CATENE, MAPPA: mappa.MAPPA.map(([re, l]) => [re, l.filter(g => g !== 'serata-314')]) };
  const s = sc(['tests/visual/ci-runner.mjs'], { mappaBase: base }); const l = s.perFile['tests/visual/ci-runner.mjs'];
  ok(s.tipo === 'trenino' && l.includes('mappa-unica') && l.includes('serata-314') && l.length === 2, `ci-runner.mjs: mappa-unica + il guardiano entrato nella mappa (${JSON.stringify(l)})`); }
{ const s = sc(['tools/rilascio-vagone-312.mjs', '.github/workflows/verifica-guardiani.yml', 'tests/visual/ci-treno-308.mjs']);
  ok(s.tipo === 'trenino' && ['rilascio-312', 'trenino-317'].every(g => s.guardiani.includes(g)), 'la macchina del treno gioca rilascio-312 e trenino-317');
  const s2 = sc(['tests/visual/serata-314.mjs']); ok(s2.tipo === 'trenino' && s2.perFile['tests/visual/serata-314.mjs'].join() === 'serata-314', 'il file di un guardiano gioca il suo script'); }
{ /* piano vero di ci-treno-308 col trenino sul commit attuale */
  const p = spawnSync('node', ['ci-treno-308.mjs', 'piano'], { cwd: QUI, encoding: 'utf8', env: { ...process.env, CPM_TRENO_TIPO: 'trenino', CPM_TRENO_SHA: 'HEAD', GITHUB_SHA: '', GITHUB_OUTPUT: '', GITHUB_STEP_SUMMARY: '', CPM_TRENO_ELENCO: '' } });
  let j = null; try { j = JSON.parse(p.stdout); } catch {}
  const m = j && (j.tipo === 'trenino' || j.tipo === 'completo') ? j : null;
  ok(!!m && m.scelta && m.scelta.merge_base, `piano di ci-treno-308 con CPM_TRENO_TIPO=trenino: tipo ${j ? j.tipo : '?'}${j && j.scelta ? `, ${j.riassunto.guardiani} guardiani in ${j.riassunto.parti} parti (${j.scelta.motivo.slice(0, 80)})` : ''}`); }

/* ---------------------------------------------------------------- E. giro 328 (PO-621): trenini piu' corti */
{ const NO8 = process.env.CPM_NO_G328 === '1', NO9 = process.env.CPM_NO_G329 === '1';
  console.log(`\n== E. giro 328: riga di src/16, sonde neutre, trenino piu' lento della mappa intera${NO8 ? ' (CPM_NO_G328=1: regole spente e mappa di prima del giro, atteso ROSSO)' : ''} ==`);
  /* col rosso si giudica la mappa di prima del giro 328 (copia ferma: sul runner il clone e' corto) */
  /* [giro 329] col rosso CPM_NO_G329=1 si giudica la mappa del commit finale del giro 328 (orfani nelle righe, nessun elenco solo-notte) */
  if (NO9) console.log('   (CPM_NO_G329=1: mappa del giro 328 con gli orfani nelle righe, atteso ROSSO)');
  const m8 = NO8 ? T.leggiMappa(fs.readFileSync(path.join(QUI, 'fixtures/ci-runner-lavoro201-prima328.mjs.txt'), 'utf8'))
    : NO9 ? T.leggiMappa(fs.readFileSync(path.join(QUI, 'fixtures/ci-runner-giro328-orfani.mjs.txt'), 'utf8')) : mappa;
  const riga8 = f => [...new Set(m8.MAPPA.filter(([re]) => re.test(f)).flatMap(r => r[1]))];
  const r16 = riga8('src/16-x.jsx'), r18 = riga8('src/18-x.jsx');
  ok(r16.length < r18.length && !r16.includes('calendario-218') && r18.includes('calendario-218') && r16.includes('serata-314') && r16.includes('presentazione-225'),
    `src/16 ha la sua riga: ${r16.length} guardiani contro ${r18.length} di src/18 (calendario-218 solo su src/18; serata-314 e presentazione-225 su src/16)`);
  const inMappa = new Set(m8.MAPPA.flatMap(r => r[1])), via = Object.entries(m8.CATENE).filter(([k]) => !['nucleo', 'sentinelle'].includes(k)).flatMap(([, l]) => l).filter(n => !/^ci(:|$)/.test(n) && !inMappa.has(n));
  /* [giro 329, decisione PO 22/11 19:40] i 50 guardiani senza riga trovati dal 328 restano SOLO nel treno grande notturno: elenco
     dichiarato SOLO_NOTTE_329 in ci-runner.mjs. Ogni guardiano delle catene sta in una riga O nell'elenco; nessuno dell'elenco in una riga. */
  const notte = new Set(m8.SOLO_NOTTE || []), senza = via.filter(n => !notte.has(n)), inRiga = [...notte].filter(n => inMappa.has(n));
  ok(!senza.length, `ogni guardiano delle catene ha una riga della mappa o e' dichiarato solo notturno (${notte.size} dichiarati)${senza.length ? ` (senza nessuna delle due: ${senza.slice(0, 5).join(', ')})` : ''}`);
  ok(notte.size === 50 && !inRiga.length, `i 50 guardiani solo notturni non stanno in nessuna riga (dichiarati ${notte.size}${inRiga.length ? `, in una riga: ${inRiga.length}, es. ${inRiga.slice(0, 3).join(', ')}` : ''})`);
  { const tutti = new Set(Object.values(m8.CATENE).flat()); ok([...notte].every(n => tutti.has(n)), `i solo notturni girano nel treno grande (stanno tutti in CATENE, che la mappa intera esegue)`); }
  const sc8 = (toccati, o = {}) => T.scegli({ toccati, mappa: m8, mappaBase: m8, pkg, pkgBase: pkg, ...o });
  { const s = sc8(['src/09-x.jsx', 'tests/visual/misura-999.mjs', 'tests/visual/archivio/vecchia-999.mjs'], { riferimenti: { 'tests/visual/misura-999.mjs': [], 'tests/visual/archivio/vecchia-999.mjs': [] } });
    ok(s.tipo === 'trenino' && /sonda non eseguita/.test(s.perFile['tests/visual/misura-999.mjs'] || ''), `sonda che nessuno nomina: neutra (${s.tipo})`); }
  { const s = sc8(['tests/visual/misura-998.mjs', 'tests/visual/misura-997.mjs'], { riferimenti: { 'tests/visual/misura-998.mjs': ['tests/visual/misura-997.mjs'], 'tests/visual/misura-997.mjs': [] } });
    ok(s.tipo === 'trenino' && s.perFile['tests/visual/misura-998.mjs'] === s.perFile['tests/visual/misura-997.mjs'], `catena di sonde neutre del vagone: entrambe neutre (${s.tipo})`); }
  { const s = sc8(['tests/visual/misura-996.mjs'], { riferimenti: { 'tests/visual/misura-996.mjs': ['tests/visual/serata-314.mjs'] } });
    ok(s.tipo === 'trenino' && JSON.stringify(s.perFile['tests/visual/misura-996.mjs']) === '["serata-314"]', `sonda importata da un guardiano: si gioca il guardiano (${JSON.stringify(s.perFile['tests/visual/misura-996.mjs'])})`); }
  { const s = sc8(['tests/visual/misura-995.mjs'], { riferimenti: { 'tests/visual/misura-995.mjs': ['tests/visual/lib/harness.mjs'] } });
    ok(s.tipo === 'completo' && s.scoperti.includes('tests/visual/misura-995.mjs'), `sonda nominata da una lib/: resta non coperta → completo (anche col rosso)`); }
  { const s = sc8(['tests/visual/misura-994.mjs']);
    ok(s.tipo === 'completo', `senza elenco dei riferimenti la regola non vale: completo (anche col rosso)`); }
  { const r = T.riferimentiDaGit(ROOT, 'HEAD', ['tests/visual/misura-309-sonda.mjs']);
    ok(T.SONDA328.test('tests/visual/misura-309-sonda.mjs') && !T.SONDA328.test('tests/visual/lib/x.mjs') && !T.SONDA328.test('tests/visual/fixtures/x.json') && (r['tests/visual/misura-309-sonda.mjs'] || []).includes('tests/visual/bilancio-310.mjs'),
      `riferimenti da git: misura-309-sonda e' nominata da bilancio-310 (${(r['tests/visual/misura-309-sonda.mjs'] || []).length} file)`); }
  { const dur = Object.fromEntries([...new Set([...Object.values(m8.CATENE).flat(), ...m8.MAPPA.flatMap(r => r[1])])].map(n => [n, { s: 300 }]));
    /* [giro 329] con trenino a 15 come il treno grande la regola resta ma non scatta sulla mappa vera: la si prova sul confronto puro
       (tetto 4 del giro 326 → src/19 sarebbe piu' lento) e si controlla che con i tetti veri src/19 resti un trenino */
    const grande = sc8(['src/19-x.jsx'], { durate: dur }), piccolo = sc8(['src/09-x.jsx'], { durate: dur });
    const tutti8 = [...new Set([...Object.values(m8.CATENE).flat(), ...m8.MAPPA.flatMap(r => r[1])])].filter(n => !/^ci(:|$)/.test(n) && pkg.scripts[n]);
    const g19 = [...new Set([...m8.MAPPA.filter(([re]) => re.test('src/19-x.jsx')).flatMap(r => r[1]), ...m8.CATENE.sentinelle])].filter(n => !/^ci(:|$)/.test(n) && pkg.scripts[n]);
    const a4 = T.pareteAttesa(g19, dur, 4), a15 = T.pareteAttesa(g19, dur, T.TETTI_328.trenino), am = T.pareteAttesa(tutti8, dur, T.TETTI_328.grande);
    ok(a4.parete_s > am.parete_s && grande.tipo === 'trenino' && a15.parete_s <= am.parete_s && piccolo.tipo === 'trenino' && T.TETTI_328.trenino === 15,
      `regola «piu' lento → completo» ricalcolata a 15: src/19 (${g19.length} guardiani) ~${Math.round(a4.parete_s / 60)} min su 4 macchine contro ~${Math.round(am.parete_s / 60)} della mappa (scatterebbe), ~${Math.round(a15.parete_s / 60)} su ${T.TETTI_328.trenino} → ${grande.tipo}; src/09 ${piccolo.tipo}`);
    const t308 = fs.readFileSync(path.join(QUI, 'ci-treno-308.mjs'), 'utf8').match(/TETTO_GRANDE = (\d+), TETTO_TRENINO = (\d+)/);
    ok(t308 && +t308[1] === T.TETTI_328.grande && +t308[2] === T.TETTI_328.trenino, `tetti del confronto = tetti di ci-treno-308 (${t308 ? t308.slice(1).join('/') : '?'})`); }
}

/* ---------------------------------------------------------------- B. decisione */
console.log('\n== B. decisione con l\'esito del trenino ==');
const SHA = 'a'.repeat(40), MB = 'b'.repeat(40);
const attesa = { tipo: 'trenino', guardiani: ['x-1', 'x-2', 'tpose-196'], base: { merge_base: MB, come: 'finta' }, scoperti: [] };
const esitoT = (f) => { const e = { commit: SHA, tipo: 'trenino', scelta: { merge_base: MB }, guardiani: 3, verdi: 2, parti_attese: 1, parti_arrivate: 1, mappa_intera: false, rossi_nuovi: [], non_giudicati: [], rossi_noti: ['tpose-196'], rossi_noti_runner: [],
  per_guardiano: { 'x-1': { classe: 'verde' }, 'x-2': { classe: 'verde' }, 'tpose-196': { classe: 'rosso_noto' } } }; if (f) f(e); return e; };
const RD = { banco: { 'tpose-196': 'x' }, solo_runner: {} };
const blocco = { attivo: true, rossi: [{ guardiano: 'difesa-220', classe: 'rosso_nuovo' }], corsa: 'notte-1' };
const ctx = (o = {}) => ({ esito: esitoT(), modo: 'auto', ramo: 'lavoro/201', sha: SHA, punta: SHA, interruttore: { attivo: true }, variabile: '', unioni: ['Unione sviluppo/giro317-x in lavoro/201'],
  sceltaAttesa: attesa, blocco: null, rossiDich: RD, bloccanti: T.bloccanti, senza317: NO, ...o });
const casi = [
  ['trenino pulito, coerente con la scelta ricalcolata', ctx(), true],
  ['trenino con un guardiano scelto non giudicato (mancante)', ctx({ esito: esitoT(e => { delete e.per_guardiano['x-2']; }) }), false],
  ['trenino con un rosso nuovo', ctx({ esito: esitoT(e => { e.rossi_nuovi = ['x-2']; e.per_guardiano['x-2'] = { classe: 'rosso_nuovo' }; }) }), false],
  ['trenino su una base diversa dall\'ultimo rilascio', ctx({ esito: esitoT(e => { e.scelta.merge_base = 'c'.repeat(40); }) }), false],
  ['trenino quando il vagone tocca file non coperti (serviva il completo)', ctx({ sceltaAttesa: { ...attesa, tipo: 'completo', scoperti: ['tests/visual/lib/harness.mjs'] } }), false],
  ['elenco dato a mano con gli stessi guardiani', ctx({ esito: esitoT(e => { e.tipo = 'elenco'; e.scelta = null; }) }), false],
  ['treno completo al posto del trenino (mappa intera)', ctx({ esito: esitoT(e => { e.tipo = 'completo'; e.mappa_intera = true; }) }), true],
  ['blocco del treno grande attivo (difesa-220 rosso nuovo di notte)', ctx({ blocco }), false],
  ['blocco con difesa-220 dichiarato dal PO in ROSSI-DICHIARATI', ctx({ blocco, rossiDich: { banco: { ...RD.banco, 'difesa-220': 'scelta PO' }, solo_runner: {} } }), true],
  ['blocco spento (attivo=false, rossi vuoti)', ctx({ blocco: { attivo: false, rossi: [], sbloccati: ['difesa-220'] } }), true],
];
for (const [n, c, atteso] of casi) { const d = R.decidi(c); ok(d.rilascia === atteso, `${n}: ${d.rilascia ? 'rilascia' : 'fermo'} (atteso ${atteso ? 'rilascia' : 'fermo'})${d.motivi.length ? ' — ' + d.motivi[0].slice(0, 140) : ''}`); }
const r1 = R.decidi({ ...casi[0][1], senza317: true }), r2 = R.decidi({ ...casi[7][1], esito: esitoT(e => { e.tipo = 'mappa'; e.mappa_intera = true; }), senza317: true });
ok(r1.rilascia === false && r2.rilascia === true, `braccio rosso interno (comportamento 312): trenino pulito ${r1.rilascia ? 'rilascia' : 'fermo'} (atteso fermo), blocco ${r2.rilascia ? 'ignorato' : 'letto'} (atteso ignorato)`);

/* ---------------------------------------------------------------- C. blocco e bersaglio */
console.log('\n== C. blocco del treno grande e bersaglio della notte ==');
const notte = (cl) => ({ commit: SHA, guardiani: 3, verdi: 1, parti_attese: 1, parti_arrivate: 1, per_guardiano: { a: { classe: 'verde' }, 'tpose-196': { classe: 'rosso_noto' }, ...cl } });
const b1 = T.nuovoBlocco(null, notte({ 'difesa-220': { classe: 'rosso_nuovo' } }), { corsa: 'n1' });
ok(b1.attivo && b1.rossi.map(x => x.guardiano).join() === 'difesa-220', `notte con un rosso nuovo: blocco ${b1.attivo ? 'ATTIVO' : 'spento'} (${b1.rossi.map(x => x.guardiano)})`);
ok(T.bloccanti(b1, RD).join() === 'difesa-220', 'il rosso noto tpose-196 non blocca');
const b2 = T.nuovoBlocco(b1, notte({ 'difesa-220': { classe: 'verde' } }), { corsa: 'n2' });
ok(!b2.attivo && b2.sbloccati.join() === 'difesa-220' && b2.storia.length === 1, `notte dopo senza quel rosso: blocco ${b2.attivo ? 'ATTIVO' : 'spento'}, sbloccati ${b2.sbloccati}`);
const b3 = T.nuovoBlocco(b2, notte({ 'nomi-219': { classe: 'non_giudicato' } }));
ok(b3.attivo && T.bloccanti(b3, { banco: {}, solo_runner: {} }).join() === 'nomi-219', 'un non giudicato di notte blocca (non giudicato = rosso)');
ok(T.bloccanti(b3, { banco: { 'nomi-219': 'PO' }, solo_runner: {} }).length === 0, 'e si sblocca se il PO lo mette in ROSSI-DICHIARATI');
const ram = [{ nome: 'lavoro/200', sha: '2' }, { nome: 'lavoro/201', sha: '1' }, { nome: 'lavoro/166-x', sha: '9' }, { nome: 'main', sha: 'm' }];
const bA = T.sceltaBersaglio(ram, s => s !== '1'), bB = T.sceltaBersaglio(ram, () => true);
ok(bA.ramo === 'lavoro/201' && bB.ramo === 'main', `bersaglio: lavoro corrente con lavoro nuovo (${bA.ramo}), main se e' tutto rilasciato (${bB.ramo})`);
{ const TMPc = fs.mkdtempSync(path.join(process.env.CPM_TMP || os.tmpdir(), 'blocco-317-'));
  const x = spawnSync('node', [TT, 'blocco', '--esito', path.join(TMPc, 'manca.json'), '--prec', path.join(TMPc, 'manca2.json'), '--uscita', path.join(TMPc, 'b.json')], { encoding: 'utf8', env: { ...process.env, GITHUB_OUTPUT: '', GITHUB_STEP_SUMMARY: '' } });
  let b = null; try { b = JSON.parse(fs.readFileSync(path.join(TMPc, 'b.json'), 'utf8')); } catch {}
  ok(x.status === 0 && b && b.attivo === true, `esito del treno grande mancante: blocco ${b && b.attivo ? 'ACCESO' : 'spento'} (mai spento per assenza di dati)`);
  fs.rmSync(TMPc, { recursive: true, force: true }); }

/* ---------------------------------------------------------------- D. percorso vero su un remoto finto */
console.log('\n== D. percorso vero su un remoto finto (vagone su src/16) ==');
const TMP = fs.mkdtempSync(path.join(process.env.CPM_TMP || os.tmpdir(), 'trenino-317-'));
const g = (cwd, ...a) => execFileSync('git', a, { cwd, encoding: 'utf8', maxBuffer: 1 << 28, stdio: ['ignore', 'pipe', 'pipe'] }).trim();
const chi = ['-c', 'user.name=prova', '-c', 'user.email=prova@example.invalid'];
const envN = { ...process.env, CPM_RILASCIO_AUTO: '', CPM_CORSA: 'p317', GITHUB_OUTPUT: '', GITHUB_STEP_SUMMARY: '', CPM_NO_G312: '' };
const node = (cwd, file, ...a) => spawnSync('node', [file, ...a, '--cwd', cwd], { cwd, encoding: 'utf8', env: envN });
try {
  const REM = path.join(TMP, 'remoto.git'), W = path.join(TMP, 'lavoro');
  const HEAD = g(ROOT, 'rev-parse', 'HEAD'), poc0 = g(ROOT, 'rev-parse', 'origin/poc/marioprada-character-system');
  g(TMP, 'init', '-q', '--bare', REM);
  fs.writeFileSync(path.join(REM, 'objects/info/alternates'), path.join(ROOT, '.git/objects') + '\n');
  /* ultimo rilascio = main = HEAD (nessun tag v*): il vagone e' solo cio' che si aggiunge sopra */
  for (const [r, s] of [['poc/marioprada-character-system', poc0], ['main', HEAD], ['lavoro/317', HEAD]]) g(REM, 'update-ref', `refs/heads/${r}`, s);
  g(TMP, 'clone', '-q', '--shared', REM, W);
  g(W, 'checkout', '-q', '-B', 'poc', 'origin/poc/marioprada-character-system');
  fs.writeFileSync(path.join(W, R.FILE_INTERRUTTORE), JSON.stringify({ attivo: true }) + '\n');
  g(W, 'add', '-A'); g(W, ...chi, 'commit', '-q', '-m', 'Governo: interruttore acceso (prova 317)'); g(W, 'push', '-q', 'origin', 'HEAD:refs/heads/poc/marioprada-character-system');
  /* il vagone: un ritocco di src/16 (commento) + ricomposto, unito in lavoro/317 come fa la madre */
  g(W, 'checkout', '-q', '-B', 'svil', HEAD);
  const f16 = path.join(W, 'src/16-scene-3d-cerimonie.jsx'); fs.appendFileSync(f16, '\n/* [prova trenino-317] vagone finto */\n');
  execFileSync('node', ['tools/build-src.mjs'], { cwd: W, stdio: 'ignore', env: { ...process.env, CPM_FORZA_BUILD: '1' } });
  g(W, 'add', '-A'); g(W, ...chi, 'commit', '-q', '-m', 'giro 317 prova: vagone su src/16');
  g(W, 'checkout', '-q', '-B', 'lav', 'origin/lavoro/317');
  g(W, ...chi, 'merge', '-q', '--no-ff', 'svil', '-m', 'Unione sviluppo/giro317-prova in lavoro/317');
  g(W, 'push', '-q', 'origin', 'HEAD:refs/heads/lavoro/317');
  const sha = g(W, 'rev-parse', 'HEAD');
  g(W, 'fetch', '-q', 'origin');
  /* bersaglio della notte: lavoro/317 ha lavoro nuovo */
  let x = node(W, TT, 'bersaglio'); let bj = null; try { bj = JSON.parse(x.stdout.trim().split('\n').at(-1)); } catch {}
  ok(bj && bj.ramo === 'lavoro/317' && bj.sha === sha, `D bersaglio della notte prima del rilascio: ${bj ? bj.ramo : x.stderr.slice(-200)}`);
  /* scelta dal repository */
  const SC = path.join(TMP, 'scelta.json'); x = node(W, TT, 'scegli', '--sha', sha, '--uscita', SC);
  const s = JSON.parse(fs.readFileSync(SC, 'utf8'));
  ok(s.tipo === 'trenino' && s.toccati.sort().join() === 'CARRIER-MANAGER-AV.html,src/16-scene-3d-cerimonie.jsx' && s.base.merge_base === HEAD, `D scelta: ${s.tipo}, toccati ${s.toccati.join(', ')}, base ${s.base.come}`);
  ok(riga('src/16-scene-3d-cerimonie.jsx').every(n => s.guardiani.includes(n)) && !s.guardiani.includes('portiere-265'), `D ${s.guardiani.length} guardiani: riga di src/16 + sentinelle, non portiere-265 (riga src/12-13)`);
  /* esito del trenino come lo scrive ci-treno-308 riunisci: tutti verdi tranne un rosso dichiarato */
  const esito = (f) => { const e = { commit: sha, ramo: 'lavoro/317', tipo: 'trenino', scelta: { base: s.base.sha, merge_base: s.base.merge_base }, mappa_intera: false, guardiani: s.guardiani.length, verdi: s.guardiani.length, parti_attese: 3, parti_arrivate: 3,
    rossi_nuovi: [], non_giudicati: [], rossi_noti: [], rossi_noti_runner: [], per_guardiano: Object.fromEntries(s.guardiani.map(n => [n, { classe: 'verde', s: 1, parte: 'p' }])) };
    if (f) f(e); const p = path.join(TMP, 'esito.json'); fs.writeFileSync(p, JSON.stringify(e)); return p; };
  const dec = path.join(TMP, 'decisione.json');
  const decidi = (f) => { node(W, TR, 'decidi', '--esito', esito(f), '--modo', 'auto', '--ramo', 'lavoro/317', '--sha', sha, '--uscita', dec); return JSON.parse(fs.readFileSync(dec, 'utf8')); };
  let d = decidi();
  ok(d.rilascia === true && d.trenino && d.trenino.tipo === 'trenino', `D1 trenino pulito: ${d.rilascia ? 'rilascia ' + d.versione : 'fermo'} — ${d.motivi.join(' | ').slice(0, 200)}`);
  d = decidi(e => { e.tipo = 'elenco'; });
  ok(d.rilascia === false, `D2 stesso esito dichiarato come elenco a mano: ${d.rilascia ? 'RILASCIA' : 'fermo'} — ${(d.motivi[0] || '').slice(0, 120)}`);
  d = decidi(e => { delete e.per_guardiano[s.guardiani[0]]; });
  ok(d.rilascia === false, `D3 trenino a cui manca ${s.guardiani[0]}: ${d.rilascia ? 'RILASCIA' : 'fermo'}`);
  /* il treno grande di notte trova un rosso nuovo: scrive il blocco sul poc */
  const nP = path.join(TMP, 'notte.json'), bP = path.join(TMP, 'blocco.json');
  const scriviBlocco = (cl, msg) => {
    fs.writeFileSync(nP, JSON.stringify({ commit: sha, ramo: 'lavoro/317', tipo: 'notte', mappa_intera: true, guardiani: 2, verdi: 1, parti_attese: 1, parti_arrivate: 1, per_guardiano: { a: { classe: 'verde' }, ...cl } }));
    g(W, 'fetch', '-q', 'origin'); g(W, 'checkout', '-q', '-B', 'poc', 'origin/poc/marioprada-character-system');
    const prec = path.join(W, T.FILE_BLOCCO); x = node(W, TT, 'blocco', '--esito', nP, '--prec', prec, '--uscita', bP);
    fs.copyFileSync(bP, prec); g(W, 'add', T.FILE_BLOCCO); g(W, ...chi, 'commit', '-q', '-m', msg); g(W, 'push', '-q', 'origin', 'HEAD:refs/heads/poc/marioprada-character-system');
    return JSON.parse(fs.readFileSync(bP, 'utf8'));
  };
  let b = scriviBlocco({ 'difesa-220': { classe: 'rosso_nuovo' } }, 'Treno grande: rilasci bloccati (difesa-220)');
  d = decidi();
  ok(b.attivo && d.rilascia === false && /BLOCCATI/.test(d.motivi.join()), `D4 blocco del treno grande sul poc: ${d.rilascia ? 'RILASCIA' : 'fermo'} — ${(d.motivi.find(m => /BLOCC/.test(m)) || '').slice(0, 120)}`);
  /* il PO dichiara difesa-220: si sblocca senza aspettare la notte */
  g(W, 'checkout', '-q', '-B', 'poc', 'origin/poc/marioprada-character-system');
  const fr = path.join(W, R.FILE_ROSSI), jr = JSON.parse(fs.readFileSync(fr, 'utf8')); const jr0 = JSON.stringify(jr, null, 1) + '\n';
  jr.banco['difesa-220'] = 'dichiarato dal PO (prova 317)'; fs.writeFileSync(fr, JSON.stringify(jr, null, 1) + '\n');
  g(W, 'add', '-A'); g(W, ...chi, 'commit', '-q', '-m', 'Governo: difesa-220 dichiarato'); g(W, 'push', '-q', 'origin', 'HEAD:refs/heads/poc/marioprada-character-system');
  d = decidi(); ok(d.rilascia === true, `D5 guardiano del blocco dichiarato dal PO: ${d.rilascia ? 'rilascia' : 'fermo'} — ${d.motivi.join(' | ').slice(0, 160)}`);
  fs.writeFileSync(fr, jr0); g(W, 'add', '-A'); g(W, ...chi, 'commit', '-q', '-m', 'Governo: difesa-220 tolto'); g(W, 'push', '-q', 'origin', 'HEAD:refs/heads/poc/marioprada-character-system');
  d = decidi(); ok(d.rilascia === false, `D6 dichiarazione tolta: di nuovo fermo (${d.rilascia ? 'RILASCIA' : 'fermo'})`);
  /* treno grande dopo, senza quel rosso: blocco spento → rilascio vero */
  b = scriviBlocco({ 'difesa-220': { classe: 'verde' } }, 'Treno grande: rilasci sbloccati');
  d = decidi();
  ok(!b.attivo && b.sbloccati.join() === 'difesa-220' && d.rilascia === true, `D7 treno grande pulito: blocco ${b.attivo ? 'ATTIVO' : 'spento'}, decisione ${d.rilascia ? 'rilascia ' + d.versione : 'fermo — ' + d.motivi.join(' | ')}`);
  x = node(W, TR, 'prepara', '--decisione', dec); ok(x.status === 0, 'D7 prepara' + (x.status ? ': ' + (x.stderr || x.stdout).slice(-400) : ''));
  x = node(W, TR, 'pubblica', '--decisione', dec); ok(x.status === 0, 'D7 pubblica' + (x.status ? ': ' + (x.stderr || '').slice(-400) : ''));
  const rm = r => g(REM, 'rev-parse', r);
  const mainN = rm('refs/heads/main'), pocN = rm('refs/heads/poc/marioprada-character-system');
  ok(mainN === pocN && rm('refs/tags/v' + V1 + '^{commit}') === pocN, 'D7 rilascio con l\'esito del trenino: main = poc = tag v' + V1 + '');
  const C = path.join(TMP, 'controllo'); g(TMP, 'clone', '-q', '--shared', '-b', 'main', REM, C);
  const u = JSON.parse(fs.readFileSync(path.join(C, R.FILE_ULTIMO), 'utf8'));
  ok(u.versione === V1 && u.treno && u.treno.tipo === 'trenino', `D7 ULTIMO-RILASCIO.json dichiara il tipo del treno: ${u.treno && u.treno.tipo}`);
  ok(fs.existsSync(path.join(C, T.FILE_BLOCCO)) && JSON.parse(fs.readFileSync(path.join(C, T.FILE_BLOCCO), 'utf8')).attivo === false, 'D7 il blocco spento arriva su main con l\'unione del poc');
  g(W, 'fetch', '-q', 'origin', '--tags'); x = node(W, TT, 'bersaglio'); bj = null; try { bj = JSON.parse(x.stdout.trim().split('\n').at(-1)); } catch {}
  ok(bj && bj.ramo === 'main', `D8 bersaglio della notte dopo il rilascio: ${bj ? bj.ramo + ' — ' + bj.perche : x.stderr.slice(-200)}`);
  /* dopo il rilascio l'ultimo rilascio e' il tag: un trenino sulla stessa punta del lavoro non ha piu' niente da giocare oltre le sentinelle */
  x = node(W, TT, 'scegli', '--sha', rm('refs/heads/lavoro/317'), '--uscita', SC); const s2 = JSON.parse(fs.readFileSync(SC, 'utf8'));
  ok(s2.base.come.includes('tag v' + V1) && s2.tipo === 'trenino', `D9 dopo il rilascio la base e' il tag: ${s2.base.come} · toccati ${s2.toccati.join(', ') || 'nessuno'} · ${s2.guardiani.length} guardiani`);
} catch (err) { ok(false, 'percorso D interrotto: ' + (err.stderr || err.message).toString().slice(-600)); }
finally { try { fs.rmSync(TMP, { recursive: true, force: true }); } catch {} }

console.log(`\n${fall ? `❌ ROSSO: ${fall} controlli falliti` : '✅ VERDE'}${NO ? ' (CPM_NO_G317=1: atteso ROSSO)' : ''}${process.env.CPM_NO_G328 === '1' ? ' (CPM_NO_G328=1: atteso ROSSO)' : ''}${process.env.CPM_NO_G329 === '1' ? ' (CPM_NO_G329=1: atteso ROSSO)' : ''}`);
process.exit(fall ? 1 : 0);
