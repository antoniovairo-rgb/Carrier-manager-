#!/usr/bin/env node
/* ============================================================================
   rilascio-vagone-312.mjs — IL RILASCIO AUTOMATICO DI UN VAGONE (giro 312, PO-600)

   Decisioni PO del 21/11 17:25 (docs/governo/DECISIONI.md sul ramo poc):
     1. un vagone va in produzione da solo quando il treno sulla sua unione in lavoro/** finisce con NESSUN ROSSO NUOVO
        (solo rossi di docs/governo/ROSSI-DICHIARATI.json); un rosso nuovo o un «non giudicato» ferma tutto;
     2. numero +1 a ogni vagone (7.999.201, 202, ...), nota scritta in automatico dai titoli delle unioni
        «Unione sviluppo/... in lavoro/...» dal rilascio precedente;
     3. niente mail: il rilascio lascia tracce leggibili SENZA credenziali (tag annotato, docs/governo/ULTIMO-RILASCIO.json
        su main, stato del commit «rilascio-vagone»).

   Tre comandi, chiamati dal job «Rilascio» di .github/workflows/verifica-guardiani.yml (e dal guardiano
   tests/visual/rilascio-312.mjs su un remoto finto):

     decidi    --esito esito-treno.json --modo auto|prova --ramo R --sha S [--rosso-finto] --uscita decisione.json
               legge l'esito del treno, l'interruttore (docs/governo/RILASCIO-AUTO.json sul ramo poc + variabile
               CPM_RILASCIO_AUTO), la punta del ramo sul remoto e le unioni dal rilascio precedente; scrive la decisione.
               Esce SEMPRE 0: chi legge la decisione e' il workflow (rilascia=true|false in GITHUB_OUTPUT).
     prepara   --decisione decisione.json
               in locale: alza GAME_VERSION con la nota (src/07), build-src, check-src IDENTICO, commit sul lavoro,
               unione --no-ff nel poc (conflitti in docs/governo -> versione del poc, altri conflitti -> FERMO),
               ROSSI-DICHIARATI.versione e ULTIMO-RILASCIO.json, controllo che main sia antenato (fast-forward), tag annotato.
     pubblica  --decisione decisione.json
               UN SOLO push --atomic (lavoro, poc, main, tag): o entrano tutti o nessuno; MAI force, un ramo che non
               avanza in fast-forward fa rifiutare l'intero push.

   Modo «prova»: stessi passi, ma i rami di destinazione sono rami nuovi prova/cd-<corsa>-{lavoro,poc,main} creati dalle
   stesse basi (lavoro provato, origin/poc, origin/main), il tag si chiama prova-v<versione>-<corsa> e il deploy si salta.
   L'interruttore in prova si legge e si riporta ma non ferma (la prova e' un avvio a mano esplicito).

   Rosso del guardiano: CPM_NO_G312=1 fa ignorare a «decidi» i rossi nuovi e i non giudicati (il difetto che il guardiano
   deve vedere). Variabili: CPM_REMOTO (default origin), CPM_RAMO_POC (default poc/marioprada-character-system),
   CPM_RAMO_MAIN (default main), CPM_RILASCIO_AUTO (variabile di repository; «spento» ferma sempre), CPM_CORSA, CPM_CORSA_URL.
   ============================================================================ */
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT_DEF = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const FILE_VERSIONE = 'src/07-versione-save-interviste.jsx';
export const FILE_ROSSI = 'docs/governo/ROSSI-DICHIARATI.json';
export const FILE_INTERRUTTORE = 'docs/governo/RILASCIO-AUTO.json';
export const FILE_ULTIMO = 'docs/governo/ULTIMO-RILASCIO.json';
const FILE_BLOCCO_317 = 'docs/governo/BLOCCO-RILASCI.json';
const CLASSI_BUONE = new Set(['verde', 'rosso_noto', 'rosso_noto_runner']);
const RE_UNIONE = /^Unione sviluppo\/\S+ in (lavoro|prova)\/\S+/;

/* ---------------------------------------------------------------- funzioni pure (le prova il guardiano) */
export function confrontaVersioni(a, b) {
  const x = String(a).split('.').map(Number), y = String(b).split('.').map(Number);
  for (let i = 0; i < Math.max(x.length, y.length); i++) { const d = (x[i] || 0) - (y[i] || 0); if (d) return d; }
  return 0;
}
/** +1 sull'ultima cifra della versione PIU' ALTA fra quelle viste (lavoro, poc, ultimo tag). */
export function prossimaVersione(viste) {
  const ok = viste.filter(v => /^\d+(\.\d+)+$/.test(String(v || '')));
  if (!ok.length) throw new Error('nessuna versione leggibile');
  const max = ok.sort(confrontaVersioni).at(-1).split('.').map(Number);
  max[max.length - 1] += 1;
  return max.join('.');
}
export function leggiVersione(testo) {
  const m = /^const GAME_VERSION="([0-9.]+)";/m.exec(testo);
  return m ? m[1] : null;
}
/** Nota di versione su UNA riga di commento JS: mai «*\/» dentro, mai a-capo. */
export function componiNota({ versione, precedente, unioni, corsa }) {
  const pulisci = s => String(s).replace(/\s+/g, ' ').replace(/\*\//g, '* /').trim();
  const elenco = unioni.length ? unioni.map(pulisci).join(' · ') : 'nessuna unione dichiarata';
  return pulisci(`[${versione}] vagone rilasciato in automatico dal treno (giro 312, PO-600${corsa ? ', corsa ' + corsa : ''}): ${elenco}. Rossi dichiarati: quelli della ${precedente}.`);
}
export function alzaVersione(testo, versione, nota) {
  const righe = testo.split('\n');
  const idx = righe.map((r, i) => (r.startsWith('const GAME_VERSION="') ? i : -1)).filter(i => i >= 0);
  if (idx.length !== 1) throw new Error(`attesa UNA riga «const GAME_VERSION=», trovate ${idx.length}`);
  const vecchia = righe[idx[0]];
  if (!/^const GAME_VERSION="[0-9.]+";\/\*.*\*\/$/.test(vecchia)) throw new Error('la riga di GAME_VERSION non ha la forma «const GAME_VERSION="x";/* nota *\/»');
  righe[idx[0]] = `const GAME_VERSION="${versione}";/* ${nota} */`;
  return righe.join('\n');
}

/** LA DECISIONE. Tutto cio' che ferma il rilascio finisce in `motivi`; si rilascia solo con `motivi` vuoto. */
/* [giro 317, PO-604] la decisione accetta anche l'esito di un TRENINO, ma solo se coincide con la scelta che il rilascio RICALCOLA da
   se' (sceltaAttesa = tools/trenino-317.mjs sceltaDaGit sul commit provato: stessa base, ogni guardiano scelto giudicato): mai un
   elenco dato a mano. E si ferma se il BLOCCO del treno grande (docs/governo/BLOCCO-RILASCI.json sul poc) ha un guardiano che non sta
   in ROSSI-DICHIARATI. senza317 (CPM_NO_G317=1) = comportamento del giro 312: pretende la mappa intera e non legge il blocco. */
export function decidi({ esito, modo, ramo, sha, punta, interruttore, variabile, unioni, rossoFinto, senzaGuardia, sceltaAttesa, blocco, rossiDich, senza317, bloccanti }) {
  const motivi = [], note = [];
  if (!['auto', 'prova'].includes(modo)) motivi.push(`modo sconosciuto «${modo}»`);
  /* interruttore: la variabile «spento» ferma sempre; il file sul poc deve dire attivo:true (in prova si riporta e basta) */
  if (String(variabile || '').trim().toLowerCase() === 'spento') motivi.push('interruttore: variabile di repository CPM_RILASCIO_AUTO=spento');
  const acceso = !!(interruttore && interruttore.attivo === true);
  if (!acceso) (modo === 'prova' ? note : motivi).push(`interruttore: ${FILE_INTERRUTTORE} sul poc ${interruttore ? 'dice attivo=' + JSON.stringify(interruttore.attivo) : 'manca'}${modo === 'prova' ? ' (in prova non ferma)' : ''}`);
  if (modo === 'auto' && !/^lavoro\//.test(ramo || '')) motivi.push(`il ramo «${ramo}» non e' un ramo lavoro/**`);
  if (!sha) motivi.push('commit provato sconosciuto');
  else if (punta !== sha) motivi.push(`il ramo si e' mosso: punta ${punta || 'non trovata'} invece del commit provato ${sha}`);
  let e = esito ? JSON.parse(JSON.stringify(esito)) : null;
  if (e && rossoFinto) {
    if (modo !== 'prova') motivi.push('rosso finto chiesto fuori dal modo prova');
    e.rossi_nuovi = [...(e.rossi_nuovi || []), 'finto-312'];
    e.per_guardiano = { ...(e.per_guardiano || {}), 'finto-312': { classe: 'rosso_nuovo', s: 0, parte: 'finta' } };
  }
  if (!e) motivi.push('esito del treno mancante (riepilogo non arrivato): non giudicato');
  else {
    if (e.commit && sha && e.commit !== sha) motivi.push(`l'esito e' del commit ${e.commit}, non di ${sha}`);
    if (!(e.guardiani > 0)) motivi.push('il treno non ha giudicato nessun guardiano');
    if (e.parti_attese == null || e.parti_arrivate !== e.parti_attese) motivi.push(`parti arrivate ${e.parti_arrivate} su ${e.parti_attese ?? '?'}`);
    if (senza317) { if (modo === 'auto' && e.mappa_intera !== true) motivi.push("il treno non ha girato la mappa intera (elenco dato a mano)"); }
    else if (e.tipo === 'trenino') {
      const a = sceltaAttesa;
      if (!a) motivi.push('trenino: la scelta attesa non si e\' potuta ricalcolare');
      else if (a.tipo !== 'trenino') motivi.push(`trenino non valido: il vagone tocca file non coperti, serve il treno completo (${(a.scoperti || []).join(', ')})`);
      else {
        if (modo === 'auto' && (!e.scelta || e.scelta.merge_base !== a.base.merge_base)) motivi.push(`trenino su una base diversa dall'ultimo rilascio: ${e.scelta ? e.scelta.merge_base : '?'} invece di ${a.base.merge_base}`);
        const mancano = a.guardiani.filter(g => !(e.per_guardiano || {})[g]);
        if (mancano.length) motivi.push(`trenino incompleto: ${mancano.length} guardiani scelti non giudicati (${mancano.slice(0, 6).join(', ')})`);
      }
    } else if (modo === 'auto' && e.mappa_intera !== true) motivi.push(`il treno non e' ne' la mappa intera ne' un trenino (tipo ${e.tipo || '?'}: elenco dato a mano)`);
    if (!senzaGuardia) {
      const nuovi = e.rossi_nuovi || [], ng = e.non_giudicati || [];
      const altri = Object.entries(e.per_guardiano || {}).filter(([, v]) => !CLASSI_BUONE.has(v.classe)).map(([g, v]) => `${g} (${v.classe})`);
      if (nuovi.length) motivi.push(`rossi nuovi (${nuovi.length}): ${nuovi.join(', ')}`);
      if (ng.length) motivi.push(`non giudicati (${ng.length}): ${ng.join(', ')}`);
      if (altri.length && !nuovi.length && !ng.length) motivi.push(`guardiani fuori classe: ${altri.join(', ')}`);
    }
  }
  if (!senza317) {
    const b = (bloccanti || (() => []))(blocco, rossiDich);
    if (b.length) motivi.push(`rilasci BLOCCATI dal treno grande (${FILE_BLOCCO_317}, corsa ${blocco.corsa || '?'}): ${b.join(', ')} — si sblocca con un treno grande senza quel rosso o col guardiano in ROSSI-DICHIARATI`);
  }
  if (!unioni || !unioni.length) motivi.push("nessuna unione «Unione sviluppo/... in lavoro/...» dal rilascio precedente: non c'e' un vagone da rilasciare");
  return { rilascia: motivi.length === 0, motivi, note };
}

/* ---------------------------------------------------------------- git (comandi sul repository vero o sul remoto finto) */
const git = (cwd, args, opt = {}) => execFileSync('git', args, { cwd, encoding: 'utf8', maxBuffer: 1 << 28, stdio: ['ignore', 'pipe', opt.muto ? 'ignore' : 'pipe'], ...opt }).trim();
const gitProva = (cwd, args) => spawnSync('git', args, { cwd, encoding: 'utf8', maxBuffer: 1 << 28 });
const leggiDa = (cwd, ref, file) => { const r = gitProva(cwd, ['show', `${ref}:${file}`]); return r.status === 0 ? r.stdout : null; };
const jsonDa = (cwd, ref, file) => { const t = leggiDa(cwd, ref, file); try { return t == null ? null : JSON.parse(t); } catch { return null; } };

function contesto(cwd) {
  const remoto = process.env.CPM_REMOTO || 'origin';
  return { cwd, remoto, poc: process.env.CPM_RAMO_POC || 'poc/marioprada-character-system', main: process.env.CPM_RAMO_MAIN || 'main' };
}
function punteRemote(c, rami) {
  git(c.cwd, ['fetch', '-q', c.remoto, ...rami.map(r => `+refs/heads/${r}:refs/remotes/${c.remoto}/${r}`), '--tags']);
  return Object.fromEntries(rami.map(r => { const x = gitProva(c.cwd, ['rev-parse', '-q', '--verify', `refs/remotes/${c.remoto}/${r}`]); return [r, x.status === 0 ? x.stdout.trim() : null]; }));
}
export function unioniDal(cwd, base, sha) {
  const out = git(cwd, ['log', '--merges', '--first-parent', '--reverse', '--format=%s', `${base}..${sha}`]);
  return out.split('\n').filter(t => RE_UNIONE.test(t));
}

function args() {
  const a = process.argv.slice(3), o = {};
  for (let i = 0; i < a.length; i++) if (a[i].startsWith('--')) { const k = a[i].slice(2); o[k] = a[i + 1] && !a[i + 1].startsWith('--') ? a[++i] : true; }
  return o;
}
const scriviOutput = (k, v) => { if (process.env.GITHUB_OUTPUT) fs.appendFileSync(process.env.GITHUB_OUTPUT, `${k}=${v}\n`); };
const riassunto = t => { if (process.env.GITHUB_STEP_SUMMARY) fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, t + '\n'); };

async function cmdDecidi(o, cwd) {
  const c = contesto(cwd), modo = o.modo || 'auto', ramo = o.ramo, sha = o.sha;
  let esito = null; try { esito = JSON.parse(fs.readFileSync(o.esito, 'utf8')); } catch {}
  const punte = punteRemote(c, [ramo, c.poc, c.main].filter(Boolean));
  const basePoc = `refs/remotes/${c.remoto}/${c.poc}`;
  let unioni = []; try { unioni = sha ? unioniDal(cwd, basePoc, sha) : []; } catch {}
  const interruttore = jsonDa(cwd, basePoc, FILE_INTERRUTTORE);
  /* [giro 317] scelta del trenino ricalcolata da qui (mai presa dall'esito) + blocco e rossi dichiarati dal poc */
  const T = await import(path.join(cwd, 'tools/trenino-317.mjs')).catch(() => import('./trenino-317.mjs'));
  let sceltaAttesa = null;
  if (esito && esito.tipo === 'trenino' && sha) { try {
    sceltaAttesa = T.sceltaDaGit(cwd, sha, modo === 'prova' && esito.scelta ? esito.scelta.merge_base : null);
  } catch (err) { console.error('scelta attesa: ' + err.message); } }
  const refBlocco = process.env.CPM_REF_BLOCCO || basePoc;
  const blocco = jsonDa(cwd, refBlocco, FILE_BLOCCO_317), rossiDich = jsonDa(cwd, basePoc, FILE_ROSSI);
  const d = decidi({ esito, modo, ramo, sha, punta: punte[ramo], interruttore, variabile: process.env.CPM_RILASCIO_AUTO, unioni,
    rossoFinto: !!o['rosso-finto'], senzaGuardia: process.env.CPM_NO_G312 === '1', sceltaAttesa, blocco, rossiDich, bloccanti: T.bloccanti,
    senza317: process.env.CPM_NO_G317 === '1' });
  if (sceltaAttesa && modo === 'prova') d.note.push(`prova: il trenino e' ricalcolato sulla base che dichiara (${sceltaAttesa.base.merge_base.slice(0, 8)}), non sull'ultimo rilascio`);
  /* versione e nota si calcolano anche quando ci si ferma: l'esito dice cosa SAREBBE uscito */
  const corsa = process.env.CPM_CORSA || '';
  const vLav = sha ? leggiVersione(leggiDa(cwd, sha, FILE_VERSIONE) || '') : null;
  const vPoc = leggiVersione(leggiDa(cwd, basePoc, FILE_VERSIONE) || '');
  const tags = git(cwd, ['tag', '--list', 'v*']).split('\n').filter(Boolean).map(t => t.slice(1));
  let versione = null, nota = null; try { versione = prossimaVersione([vLav, vPoc, ...tags]); nota = componiNota({ versione, precedente: vPoc || vLav, unioni, corsa }); } catch (err) { d.rilascia = false; d.motivi.push('versione: ' + err.message); }
  const tag = modo === 'prova' ? `prova-v${versione}-${corsa || 'locale'}` : `v${versione}`;
  if (versione && gitProva(cwd, ['rev-parse', '-q', '--verify', `refs/tags/${tag}`]).status === 0) { d.rilascia = false; d.motivi.push(`il tag ${tag} esiste gia'`); }
  const suff = corsa || 'locale';
  const dest = modo === 'prova'
    ? { lavoro: `prova/cd-${suff}-lavoro`, poc: `prova/cd-${suff}-poc`, main: `prova/cd-${suff}-main` }
    : { lavoro: ramo, poc: c.poc, main: c.main };
  const out = { quando: new Date().toISOString(), modo, ramo, sha, corsa, corsa_url: process.env.CPM_CORSA_URL || null, ...d,
    versione, precedente: vPoc, versione_lavoro: vLav, nota, tag, dest, basi: { lavoro: sha, poc: punte[c.poc], main: punte[c.main] }, unioni,
    blocco: blocco ? { attivo: !!blocco.attivo, rossi: (blocco.rossi || []).map(x => x.guardiano), corsa: blocco.corsa || null } : null,
    trenino: sceltaAttesa ? { tipo: sceltaAttesa.tipo, guardiani: sceltaAttesa.guardiani.length, merge_base: sceltaAttesa.base.merge_base, base: sceltaAttesa.base.come } : null,
    treno: esito ? { tipo: esito.tipo || null, guardiani: esito.guardiani, verdi: esito.verdi, parti: `${esito.parti_arrivate}/${esito.parti_attese}`, mappa_intera: esito.mappa_intera,
      rossi_nuovi: esito.rossi_nuovi, non_giudicati: esito.non_giudicati, rossi_noti: esito.rossi_noti, rossi_noti_runner: esito.rossi_noti_runner } : null };
  if (o.uscita) fs.writeFileSync(o.uscita, JSON.stringify(out, null, 1) + '\n');
  console.log(JSON.stringify(out, null, 1));
  scriviOutput('rilascia', String(d.rilascia)); scriviOutput('versione', versione || ''); scriviOutput('tag', tag);
  riassunto(`## Rilascio del vagone (${modo})\n\n**${d.rilascia ? `SI RILASCIA ${versione}` : 'FERMO: non si rilascia'}** · commit ${sha} su \`${ramo}\`\n\n`
    + (d.motivi.length ? d.motivi.map(m => `- ⛔ ${m}`).join('\n') + '\n' : '') + (d.note.length ? d.note.map(m => `- ℹ️ ${m}`).join('\n') + '\n' : '')
    + `\nunioni: ${unioni.join(' · ') || '—'}\n`);
  return out;
}

function sostituisciCampoVersione(cwd, versione) {
  const f = path.join(cwd, FILE_ROSSI); if (!fs.existsSync(f)) return false;
  const j = JSON.parse(fs.readFileSync(f, 'utf8')); if (j.versione === versione) return false;
  j.versione = versione; fs.writeFileSync(f, JSON.stringify(j, null, 1) + '\n'); return true;
}

function cmdPrepara(o, cwd) {
  const d = JSON.parse(fs.readFileSync(o.decisione, 'utf8'));
  if (!d.rilascia) throw new Error('la decisione dice di NON rilasciare');
  const c = contesto(cwd), chi = ['-c', 'user.name=github-actions[bot]', '-c', 'user.email=41898282+github-actions[bot]@users.noreply.github.com'];
  /* 1. sul lavoro: versione + nota, build, check IDENTICO, campo versione dei rossi dichiarati, commit */
  git(cwd, ['checkout', '-q', '-B', 'rilascio-312/lavoro', d.sha]);
  const fv = path.join(cwd, FILE_VERSIONE);
  fs.writeFileSync(fv, alzaVersione(fs.readFileSync(fv, 'utf8'), d.versione, d.nota));
  execFileSync('node', ['tools/build-src.mjs'], { cwd, stdio: 'inherit', env: { ...process.env, CPM_FORZA_BUILD: '1' } });
  const chk = spawnSync('node', ['tools/check-src.mjs'], { cwd, encoding: 'utf8' });
  process.stdout.write(chk.stdout || ''); if (chk.status !== 0) throw new Error('check-src: il ricomposto NON e\' identico\n' + chk.stdout + chk.stderr);
  const html = fs.readFileSync(path.join(cwd, 'CARRIER-MANAGER-AV.html'), 'utf8');
  if (leggiVersione(html) !== d.versione) throw new Error(`CARRIER-MANAGER-AV.html non porta GAME_VERSION ${d.versione}`);
  sostituisciCampoVersione(cwd, d.versione);
  git(cwd, ['add', FILE_VERSIONE, 'CARRIER-MANAGER-AV.html', ...(fs.existsSync(path.join(cwd, FILE_ROSSI)) ? [FILE_ROSSI] : [])]);
  git(cwd, [...chi, 'commit', '-q', '-m', `${d.versione}: GAME_VERSION e nota (rilascio automatico del vagone)`, '-m', `${d.nota}\n\nTreno: ${d.corsa_url || d.corsa || 'locale'}`]);
  const lav = git(cwd, ['rev-parse', 'HEAD']);
  /* 2. sul poc: unione --no-ff; conflitti in docs/governo -> versione del poc; altri -> FERMO */
  git(cwd, ['checkout', '-q', '-B', 'rilascio-312/poc', d.basi.poc]);
  const m = gitProva(cwd, [...chi, 'merge', '--no-ff', '--no-commit', 'rilascio-312/lavoro']);
  if (m.status !== 0) {
    const conf = git(cwd, ['diff', '--name-only', '--diff-filter=U']).split('\n').filter(Boolean);
    const altri = conf.filter(f => !f.startsWith('docs/governo/'));
    if (!conf.length || altri.length) { gitProva(cwd, ['merge', '--abort']); throw new Error(`unione nel poc con conflitti fuori da docs/governo: ${altri.join(', ') || m.stderr}`); }
    for (const f of conf) {
      if (gitProva(cwd, ['cat-file', '-e', `HEAD:${f}`]).status === 0) git(cwd, ['checkout', '--ours', '--', f]), git(cwd, ['add', f]);
      else git(cwd, ['rm', '-q', '--', f]);
    }
    console.log(`conflitti risolti con la versione del poc: ${conf.join(', ')}`);
  }
  if (sostituisciCampoVersione(cwd, d.versione)) git(cwd, ['add', FILE_ROSSI]);
  const ultimo = { versione: d.versione, precedente: d.precedente, quando: new Date().toISOString(), tag: d.tag, modo: d.modo,
    ramo_lavoro: d.ramo, commit_provato: d.sha, commit_lavoro: lav, corsa_treno: d.corsa, corsa_url: d.corsa_url, unioni: d.unioni, nota: d.nota, treno: d.treno,
    deploy: d.modo === 'prova' ? 'saltato (modo prova)' : 'avviato dopo il push: esito nello stato del commit «rilascio-vagone» e nella corsa' };
  fs.mkdirSync(path.dirname(path.join(cwd, FILE_ULTIMO)), { recursive: true });
  fs.writeFileSync(path.join(cwd, FILE_ULTIMO), JSON.stringify(ultimo, null, 1) + '\n');
  git(cwd, ['add', FILE_ULTIMO]);
  const titoloLav = d.ramo;
  git(cwd, [...chi, 'commit', '-q', '-m', `${d.versione}: unione di ${titoloLav} (rilascio automatico del vagone)`, '-m', `${d.nota}\n\nTreno: ${d.corsa_url || d.corsa || 'locale'}`]);
  const poc = git(cwd, ['rev-parse', 'HEAD']);
  /* 3. main deve avanzare in fast-forward fino al nuovo poc */
  if (d.basi.main && gitProva(cwd, ['merge-base', '--is-ancestor', d.basi.main, poc]).status !== 0) throw new Error(`main (${d.basi.main}) non e' antenato del nuovo poc: niente fast-forward, mi fermo`);
  /* 4. tag annotato: il messaggio e' leggibile senza credenziali (API git/tags) */
  git(cwd, [...chi, 'tag', '-a', d.tag, poc, '-m', `${d.versione} — rilascio automatico del vagone\n\n${d.nota}\n\nTreno: ${d.corsa_url || d.corsa || 'locale'} · ${d.treno ? `${d.treno.verdi}/${d.treno.guardiani} verdi, rossi noti ${(d.treno.rossi_noti || []).length}, noti del runner ${(d.treno.rossi_noti_runner || []).length}` : ''}`]);
  const r = { ...d, commit_lavoro: lav, commit_poc: poc };
  fs.writeFileSync(o.decisione, JSON.stringify(r, null, 1) + '\n');
  console.log(`pronto: lavoro ${lav} · poc=main ${poc} · tag ${d.tag}`);
  scriviOutput('commit_poc', poc);
  return r;
}

function cmdPubblica(o, cwd) {
  const d = JSON.parse(fs.readFileSync(o.decisione, 'utf8')), c = contesto(cwd);
  if (!d.commit_poc || !d.commit_lavoro) throw new Error('prima «prepara»');
  /* UN push atomico, senza force: se un ramo non avanza in fast-forward il server rifiuta TUTTO */
  const refs = [`${d.commit_lavoro}:refs/heads/${d.dest.lavoro}`, `${d.commit_poc}:refs/heads/${d.dest.poc}`, `${d.commit_poc}:refs/heads/${d.dest.main}`, `refs/tags/${d.tag}:refs/tags/${d.tag}`];
  const r = spawnSync('git', ['push', '--atomic', '--porcelain', c.remoto, ...refs], { cwd, encoding: 'utf8' });
  process.stdout.write(r.stdout || ''); process.stderr.write(r.stderr || '');
  if (r.status !== 0) throw new Error('push atomico rifiutato (niente e\' stato pubblicato)');
  console.log(`pubblicato ${d.versione}: ${refs.join(' · ')}`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const cmd = process.argv[2], o = args(), cwd = path.resolve(o.cwd || ROOT_DEF);
  try {
    if (cmd === 'decidi') await cmdDecidi(o, cwd);
    else if (cmd === 'prepara') cmdPrepara(o, cwd);
    else if (cmd === 'pubblica') cmdPubblica(o, cwd);
    else { console.error('uso: node tools/rilascio-vagone-312.mjs decidi|prepara|pubblica [--opzioni]'); process.exit(2); }
  } catch (err) { console.error('⛔ ' + err.message); riassunto(`⛔ **${cmd}**: ${err.message}`); process.exit(1); }
}
