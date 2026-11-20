#!/usr/bin/env node
/* [giro 303, PO-592 — PROVA di metodo] I guardiani su GitHub Actions, divisi in parti parallele.
   Tre comandi, usati dal workflow .github/workflows/verifica-guardiani.yml (e lanciabili a mano):

     node ci-parti-303.mjs piano   [config.json]   → stampa il piano e la matrice (JSON); in Actions scrive `matrice=` in GITHUB_OUTPUT
     node ci-parti-303.mjs esegui  "g1 g2 g3"      → gioca i guardiani in fila con `npm run -s`, misura, scrive out/ci-parte/
     node ci-parti-303.mjs riunisci <cartella>     → riunisce i riepilogo.json delle parti in una tabella sola

   La configurazione (ci-parti-303.json) dice COSA dividere: `elenco` (nomi scelti a mano) oppure `catena`
   (una catena di ci-runner.mjs: notte, completa, carriera, grafica, guardiani, nucleo, fumo — oppure «tutta»
   = ogni guardiano nominato in CATENE e nella MAPPA) e in quante `parti`.
   Le durate vengono dall'ultimo giro registrato in docs/governo/STABILITA.json; `durate_note` della
   configurazione le corregge; chi non ha una durata nota vale `default_s`.
   Il taglio e' «il piu' lungo per primo nella parte piu' leggera»: parti bilanciate per durata, non per numero.
   NON riprova i rossi (ci-runner.mjs lo fa fino a due volte): qui un rosso e' un rosso, cosi' il confronto
   col banco e' pulito. NON scrive STABILITA.json. Non tocca il gioco. */
import fs from 'node:fs'; import path from 'node:path'; import vm from 'node:vm'; import os from 'node:os';
import { spawn } from 'node:child_process';
const QUI = path.dirname(new URL(import.meta.url).pathname), ROOT = path.resolve(QUI, '../..');
const cmd = process.argv[2];

/* CATENE e MAPPA si leggono da ci-runner.mjs SENZA eseguirlo (importarlo farebbe partire una catena):
   si valuta in una sabbiera solo il tratto dichiarativo, da `const CATENE` alla chiusura di `const MAPPA`. */
function leggiCatene() {
  const src = fs.readFileSync(path.join(QUI, 'ci-runner.mjs'), 'utf8').split('\n');
  const a = src.findIndex(l => l.startsWith('const CATENE = {')), m = src.findIndex(l => l.startsWith('const MAPPA = ['));
  const z = src.findIndex((l, i) => i > m && l.startsWith('];'));
  if (a < 0 || m < 0 || z < 0) throw new Error('ci-runner.mjs: non trovo CATENE/MAPPA (la forma del file e\' cambiata)');
  const ctx = {}; vm.createContext(ctx);
  vm.runInContext(src.slice(a, z + 1).join('\n').replace('const CATENE', 'var CATENE').replace('const MAPPA', 'var MAPPA'), ctx);
  return { CATENE: ctx.CATENE, MAPPA: ctx.MAPPA };
}
function durateNote() {
  const d = {}; let st = [];
  try { st = JSON.parse(fs.readFileSync(path.join(ROOT, 'docs/governo/STABILITA.json'), 'utf8')); } catch {}
  /* il file e' «il piu' recente in testa»: la prima durata trovata per un passo e' l'ultima misurata; si saltano i «gia_verde» (s 0) */
  for (const g of st) for (const p of g.passi || []) if (!(p.passo in d) && p.s > 0 && !p.gia_verde) d[p.passo] = p.s;
  return d;
}
function piano(cfg) {
  const { CATENE, MAPPA } = leggiCatene();
  const script = JSON.parse(fs.readFileSync(path.join(QUI, 'package.json'), 'utf8')).scripts;
  let nomi;
  if (Array.isArray(cfg.elenco) && cfg.elenco.length) nomi = cfg.elenco;
  else if (cfg.catena === 'tutta') nomi = [...Object.values(CATENE).flat(), ...MAPPA.flatMap(r => r[1])];
  else if (CATENE[cfg.catena]) nomi = CATENE[cfg.catena];
  else throw new Error('configurazione: serve `elenco` oppure `catena` fra ' + Object.keys(CATENE).join(', ') + ', tutta');
  nomi = [...new Set(nomi)];
  const senza = nomi.filter(n => !script[n]); nomi = nomi.filter(n => script[n]);
  const st = durateNote(), def = +cfg.default_s || 300, nota = cfg.durate_note || {};
  const voci = nomi.map(n => ({ n, s: +nota[n] || st[n] || def, fonte: nota[n] ? 'configurazione' : st[n] ? 'STABILITA.json' : 'default' }));
  const N = Math.max(1, Math.min(+cfg.parti || 1, voci.length, 256/* tetto di una matrice di GitHub Actions */));
  const parti = Array.from({ length: N }, (_, i) => ({ parte: i + 1, guardiani: [], attesi_s: 0 }));
  for (const v of [...voci].sort((x, y) => y.s - x.s || (x.n < y.n ? -1 : 1))) {
    const p = parti.reduce((m, q) => (q.attesi_s < m.attesi_s ? q : m), parti[0]); p.guardiani.push(v.n); p.attesi_s += v.s; }
  const tot = voci.reduce((a, v) => a + v.s, 0), max = Math.max(...parti.map(p => p.attesi_s));
  return {
    riassunto: { guardiani: voci.length, parti: N, somma_s: tot, parte_piu_lunga_s: max, parte_piu_corta_s: Math.min(...parti.map(p => p.attesi_s)),
      senza_durata_nota: voci.filter(v => v.fonte === 'default').map(v => v.n), senza_script_npm: senza, default_s: def },
    matrice: { include: parti.map(p => ({ parte: p.parte, nome: p.guardiani.length === 1 ? p.guardiani[0] : `parte ${p.parte} di ${N} (${p.guardiani.length} guardiani)`, guardiani: p.guardiani.join(' '), attesi_s: p.attesi_s })) },
  };
}

if (cmd === 'piano') {
  const f = process.argv[3] || path.join(QUI, 'ci-parti-303.json');
  const cfg = JSON.parse(fs.readFileSync(f, 'utf8'));
  /* variabili d'ambiente per provare un taglio senza toccare il file: CPM_PARTI_CATENA, CPM_PARTI_N */
  if (process.env.CPM_PARTI_CATENA) { cfg.catena = process.env.CPM_PARTI_CATENA; cfg.elenco = null; }
  if (process.env.CPM_PARTI_N) cfg.parti = +process.env.CPM_PARTI_N;
  const p = piano(cfg);
  console.log(JSON.stringify(p, null, 1));
  if (process.env.GITHUB_OUTPUT) fs.appendFileSync(process.env.GITHUB_OUTPUT, 'matrice=' + JSON.stringify(p.matrice) + '\n');
  if (process.env.GITHUB_STEP_SUMMARY) fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY,
    `### Piano: ${p.riassunto.guardiani} guardiani in ${p.riassunto.parti} parti\n\nsomma attesa sul banco ${p.riassunto.somma_s} s · parte piu' lunga ${p.riassunto.parte_piu_lunga_s} s\n`);
} else if (cmd === 'esegui') {
  const nomi = (process.argv[3] || '').split(/\s+/).filter(Boolean);
  if (!nomi.length) { console.error('uso: node ci-parti-303.mjs esegui "g1 g2"'); process.exit(2); }
  const OUT = path.join(QUI, 'out/ci-parte'); fs.mkdirSync(OUT, { recursive: true });
  const env = { ...process.env, VISION_PROVIDER: process.env.VISION_PROVIDER || 'none' };
  const corri = n => new Promise(res => { const t0 = Date.now(); const log = fs.createWriteStream(path.join(OUT, n.replace(/[^\w.-]/g, '_') + '.log'));
    const ch = spawn('npm', ['run', '-s', n], { cwd: QUI, env }); let coda = '';
    const su = d => { process.stdout.write(d); log.write(d); coda = (coda + d).slice(-4000); };
    ch.stdout.on('data', su); ch.stderr.on('data', su);
    ch.on('close', code => { log.end(); res({ guardiano: n, ok: code === 0, uscita: code, s: Math.round((Date.now() - t0) / 1000), coda: coda.trim().split('\n').slice(-3).join(' | ').slice(0, 300) }); }); });
  const r = { parte: process.env.CPM_PARTE || '', inizio: new Date().toISOString(), macchina: { cpu: os.cpus().length, modello: (os.cpus()[0] || {}).model, ram_gb: +(os.totalmem() / 2 ** 30).toFixed(1), node: process.version, so: os.platform() + ' ' + os.release() },
    installazione_s: +process.env.CPM_INSTALL_S || null, chromium_s: +process.env.CPM_CHROMIUM_S || null, attesi_s: +process.env.CPM_ATTESI_S || null, passi: [] };
  for (const n of nomi) { console.log(`\n══ ${n} ══`); const x = await corri(n); r.passi.push(x); console.log(`${x.ok ? '✅' : '❌'} ${n} (${x.s}s, uscita ${x.uscita})`); }
  r.fine = new Date().toISOString(); r.guardiani_s = r.passi.reduce((a, x) => a + x.s, 0);
  fs.writeFileSync(path.join(OUT, 'riepilogo.json'), JSON.stringify(r, null, 1) + '\n');
  const righe = r.passi.map(x => `| \`${x.guardiano}\` | ${x.ok ? '✅ verde' : '❌ rosso'} | ${x.s} s | ${x.ok ? '' : x.coda.replace(/\|/g, '/')} |`).join('\n');
  const md = `### ${r.parte || nomi.join(' ')}\n\nmacchina: ${r.macchina.cpu} cpu · ${r.macchina.ram_gb} GB · node ${r.macchina.node} · installazione npm ${r.installazione_s ?? '?'} s · Chromium ${r.chromium_s ?? '?'} s\n\n| guardiano | esito | durata | coda |\n|---|---|---|---|\n${righe}\n`;
  console.log('\n' + md); if (process.env.GITHUB_STEP_SUMMARY) fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, md);
  process.exit(r.passi.every(x => x.ok) ? 0 : 1);
} else if (cmd === 'riunisci') {
  const dir = process.argv[3] || '.'; const tutti = [];
  const giro = d => { for (const e of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, e.name); if (e.isDirectory()) giro(p); else if (e.name === 'riepilogo.json') { try { tutti.push(JSON.parse(fs.readFileSync(p, 'utf8'))); } catch {} } } };
  giro(dir); tutti.sort((a, b) => (a.inizio < b.inizio ? -1 : 1));
  const t0 = Math.min(...tutti.map(r => +new Date(r.inizio))), t1 = Math.max(...tutti.map(r => +new Date(r.fine)));
  /* quante parti stavano girando NELLO STESSO MOMENTO: massimo delle sovrapposizioni fra [inizio, fine] dei guardiani */
  const ev = tutti.flatMap(r => [[+new Date(r.inizio), 1], [+new Date(r.fine), -1]]).sort((a, b) => a[0] - b[0] || a[1] - b[1]); let c = 0, insieme = 0; for (const e of ev) { c += e[1]; insieme = Math.max(insieme, c); }
  const passi = tutti.flatMap(r => r.passi.map(x => ({ ...x, parte: r.parte })));
  const tot = { parti: tutti.length, guardiani: passi.length, verdi: passi.filter(x => x.ok).length, rossi: passi.filter(x => !x.ok).map(x => x.guardiano),
    somma_guardiani_s: passi.reduce((a, x) => a + x.s, 0), dal_primo_inizio_all_ultima_fine_s: Math.round((t1 - t0) / 1000), parti_insieme_max: insieme };
  const md = `## Verifica guardiani — riepilogo\n\n${tot.verdi}/${tot.guardiani} verdi in ${tot.parti} parti · somma delle durate ${tot.somma_guardiani_s} s · dal primo inizio all'ultima fine ${tot.dal_primo_inizio_all_ultima_fine_s} s · parti in corsa insieme (massimo) ${tot.parti_insieme_max}\n\n| parte | inizio guardiani (UTC) | fine | npm install | Chromium | guardiano | esito | durata |\n|---|---|---|---|---|---|---|---|\n`
    + tutti.flatMap(r => r.passi.map(x => `| ${r.parte} | ${r.inizio.slice(11, 19)} | ${r.fine.slice(11, 19)} | ${r.installazione_s ?? '?'} s | ${r.chromium_s ?? '?'} s | \`${x.guardiano}\` | ${x.ok ? '✅' : '❌'} | ${x.s} s |`)).join('\n') + '\n';
  console.log(md); console.log('RIEPILOGO_JSON ' + JSON.stringify(tot));
  fs.writeFileSync(path.join(dir, 'riepilogo-totale.json'), JSON.stringify({ totale: tot, parti: tutti }, null, 1) + '\n'); fs.writeFileSync(path.join(dir, 'riepilogo-totale.md'), md);
  if (process.env.GITHUB_STEP_SUMMARY) fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, md);
} else { console.error('uso: node ci-parti-303.mjs piano|esegui|riunisci'); process.exit(2); }
