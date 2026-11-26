#!/usr/bin/env node
/* GUARDIANO giro 367 (PO-651) — UN TIRO SBAGLIATO DELL'EROE ESCE DI UNA DISTANZA CREDIBILE, E RESTA UN TIRO SBAGLIATO.

   Taccuino PO 7.999.208: «quando l'eroe sbaglia una conclusione a volte la palla esce davvero di tanto, ridimensiona le distanze!».
   Misura madre (misura-367, 69 tiri fuori, corpi accesi): scarto dal palo all'uscita mediana 0,99 m · 90° 2,45 · massimo 7,47;
   dopo l'uscita il pallone rimbalzava e scivolava lungo il fondo fino a 11,68 m dal palo (gli veniva data la respinta di una parata).

   Strumento: lo stesso di misura-367 — traccia del pallone (mesh) in tempo di scena, porta letta dalle mesh della stessa scena, corpi
   GLB accesi, un browser nuovo per tiro. Esito forzato «fuori» (wide) come lo assegna il motore.
   CAMPIONE DICHIARATO: otto scene, una per famiglia di tiro/testa (da fuori, potenza, di prima, uno contro uno, a giro, pallonetto,
   volee, testa), ciascuna DUE volte nel verde: una «provocata» (il bersaglio di lato della variante messo a ±11 dal gancio di solo
   collaudo __CPM_PZ367: e' il valore che giro e secondo palo sorteggiano da soli, 6-13) e una «naturale» (sorteggio del gioco);
   piu' punizione e rigore naturali. Nel rosso (window.__CPM_NO_G367) solo le otto provocate, piu' tre rigori fuori con window.__CPM_NO_G393 (giro 393: almeno due a meno di 0,5 m dal palo o nello specchio); nel verde anche il rigore passa ad almeno 0,5 m dal palo.
   VERDE, per ogni tiro:
     (1) l'esito non cambia: il motore dichiara «wide» in ogni fotogramma, nessun post-arco di rete o di legno, il pallone non entra
         mai in porta, il tabellone non si muove;
     (2) e' fuori davvero: all'uscita non sta nello specchio; tiri e colpi di testa passano ad almeno 0,5 m dal palo;
     (3) distanza credibile: all'uscita lo scarto dal palo non supera il tetto 1,0 + 0,10 × distanza del tiro (fra 1,5 e 4,0 m), +0,35 di
         tolleranza di campionamento;
     (4) nessuna spinta dopo il volo: tiri e colpi di testa arrivano sul fondo entro 0,35 m dal bersaglio deciso al calcio, e dopo
         l'arrivo il pallone non si allontana dal palo piu' di 1,2 m.
   ROSSO: almeno tre tiri provocati su otto escono oltre 4,35 m dal palo, e almeno quattro arrivano sul fondo a piu' di 0,35 m dal
   bersaglio dell'arco (la spinta della finta respinta: misurato 7 su 8, da 0,41 a 5,31 m). Soglie fissate
   DOPO la misura: in due corse senza la correzione sono usciti larghi sempre gli stessi quattro (potenza 7,3 · di prima 7,3-7,4 · a giro
   8,0-8,1 · volee 6,9-10,2 m dal palo) con scivolata massima 4,4 e 4,7 m; negli altri quattro la vecchia ricerca cambiava lato.
   Un tiro non giudicabile (corpi spenti, porta non letta, esito diverso, calcio non campionato, linea non raggiunta) e' ROSSO.
     CPM_CHROME=… node tiri-367.mjs     CPM_SOLO=verde|rosso   CPM_PAR=n (default 3)   CPM_FOTO=1 (foto prima/dopo in docs/collaudo-po) */
import path from 'node:path';
import { ROOT, startServer } from './lib/harness.mjs';
import { tiro, misura } from './misura-367.mjs';

const SOLO = process.env.CPM_SOLO || '', PAR = +(process.env.CPM_PAR || 3), FOTO = !!process.env.CPM_FOTO;
const FAM = [['8', '0', 'tiro-da-fuori'], ['3', '1', 'tiro-potenza'], ['62', '1', 'di-prima'], ['0', '0', 'uno-contro-uno'], ['17', '2', 'a-giro'], ['0', '2', 'pallonetto'], ['1', '0', 'volee'], ['86', '0', 'testa']].map(([gi, ai, fam]) => ({ gi, ai, fam }));
const PIAZZATI = [{ gi: '13', ai: '0', fam: 'punizione' }, { gi: '5', ai: '0', fam: 'rigore' }];
const TETTO = d => Math.min(4.0, Math.max(1.5, 1.0 + 0.10 * d));
const f = (x, n = 2) => x == null ? '—' : (+x).toFixed(n);

async function braccio(port, nome) {
  const rosso = nome === 'rosso'; const lavori = [];
  FAM.forEach((sc, i) => lavori.push({ sc, pz: i % 2 ? -11 : 11, foto: FOTO && [1, 2, 4].includes(i) ? path.join(ROOT, 'docs', 'collaudo-po', `367-${sc.fam}-${rosso ? 'prima' : 'dopo'}.png`) : null }));
  if (!rosso) { FAM.forEach(sc => lavori.push({ sc, pz: null })); PIAZZATI.forEach(sc => lavori.push({ sc, pz: null })); }
  /* [giro 393] rosso del rigore fuori: senza la correzione (__CPM_NO_G393) il pallone si ferma a 0,02-0,29 m dal palo (12 corse su 12 sotto 0,5) */
  if (rosso) for (let k = 0; k < 3; k++) lavori.push({ sc: PIAZZATI[1], pz: null, no393: true });
  const ris = []; let nx = 0;
  await Promise.all(Array.from({ length: PAR }, async () => { while (nx < lavori.length) { const L = lavori[nx++];
    let o = await tiro(null, port, L.sc, { rosso: rosso && !L.no393, pz: L.pz, foto: L.foto, no393: !!L.no393 }); if (o.skip && /^errore/.test(o.skip)) o = await tiro(null, port, L.sc, { rosso: rosso && !L.no393, pz: L.pz, foto: L.foto, no393: !!L.no393 }); /* un guasto del browser si riprova una volta */
    const m = misura(o); ris.push({ ...L, o, m });
    console.log(`  [${nome}] gi${L.sc.gi} ${L.sc.fam.padEnd(14)} ${L.pz == null ? 'naturale ' : 'provocato'} ` + (m.nonGiud ? 'NON GIUDICATO: ' + m.nonGiud : m.nonLinea ? `non arriva alla linea (x max ${f(m.xMax, 1)})` : `da ${f(m.dist, 0)} m · esce a ${f(m.lato)} m dal palo (tetto ${f(TETTO(m.dist))}) · a ${f(m.daBersaglio)} m dal bersaglio dell'arco · dopo l'uscita fino a ${f(m.dopoLato)} · esito ${m.tipi.join('/')} · post-arco ${m.post.join('/') || '—'}${m.inRete ? ' · IN RETE' : ''}${o.foto ? ' · foto' : ''}`)); } }));
  return ris;
}

function giudica(nome, ris) {
  const motivi = []; const prov = ris.filter(r => r.pz != null);
  for (const r of ris) { const m = r.m, chi = `gi${r.sc.gi} ${r.sc.fam}${r.pz == null ? '' : ' provocato'}`;
    if (m.nonGiud) { motivi.push(`${chi}: non giudicato (${m.nonGiud})`); continue; }
    if (m.nonLinea) { motivi.push(`${chi}: non giudicato (il pallone non arriva alla linea di fondo, x max ${f(m.xMax, 1)})`); continue; }
    if (r.o.errs && r.o.errs.length) motivi.push(`${chi}: errore di pagina ${r.o.errs[0]}`);
    if (nome === 'rosso') continue;
    const tiroTesta = r.sc.fam !== 'punizione' && r.sc.fam !== 'rigore';
    if (m.tipi.length !== 1 || m.tipi[0] !== 'wide') motivi.push(`${chi}: (1) l'esito cambia (${m.tipi.join('/')})`);
    if (m.post.some(p => /in_net|hit_post/.test(p))) motivi.push(`${chi}: (1) post-arco ${m.post.join('/')}`);
    if (m.inRete) motivi.push(`${chi}: (1) il pallone entra in porta`);
    if (r.o.esito && r.o.esito.score0 !== r.o.esito.score) motivi.push(`${chi}: (1) il tabellone si muove (${r.o.esito.score0} → ${r.o.esito.score})`);
    if (m.nelloSpecchio) motivi.push(`${chi}: (2) all'uscita il pallone e' nello specchio`);
    if ((tiroTesta || r.sc.fam === 'rigore') && m.lato < 0.5 && m.sopra <= 0) motivi.push(`${chi}: (2) esce a ${f(m.lato)} m dal palo (minimo 0,5)`); /* [giro 393] anche il rigore: a 0,02-0,29 m dal palo l'uscita era a volte ancora nello specchio, secondo il fotogramma campionato */
    if (m.lato > TETTO(m.dist) + 0.35) motivi.push(`${chi}: (3) esce a ${f(m.lato)} m dal palo da ${f(m.dist, 0)} m (tetto ${f(TETTO(m.dist))} + 0,35)`);
    if (tiroTesta && m.daBersaglio > 0.35) motivi.push(`${chi}: (4) il pallone arriva sul fondo a ${f(m.daBersaglio)} m dal bersaglio dell'arco (tetto 0,35)`);
    if (m.dopoLato != null && m.dopoLato - m.lato > 1.2) motivi.push(`${chi}: (4) dopo l'uscita scivola di ${f(m.dopoLato - m.lato)} m (tetto 1,2)`);
  }
  if (nome === 'rosso') { const r393 = ris.filter(r => r.no393), g393 = r393.filter(r => r.m.lato != null), s393 = g393.filter(r => r.m.nelloSpecchio || (r.m.lato < 0.5 && r.m.sopra <= 0)).length;
    console.log(`[rosso] rigore fuori senza la correzione 393 (m dal palo): ${r393.map(r => r.m.lato == null ? 'non giudicato' : f(r.m.lato)).join(' · ')}`);
    if (s393 < 2) motivi.push(`il rosso 393 non riproduce: ${s393} rigori fuori su ${r393.length} a meno di 0,5 m dal palo o nello specchio (servono 2)`); }
  if (nome === 'rosso') { const g = prov.filter(r => r.m.lato != null), larghi = g.filter(r => r.m.lato > 4.35).length, sciv = Math.max(0, ...g.map(r => r.m.dopoLato - r.m.lato));
    if (larghi < 3) motivi.push(`il rosso non riproduce: ${larghi} tiri provocati su ${g.length} oltre 4,35 m dal palo (servono 3)`);
    const spinti = g.filter(r => r.m.daBersaglio > 0.35).length;
    console.log(`[rosso] arrivo sul fondo lontano dal bersaglio dell'arco (m): ${g.map(r => f(r.m.daBersaglio)).join(' · ')} · scivolata massima ${f(sciv)}`);
    if (spinti < 4) motivi.push(`il rosso non riproduce: ${spinti} tiri provocati su ${g.length} arrivano a piu' di 0,35 m dal bersaglio dell'arco (servono 4)`); }
  const v = ris.filter(r => r.m.lato != null).map(r => r.m.lato).sort((a, b) => a - b);
  console.log(`[${nome}] ${v.length} tiri giudicati su ${ris.length} · scarto dal palo all'uscita: mediana ${f(v[Math.floor(v.length / 2)])} m · massimo ${f(v[v.length - 1])} m · scivolata massima dopo l'uscita ${f(Math.max(...ris.filter(r => r.m.dopoLato != null).map(r => r.m.dopoLato - r.m.lato)))} m`);
  return motivi;
}

const srv = await startServer(); const port = srv.address().port; let esito = 0; const righe = [];
for (const nome of ['verde', 'rosso']) { if (SOLO && SOLO !== nome) continue;
  const ris = await braccio(port, nome); const motivi = giudica(nome, ris);
  /* braccio e motivo stampati per ultimi */
  righe.push(motivi.length ? `✗ braccio ${nome}: ${motivi.join(' · ')}` : `✓ braccio ${nome}: ${nome === 'rosso' ? 'senza la correzione i tiri provocati escono oltre 4,35 m dal palo e il pallone viene spinto via dal suo bersaglio' : 'ogni tiro sbagliato resta un tiro fuori ed esce di una distanza credibile'}`);
  if (motivi.length) esito = 1; }
console.log('\n' + righe.join('\n')); console.log(esito ? '\n❌ tiri-367 ROSSO' : '\n✅ tiri-367 VERDE (verde + rosso)');
srv.close(); setTimeout(() => process.exit(esito), 200);
