#!/usr/bin/env node
/* CENSIMENTO STATICO — CHE COSA FA DAVVERO UNA RIGA DI CRONACA.
   Fase 4 della roadmap («la cronaca racconta, non comanda»).

   DA DOVE VIENE. Direttiva PO: «cronaca, simulazione, movimenti, pallone, animazioni e tattica devono
   descrivere la stessa azione reale, senza disallineamenti». Oggi il verso e' rovesciato: la riga si
   pesca da `BG_MATCH` (r.3501) e POI il resto del gioco si adegua a cio' che la riga DICHIARA — il
   pallone va al suo `bpos` (r.21703), il tabellino sale col suo `ms` (r.21709), la FORMA DELLA SQUADRA
   diventa `DRIFT_PRESETS[ev.pd]` (r.21710) e il 3D lancia l'arco `at||BG_ARC_MAP[pd]` (r.21722/21840).

   COSA GIUDICA, E COL METODO DICHIARATO. Si classifica ogni riga DAL MARCATORE, mai dal testo. E' la
   lezione pagata dalla prima stesura di `fatti-546`: classificando le righe dal testo la baseline diceva
   «palla ferma 0/4» e il numero vero, letto dal marcatore `sp`, era l'opposto (11/11). Qui i marcatori
   sono i campi della tabella — `ef` · `ms` · `poss` · `sp` · `bpos` · `at` · `pd` — e nient'altro.

     FATTO         la riga riporta un evento deciso ALTROVE (il micro-simulatore): `ef` team_goal/opp_goal,
                   che il picker esclude a r.21374 (`_noGoal77`) e che entra solo via `_simEv77` (r.21237).
     EFFETTO       la riga SCRIVE nello stato della partita: `ef` non-gol (espulsione/infortunio),
                   `ms` (tabellino), `poss` (possesso + turno), `sp` (apre una giocata piazzata recitata).
     NESSUN EFFETTO  ne' l'uno ne' l'altro: la riga esiste solo come testo — muove comunque il pallone
                   (`bpos`), la forma della squadra (`pd`) e l'arco 3D, ma non lascia traccia nello stato.

   ⚠️ IL SECONDO BLOCCO E' UNA MISURA SUL TESTO, E VA LETTA COME TALE. L'accordo fra il TIPO D'ARCO che
   il 3D recita e cio' che la frase dice si puo' misurare solo leggendo la frase: e' un'euristica a
   espressioni regolari, dichiarata, buona per ELENCARE i disallineamenti — non per contarli al
   decimale. Il censimento vero e' il primo blocco.

   ⚠️ E NON SI PARLA DI UNA SCRITTA A SCHERMO: la targhetta ATE-3 e' SPENTA dal 7.529 (gioco r.11325,
   `return` in testa all'effetto, collaudo PO «non servono piu'»). Il tipo d'arco governa altro, ed e'
   tutta roba che si vede: l'altezza e la durata del volo (BALL_ARC_BY_TYPE r.12717), il TUFFO del
   portiere (r.14659), la clip del calciatore — `tackle` o `kick`, due sole (r.14705) —, il COLORE della
   riga in telecronaca (r.21850) e il ritardo con cui la riga compare, meta' della durata dell'arco
   (r.21853). ATE3_LABEL serve qui solo come nome leggibile del tipo.

   NON E' UN GUARDIANO: non fallisce, misura. Con CPM_GUARDIA=1 applica le soglie dichiarate qui sotto,
   perche' la fase 4 avra' bisogno di una porta e conviene che sia gia' scritta.

     node cronaca-censimento-554.mjs [CPM_GUARDIA=1]                                                  */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const FILE = path.join(ROOT, 'CARRIER-MANAGER-AV.html');
const GUARDIA = !!process.env.CPM_GUARDIA;

/* SOGLIE DICHIARATE PRIMA (obiettivo della fase 4, non lo stato di oggi):
   la quota di righe che NON hanno alcun effetto sullo stato deve scendere sotto il 25%, e la quota di
   righe il cui arco 3D nasce dal `pd` (la ZONA) invece che dall'`at` (l'AZIONE) sotto il 40%. */
const MAX_SENZA_EFFETTO = +(process.env.CPM_MAX_MUTE || 25);
const MAX_ARCO_DA_ZONA  = +(process.env.CPM_MAX_ZONA || 40);

const src = fs.readFileSync(FILE, 'utf8');
const linee = src.split('\n');

/* estrazione ANCORATA AL SORGENTE (niente copia a mano che marcisce): dalla riga `const BG_MATCH=[`
   fino alla prima riga che chiude l'array a livello zero. */
function estraiArray(nome) {
  const i0 = linee.findIndex(l => l.startsWith(`const ${nome}=[`));
  if (i0 < 0) { console.log(`❌ FATAL: \`const ${nome}=[\` non trovato — l'ancora e' marcita, si ripara l'ancora`); process.exit(3); }
  for (let i = i0; i < linee.length; i++) {
    if (/^\];/.test(linee[i])) {
      const blocco = linee.slice(i0, i + 1).join('\n');
      return { blocco, riga0: i0 + 1, righeFine: i + 1 };
    }
  }
  console.log(`❌ FATAL: fine di ${nome} non trovata`); process.exit(3);
}
function estraiOggetto(nome) {
  const i = linee.findIndex(l => l.includes(`const ${nome}={`));
  if (i < 0) return null;
  const m = linee[i].match(new RegExp(`const ${nome}=(\\{.*?\\});`));
  return m ? (0, eval)('(' + m[1] + ')') : null;
}

const { blocco, riga0 } = estraiArray('BG_MATCH');
const BG = (0, eval)(blocco.replace(/^const BG_MATCH=/, '') .replace(/;\s*$/, ''));
const ARC_MAP = estraiOggetto('BG_ARC_MAP');
const LABEL = estraiOggetto('ATE3_LABEL');
if (!ARC_MAP || !LABEL) { console.log('❌ FATAL: BG_ARC_MAP / ATE3_LABEL non estratti'); process.exit(3); }

/* riga di sorgente di ogni voce: le voci stanno una per riga dentro il blocco */
const righeBlocco = blocco.split('\n');
const rigaDi = new Map();
{
  let k = 0;
  righeBlocco.forEach((l, i) => { if (/^\s*\{txt:/.test(l)) { rigaDi.set(k, riga0 + i); k++; } });
}

const N = BG.length, W = BG.reduce((a, r) => a + (+r.w || 0), 0);
const classe = r => {
  if (r.ef === 'team_goal' || r.ef === 'opp_goal') return 'FATTO';
  if (r.ef || r.ms || r.poss || r.sp) return 'EFFETTO';
  return 'MUTA';
};
const cat = { FATTO: [], EFFETTO: [], MUTA: [] };
BG.forEach((r, i) => cat[classe(r)].push(i));

const pct = (n, d) => (100 * n / d).toFixed(1) + '%';
const peso = idx => idx.reduce((a, i) => a + (+BG[i].w || 0), 0);

console.log(`\n=== CHE COSA FA UNA RIGA DI CRONACA — censimento dal MARCATORE (BG_MATCH r.${riga0}) ===\n`);
console.log(`  righe nel repertorio      ${N}      peso complessivo ${W.toFixed(1)}\n`);
for (const [k, etichetta] of [['FATTO', 'riporta un fatto deciso altrove'], ['EFFETTO', 'scrive lei nello stato'], ['MUTA', 'nessun effetto sullo stato']]) {
  const idx = cat[k];
  console.log(`  ${k.padEnd(8)} ${String(idx.length).padStart(4)}/${N} = ${pct(idx.length, N).padStart(6)}   peso ${peso(idx).toFixed(1).padStart(6)} = ${pct(peso(idx), W).padStart(6)}   ${etichetta}`);
}
console.log(`\n  dettaglio dei marcatori (una riga puo' averne piu' d'uno):`);
for (const [k, f] of [['ef (gol)', r => r.ef === 'team_goal' || r.ef === 'opp_goal'], ['ef (rosso/infortunio)', r => r.ef && r.ef !== 'team_goal' && r.ef !== 'opp_goal'],
  ['ms.shots', r => r.ms && r.ms.shots], ['ms.oppShots', r => r.ms && r.ms.oppShots], ['ms.fouls', r => r.ms && r.ms.fouls], ['ms.corners', r => r.ms && r.ms.corners],
  ['poss', r => r.poss], ['sp', r => r.sp], ['at', r => r.at], ['bpos', r => r.bpos], ['pd', r => r.pd]])
  console.log(`    ${k.padEnd(24)} ${String(BG.filter(f).length).padStart(4)}/${N}`);

console.log(`\n  ⚠️ le ${cat.FATTO.length} righe FATTO sono ESCLUSE dalla pesca (r.21374 \`_noGoal77\`): entrano solo`);
console.log(`     quando il micro-simulatore ha gia' deciso il gol (r.21237). Delle ${N} righe pescabili,`);
console.log(`     ${BG.filter(r => r.ef && r.ef !== 'team_goal' && r.ef !== 'opp_goal').length} portano un evento di partita.`);

/* ---- l'arco 3D: da dove nasce ---- */
const arcoDi = r => r.at || ARC_MAP[r.pd] || null;
const daAt = BG.filter(r => r.at).length, daPd = BG.filter(r => !r.at && ARC_MAP[r.pd]).length;
console.log(`\n=== L'ARCO 3D: NASCE DALL'AZIONE O DALLA ZONA? (r.21722) ===\n`);
console.log(`  dall'AZIONE dichiarata (\`at\`)   ${String(daAt).padStart(4)}/${N} = ${pct(daAt, N)}`);
console.log(`  dalla ZONA (\`pd\` → BG_ARC_MAP) ${String(daPd).padStart(4)}/${N} = ${pct(daPd, N)}   ← la famiglia di zona decide il gesto`);
const perArco = {};
BG.forEach(r => { const a = arcoDi(r); if (a) perArco[a] = (perArco[a] || 0) + 1; });
console.log('  ' + Object.entries(perArco).map(([a, n]) => `${LABEL[a] || a} ${n}`).join(' · '));

/* ---- disaccordo etichetta↔testo (EURISTICA DICHIARATA, non il censimento) ---- */
const RX = {
  shot: /tir[ao]|conclusion|calcia|bordata|incrocio|\bpalo\b|traversa|incornata|colpo di testa|destro|sinistro|girata|rovesciata|a giro|ci prova|botta|sfiora il vantaggio|in rete|segna/i,
  save: /para(ta|\b)|portiere|riflesso|smanaccia|respinge/i,
  cross: /cross|traversone|scodell|mette in mezzo|pennell|in mezzo|contagiri/i,
  tackle: /tackle|scivolata|contrasto|chiude|anticip|spazza|recuper|contende|duello|libera/i,
};
const disc = [];
BG.forEach((r, i) => {
  const a = arcoDi(r); if (!a || a === 'pass') return;   /* `pass` non si giudica: quasi ogni frase puo' esserlo */
  const conferma = a === 'shot' ? (RX.shot.test(r.txt) || !!(r.ms && (r.ms.shots || r.ms.oppShots))) : RX[a].test(r.txt);
  if (!conferma) disc.push({ i, a });
});
const totGiudicati = BG.filter(r => { const a = arcoDi(r); return a && a !== 'pass'; }).length;
console.log(`\n=== L'ARCO CHE IL TESTO NON CONFERMA (euristica sul TESTO — dichiarata, non il censimento) ===\n`);
const perDisc = {};
disc.forEach(d => perDisc[d.a] = (perDisc[d.a] || 0) + 1);
for (const [a, n] of Object.entries(perDisc)) {
  const tot = BG.filter(r => arcoDi(r) === a).length;
  console.log(`  ${(LABEL[a] || a).padEnd(14)} ${String(n).padStart(3)}/${tot}`);
}
console.log(`  ${'TOTALE'.padEnd(14)} ${String(disc.length).padStart(3)}/${totGiudicati} = ${pct(disc.length, totGiudicati)}`);
console.log(`\n  esempi (riga di sorgente · arco che il 3D recita · testo):`);
for (const a of ['shot', 'save', 'cross', 'tackle']) {
  const es = disc.filter(d => d.a === a).slice(0, 3);
  for (const d of es) console.log(`    r.${String(rigaDi.get(d.i) || '?').padEnd(6)} ${(LABEL[a] || a).padEnd(12)} pd=${String(BG[d.i].pd).padEnd(12)} ${BG[d.i].txt.slice(0, 82)}`);
}
console.log(`\n  ⚠️ un arco \`shot\` con destinazione oltre x70 (o sotto x30) fa anche TUFFARE il portiere`);
console.log(`     (r.14659): la riga che non parla di tiro produce comunque una parata in scena.`);
{
  const gk = disc.filter(d => d.a === 'shot' && BG[d.i].bpos && (BG[d.i].bpos.x >= 70 || BG[d.i].bpos.x <= 30));
  console.log(`     righe interessate: ${gk.length}`);
}

const qMuta = 100 * cat.MUTA.length / N, qZona = 100 * daPd / N;
console.log(`\n  soglie dichiarate per la fase 4:  senza effetto ≤ ${MAX_SENZA_EFFETTO}%  ·  arco dalla zona ≤ ${MAX_ARCO_DA_ZONA}%`);
console.log(`  oggi:                             senza effetto ${qMuta.toFixed(1)}%  ·  arco dalla zona ${qZona.toFixed(1)}%`);
if (!GUARDIA) { console.log('\nCENSIMENTO registrato. Non e\' un guardiano: non fallisce, misura.'); process.exit(0); }
let ko = 0;
if (qMuta > MAX_SENZA_EFFETTO) { console.log(`\n❌ ${qMuta.toFixed(1)}% di righe senza effetto (max ${MAX_SENZA_EFFETTO}%)`); ko = 1; }
if (qZona > MAX_ARCO_DA_ZONA) { console.log(`❌ ${qZona.toFixed(1)}% di archi nati dalla zona (max ${MAX_ARCO_DA_ZONA}%)`); ko = 1; }
if (!ko) console.log('\n✅ la cronaca racconta piu' + "'" + ' di quanto comandi');
process.exit(ko ? 2 : 0);
