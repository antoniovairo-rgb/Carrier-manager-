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
/* [giro 358] PEZZI. Un guardiano che da solo sfora la parte non deve far annullare la corsa per tempo (corsa 45509361966: la parte
   01 con il solo highlight-95 e' arrivata al timeout di 120 min del job, «cancelled», nessun esito per lui, rilascio fermo). Un guardiano
   che giudica a bracci indipendenti si spezza in PEZZI, uno per braccio, ognuno con la sua parte: il nome nella matrice e'
   «guardiano@pezzo», l'esecuzione e' lo STESSO script npm con le variabili del pezzo, e il riepilogo li ricompone in un solo guardiano
   (verde solo se TUTTI i pezzi sono verdi; un pezzo rosso = rosso; un pezzo mancante/fermato = non giudicato). Nessuna soglia cambia:
   highlight-95 con CPM_ARMI=verde giudica il braccio verde con le stesse regole, con CPM_ARMI=rosso pretende che si vedano D1..D4.
   Durata di un pezzo: DURATE-GUARDIANI.json voci[g].pezzi[p] se misurata, altrimenti s diviso il numero dei pezzi. */
export const PEZZI_358 = { 'highlight-95': { verde: { CPM_ARMI: 'verde' }, rosso: { CPM_ARMI: 'rosso' } } };
export const spezza358 = n => PEZZI_358[n] ? Object.keys(PEZZI_358[n]).map(k => n + '@' + k) : [n];
export function piega358(passi) {
  const out = [], gruppi = new Map();
  for (const x of passi) { const m = /^(.+)@([^@]+)$/.exec(x.guardiano || ''); if (!m) { out.push(x); continue; }
    if (!gruppi.has(m[1])) { gruppi.set(m[1], []); out.push({ guardiano: m[1], _g358: true }); } gruppi.get(m[1]).push({ ...x, pezzo: m[2] }); }
  return out.map(x => { if (!x._g358) return x; const ps = gruppi.get(x.guardiano), attesi = Object.keys(PEZZI_358[x.guardiano] || {});
    const mancano = attesi.filter(k => !ps.some(q => q.pezzo === k)), ignoti = ps.filter(q => !attesi.includes(q.pezzo)).map(q => q.pezzo);
    const ok = !mancano.length && !ignoti.length && ps.every(q => q.ok);
    const esito = ok ? 'verde' : ps.some(q => q.esito === 'rosso') ? 'rosso' : mancano.length ? 'pezzo_mancante' : ignoti.length ? 'pezzo_ignoto' : (ps.find(q => !q.ok) || {}).esito || 'non_giudicato';
    const coda = [...ps.filter(q => !q.ok).map(q => `[${q.pezzo}: ${q.esito}] ${q.coda || ''}`), ...mancano.map(k => `[${k}: mancante]`), ...ignoti.map(k => `[${k}: pezzo non previsto]`)].join(' ‖ ').slice(0, 300);
    return { guardiano: x.guardiano, ok, esito, uscita: ok ? 0 : null, s: ps.reduce((a, q) => a + (q.s || 0), 0), parte: [...new Set(ps.map(q => q.parte).filter(Boolean))].join(' + '),
      coda, pezzi: ps.map(q => ({ pezzo: q.pezzo, esito: q.esito, s: q.s || 0, parte: q.parte })) }; });
}

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
const T360 = cmd === 'piano' ? await import(path.join(ROOT, 'tools/trenino-317.mjs')) : null;/* [giro 360] elenco unico degli script di prova */
/* [giro 330, PO-624] RIEPILOGO DELLA PARTE NEL LOG. `esegui` stampa a fine parte il suo riepilogo.json come righe
     CPM_PARTE330 <i>/<n> <base64>   e   CPM_PARTE330_FINE <sha256 del json> <n>
   `riunisci`, per una parte della matrice senza artifact, legge il log del job (API di GitHub col GITHUB_TOKEN del job, o la
   cartella CPM_TRENO_LOG_DIR del guardiano treno-330) e ricompone il json solo se l'impronta torna. */
import { createHash } from 'node:crypto';
const PEZZO330 = 3000;
export function righeLog330(r) {
  const j = JSON.stringify(r), b = Buffer.from(j).toString('base64'), n = Math.max(1, Math.ceil(b.length / PEZZO330)), out = [];
  for (let i = 0; i < n; i++) out.push(`CPM_PARTE330 ${i + 1}/${n} ${b.slice(i * PEZZO330, (i + 1) * PEZZO330)}`);
  out.push(`CPM_PARTE330_FINE ${createHash('sha256').update(j).digest('hex')} ${n}`); return out;
}
export function daLog330(testo) {
  const L = String(testo).split(/\r?\n/); let fine = -1, imp = null, n = 0;
  for (let i = L.length - 1; i >= 0; i--) { const m = /CPM_PARTE330_FINE ([0-9a-f]{64}) (\d+)\s*$/.exec(L[i]); if (m) { fine = i; imp = m[1]; n = +m[2]; break; } }
  if (fine < 0 || n < 1 || fine < n) return null;
  const pezzi = [];
  for (let k = 0; k < n; k++) { const m = /CPM_PARTE330 (\d+)\/(\d+) ([A-Za-z0-9+/=]*)\s*$/.exec(L[fine - n + k]); if (!m || +m[1] !== k + 1 || +m[2] !== n) return null; pezzi.push(m[3]); }
  const j = Buffer.from(pezzi.join(''), 'base64').toString('utf8');
  if (createHash('sha256').update(j).digest('hex') !== imp) return null;
  try { return JSON.parse(j); } catch { return null; }
}
let jobs330 = null;
async function leggiLogParte330(nome) {
  if (process.env.CPM_TRENO_LOG_DIR) { const f = path.join(process.env.CPM_TRENO_LOG_DIR, nome.replace(/[^\w.-]/g, '_') + '.log'); return fs.existsSync(f) ? fs.readFileSync(f, 'utf8') : null; }
  const tok = process.env.GH_TOKEN || process.env.GITHUB_TOKEN, repo = process.env.GITHUB_REPOSITORY, corsa = process.env.GITHUB_RUN_ID, api = process.env.GITHUB_API_URL || 'https://api.github.com';
  if (!tok || !repo || !corsa) return null;
  const H = { Authorization: `Bearer ${tok}`, Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28' };
  if (!jobs330) { jobs330 = [];
    for (let pag = 1; pag <= 10; pag++) { const r = await fetch(`${api}/repos/${repo}/actions/runs/${corsa}/jobs?filter=latest&per_page=100&page=${pag}`, { headers: H });
      if (!r.ok) throw new Error(`elenco dei job: ${r.status}`); const j = await r.json(); jobs330.push(...(j.jobs || [])); if ((j.jobs || []).length < 100) break; } }
  const job = jobs330.find(x => x.name === nome); if (!job) throw new Error('job non trovato nella corsa');
  const r = await fetch(`${api}/repos/${repo}/actions/jobs/${job.id}/logs`, { headers: H, redirect: 'follow' });
  if (!r.ok) throw new Error(`log del job ${job.id}: ${r.status}`);
  return r.text();
}
export const TETTO_GRANDE = 15, TETTO_TRENINO = 15, MACCHINE_ACCOUNT = 20;   /* [giro 326] vedi piano(). [giro 329, decisione PO 22/11 19:40] trenino 4 → 15:
   due corse da 15 non stanno nelle 20, quindi il workflow ha UNA concorrenza per tutte le corse del treno (una alla volta, senza annullare) */
function piano() {
  const { CATENE, MAPPA } = leggiCatene();
  const script = leggiJSON(path.join(QUI, 'package.json'), {}).scripts || {};
  let nomi = process.env.CPM_TRENO_ELENCO ? process.env.CPM_TRENO_ELENCO.split(/\s+/).filter(Boolean)
    : S317 && S317.tipo === 'trenino' ? S317.guardiani
    : [...Object.values(CATENE).flat(), ...MAPPA.flatMap(r => r[1])];
  nomi = [...new Set(nomi)].filter(n => !FUORI.test(n) && !(T360 && T360.fuoriTreno360(n)));/* [giro 360] script di sola prova: mai un guardiano del treno */
  const senza = nomi.filter(n => !script[n]); nomi = nomi.filter(n => script[n]);
  const D = leggiJSON(path.join(ROOT, 'docs/governo/DURATE-GUARDIANI.json'), { voci: {} }).voci;
  /* [giro 391, PO-523] nel treno il dopo-partita si gioca a PARTITA INTERA (CPM_PARTITA_INTERA=1 nel job delle parti): DURATE-GUARDIANI
     conosce solo il tempo col salto. Finche' le durate non si ritarano sulle corse vere, il piano usa la stima misurata sul banco
     (RAPPORTO-giro391: banco x0,74 = rapporto runner/banco di partita-rigiocata-194). Rosso CPM_NO_G391=1 = durate di prima. */
  const INTERA_391 = { 'partita-rigiocata-194': 1600, 'spazio-296': 1800 };
  const voci = nomi.flatMap(n => spezza358(n).map(q => { const k = q.split('@')[1], d = D[n] || {};
    const s = k ? (d.pezzi && d.pezzi[k]) || Math.round((d.s || 300) / Object.keys(PEZZI_358[n]).length) : d.s || 300;
    const s391 = !k && process.env.CPM_NO_G391 !== '1' && INTERA_391[n] ? Math.max(s, INTERA_391[n]) : s;
    return { n: q, s: s391, fonte: s391 !== s ? 'intera391' : d.fonte || 'stimata' }; }));
  const OB = +process.env.CPM_TRENO_OBIETTIVO_S || 4200, tot = voci.reduce((a, v) => a + v.s, 0);
  /* il piu' lungo per primo nella parte piu' leggera; si aggiungono parti finche' la piu' lunga sta nell'obiettivo
     (o contiene un guardiano solo, che piu' corto di cosi' non si fa) */
  const taglia = N => { const parti = Array.from({ length: N }, (_, i) => ({ parte: i + 1, guardiani: [], attesi_s: 0 }));
    for (const v of [...voci].sort((x, y) => y.s - x.s || (x.n < y.n ? -1 : 1))) { const p = parti.reduce((m, q) => (q.attesi_s < m.attesi_s ? q : m), parti[0]); p.guardiani.push(v.n); p.attesi_s += v.s; }
    return parti; };
  /* [giro 326] mai piu' parti che guardiani: con un obiettivo corto (obiettivo_min=1) il piano apriva parti VUOTE (85 per 22 guardiani,
     misurato nella prova del giro 326), ognuna una macchina che installa Chromium per niente */
  let N = Math.max(1, Math.min(voci.length, Math.ceil(tot / OB))), parti = taglia(N);
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
  const OUT = process.env.CPM_PARTE_OUT || path.join(QUI, 'out/ci-parte');/* [giro 330] cartella propria per il guardiano treno-330 */ fs.mkdirSync(OUT, { recursive: true });
  const env = { ...process.env, VISION_PROVIDER: process.env.VISION_PROVIDER || 'none' };
  const BIL = (+process.env.CPM_TRENO_BILANCIO_S || 6600) * 1000, T0 = Date.now();
  /* [giro 358] SCADENZA DEL JOB. Il bilancio contava dall'inizio di questo passo, non del job: checkout + npm + Chromium (1,5 min nella
     corsa 45509361966) e il caricamento stavano fuori dal conto. Il workflow scrive CPM_JOB_T0 (inizio del job, secondi) e
     CPM_JOB_TIMEOUT_MIN: il guardiano si ferma al primo dei due, sempre CPM_TRENO_MARGINE_S (default 480 s) prima del timeout. */
  const SCAD = +process.env.CPM_JOB_T0 && +process.env.CPM_JOB_TIMEOUT_MIN ? (+process.env.CPM_JOB_T0 + +process.env.CPM_JOB_TIMEOUT_MIN * 60 - (+process.env.CPM_TRENO_MARGINE_S || 480)) * 1000 : Infinity;
  const corri = (n, maxMs) => new Promise(res => { const t0 = Date.now(); const log = fs.createWriteStream(path.join(OUT, n.replace(/[^\w.-]/g, '_') + '.log'));
    /* [giro 358] un pezzo («guardiano@pezzo») e' lo script del guardiano con le variabili del pezzo */
    const [base, pz] = n.split('@'), extra = pz ? (PEZZI_358[base] || {})[pz] : {};
    if (!extra) return res({ guardiano: n, ok: false, esito: 'rosso', uscita: null, s: 0, coda: `pezzo «${pz}» non previsto in PEZZI_358` });
    /* gruppo di processi proprio: al tetto si ferma il guardiano CON i suoi figli (browser compresi), per pid, non per nome */
    const ch = spawn('npm', ['run', '-s', base], { cwd: QUI, env: { ...env, ...extra }, detached: true }); let coda = '', tetto = false, chiuso = false;
    const su = d => { process.stdout.write(d); log.write(d); coda = (coda + d).slice(-4000); };
    ch.stdout.on('data', su); ch.stderr.on('data', su);
    /* [giro 358] la chiusura non aspetta solo 'close' (= tutti i descrittori dell'uscita chiusi): un nipote uscito dal gruppo che tiene
       l'uscita aperta lo rimanda per sempre. Al tetto: TERM, KILL dopo 15 s, e dopo altri 30 s il guardiano si chiude comunque come
       «tetto»; su 'exit' si concedono 10 s per svuotare l'uscita. */
    const fine = code => { if (chiuso) return; chiuso = true; clearTimeout(tm); clearTimeout(tmDuro); try { ch.stdout.destroy(); ch.stderr.destroy(); } catch {} log.end();
      res({ guardiano: n, ok: code === 0 && !tetto, esito: tetto ? 'tetto' : code === 0 ? 'verde' : 'rosso', uscita: code, s: Math.round((Date.now() - t0) / 1000), coda: coda.trim().split('\n').slice(-3).join(' | ').slice(0, 300) }); };
    let tmDuro = null;
    const tm = setTimeout(() => { tetto = true; su(`\n⛔ ${n}: fermato al bilancio della parte (${Math.round(maxMs / 1000)} s)\n`); try { process.kill(-ch.pid, 'SIGTERM'); } catch {}
      setTimeout(() => { try { process.kill(-ch.pid, 'SIGKILL'); } catch {} }, 15000);
      tmDuro = setTimeout(() => { su(`\n⛔ ${n}: l'uscita resta aperta dopo l'arresto, chiuso d'ufficio\n`); fine(null); }, 45000); }, maxMs);
    ch.on('exit', code => setTimeout(() => fine(code), 10000).unref()); ch.on('close', code => fine(code)); });
  const r = { parte: process.env.CPM_PARTE || '', inizio: new Date().toISOString(), macchina: { cpu: os.cpus().length, modello: (os.cpus()[0] || {}).model, ram_gb: +(os.totalmem() / 2 ** 30).toFixed(1), node: process.version, so: os.platform() + ' ' + os.release() },
    installazione_s: +process.env.CPM_INSTALL_S || null, chromium_s: +process.env.CPM_CHROMIUM_S || null, attesi_s: +process.env.CPM_ATTESI_S || null, bilancio_s: BIL / 1000, passi: [] };
  /* [giro 358] riepilogo PROGRESSIVO: scritto prima di ogni guardiano col guardiano in corso dichiarato «tetto» (= non giudicato) e i
     successivi «non partiti». Se il passo viene ucciso da fuori (timeout del passo o del job) l'artifact porta comunque la parte. */
  const scriviParziale = i => { try { fs.writeFileSync(path.join(OUT, 'riepilogo.json'), JSON.stringify({ ...r, parziale: true, fine: new Date().toISOString(),
    passi: [...r.passi, ...nomi.slice(i).map((g, j) => ({ guardiano: g, ok: false, esito: j === 0 ? 'tetto' : 'non_partito', uscita: null, s: j === 0 ? Math.round((Date.now() - T0) / 1000) - r.passi.reduce((a, x) => a + x.s, 0) : 0,
      coda: j === 0 ? 'parte interrotta da fuori mentre questo guardiano girava (giro 358)' : 'parte interrotta prima della partenza (giro 358)' }))] }, null, 1) + '\n'); } catch {} };
  let iN = 0, battito = null;
  for (const n of nomi) {
    const iQ = iN++; scriviParziale(iQ); clearInterval(battito); battito = setInterval(() => scriviParziale(iQ), 60000); battito.unref();
    const resto = Math.min(BIL - (Date.now() - T0), SCAD - Date.now());
    if (resto < 60000) { r.passi.push({ guardiano: n, ok: false, esito: 'non_partito', uscita: null, s: 0, coda: 'bilancio della parte esaurito prima della partenza' }); console.log(`⏭️ ${n}: non partito (bilancio esaurito)`); continue; }
    console.log(`\n══ ${n} ══`); const x = await corri(n, resto); r.passi.push(x); console.log(`${x.ok ? '✅' : x.esito === 'tetto' ? '⛔' : '❌'} ${n} (${x.s}s, uscita ${x.uscita})`);
  }
  clearInterval(battito); r.fine = new Date().toISOString(); r.guardiani_s = r.passi.reduce((a, x) => a + x.s, 0);
  fs.writeFileSync(path.join(OUT, 'riepilogo.json'), JSON.stringify(r, null, 1) + '\n');
  const sim = { verde: '✅ verde', rosso: '❌ rosso', tetto: '⛔ tetto', non_partito: '⏭️ non partito' };
  const md = `### ${r.parte || nomi.join(' ')}\n\nmacchina: ${r.macchina.cpu} cpu · ${r.macchina.ram_gb} GB · node ${r.macchina.node} · npm ${r.installazione_s ?? '?'} s · Chromium ${r.chromium_s ?? '?'} s · attesi ${r.attesi_s ?? '?'} s · fatti ${r.guardiani_s} s\n\n| guardiano | esito | durata | coda |\n|---|---|---|---|\n`
    + r.passi.map(x => `| \`${x.guardiano}\` | ${sim[x.esito]} | ${x.s} s | ${x.ok ? '' : String(x.coda).replace(/\|/g, '/')} |`).join('\n') + '\n';
  console.log('\n' + md); if (process.env.GITHUB_STEP_SUMMARY) fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, md);
  /* [giro 330, PO-624] lo stesso riepilogo.json anche nel LOG, a pezzi in base64 con l'impronta: se il caricamento dell'artifact cade
     (treno 45050383306, parte 03) il Riepilogo lo ricostruisce da qui. Stampato SOLO a parte finita: chi non ha girato non lo ha. */
  for (const l of righeLog330(r)) console.log(l);
  process.exit(0);/* MAI rosso: l'esito vive nel riepilogo (ogni corsa rossa = una mail al PO) */
} else if (cmd === 'riunisci') {
  const dir = process.argv[3] || '.'; const tutti = [];
  const giro = d => { if (!fs.existsSync(d)) return; for (const e of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, e.name); if (e.isDirectory()) giro(p); else if (e.name === 'riepilogo.json') { const j = leggiJSON(p, null); if (j) tutti.push(j); } } };
  giro(dir);
  /* parti della matrice senza riepilogo (job caduto prima della fine, artifact mancante): i loro guardiani sono «non giudicati» */
  const matrice = (() => { try { return JSON.parse(process.env.CPM_TRENO_MATRICE || 'null'); } catch { return null; } })();
  /* [giro 330, PO-624] prima di dichiararle mancanti: la riga CPM_PARTE330 nel log del job della parte (stessa corsa, GITHUB_TOKEN).
     Vale solo se l'impronta torna e la parte e i guardiani coincidono con la matrice; altrimenti la parte resta mancante. */
  const dalLog = [], logNonLetti = [];
  if (matrice && process.env.CPM_NO_G330 !== '1') {
    const giaArrivate = new Set(tutti.map(r => r.parte));
    for (const p of matrice.include.filter(q => !giaArrivate.has(q.nome))) {
      let testo = null; try { testo = await leggiLogParte330(p.nome); } catch (e) { logNonLetti.push(`${p.nome}: ${e.message}`); }
      const j = testo ? daLog330(testo) : null;
      if (j && j.parte === p.nome && (j.passi || []).map(x => x.guardiano).join(' ') === p.guardiani) { tutti.push({ ...j, fonte: 'log' }); dalLog.push(p.nome); }
      else if (testo) logNonLetti.push(`${p.nome}: nel log non c'e' un riepilogo completo e coerente`);
    }
  }
  tutti.sort((a, b) => (a.inizio < b.inizio ? -1 : 1));
  const arrivate = new Set(tutti.map(r => r.parte)), mancanti = matrice ? matrice.include.filter(p => !arrivate.has(p.nome)) : [];
  const R = leggiJSON(path.join(ROOT, 'docs/governo/ROSSI-DICHIARATI.json'), { banco: {}, solo_runner: {} });
  const passi0 = tutti.flatMap(r => r.passi.map(x => ({ ...x, parte: r.parte, ...(r.fonte === 'log' ? { fonte: 'log' } : {}) })));
  for (const p of mancanti) for (const g of p.guardiani.split(' ')) passi0.push({ guardiano: g, ok: false, esito: 'parte_mancante', s: 0, parte: p.nome, coda: 'la parte non ha consegnato il suo riepilogo' });
  const passi = piega358(passi0);/* [giro 358] i pezzi tornano un guardiano solo: rossi dichiarati, scelta del trenino e rilascio vedono il nome vero */
  const classe = x => x.ok ? 'verde' : x.esito === 'rosso' ? (R.banco[x.guardiano] ? 'rosso_noto' : R.solo_runner[x.guardiano] ? 'rosso_noto_runner' : 'rosso_nuovo') : 'non_giudicato';
  for (const x of passi) x.classe = classe(x);
  const per = c => passi.filter(x => x.classe === c).map(x => x.guardiano);
  const t0 = tutti.length ? Math.min(...tutti.map(r => +new Date(r.inizio))) : 0, t1 = tutti.length ? Math.max(...tutti.map(r => +new Date(r.fine))) : 0;
  const ev = tutti.flatMap(r => [[+new Date(r.inizio), 1], [+new Date(r.fine), -1]]).sort((a, b) => a[0] - b[0] || a[1] - b[1]); let c = 0, insieme = 0; for (const e of ev) { c += e[1]; insieme = Math.max(insieme, c); }
  const tot = { parti_attese: matrice ? matrice.include.length : null, parti_arrivate: tutti.length, guardiani: passi.length, verdi: per('verde').length,
    rossi_nuovi: per('rosso_nuovo'), rossi_noti: per('rosso_noto'), rossi_noti_runner: per('rosso_noto_runner'), non_giudicati: per('non_giudicato'),
    noti_tornati_verdi: passi.filter(x => x.ok && (R.banco[x.guardiano] || R.solo_runner[x.guardiano])).map(x => x.guardiano),
    parti_dal_log: dalLog, log_non_letti: logNonLetti,
    somma_guardiani_s: passi.reduce((a, x) => a + (x.s || 0), 0), dal_primo_inizio_all_ultima_fine_s: Math.round((t1 - t0) / 1000), parti_insieme_max: insieme,
    verdetto: per('rosso_nuovo').length || per('non_giudicato').length ? 'DA GUARDARE: rossi nuovi o non giudicati' : 'nessun rosso nuovo' };
  const sim = { verde: '✅', rosso_nuovo: '❌ NUOVO', rosso_noto: '🟧 noto', rosso_noto_runner: '🟨 noto runner', non_giudicato: '⛔ non giudicato' };
  const md = `## Treno — riepilogo (${process.env.CPM_TRENO_TIPO || 'mappa'})\n\n**${tot.verdetto}** · ${tot.verdi}/${tot.guardiani} verdi in ${tot.parti_arrivate}${tot.parti_attese ? '/' + tot.parti_attese : ''} parti · a parete ${Math.round(tot.dal_primo_inizio_all_ultima_fine_s / 60)} min · somma ${Math.round(tot.somma_guardiani_s / 60)} min · parti insieme (max) ${insieme}\n\n`
    + `- rossi NUOVI (${tot.rossi_nuovi.length}): ${tot.rossi_nuovi.join(', ') || '—'}\n- non giudicati (tetto, non partiti, parte mancante) (${tot.non_giudicati.length}): ${tot.non_giudicati.join(', ') || '—'}\n- rossi noti (${tot.rossi_noti.length}): ${tot.rossi_noti.join(', ') || '—'}\n- rossi noti del runner (${tot.rossi_noti_runner.length}): ${tot.rossi_noti_runner.join(', ') || '—'}\n- dichiarati rossi ma verdi qui: ${tot.noti_tornati_verdi.join(', ') || '—'}\n`
    + `- parti ricostruite dal LOG perche' l'artifact mancava (giro 330) (${dalLog.length}): ${dalLog.join(', ') || '—'}${logNonLetti.length ? `\n- log non utilizzabili: ${logNonLetti.join(' · ')}` : ''}\n\n`
    + `| parte | guardiano | esito | durata | coda |\n|---|---|---|---|---|\n`
    + passi.map(x => `| ${x.parte}${x.fonte === 'log' ? ' (dal log)' : ''} | \`${x.guardiano}\` | ${sim[x.classe]} | ${x.s || 0} s | ${x.ok ? '' : String(x.coda || '').replace(/\|/g, '/').slice(0, 160)} |`).join('\n') + '\n';
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
