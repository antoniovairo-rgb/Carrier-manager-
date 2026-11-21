#!/usr/bin/env node
/* ============================================================================
   trenino-317.mjs — TRENINO, TRENO GRANDE DI NOTTE E BLOCCO DEI RILASCI (giro 317, PO-604)

   Decisioni PO del 21/11 22:35 (docs/governo/DECISIONI.md sul ramo poc): «Trenino + treno grande di notte»; rosso nuovo di
   notte → «Rilasci fermi finche' non si ripara».

     1. TRENINO: a ogni unione in lavoro/** girano SOLO i guardiani delle righe della mappa unica (MAPPA di
        tests/visual/ci-runner.mjs) toccate dal vagone + le 17 sentinelle. Il vagone e' il diff fra l'ULTIMO RILASCIO (tag v* piu'
        alto, altrimenti la punta di main, che porta la GAME_VERSION pubblicata) e la punta del ramo, dal loro antenato comune
        (`git diff base...punta`). Se un file toccato non e' coperto da nessuna regola, il trenino diventa TRENO COMPLETO (mappa
        intera) e lo dichiara.
     2. TRENO GRANDE: ogni notte (schedule) e a mano, mappa intera, sulla punta del lavoro corrente (lavoro/<numero piu' alto>) o
        di main se il lavoro e' gia' tutto rilasciato.
     3. BLOCCO: il treno grande scrive docs/governo/BLOCCO-RILASCI.json sul poc con i suoi rossi nuovi e non giudicati; la decisione
        del rilascio lo legge e si ferma finche' un treno grande successivo non ha piu' quel rosso, oppure il guardiano entra in
        ROSSI-DICHIARATI per scelta del PO.

   Regole di copertura di un file (nell'ordine):
     a. neutri: docs/**, *.md (il workflow li ignora gia' con paths-ignore: non cambiano ne' il gioco ne' i guardiani);
     b. righe della MAPPA il cui regex prende il file (anche righe fuori da src/, es. la macchina del treno);
     c. CARRIER-MANAGER-AV.html: e' il ricomposto di src/ → coperto solo se nello stesso vagone e' toccato almeno un file di src/;
     d. tests/visual/package.json: se cambiano SOLO gli script, si giocano gli script cambiati/aggiunti; altro (dipendenze) → completo;
     e. tests/visual/ci-runner.mjs: mappa-unica + i guardiani entrati in CATENE/MAPPA rispetto alla base;
     f. un file sotto tests/visual/ o tools/ che uno script npm nomina (`node <file>`) → quegli script;
     g. tutto il resto → NON COPERTO → treno completo.

   Comandi (escono 0 se hanno scritto il risultato; il workflow legge GITHUB_OUTPUT):
     scegli   [--sha S] [--base B] [--uscita f.json]  → scelta del trenino (tipo trenino|completo, guardiani, base, toccati)
     bersaglio [--uscita f.json]                       → ramo e commit del treno notturno
     blocco   --esito esito-treno.json --prec blocco.json --uscita nuovo.json   → nuovo contenuto del blocco

   Rosso del guardiano (tests/visual/trenino-317.mjs): CPM_NO_G317=1 = comportamento del giro 312 (nessun trenino: la decisione
   pretende la mappa intera e ignora il blocco). Variabili: CPM_REMOTO (origin), CPM_RAMO_MAIN (main).
   ============================================================================ */
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { execFileSync, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT_DEF = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const FILE_BLOCCO = 'docs/governo/BLOCCO-RILASCI.json';
export const FILE_RUNNER = 'tests/visual/ci-runner.mjs';
export const FILE_PKG = 'tests/visual/package.json';
const FUORI = /^ci(:|$)/;

const gitProva = (cwd, args) => spawnSync('git', args, { cwd, encoding: 'utf8', maxBuffer: 1 << 28 });
const git = (cwd, args) => { const r = gitProva(cwd, args); if (r.status !== 0) throw new Error(`git ${args.join(' ')}: ${r.stderr.trim()}`); return r.stdout.trim(); };
const leggiDa = (cwd, ref, file) => { const r = gitProva(cwd, ['show', `${ref}:${file}`]); return r.status === 0 ? r.stdout : null; };

/* ---------------------------------------------------------------- funzioni pure (le prova il guardiano) */
/** CATENE e MAPPA dal testo di ci-runner.mjs SENZA eseguirlo (stessa sabbiera di ci-treno-308 e mappa-unica-308). */
export function leggiMappa(testo) {
  const L = String(testo || '').split('\n');
  const a = L.findIndex(l => l.startsWith('const CATENE = {')), m = L.findIndex(l => l.startsWith('const MAPPA = ['));
  const z = L.findIndex((l, i) => i > m && l.startsWith('];'));
  if (a < 0 || m < 0 || z < 0) throw new Error('ci-runner.mjs: non trovo CATENE/MAPPA');
  const ctx = {}; vm.createContext(ctx);
  vm.runInContext(L.slice(a, z + 1).join('\n').replace('const CATENE', 'var CATENE').replace('const MAPPA', 'var MAPPA'), ctx);
  return { CATENE: ctx.CATENE, MAPPA: ctx.MAPPA };
}
const nomiDi = ({ CATENE, MAPPA }) => new Set([...Object.values(CATENE).flat(), ...MAPPA.flatMap(r => r[1])]);

/** Script npm che nominano un file (es. «node serata-314.mjs» ↔ tests/visual/serata-314.mjs; «node ../../tools/x.mjs» ↔ tools/x.mjs). */
export function scriptChePrendono(file, scripts) {
  const out = [];
  for (const [n, c] of Object.entries(scripts || {})) {
    if (FUORI.test(n)) continue;
    /* gli script girano da tests/visual: ogni parola del comando, letta da li', e' un percorso candidato */
    if (String(c).split(/[\s;&|()'"=]+/).some(p => p && path.posix.normalize('tests/visual/' + p) === file)) out.push(n);
  }
  return out;
}

/**
 * LA SCELTA. toccati: file del vagone; mappa: {CATENE,MAPPA} della PUNTA; mappaBase: quella della base (per ci-runner.mjs);
 * pkg/pkgBase: package.json di tests/visual alla punta e alla base (oggetti).
 * → { tipo:'trenino'|'completo', guardiani:[], sentinelle:[], perFile:{file:[...]|'neutro'}, scoperti:[], motivo }
 */
export function scegli({ toccati, mappa, mappaBase, pkg, pkgBase }) {
  const { CATENE, MAPPA } = mappa, scripts = (pkg && pkg.scripts) || {}, scriptsBase = (pkgBase && pkgBase.scripts) || {};
  const perFile = {}, scoperti = [], scelti = [];
  const tocca = (f, l) => { perFile[f] = l; scelti.push(...l); };
  const srcToccato = toccati.some(f => f.startsWith('src/'));
  for (const f of toccati) {
    if (f.startsWith('docs/') || /\.md$/i.test(f)) { perFile[f] = 'neutro'; continue; }
    const righe = MAPPA.filter(([re]) => re.test(f));
    if (righe.length) { tocca(f, [...new Set(righe.flatMap(r => r[1]))]); continue; }
    if (f === 'CARRIER-MANAGER-AV.html') { if (srcToccato) { perFile[f] = 'ricomposto di src/ (coperto dalle righe di src/)'; continue; } scoperti.push(f); continue; }
    if (f === FILE_PKG) {
      const altro = Object.keys({ ...pkg, ...pkgBase }).filter(k => k !== 'scripts' && JSON.stringify((pkg || {})[k]) !== JSON.stringify((pkgBase || {})[k]));
      if (!pkg || altro.length) { scoperti.push(f); continue; }
      const cambiati = Object.keys(scripts).filter(n => scripts[n] !== scriptsBase[n] && !FUORI.test(n));
      const tolti = Object.keys(scriptsBase).filter(n => !(n in scripts));
      tocca(f, cambiati); if (tolti.length) perFile[f + ' (tolti)'] = tolti; continue;
    }
    if (f === FILE_RUNNER) {
      const prima = mappaBase ? nomiDi(mappaBase) : new Set();
      tocca(f, ['mappa-unica', ...[...nomiDi(mappa)].filter(n => !prima.has(n) && !FUORI.test(n))]); continue;
    }
    if (f.startsWith('tests/visual/') || f.startsWith('tools/')) {
      const s = scriptChePrendono(f, scripts);
      if (s.length) { tocca(f, s); continue; }
    }
    scoperti.push(f);
  }
  const sentinelle = [...(CATENE.sentinelle || [])];
  if (scoperti.length) return { tipo: 'completo', guardiani: [], sentinelle, perFile, scoperti,
    motivo: `file non coperti da nessuna riga della mappa: ${scoperti.join(', ')} → TRENO COMPLETO (mappa intera)` };
  const guardiani = [...new Set([...scelti, ...sentinelle])].filter(n => !FUORI.test(n) && scripts[n]);
  const senzaScript = [...new Set([...scelti, ...sentinelle])].filter(n => !FUORI.test(n) && !scripts[n]);
  return { tipo: 'trenino', guardiani, sentinelle, perFile, scoperti, senza_script: senzaScript,
    motivo: `${toccati.length} file toccati, ${guardiani.length} guardiani (${sentinelle.length} sentinelle comprese)` };
}

/** Nuovo blocco dopo un treno grande: i guardiani bloccanti sono i SUOI rossi nuovi e non giudicati (il blocco precedente sparisce
 *  per chi ora e' verde o rosso noto: «si sblocca quando un treno grande successivo non ha piu' quel rosso»). */
export function nuovoBlocco(prec, esito, meta = {}) {
  const male = Object.entries((esito && esito.per_guardiano) || {}).filter(([, v]) => v.classe === 'rosso_nuovo' || v.classe === 'non_giudicato').map(([g, v]) => ({ guardiano: g, classe: v.classe }));
  const prima = new Set(((prec && prec.rossi) || []).map(x => x.guardiano));
  const sbloccati = [...prima].filter(g => !male.some(x => x.guardiano === g));
  const storia = [...((prec && prec.storia) || []), ...(prec && prec.quando ? [{ quando: prec.quando, commit: prec.commit, corsa: prec.corsa, rossi: (prec.rossi || []).map(x => x.guardiano) }] : [])].slice(-20);
  return {
    _: 'giro 317 (PO-604): BLOCCO DEI RILASCI AUTOMATICI. Lo scrive il treno grande (notte o a mano) di .github/workflows/verifica-guardiani.yml; la decisione del rilascio (tools/rilascio-vagone-312.mjs decidi) lo legge dal poc e si ferma finche\' «rossi» contiene un guardiano che non sta in ROSSI-DICHIARATI. Si sblocca da solo quando un treno grande successivo non ha piu\' quel rosso, oppure quando il PO mette il guardiano in ROSSI-DICHIARATI.',
    attivo: male.length > 0, rossi: male, sbloccati, quando: meta.quando || new Date().toISOString(), commit: (esito && esito.commit) || meta.commit || null,
    ramo: meta.ramo || (esito && esito.ramo) || null, corsa: meta.corsa || (esito && esito.corsa) || null, corsa_url: meta.corsa_url || null,
    treno: esito ? { guardiani: esito.guardiani, verdi: esito.verdi, parti: `${esito.parti_arrivate}/${esito.parti_attese}` } : null, storia,
  };
}
/** Guardiani che OGGI fermano i rilasci: quelli del blocco meno quelli dichiarati dal PO. */
export function bloccanti(blocco, rossi) {
  if (!blocco || !Array.isArray(blocco.rossi)) return [];
  const dich = { ...((rossi && rossi.banco) || {}), ...((rossi && rossi.solo_runner) || {}) };
  return blocco.rossi.map(x => x.guardiano).filter(g => !dich[g]);
}
/** Il treno grande giudica il lavoro corrente (lavoro/<numero piu' alto>) se ha qualcosa che main non ha, altrimenti main. */
export function sceltaBersaglio(rami, contieneMain) {
  const num = rami.map(r => [r, /^lavoro\/(\d+)$/.exec(r.nome)]).filter(([, m]) => m).sort((a, b) => +b[1][1] - +a[1][1]);
  const lav = num.length ? num[0][0] : null;
  if (lav && !contieneMain(lav.sha)) return { ramo: lav.nome, sha: lav.sha, perche: `lavoro corrente ${lav.nome}: ha commit che main non ha` };
  const m = rami.find(r => r.nome === 'main');
  return m ? { ramo: 'main', sha: m.sha, perche: lav ? `${lav.nome} e' gia' tutto in main` : 'nessun ramo lavoro/<numero>' } : null;
}

/* ---------------------------------------------------------------- git */
/** Ultimo rilascio: il tag v<versione> piu' alto (raggiungibile o no), altrimenti la punta di main. */
export function ultimoRilascio(cwd, remoto = process.env.CPM_REMOTO || 'origin', main = process.env.CPM_RAMO_MAIN || 'main') {
  const tags = gitProva(cwd, ['tag', '--list', 'v*']).stdout.split('\n').filter(t => /^v\d+(\.\d+)+$/.test(t));
  const cmp = (a, b) => { const x = a.slice(1).split('.').map(Number), y = b.slice(1).split('.').map(Number); for (let i = 0; i < Math.max(x.length, y.length); i++) { const d = (x[i] || 0) - (y[i] || 0); if (d) return d; } return 0; };
  if (tags.length) { const t = tags.sort(cmp).at(-1); return { ref: t, sha: git(cwd, ['rev-parse', `${t}^{commit}`]), come: `tag ${t}` }; }
  const r = gitProva(cwd, ['rev-parse', '-q', '--verify', `refs/remotes/${remoto}/${main}`]);
  if (r.status === 0) return { ref: `${remoto}/${main}`, sha: r.stdout.trim(), come: `nessun tag v*: punta di ${remoto}/${main}` };
  return { ref: main, sha: git(cwd, ['rev-parse', main]), come: `nessun tag v*: punta di ${main} locale` };
}
const pkgDa = (cwd, ref) => { const t = leggiDa(cwd, ref, FILE_PKG); try { return t ? JSON.parse(t) : null; } catch { return null; } };
/** Scelta dal repository: diff fra l'ultimo rilascio e sha (dal loro antenato comune). */
export function sceltaDaGit(cwd, sha, baseRef) {
  const ult = baseRef ? { ref: baseRef, sha: git(cwd, ['rev-parse', `${baseRef}^{commit}`]), come: `base data: ${baseRef}` } : ultimoRilascio(cwd);
  const mb = git(cwd, ['merge-base', ult.sha, sha]);
  const toccati = git(cwd, ['diff', '--name-only', mb, sha]).split('\n').filter(Boolean);
  const mappa = leggiMappa(leggiDa(cwd, sha, FILE_RUNNER));
  let mappaBase = null; try { mappaBase = leggiMappa(leggiDa(cwd, mb, FILE_RUNNER)); } catch {}
  const s = scegli({ toccati, mappa, mappaBase, pkg: pkgDa(cwd, sha), pkgBase: pkgDa(cwd, mb) });
  return { ...s, sha, base: { ...ult, merge_base: mb }, toccati };
}

/* ---------------------------------------------------------------- comandi */
function args() { const a = process.argv.slice(3), o = {}; for (let i = 0; i < a.length; i++) if (a[i].startsWith('--')) { const k = a[i].slice(2); o[k] = a[i + 1] && !a[i + 1].startsWith('--') ? a[++i] : true; } return o; }
const scriviOutput = (k, v) => { if (process.env.GITHUB_OUTPUT) fs.appendFileSync(process.env.GITHUB_OUTPUT, `${k}=${v}\n`); };
const riassunto = t => { if (process.env.GITHUB_STEP_SUMMARY) fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, t + '\n'); };

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const cmd = process.argv[2], o = args(), cwd = path.resolve(o.cwd || ROOT_DEF);
  try {
    if (cmd === 'scegli') {
      const sha = o.sha || git(cwd, ['rev-parse', 'HEAD']);
      const s = sceltaDaGit(cwd, sha, o.base && o.base !== true ? o.base : null);
      if (o.uscita) fs.writeFileSync(o.uscita, JSON.stringify(s, null, 1) + '\n');
      console.log(JSON.stringify(s, null, 1));
      scriviOutput('tipo', s.tipo); scriviOutput('elenco', s.tipo === 'trenino' ? s.guardiani.join(' ') : '');
      riassunto(`### Trenino (giro 317): ${s.tipo === 'trenino' ? `${s.guardiani.length} guardiani` : '**TRENO COMPLETO**'}\n\nultimo rilascio: ${s.base.come} (${s.base.sha.slice(0, 8)}, antenato comune ${s.base.merge_base.slice(0, 8)}) · ${s.toccati.length} file toccati\n\n${s.motivo}\n`);
    } else if (cmd === 'bersaglio') {
      const remoto = process.env.CPM_REMOTO || 'origin', main = process.env.CPM_RAMO_MAIN || 'main';
      const righe = git(cwd, ['ls-remote', remoto, 'refs/heads/lavoro/*', `refs/heads/${main}`]).split('\n').filter(Boolean)
        .map(l => { const [sha, ref] = l.split('\t'); return { sha, nome: ref.replace('refs/heads/', '') }; });
      const rami = righe.map(r => (r.nome === main ? { ...r, nome: 'main' } : r));
      const lavori = rami.filter(r => /^lavoro\/\d+$/.test(r.nome)).map(r => r.nome);
      if (lavori.length) gitProva(cwd, ['fetch', '-q', remoto, ...lavori.map(r => `+refs/heads/${r}:refs/remotes/${remoto}/${r}`), `+refs/heads/${main}:refs/remotes/${remoto}/${main}`]);
      const mainSha = (rami.find(r => r.nome === 'main') || {}).sha;
      const b = sceltaBersaglio(rami, sha => !!mainSha && gitProva(cwd, ['merge-base', '--is-ancestor', sha, mainSha]).status === 0);
      if (!b) throw new Error('nessun bersaglio (ne\' lavoro/<numero> ne\' main)');
      if (o.uscita) fs.writeFileSync(o.uscita, JSON.stringify(b, null, 1) + '\n');
      console.log(JSON.stringify(b)); scriviOutput('ramo', b.ramo); scriviOutput('sha', b.sha);
      riassunto(`### Treno grande: bersaglio \`${b.ramo}\` ${b.sha.slice(0, 8)} — ${b.perche}\n`);
    } else if (cmd === 'blocco') {
      let esito = null, prec = null; try { esito = JSON.parse(fs.readFileSync(o.esito, 'utf8')); } catch {}
      try { prec = JSON.parse(fs.readFileSync(o.prec, 'utf8')); } catch {}
      /* esito mancante = treno non giudicato: il blocco si ACCENDE (non giudicato = rosso), mai si spegne per assenza di dati */
      const b = esito ? nuovoBlocco(prec, esito, { corsa: process.env.CPM_CORSA, corsa_url: process.env.CPM_CORSA_URL, ramo: o.ramo })
        : { ...nuovoBlocco(prec, { per_guardiano: { 'treno-grande': { classe: 'non_giudicato' } } }, { corsa: process.env.CPM_CORSA, corsa_url: process.env.CPM_CORSA_URL, ramo: o.ramo }), nota: 'esito del treno grande mancante' };
      fs.writeFileSync(o.uscita, JSON.stringify(b, null, 1) + '\n');
      console.log(JSON.stringify({ attivo: b.attivo, rossi: b.rossi, sbloccati: b.sbloccati }));
      scriviOutput('attivo', String(b.attivo));
      riassunto(`### Blocco dei rilasci: ${b.attivo ? `⛔ ATTIVO (${b.rossi.map(x => x.guardiano).join(', ')})` : '✅ nessun blocco'}${b.sbloccati.length ? ` · sbloccati: ${b.sbloccati.join(', ')}` : ''}\n`);
    } else { console.error('uso: node tools/trenino-317.mjs scegli|bersaglio|blocco [--opzioni]'); process.exit(2); }
  } catch (err) { console.error('⛔ ' + err.message); riassunto(`⛔ **trenino ${cmd}**: ${err.message}`); process.exit(1); }
}
