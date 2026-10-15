#!/usr/bin/env node
/* [giro 44 PO-226] analisi del censimento di misura-226.mjs: quante interazioni, quando, effetto sul motore e sull'occasione dell'eroe,
   correlazione col punteggio e col minuto. Uso: node analizza-226.mjs out/misura-226/misura-<etichetta>.json */
import fs from 'node:fs'; import path from 'node:path';
import { ROOT } from './lib/harness.mjs';
const s14 = fs.readFileSync(path.join(ROOT, 'src', '14-motore-possesso.jsx'), 'utf8');
const code = s14.slice(s14.indexOf('/* CMAV-SRC-HEADER-END */') + '/* CMAV-SRC-HEADER-END */'.length);
const { INT259 } = Function('decideExecution', 'window', code + '\nreturn {INT259};')(undefined, {});
const R = JSON.parse(fs.readFileSync(process.argv[2], 'utf8')).filter(Boolean);
const med = a => { const s = [...a].sort((x, y) => x - y); return s.length ? s[Math.floor(s.length / 2)] : null; };
const fin = R.filter(p => p.finita);
console.log(`partite ${R.length} · finite ${fin.length} · errori di pagina ${R.filter(p => (p.errori || []).length || p.errore).length}`);
const SC = [], CE = [], RA = []; R.forEach(p => { const S = p.s259 || {}; (S.schede || []).forEach(s => SC.push({ ...s, p: p.i })); (S.scelte || []).forEach(s => CE.push({ ...s, p: p.i })); (S.racconti || []).forEach(r => RA.push({ ...r, p: p.i })); });
const hist = {}; R.forEach(p => { const n = ((p.s259 || {}).schede || []).length; hist[n] = (hist[n] || 0) + 1; });
const HL = R.map(p => (p.hl || []).length);
console.log(`\n1) QUANTE: schede del mister ${SC.length} (${(SC.length / R.length).toFixed(2)}/partita, distribuzione ${JSON.stringify(hist)}) · highlight giocati dall'eroe ${HL.reduce((a, b) => a + b, 0)} (${(HL.reduce((a, b) => a + b, 0) / R.length).toFixed(2)}/partita, min ${Math.min(...HL)} max ${Math.max(...HL)})`);
const perFatto = {}; SC.forEach(s => perFatto[s.fatto] = (perFatto[s.fatto] || 0) + 1);
console.log(`   per fatto: ${JSON.stringify(perFatto)}`);
const mins = SC.map(s => s.min);
console.log(`\n2) QUANDO: minuto min ${Math.min(...mins)} · mediana ${med(mins)} · max ${Math.max(...mins)} · elenco ${JSON.stringify(SC.map(s => s.min + "'" + s.fatto))}`);
const diffs = {}; SC.forEach(s => { const k = (s.diff > 0 ? '+' : '') + s.diff; diffs[k] = (diffs[k] || 0) + 1; });
console.log(`   scarto al momento della scheda: ${JSON.stringify(diffs)} · senza posta (|scarto|>=2) ${SC.filter(s => Math.abs(s.diff) >= 2).length}`);
/* correlazione con l'andamento: in quante partite il punteggio era «in bilico» (|diff|<=1) al 75', e quante di queste hanno avuto una scheda */
const bil = R.filter(p => p.finita).map(p => { const a = p.andamento || {}; const mk = Object.keys(a).map(Number).filter(m => m <= 75).sort((x, y) => x - y).pop(); const d75 = mk != null ? a[mk] : null; return { p: p.i, d75, n: ((p.s259 || {}).schede || []).length }; });
const inB = bil.filter(x => x.d75 != null && Math.abs(x.d75) <= 1), fuB = bil.filter(x => x.d75 != null && Math.abs(x.d75) >= 2);
console.log(`   partite in bilico al 75' (|scarto|<=1): ${inB.length}, con almeno una scheda ${inB.filter(x => x.n > 0).length} · partite chiuse al 75' (|scarto|>=2): ${fuB.length}, con almeno una scheda ${fuB.filter(x => x.n > 0).length}`);
console.log(`\n3) RISVOLTI SUL MOTORE: scelte ${CE.length}, di cui automatiche ${CE.filter(c => c.auto).length}; la scelta cambia un dato del motore ${CE.filter(c => c.cambiato).length}/${CE.length}`);
const perTipo = {}; RA.forEach(r => { if (r.panca) { (perTipo.panca = perTipo.panca || []).push(r); return; } const o = INT259.opz(r.fatto, r.idx) || {}; (perTipo[o.tipo || '?'] = perTipo[o.tipo || '?'] || []).push(r); });
const d = (r, k) => ((r.dopo || {})[k] | 0) - ((r.prima || {})[k] | 0);
/* riferimento: tiri per 5 minuti nella stessa partita, fuori dalle finestre delle schede (tabellino finale meno le finestre) */
let tN = 0, tL = 0, mm = 0; R.forEach(p => { if (!p.tab || !p.finita) return; const rr = ((p.s259 || {}).racconti || []).filter(r => !r.panca); let wN = 0, wL = 0, wm = 0; rr.forEach(r => { wN += d(r, 'tiriNoi'); wL += d(r, 'tiriLoro'); wm += (r.m1 - r.m0); }); tN += (p.tab.home.tiri | 0) - wN; tL += (p.tab.away.tiri | 0) - wL; mm += 90 - wm; });
console.log(`   riferimento (stesse partite, minuti fuori dalle finestre): tiri nostri ${(tN / mm * 5).toFixed(2)} ogni 5' · tiri loro ${(tL / mm * 5).toFixed(2)} ogni 5'`);
for (const [t, rr] of Object.entries(perTipo)) {
  if (t === 'panca') { console.log(`   panca: ${rr.length} racconti · ingresso ${JSON.stringify(rr.map(r => r.ingresso))}`); continue; }
  const m = rr.reduce((a, r) => a + (r.m1 - r.m0), 0) || 1;
  const gF = rr.reduce((a, r) => a + d(r, 'gNoi'), 0), gS = rr.reduce((a, r) => a + d(r, 'gLoro'), 0);
  const occ = rr.filter(r => r.occ != null).map(r => r.occ - r.m0);
  console.log(`   ${t}: ${rr.length} finestre · tiri nostri ${(rr.reduce((a, r) => a + d(r, 'tiriNoi'), 0) / m * 5).toFixed(2)} ogni 5' · tiri loro ${(rr.reduce((a, r) => a + d(r, 'tiriLoro'), 0) / m * 5).toFixed(2)} · gol fatti ${gF} subiti ${gS} · contropiedi ${rr.reduce((a, r) => a + d(r, 'contro'), 0)} · occasione dell'eroe nella finestra ${occ.length}/${rr.length} (dopo ${JSON.stringify(occ)} minuti)`);
}
const kk = {}; RA.forEach(r => { const k = (r.esito || {}).k; kk[k] = (kk[k] || 0) + 1; });
console.log(`   racconti dopo ~5': ${RA.length} · fatto messo davanti ${JSON.stringify(kk)} · coerenti (INT259.verifica) ${RA.filter(r => INT259.verifica({ prima: r.prima, dopo: r.dopo, occ: r.occ, ingresso: r.ingresso }, r.esito)).length}/${RA.length}`);
/* esito finale delle partite con scheda: il punteggio dopo la scheda e' cambiato? */
let cambia = 0, tot = 0; R.forEach(p => { if (!p.finita) return; ((p.s259 || {}).schede || []).forEach(s => { tot++; if (((p.score.home | 0) - (p.score.away | 0)) !== s.diff) cambia++; }); });
console.log(`\n4) ANDAMENTO DOPO LA SCHEDA: lo scarto finale e' diverso da quello al momento della scheda in ${cambia}/${tot} schede`);
const fuori = R.reduce((a, p) => a + (p.fuori || []).length, 0);
console.log(`\n5) PO-260: campioni con la scheda a schermo fuori dal gioco fluido ${fuori} ${JSON.stringify(R.flatMap(p => (p.fuori || []).map(f => 'p' + p.i + ':' + f)).slice(0, 12))} · campioni a schermo in tutto ${R.reduce((a, p) => a + (p.aSchermo | 0), 0)}`);
console.log(`\n6) PARTITE: ${R.map(p => 'p' + p.i + ' ' + (p.score ? p.score.home + '-' + p.score.away : '?') + ' hl' + (p.hl || []).length + ' [' + ((p.s259 || {}).schede || []).map(s => s.min + "'" + s.fatto + '(' + s.diff + ')').join(' ') + ']').join(' · ')}`);
