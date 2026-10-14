#!/usr/bin/env node
/* [PO-163 — «una sola suite di non regressione e indicatori di stabilita'»] Esecutore unico delle catene. `npm run ci` = catena
   completa (quella di CLAUDE.md e del workflow GitHub + partita-vera e design-system); `ci:carriera`, `ci:grafica`, `ci:guardiani`
   le altre. Ogni passo gira in sequenza; il giro si registra in docs/governo/STABILITA.json (ultimi 60 giri: data, versione del
   gioco, catena, per passo esito e durata) da cui la pagina di governo calcola gli indicatori. Esce != 0 se un passo fallisce,
   ma esegue comunque TUTTI i passi (CPM_CI_STOP=1 per fermarsi al primo rosso). Uso: node ci-runner.mjs [completa|carriera|grafica|guardiani]. */
import { spawnSync } from 'node:child_process'; import fs from 'node:fs'; import path from 'node:path';
const CATENE = {
  fumo: ['test:logic', 'design-system', 'lessico-218'],/* [7.999.159] prova rapida dell'esecutore */
  completa: ['test:vision', 'test:logic', 'typing-shortcuts', 'validate-situations', 'save-compat', 'replay', 'career-critical', 'partita-vera', 'scena-motore-147', 'manovre-150', 'esiti-218', 'cross-218', 'testata-209', 'gk-dive-sync', 'gk-miss-229', 'goal-postarc', 'nomi-219', 'difesa-220', 'scene-221', 'popup-224', 'lessico-218', 'fila-227', 'finestra-230', 'intervista-231', 'tabellino-228', 'design-system', 'giornata-233', 'fps-249', 'migrazione-194', 'schede-234', 'convocazione-235', 'bambini-236', 'prima-partita-237', 'crediti-238', 'brusio-238', 'attesa-241'],
  carriera: ['test:logic', 'save-compat', 'replay', 'career-critical', 'classifica-102', 'recupero-103', 'euro-attesa-181', 'riquadro-euro-105', 'avversario-106', 'rinvio-coppe-107', 'etichette-108', 'titolo-110', 'pre-188', 'rimbalzo-189', 'conferenza-192', 'partita-rigiocata-194', 'pro-rivale-176', 'rigori-190', 'debito-190', 'scene-190', 'finale-202', 'ripresa-202', 'tetto-202', 'minuti-202', 'recupero-202', 'ripartenza-207', 'anteprima-212', 'mister-215', 'presentazione-214', 'possesso-209', 'brain-202', 'tempo-138', 'tabellino-216'],
  grafica: ['griglia-mobile', 'design-system', 'career-critical', 'test:logic', 'save-compat', 'titolo-110', 'pre-188', 'rimbalzo-189', 'calendario-offerte-195', 'walkout-fermi-197', 'fila-206', 'premiazione-palco-191', 'coppa-mani-191', 'posa-sollevamento-191', 'palco-corpi-191', 'parata-198', 'busta-199', 'presentazione-200', 'guanti-201', 'formazioni-204', 'figurine-208', 'post-210', 'piedi-203', 'gesti-scena-p1b', 'piede-cross-p1b2', 'rincorsa-144', 'doppio-gesto-148', 'testa-146', 'movimento-147', 'l7-schermate'],
  guardiani: ['goleade', 'scene-disegnabili', 'nomi-51', 'piazzati-eroe', 'cross-origine', 'tiro-caricato', 'passo-velocita', 'gesti-copertura-96', 'etichette-95',
    'attesa-difesa', 'calendario-nazionale', 'career-nat-sim', 'disappunto', 'esultanza-braccia', 'fallo-cercato', 'filtrante-intercetto', 'home-riquadri', 'numeri-home',
    'occasioni-dinamiche', 'occasioni-squadra', 'piede-preferito', 'ruleta', 'strisce-corpo', 'testa-tempismo', 'classifica-102', 'recupero-103', 'euro-attesa-181', 'riquadro-euro-105', 'avversario-106', 'rinvio-coppe-107'],
  /* witness-frameskip FUORI (PO-180): instabile anche sulla 7.999.96 — sonda __CPM_WD_FILL a volte assente, pallone fermo nella
     finestra di 1,2 s (0-0,42u contro 3-6u), un campione fuori ordine. Da riscrivere prima di rientrare. */
};
/* [13/10, decisione PO «rivedi la logica delle catene» → «Sì, così»] (1) NUCLEO fisso a ogni rilascio (~15 min). (2) MIRATA = nucleo +
   SOLO i guardiani delle parti del gioco toccate rispetto a main (mappa sotto: file src → guardiani). (3) NOTTE = carriera ∪ completa SENZA
   doppioni (test:logic, save-compat, replay, career-critical giravano due volte). (4) In mirata un rosso si riprova UNA volta sola: un
   guardiano instabile due volte si ripara, non si ripete (CPM_CI_MAXPROVE). Uso: node ci-runner.mjs mirata [base, default origin/main]. */
CATENE.nucleo = ['test:logic', 'save-compat', 'design-system', 'typing-shortcuts', 'career-critical'];
CATENE.notte = [...new Set([...CATENE.carriera, ...CATENE.completa])];
const MAPPA = [
  [/src\/12-|src\/13-/, ['buildup-sync', 'po229-gi38', 'gk-dive-sync', 'gk-miss-229', 'goal-postarc', 'esiti-218', 'cross-218', 'scene-221', 'fila-227', 'validate-situations', 'partita-vera', 'bambini-236', 'pressing-143', 'conduci-242', 'ingresso-245', 'giornale-244']],
  [/src\/14-/, ['partita-vera', 'tabellino-228', 'tabellino-216', 'possesso-209', 'nomi-219', 'difesa-220', 'brain-202', 'tempo-138', 'esiti-218', 'cross-218', 'interazioni-226', 'schede-234', 'schede-246']],
  [/src\/15-/, ['fps-249', 'partita-vera', 'esiti-218', 'lessico-218', 'cross-218', 'tabellino-228', 'intervista-231', 'scene-221', 'validate-situations', 'minuti-202', 'ripresa-202', 'recupero-202', 'finale-202', 'tetto-202', 'tempo-138', 'interazioni-226', 'schede-234', 'catalogo-022', 'pressing-143', 'ripartenza-207', 'conduci-242', 'giornale-244', 'schede-246', 'attesa-241']],
  [/src\/05-|src\/09-/, ['lessico-218', 'cross-218', 'nomi-219', 'migrazione-194', 'classifica-194', 'classifica-102', 'brusio-238']],
  [/src\/1[17]-/, ['finestra-230', 'griglia-mobile', 'popup-224', 'migrazione-194', 'classifica-102', 'convocazione-235', 'toast-247', 'crediti-238', 'brusio-238', 'attesa-241']],
  [/src\/18-|src\/16-|src\/10-/, ['giornata-233', 'testata-209', 'popup-224', 'finestra-230', 'intervista-231', 'classifica-102', 'recupero-103', 'euro-attesa-181', 'riquadro-euro-105', 'avversario-106', 'rinvio-coppe-107', 'etichette-108', 'titolo-110', 'pre-188', 'conferenza-192', 'partita-rigiocata-194', 'pro-rivale-176', 'anteprima-212', 'mister-215', 'presentazione-214', 'toast-247', 'calendario-247']],
  [/src\/04-/, ['catalogo-022', 'gesti-motore-068', 'scena-motore-147', 'classifica-102', 'partita-rigiocata-194', 'save-compat']],/* [giro 17] i generatori delle scene dell'eroe vivono in src/04 */
  [/src\/0[0-8]-/, ['classifica-102', 'partita-rigiocata-194', 'save-compat']],
];
if (process.argv[2] === 'mirata') {
  const R0 = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../..'); let base = process.argv[3];
  if (!base) { spawnSync('git', ['fetch', '-q', 'origin', 'main'], { cwd: R0 }); base = 'FETCH_HEAD'; }/* origin/main locale puo' essere vecchio: si confronta col main remoto appena letto */
  let toccati = []; try { toccati = spawnSync('git', ['diff', '--name-only', base, 'HEAD', '--', 'src'], { cwd: path.resolve(path.dirname(new URL(import.meta.url).pathname), '../..'), encoding: 'utf8' }).stdout.split('\n').filter(Boolean); } catch {}
  const extra = []; for (const f of toccati) { const m = MAPPA.find(([re]) => re.test(f)); if (m) extra.push(...m[1]); else extra.push(...CATENE.completa); }
  CATENE.mirata = [...new Set([...CATENE.nucleo, ...extra])];
  console.log('mirata: file toccati ' + (toccati.join(', ') || 'nessuno') + ' → ' + CATENE.mirata.length + ' passi');
  if (process.env.CPM_CI_MAXPROVE == null) process.env.CPM_CI_MAXPROVE = '2';
}
const nome = process.argv[2] || 'completa'; const passi = CATENE[nome]; if (!passi) { console.error('catena sconosciuta: ' + nome + ' (' + Object.keys(CATENE).join(', ') + ')'); process.exit(2); }
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../..'), FILE = path.join(ROOT, 'docs/governo/STABILITA.json'), LOG = process.env.CPM_CI_LOG || null;
const ver = (fs.readFileSync(path.join(ROOT, 'src/07-versione-save-interviste.jsx'), 'utf8').match(/GAME_VERSION="([0-9.]+)"/) || [])[1] || '?';
const env = { ...process.env, CPM_CHROME: process.env.CPM_CHROME || '/opt/pw-browsers/chromium', PLAYWRIGHT_BROWSERS_PATH: process.env.PLAYWRIGHT_BROWSERS_PATH || '/opt/pw-browsers', VISION_PROVIDER: process.env.VISION_PROVIDER || 'none' };
const giro = { data: new Date().toISOString().slice(0, 16).replace('T', ' '), versione: ver, catena: nome, passi: [] };
let rossi = 0;
/* [14/10, decisione PO «Rifai solo le mancanti»] GIRO COMPOSTO: se il container si riavvia a meta' catena, CPM_CI_FATTI=passo1,passo2
   elenca i passi gia' verdi sulla STESSA versione (dal log del giro interrotto, CPM_CI_FATTI_DA=<log>): non si rigiocano, entrano nel registro
   con «gia_verde» e il giro si segna «composto». Un rosso fra i rifatti vale come rosso: la catena si rifa' da capo. */
const _fatti = (process.env.CPM_CI_FATTI || '').split(',').map(x => x.trim()).filter(Boolean);
if (_fatti.length) { giro.composto = true; giro.nota_composto = 'passi gia\' verdi prima del riavvio del container' + (process.env.CPM_CI_FATTI_DA ? ' (' + process.env.CPM_CI_FATTI_DA + ')' : '') + ': ' + _fatti.join(', ');
  for (const f of _fatti) { if (!passi.includes(f)) { console.error('passo gia\' fatto non in catena: ' + f); process.exit(2); } giro.passi.push({ passo: f, ok: true, s: 0, gia_verde: true }); }
  const resto = passi.filter(p => !_fatti.includes(p)); passi.length = 0; passi.push(...resto); }
/* [7.999.159, decisione PO 11/10 «adotta le nuove regole»] (1) PASSI LENTI IN PARALLELO: i guardiani che giocano partite vere
   (decine di minuti l'uno) girano a due a due su processi separati (CPM_CI_PAR=0 per la sequenza pura). (2) UN ROSSO SI RILANCIA DA
   SOLO fino a due volte: se torna verde il passo vale ma resta segnato «instabile» nel registro; resta rosso solo se e' rosso tre
   volte su tre (CPM_CI_NORETRY=1 per spegnere). La catena intera non si rifa' piu' per un guardiano ballerino. */
import { spawn } from 'node:child_process';
/* [7.999.160 PO-229] gk-dive-sync e goal-postarc erano ciechi da tempo senza che nessuno lo vedesse, perche' fuori catena. Ora dentro, fra i lenti. */
const LENTI = new Set(['conduci-242', 'giornale-244', 'schede-246', 'testata-209', 'gk-dive-sync', 'gk-miss-229', 'goal-postarc', 'partita-vera', 'scena-motore-147', 'esiti-218', 'cross-218', 'nomi-219', 'difesa-220', 'scene-221', 'career-critical', 'intervista-231', 'tabellino-228', 'interazioni-226', 'schede-234', 'bambini-236']);
const corri = (p) => new Promise(res => { const t0 = Date.now(); const ch = spawn('npm', ['run', '-s', p], { env }); let out = '';
  ch.stdout.on('data', d => { out += d; if (out.length > 2e6) out = out.slice(-1e6); }); ch.stderr.on('data', d => { out += d; if (out.length > 2e6) out = out.slice(-1e6); });
  ch.on('close', code => res({ ok: code === 0, s: Math.round((Date.now() - t0) / 1000), coda: out.trim().split('\n').slice(-3).join(' | ').slice(0, 240) })); });
const esito = async (p) => { let r = await corri(p); let prove = 1;
  while (!r.ok && process.env.CPM_CI_NORETRY !== '1' && prove < (+process.env.CPM_CI_MAXPROVE || 3)) { const r2 = await corri(p); prove++; if (r2.ok) { r = { ...r2, s: r.s + r2.s, instabile: true, primo: r.coda }; break; } r = { ...r2, s: r.s + r2.s }; }
  return { ...r, prove }; };
const scrivi = (p, r) => { if (!r.ok) rossi++; giro.passi.push({ passo: p, ok: r.ok, s: r.s, coda: r.ok ? undefined : r.coda, instabile: r.instabile || undefined, prove: r.prove > 1 ? r.prove : undefined });
  const riga = `${r.ok ? (r.instabile ? '⚠️' : '✅') : '❌'} ${p} (${r.s}s)${r.instabile ? ' — instabile: verde alla prova ' + r.prove + ', primo rosso: ' + r.primo : ''}${r.ok ? '' : ' — ' + r.coda}`; console.log(riga); if (LOG) fs.appendFileSync(LOG, riga + '\n'); };
const PAR = process.env.CPM_CI_PAR !== '0';
const seq = PAR ? passi.filter(p => !LENTI.has(p)) : passi, lenti = PAR ? passi.filter(p => LENTI.has(p)) : [];
for (const p of seq) { const r = await esito(p); scrivi(p, r); if (!r.ok && process.env.CPM_CI_STOP === '1') break; }
for (let k = 0; k < lenti.length; k += 2) { const blocco = lenti.slice(k, k + 2); const rr = await Promise.all(blocco.map(esito)); blocco.forEach((p, i) => scrivi(p, rr[i])); }
let st = []; try { st = JSON.parse(fs.readFileSync(FILE, 'utf8')); } catch {}
st.unshift(giro); fs.writeFileSync(FILE, JSON.stringify(st.slice(0, 60), null, 1) + '\n');
const fine = `${rossi ? '❌' : '✅'} catena ${nome} su ${ver}: ${giro.passi.length - rossi}/${giro.passi.length} verdi`; console.log(fine); if (LOG) fs.appendFileSync(LOG, fine + '\nFINE\n');
process.exit(rossi ? 1 : 0);
