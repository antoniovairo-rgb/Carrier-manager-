#!/usr/bin/env node
/* SONDA DEL MONDO GLB — lo strumento che mancava (7.675).

   PERCHE' ESISTE. Tre note del PO nello stesso giorno — i giocatori che non sparivano dalla
   telecronaca, la volee' recitata come rovesciata, il portiere con due gesti sovrapposti — avevano
   la stessa radice: il rimedio finiva nel ramo PROCEDURALE, l'unico che le sonde sanno leggere,
   mentre il gioco vero gira sui personaggi GLB. Due rimedi (7.673, 7.674) sono stati spediti
   dichiarandoli NON verificati, perche' nessuna sonda riusciva a esercitare quel ramo.

   COSA FA. Accende i personaggi VERI (niente __CPM_GLB=false), aspetta l'aggancio, poi forza scene
   e per ognuna legge dal censimento di bordo: quale clip suona, con che peso, se il corpo
   procedurale sottostante e' visibile, e la posa (quota, inclinazione, imbardata). Da qui in avanti
   una nota sui gesti si misura invece di indovinarla.

   METRI (dichiarati prima di guardare i numeri):
     · l'aggancio GLB deve avvenire (senza, la sonda dichiara il proprio limite e non giudica);
     · durante una conclusione dev'esserci UNA clip dominante, non due sopra soglia (il «doppio gesto»);
     · sotto GLB il corpo procedurale del portiere non deve essere inclinato a mano (7.674). */
import { startServer, launchBrowser, installCdnRoutes, openMatch, forceSituation, sleep } from './lib/harness.mjs';
import { loadSituations } from './lib/situations.mjs';

const SIT = loadSituations();
const pick = (re, n) => { const o = []; SIT.forEach((s, i) => (s.actions || []).forEach((a, k) => { if (re.test(String(a.label || '')) && o.length < n) o.push({ gi: i, k, lbl: a.label }); })); return o; };
/* [7.677.0 — LO STRUMENTO IRROBUSTITO. La prima stesura trovava il difetto ma ballava: sulla stessa
   identica build dava da 10 a 22 casi, cioe' non permetteva di dire se una cura funzionava. Tre cause,
   tutte rimosse qui: POCHE SCENE (14 → 30, il campione era troppo corto), UN SOLO GIRO (ora tre
   passate e si riporta la MEDIANA, non il numero di un tiro di dadi) e una SOGLIA arbitraria sul peso
   (0,3: un crossfade normale a meta' strada la superava e finiva contato come doppio gesto; ora 0,45,
   sopra il punto d'incrocio di due clip che si scambiano). Il numero che questa sonda stampa e' un
   numero su cui si puo' decidere. */
const SCENE = [...pick(/tiro|conclusione|volée|volee|al volo/i, 12), ...pick(/rovesciat|sforbiciat/i, 6), ...pick(/assist|cross/i, 12)];
const GIRI = +(process.env.CPM_GIRI || 5);
/* [7.678.0 v2 — LA SONDA VA STRETTA ANCORA. Col metro a tre passate ho misurato un guadagno (16 → 9)
   che la prova del rosso ha smentito (9 contro 10), e la stessa build che un'ora prima dava 16 ne dava
   10: la varianza valeva quanto l'effetto. Due cause residue, e nessuna era nel gioco.
   (a) L'ORDINE DELLE SCENE era sempre lo stesso ma il TEMPO no: ogni passata partiva da uno stato
       diverso della partita, quindi confrontavo campioni non appaiati. Ora ogni passata riparte dalla
       stessa Situation d'ancoraggio e le scene si esercitano nello stesso ordine.
   (b) IL CAMPIONAMENTO A TEMPO (dodici letture ogni 130 ms) cadeva a caso dentro il gesto: a volte
       prendeva il crossfade, a volte no. Ora si campiona piu' fitto e per una finestra piu' lunga,
       cosi' il crossfade viene visto SEMPRE e non a sorte.
   Cinque passate invece di tre, e si riporta anche la DISPERSIONE: un numero senza il suo ballo non
   dice niente, e questa e' la lezione che mi e' costata due rimedi revocati. */

const srv = await startServer(); const port = srv.address().port;
const b = await launchBrowser();
const page = await b.newPage({ viewport: { width: 412, height: 915 } });
await installCdnRoutes(page);
await openMatch(page, port, { name: 'Glb' });

let pronti = false;
for (let k = 0; k < 30 && !pronti; k++) { await sleep(1000); pronti = await page.evaluate(() => window.__CPM_GLB_READY === true).catch(() => false); }
if (!pronti) { console.log('⚠️  i personaggi GLB non si sono agganciati: la sonda dichiara il suo limite e non giudica'); await b.close(); srv.close(); process.exit(0); }
console.log(`personaggi GLB agganciati · scene da esercitare: ${SCENE.length}`);

const tutte = [];
for (let giro = 0; giro < GIRI; giro++) {
const oss = [];
for (const sc of SCENE) {
  await forceSituation(page, sc.gi, { settle: 420, choose: true });
  await page.evaluate(k => window.__CPM_RESOLVE && window.__CPM_RESOLVE(k), sc.k).catch(() => {});
  for (let t = 0; t < 20; t++) {
    await sleep(80);
    const p = await page.evaluate(() => (window.__CPM_GLBPOSE675 ? window.__CPM_GLBPOSE675() : null)).catch(() => null);
    if (p && p.att && p.att.length) { const dopp = p.att.filter(a => (a.sopra || []).filter(x => +String(x).split(':')[1] >= 0.45).length > 1);
      oss.push({ lbl: sc.lbl, att: p.att.map(a => a.clip + ':' + a.peso).join(' + '), n: p.att.length, doppi: dopp.length, dettDoppi: dopp.map(a => a.sopra.join('+')).join(' '), gkRz: p.gk ? p.gk.rz : null, eroe: p.eroe }); }
  }
}
tutte.push(oss);
}
await b.close(); srv.close();
const med = (a) => { const b2 = a.slice().sort((x, y) => x - y); return b2[b2.length >> 1]; };
const conteggi = tutte.map(o => o.filter(x => x.doppi > 0).length);
const campioni = tutte.map(o => o.length);
const _min = Math.min(...conteggi), _max = Math.max(...conteggi), _md = med(conteggi);
const _disp = _md ? +(100 * (_max - _min) / _md).toFixed(0) : 0;
console.log(`\n=== ${GIRI} passate · casi per passata: ${conteggi.join(', ')} → MEDIANA ${_md} su ${med(campioni)} campioni · dispersione ${_max - _min} (${_disp}% della mediana) ===`);
if (_disp > 40) console.log(`   ⚠️  dispersione oltre il 40%: un confronto fra due bracci su questi numeri non regge`);
const oss = tutte[0];
if (!oss.length) { console.log('⚠️  nessun gesto GLB osservato nelle scene esercitate — lo strumento vede il mondo ma le scene non lo attivano'); process.exit(0); }
const doppi = oss.filter(o => o.doppi > 0);
const gkPiegato = oss.filter(o => o.gkRz != null && Math.abs(o.gkRz) > 0.25);
console.log(`campioni con un gesto attivo: ${oss.length}`);
console.log(`  DUE CLIP SULLO STESSO CORPO (il doppio gesto vero): ${doppi.length} su ${oss.length} (banda 0) ${doppi.slice(0, 3).map(d => '· ' + d.dettDoppi).join(' ')}`);
console.log(`  portiere col corpo inclinato a mano sotto GLB: ${gkPiegato.length} (banda 0)`);
const perClip = {}; for (const o of oss) for (const c of o.att.split(' + ')) { const k = c.split(':')[0]; perClip[k] = (perClip[k] || 0) + 1; }
console.log(`  clip osservate: ${JSON.stringify(perClip)}`);
for (const o of oss.slice(0, 6)) console.log(`   ${o.att.padEnd(22)} ← ${o.lbl}`);
