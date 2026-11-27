#!/usr/bin/env node
/* [giro 424, PO-653 «quando l'eroe fa un passaggio ad un compagno, in particolare tentativi di assist, quest'ultimo non e' gia' nella
   scena!» — rosso __CPM_NO_G424] GUARDIANO «IL COMPAGNO CHE RICEVE E' GIA' IN SCENA PRIMA DELLA SCELTA».

   Causa misurata (docs/sviluppo/RAPPORTO-giro424.md, misura-424): senza il cast del motore il ricevente del passaggio si sceglieva solo
   al lancio, fra chi stava davanti entro 34 u: a fine lettura era fuori dal quadro in 8 passaggi/assist su 27 (a 20-30 u dall'eroe).

   Browser, GLB ACCESO, teatro acceso (__CPM_PRESENT + __CPM_CINE), una pagina nuova ogni 4 scene, testimone __CPM_F364 (tutto dalle
   mesh, camera DISEGNATA). Dieci azioni di passaggio/assist del catalogo (sette col ricevente fuori dal quadro prima della correzione,
   tre gia' buone), scelta dopo 2,5 s di lettura, esito riuscito.
   VERDE, ogni scena: c'e' un ricevente che e' un compagno; nell'ultimo fotogramma della lettura e' nel quadro; e' nel quadro per almeno
          il 60% dei fotogrammi di lettura; sta entro 22 u dall'eroe.
   ROSSO (__CPM_NO_G424): almeno 3 scene col ricevente fuori dal quadro a fine lettura.
   Una scena senza fotogrammi di lettura o senza ricevente = NON GIUDICATA = rosso nel verde; nel rosso conta come non dimostrata.
   Almeno 8 scene giudicate per braccio. Uso: npm run ricevente-424 · CPM_SOLO=verde|rosso */
import { startServer, launchBrowser } from './lib/harness.mjs';
import { apri, gioca } from './misura-364.mjs';
import { metriche424 } from './misura-424.mjs';

export const SCENE = [[37, 2], [40, 2], [49, 1], [61, 2], [62, 2], [69, 1], [76, 1], [3, 2], [21, 2], [28, 0]];

async function braccio(b, port, rosso) {
  const R = []; let pg = null;
  for (let n = 0; n < SCENE.length; n++) { const [gi, k] = SCENE[n];
    if (n % 4 === 0) { if (pg) await pg.close().catch(() => {}); pg = await apri(b, port, rosso ? ['__CPM_NO_G424'] : []); }
    let run; try { run = await gioca(pg, { gi }, k, 'success', { letturaMs: 2500 }); } catch (e) { run = { err: String(e.message || e).slice(0, 120) }; }
    const m = run.err ? { cieco: run.err } : metriche424(run); R.push({ gi, k, m });
    const q = m.ric; console.log(`  [${rosso ? 'rosso' : 'verde'}] gi${gi}/${k} ${m.cieco ? 'NON GIUDICATA: ' + m.cieco : m.senzaRicevente ? 'NON GIUDICATA: senza ricevente' : m.ricEroe ? 'NON GIUDICATA: ricevente = eroe' : `ric#${m.id} (${q.xA},${q.zA}) quadro ${q.qA} quota ${m.quotaQuadro} dEroe ${m.dEroe} corsa ${m.corsa}`}`);
  }
  if (pg) await pg.close().catch(() => {});
  return R;
}

async function main() {
  const solo = process.env.CPM_SOLO || ''; let esito = 0;
  const server = await startServer(); const port = server.address().port; const b = await launchBrowser();
  for (const nome of ['verde', 'rosso']) { if (solo && solo !== nome) continue; const rosso = nome === 'rosso';
    const R = await braccio(b, port, rosso); const G = R.filter(r => r.m.ric);
    if (!rosso) { const mot = [];
      for (const r of R) { const m = r.m, t = `gi${r.gi}/${r.k}`;
        if (!m.ric) { mot.push(`${t} NON GIUDICATA`); continue; }
        if (!m.ric.qA) mot.push(`${t} ricevente fuori dal quadro a fine lettura`);
        if (m.quotaQuadro < 0.6) mot.push(`${t} ricevente nel quadro solo per ${m.quotaQuadro} della lettura`);
        if (m.dEroe > 22) mot.push(`${t} ricevente a ${m.dEroe} u dall'eroe`); }
      if (G.length < 8) mot.push(`solo ${G.length} scene giudicate (minimo 8)`);
      if (mot.length) { esito = 1; console.log(`\n❌ ricevente-424 [verde] ROSSO: ${mot.join(' · ')}`); } else console.log(`\n✅ ricevente-424 [verde]: in ${G.length} scene su ${R.length} il compagno che riceve e' gia' nel quadro durante la lettura`);
    } else { const fuori = G.filter(r => !r.m.ric.qA).length;
      if (G.length < 8 || fuori < 3) { esito = 1; console.log(`\n❌ ricevente-424 [rosso __CPM_NO_G424] NON dimostra il difetto: ${fuori} scene fuori quadro su ${G.length} giudicate (servono >=3 su >=8)`); }
      else console.log(`\n✅ ricevente-424 [rosso __CPM_NO_G424]: difetto visto, ricevente fuori dal quadro a fine lettura in ${fuori} scene su ${G.length}`); }
  }
  await b.close(); server.close();
  console.log(esito ? '\nRICEVENTE-424: ROSSO' : '\nRICEVENTE-424: VERDE'); process.exit(esito);
}
main().catch(e => { console.error(e); console.log('\nRICEVENTE-424: ROSSO (errore)'); process.exit(1); });
