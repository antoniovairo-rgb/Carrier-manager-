#!/usr/bin/env node
/* 7.541 — IL GOL SI VEDE ARRIVARE? (collaudo PO «non ci sono vere azioni e non si vedono i gol»).
   Il motore ha già un'azione pendente (7.532): quando il micro-simulatore decide un gol, la cronaca
   annuncia «⚡ Azione manovrata: la squadra sale in blocco verso l'area!» e la palla avanza verso l'ultimo
   terzo; il gol si scrive solo quando è in zona (x>=72 / x<=28) o dopo un tetto di sicurezza di 10 tick.
   ⚠️ Un tick è un MINUTO di gioco (invariante 7.538): quel tetto vale DIECI MINUTI. Qui si misura, per
   ogni gol di partita vera: quanti minuti passano fra l'annuncio e la rete, dove sta la palla quando la
   rete si scrive, e quante righe di cronaca stanno in mezzo. Se fra l'annuncio e il gol passano minuti e
   la palla non è in area, il gol non «si vede arrivare»: compare. */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep, matchPhase } from './lib/harness.mjs';
const PARTITE = +(process.env.CPM_PARTITE || 4);
const srv = await startServer(); const port = srv.address().port;
const b = await launchBrowser();
const tutte = [];
for (let i = 0; i < PARTITE; i++) {
  const page = await b.newPage({ viewport: { width: 412, height: 915 } });
  await installCdnRoutes(page);
  await page.addInitScript((r) => { window.__CPM_GLB = false; if (r) window.__CPM_NO559 = 1; }, !!process.env.CPM_ROSSO);
  await openMatch(page, port, { skipLoadAll: true, name: 'Gol' + i });
  await page.evaluate(s => window.__CPM_AUTOPLAY(true, { seed: s, policy: 'seeded', tickMs: 300 }), 7100 + i * 13);
  const t0 = Date.now();
  while (Date.now() - t0 < 600000) { await sleep(1200); const ph = await matchPhase(page); if (ph === 'ended' || ph === 'ceremony') break; }
  tutte.push(await page.evaluate(() => (window.__CPM_EV && window.__CPM_EV()) || []));
  await page.close();
}
srv.close(); await b.close();

let nGol = 0, ritardi = [], lontani = 0, senzaAnnuncio = 0, righeInMezzo = [];
for (const EV of tutte) {
  const ch = EV.filter(e => e.ev === 'chronicle');
  const gol = ch.filter(e => /goal$/.test(String(e.ef || '')));
  for (const g of gol) {
    nGol++;
    /* l'annuncio dell'azione pendente non passa da cpmEv: si riconosce dal fatto che nei minuti
       precedenti la fase è «pericolo» o il turno è già di chi segnerà. Si misura quindi la distanza
       dall'ultima riga che dichiarava pericolo. */
    const prima = ch.filter(e => e.min < g.min);
    const ultPericolo = [...prima].reverse().find(e => e.fase === 'pericolo');
    if (!ultPericolo) { senzaAnnuncio++; }
    else {
      ritardi.push(g.min - ultPericolo.min);
      righeInMezzo.push(prima.filter(e => e.min > ultPericolo.min).length);
    }
    const adv = (g.ef === 'team_goal') ? (g.bx == null ? null : g.bx) : (g.bx == null ? null : 100 - g.bx);
    if (adv != null && adv < 72) lontani++;
  }
}
/* IL DUMP: le righe che la cronaca ha davvero detto nei minuti che portano alla rete. Le percentuali
   dicono CHE c'e' un buco, solo il testo dice COM'E' fatto. */
for (const EV of tutte) {
  const ch = EV.filter(e => e.ev === 'chronicle');
  const gol = ch.filter(e => /goal$/.test(String(e.ef || '')));
  for (const g of gol) {
    const fin = ch.filter(e => e.min <= g.min && e.min >= g.min - 8);
    console.log(`\n  --- rete al ${g.min}' (${g.ef}) — le righe dal ${Math.max(0, g.min - 8)}' ---`);
    for (const e of fin) console.log(`   ${String(e.min).padStart(3)}'  fase=${String(e.fase || '-').padEnd(12)} dec=${String(e.dec || '-').padEnd(14)} palla x=${e.bx == null ? '?' : e.bx} ${e.ef ? '· ef=' + e.ef : ''}`);
  }
}
const med = a => a.length ? a.slice().sort((x, y) => x - y)[Math.floor(a.length / 2)] : null;
console.log(`gol censiti: ${nGol} su ${tutte.length} partite`);
console.log(`  gol scritti con la palla FUORI dall'ultimo terzo (adv<72): ${lontani}/${nGol} (${nGol ? (lontani / nGol * 100).toFixed(0) : 0}%)`);
console.log(`  gol senza NESSUNA riga di «pericolo» prima: ${senzaAnnuncio}/${nGol}`);
console.log(`  minuti fra l'ultima riga di pericolo e la rete: mediana ${med(ritardi)} · max ${ritardi.length ? Math.max(...ritardi) : '-'}`);
console.log(`  righe di cronaca fra pericolo e rete: mediana ${med(righeInMezzo)} · max ${righeInMezzo.length ? Math.max(...righeInMezzo) : '-'}`);
/* LA SOGLIA DICHIARATA PRIMA DI SCRIVERE IL CODICE (7.541): un gol deve arrivare in fondo alla SUA
   azione, cioe' con almeno tre righe di cronaca nei quattro minuti che lo precedono. Misura d'apertura:
   2 su 8. E il pallone non deve poter attraversare mezzo campo fra due righe consecutive senza che
   nessuno lo dica: il salto MEDIANO fra righe consecutive e' l'altra faccia dello stesso difetto. */
let raccontati = 0, salti = [];
for (const EV of tutte) {
  const ch = EV.filter(e => e.ev === 'chronicle');
  for (let k = 1; k < ch.length; k++) if (ch[k].bx != null && ch[k - 1].bx != null) salti.push(Math.abs(ch[k].bx - ch[k - 1].bx));
  for (const g of ch.filter(e => /goal$/.test(String(e.ef || '')))) {
    if (ch.filter(e => e.min < g.min && e.min >= g.min - 4).length >= 3) raccontati++;
  }
}
console.log(`\n  GOL RACCONTATI (>=3 righe nei 4' precedenti): ${raccontati}/${nGol}   soglia >=6/8`);
console.log(`  salto della palla fra due righe consecutive: mediana ${med(salti)}u · max ${salti.length ? Math.max(...salti).toFixed(0) : '-'}u`);
console.log(`  righe di cronaca per partita: ${tutte.map(EV => EV.filter(e => e.ev === 'chronicle').length).join(', ')}`);
