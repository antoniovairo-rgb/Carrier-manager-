#!/usr/bin/env node
/* [giro 108 · collaudo grafico 180] GUARDIANO DELLE CORREZIONI DEL GIRO 108. Rigioca le sonde del collaudo 180 (c180-schermate,
   c180-partita) sulle sole schermate toccate, con i club di prova veri (FC Merseyside rosso, FC Wolverhampton giallo, FC Tyneside
   scuro) e il giocatore dal nome lungo, e giudica difetto per difetto.
   Uso:  node collaudo-108.mjs verde   → tutte le misure devono passare (uscita 0)
         node collaudo-108.mjs rosso   → con gli interruttori __CPM_NO_G108_<id> accesi OGNI difetto deve tornare (uscita 0 se tornano)
         node collaudo-108.mjs giudica → rilegge i dati gia' raccolti (C108_DATI) senza rigiocare
   Soglie: contrasto WCAG 4,5:1 (3:1 per corpo >= 18 px o >= 14 px grassetto, come c180-lib) · tocco >= 44 px sui formati a tocco
   (area effettiva: rettangolo del tasto unito al suo ::after trasparente). Non tocca src/. */
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
const QUI = path.dirname(new URL(import.meta.url).pathname);
const modo = process.argv[2] || 'verde';
const BASE = process.env.C108_DATI || path.join(QUI, 'out', 'collaudo-108');
const ROSSI = ['01', '02', '03', '04', '07', '08', '09', '10', '13', '15', '16', '18', '21', '22', '28', '32', '44'].map(k => '__CPM_NO_G108_' + k);
const SCH = 'gala|sch-seasonAwards|sch-proTransition|nazionale|figurina|auto-|intervista|procuratore-intro|home|agente|classifica|calendario|coppe|club|carriera$|ufficio|menu$';
const PAR = 'prepartita|ingresso|partita2d-chiuso|partita2d-pagelle|hl-intro|festa-titolo|post-partita';
/* giri: [sonda, formati, club]. Il rosso ne rigioca meno: basta che ogni difetto torni almeno una volta */
const GIRI = {
  verde: [['schermate', 's360', 'rosso,giallo,scuro'], ['schermate', 's412', 'giallo'], ['schermate', 'pc', 'rosso'],
    ['partita', 's360', 'rosso,giallo'], ['partita', 's412', 'scuro'], ['partita', 'pc', 'rosso'], ['partita', 't820', 'rosso']],
  rosso: [['schermate', 's360', 'rosso,giallo'], ['schermate', 's412', 'giallo'], ['partita', 's360', 'rosso'], ['partita', 'pc', 'rosso'], ['partita', 't820', 'rosso']],
};
const arm = m => path.join(BASE, m);
function gioca(m) {
  const dir = arm(m); fs.rmSync(dir, { recursive: true, force: true }); fs.mkdirSync(path.join(dir, 'foto'), { recursive: true });
  for (const [sonda, formati, club] of GIRI[m]) {
    const env = { ...process.env, C180_DATI: dir, C180_FOTO: path.join(dir, 'foto'), C180_FORMATI: formati, C180_CLUB: club,
      C180_SOLO: sonda === 'schermate' ? SCH : PAR, C180_ROSSI: m === 'rosso' ? ROSSI.join(',') : '', C180_PARTE: 'fuori,carriera,finestre,flusso' };
    const t0 = Date.now(); console.log(`· ${m}: ${sonda} ${formati} ${club}`);
    const r = spawnSync('node', [path.join(QUI, `c180-${sonda}.mjs`)], { env, stdio: ['ignore', 'pipe', 'pipe'], encoding: 'utf8', timeout: 1500000 });
    const coda = (r.stdout || '').split('\n').filter(x => /mancanti|errori|Error/.test(x)).join(' | ');
    console.log(`  ${Math.round((Date.now() - t0) / 1000)} s · ${coda.slice(0, 300)}`);
    if (r.status !== 0) { console.log('  ⚠️ uscita ' + r.status + ' ' + (r.stderr || '').slice(-400)); }
  }
}
/* ── giudizio ── */
function leggi(m) {
  const dir = arm(m); const R = {}; if (!fs.existsSync(dir)) return R;
  for (const f of fs.readdirSync(dir).filter(x => /^(schermate|partita)-.*\.json$/.test(x))) { const d = JSON.parse(fs.readFileSync(path.join(dir, f)));
    for (const [sch, per] of Object.entries(d.R || {})) for (const [caso, r] of Object.entries(per)) (R[sch] = R[sch] || {})[caso] = r; }
  return R;
}
const touch = caso => !/^pc-/.test(caso);
function giudica(R) {
  const D = {}; const add = (id, sch, caso, msg) => { (D[id] = D[id] || []).push(`${sch} ${caso}: ${msg}`); };
  const ctr = (id, rx, filtro) => { for (const [sch, per] of Object.entries(R)) { if (!rx.test(sch)) continue; for (const [caso, r] of Object.entries(per)) for (const c of r.sottoCtr || []) if (!filtro || filtro(c)) add(id, sch, caso, `«${c.t}» ${c.testo} su ${c.fondo} ${c.rap}:1 (soglia ${c.soglia})`); } };
  const tap = (id, rx, trx) => { for (const [sch, per] of Object.entries(R)) { if (!rx.test(sch)) continue; for (const [caso, r] of Object.entries(per)) { if (!touch(caso)) continue; for (const t of (r.x108 && r.x108.tocchi) || []) if (trx.test(t.t)) add(id, sch, caso, `«${t.t}» ${t.w}x${t.h} (effettivo ${t.ew}x${t.eh})`); } } };
  const ogni = (rx, fn) => { for (const [sch, per] of Object.entries(R)) { if (!rx.test(sch)) continue; for (const [caso, r] of Object.entries(per)) fn(sch, caso, r); } };
  ctr('02', /^(gala|sch-seasonAwards)$/);
  ctr('03', /^sch-proTransition$/); ogni(/^sch-proTransition$/, (s, c, r) => { for (const x of (r.x108 && r.x108.chiariV1) || []) add('03', s, c, `fondo chiaro V1 ${x}`); });
  ctr('04', /^nazionale$/);
  ctr('07', /^prepartita$/);
  ctr('08', /^figurina$/, c => /KORWARD/.test(c.t));
  ctr('09', /^auto-/);
  ctr('10', /^(intervista|procuratore-intro)/, c => !/FC Test/.test(c.t)); ogni(/^(intervista|procuratore-intro)/, (s, c, r) => { for (const x of (r.x108 && r.x108.scenaChiara) || []) add('10', s, c, `scena chiara ${x}`); });
  tap('13', /^(partita2d-chiuso|partita2d-pagelle|hl-intro)$/, /^(⏸|▶|1×|1,5×|2×|⚠️)$/);
  ogni(/^partita2d-chiuso$/, (s, c, r) => { if (r.x108 && r.x108.punteggioCoperto) add('15', s, c, 'punteggio coperto da ' + r.x108.punteggioCoperto); });
  ogni(/^partita2d-chiuso$/, (s, c, r) => { if (/^s360/.test(c)) for (const n of (r.x108 && r.x108.nomiTroncati) || []) add('16', s, c, `nome troncato «${n}»`); });
  tap('18', /^(gala|sch-seasonAwards)$/, /Salta il gal/);
  tap('44', /^(home|agente|classifica|calendario|coppe|club|carriera|nazionale|ufficio)$/, /Sostieni il progetto|Idee e feedback|Licenzia il procuratore/);
  tap('44', /^post-partita$/, /tabellino|connessioni|Tabellino/);
  tap('13', /^(ingresso|festa-titolo)$/, /Salta ingresso|Salta premiazione|Salta festeggiamenti/);
  ogni(/./, (s, c, r) => { if (r.x108 && r.x108.rosa) add('21', s, c, `${r.x108.rosa} testi rosa V1 (${r.x108.rosaEs.join(' · ')})`); });
  ogni(/^(home|gala|sch-seasonAwards|menu|ufficio|partita2d-pagelle)$/, (s, c, r) => { if (r.x108 && r.x108.granata) add('22', s, c, `${r.x108.granata} elementi granata V1 (${r.x108.granataEs.join(' · ')})`); });
  ctr('28', /^post-partita$/, c => /Division|Lega|Liga|Primavera/i.test(c.t));
  ctr('32', /^hl-intro$/, c => /Tocca per iniziare|ATTACCO|DIFESA/.test(c.t)); /* i numeri delle giocate sono G180-31 (bassa, nella 181) */
  ogni(/^(home|classifica|calendario|coppe|club|carriera|nazionale|agente|ufficio)$/, (s, c, r) => { for (const x of r.spezzate || []) add('01', s, c, `parola spezzata «${x.parola}» in «${x.testo}»`); });
  ctr('06', /^home$/);
  const coperte = {}; for (const [sch, per] of Object.entries(R)) coperte[sch] = Object.keys(per).length;
  return { D, coperte };
}
const ATTESI = ['01', '02', '03', '04', '06', '07', '08', '09', '10', '13', '15', '16', '18', '21', '22', '28', '32', '44'];
const ROSSO_ATTESO = ['01', '02', '03', '04', '07', '08', '09', '10', '13', '15', '16', '18', '21', '22', '28', '32', '44']; /* 06 era gia' corretto dal giro 106: nessun braccio qui (lo tiene home-colori-106) */
const NECESSARIE = { schermate: ['gala', 'sch-proTransition', 'nazionale', 'figurina', 'home', 'agente', 'intervista-vittoria'], partita: ['prepartita', 'partita2d-chiuso', 'post-partita', 'hl-intro'] };
function rapporto(m) {
  const R = leggi(m); const { D, coperte } = giudica(R);
  const mancano = [...NECESSARIE.schermate, ...NECESSARIE.partita].filter(s => !coperte[s]);
  console.log(`\n=== collaudo-108 · braccio ${m} · ${Object.keys(coperte).length} schermate misurate`);
  if (mancano.length) console.log('  ⚠️ schermate NON misurate (la misura non vale): ' + mancano.join(', '));
  for (const id of ATTESI) { const v = D[id] || []; console.log(`  G180-${id}  ${v.length ? '✗ ' + v.length + ' rilievi' : '✓'}${v.length ? '  — ' + v.slice(0, 3).join(' | ') : ''}`); }
  fs.writeFileSync(path.join(BASE, `giudizio-${m}.json`), JSON.stringify({ D, coperte }, null, 1));
  if (mancano.length) return false;
  if (m === 'verde') { const rossi = ATTESI.filter(id => (D[id] || []).length); console.log(rossi.length ? `\nVERDE FALLITO: ${rossi.join(', ')}` : '\nVERDE: nessun difetto del giro 108 presente'); return !rossi.length; }
  const muti = ROSSO_ATTESO.filter(id => !(D[id] || []).length); console.log(muti.length ? `\nROSSO FALLITO: con gli interruttori accesi non tornano ${muti.join(', ')}` : '\nROSSO ATTESO OK: ogni difetto torna coi suoi interruttori'); return !muti.length;
}
fs.mkdirSync(BASE, { recursive: true });
if (modo === 'giudica') { const a = rapporto('verde'), b = rapporto('rosso'); process.exit(a && b ? 0 : 1); }
if (modo !== 'verde' && modo !== 'rosso') { console.log('uso: node collaudo-108.mjs verde|rosso|giudica'); process.exit(2); }
gioca(modo); process.exit(rapporto(modo) ? 0 : 1);
