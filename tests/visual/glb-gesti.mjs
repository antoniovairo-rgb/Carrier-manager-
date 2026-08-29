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
const SCENE = [...pick(/tiro|conclusione|volée|volee|al volo/i, 6), ...pick(/rovesciat|sforbiciat/i, 3), ...pick(/assist|cross/i, 5)];

const srv = await startServer(); const port = srv.address().port;
const b = await launchBrowser();
const page = await b.newPage({ viewport: { width: 412, height: 915 } });
await installCdnRoutes(page);
await openMatch(page, port, { name: 'Glb' });

let pronti = false;
for (let k = 0; k < 30 && !pronti; k++) { await sleep(1000); pronti = await page.evaluate(() => window.__CPM_GLB_READY === true).catch(() => false); }
if (!pronti) { console.log('⚠️  i personaggi GLB non si sono agganciati: la sonda dichiara il suo limite e non giudica'); await b.close(); srv.close(); process.exit(0); }
console.log(`personaggi GLB agganciati · scene da esercitare: ${SCENE.length}`);

const oss = [];
for (const sc of SCENE) {
  await forceSituation(page, sc.gi, { settle: 420, choose: true });
  await page.evaluate(k => window.__CPM_RESOLVE && window.__CPM_RESOLVE(k), sc.k).catch(() => {});
  for (let t = 0; t < 12; t++) {
    await sleep(130);
    const p = await page.evaluate(() => (window.__CPM_GLBPOSE675 ? window.__CPM_GLBPOSE675() : null)).catch(() => null);
    if (p && p.att && p.att.length) { const dopp = p.att.filter(a => (a.sopra || []).length > 1);
      oss.push({ lbl: sc.lbl, att: p.att.map(a => a.clip + ':' + a.peso).join(' + '), n: p.att.length, doppi: dopp.length, dettDoppi: dopp.map(a => a.sopra.join('+')).join(' '), gkRz: p.gk ? p.gk.rz : null, eroe: p.eroe }); }
  }
}
await b.close(); srv.close();

if (!oss.length) { console.log('⚠️  nessun gesto GLB osservato nelle scene esercitate — lo strumento vede il mondo ma le scene non lo attivano'); process.exit(0); }
const doppi = oss.filter(o => o.doppi > 0);
const gkPiegato = oss.filter(o => o.gkRz != null && Math.abs(o.gkRz) > 0.25);
console.log(`campioni con un gesto attivo: ${oss.length}`);
console.log(`  DUE CLIP SULLO STESSO CORPO (il doppio gesto vero): ${doppi.length} su ${oss.length} (banda 0) ${doppi.slice(0, 3).map(d => '· ' + d.dettDoppi).join(' ')}`);
console.log(`  portiere col corpo inclinato a mano sotto GLB: ${gkPiegato.length} (banda 0)`);
const perClip = {}; for (const o of oss) for (const c of o.att.split(' + ')) { const k = c.split(':')[0]; perClip[k] = (perClip[k] || 0) + 1; }
console.log(`  clip osservate: ${JSON.stringify(perClip)}`);
for (const o of oss.slice(0, 6)) console.log(`   ${o.att.padEnd(22)} ← ${o.lbl}`);
