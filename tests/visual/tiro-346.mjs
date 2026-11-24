#!/usr/bin/env node
/* GUARDIANO giro 346 — due difetti, due bracci, ognuno col suo rosso.

   A · PO-585 «c'e' uno scambio con un compagno di squadra invisibile» (nota 7.999.198, «Ricevi fra le linee: hai spazio!» → «Tiro da
       fuori» → miss; bozza: codice 012, pallone tornato INDIETRO di 19,0 u, scrittore 16). Rosso: __CPM_NO_G346A.
       Corpi GLB accesi, pagina NUOVA per scena, stacco di scena e copione del build-up accesi (misura-346.mjs). Tiri che finiscono sul
       LEGNO: la scena del PO da quattro punti + quattro tiri del catalogo. Per fotogramma (testimone di bordo, codice scrittore) si
       misura l'arretramento massimo del pallone dal punto piu' avanzato NELLA FINESTRA D'ESITO (dal tiro in poi: e' li' che scrive lo
       scrittore 16; l'apertura della scena, dove il pallone viene messo in posizione, non c'entra) e si chiama il rilevatore del gioco.
       VERDE: in ogni scena arretramento < 12 u (la soglia del rilevatore), il rilevatore non scrive «codice 012», il rimbalzo ha un
         bersaglio in area (5-8 u dalla linea) e un avversario va a raccoglierlo. Due tiri non sul legno (fuori, parato) restano < 12 u.
       ROSSO: l'arretramento >= 12 u e il «codice 012» tornano in almeno 5 scene su 6.
   B · PO-561 «I movimenti incidono sulla probabilita' di successo della giocata o e' solo "un abbellimento"?» Rosso: __CPM_NO_G346B.
       Banco sul motore (movimenti-346.mjs): riuscita di tiro e assist da fermo e dopo i passi, su tutte le scene con passi da spendere.
       VERDE: tiro — mossa migliore >= +15% e <= +60% sulla riuscita da fermo (conta, ma non stravolge), mossa peggiore <= -10%;
         assist — migliore >= +3%, peggiore <= -5%; senza passi il gol atteso e' IDENTICO al rosso (stesso stato, primo conto).
       ROSSO: la mossa migliore non cambia il gol atteso in nessun tiro (0 su tutti).
       PERCORSO VERO (partita viva, motore acceso, due passi dai tasti): i passi arrivano al motore (verde: la giocata porta lo stacco;
         rosso: il motore non li legge).
   Una scena senza esito, senza fine vista o senza rimbalzo dal legno e' NON GIUDICATA = rosso. Nessuna ripetizione.
     CPM_CHROME=… node tiro-346.mjs      (CPM_SOLO=A|Arosso|B|vero · CPM_PAR=3) */
import fs from 'node:fs';
import { startServer, launchBrowser } from './lib/harness.mjs';
import { parseCasi, caso, riga } from './misura-346.mjs';
import { banco, stampa } from './movimenti-346.mjs';
const PAR = +(process.env.CPM_PAR || 3), SOLO = process.env.CPM_SOLO || '';
const LEGNO = parseCasi('0:Tiro da fuori:post,1:Tiro da fuori:post:58:40,2:Tiro da fuori:post:66:62,3:Tiro da fuori:post:70:30,G1:0:post,G9:0:post,G62:1:post,G86:0:post');
const ALTRI = parseCasi('0:Tiro da fuori:wide,0:Tiro da fuori:saved');
const ROSSI = LEGNO.filter((_, i) => [0, 1, 2, 4, 5, 6].includes(i));
const fail = [], riep = {};
const srv = await startServer(), port = srv.address().port, b = await launchBrowser();
async function giro(casi, rosso) { const out = new Array(casi.length); let nx = 0;
  await Promise.all(Array.from({ length: Math.min(PAR, casi.length) }, async () => { while (nx < casi.length) { const i = nx++; out[i] = await caso(b, port, casi[i], rosso, true); console.log(riga(out[i]) + (out[i].err ? '' : ` · bersaglio x ${out[i].tx} · raccoglitore ${out[i].col ? 'sì' : 'no'} · fine a ${out[i].fine ? out[i].fine.dEroe : '?'} u dall'eroe`)); } })); return out; }
const giud = o => !o.err && o.out && o.fineOk && o.pa && o.pa.length >= 5 && o.S && o.S.length >= 5;
const legno = o => giud(o) && o.pa.some(r => r.pt === 'post_rebound');
if (!SOLO || SOLO === 'A') { console.log(`\n── A · VERDE · ${LEGNO.length} tiri sul legno + ${ALTRI.length} non sul legno`);
  const R = await giro(LEGNO, ''), ng = R.filter(o => !legno(o)), ok = R.filter(legno);
  const ind = ok.filter(o => o.Rpa.dd >= 12), c12 = ok.filter(o => o.c012), noCol = ok.filter(o => !o.col), fuoriB = ok.filter(o => !(o.tx >= 40.5 && o.tx <= 43.7));
  const mx = ok.length ? Math.max(...ok.map(o => o.Rpa.dd)) : null;
  console.log(`   legno giudicati ${ok.length} · arretramento massimo nella finestra d'esito ${mx} u · >= 12 u: ${ind.length} · «codice 012»: ${c12.length} · senza raccoglitore: ${noCol.length} · bersaglio fuori da 5-8 u dalla linea: ${fuoriB.length} · non giudicati ${ng.length}${ng.length ? ' (' + ng.map(o => o.id + (o.err ? ': ' + o.err : '')).join(' · ') + ')' : ''}`);
  if (ng.length) fail.push(`A verde: ${ng.length} scene non giudicate`); if (ok.length < 8) fail.push(`A verde: ${ok.length} tiri sul legno giudicati (servono 8)`);
  if (ind.length) fail.push(`A verde: pallone tornato indietro >= 12 u in ${ind.length} scene (${ind.map(o => o.id + ' ' + o.Rpa.dd).join(' · ')})`); if (c12.length) fail.push(`A verde: il rilevatore scrive «codice 012» in ${c12.length} scene`);
  if (noCol.length) fail.push(`A verde: nessuno va a raccogliere il rimbalzo in ${noCol.length} scene (${noCol.map(o => o.id).join(' · ')})`); if (fuoriB.length) fail.push(`A verde: bersaglio del rimbalzo fuori dall'area attesa in ${fuoriB.length} scene`);
  const R2 = await giro(ALTRI, ''), ng2 = R2.filter(o => !giud(o)), ind2 = R2.filter(o => giud(o) && o.Rpa.dd >= 12);
  if (ng2.length) fail.push(`A verde: ${ng2.length} tiri non sul legno non giudicati`); if (ind2.length) fail.push(`A verde: arretramento >= 12 u su un tiro non sul legno (${ind2.map(o => o.id + ' ' + o.Rpa.dd).join(' · ')})`);
  riep.A = { giudicati: ok.length, massimo: mx, c012: c12.length, altri: R2.filter(giud).map(o => o.Rpa.dd) }; }
if (!SOLO || SOLO === 'Arosso') { console.log(`\n── A · ROSSO __CPM_NO_G346A · ${ROSSI.length} tiri sul legno`);
  const R = await giro(ROSSI, '__CPM_NO_G346A'), ok = R.filter(legno), visto = ok.filter(o => o.Rpa.dd >= 12 && o.c012);
  console.log(`   giudicati ${ok.length} · arretramento >= 12 u con «codice 012»: ${visto.length} (${ok.map(o => o.Rpa.dd).join(' · ')} u)`);
  if (ok.length < 6) fail.push(`A rosso: ${ok.length} scene giudicate (servono 6)`); if (visto.length < 5) fail.push(`A rosso: il difetto si rivede solo in ${visto.length} scene su ${ok.length} (servono 5): il guardiano non lo vede`);
  riep.Arosso = { giudicati: ok.length, visto: visto.length, dd: ok.map(o => o.Rpa.dd) }; }
if (!SOLO || SOLO === 'vero') { console.log('\n── B · PERCORSO VERO · partita viva, due passi dai tasti, poi «Tiro da fuori»');
  for (const r of ['', '__CPM_NO_G346B']) { const c = parseCasi('0:Tiro da fuori:libero:62:50:0.2')[0]; c.passi = 2; c.vivo = 1; const o = await caso(b, port, c, r, false); const s = o.sc137;
    console.log(`   ${r || 'verde'}: passi fatti ${o.passi} · passi registrati ${s && s.mov ? s.mov.n : '?'} (spostamento ${s && s.mov ? s.mov.dx.toFixed(1) + ' · ' + s.mov.dy.toFixed(1) : '?'}, stacco ${s && s.mov ? s.mov.sm.toFixed(2) : '?'}) · il motore ${s && s.g && s.g.mov ? 'li ha letti (fattore spazio ' + s.g.mov.sp + ', tiro da x ' + s.g.mov.x + ')' : 'NON li ha letti'}${o.err ? ' · ' + o.err : ''}`);
    if (o.err || !s || !s.g || !s.mov) { fail.push(`vero ${r || 'verde'}: non giudicato (${o.err || 'la scena non e\' passata dal motore'})`); continue; }
    if (o.passi !== 2 || s.mov.n !== 2) fail.push(`vero ${r || 'verde'}: passi fatti ${o.passi}, registrati ${s.mov.n} (servono 2 e 2)`);
    if (!r && !(s.g.mov && s.g.mov.sp !== 1)) fail.push('vero verde: i passi non sono arrivati al motore'); if (r && s.g.mov) fail.push('vero rosso: il motore legge i passi anche col rosso'); } }
await b.close(); srv.close();
if (!SOLO || SOLO === 'B') { console.log('\n── B · BANCO SUL MOTORE · riuscita da fermo e dopo i passi');
  const v = await banco({}), r = await banco({ rosso: true }); stampa(v, 'verde'); stampa(r, 'ROSSO __CPM_NO_G346B');
  if (!v || v.err || !r || r.err) fail.push(`B: banco non giudicato (${(v && v.err) || (r && r.err)})`);
  else { const T = v.R.tiro, A = v.R.assist, q = (a, f) => a / f - 1;
    if (!(T.n >= 500 && A.n >= 500)) fail.push(`B verde: campioni insufficienti (tiro ${T.n}, assist ${A.n}; servono 500 e 500)`);
    else { if (!(q(T.migliore, T.fermo) >= 0.15)) fail.push(`B verde: sul tiro la mossa migliore vale solo ${(q(T.migliore, T.fermo) * 100).toFixed(1)}% (serve >= +15%)`);
      if (!(q(T.migliore, T.fermo) <= 0.60)) fail.push(`B verde: sul tiro la mossa migliore vale ${(q(T.migliore, T.fermo) * 100).toFixed(1)}% (tetto +60%: stravolge il bilanciamento)`);
      if (!(q(T.peggiore, T.fermo) <= -0.10)) fail.push(`B verde: sul tiro la mossa peggiore vale ${(q(T.peggiore, T.fermo) * 100).toFixed(1)}% (serve <= -10%)`);
      if (!(q(A.migliore, A.fermo) >= 0.03)) fail.push(`B verde: sull'assist la mossa migliore vale ${(q(A.migliore, A.fermo) * 100).toFixed(1)}% (serve >= +3%)`);
      if (!(q(A.peggiore, A.fermo) <= -0.05)) fail.push(`B verde: sull'assist la mossa peggiore vale ${(q(A.peggiore, A.fermo) * 100).toFixed(1)}% (serve <= -5%)`);
      if (v.diversi !== v.diversi + v.uguali) fail.push(`B verde: la mossa migliore cambia il gol atteso solo in ${v.diversi} tiri su ${v.diversi + v.uguali}`); }
    const d = (v.primo || []).filter((x, i) => x == null || x !== r.primo[i]).length; console.log(`  identita' senza passi (gol atteso da fermo, primo conto, verde contro rosso): ${(v.primo || []).length - d} uguali su ${(v.primo || []).length}`);
    if (!(v.primo && v.primo.length >= 50) || d) fail.push(`B verde: senza passi il gol atteso non e' identico a prima (${d} diversi su ${(v.primo || []).length})`);
    if (!(r.diversi === 0 && r.uguali >= 500)) fail.push(`B rosso: col rosso la mossa cambia ancora il gol atteso in ${r.diversi} tiri (uguali ${r.uguali}): il guardiano non vede il difetto`);
    riep.B = { verde: v.R, rosso: r.R, casi: v.casi, scene: v.scene, stati: v.stati, identita: (v.primo || []).length - d }; } }
try { fs.mkdirSync('out', { recursive: true }); fs.writeFileSync('out/tiro-346.json', JSON.stringify({ riep, fail }, null, 1)); } catch (e) {}
if (fail.length) { console.log('\n❌ tiro-346 ROSSO\n  - ' + fail.join('\n  - ')); process.exit(1); }
console.log('\n✅ tiro-346 VERDE — verde col verde, rosso con ciascun rosso');
