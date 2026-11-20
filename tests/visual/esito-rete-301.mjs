#!/usr/bin/env node
/* GUARDIANO giro 301 (PO-588) — «UN ESITO NON-GOL NON FINISCE IN RETE». Rosso: __CPM_NO_G301.
   Nota del PO (7.999.198, «💥 Palla buona al limite dell'area!» → «🎯 Piazzato nell'angolo basso» → esito miss): la bozza del gioco dice
   «l'esito dichiarato è "miss" ma la palla è finita IN RETE».

   Corpi GLB accesi, pagina NUOVA per scena, stacco di scena e copione del build-up accesi. Per fotogramma (__CPM_PA457) si guarda il pallone
   per tutta la finestra d'esito, fino a 1,2 s di SCENA dopo che arco e post-arco si sono spenti (evento, non tempo fisso).
   «In rete» = oltre la linea di porta (x >= 48,6), fra i pali (|z| <= 3,66), sotto la traversa (y <= 2,44): la geometria del rilevatore
   di bordo (draftBugNote), che viene anche chiamato a fine scena come testimone.

   BRACCIO A «il gioco com'e'» (verde): almeno 30 tiri con esito non-gol di famiglie diverse — fallito con tipo deciso dal gioco (chiave
     «miss», incluso il caso del PO), fuori, parata, palo, murato, su tiro · testa · punizione. ✗ un solo fotogramma col pallone in rete,
     o il rilevatore che scrive «IN RETE». Si stampa anche quante volte la barriera 301 e' intervenuta (0 = il gioco non ci prova).
   BRACCIO B «provocato» (verde e rosso): su 8 tiri falliti il collaudo mette il bersaglio dell'arco DENTRO la porta (__CPM_RETE301, solo
     ?cpmtest=1): il gioco da solo non lo fa. VERDE: il pallone non entra (0 fotogrammi) e il rilevatore tace. ROSSO (__CPM_NO_G301):
     il pallone entra in almeno 6 scene su 8.
   CONTROPROVA (verde): i gol entrano sempre (6 tiri riusciti: almeno un fotogramma in rete in ognuno).
   Una scena senza esito o senza fine vista e' NON GIUDICATA = rosso. Nessuna ripetizione.
     CPM_CHROME=… node esito-rete-301.mjs      (CPM_SOLO=A|B|gol|rosso · CPM_PAR=3 · CPM_GLB=0) */
import { startServer, launchBrowser } from './lib/harness.mjs';
import { parseCasi, caso, riga } from './misura-301.mjs';
const PAR = +(process.env.CPM_PAR || 3), GLB = process.env.CPM_GLB !== '0', SOLO = process.env.CPM_SOLO || '';
const PO = ':83.8:36';
const A = parseCasi([
  'P:Piazzato:nat' + PO, 'P1:Piazzato:nat' + PO, 'P2:Piazzato:nat', 'P3:Piazzato:nat:83.8:64', 'P:Piazzato:wide' + PO, 'P:Piazzato:saved' + PO, 'P:Piazzato:post' + PO, 'P:Piazzato:blocked' + PO,
  '1:0:wide', '62:1:wide', '86:0:wide', '90:0:wide', '88:0:wide', '9:0:wide', '3:0:wide', '11:0:wide',
  '165:0:saved', '10:0:saved', '17:2:saved', '7:0:saved', '4:0:saved', '90:0:saved',
  '1:0:post', '62:1:post', '86:0:post', '9:0:post',
  '3:0:nat', '11:0:nat', '88:0:nat', '165:0:nat', '9:0:blocked', '11:0:blocked'].join(','));
const B = parseCasi(['P:Piazzato:wide' + PO, 'P:Piazzato:saved' + PO, 'P:Piazzato:nat' + PO, '1:0:wide', '9:0:saved', '11:0:wide', '3:0:saved', '90:0:wide'].join(',')).map(c => ({ ...c, prov: 1, id: c.id + ' [provocato]' }));
const GOL = parseCasi(['P:Piazzato:gol' + PO, '1:0:gol', '9:0:gol', '11:0:gol', '3:0:gol', '90:0:gol'].join(','));
const srv = await startServer(), port = srv.address().port, b = await launchBrowser();
async function giro(casi, rosso) { const out = new Array(casi.length); let nx = 0;
  await Promise.all(Array.from({ length: Math.min(PAR, casi.length) }, async () => { while (nx < casi.length) { const i = nx++; out[i] = await caso(b, port, casi[i], rosso, GLB); console.log(riga(out[i])); } })); return out; }
const giud = o => !o.err && o.out && o.fineOk && o.A.n >= 5;
const fail = [];
if (!SOLO || SOLO === 'A') { console.log(`\n── BRACCIO A · il gioco com'e' (verde) · ${A.length} tiri non-gol`);
  const R = await giro(A, ''); const ng = R.filter(o => !giud(o)), ok = R.filter(giud);
  const nonGol = ok.filter(o => !/goal/.test(String(o.out.key))), dentro = nonGol.filter(o => o.A.inRete), ril = nonGol.filter(o => o.rilevatoreRete), barr = nonGol.filter(o => o.g301 && o.g301.length);
  const fam = {}; for (const o of nonGol) { const k = `${o.ht}/${o.out.key}/${o.out.kind}`; fam[k] = (fam[k] || 0) + 1; }
  console.log(`   giudicati ${ok.length} · non-gol ${nonGol.length} · IN RETE ${dentro.length} · rilevatore «IN RETE» ${ril.length} · barriera intervenuta in ${barr.length} scene · non giudicati ${ng.length}${ng.length ? ' (' + ng.map(o => o.id + (o.err ? ': ' + o.err : '')).join(' · ') + ')' : ''}`);
  console.log('   famiglie (tipo/chiave/esito): ' + Object.entries(fam).map(([k, n]) => `${k} ${n}`).join(' · '));
  if (ng.length) fail.push(`A: ${ng.length} scene non giudicate`); if (nonGol.length < 30) fail.push(`A: solo ${nonGol.length} tiri non-gol giudicati (servono 30)`);
  if (dentro.length) fail.push(`A: pallone IN RETE su esito non-gol in ${dentro.length} scene (${dentro.map(o => o.id).join(' · ')})`); if (ril.length) fail.push(`A: il rilevatore del gioco scrive «IN RETE» in ${ril.length} scene`); }
if (!SOLO || SOLO === 'B') { console.log(`\n── BRACCIO B · provocato (verde) · ${B.length} tiri`);
  const R = await giro(B, ''); const ng = R.filter(o => !giud(o) || !o.prov), ok = R.filter(o => giud(o) && o.prov), dentro = ok.filter(o => o.A.inRete), ril = ok.filter(o => o.rilevatoreRete);
  console.log(`   giudicati ${ok.length} · IN RETE ${dentro.length} · rilevatore ${ril.length} · barriera intervenuta in ${ok.filter(o => o.g301 && o.g301.length).length} · non giudicati ${ng.length}`);
  if (ng.length) fail.push(`B verde: ${ng.length} non giudicate`); if (ok.length < 8) fail.push(`B verde: ${ok.length} giudicate (servono 8)`); if (dentro.length || ril.length) fail.push(`B verde: pallone in rete in ${dentro.length} scene, rilevatore in ${ril.length}`); }
if (!SOLO || SOLO === 'gol') { console.log(`\n── CONTROPROVA · i gol entrano (verde) · ${GOL.length} tiri`);
  const R = await giro(GOL, ''); const ok = R.filter(o => giud(o) && /goal/.test(String(o.out.key))), dentro = ok.filter(o => o.A.inRete);
  console.log(`   gol giudicati ${ok.length} · entrati ${dentro.length}`);
  if (ok.length < GOL.length) fail.push(`gol: ${GOL.length - ok.length} non giudicati`); if (dentro.length < ok.length) fail.push(`gol: ${ok.length - dentro.length} gol NON entrati (${ok.filter(o => !o.A.inRete).map(o => o.id).join(' · ')})`); }
if (!SOLO || SOLO === 'rosso') { console.log(`\n── BRACCIO B · provocato (ROSSO __CPM_NO_G301) · ${B.length} tiri`);
  const R = await giro(B, '__CPM_NO_G301'); const ok = R.filter(o => giud(o) && o.prov), dentro = ok.filter(o => o.A.inRete);
  console.log(`   giudicati ${ok.length} · IN RETE ${dentro.length} · rilevatore «IN RETE» ${ok.filter(o => o.rilevatoreRete).length}`);
  if (ok.length < 8) fail.push(`B rosso: ${ok.length} giudicate (servono 8)`); if (dentro.length < 6) fail.push(`B rosso: il difetto si rivede solo in ${dentro.length} scene su ${ok.length} (servono 6): il guardiano non lo vede`); }
await b.close(); srv.close();
if (fail.length) { console.log('\n❌ esito-rete-301 ROSSO\n  - ' + fail.join('\n  - ')); process.exit(1); }
console.log('\n✅ esito-rete-301 VERDE — verde col verde, rosso col rosso');
