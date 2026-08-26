/* [7.594.0 STRUMENTO] LA PALLA E' AI PIEDI DI QUALCUNO, E CAMBIA PIEDI?
   COLLAUDO PO: «non ci sono trame di gioco, passaggi, pressing». Il pressing l'ho misurato e corretto
   (7.593). Restano le TRAME, e la nota che avevo lasciato io nel 7.539.1 dice gia' dove guardare: «questo
   numero non si sposta ne' cambiando CHI riceve ne' DOVE stanno gli altri; si sposta solo rendendo il
   possesso una SEQUENZA DI PASSAGGI DISCRETI — la palla lascia i piedi di un uomo NOMINATO e arriva ai
   piedi di un altro uomo NOMINATO — invece di un bersaglio che scivola».
   Quella nota nasceva da misure sul MODELLO. Qui si misura sulla RESA, cioe' su cio' che l'utente guarda:
   per quanto tempo il pallone e' davvero ai piedi di qualcuno, quante volte cambia piedi, e quanti uomini
   diversi lo toccano. Non giudica: misura. */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
const srv = await startServer(); const port = srv.address().port;
const b = await launchBrowser();
const page = await b.newPage({ viewport: { width: 412, height: 915 } });
await installCdnRoutes(page);
await page.addInitScript(() => {
  window.__CPM_GLB = false; window.__CPM_TR = { n: 0, ai: 0, cambi: 0, uomini: {}, dist: [], volo: 0, voloMax: 0, _cur: null, _volo: 0 };
  setInterval(() => { try {
    const st = window.__CPM_STATE && window.__CPM_STATE(); if (!st || !st.players || !st.ball) return;
    const T = window.__CPM_TR; if (T.n > 2000) return;
    const bx = st.ball.x, by = st.ball.y;
    const tutti = st.players.map((p, i) => [p, 'p' + i]).concat(st.hero ? [[st.hero, 'hero']] : []);
    let vic = null, vd = 1e9;
    for (const [p, id] of tutti) { if (!p || p.x == null) continue; const d = Math.hypot(p.x - bx, p.y - by); if (d < vd) { vd = d; vic = id; } }
    T.n++; T.dist.push(+vd.toFixed(1));
    /* «ai piedi» = entro due metri: e' la distanza a cui un giocatore controlla il pallone. */
    if (vd <= 2) { T.ai++;
      if (T._cur && T._cur !== vic) { T.cambi++; }
      if (T._cur !== vic) { T._cur = vic; T.uomini[vic] = (T.uomini[vic] || 0) + 1; }
      if (T._volo > T.voloMax) T.voloMax = T._volo;
      T._volo = 0;
    } else { T._volo++; T.volo++;
      /* [7.594.0] DOVE e QUANDO il pallone resta di nessuno. Dieci secondi senza portatore non si
         spiegano con un cross in volo, e prima di ipotizzare conviene guardare: partita ferma? scena
         di highlight? ripresa dopo un gol? pallone alto? fuori dal campo? */
      const h = window.__CPM_HOLD && window.__CPM_HOLD();
      const rb = window.__CPM_RIPBREVE && window.__CPM_RIPBREVE();
      const k = (h && h.fermo) ? 'partita ferma' : (h && (h.out || h.sp)) ? 'palla ferma (rimessa/piazzato)'
        : (rb && rb.breve) ? 'ripresa dopo il gol' : (h && (h.ko || h.kick)) ? 'contatori di ripresa aperti'
        : (st.ball.worldY != null && st.ball.worldY > 2.5) ? 'pallone ALTO (volo)'
        : (bx < 2 || bx > 98 || by < 2 || by > 98) ? 'pallone sulla riga' : 'GIOCO VIVO, pallone basso';
      T.dove = T.dove || {}; T.dove[k] = (T.dove[k] || 0) + 1;
      if (T._volo === 15) { T.lunghe = T.lunghe || {}; T.lunghe[k] = (T.lunghe[k] || 0) + 1; }
    }
  } catch (_e) {} }, 200);
});
await openMatch(page, port, { skipLoadAll: true, name: 'Tr' });
await page.evaluate(() => window.__CPM_AUTOPLAY(true, { seed: 7300, policy: 'seeded', tickMs: 300 }));
await sleep(90000);
const T = await page.evaluate(() => window.__CPM_TR || null);
await b.close(); srv.close();

console.log('\n=== LA PALLA E\' AI PIEDI DI QUALCUNO, E CAMBIA PIEDI? ===\n');
if (!T || !T.n) { console.log('  ⚠ nessun campione: NON GIUDICABILE.\n'); process.exit(1); }
const sec = T.n * 0.2;
const d = T.dist.slice().sort((a, b2) => a - b2);
console.log(`  campioni ${T.n} (${sec.toFixed(0)} s di gioco osservato)`);
console.log(`  distanza del piu' vicino AL PALLONE · mediana ${d[Math.floor(d.length / 2)].toFixed(1)} m · quarto basso ${d[Math.floor(d.length * .25)].toFixed(1)} · quarto alto ${d[Math.floor(d.length * .75)].toFixed(1)}`);
console.log(`\n  il pallone e' AI PIEDI di qualcuno (entro 2 m) nel ${(T.ai / T.n * 100).toFixed(0)}% del tempo`);
console.log(`  ... quindi e' DI NESSUNO nel ${(T.volo / T.n * 100).toFixed(0)}% del tempo`);
console.log(`  la piu' lunga assenza di portatore dura ${(T.voloMax * 0.2).toFixed(1)} s`);
const um = Object.keys(T.uomini).length;
console.log(`\n  cambi di piede: ${T.cambi}  (${(T.cambi / (sec / 60)).toFixed(1)} al minuto)`);
console.log(`  uomini diversi che toccano il pallone: ${um} su 22`);
if (T.dove) { console.log('\n  quando il pallone e\' DI NESSUNO, il gioco sta cosi\':');
  const tot = Object.values(T.dove).reduce((a, v) => a + v, 0);
  for (const [k, v] of Object.entries(T.dove).sort((a, b2) => b2[1] - a[1]))
    console.log(`    ${(v / tot * 100).toFixed(0).padStart(3)}%  ${k}`);
}
if (T.lunghe) { console.log('\n  le assenze LUNGHE (oltre 3 s) cominciano qui:');
  for (const [k, v] of Object.entries(T.lunghe).sort((a, b2) => b2[1] - a[1])) console.log(`    ${String(v).padStart(3)} volte  ${k}`);
} else console.log('\n  nessuna assenza oltre 3 s in questa run');
console.log('\n  ⚠ DUE RUN IDENTICHE HANNO DATO «12 su 22» E «16 su 22» uomini diversi: questo conteggio BALLA');
console.log('    di quattro giocatori fra una partita e l\'altra, quindi da solo non decide niente. E\' la');
console.log('    stessa classe di errore del conteggio a soglia che oggi mi ha gia\' fatto leggere un');
console.log('    miglioramento dove non c\'era: serve la media di piu\' partite, o un numero continuo.');
console.log('\n  (in una partita vera il pallone e\' controllato per la gran parte del tempo, i tocchi cambiano');
console.log('   piede diverse volte al minuto e nell\'arco della gara lo toccano quasi tutti.)');
console.log('\nCENSIMENTO registrato. Non e\' un guardiano: non fallisce, misura.\n');
