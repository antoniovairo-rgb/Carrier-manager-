#!/usr/bin/env node
/* [giro 175 · PO-372] GUARDIANO «la stessa partita, rigiocata con le stesse scelte, e' la stessa partita» — `npm run riproduci-175`.
   Misurato dal giro 166 (§4.3): tre partite intere identiche per costruzione davano 3-2 · 3-2 · 1-0 («Tobia Ferrante») e
   1-1 · 3-0 · 0-0 («Marco Bellandi»). Cause trovate dal giro 175 (docs/sviluppo/RAPPORTO-giro175.md): ingressi del motore nati da
   sorteggi senza seme (ventidue ed eroe al calcio d'inizio, assestamento del pallone dopo l'esito), la scena incatenata che nasceva
   dal pallone RESO (3D, tempo reale) e — dello strumento — il pilota automatico che sceglieva a orologio.
   A. STATICO (dal repo): l'interruttore, il generatore col seme della partita e i punti corretti ci sono; nessun rng() nudo e' rimasto
      nell'assestamento dell'esito ne' nelle posizioni iniziali.
   B. PARTITE (carriera vera, salvataggio sintetico, ?cpmtest, pilota seedato): NOMI × 3 ripetizioni. Le tre ripetizioni di un nome
      NON sono uguali per lo strumento, apposta:
        · velocita' 1× · 1,5× · 2× (la partita non deve dipendere dal tempo reale);
        · seme DIVERSO del flusso di prova di rng()/pick() (in produzione e' Math.random: se un sorteggio senza seme entra nella
          partita, qui le ripetizioni si separano);
        · le tre partite di un nome girano INSIEME (processore conteso: l'ordine dei timer cambia).
      Per ogni nome: 1. tutte finite oltre il 90' con almeno una scena e almeno 100 voci (altrimenti NON GIUDICATO = rosso);
                     2. libro mastro identico voce per voce (senza ts/t/npd, come i giri 161 e 166) e risultato identico.
   C. CORPI 3D (un nome): una partita coi corpi ACCESI ha lo stesso libro mastro di quelle coi corpi spenti.
   Bracci: VERDE deve passare. ROSSO (`__CPM_NO_G175`): le differenze tornano — su ogni nome rosso almeno una coppia di ripetizioni
   diversa (le partite rosse si fermano al 30' di gioco: basta, la separazione nasce al calcio d'inizio).
   «Non giudicato» (pagina che non monta, partita non finita, zero scene, sonda assente) = rosso. Verde e rosso stampati per ultimi.
   Uso: CPM_CHROME=/opt/pw-browsers/chromium node riproduci-175.mjs
        CPM_G175_NOMI="A|B|…" cambia i nomi · CPM_G175_GLB=0 salta C (allora C e' NON GIUDICATO = rosso, serve solo per indagare)
        CPM_G175_DUMP=<file> salva le sequenze · CPM_G175_SOLO=verde|rosso gioca un solo braccio (esce 1: non e' un esito). */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { apriCarriera166, apriPrompt166, gioca166, seq166 } from './lib/partita-166.mjs';
if (!process.env.CPM_CHROME) process.env.CPM_CHROME = '/opt/pw-browsers/chromium';
if (!process.env.PLAYWRIGHT_BROWSERS_PATH) process.env.PLAYWRIGHT_BROWSERS_PATH = '/opt/pw-browsers';
const QUI = path.dirname(fileURLToPath(import.meta.url)); const ROOT = path.resolve(QUI, '../..');
const E = process.env;
const NOMI = (E.CPM_G175_NOMI || 'Collaudo Salienti|Tobia Ferrante|Marco Bellandi|Ettore Malvasi|Livio Corradini').split('|').filter(Boolean);
const NOMI_ROSSI = (E.CPM_G175_ROSSI || 'Tobia Ferrante|Marco Bellandi').split('|').filter(Boolean);
const NOME_GLB = E.CPM_G175_NOME_GLB || NOMI[0];
const VEL = ['1', '1.5', '2'], SEME = +(E.CPM_G175_SEME || 7300), SOLO = E.CPM_G175_SOLO || '';
const sec = ms => (ms / 1000).toFixed(0) + ' s';

/* ---------------- A. statico ---------------- */
const st = []; const ok = (nome, cond, info) => st.push({ nome, ok: !!cond, info: info || '' });
const s15 = fs.readFileSync(path.join(ROOT, 'src/15-live-match.jsx'), 'utf8');
const conta = re => (s15.match(re) || []).length;
ok('A1 un interruttore, un generatore col seme della partita', conta(/const _g175=!\(typeof window!=='undefined'&&window\.__CPM_NO_G175\);/g) === 1 && conta(/const _rnd175=tag=>_g175\?seededRng\(/g) === 1 && /bgSimSeedRef\.current>>>0\)\^hashStr\("g175\|"\+tag\)/.test(s15),
  `interruttore ${conta(/const _g175=/g)} · generatore ${conta(/const _rnd175=/g)}`);
const mp = (s15.match(/const \[matchPlayers,_setMPraw\]=useState\(\(\)=>\{[\s\S]*?\n  \}\);/) || [''])[0];
ok('A2 ventidue, eroe e possesso al calcio d\'inizio passano dal generatore', /_rnd175\("ventidue"\)/.test(mp) && !/[^_a-zA-Z0-9]rng\(/.test(mp.replace(/_rng175\(/g, '')) && /getStartPos\(situations\[0\],_rnd175\("eroe0"\)/.test(s15) && /_rng175\(_rnd175\("possesso0"\),-5,5\)/.test(s15),
  `blocco dei ventidue ${mp.length} car.`);
const es = (s15.match(/\{const _re175=_rnd175\("esito\|"[\s\S]*?\n    \}\n    \/\/ \[7\.91\.0/) || [''])[0];
ok('A3 l\'assestamento del pallone dopo l\'esito usa solo il generatore della scena', es.length > 800 && /const rng=\(a,b\)=>_rng175\(_re175,a,b\);/.test(es) && !/Math\.random/.test(es) && /settle175Ref\.current=\{x:ballTargetRef\.current\.x/.test(es),
  `blocco ${es.length} car. · sorteggi ${(es.match(/rng\(/g) || []).length}`);
ok('A4 la scena incatenata nasce dal punto deciso (non dal pallone reso)', /const _pv=\(_g175&&_isChain&&settle175Ref\.current\)\?settle175Ref\.current:\(ballTargetRef\.current/.test(s15), '');
ok('A5 il pilota automatico sceglie sul battito della scena', /window\.__CPM_AP175=\(!_g175\|\|\(opts&&opts\.pilota==="orologio"\)\)\?null:/.test(s15) && /window\.__CPM_AP175&&\(\+\+apPassi175Ref\.current\)>=\(window\.__CPM_AP175\.k\|0\)\)\{clearInterval\(iv\);setPhase\("hl_choose"\);\}/.test(s15) && /if\(window\.__CPM_AP175&&_s175&&!_s175\.lockMovement&&_s175\.maxMoves!==0\)return;/.test(s15), '');

/* ---------------- B/C. partite ---------------- */
async function partita(nome, k, init, opz) {
  const o = opz || {};
  const A = await apriCarriera166({ init: init || {}, nome, vel: o.vel || VEL[k % 3], glb: !!o.glb, reseed: 1000 + 77 * k });
  let r = { finita: false, ev: [], note: ['non aperta'], fasi: {} };
  try {
    if (!A.W) throw new Error('nessuna settimana con giornata di lega');
    await apriPrompt166(A.page);
    r = await gioca166(A.page, 'intera', { seme: SEME, tetto: o.glb ? 900000 : 480000, fermaAlMinuto: o.ferma || 0 });
    r.pilota = await A.page.evaluate(() => window.__CPM_AP175 || null).catch(() => null);
    r.errs = A.errs.slice(0, 3);
  } catch (e) { r.note = [...(r.note || []), 'flusso: ' + String(e.message).slice(0, 140)]; r.errs = A.errs.slice(0, 3); }
  await A.b.close(); A.srv.close();
  return { nome, k, vel: o.vel || VEL[k % 3], glb: !!o.glb, finita: !!r.finita, minMax: r.minMax || 0, scene: r.scene || 0, score: r.score, tPartita: r.tPartita || 0, note: r.note || [], errs: r.errs || [], pilota: r.pilota || null, seq: seq166(r.ev || []) };
}
const primaDiff = (a, b, fino) => { const f = x => { if (!fino) return x; const j = x.findIndex(e => (e.min | 0) > fino); return j < 0 ? x : x.slice(0, j); }; /* col tetto: il PREFISSO fino al primo minuto oltre `fino` (le voci senza minuto restano al loro posto) */ const A = f(a), B = f(b); const n = Math.max(A.length, B.length); for (let i = 0; i < n; i++) if (JSON.stringify(A[i]) !== JSON.stringify(B[i])) return { i, a: A[i] || null, b: B[i] || null }; return null; };
const ris = s => s ? `${s.h}-${s.a}` : '—';

const dump = {};
async function braccio(nomi, init, ferma) {
  const out = [];
  for (const nome of nomi) {
    const P = await Promise.all([0, 1, 2].map(k => partita(nome, k, init, { ferma })));
    const giudic = P.every(p => (ferma ? p.minMax >= ferma : (p.finita && p.minMax >= 90 && p.scene >= 1)) && p.seq.length >= (ferma ? 20 : 100) && p.errs.length === 0);
    const d01 = primaDiff(P[0].seq, P[1].seq, ferma ? ferma - 5 : 0), d02 = primaDiff(P[0].seq, P[2].seq, ferma ? ferma - 5 : 0);
    const stessoRis = ferma ? true : (ris(P[0].score) === ris(P[1].score) && ris(P[0].score) === ris(P[2].score) && !!P[0].score);
    out.push({ nome, P, giudic, d01, d02, uguali: giudic && !d01 && !d02 && stessoRis }); dump[(init && init.__CPM_NO_G175 ? 'rosso|' : 'verde|') + nome] = P;
  }
  return out;
}
const riga = x => `${x.P.map(p => `${p.vel}× ${ris(p.score)} ${p.seq.length}v ${p.minMax}' ${p.scene}sc ${sec(p.tPartita)}`).join(' · ')}` +
  `${x.giudic ? '' : ' · NON GIUDICATO ' + JSON.stringify(x.P.map(p => [p.finita, p.note.join(' '), p.errs.join(' ')]))}` +
  `${[x.d01, x.d02].map((d, j) => d ? ` · rip. 0≠${j + 1} alla voce ${d.i}: ${JSON.stringify(d.a).slice(0, 110)} ≠ ${JSON.stringify(d.b).slice(0, 110)}` : '').join('')}`;

const verde = SOLO === 'rosso' ? [] : await braccio(NOMI, {}, 0);
let glb = null;
if (SOLO !== 'rosso' && E.CPM_G175_GLB !== '0') {
  const g = await partita(NOME_GLB, 0, {}, { glb: true, vel: '2' });
  const base = (verde.find(x => x.nome === NOME_GLB) || { P: [] }).P[0];
  const giud = !!base && g.finita && g.minMax >= 90 && g.scene >= 1 && g.seq.length >= 100 && g.errs.length === 0;
  const d = base ? primaDiff(base.seq, g.seq, 0) : null;
  glb = { g, giud, d, ok: giud && !d && ris(base.score) === ris(g.score) }; dump['verde|glb|' + NOME_GLB] = g;
}
const rosso = SOLO === 'verde' ? [] : await braccio(NOMI_ROSSI, { __CPM_NO_G175: true }, 30);
if (E.CPM_G175_DUMP) fs.writeFileSync(E.CPM_G175_DUMP, JSON.stringify(dump));

console.log('A. STATICO'); for (const x of st) console.log(`  ${x.ok ? '✓' : '✗'} ${x.nome}${x.info ? ' — ' + x.info : ''}`);
console.log(`B. braccio VERDE — ${NOMI.length} nomi × 3 ripetizioni (1× · 1,5× · 2×, semi del flusso di prova diversi, in parallelo; seme del pilota ${SEME})`);
for (const x of verde) console.log(`  ${x.uguali ? '✓' : '✗'} «${x.nome}» — ${riga(x)}`);
if (verde.length) console.log(`  pilota: ${JSON.stringify((verde[0].P[0] || {}).pilota)} (battiti di scena prima della scelta; null = a orologio)`);
console.log('C. corpi 3D accesi');
if (glb) console.log(`  ${glb.ok ? '✓' : '✗'} «${NOME_GLB}» coi corpi accesi (2×) = corpi spenti — ${ris(glb.g.score)} ${glb.g.seq.length}v ${glb.g.minMax}' ${glb.g.scene}sc ${sec(glb.g.tPartita)}${glb.giud ? '' : ' · NON GIUDICATO ' + JSON.stringify([glb.g.finita, glb.g.note, glb.g.errs])}${glb.d ? ` · prima differenza alla voce ${glb.d.i}: ${JSON.stringify(glb.d.a).slice(0, 120)} ≠ ${JSON.stringify(glb.d.b).slice(0, 120)}` : ''}`);
else console.log('  ✗ non giocata — NON GIUDICATO');
console.log(`B. braccio ROSSO (__CPM_NO_G175) — ${NOMI_ROSSI.length} nomi × 3 ripetizioni, fermate al 30' (confronto fino al 25')`);
for (const x of rosso) console.log(`  ${x.giudic && (x.d01 || x.d02) ? '✓ si separano' : '✗ NON si separano'} «${x.nome}» — ${riga(x)}`);
const statico = st.every(x => x.ok);
const passaVerde = SOLO !== 'rosso' && statico && verde.length === NOMI.length && NOMI.length >= 5 && verde.every(x => x.uguali) && !!glb && glb.ok;
const cadeRosso = SOLO !== 'verde' && rosso.length >= 1 && rosso.every(x => x.giudic && (x.d01 || x.d02));
console.log(`MISURA — partite verdi ${verde.length * 3 + (glb ? 1 : 0)} · nomi identici ${verde.filter(x => x.uguali).length}/${verde.length} · nomi rossi separati ${rosso.filter(x => x.giudic && (x.d01 || x.d02)).length}/${rosso.length}`);
console.log(`VERDE: ${passaVerde ? 'PASSA' : 'NON PASSA'}${NOMI.length < 5 ? ' (meno di 5 nomi: non e\' un esito)' : ''}`);
console.log(`ROSSO: ${cadeRosso ? 'CADE (come deve): le differenze tornano' : 'NON CADE come deve — il guardiano e\' cieco'}`);
process.exit(passaVerde && cadeRosso ? 0 : 1);
