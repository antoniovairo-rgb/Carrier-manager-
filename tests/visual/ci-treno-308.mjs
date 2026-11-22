#!/usr/bin/env node
/* [giro 308, PO-592/517/527 — decisione PO 20/11 21:05 «Treno + controlli a livelli» e 23:40 «mappa intera, parti da max 120 minuti»]
   IL TRENO: la mappa INTERA dei guardiani sui runner standard di GitHub, divisa in parti bilanciate per durata.
   Nasce da tests/visual/ci-parti-303.mjs (giro 303) con quattro differenze:
     1. le durate vengono da docs/governo/DURATE-GUARDIANI.json (misurate, fonte per fonte; tools/durate-guardiani-308.mjs);
     2. il numero di parti NON si sceglie: si calcola perche' nessuna parte superi l'obiettivo (default 70 min attesi, cosi' anche un
        runner 1,7 volte piu' lento del banco — misurato nel giro 303 — resta sotto il tetto di 120 del job);
     3. una parte ha un BILANCIO di tempo: un guardiano che sfora il resto del bilancio si ferma (= «non giudicato», che vale rosso)
        e i guardiani non ancora partiti si dichiarano «non partiti»: il job finisce prima del suo timeout invece di essere ucciso;
     4. la corsa NON fallisce mai per un guardiano rosso: ogni corsa rossa manda al PO una mail «Run failed». L'esito sta nel
        riepilogo, nell'artifact «riepilogo-totale» e in esito-treno.json; il riepilogo separa rosso nuovo / rosso noto
        (docs/governo/ROSSI-DICHIARATI.json) / rosso noto del runner / non giudicato.

     node ci-treno-308.mjs piano                 → piano + matrice (in Actions scrive `matrice=` in GITHUB_OUTPUT)
     node ci-treno-308.mjs esegui "g1 g2 g3"     → gioca i guardiani in fila (npm run -s), misura, scrive out/ci-parte/riepilogo.json; esce 0
     node ci-treno-308.mjs riunisci <cartella>   → tabella unica + classificazione dei rossi; esce 0

   Variabili: CPM_TRENO_ELENCO="g1 g2" (al posto della mappa intera) · CPM_TRENO_OBIETTIVO_S (default 4200) ·
   CPM_TRENO_BILANCIO_S (bilancio di una parte, default 6600 = 110 min) · CPM_TRENO_MATRICE (la matrice del piano, per «riunisci»).
   NON riprova i rossi (un rosso e' un rosso: confronto pulito col banco). NON scrive STABILITA.json. Non tocca il gioco. */
import fs from 'node:fs'; import path from 'node:path'; import vm from 'node:vm'; import os from 'node:os';
import { spawn } from 'node:child_process';
const QUI = path.dirname(new URL(import.meta.url).pathname), ROOT = path.resolve(QUI, '../..');
const cmd = process.argv[2];
const leggiJSON = (f, d) => { try { return JSON.parse(fs.readFileSync(f, 'utf8')); } catch { return d; } };

/* CATENE e MAPPA da ci-runner.mjs SENZA eseguirlo (sabbiera sul solo tratto dichiarativo) */
function leggiCatene() {
  const src = fs.readFileSync(path.join(QUI, 'ci-runner.mjs'), 'utf8').split('\n');
  const a = src.findIndex(l => l.startsWith('const CATENE = {')), m = src.findIndex(l => l.startsWith('const MAPPA = ['));
  const z = src.findIndex((l, i) => i > m && l.startsWith('];'));
  if (a < 0 || m < 0 || z < 0) throw new Error('ci-runner.mjs: non trovo CATENE/MAPPA');
  const ctx = {}; vm.createContext(ctx);
  vm.runInContext(src.slice(a, z + 1).join('\n').replace('const CATENE', 'var CATENE').replace('const MAPPA', 'var MAPPA'), ctx);
  return { CATENE: ctx.CATENE, MAPPA: ctx.MAPPA };
}
/* script che lanciano a loro volta una catena (o il gate pesante gia' coperto da validate-situations.yml): fuori dal treno */
const FUORI = /^ci(:|$)/;

/* [giro 317 PO-604] TIPO del treno (CPM_TRENO_TIPO): «trenino» = guardiani delle righe della mappa toccate dal vagone + sentinelle
   (tools/trenino-317.mjs scegli: diff fra l'ultimo rilascio e la punta; un file non coperto lo fa diventare «completo» = mappa intera);
   «mappa» / «notte» = mappa intera; un elenco dato a mano (CPM_TRENO_ELENCO) e' sempre «elenco» e non rilascia mai. */
async function scelta317() {
  const tipo = process.env.CPM_TRENO_ELENCO ? 'elenco' : (process.env.CPM_TRENO_TIPO || 'mappa');
  if (tipo === 'trenino' && process.env.CPM_NO_G317 === '1') return { tipo: 'mappa' };/* rosso del guardiano trenino-317: comportamento del giro 312 */
  if (tipo !== 'trenino') return { tipo };
  const T = await import(path.join(ROOT, 'tools/trenino-317.mjs'));
  const sha = process.env.CPM_TRENO_SHA || process.env.GITHUB_SHA || 'HEAD';
  const s = T.sceltaDaGit(ROOT, sha, process.env.CPM_TRENO_BASE || null);
  return { tipo: s.tipo, guardiani: s.guardiani, scelta: { base: s.base.sha, base_come: s.base.come, merge_base: s.base.merge_base, toccati: s.toccati.length, scoperti: s.scoperti, motivo: s.motivo } };
}
const S317 = cmd === 'piano' ? await scelta317() : null;
export const TETTO_GRANDE = 15, TETTO_TRENINO = 4, MACCHINE_ACCOUNT = 20;   /* [giro 326] vedi piano() */
function piano() {
  const { CATENE, MAPPA } = leggiCatene();
  const script = leggiJSON(path.join(QUI, 'package.json'), {}).scripts || {};
  let nomi = process.env.CPM_TRENO_ELENCO ? process.env.CPM_TRENO_ELENCO.split(/\s+/).filter(Boolean)
    : S317 && S317.tipo === 'trenino' ? S317.guardiani
    : [...Object.values(CATENE).flat(), ...MAPPA.flatMap(r => r[1])];
  nomi = [...new Set(nomi)].filter(n => !FUORI.test(n));
  const senza = nomi.filter(n => !script[n]); nomi = nomi.filter(n => script[n]);
  const D = leggiJSON(path.join(ROOT, 'docs/governo/DURATE-GUARDIANI.json'), { voci: {} }).voci;
  const voci = nomi.map(n => ({ n, s: (D[n] && D[n].s) || 300, fonte: (D[n] && D[n].fonte) || 'stimata' }));
  const OB = +process.env.CPM_TRENO_OBIETTIVO_S || 4200, tot = voci.reduce((a, v) => a + v.s, 0);
  /* il piu' lungo per primo nella parte piu' leggera; si aggiungono parti finche' la piu' lunga sta nell'obiettivo
     (o contiene un guardiano solo, che piu' corto di cosi' non si fa) */
  const taglia = N => { const parti = Array.from({ length: N }, (_, i) => ({ parte: i + 1, guardiani: [], attesi_s: 0 }));
    for (const v of [...voci].sort((x, y) => y.s - x.s || (x.n < y.n ? -1 : 1))) { const p = parti.reduce((m, q) => (q.attesi_s < m.attesi_s ? q : m), parti[0]); p.guardiani.push(v.n); p.attesi_s += v.s; }
    return parti; };
  let N = Math.max(1, Math.ceil(tot / OB)), parti = taglia(N);
  while (N < Math.min(voci.length, 256) && parti.some(p => p.attesi_s > OB && p.guardiani.length > 1)) parti = taglia(++N);
  const nome = p => `parte ${String(p.parte).padStart(2, '0')} di ${N} (${p.guardiani.length} guardiani, ~${Math.round(p.attesi_s / 60)} min)`;
  /* [giro 326, PO-624] TETTO DI MACCHINE. L'account ha 20 macchine in tutto: il treno grande (29 parti) le prendeva tutte e il deploy
     del gioco restava in coda (misurato il 22/11: 3.080 s e 3.886 s di attesa, fino all'annullo a mano del treno). Una corsa del treno
     usa al massimo TETTO_GRANDE parti alla volta (trenino: TETTO_TRENINO), cosi' treno grande + trenino + deploy stanno nelle 20.
     Con 29 parti il tetto 15 fa due ondate come il tetto 20 (15+14 contro 20+9): il treno non si allunga. */
  const tipoT = S317 ? S317.tipo : 'mappa';
  const tetto = +process.env.CPM_TRENO_PARALLELI || (tipoT === 'trenino' ? TETTO_TRENINO : TETTO_GRANDE);
  const paralleli = Math.max(1, Math.min(N, tetto));
  return {
    paralleli,
    tipo: S317 ? S317.tipo : 'mappa', scelta: S317 ? S317.scelta || null : null,
    riassunto: { guardiani: voci.length, parti: N, obiettivo_s: OB, somma_s: tot, parte_piu_lunga_s: Math.max(...parti.map(p => p.attesi_s)), parte_piu_corta_s: Math.min(...parti.map(p => p.attesi_s)),
      per_fonte: voci.reduce((o, v) => (o[v.fonte] = (o[v.fonte] || 0) + 1, o), {}), senza_script_npm: senza },
    matrice: { include: parti.map(p => ({ parte: p.parte, nome: nome(p), guardiani: p.guardiani.join(' '), attesi_s: p.attesi_s })) },
  };
}

if (cmd === 'piano') {
  const p = piano();
  console.log(JSON.stringify(p, null, 1));
  if (process.env.GITHUB_OUTPUT) fs.appendFileSync(process.env.GITHUB_OUTPUT, 'matrice=' + JSON.stringify(p.matrice) + '\n' + 'paralleli=' + p.paralleli + '\n'
    + 'tipo=' + p.tipo + '\n' + 'scelta=' + JSON.stringify(p.scelta) + '\n');
  if (process.env.GITHUB_STEP_SUMMARY) fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY,
    (p.tipo === 'trenino' ? `### TRENINO (giro 317): ${p.scelta.motivo}\n\nultimo rilascio ${p.scelta.base_come} · antenato comune ${p.scelta.merge_base.slice(0, 8)}\n\n`
      : p.tipo === 'completo' ? `### TRENO COMPLETO al posto del trenino (giro 317): ${p.scelta.motivo}\n\n` : '') +
    `### Piano del treno: ${p.riassunto.guardiani} guardiani in ${p.riassunto.parti} parti, al massimo ${p.paralleli} alla volta (giro 326)\n\nsomma attesa ${Math.round(p.riassunto.somma_s / 60)} min · parte piu' lunga ~${Math.round(p.riassunto.parte_piu_lunga_s / 60)} min · obiettivo ${Math.round(p.riassunto.obiettivo_s / 60)} min · durate: ${JSON.stringify(p.riassunto.per_fonte)}\n`);
} else if (cmd === 'esegui') {
  const nomi = (process.argv[3] || '').split(/\s+/).filter(Boolean);
  const OUT = path.join(QUI, 'out/ci-parte'); fs.mkdirSync(OUT, { recursive: true });
  const env = { ...process.env, VISION_PROVIDER: process.env.VISION_PROVIDER || 'none' };
  const BIL = (+process.env.CPM_TRENO_BILANCIO_S || 6600) * 1000, T0 = Date.now();
  const corri = (n, maxMs) => new Promise(res => { const t0 = Date.now(); const log = fs.createWriteStream(path.join(OUT, n.replace(/[^\w.-]/g, '_') + '.log'));
    /* gruppo di processi proprio: al tetto si ferma il guardiano CON i suoi figli (browser compresi), per pid, non per nome */
    const ch = spawn('npm', ['run', '-s', n], { cwd: QUI, env, detached: true }); let coda = '', tetto = false;
    const su = d => { process.stdout.write(d); log.write(d); coda = (coda + d).slice(-4000); };
    ch.stdout.on('data', su); ch.stderr.on('data', su);
    const tm = setTimeout(() => { tetto = true; su(`\n⛔ ${n}: fermato al bilancio della parte (${Math.round(maxMs / 1000)} s)\n`); try { process.kill(-ch.pid, 'SIGTERM'); } catch {} setTimeout(() => { try { process.kill(-ch.pid, 'SIGKILL'); } catch {} }, 15000); }, maxMs);
    ch.on('close', code => { clearTimeout(tm); log.end(); res({ guardiano: n, ok: code === 0 && !tetto, esito: tetto ? 'tetto' : code === 0 ? 'verde' : 'rosso', uscita: code, s: Math.round((Date.now() - t0) / 1000), coda: coda.trim().split('\n').slice(-3).join(' | ').slice(0, 300) }); }); });
  const r = { parte: process.env.CPM_PARTE || '', inizio: new Date().toISOString(), macchina: { cpu: os.cpus().length, modello: (os.cpus()[0] || {}).model, ram_gb: +(os.totalmem() / 2 ** 30).toFixed(1), node: process.version, so: os.platform() + ' ' + os.release() },
    installazione_s: +process.env.CPM_INSTALL_S || null, chromium_s: +process.env.CPM_CHROMIUM_S || null, attesi_s: +process.env.CPM_ATTESI_S || null, bilancio_s: BIL / 1000, passi: [] };
  for (const n of nomi) {
    const resto = BIL - (Date.now() - T0);
    if (resto < 60000) { r.passi.push({ guardiano: n, ok: false, esito: 'non_partito', uscita: null, s: 0, coda: 'bilancio della parte esaurito prima della partenza' }); console.log(`⏭️ ${n}: non partito (bilancio esaurito)`); continue; }
    console.log(`\n══ ${n} ══`); const x = await corri(n, resto); r.passi.push(x); console.log(`${x.ok ? '✅' : x.esito === 'tetto' ? '⛔' : '❌'} ${n} (${x.s}s, uscita ${x.uscita})`);
  }
  r.fine = new Date().toISOString(); r.guardiani_s = r.passi.reduce((a, x) => a + x.s, 0);
  fs.writeFileSync(path.join(OUT, 'riepilogo.json'), JSON.stringify(r, null, 1) + '\n');
  const sim = { verde: '✅ verde', rosso: '❌ rosso', tetto: '⛔ tetto', non_partito: '⏭️ non partito' };
  const md = `### ${r.parte || nomi.join(' ')}\n\nmacchina: ${r.macchina.cpu} cpu · ${r.macchina.ram_gb} GB · node ${r.macchina.node} · npm ${r.installazione_s ?? '?'} s · Chromium ${r.chromium_s ?? '?'} s · attesi ${r.attesi_s ?? '?'} s · fatti ${r.guardiani_s} s\n\n| guardiano | esito | durata | coda |\n|---|---|---|---|\n`
    + r.passi.map(x => `| \`${x.guardiano}\` | ${sim[x.esito]} | ${x.s} s | ${x.ok ? '' : String(x.coda).replace(/\|/g, '/')} |`).join('\n') + '\n';
  console.log('\n' + md); if (process.env.GITHUB_STEP_SUMMARY) fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, md);
  process.exit(0);/* MAI rosso: l'esito vive nel riepilogo (ogni corsa rossa = una mail al PO) */
} else if (cmd === 'riunisci') {
  const dir = process.argv[3] || '.'; const tutti = [];
  const giro = d => { if (!fs.existsSync(d)) return; for (const e of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, e.name); if (e.isDirectory()) giro(p); else if (e.name === 'riepilogo.json') { const j = leggiJSON(p, null); if (j) tutti.push(j); } } };
  giro(dir); tutti.sort((a, b) => (a.inizio < b.inizio ? -1 : 1));
  /* parti della matrice senza riepilogo (job caduto prima della fine, artifact mancante): i loro guardiani sono «non giudicati» */
  const matrice = (() => { try { return JSON.parse(process.env.CPM_TRENO_MATRICE || 'null'); } catch { return null; } })();
  const arrivate = new Set(tutti.map(r => r.parte)), mancanti = matrice ? matrice.include.filter(p => !arrivate.has(p.nome)) : [];
  const R = leggiJSON(path.join(ROOT, 'docs/governo/ROSSI-DICHIARATI.json'), { banco: {}, solo_runner: {} });
  const passi = tutti.flatMap(r => r.passi.map(x => ({ ...x, parte: r.parte })));
  for (const p of mancanti) for (const g of p.guardiani.split(' ')) passi.push({ guardiano: g, ok: false, esito: 'parte_mancante', s: 0, parte: p.nome, coda: 'la parte non ha consegnato il suo riepilogo' });
  const classe = x => x.ok ? 'verde' : x.esito === 'rosso' ? (R.banco[x.guardiano] ? 'rosso_noto' : R.solo_runner[x.guardiano] ? 'rosso_noto_runner' : 'rosso_nuovo') : 'non_giudicato';
  for (const x of passi) x.classe = classe(x);
  const per = c => passi.filter(x => x.classe === c).map(x => x.guardiano);
  const t0 = tutti.length ? Math.min(...tutti.map(r => +new Date(r.inizio))) : 0, t1 = tutti.length ? Math.max(...tutti.map(r => +new Date(r.fine))) : 0;
  const ev = tutti.flatMap(r => [[+new Date(r.inizio), 1], [+new Date(r.fine), -1]]).sort((a, b) => a[0] - b[0] || a[1] - b[1]); let c = 0, insieme = 0; for (const e of ev) { c += e[1]; insieme = Math.max(insieme, c); }
  const tot = { parti_attese: matrice ? matrice.include.length : null, parti_arrivate: tutti.length, guardiani: passi.length, verdi: per('verde').length,
    rossi_nuovi: per('rosso_nuovo'), rossi_noti: per('rosso_noto'), rossi_noti_runner: per('rosso_noto_runner'), non_giudicati: per('non_giudicato'),
    noti_tornati_verdi: passi.filter(x => x.ok && (R.banco[x.guardiano] || R.solo_runner[x.guardiano])).map(x => x.guardiano),
    somma_guardiani_s: passi.reduce((a, x) => a + (x.s || 0), 0), dal_primo_inizio_all_ultima_fine_s: Math.round((t1 - t0) / 1000), parti_insieme_max: insieme,
    verdetto: per('rosso_nuovo').length || per('non_giudicato').length ? 'DA GUARDARE: rossi nuovi o non giudicati' : 'nessun rosso nuovo' };
  const sim = { verde: '✅', rosso_nuovo: '❌ NUOVO', rosso_noto: '🟧 noto', rosso_noto_runner: '🟨 noto runner', non_giudicato: '⛔ non giudicato' };
  const md = `## Treno — riepilogo (${process.env.CPM_TRENO_TIPO || 'mappa'})\n\n**${tot.verdetto}** · ${tot.verdi}/${tot.guardiani} verdi in ${tot.parti_arrivate}${tot.parti_attese ? '/' + tot.parti_attese : ''} parti · a parete ${Math.round(tot.dal_primo_inizio_all_ultima_fine_s / 60)} min · somma ${Math.round(tot.somma_guardiani_s / 60)} min · parti insieme (max) ${insieme}\n\n`
    + `- rossi NUOVI (${tot.rossi_nuovi.length}): ${tot.rossi_nuovi.join(', ') || '—'}\n- non giudicati (tetto, non partiti, parte mancante) (${tot.non_giudicati.length}): ${tot.non_giudicati.join(', ') || '—'}\n- rossi noti (${tot.rossi_noti.length}): ${tot.rossi_noti.join(', ') || '—'}\n- rossi noti del runner (${tot.rossi_noti_runner.length}): ${tot.rossi_noti_runner.join(', ') || '—'}\n- dichiarati rossi ma verdi qui: ${tot.noti_tornati_verdi.join(', ') || '—'}\n\n`
    + `| parte | guardiano | esito | durata | coda |\n|---|---|---|---|---|\n`
    + passi.map(x => `| ${x.parte} | \`${x.guardiano}\` | ${sim[x.classe]} | ${x.s || 0} s | ${x.ok ? '' : String(x.coda || '').replace(/\|/g, '/').slice(0, 160)} |`).join('\n') + '\n';
  console.log(md); console.log('RIEPILOGO_JSON ' + JSON.stringify(tot));
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'riepilogo-totale.json'), JSON.stringify({ totale: tot, passi, parti: tutti }, null, 1) + '\n');
  /* [giro 317] tipo e scelta vengono dal piano (CPM_TRENO_TIPO / CPM_TRENO_SCELTA): il rilascio ricalcola la scelta da se' e la confronta */
  const tipo = String(process.env.CPM_TRENO_ELENCO || '').trim() ? 'elenco' : (process.env.CPM_TRENO_TIPO || 'mappa');
  const scelta = (() => { try { return JSON.parse(process.env.CPM_TRENO_SCELTA || 'null'); } catch { return null; } })();
  fs.writeFileSync(path.join(dir, 'esito-treno.json'), JSON.stringify({ commit: process.env.CPM_TRENO_SHA || process.env.GITHUB_SHA || null, ramo: process.env.CPM_TRENO_RAMO || process.env.GITHUB_REF_NAME || null, corsa: process.env.GITHUB_RUN_ID || null,
    /* [giro 312] il rilascio automatico pretende la mappa INTERA: un elenco dato a mano non rilascia mai. [giro 317] o un trenino verificato */
    tipo, scelta, mappa_intera: ['mappa', 'notte', 'completo'].includes(tipo), ...tot,
    per_guardiano: Object.fromEntries(passi.map(x => [x.guardiano, { classe: x.classe, s: x.s || 0, parte: x.parte }])) }, null, 1) + '\n');
  fs.writeFileSync(path.join(dir, 'riepilogo-totale.md'), md);
  if (process.env.GITHUB_STEP_SUMMARY) fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, md);
  process.exit(0);
} else { console.error('uso: node ci-treno-308.mjs piano|esegui|riunisci'); process.exit(2); }
